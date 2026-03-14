import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export const dynamic = 'force-dynamic'

const repoRoot = path.resolve(process.cwd(), '../..')

export async function POST(request: NextRequest) {
  try {
    const { mode, folder } = await request.json() as { mode: 'all' | 'new' | 'folder'; folder?: string }

    const args = ['tsx', 'scripts/embed-documents.ts']
    if (mode) args.push(`--mode=${mode}`)
    if (mode === 'folder' && folder) args.push(`--folder=${folder}`)

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      start(controller) {
        const proc = spawn('npx', args, {
          cwd: repoRoot,
          shell: true,
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

        proc.on('close', (code) => {
          controller.enqueue(encoder.encode(`\n[done] Process exited with code ${code}\n`))
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
