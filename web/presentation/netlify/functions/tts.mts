const VOICE_ID = 'dtSEyYGNJqjrtBArPCVZ' // Titan

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { text } = await req.json()
    if (!text) {
      return new Response(JSON.stringify({ error: 'No text provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream?optimize_streaming_latency=4`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      return new Response(
        JSON.stringify({ error: `ElevenLabs error ${res.status}: ${errText}` }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(res.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'TTS failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
