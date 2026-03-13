'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import config from '@/lib/siteConfig'

export type AgentState = 'idle' | 'listening' | 'thinking' | 'talking'

interface AgentStatusProps {
  state: AgentState
  size?: number
}

const agentPath = config.agent.avatar_path

const IMAGE_MAP: Record<AgentState, string> = {
  idle: `${agentPath}greeting.png`,
  listening: `${agentPath}hero-light.png`,
  thinking: `${agentPath}thinking.png`,
  talking: `${agentPath}hero-light.png`,
}

const LABEL_MAP: Record<AgentState, string> = {
  idle: 'Ask me anything',
  listening: 'Listening...',
  thinking: 'Thinking...',
  talking: 'Speaking...',
}

const ANIMATION_MAP: Record<AgentState, string> = {
  idle: '',
  listening: 'agent-listening',
  thinking: 'agent-thinking',
  talking: 'agent-talking',
}

export function AgentStatus({ state, size = 80 }: AgentStatusProps) {
  // Preload all images on mount
  useEffect(() => {
    Object.values(IMAGE_MAP).forEach(src => {
      const img = new window.Image()
      img.src = src
    })
  }, [])

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative rounded-full ${ANIMATION_MAP[state]}`}
        style={{ width: size, height: size }}
      >
        {/* Render all images, crossfade via opacity */}
        {(Object.keys(IMAGE_MAP) as AgentState[]).map(s => (
          <Image
            key={s}
            src={IMAGE_MAP[s]}
            alt={config.agent.name}
            width={size}
            height={size}
            className={`absolute inset-0 rounded-full object-cover transition-opacity duration-300 ${
              state === s ? 'opacity-100' : 'opacity-0'
            }`}
            priority={s === 'idle'}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ))}
      </div>
      <span className="text-[11px] text-text-muted font-medium tracking-wide">
        {LABEL_MAP[state]}
      </span>
    </div>
  )
}
