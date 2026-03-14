import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
import { createClient } from "@supabase/supabase-js";

config({ path: path.resolve(__dirname, "..", ".env") });

// ─── Config ──────────────────────────────────────────────────────────────────

const GEMINI_API_KEY   = process.env.GEMINI_API_KEY!;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const SUPABASE_URL     = process.env.SUPABASE_URL!;
const SUPABASE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PROJECT_ID       = process.env.PROJECT_ID!;

if (!GEMINI_API_KEY)   throw new Error("GEMINI_API_KEY not set");
if (!PINECONE_API_KEY) throw new Error("PINECONE_API_KEY not set");
if (!SUPABASE_URL)     throw new Error("SUPABASE_URL not set");
if (!PROJECT_ID)       throw new Error("PROJECT_ID not set");

// Pull these from config.json so they stay in sync across scripts and functions
const appConfig        = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "config.json"), "utf8"));
const EMBEDDING_MODEL  = appConfig.rag?.embeddingModel  ?? "models/gemini-embedding-2-preview";
const EMBEDDING_DIMS   = appConfig.rag?.embeddingDimensions ?? 3072;
const INDEX_NAME       = appConfig.rag?.pinecone?.indexName ?? "rag-factory";
const STORAGE_BUCKET   = "deal-media";
const MAX_CHUNK_CHARS  = appConfig.rag?.chunkMaxChars   ?? 1600;
const CHILD_CHUNK_CHARS = appConfig.rag?.childChunkChars ?? 400;

// Directories to scan (relative to project root)
const SCAN_DIRS = [
  "knowledge",
];

// File extensions to process
const SUPPORTED_EXTENSIONS = new Set([
  ".md", ".txt",           // text
  ".pdf",                  // pdf (text + multimodal attempt)
  ".jpg", ".jpeg", ".png", ".gif", ".webp", // images
]);

// Skip these dirs/files
const SKIP_PATTERNS = [
  "node_modules", ".git", ".next", ".netlify", "dist", "out",
  ".gitkeep", "README.md",
];

