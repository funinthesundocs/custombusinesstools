'use client'

import { useEffect, useState, useRef, useCallback, FormEvent } from 'react'
import Image from 'next/image'
import { Bot, X, Send, User, Mic, Volume2 } from 'lucide-react'
import { Toggle } from '@/components/Toggle'
import { GlassCard } from '@/components/GlassCard'
import { PageHeader } from '@/components/PageHeader'
import { AgentStatus, type AgentState } from '@/components/AgentStatus'
import { supabase } from '@/lib/supabase'
import config from '@/lib/siteConfig'

const DEAL_ID = config.supabase.project_id

/* ─── Types ─── */

type TabName = 'Configure' | 'Test'

interface SiteConfig {
  company: {
    name: string
    short_name: string
    tagline: string
    domain: string
  }
  agent: {
    name: string
    role: string
    personality: string
    systemPromptPath: string
  }
  voice: {
    provider: string
    voiceId: string
    model: string
    enabled?: boolean
  }
  rag: {
    matchCount: number
    similarityThreshold: number
    researchThreshold: number
    chunkMaxChars: number
    embeddingModel: string
    embeddingDimensions: number
    pinecone: { indexName: string }
  }
  market_data: {
    enabled: boolean
    weather_location: { name: string; latitude: number; longitude: number }
  }
}

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

/* ─── Chat helpers ─── */

