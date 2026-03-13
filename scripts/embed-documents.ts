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
const INDEX_NAME       = appConfig.rag?.pinecone?.indexName ?? "kop-intelligence";
const STORAGE_BUCKET   = "deal-media";
const MAX_CHUNK_CHARS  = appConfig.rag?.chunkMaxChars   ?? 3200;

// Directories to scan (relative to project root)
// Drop any file type into knowledge/ and it gets embedded automatically.
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

// Track assignment — derived from subfolder under knowledge/
// knowledge/documents/ → "documents"
// knowledge/media/     → "media"
// knowledge/text/      → "text"
// Subfolders you create become track names automatically.
const TRACK_MAP: Record<string, string> = {};

// ─── Clients ─────────────────────────────────────────────────────────────────

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTrack(filePath: string): string {
  // Use the immediate subfolder under knowledge/ as the track name.
  // e.g. knowledge/documents/foo.pdf → "documents"
  //      knowledge/media/bar.jpg     → "media"
  //      knowledge/foo.pdf           → "general"
  const normalized = filePath.replace(/\\/g, "/");
  const match = normalized.match(/knowledge\/([^/]+)\//);
  return match ? match[1] : "general";
}

function makeVectorId(filePath: string, index: number): string {
  // Deterministic ID — re-running overwrites (upserts) existing vectors
  const rel = filePath.replace(/\\/g, "/");
  return `${PROJECT_ID}::${rel}::${index}`;
}

function chunkText(text: string, sourceFile: string): string[] {
  const sections = text.split(/(?=^## )/m);
  const chunks: string[] = [];

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    if (trimmed.length <= MAX_CHUNK_CHARS) {
      chunks.push(`[Source: ${sourceFile}]\n\n${trimmed}`);
    } else {
      // Try ### sub-sections first
      const subs = trimmed.split(/(?=^### )/m);
      let current = "";
      for (const sub of subs) {
        if (current.length + sub.length > MAX_CHUNK_CHARS && current) {
          chunks.push(`[Source: ${sourceFile}]\n\n${current.trim()}`);
          current = "";
        }
        current += (current ? "\n\n" : "") + sub;
      }
      if (current.trim()) {
        chunks.push(`[Source: ${sourceFile}]\n\n${current.trim()}`);
      }
    }
  }

  return chunks.filter(c => c.trim().length > 50);
}

// ─── Gemini Embedding API ─────────────────────────────────────────────────────

async function embedText(texts: string[]): Promise<number[][]> {
  // Batch endpoint for text (up to 100 per request)
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
      // fallback to single embedContent if batch not supported
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
  // Pinecone SDK v7: upsert takes { records: [...] }
  for (let i = 0; i < vectors.length; i += 100) {
    await index.upsert({ records: vectors.slice(i, i + 100) } as any);
  }
}

// ─── File Processors ──────────────────────────────────────────────────────────

async function processTextFile(filePath: string): Promise<number> {
  const content = fs.readFileSync(filePath, "utf-8");
  const sourceFile = path.basename(filePath);
  const track = getTrack(filePath);
  const chunks = chunkText(content, sourceFile);

  if (chunks.length === 0) {
    console.log(`  ⚠ No chunks extracted from ${sourceFile}`);
    return 0;
  }

  const embeddings = await embedText(chunks);
  const vectors = chunks.map((chunk, i) => ({
    id: makeVectorId(filePath, i),
    values: embeddings[i],
    metadata: {
      modality: "text",
      content: chunk.slice(0, 1000), // Pinecone metadata limit
      source_file: sourceFile,
      chunk_index: i,
      project_id: PROJECT_ID,
      track,
    },
  }));

  await upsertVectors(vectors);
  return vectors.length;
}

// ─── Gemini Files API — PDF text extraction ──────────────────────────────────
// Uses Gemini's multimodal understanding: reads tables, charts, and diagrams
// in addition to plain text. Far superior to a raw PDF text parser.

async function uploadPdfToGemini(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const mimeType = "application/pdf";

  // Step 1: initiate resumable upload
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

  // Step 2: upload bytes
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
Include: all text, table data (formatted as markdown tables), descriptions of charts/diagrams,
captions, headers, and any other meaningful content.
Preserve the logical structure with headings.
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
  const track = getTrack(filePath);
  let total = 0;

  // Step 1: Upload PDF to Gemini Files API and extract text via multimodal LLM
  console.log(`  Uploading PDF to Gemini Files API...`);
  try {
    const fileUri = await uploadPdfToGemini(filePath);
    console.log(`  Extracting text via Gemini multimodal...`);
    await delay(2000); // allow file processing
    const pdfText = await extractPdfTextViaGemini(fileUri, sourceFile);
    console.log(`  Extracted ${pdfText.length} chars`);

    const chunks = chunkText(pdfText, sourceFile);
    if (chunks.length === 0) throw new Error("No chunks extracted — check PDF content");
    const embeddings = await embedText(chunks);
    const textVectors = chunks.map((chunk, i) => ({
      id: makeVectorId(filePath + ":text", i),
      values: embeddings[i],
      metadata: {
        modality: "text",
        content: chunk.slice(0, 1000),
        source_file: sourceFile,
        chunk_index: i,
        project_id: PROJECT_ID,
        track,
        source_type: "pdf-gemini",
      },
    }));
    await upsertVectors(textVectors);
    total += textVectors.length;
    console.log(`  ✓ ${textVectors.length} chunks embedded`);
  } catch (e: any) {
    console.error(`  ✗ PDF extraction failed: ${e.message}`);
  }

  // Step 2: Upload PDF to Supabase Storage for reference/download
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

  // Upload to Supabase Storage
  const storagePath = `${PROJECT_ID}/images/${sourceFile}`;
  const storageUrl = await uploadToStorage(filePath, storagePath, mimeType);
  console.log(`  Uploaded to storage: ${storageUrl}`);

  // Embed multimodally
  const base64 = fs.readFileSync(filePath).toString("base64");
  const embedding = await embedSingle({ imageBase64: base64, mimeType });

  const vector = {
    id: makeVectorId(filePath, 0),
    values: embedding,
    metadata: {
      modality: "image",
      content: `[Image: ${sourceFile}]`,
      source_file: sourceFile,
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
  console.log("  RAG Factory Multimodal Embed — Pinecone + Gemini 2");
  console.log("═══════════════════════════════════════════════");
  console.log(`Model:   ${EMBEDDING_MODEL} (${EMBEDDING_DIMS} dims)`);
  console.log(`Index:   ${INDEX_NAME} / namespace: ${PROJECT_ID}`);
  console.log(`Deal ID: ${PROJECT_ID}\n`);

  const projectRoot = path.resolve(__dirname, "..");
  const allFiles: string[] = [];

  for (const dir of SCAN_DIRS) {
    const files = scanDir(path.join(projectRoot, dir));
    console.log(`${dir}: ${files.length} files`);
    allFiles.push(...files);
  }

  console.log(`\nTotal files to process: ${allFiles.length}\n`);

  if (allFiles.length === 0) {
    console.log("No files found. Add documents to intelligence/ or production/source-documents/");
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
