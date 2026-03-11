'use client'

import { useEffect } from 'react'
import Image from 'next/image'

export type NuggetState = 'idle' | 'listening' | 'thinking' | 'talking'

interface NuggetStatusProps {
  state: NuggetState
  size?: number
}

const IMAGE_MAP: Record<NuggetState, string> = {
  idle: '/images/nugget/nugget-greeting.png',
  listening: '/images/nugget/nugget-hero-light.png',
  thinking: '/images/nugget/nugget-thinking.png',
  talking: '/images/nugget/nugget-hero-light.png',
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

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative rounded-full ${ANIMATION_MAP[state]}`}
        style={{ width: size, height: size }}
      >
        {/* Render all images, crossfade via opacity */}
        {(Object.keys(IMAGE_MAP) as NuggetState[]).map(s => (
          <Image
            key={s}
            src={IMAGE_MAP[s]}
            alt="Nugget"
            width={size}
            height={size}
            className={`absolute inset-0 rounded-full object-cover transition-opacity duration-300 ${
              state === s ? 'opacity-100' : 'opacity-0'
            }`}
            priority={s === 'idle'}
          />
        ))}
      </div>
      <span className="text-[11px] text-text-muted font-medium tracking-wide">
        {LABEL_MAP[state]}
      </span>
    </div>
  )
}
