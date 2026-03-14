import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const repoRoot = path.resolve(process.cwd(), '../..')
const configPath = path.resolve(repoRoot, 'config.json')

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = JSON.parse(JSON.stringify(target)) as Record<string, unknown>
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(
        result[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      )
    } else {
      result[key] = source[key]
    }
  }
  return result
}

export async function GET(request: NextRequest) {
  try {
    const section = request.nextUrl.searchParams.get('section')

    const configRaw = fs.readFileSync(configPath, 'utf-8')
    const config = JSON.parse(configRaw) as Record<string, unknown>

    if (section === 'systemPrompt') {
      const agent = config.agent as Record<string, unknown> | undefined
      const systemPromptPath = agent?.systemPromptPath as string | undefined
      if (!systemPromptPath) {
        return NextResponse.json({ content: '' })
      }
      const resolvedPath = path.resolve(repoRoot, systemPromptPath)
      if (!fs.existsSync(resolvedPath)) {
        return NextResponse.json({ content: '' })
      }
      const content = fs.readFileSync(resolvedPath, 'utf-8')
      return NextResponse.json({ content })
    }

    return NextResponse.json(config)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>

    // Handle system prompt content write
    if (typeof body.systemPromptContent === 'string') {
      const configRaw = fs.readFileSync(configPath, 'utf-8')
      const config = JSON.parse(configRaw) as Record<string, unknown>
      const agent = config.agent as Record<string, unknown> | undefined
      const systemPromptPath = agent?.systemPromptPath as string | undefined
      if (!systemPromptPath) {
        return NextResponse.json({ error: 'No systemPromptPath configured' }, { status: 400 })
      }
      const resolvedPath = path.resolve(repoRoot, systemPromptPath)
      fs.writeFileSync(resolvedPath, body.systemPromptContent as string, 'utf-8')
      return NextResponse.json({ success: true })
    }

    // Deep merge and write config
    const configRaw = fs.readFileSync(configPath, 'utf-8')
    const existing = JSON.parse(configRaw) as Record<string, unknown>
    const merged = deepMerge(existing, body)
    const output = JSON.stringify(merged, null, 2)

    fs.writeFileSync(configPath, output, 'utf-8')

    // Sync to web/presentation/config.json if it exists
    const presentationConfig = path.resolve(repoRoot, 'web/presentation/config.json')
    if (fs.existsSync(presentationConfig)) {
      fs.writeFileSync(presentationConfig, output, 'utf-8')
    }

    // Sync to web/dashboard/config.json if it exists
    const dashboardConfig = path.resolve(repoRoot, 'web/dashboard/config.json')
    if (fs.existsSync(dashboardConfig)) {
      fs.writeFileSync(dashboardConfig, output, 'utf-8')
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
