/**
 * RAG Factory — Typed config re-export
 *
 * web/presentation/config.json is the single source of truth.
 * This file provides a typed wrapper for use in scripts and build tools.
 *
 * - chat.mts and the Next.js site import config.json directly (already working)
 * - Scripts, embed tools, and build utilities import projectConfig from here
 */

import configJson from '../config.json'

export const projectConfig = configJson

export type ProjectConfig = {
  company: {
    name: string
    short_name: string
    tagline: string
    description: string
    domain: string
    email: string
    address: { line1: string; line2: string; city: string; country: string }
    founded_year: string
  }
  agent: {
    name: string
    role: string
    personality: string
    avatar_path: string
    systemPromptPath: string
  }
  voice: {
    provider: string
    voiceId: string
    model: string
  }
  brand: {
    primary: string
    secondary: string
    accent: string
    dark: string
    light: string
    success: string
    warning: string
  }
  fonts: {
    headline: string
    body: string
    mono: string
  }
  supabase: {
    project_id: string
  }
  dataFeeds: {
    defaultLocation: string
    baseCurrency: string
    cryptoAssets: string[]
    earthquakeMinMagnitude: number
    stockSymbols: string[]
    sportsLeagues: string[]
    apiKeys: {
      fred: string
      gnews: string
      alphaVantage: string
    }
  }
  rag: {
    embeddingModel: string
    embeddingDimensions: number
    matchCount: number
    similarityThreshold: number
    researchThreshold: number
    chunkMaxChars: number
    childChunkChars: number
    pinecone: {
      indexName: string
    }
  }
  nav_links: Array<{ label: string; href: string }>
}
