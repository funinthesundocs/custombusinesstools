import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const repoRoot = path.resolve(process.cwd(), '../..')
const scriptPath = path.resolve(repoRoot, 'multi-exchange-scanner.py')
const outputPath = path.resolve(repoRoot, 'MARKET_DATA.json')

export async function GET() {
  try {
    if (!fs.existsSync(outputPath)) {
      return NextResponse.json({ error: 'No scan data yet. Run a scan first.' }, { status: 404 })
    }
    const raw = fs.readFileSync(outputPath, 'utf-8')
    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST() {
  try {
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json({ error: `Scanner script not found at ${scriptPath}` }, { status: 404 })
    }

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      start(controller) {
        const proc = spawn('python3', [scriptPath, '--output', outputPath], {
          cwd: repoRoot,
          env: { ...process.env },
        })

        proc.stdout.on('data', (chunk: Buffer) => {
          const lines = chunk.toString().split('\n')
          for (const line of lines) {
            if (line.trim()) {
              controller.enqueue(encoder.encode(line + '\n'))
            }
          }
        })

        proc.stderr.on('data', (chunk: Buffer) => {
          const lines = chunk.toString().split('\n')
          for (const line of lines) {
            if (line.trim()) {
              controller.enqueue(encoder.encode('[stderr] ' + line + '\n'))
            }
          }
        })

        proc.on('close', async (code) => {
          controller.enqueue(encoder.encode(`\n[done] Scanner exited with code ${code}\n`))

          // On success, read the output and write key prices to market_data Supabase table
          if (code === 0 && fs.existsSync(outputPath)) {
            try {
              const raw = fs.readFileSync(outputPath, 'utf-8')
              const scanData = JSON.parse(raw) as {
                timestamp: string
                assets: Record<string, Record<string, { price?: number | null }>>
                best_opportunities: unknown[]
              }

              // Extract a prices summary (best price per asset across all exchanges)
              const prices: Record<string, number | null> = {}
              for (const [symbol, exchanges] of Object.entries(scanData.assets)) {
                const canonical = symbol.replace('USDT', '')
                const pricesList = Object.values(exchanges)
                  .filter((e): e is Record<string, number | null> => typeof e === 'object' && e !== null && !Array.isArray(e))
                  .map(e => e?.price)
                  .filter((p): p is number => typeof p === 'number' && p > 0)
                if (pricesList.length > 0) {
                  // Use median price for robustness
                  const sorted = [...pricesList].sort((a, b) => a - b)
                  prices[canonical] = sorted[Math.floor(sorted.length / 2)]
                } else {
                  prices[canonical] = null
                }
              }

              const supabase = createServerClient()
              await supabase.from('market_data').insert({
                prices,
                weather: null,
                fetched_at: new Date().toISOString(),
              })

              controller.enqueue(encoder.encode(`[info] Prices written to market_data table (${Object.keys(prices).length} assets)\n`))
            } catch (dbErr) {
              controller.enqueue(encoder.encode(`[warn] DB write failed: ${dbErr}\n`))
            }
          }

          controller.close()
        })

        proc.on('error', (err) => {
          controller.enqueue(encoder.encode(`[error] ${err.message}\n`))
          controller.close()
        })
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