const SUGGESTED_QUESTIONS = [
  `What are the key strengths of ${config.company.short_name}?`,
  'Summarize the target decision-maker\'s priorities',
  'What regulatory risks should we prepare for?',
  `What is ${config.company.short_name}'s leverage in this deal?`,
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

/* ─── Input class constant ─── */
const INPUT_CLASS = 'w-full bg-zinc-800/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[var(--color-primary)]'

/* ─── Component ─── */

const TABS: TabName[] = ['Configure', 'Test']

export default function AgentPage() {
  const [activeTab, setActiveTab] = useState<TabName>('Configure')

  /* ─── Config state ─── */
  const [config_, setConfig_] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [systemPromptContent, setSystemPromptContent] = useState('')
  const [systemPromptLoaded, setSystemPromptLoaded] = useState(false)
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [promptModalContent, setPromptModalContent] = useState('')

  // Identity
  const [agentName, setAgentName] = useState('')
  const [agentRole, setAgentRole] = useState('')
  const [agentPersonality, setAgentPersonality] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyShortName, setCompanyShortName] = useState('')
  const [companyTagline, setCompanyTagline] = useState('')
  const [domain, setDomain] = useState('')

  // Voice config
  const [cfgVoiceEnabled, setCfgVoiceEnabled] = useState(true)
  const [voiceId, setVoiceId] = useState('')
  const [voiceModel, setVoiceModel] = useState('')

  // Behavior
  const [autoResearch, setAutoResearch] = useState(false)
  const [marketEnabled, setMarketEnabled] = useState(false)
  const [weatherName, setWeatherName] = useState('')
  const [weatherLat, setWeatherLat] = useState(0)
  const [weatherLng, setWeatherLng] = useState(0)

  /* ─── Chat state ─── */
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false)
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null)
  const [chatVoiceEnabled, setChatVoiceEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const voiceEnabledRef = useRef(true)
  const speechRecognitionRef = useRef<any>(null)
  const audioQueueRef = useRef<AudioQueue | null>(null)
  const messageIdsRef = useRef<Set<string>>(new Set())
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const transcriptRef = useRef('')

  /* ─── Config helpers ─── */

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config')
      if (res.ok) {
        const data = await res.json() as SiteConfig
        setConfig_(data)
        setAgentName(data.agent?.name ?? '')
        setAgentRole(data.agent?.role ?? '')
        setAgentPersonality(data.agent?.personality ?? '')
        setCompanyName(data.company?.name ?? '')
        setCompanyShortName(data.company?.short_name ?? '')
        setCompanyTagline(data.company?.tagline ?? '')
        setDomain(data.company?.domain ?? '')
        setCfgVoiceEnabled(data.voice?.enabled !== false)
        setVoiceId(data.voice?.voiceId ?? '')
        setVoiceModel(data.voice?.model ?? '')
        setAutoResearch(false)
        setMarketEnabled(data.market_data?.enabled ?? false)
        setWeatherName(data.market_data?.weather_location?.name ?? '')
        setWeatherLat(data.market_data?.weather_location?.latitude ?? 0)
        setWeatherLng(data.market_data?.weather_location?.longitude ?? 0)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  const loadSystemPrompt = useCallback(async () => {
    if (systemPromptLoaded) return
    try {
      const res = await fetch('/api/admin/config?section=systemPrompt')
      if (res.ok) {
        const data = await res.json() as { content: string }
        setSystemPromptContent(data.content)
        setPromptModalContent(data.content)
        setSystemPromptLoaded(true)
      }
    } catch { /* ignore */ }
  }, [systemPromptLoaded])

  useEffect(() => { loadConfig() }, [loadConfig])

  useEffect(() => {
    if (activeTab === 'Configure') loadSystemPrompt()
  }, [activeTab, loadSystemPrompt])

  const saveConfig = async (partial: Record<string, unknown>) => {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    })
    if (res.ok) {
      showToast('Saved')
      await loadConfig()
    } else {
      showToast('Error saving', false)
    }
  }

  const saveAll = async () => {
    await saveConfig({
      agent: { name: agentName, role: agentRole, personality: agentPersonality },
      company: { name: companyName, short_name: companyShortName, tagline: companyTagline, domain },
      voice: { enabled: cfgVoiceEnabled, voiceId, model: voiceModel },
      market_data: {
        enabled: marketEnabled,
        weather_location: { name: weatherName, latitude: weatherLat, longitude: weatherLng },
      },
    })
  }

  const saveSystemPrompt = async () => {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPromptContent: promptModalContent }),
    })
    if (res.ok) {
      setSystemPromptContent(promptModalContent)
      showToast('System prompt saved')
      setShowPromptModal(false)
    } else {
      showToast('Error saving system prompt', false)
    }
  }

  const testVoice = async () => {
    const text = `Hello, I'm ${agentName}. How can I help you today?`
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.play()
        audio.onended = () => URL.revokeObjectURL(url)
      } else {
        showToast('TTS test failed', false)
      }
    } catch {
      showToast('TTS test failed', false)
    }
  }

  /* ─── Chat helpers ─── */

  // Preload agent images
  useEffect(() => {
    const agentPath = config.agent.avatar_path
    const preload = [
      `${agentPath}greeting.png`,
      `${agentPath}hero-light.png`,
      `${agentPath}hero-dark.png`,
      `${agentPath}thinking.png`,
    ]
    preload.forEach(src => {
      const img = new window.Image()
      img.src = src
    })
  }, [])

  // Load conversation history
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

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('agent_conversations_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_conversations', filter: `deal_id=eq.${DEAL_ID}` },
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
  }, [])

  // Speech recognition detection
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR) {
      speechRecognitionRef.current = SR
      setHasSpeechRecognition(true)
    }
  }, [])

  // Voice enabled ref sync
  useEffect(() => {
    voiceEnabledRef.current = chatVoiceEnabled
    if (!chatVoiceEnabled && audioQueueRef.current) {
      audioQueueRef.current.cancel()
      audioQueueRef.current = null
    }
  }, [chatVoiceEnabled])

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
      startSilenceTimer()
    }

    recognition.onerror = () => {
      clearSilenceTimer()
      setIsListening(false)
      transcriptRef.current = ''
    }

    recognition.onend = () => {
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

  // Derive agent visual state
  const lastMessage = messages[messages.length - 1]
  const isThinking = isStreaming && (!lastMessage || lastMessage.role !== 'assistant' || !lastMessage.content)
  const isTalking = (isStreaming && lastMessage?.role === 'assistant' && !!lastMessage.content) || isSpeaking
  const agentState: AgentState = isListening ? 'listening' : isThinking ? 'thinking' : isTalking ? 'talking' : 'idle'

  /* ─── Render ─── */

  if (loading) {
    return (
      <div className="page-enter flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">Loading config...</p>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${toast.ok ? 'bg-emerald-900 text-emerald-200 border border-emerald-700' : 'bg-red-900 text-red-200 border border-red-700'}`}>
          {toast.msg}
        </div>
      )}

      <PageHeader title="Agent" icon={Bot} />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-[var(--color-primary)] border-[var(--color-primary)]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ═══════════════════ CONFIGURE TAB ═══════════════════ */}
      {activeTab === 'Configure' && (
        <div className="space-y-5">
          {/* Identity */}
          <GlassCard hover={false} className="p-6 space-y-5">
            <h3 className="text-sm font-semibold text-zinc-200">Identity</h3>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Agent Name</label>
                <input className={INPUT_CLASS} value={agentName} onChange={e => setAgentName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Agent Role</label>
                <input className={INPUT_CLASS} value={agentRole} onChange={e => setAgentRole(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1.5">Personality / Tagline</label>
                <textarea
                  className={`${INPUT_CLASS} resize-none`}
                  rows={3}
                  value={agentPersonality}
                  onChange={e => setAgentPersonality(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Company Name</label>
                <input className={INPUT_CLASS} value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Company Short Name</label>
                <input className={INPUT_CLASS} value={companyShortName} onChange={e => setCompanyShortName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Company Tagline</label>
                <input className={INPUT_CLASS} value={companyTagline} onChange={e => setCompanyTagline(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Domain</label>
                <input className={INPUT_CLASS} value={domain} onChange={e => setDomain(e.target.value)} />
              </div>
            </div>
          </GlassCard>

          {/* System Prompt */}
          <GlassCard hover={false} className="p-6 space-y-5">
            <h3 className="text-sm font-semibold text-zinc-200">System Prompt</h3>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">System Prompt File Path</label>
              <input
                className={`${INPUT_CLASS} font-mono cursor-not-allowed opacity-60`}
                value={config_?.agent?.systemPromptPath ?? ''}
                readOnly
              />
              <p className="text-[10px] text-zinc-600 mt-1">Relative to repo root. Change in config.json if needed.</p>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">System Prompt Preview</label>
              <div className="bg-zinc-950 border border-white/10 rounded-lg p-3 h-32 overflow-y-auto font-mono text-xs text-zinc-400">
                {systemPromptContent ? systemPromptContent.slice(0, 400) + (systemPromptContent.length > 400 ? '...' : '') : <span className="text-zinc-600 italic">No system prompt file found at configured path.</span>}
              </div>
            </div>
            {systemPromptContent && (
              <button
                onClick={() => { setPromptModalContent(systemPromptContent); setShowPromptModal(true) }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 transition-colors"
              >
                Edit System Prompt
              </button>
            )}
          </GlassCard>

          {/* Voice */}
          <GlassCard hover={false} className="p-6 space-y-5">
            <h3 className="text-sm font-semibold text-zinc-200">Voice</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-200">Enable Voice</p>
                <p className="text-xs text-zinc-500">Allow text-to-speech responses</p>
              </div>
              <Toggle enabled={cfgVoiceEnabled} onChange={setCfgVoiceEnabled} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Voice ID</label>
                <input className={`${INPUT_CLASS} font-mono`} value={voiceId} onChange={e => setVoiceId(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Voice Model</label>
                <input className={`${INPUT_CLASS} font-mono`} value={voiceModel} onChange={e => setVoiceModel(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={testVoice}
                className="px-4 py-2 rounded-md text-sm font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 transition-colors"
              >
                Test Voice
              </button>
            </div>
          </GlassCard>

          {/* Behavior Toggles */}
          <GlassCard hover={false} className="p-6 space-y-0">
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">Auto-Research</p>
                <p className="text-xs text-zinc-500">Automatically research knowledge gaps when RAG confidence is low</p>
              </div>
              <Toggle enabled={autoResearch} onChange={setAutoResearch} />
            </div>

            <div className="flex items-center justify-between py-4 border-t border-white/5">
              <div>
                <p className="text-sm font-medium text-zinc-200">Market Data</p>
                <p className="text-xs text-zinc-500">Include live market & weather data in context</p>
              </div>
              <Toggle enabled={marketEnabled} onChange={setMarketEnabled} />
            </div>

            {marketEnabled && (
              <div className="grid grid-cols-3 gap-4 pt-4 pb-2 border-t border-white/5">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Weather Location</label>
                  <input className={INPUT_CLASS} value={weatherName} onChange={e => setWeatherName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Latitude</label>
                  <input type="number" step="0.0001" className={`${INPUT_CLASS} font-mono`} value={weatherLat} onChange={e => setWeatherLat(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Longitude</label>
                  <input type="number" step="0.0001" className={`${INPUT_CLASS} font-mono`} value={weatherLng} onChange={e => setWeatherLng(Number(e.target.value))} />
                </div>
              </div>
            )}
          </GlassCard>

          {/* Save All */}
          <button
            onClick={saveAll}
            className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[var(--color-primary)] text-black hover:opacity-90 transition-opacity"
          >
            Save All Settings
          </button>
        </div>
      )}

      {/* ═══════════════════ TEST TAB ═══════════════════ */}
      {activeTab === 'Test' && (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 14rem)' }}>
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <p className="text-xs text-zinc-500">Shared conversation — visible to all team members</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Voice</span>
              <Volume2 size={14} className={isSpeaking ? 'text-[var(--color-primary)] animate-pulse' : 'text-zinc-500'} />
              <Toggle enabled={chatVoiceEnabled} onChange={setChatVoiceEnabled} />
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
                <AgentStatus state={agentState} size={80} />
                <div className="text-center">
                  <p className="text-zinc-300 text-lg font-medium">Ask anything about the deal</p>
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
                  <AgentStatus state={agentState} size={60} />
                </div>
                {messages.map((msg, i) => {
                  const isThinkingMsg = msg.role === 'assistant' && isStreaming && i === messages.length - 1 && !msg.content
                  return (
                    <div key={msg.id || i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className={`flex-shrink-0 w-9 h-9 rounded-full overflow-hidden mt-0.5 ${isThinkingMsg ? 'agent-thinking' : ''}`}>
                          <Image
                            src={isThinkingMsg ? `${config.agent.avatar_path}thinking.png` : `${config.agent.avatar_path}hero-dark.png`}
                            alt={config.agent.name}
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
          <form onSubmit={handleSubmit} className="flex items-center gap-3 pt-4 border-t border-white/5">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the deal..."
              disabled={isStreaming}
              className="flex-1 bg-zinc-800/60 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors disabled:opacity-50"
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
      )}

      {/* System Prompt Edit Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-[800px] max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <p className="text-sm font-medium text-zinc-200">Edit System Prompt</p>
              <button onClick={() => setShowPromptModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <textarea
                className="w-full h-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-zinc-300 font-mono focus:outline-none focus:border-[var(--color-primary)] resize-none"
                value={promptModalContent}
                onChange={e => setPromptModalContent(e.target.value)}
                style={{ minHeight: '400px' }}
              />
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-zinc-800">
              <button onClick={() => setShowPromptModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">
                Cancel
              </button>
              <button
                onClick={saveSystemPrompt}
                className="px-4 py-2 rounded-md text-sm font-medium bg-[var(--color-primary)] text-black hover:opacity-90 transition-opacity"
              >
                Save System Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
