import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: path.resolve(__dirname, "..", ".env") });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY_1!;
const DEAL_ID = "57eb32a1-8550-45d1-8906-64652642c465";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Track assignment rules
const TRACK_MAP: Record<string, string> = {
  "target-profile.md": "target",
  "opportunity-narrative.md": "source",
  "credibility-brief.md": "source",
  "regulatory-landscape.md": "regulatory",
  "technical-interpretation.md": "source",
  "06-target-analysis.md": "target",
  "07-target-materials.md": "target",
};

const MAX_CHUNK_CHARS = 3200;
const EMBEDDING_BATCH_SIZE = 20;
const EMBEDDING_MODEL = "models/gemini-embedding-001";
const EMBEDDING_DIMS = 1536;

interface ChunkInfo {
  content: string;
  category: string;
  sourceFile: string;
  track: string;
  documentType: string;
}

function getTrack(filename: string): string {
  return TRACK_MAP[filename] || "source";
}

function getDocumentType(filePath: string): string {
  if (
    filePath.includes("intelligence/processed") ||
    filePath.includes("intelligence\\processed")
  ) {
    return "processed_intelligence";
  }
  return "source_document";
}

function extractCategory(chunkText: string): string {
  const match = chunkText.match(/^##\s+(.+)$/m);
  if (match) {
    return match[1].trim();
  }
  return "general";
}

function splitOnSubheadersOrParagraphs(text: string, header: string): string[] {
  // Try splitting on ### headers first
  const subSections = text.split(/(?=^###\s)/m);
  const results: string[] = [];

  for (const sub of subSections) {
    if (sub.trim().length === 0) continue;
    if (sub.length <= MAX_CHUNK_CHARS) {
      results.push(sub.trim());
    } else {
      // Split on double newlines (paragraphs)
      const paragraphs = sub.split(/\n\n+/);
      let current = "";
      for (const para of paragraphs) {
        if (
          current.length + para.length + 2 > MAX_CHUNK_CHARS &&
          current.length > 0
        ) {
          results.push(current.trim());
          current = header ? `## ${header} (continued)\n\n` : "";
        }
        current += (current.length > 0 ? "\n\n" : "") + para;
      }
      if (current.trim().length > 0) {
        results.push(current.trim());
      }
    }
  }

  return results;
}

function chunkMarkdown(content: string, filePath: string): ChunkInfo[] {
  const track = getTrack(path.basename(filePath));
  const documentType = getDocumentType(filePath);
  const baseName = path.basename(filePath);

  // Split on ## headers
  const sections = content.split(/(?=^## )/m);
  const chunks: ChunkInfo[] = [];

  for (const section of sections) {
    const trimmed = section.trim();
    if (trimmed.length === 0) continue;

    const headerMatch = trimmed.match(/^## (.+)$/m);
    const headerText = headerMatch ? headerMatch[1].trim() : "";

    if (trimmed.length <= MAX_CHUNK_CHARS) {
      const chunkContent = `[Source: ${baseName}]\n\n${trimmed}`;
      chunks.push({
        content: chunkContent,
        category: extractCategory(trimmed),
        sourceFile: baseName,
        track,
        documentType,
      });
    } else {
      const subChunks = splitOnSubheadersOrParagraphs(trimmed, headerText);
      for (const sub of subChunks) {
        const chunkContent = `[Source: ${baseName}]\n\n${sub}`;
        chunks.push({
          content: chunkContent,
          category: extractCategory(sub) || headerText || "general",
          sourceFile: baseName,
          track,
          documentType,
        });
      }
    }
  }

  return chunks;
}

async function getEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  // Use Gemini batch embed endpoint
  const requests = texts.map((text) => ({
    model: EMBEDDING_MODEL,
    content: { parts: [{ text }] },
    outputDimensionality: EMBEDDING_DIMS,
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requests }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini embedding API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.embeddings.map((e: any) => e.values);
}

async function main() {
  console.log("=== TQM Document Embedding Script ===");
  console.log(`Using Gemini embedding model: ${EMBEDDING_MODEL} (${EMBEDDING_DIMS} dims)\n`);

  // Gather all files
  const dirs = [
    "C:/Antigravity/TQM/intelligence/processed",
    "C:/Antigravity/TQM/production/source-documents",
  ];

  const allFiles: string[] = [];
  for (const dir of dirs) {
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md") && f !== ".gitkeep" && f !== "README.md");
    for (const file of files) {
      allFiles.push(path.join(dir, file));
    }
  }

  console.log(`Found ${allFiles.length} documents to process.\n`);

  // Chunk all files
  const allChunks: ChunkInfo[] = [];
  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    const chunks = chunkMarkdown(content, filePath);
    console.log(`Processing ${path.basename(filePath)}: ${chunks.length} chunks`);
    allChunks.push(...chunks);
  }

  console.log(`\nTotal chunks to embed: ${allChunks.length}\n`);

  // Process in batches
  let totalEmbedded = 0;
  const now = new Date().toISOString();

  for (let i = 0; i < allChunks.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = allChunks.slice(i, i + EMBEDDING_BATCH_SIZE);
    const texts = batch.map((c) => c.content);

    // Get embeddings from Gemini
    const embeddings = await getEmbeddingsBatch(texts);

    // Prepare rows for Supabase
    const rows = batch.map((chunk, idx) => ({
      deal_id: DEAL_ID,
      content: chunk.content,
      embedding: JSON.stringify(embeddings[idx]),
      track: chunk.track,
      category: chunk.category,
      document_type: chunk.documentType,
      source_file: chunk.sourceFile,
      confidence_level: "high",
      processing_status: "verified",
      verified: true,
      processed_at: now,
    }));

    // Insert into Supabase
    const { error } = await supabase.from("intelligence_documents").insert(rows);
    if (error) {
      console.error(`Error inserting batch starting at index ${i}:`, error);
      throw error;
    }

    totalEmbedded += batch.length;
    const filesInBatch = [...new Set(batch.map((c) => c.sourceFile))];
    for (const f of filesInBatch) {
      const count = batch.filter((c) => c.sourceFile === f).length;
      console.log(`Embedded ${count} chunks for ${f}`);
    }

    // Small delay to avoid rate limits
    if (i + EMBEDDING_BATCH_SIZE < allChunks.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  console.log(`\n=== Complete ===`);
  console.log(`Total documents processed: ${allFiles.length}`);
  console.log(`Total chunks embedded: ${totalEmbedded}`);

  // Verify count
  const { count, error: countError } = await supabase
    .from("intelligence_documents")
    .select("*", { count: "exact", head: true })
    .eq("deal_id", DEAL_ID);

  if (countError) {
    console.error("Error verifying count:", countError);
  } else {
    console.log(`Verified: ${count} rows in intelligence_documents for this deal.`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
