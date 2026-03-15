'use client'

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react'
import Image from 'next/image'
import { Send, User, Mic, Volume2, MessageCircle, WifiOff, X } from 'lucide-react'
import { AgentStatus, type AgentState } from './AgentStatus'
import { supabase } from '@/lib/supabase'
import config from '@/lib/siteConfig'

interface DbMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sender_name: string
  created_at: string
}

interface Citation {
  source_title: string
  source_file: string
  section_heading: string
  page_number: number | null
  score: number
}

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  sender_name?: string
  created_at?: string
  citations?: Citation[]
}

const SUGGESTED_QUESTIONS = [
  `What does ${config.company.short_name} do?`,
  'Tell me about the team',
  'What services do you offer?',
  'What is the partnership opportunity?',
  'How can I get in touch?',
]

function formatMarkdown(text: string): string {
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code class="font-mono bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
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

// Unlock audio playback on first user interaction (required by all browsers)
let audioUnlocked = false
function unlockAudio() {
  if (audioUnlocked) return
  const silence = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=')
  silence.volume = 0
  silence.play().then(() => {
    silence.pause()
    audioUnlocked = true
    console.log('TTS: Audio playback unlocked')
  }).catch(() => {
    console.log('TTS: Audio unlock deferred — will retry on next interaction')
  })
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
    console.log('TTS: enqueue sentence:', text.trim().substring(0, 60) + '...')
    const blobPromise = fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim() }),
    }).then(res => {
      if (!res.ok) {
        console.error('TTS: fetch failed with status', res.status)
        return null
      }
      console.log('TTS: received audio blob, content-type:', res.headers.get('content-type'))
      return res.blob()
    }).catch(err => {
      console.error('TTS: fetch error:', err)
      return null
    })

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
      console.log('TTS: blob was null or cancelled, skipping')
      if (!this.cancelled) this.playNext()
      return
    }

    console.log('TTS: playing blob, size:', blob.size, 'type:', blob.type)
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    this.currentAudio = audio

    await new Promise<void>((resolve) => {
      audio.onended = () => {
        console.log('TTS: audio segment ended')
        URL.revokeObjectURL(url); this.currentAudio = null; resolve()
      }
      audio.onerror = (e) => {
        console.error('TTS: audio error:', e)
        URL.revokeObjectURL(url); this.currentAudio = null; resolve()
      }
      audio.play().then(() => {
        console.log('TTS: play() started successfully')
      }).catch(err => {
        console.error('TTS: play() blocked by browser:', err.message)
        URL.revokeObjectURL(url)
        this.currentAudio = null
        resolve()
      })
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

interface AIChatProps {
  fullPage?: boolean
  onClose?: () => void
}

export function AIChat({ fullPage = false, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [online, setOnline] = useState(true)
  const [researchPending, setResearchPending] = useState(false)
  const [researchLoading, setResearchLoading] = useState(false)
  const researchAbortRef = useRef(false)
  const isAutoFollowUp = useRef(false)
  const [deviceId] = useState(() => {
    if (typeof window === 'undefined') return ''
    let id = localStorage.getItem('rag_device_id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('rag_device_id', id)
    }
    return id
  })
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const voiceEnabledRef = useRef(true)
  const speechRecognitionRef = useRef<any>(null)
  const audioQueueRef = useRef<AudioQueue | null>(null)
  const messageIdsRef = useRef<Set<string>>(new Set())

  // Preload agent images on mount
  useEffect(() => {
    const preload = [
      `${config.agent.avatar_path}greeting.png`,
      `${config.agent.avatar_path}hero-light.png`,
      `${config.agent.avatar_path}hero-dark.png`,
      `${config.agent.avatar_path}thinking.png`,
    ]
    preload.forEach(src => {
      const img = new window.Image()
      img.src = src
    })
  }, [])

  // Online/offline detection
  useEffect(() => {
    setOnline(navigator.onLine)
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  // Load conversation history from Supabase
  useEffect(() => {
    async function loadHistory() {
      try {
        const { data } = await supabase
          .from('external_agent_conversations')
          .select('id, role, content, sender_name, created_at')
          .eq('device_id', deviceId)
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
      } catch {
        // Offline or table doesn't exist yet — proceed without history
      }
      setHistoryLoaded(true)
    }
    loadHistory()
  }, [deviceId])

  // Subscribe to realtime inserts from other clients
  useEffect(() => {
    const channel = supabase
      .channel('external_agent_conversations_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'external_agent_conversations', filter: `device_id=eq.${deviceId}` },
        (payload: any) => {
          const row = payload.new as DbMessage
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
  }, [deviceId])

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

  const saveMessage = useCallback(async (role: 'user' | 'assistant', content: string) => {
    try {
      // Pre-register the ID before the insert so the Supabase Realtime event
      // (which can fire before the HTTP response returns) is deduped correctly.
      const id = crypto.randomUUID()
      messageIdsRef.current.add(id)

      const { data } = await supabase
        .from('external_agent_conversations')
        .insert({ id, role, content, sender_name: 'Visitor', device_id: deviceId })
        .select('id, created_at')
        .single()

      if (data) {
        return { id: data.id, created_at: data.created_at }
      }
    } catch {
      // Offline — message not persisted
    }
    return null
  }, [deviceId])

  const sendMessage = useCallback(async (text: string, isVoice = false) => {
    if (!text.trim() || isStreaming) return

    researchAbortRef.current = true
    setResearchPending(false)
    setResearchLoading(false)

    const userMessage: Message = { role: 'user', content: text.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsStreaming(true)

    const saved = await saveMessage('user', text.trim())
    if (saved) {
      const last = updatedMessages[updatedMessages.length - 1]
      last.id = saved.id
      last.created_at = saved.created_at
    }

    if (audioQueueRef.current) {
      audioQueueRef.current.cancel()
      audioQueueRef.current = null
    }

    const assistantMessage: Message = { role: 'assistant', content: '' }
    setMessages([...updatedMessages, assistantMessage])

    let sentencesSent = 0
    let currentCitations: Citation[] = []
    let audioQueue: AudioQueue | null = null
    console.log('TTS: Voice enabled:', voiceEnabledRef.current)
    if (voiceEnabledRef.current) {
      audioQueue = new AudioQueue((playing) => setIsSpeaking(playing))
      audioQueueRef.current = audioQueue
      console.log('TTS: AudioQueue created, ready for sentences')
    }

    try {
      const recentHistory = updatedMessages.slice(-10).map(m => ({ role: m.role, content: m.content }))

      console.log('sendMessage: fetch to /api/chat started')
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: recentHistory,
          question: text.trim(),
          voice: isVoice,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(errorData.error || `API error: ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response stream')
      console.log('sendMessage: SSE reader started')

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
              if (parsed.type === 'research_pending' && !isAutoFollowUp.current) {
                const pendingQuestion = parsed.question;
                setResearchPending(true);
                researchAbortRef.current = false;

                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

                if (supabaseUrl && anonKey) {
                  (async () => {
                    for (let i = 0; i < 10; i++) {
                      await new Promise(r => setTimeout(r, 5000));
                      if (researchAbortRef.current) break;

                      try {
                        const taskRes = await fetch(
                          `${supabaseUrl}/rest/v1/agent_tasks?task_type=eq.knowledge_gap&status=eq.complete&order=created_at.desc&limit=5`,
                          { headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` } }
                        );
                        const tasks = await taskRes.json();
                        const recentCutoff = new Date(Date.now() - 60000).toISOString();
                        const match = tasks.find((t: any) =>
                          t.payload?.question?.toLowerCase().trim() === pendingQuestion.toLowerCase().trim() &&
                          t.created_at > recentCutoff &&
                          t.result?.success === true
                        );

                        if (match) {
                          setResearchPending(false);
                          if (researchAbortRef.current) return;

                          setResearchLoading(true);
                          isAutoFollowUp.current = true;

                          try {
                            const followUpRes = await fetch('/api/chat', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                messages: [{ role: 'user', content: pendingQuestion }],
                                question: pendingQuestion,
                                voice: false,
                                isFollowUp: true,
                                researchContent: match.result?.content || null
                              })
                            });

                            let followUpContent = '';
                            const freader = followUpRes.body?.getReader();
                            const fdecoder = new TextDecoder();
                            if (freader) {
                              let fbuffer = '';
                              while (true) {
                                const { done, value } = await freader.read();
                                if (done) break;
                                fbuffer += fdecoder.decode(value, { stream: true });
                                const flines = fbuffer.split('\n');
                                fbuffer = flines.pop() || '';
                                for (const fline of flines) {
                                  if (fline.startsWith('data: ') || fline.startsWith('data:')) {
                                    try {
                                      const fp = JSON.parse(fline.slice(fline.indexOf(':') + 1).trim());
                                      if (fp.type === 'content_block_delta' && fp.delta?.text) {
                                        followUpContent += fp.delta.text;
                                      }
                                    } catch {}
                                  }
                                }
                              }
                            }

                            if (followUpContent.length > 0) {
                              const updatedMsg: Message = {
                                role: 'assistant',
                                content: followUpContent,
                                sender_name: `${config.agent.name} (Updated)`,
                                created_at: new Date().toISOString()
                              };
                              setMessages(prev => [...prev, updatedMsg]);

                              if (voiceEnabledRef.current && audioQueueRef.current) {
                                const sentences = extractSentences(followUpContent, 0);
                                for (const sentence of sentences) {
                                  audioQueueRef.current.enqueue(sentence);
                                }
                              }

                              await saveMessage('assistant', followUpContent);
                            }
                          } catch {}
                          setResearchLoading(false);
                          isAutoFollowUp.current = false;
                          return;
                        }
                      } catch {}
                    }
                    setResearchPending(false);
                  })();
                }
              }
              if (parsed.type === 'citations') {
                currentCitations = parsed.citations || []
              }
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
                  if (toSend.length > 0) {
                    console.log('TTS: detected', toSend.length, 'new sentence(s) during stream')
                  }
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
        const savedAssistant = await saveMessage('assistant', assistantContent)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: assistantContent,
            id: savedAssistant?.id,
            created_at: savedAssistant?.created_at,
            citations: currentCitations.length > 0 ? currentCitations : undefined,
          }
          return updated
        })

        if (audioQueue) {
          const remaining = extractSentences(assistantContent, sentencesSent)
          console.log('TTS: stream complete, remaining sentences to play:', remaining.length)
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
    unlockAudio()
    sendMessage(input)
  }

  const handleChipClick = (question: string) => {
    unlockAudio()
    sendMessage(question)
  }

  // Speech recognition — simple single-utterance approach.
  // Tap mic → speak → it auto-detects end of speech → sends.
  // No continuous mode, no interim accumulation, no duplication.
  const startListening = useCallback(() => {
    if (!speechRecognitionRef.current || isStreaming) return
    // If already listening, stop
    if (recognitionRef.current) {
      recognitionRef.current.abort()
      recognitionRef.current = null
      setIsListening(false)
      return
    }

    const recognition = new speechRecognitionRef.current()
    recognition.continuous = false      // single utterance — stops after silence
    recognition.interimResults = false   // only fire when result is final
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event: any) => {
      // Single final result — take the first (and only) result
      const transcript = event.results[0]?.[0]?.transcript?.trim()
      if (transcript) {
        setInput('')
        sendMessage(transcript, true)
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    unlockAudio()
    recognition.start()
  }, [isStreaming, sendMessage])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  // Offline state
  if (!online) {
    return (
      <div className={`flex flex-col items-center justify-center gap-4 ${fullPage ? 'h-[calc(100dvh-72px)]' : 'h-full'}`}>
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
          <WifiOff className="text-amber-500" size={24} />
        </div>
        <p className="text-text-secondary text-center px-4">
          The AI Assistant requires an internet connection.
        </p>
      </div>
    )
  }

  // Derive agent visual state from existing variables
  const lastMessage = messages[messages.length - 1]
  const isThinking = isStreaming && (!lastMessage || lastMessage.role !== 'assistant' || !lastMessage.content)
  const isTalking = (isStreaming && lastMessage?.role === 'assistant' && !!lastMessage.content) || isSpeaking
  const agentState: AgentState = isListening ? 'listening' : isThinking ? 'thinking' : isTalking ? 'talking' : 'idle'

  const containerClass = fullPage
    ? 'flex flex-col h-[calc(100dvh-72px)] pt-[72px]'
    : 'flex flex-col h-[100dvh] sm:h-full'

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className={`flex items-center gap-4 px-4 py-6 border-b ${fullPage ? 'border-border' : 'border-gray-100'}`}>
        <div className="flex-shrink-0 w-[134px] h-[134px] rounded-full overflow-hidden shadow-lg flex items-center justify-center">
          <div className="w-[112px] h-[112px] flex items-center justify-center bg-amber-100 rounded-full"><MessageCircle size={48} className="text-amber-500" /></div>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <h2 className="text-base font-bold text-text-primary tracking-wide whitespace-nowrap">ASK {config.agent.name.toUpperCase()}</h2>
          <p className="text-[11px] text-text-muted whitespace-nowrap">{config.company.short_name} AI Advisor</p>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Volume2 size={13} className={`flex-shrink-0 ${isSpeaking ? 'text-brand-gold animate-pulse' : voiceEnabled ? 'text-brand-navy' : 'text-text-muted'}`} />
          <button
            onClick={() => { unlockAudio(); setVoiceEnabled(v => !v) }}
            className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
              voiceEnabled ? 'bg-brand-navy' : 'bg-gray-300'
            }`}
            title={voiceEnabled ? 'Voice responses ON — click to mute' : 'Voice responses OFF — click to enable'}
          >
            <span
              className={`inline-block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                voiceEnabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
              }`}
            />
          </button>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={14} className="text-text-primary" />
          </button>
        )}
      </div>

      {/* Message Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
        {!historyLoaded ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-text-muted text-sm">Loading...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 px-2">
            <AgentStatus state={agentState} size={80} />
            <div className="text-center">
              <p className="text-text-primary text-base font-medium">ASK {config.agent.name.toUpperCase()}</p>
              <p className="text-text-muted text-xs mt-1">{config.company.short_name} AI Advisor</p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleChipClick(q)}
                  className="px-3 py-1.5 text-xs text-text-secondary bg-gray-50 border border-border rounded-full hover:bg-brand-navy/5 hover:text-brand-navy hover:border-brand-navy/20 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center py-2 mb-2">
              <AgentStatus state={agentState} size={60} />
            </div>
            {messages.map((msg, i) => {
              const isThinkingMsg = msg.role === 'assistant' && isStreaming && i === messages.length - 1 && !msg.content
              return (
            <div key={msg.id || i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className={`flex-shrink-0 w-9 h-9 rounded-full overflow-hidden mt-0.5 ${isThinkingMsg ? 'agent-thinking' : ''}`}>
                  <Image
                    src={isThinkingMsg ? `${config.agent.avatar_path}thinking.png` : `${config.agent.avatar_path}hero-light.png`}
                    alt={config.agent.name}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}
              {isThinkingMsg ? (
                <div className="max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed bg-gray-50 border border-gray-100 text-text-muted rounded-bl-sm">
                  Thinking...
                </div>
              ) : (
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed relative ${
                  msg.role === 'user'
                    ? 'bg-brand-navy text-white rounded-br-sm'
                    : 'bg-gray-50 border border-gray-100 text-text-primary rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                    {isStreaming && i === messages.length - 1 && (
                      <span className="inline-flex gap-1 ml-1 mt-1">
                        <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse" />
                        <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse [animation-delay:300ms]" />
                      </span>
                    )}
                    {msg.citations && msg.citations.length > 0 && !isStreaming && (
                      <details className="mt-2 text-[11px]">
                        <summary className="cursor-pointer text-text-muted hover:text-brand-navy select-none list-none flex items-center gap-1">
                          <span className="inline-block w-3 h-3 text-center leading-none">▸</span>
                          <span>{msg.citations.length} source{msg.citations.length > 1 ? 's' : ''}</span>
                        </summary>
                        <ul className="mt-1.5 space-y-1 pl-1 border-l-2 border-gray-100">
                          {msg.citations.map((c, ci) => (
                            <li key={ci} className="text-text-muted leading-snug">
                              <span className="font-medium text-text-secondary">{c.source_title}</span>
                              {c.section_heading && <span className="text-text-muted"> — {c.section_heading}</span>}
                              {c.page_number && <span className="text-text-muted"> (p.{c.page_number})</span>}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                    {msg.content && !isStreaming && (
                      <button
                        onClick={() => playFullMessage(msg.content)}
                        className="absolute bottom-1 right-1 p-1 rounded transition-colors text-gray-300 hover:text-brand-navy"
                        title="Play audio"
                      >
                        <Volume2 size={11} />
                      </button>
                    )}
                  </>
                ) : (
                  <span>{msg.content}</span>
                )}
                {msg.created_at && (
                  <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/50 text-right' : 'text-text-muted'}`}>
                    {relativeTime(msg.created_at)}
                  </div>
                )}
              </div>
              )}
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center mt-0.5">
                  <User size={12} className="text-text-muted" />
                </div>
              )}
            </div>
              )
          })}
          </>
        )}
      </div>


      {/* Research indicator */}
      {(researchPending || researchLoading) && (
        <div className="flex items-center gap-2 px-4 py-2 text-xs italic animate-pulse" style={{ color: '#C5922E' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#C5922E' }} />
          {researchLoading ? 'Loading updated answer...' : 'Researching live data...'}
        </div>
      )}

      {/* Listening indicator */}
      {isListening && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-brand-navy">
          <span className="w-2 h-2 bg-brand-navy rounded-full animate-pulse" />
          Listening...
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-gray-100" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? 'Listening...' : `Ask ${config.agent.name}...`}
          disabled={isStreaming || isListening}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-[16px] sm:text-sm text-text-primary placeholder-text-muted outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition-colors disabled:opacity-50"
          autoFocus={fullPage}
        />
        {hasSpeechRecognition && (
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={isStreaming}
            className={`flex items-center justify-center w-11 h-11 sm:w-9 sm:h-9 rounded-full border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              isListening
                ? 'bg-brand-navy border-brand-navy text-white animate-pulse'
                : 'border-brand-navy/30 text-brand-navy hover:bg-brand-navy/5'
            }`}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            <Mic size={16} />
          </button>
        )}
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="flex items-center justify-center w-11 h-11 sm:w-9 sm:h-9 rounded-lg bg-brand-navy text-white hover:bg-brand-navy/90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