// ─── Clients ─────────────────────────────────────────────────────────────────

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTrack(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const match = normalized.match(/knowledge\/([^/]+)\//);
  return match ? match[1] : "general";
}

function makeParentId(filePath: string, chunkIndex: number): string {
  const rel = filePath.replace(/\\/g, "/");
  return `${PROJECT_ID}::${rel}::p::${chunkIndex}`;
}

function makeChildId(filePath: string, chunkIndex: number, childIndex: number): string {
  const rel = filePath.replace(/\\/g, "/");
  return `${PROJECT_ID}::${rel}::c::${chunkIndex}::${childIndex}`;
}

/** Turn a filename into a human-readable title: "company-overview.md" → "Company Overview" */
function deriveSourceTitle(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")         // strip extension
    .replace(/[-_]/g, " ")           // dashes/underscores → spaces
    .replace(/\b\w/g, c => c.toUpperCase()); // title case
}

/** Split a parent text into child-sized pieces, preferring sentence boundaries */
function splitIntoChildren(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const children: string[] = [];
  // Split on sentence-ending punctuation + whitespace
  const sentences = text.split(/(?<=[.!?])\s+/);
  let current = "";
  for (const sentence of sentences) {
    if (current.length + sentence.length > maxChars && current) {
      children.push(current.trim());
      current = "";
    }
    current += (current ? " " : "") + sentence;
  }
  if (current.trim()) children.push(current.trim());
  return children.filter(c => c.length > 20);
}

// ─── Parent-Child Chunk Result ────────────────────────────────────────────────

interface ChunkResult {
  /** Full section text (~1600 chars) — injected verbatim into the LLM context */
  parentText: string;
  /** Sub-chunks (~400 chars each) — embedded for precision retrieval */
  children: string[];
  /** ## heading for this section (empty string if none) */
  sectionHeading: string;
  /** Page number from PDF page markers (null for plain text files) */
  pageNumber: number | null;
  /** Sequential index across all chunks in this document */
  chunkIndex: number;
}

/**
 * Chunk text into parent-child pairs with full citation provenance.
 *
 * Algorithm:
 *  1. Scan line-by-line, tracking current page from "--- PAGE N ---" markers (PDFs only).
 *  2. At each "## heading", flush the accumulated section as a new parent chunk.
 *  3. If a section exceeds MAX_CHUNK_CHARS, split further on "### " sub-headings.
 *  4. Split each parent into CHILD_CHUNK_CHARS children for precision embedding.
 */
function chunkText(text: string, sourceFile: string): ChunkResult[] {
  const results: ChunkResult[] = [];
  let globalChunkIndex = 0;
  let currentPage: number | null = null;
  let currentLines: string[] = [];
  let currentHeading = "";
  let sectionPage: number | null = null;

  const flushSection = () => {
    const rawText = currentLines.join("\n").trim();
    if (!rawText || rawText.length < 50) {
      currentLines = [];
      currentHeading = "";
      return;
    }

    // Split oversized sections on ### sub-headings
    const parentChunks: string[] = [];
    if (rawText.length <= MAX_CHUNK_CHARS) {
      parentChunks.push(rawText);
    } else {
      const subs = rawText.split(/(?=^### )/m);
      let current = "";
      for (const sub of subs) {
        if (current.length + sub.length > MAX_CHUNK_CHARS && current) {
          parentChunks.push(current.trim());
          current = "";
        }
        current += (current ? "\n\n" : "") + sub;
      }
      if (current.trim()) parentChunks.push(current.trim());
    }

    for (const parentText of parentChunks) {
      const children = splitIntoChildren(parentText, CHILD_CHUNK_CHARS);
      results.push({
        parentText: `[Source: ${sourceFile}]\n\n${parentText}`,
        children,
        sectionHeading: currentHeading,
        pageNumber: sectionPage,
        chunkIndex: globalChunkIndex++,
      });
    }

    currentLines = [];
    currentHeading = "";
  };

  for (const line of text.split("\n")) {
    // Page marker (Gemini PDF extraction inserts "--- PAGE N ---")
    const pageMatch = line.match(/^---\s*PAGE\s+(\d+)\s*---$/);
    if (pageMatch) {
      currentPage = parseInt(pageMatch[1], 10);
      continue; // do not include marker in text
    }

    // New ## section heading — flush previous section
    if (line.match(/^## /)) {
      flushSection();
      currentHeading = line.replace(/^## /, "").trim();
      sectionPage = currentPage;
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  // Flush the last accumulated section
  flushSection();

  return results.filter(r => r.parentText.trim().length > 50);
}

// ─── Gemini Embedding API ─────────────────────────────────────────────────────

async function embedText(texts: string[]): Promise<number[][]> {
  const BATCH_SIZE = 20;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const requests = batch.map(text => ({
      model: EMBEDDING_MODEL,
      content: { parts: [{ text }] },
    }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:batchEmbedContents?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requests }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini batch embed error ${res.status}: ${err}`);
    }

    const data = await res.json();
    if (!data.embeddings) {
      console.log("  Batch not supported, falling back to single calls...");
      for (const text of batch) {
        const emb = await embedSingle({ text });
        allEmbeddings.push(emb);
        await delay(150);
      }
    } else {
      allEmbeddings.push(...data.embeddings.map((e: any) => e.values));
    }

    if (i + BATCH_SIZE < texts.length) await delay(200);
  }

  return allEmbeddings;
}

async function embedSingle(part: { text?: string; imageBase64?: string; mimeType?: string }): Promise<number[]> {
  const contentPart = part.text
    ? { text: part.text }
    : { inlineData: { mimeType: part.mimeType || "image/jpeg", data: part.imageBase64 } };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { parts: [contentPart] } }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini embed error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.embedding.values;
}

// ─── Supabase Storage Upload ──────────────────────────────────────────────────

async function uploadToStorage(localPath: string, storagePath: string, mimeType: string): Promise<string> {
  const fileBuffer = fs.readFileSync(localPath);
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp",
    ".mp4": "video/mp4", ".mov": "video/quicktime",
    ".pdf": "application/pdf",
  };
  return map[ext] || "application/octet-stream";
}

// ─── Pinecone Upsert ──────────────────────────────────────────────────────────

async function upsertVectors(vectors: Array<{
  id: string;
  values: number[];
  metadata: Record<string, any>;
}>): Promise<void> {
  const index = pinecone.index(INDEX_NAME).namespace(PROJECT_ID);
  for (let i = 0; i < vectors.length; i += 100) {
    await index.upsert({ records: vectors.slice(i, i + 100) } as any);
  }
}

// ─── File Processors ──────────────────────────────────────────────────────────

/**
 * Process a text/markdown file with parent-child chunking.
 * Each parent chunk gets one vector (for context injection).
 * Each child chunk gets one vector (for precision retrieval) with parent_content in metadata.
 */
async function processTextFile(filePath: string): Promise<number> {
  const content = fs.readFileSync(filePath, "utf-8");
  const sourceFile = path.basename(filePath);
  const sourceTitle = deriveSourceTitle(sourceFile);
  const track = getTrack(filePath);
  const chunks = chunkText(content, sourceFile);

  if (chunks.length === 0) {
    console.log(`  ⚠ No chunks extracted from ${sourceFile}`);
    return 0;
  }

  console.log(`  ${chunks.length} parent chunks → ${chunks.reduce((s, c) => s + c.children.length, 0)} child vectors`);

  const allVectors: Array<{ id: string; values: number[]; metadata: Record<string, any> }> = [];

  // Build all texts to embed in one batch pass (children only — children are what we retrieve)
  // Parents are stored as metadata on the children; we do NOT embed parents separately.
  const childTexts: string[] = [];
  const childMeta: Array<{ chunkIndex: number; childIndex: number; parentText: string; sectionHeading: string; pageNumber: number | null }> = [];

  for (const chunk of chunks) {
    for (let ci = 0; ci < chunk.children.length; ci++) {
      childTexts.push(chunk.children[ci]);
      childMeta.push({
        chunkIndex: chunk.chunkIndex,
        childIndex: ci,
        parentText: chunk.parentText,
        sectionHeading: chunk.sectionHeading,
        pageNumber: chunk.pageNumber,
      });
    }
  }

  const embeddings = await embedText(childTexts);

  for (let i = 0; i < childTexts.length; i++) {
    const meta = childMeta[i];
    const parentId = makeParentId(filePath, meta.chunkIndex);
    const childId = makeChildId(filePath, meta.chunkIndex, meta.childIndex);
    allVectors.push({
      id: childId,
      values: embeddings[i],
      metadata: {
        modality: "text",
        content: childTexts[i].slice(0, 400),           // child text for display
        parent_content: meta.parentText.slice(0, 2000), // full parent for context injection
        parent_id: parentId,
        source_file: sourceFile,
        source_title: sourceTitle,
        section_heading: meta.sectionHeading,
        page_number: meta.pageNumber,
        chunk_index: meta.chunkIndex,
        child_index: meta.childIndex,
        project_id: PROJECT_ID,
        track,
        is_parent: false,
      },
    });
  }

  await upsertVectors(allVectors);
  return allVectors.length;
}

// ─── Gemini Files API — PDF text extraction ──────────────────────────────────

async function uploadPdfToGemini(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const mimeType = "application/pdf";

  const initRes = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=resumable&key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": buffer.length.toString(),
        "X-Goog-Upload-Header-Content-Type": mimeType,
      },
      body: JSON.stringify({ file: { display_name: path.basename(filePath) } }),
    }
  );

  const uploadUrl = initRes.headers.get("x-goog-upload-url");
  if (!uploadUrl) throw new Error("No upload URL returned from Gemini Files API");

  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": buffer.length.toString(),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: buffer,
  });

  const fileData = await uploadRes.json();
  if (!fileData.file?.uri) throw new Error(`Upload failed: ${JSON.stringify(fileData).slice(0, 200)}`);
  return fileData.file.uri;
}

async function extractPdfTextViaGemini(fileUri: string, sourceFile: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              fileData: { mimeType: "application/pdf", fileUri }
            },
            {
              text: `Extract ALL content from this document into clean, structured text.

CRITICAL: Insert a page marker at the start of each page's content in EXACTLY this format:
--- PAGE N ---
(where N is the page number, starting from 1)

Include: all text, table data (formatted as markdown tables), descriptions of charts/diagrams,
captions, headers, and any other meaningful content.
Preserve the logical structure with markdown headings (## for major sections, ### for sub-sections).
Document: ${sourceFile}`
            }
          ]
        }],
        generationConfig: { maxOutputTokens: 8192 }
      }),
    }
  );

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`Gemini extraction failed: ${JSON.stringify(data).slice(0, 200)}`);
  return text;
}

async function processPdfFile(filePath: string): Promise<number> {
  const sourceFile = path.basename(filePath);
  const sourceTitle = deriveSourceTitle(sourceFile);
  const track = getTrack(filePath);
  let total = 0;

  console.log(`  Uploading PDF to Gemini Files API...`);
  try {
    const fileUri = await uploadPdfToGemini(filePath);
    console.log(`  Extracting text via Gemini multimodal (with page markers)...`);
    await delay(2000);
    const pdfText = await extractPdfTextViaGemini(fileUri, sourceFile);
    console.log(`  Extracted ${pdfText.length} chars`);

    const chunks = chunkText(pdfText, sourceFile);
    if (chunks.length === 0) throw new Error("No chunks extracted — check PDF content");

    console.log(`  ${chunks.length} parent chunks → ${chunks.reduce((s, c) => s + c.children.length, 0)} child vectors`);

    const allVectors: Array<{ id: string; values: number[]; metadata: Record<string, any> }> = [];
    const childTexts: string[] = [];
    const childMeta: Array<{ chunkIndex: number; childIndex: number; parentText: string; sectionHeading: string; pageNumber: number | null }> = [];

    for (const chunk of chunks) {
      for (let ci = 0; ci < chunk.children.length; ci++) {
        childTexts.push(chunk.children[ci]);
        childMeta.push({
          chunkIndex: chunk.chunkIndex,
          childIndex: ci,
          parentText: chunk.parentText,
          sectionHeading: chunk.sectionHeading,
          pageNumber: chunk.pageNumber,
        });
      }
    }

    const embeddings = await embedText(childTexts);

    for (let i = 0; i < childTexts.length; i++) {
      const meta = childMeta[i];
      const parentId = makeParentId(filePath + ":text", meta.chunkIndex);
      const childId = makeChildId(filePath + ":text", meta.chunkIndex, meta.childIndex);
      allVectors.push({
        id: childId,
        values: embeddings[i],
        metadata: {
          modality: "text",
          content: childTexts[i].slice(0, 400),
          parent_content: meta.parentText.slice(0, 2000),
          parent_id: parentId,
          source_file: sourceFile,
          source_title: sourceTitle,
          section_heading: meta.sectionHeading,
          page_number: meta.pageNumber,
          chunk_index: meta.chunkIndex,
          child_index: meta.childIndex,
          project_id: PROJECT_ID,
          track,
          is_parent: false,
          source_type: "pdf-gemini",
        },
      });
    }

    await upsertVectors(allVectors);
    total += allVectors.length;
    console.log(`  ✓ ${allVectors.length} child vectors embedded`);
  } catch (e: any) {
    console.error(`  ✗ PDF extraction failed: ${e.message}`);
  }

  // Upload PDF to Supabase Storage for reference/download
  try {
    const storagePath = `${PROJECT_ID}/documents/${sourceFile}`;
    const storageUrl = await uploadToStorage(filePath, storagePath, "application/pdf");
    console.log(`  ✓ PDF stored: ${storageUrl}`);
  } catch (e: any) {
    console.log(`  ⚠ Storage upload skipped: ${e.message.slice(0, 80)}`);
  }

  return total;
}

async function processImageFile(filePath: string): Promise<number> {
  const sourceFile = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = getMimeType(ext);
  const track = getTrack(filePath);

  const storagePath = `${PROJECT_ID}/images/${sourceFile}`;
  const storageUrl = await uploadToStorage(filePath, storagePath, mimeType);
  console.log(`  Uploaded to storage: ${storageUrl}`);

  const base64 = fs.readFileSync(filePath).toString("base64");
  const embedding = await embedSingle({ imageBase64: base64, mimeType });

  const vector = {
    id: makeChildId(filePath, 0, 0),
    values: embedding,
    metadata: {
      modality: "image",
      content: `[Image: ${sourceFile}]`,
      source_file: sourceFile,
      source_title: deriveSourceTitle(sourceFile),
      storage_url: storageUrl,
      project_id: PROJECT_ID,
      track,
    },
  };

  await upsertVectors([vector]);
  return 1;
}

// ─── Directory Scanner ────────────────────────────────────────────────────────

function scanDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];

  for (const entry of fs.readdirSync(dir)) {
    if (SKIP_PATTERNS.some(p => entry.includes(p))) continue;
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      files.push(...scanDir(full));
    } else {
      const ext = path.extname(entry).toLowerCase();
      if (SUPPORTED_EXTENSIONS.has(ext)) files.push(full);
    }
  }

  return files;
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  RAG Factory Multimodal Embed — Parent-Child Architecture");
  console.log("═══════════════════════════════════════════════");
  console.log(`Model:    ${EMBEDDING_MODEL} (${EMBEDDING_DIMS} dims)`);
  console.log(`Index:    ${INDEX_NAME} / namespace: ${PROJECT_ID}`);
  console.log(`Chunks:   parent=${MAX_CHUNK_CHARS}c / child=${CHILD_CHUNK_CHARS}c`);
  console.log(`Deal ID:  ${PROJECT_ID}\n`);

  const projectRoot = path.resolve(__dirname, "..");
  const allFiles: string[] = [];

  for (const dir of SCAN_DIRS) {
    const files = scanDir(path.join(projectRoot, dir));
    console.log(`${dir}: ${files.length} files`);
    allFiles.push(...files);
  }

  console.log(`\nTotal files to process: ${allFiles.length}\n`);

  if (allFiles.length === 0) {
    console.log("No files found. Add documents to knowledge/");
    return;
  }

  let totalVectors = 0;
  let errors = 0;

  for (const filePath of allFiles) {
    const ext = path.extname(filePath).toLowerCase();
    const rel = path.relative(projectRoot, filePath);
    console.log(`\n→ ${rel}`);

    try {
      let count = 0;
      if (ext === ".md" || ext === ".txt") {
        count = await processTextFile(filePath);
      } else if (ext === ".pdf") {
        count = await processPdfFile(filePath);
      } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
        count = await processImageFile(filePath);
      }
      console.log(`  ✓ ${count} vector(s) upserted`);
      totalVectors += count;
      await delay(300);
    } catch (e: any) {
      console.error(`  ✗ ERROR: ${e.message}`);
      errors++;
    }
  }

  // Verify in Pinecone
  console.log("\n═══════════════════════════════════════════════");
  try {
    const stats = await pinecone.index(INDEX_NAME).describeIndexStats();
    const ns = stats.namespaces?.[PROJECT_ID];
    console.log(`Pinecone namespace '${PROJECT_ID}': ${ns?.recordCount ?? 0} vectors`);
  } catch (e: any) {
    console.log("Could not fetch Pinecone stats:", e.message);
  }

  console.log(`\nFiles processed: ${allFiles.length}`);
  console.log(`Vectors upserted: ${totalVectors}`);
  console.log(`Errors: ${errors}`);
  console.log("═══════════════════════════════════════════════");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
