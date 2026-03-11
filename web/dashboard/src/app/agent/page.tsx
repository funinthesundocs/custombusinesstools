'use client'

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react'
import Image from 'next/image'
import { Brain, Send, User, Mic, Volume2 } from 'lucide-react'
import { NuggetStatus, type NuggetState } from '@/components/NuggetStatus'
import { supabase } from '@/lib/supabase'

const DEAL_ID = '57eb32a1-8550-45d1-8906-64652642c465'

interface DbMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sender_name: string
  created_at: string
}

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  sender_name?: string
  created_at?: string
}

const SUGGESTED_QUESTIONS = [
  'What are the key geological assets in the partnership?',
  'Summarize Sebastian Aboitiz\'s decision-making priorities',
  'What regulatory risks should we prepare for?',
  'What is GMC\'s leverage in this deal?',
  'Outline the recommended meeting strategy',
]

function formatMarkdown(text: string): string {
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code class="font-mono bg-zinc-800 px-1 py-0.5 rounded text-sm">$1</code>')
  html = html.replace(/\n/g, '<br />')
  html = html.replace(/((?:^|<br \/>)\s*[-*]\s+.+(?:<br \/>\s*[-*]\s+.+)*)/g, (match) => {
    const items = match
      .split(/<br \/>/)
      .filter(line => line.trim().match(/^[-*]\s+/))
      .map(line => `<li class="ml-4">${line.trim().replace(/^[-*]\s+/, '')}</li>`)
      .join('')
    return `<ul class="list-disc pl-4 my-1">${items}</ul>`
  })
  return html
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\[Source:[^\]]*\]/g, '')
}

function relativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
  if (diffDay === 1) {
    return `Yesterday ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
  }
  if (diffDay < 7) return `${diffDay} days ago`
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

const SENTENCE_RE = /(?<=[.!?])\s+|(?<=\n)\s*/

function extractSentences(text: string, alreadySent: number): string[] {
  const cleaned = stripMarkdown(text)
  const allSentences = cleaned.split(SENTENCE_RE).filter(s => s.trim().length > 5)
  return allSentences.slice(alreadySent)
}

class AudioQueue {
  private queue: Promise<Blob | null>[] = []
  private playing = false
  private cancelled = false
  private currentAudio: HTMLAudioElement | null = null
  private onStateChange: (playing: boolean) => void

  constructor(onStateChange: (playing: boolean) => void) {
    this.onStateChange = onStateChange
  }

  enqueue(text: string) {
    if (this.cancelled || !text.trim() || text.trim().length < 3) return
    const blobPromise = fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim() }),
    }).then(res => {
      if (!res.ok) return null
      return res.blob()
    }).catch(() => null)

    this.queue.push(blobPromise)
    if (!this.playing) this.playNext()
  }

  private async playNext() {
    if (this.cancelled || this.queue.length === 0) {
      this.playing = false
      this.onStateChange(false)
      return
    }

    this.playing = true
    this.onStateChange(true)

    const blobPromise = this.queue.shift()!
    const blob = await blobPromise
    if (this.cancelled || !blob) {
      if (!this.cancelled) this.playNext()
      return
    }

    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    this.currentAudio = audio

    await new Promise<void>((resolve) => {
      audio.onended = () => { URL.revokeObjectURL(url); this.currentAudio = null; resolve() }
      audio.onerror = () => { URL.revokeObjectURL(url); this.currentAudio = null; resolve() }
      audio.play().catch(() => resolve())
    })

    if (!this.cancelled) this.playNext()
  }

  cancel() {
    this.cancelled = true
    this.queue = []
    if (this.currentAudio) { this.currentAudio.pause(); this.currentAudio = null }
    this.playing = false
    this.onStateChange(false)
  }
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false)
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const voiceEnabledRef = useRef(true)
  const speechRecognitionRef = useRef<any>(null)
  const audioQueueRef = useRef<AudioQueue | null>(null)
  const messageIdsRef = useRef<Set<string>>(new Set())

  // Preload all nugget images on mount
  useEffect(() => {
    const preload = [
      '/images/nugget/nugget-greeting.png',
      '/images/nugget/nugget-hero-light.png',
      '/images/nugget/nugget-hero-dark.png',
      '/images/nugget/nugget-thinking.png',
    ]
    preload.forEach(src => {
      const img = new window.Image()
      img.src = src
    })
  }, [])

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const transcriptRef = useRef('')

  // Load conversation history from Supabase on mount
  useEffect(() => {
    async function loadHistory() {
      const { data } = await supabase
        .from('agent_conversations')
        .select('id, role, content, sender_name, created_at')
        .eq('deal_id', DEAL_ID)
        .order('created_at', { ascending: true })

      if (data && data.length > 0) {
        const msgs: Message[] = data.map((row: DbMessage) => ({
          id: row.id,
          role: row.role,
          content: row.content,
          sender_name: row.sender_name,
          created_at: row.created_at,
        }))
        setMessages(msgs)
        for (const row of data) {
          messageIdsRef.current.add(row.id)
        }
      }
      setHistoryLoaded(true)
    }
    loadHistory()
  }, [])

  // Subscribe to realtime inserts from other clients
  useEffect(() => {
    const channel = supabase
      .channel('agent_conversations_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_conversations', filter: `deal_id=eq.${DEAL_ID}` },
        (payload: any) => {
          const row = payload.new as DbMessage
          // Skip messages we already have (ones we inserted ourselves)
          if (messageIdsRef.current.has(row.id)) return
          messageIdsRef.current.add(row.id)
          setMessages(prev => [...prev, {
            id: row.id,
            role: row.role,
            content: row.content,
            sender_name: row.sender_name,
            created_at: row.created_at,
          }])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR) {
      speechRecognitionRef.current = SR
      setHasSpeechRecognition(true)
    }
  }, [])

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled
    if (!voiceEnabled && audioQueueRef.current) {
      audioQueueRef.current.cancel()
      audioQueueRef.current = null
    }
  }, [voiceEnabled])

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const playFullMessage = useCallback((text: string) => {
    if (audioQueueRef.current) audioQueueRef.current.cancel()
    const queue = new AudioQueue((playing) => setIsSpeaking(playing))
    audioQueueRef.current = queue
    const sentences = stripMarkdown(text).split(SENTENCE_RE).filter(s => s.trim().length > 5)
    for (const sentence of sentences) queue.enqueue(sentence)
  }, [])

  // Insert a message into Supabase
  const saveMessage = useCallback(async (role: 'user' | 'assistant', content: string) => {
    const { data } = await supabase
      .from('agent_conversations')
      .insert({ deal_id: DEAL_ID, role, content, sender_name: 'Team Member' })
      .select('id, created_at')
      .single()

    if (data) {
      messageIdsRef.current.add(data.id)
      return { id: data.id, created_at: data.created_at }
    }
    return null
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return

    const userMessage: Message = { role: 'user', content: text.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsStreaming(true)

    // Save user message to Supabase immediately
    const saved = await saveMessage('user', text.trim())
    if (saved) {
      userMessage.id = saved.id
      userMessage.created_at = saved.created_at
    }

    if (audioQueueRef.current) {
      audioQueueRef.current.cancel()
      audioQueueRef.current = null
    }

    const assistantMessage: Message = { role: 'assistant', content: '' }
    setMessages([...updatedMessages, assistantMessage])

    let sentencesSent = 0
    let audioQueue: AudioQueue | null = null
    if (voiceEnabledRef.current) {
      audioQueue = new AudioQueue((playing) => setIsSpeaking(playing))
      audioQueueRef.current = audioQueue
    }

    try {
      // Build conversation context from last 10 messages for the API
      const recentHistory = updatedMessages.slice(-10).map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: recentHistory,
          question: text.trim(),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(errorData.error || `API error: ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let assistantContent = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                assistantContent += parsed.delta.text
                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
                  return updated
                })

                if (audioQueue) {
                  const newSentences = extractSentences(assistantContent, sentencesSent)
                  const toSend = newSentences.slice(0, -1)
                  for (const sentence of toSend) {
                    audioQueue.enqueue(sentence)
                    sentencesSent++
                  }
                }
              }
            } catch { /* skip */ }
          }
        }
      }

      if (assistantContent) {
        // Save assistant response to Supabase
        const savedAssistant = await saveMessage('assistant', assistantContent)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: assistantContent,
            id: savedAssistant?.id,
            created_at: savedAssistant?.created_at,
          }
          return updated
        })

        if (audioQueue) {
          const remaining = extractSentences(assistantContent, sentencesSent)
          for (const sentence of remaining) audioQueue.enqueue(sentence)
        }
      }
    } catch (error: any) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `Error: ${error.message || 'Something went wrong. Please try again.'}`,
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
      inputRef.current?.focus()
    }
  }, [messages, isStreaming, saveMessage])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleChipClick = (question: string) => {
    sendMessage(question)
  }

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }
    if (countdownIntervalRef.current) { clearInterval(countdownIntervalRef.current); countdownIntervalRef.current = null }
    setSilenceCountdown(null)
  }, [])

  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer()
    let remaining = 3
    setSilenceCountdown(remaining)
    countdownIntervalRef.current = setInterval(() => {
      remaining--
      if (remaining > 0) {
        setSilenceCountdown(remaining)
      }
    }, 1000)
    silenceTimerRef.current = setTimeout(() => {
      clearSilenceTimer()
      const text = transcriptRef.current.trim()
      if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null }
      setIsListening(false)
      if (text) {
        setInput('')
        sendMessage(text)
      }
      transcriptRef.current = ''
    }, 3500)
  }, [clearSilenceTimer, sendMessage])

  const startListening = useCallback(() => {
    if (!speechRecognitionRef.current || isStreaming) return
    const recognition = new speechRecognitionRef.current()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    transcriptRef.current = ''

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }
      const fullText = (finalTranscript + interimTranscript).trim()
      transcriptRef.current = fullText
      setInput(fullText)
      // Reset silence timer on every new result
      startSilenceTimer()
    }

    recognition.onerror = () => {
      clearSilenceTimer()
      setIsListening(false)
      transcriptRef.current = ''
    }

    recognition.onend = () => {
      // If continuous mode ends unexpectedly (browser limit), send what we have
      if (transcriptRef.current.trim() && !silenceTimerRef.current) {
        const text = transcriptRef.current.trim()
        setIsListening(false)
        setInput('')
        sendMessage(text)
        transcriptRef.current = ''
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isStreaming, sendMessage, startSilenceTimer, clearSilenceTimer])

  const stopListening = useCallback(() => {
    clearSilenceTimer()
    const text = transcriptRef.current.trim()
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null }
    setIsListening(false)
    if (text) {
      setInput('')
      sendMessage(text)
    }
    transcriptRef.current = ''
  }, [clearSilenceTimer, sendMessage])

  // Derive Nugget visual state from existing variables
  const lastMessage = messages[messages.length - 1]
  const isThinking = isStreaming && (!lastMessage || lastMessage.role !== 'assistant' || !lastMessage.content)
  const isTalking = (isStreaming && lastMessage?.role === 'assistant' && !!lastMessage.content) || isSpeaking
  const nuggetState: NuggetState = isListening ? 'listening' : isThinking ? 'thinking' : isTalking ? 'talking' : 'idle'

  return (
    <div className="page-enter flex flex-col h-[calc(100vh-7rem)] -mt-2">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--color-primary-muted)]">
          <Brain size={20} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">AI Agent</h1>
          <p className="text-xs text-zinc-500">Shared conversation — visible to all team members</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-zinc-500">Voice</span>
          <Volume2 size={14} className={isSpeaking ? 'text-[var(--color-primary)] animate-pulse' : 'text-zinc-500'} />
          <button
            onClick={() => setVoiceEnabled(v => !v)}
            className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              voiceEnabled ? 'bg-[var(--color-primary)]' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 rounded-full bg-white transition-transform ${
                voiceEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Message Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-4 scroll-smooth">
        {!historyLoaded ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-zinc-500 text-sm">Loading conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <NuggetStatus state={nuggetState} size={80} />
            <div className="text-center">
              <p className="text-zinc-300 text-lg font-medium">Ask anything about the GMC x Aboitiz deal</p>
              <p className="text-zinc-600 text-sm mt-1">Powered by RAG retrieval over the intelligence database</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleChipClick(q)}
                  className="px-3 py-1.5 text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-full hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center py-2 mb-2">
              <NuggetStatus state={nuggetState} size={60} />
            </div>
            {messages.map((msg, i) => {
              const isThinkingMsg = msg.role === 'assistant' && isStreaming && i === messages.length - 1 && !msg.content
              return (
            <div key={msg.id || i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className={`flex-shrink-0 w-9 h-9 rounded-full overflow-hidden mt-0.5 ${isThinkingMsg ? 'nugget-thinking' : ''}`}>
                  <Image
                    src={isThinkingMsg ? '/images/nugget/nugget-thinking.png' : '/images/nugget/nugget-hero-dark.png'}
                    alt="Nugget"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {isThinkingMsg ? (
                <div className="max-w-[75%] rounded-lg px-4 py-3 text-sm leading-relaxed bg-zinc-900 border-l-2 border-[var(--color-primary)] text-zinc-400">
                  Thinking...
                </div>
              ) : (
              <div
                className={`max-w-[75%] rounded-lg px-4 py-3 text-sm leading-relaxed relative ${
                  msg.role === 'user'
                    ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-zinc-100'
                    : 'bg-zinc-900 border-l-2 border-[var(--color-primary)] text-zinc-200'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                    {isStreaming && i === messages.length - 1 && (
                      <span className="inline-flex gap-1 ml-1 mt-1">
                        <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-pulse" />
                        <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-pulse [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-pulse [animation-delay:300ms]" />
                      </span>
                    )}
                    {msg.content && !isStreaming && (
                      <button
                        onClick={() => playFullMessage(msg.content)}
                        className="absolute bottom-1.5 right-1.5 p-1 rounded transition-colors text-zinc-600 hover:text-zinc-300"
                        title="Play audio"
                      >
                        <Volume2 size={12} />
                      </button>
                    )}
                  </>
                ) : (
                  <span>{msg.content}</span>
                )}
                {msg.created_at && (
                  <div className={`text-[10px] text-zinc-500 mt-1.5 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {relativeTime(msg.created_at)}
                  </div>
                )}
              </div>
              )}
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center mt-0.5">
                  <User size={14} className="text-zinc-400" />
                </div>
              )}
            </div>
              )
          })}
          </>
        )}
      </div>

      {/* Listening indicator */}
      {isListening && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-[var(--color-primary)]">
          <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse" />
          {silenceCountdown !== null
            ? <span className="text-zinc-400">Sending in {silenceCountdown}...</span>
            : 'Listening...'
          }
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 pt-4 border-t border-zinc-800">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the deal..."
          disabled={isStreaming}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors disabled:opacity-50"
          autoFocus
        />
        {hasSpeechRecognition && (
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={isStreaming}
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              isListening
                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-black animate-pulse'
                : 'border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)]'
            }`}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            <Mic size={16} />
          </button>
        )}
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-primary)] text-black hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
