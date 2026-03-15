import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(__dirname, '../../../.env') })

// Dynamic imports for the Netlify function handlers
const chatModule = await import('../netlify/functions/chat.mts')
const chatHandler = chatModule.default

let ttsHandler: any = null
try {
  const ttsModule = await import('../netlify/functions/tts.mts')
  ttsHandler = ttsModule.default
} catch { /* tts is optional */ }

const server = http.createServer(async (req, res) => {
  // CORS headers for local dev
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // Collect request body
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const body = Buffer.concat(chunks).toString()

  // Build a Web API Request from the Node http request
  const url = `http://localhost:${PORT}${req.url}`
  const webRequest = new Request(url, {
    method: req.method || 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body || undefined,
  })

  try {
    let response: Response

    if (req.url === '/api/chat' || req.url === '/.netlify/functions/chat') {
      response = await chatHandler(webRequest, { geo: { city: '' } })
    } else if ((req.url === '/api/tts' || req.url === '/.netlify/functions/tts') && ttsHandler) {
      response = await ttsHandler(webRequest, {})
    } else {
      res.writeHead(404)
      res.end('Not found')
      return
    }

    // Stream the Web API Response back through Node http
    res.writeHead(response.status, {
      'Content-Type': response.headers.get('Content-Type') || 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...Object.fromEntries(
        [...response.headers.entries()].filter(([k]) =>
          k.toLowerCase().startsWith('access-control') ||
          k.toLowerCase() === 'x-research-pending'
        )
      ),
    })

    if (response.body) {
      const reader = response.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(value)
      }
    }
    res.end()
  } catch (err: any) {
    console.error('Function error:', err)
    res.writeHead(500)
    res.end(JSON.stringify({ error: err.message }))
  }
})

const PORT = 8787
server.listen(PORT, () => {
  console.log(`Function server running on http://localhost:${PORT}`)
  console.log('Routes: /api/chat, /api/tts')
})
