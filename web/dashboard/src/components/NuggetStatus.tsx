'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import config from '@/lib/siteConfig'

export type NuggetState = 'idle' | 'listening' | 'thinking' | 'talking'

interface NuggetStatusProps {
  state: NuggetState
  size?: number
}

const agentPath = config.agent.avatar_path

const IMAGE_MAP: Record<NuggetState, string> = {
  idle: `${agentPath}greeting.png`,
  listening: `${agentPath}hero-dark.png`,
  thinking: `${agentPath}thinking.png`,
  talking: `${agentPath}hero-dark.png`,
}

const LABEL_MAP: Record<NuggetState, string> = {
  idle: 'Ask me anything',
  listening: 'Listening...',
  thinking: 'Thinking...',
  talking: 'Speaking...',
}

const ANIMATION_MAP: Record<NuggetState, string> = {
  idle: '',
  listening: 'nugget-listening',
  thinking: 'nugget-thinking',
  talking: 'nugget-talking',
}

export function NuggetStatus({ state, size = 80 }: NuggetStatusProps) {
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
        {(Object.keys(IMAGE_MAP) as NuggetState[]).map(s => (
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
          />
        ))}
      </div>
      <span className="text-[11px] text-zinc-500 font-medium tracking-wide">
        {LABEL_MAP[state]}
      </span>
    </div>
  )
}
