'use client'

import { useRef, useEffect } from 'react'

interface AnimatedMachineProps {
  src: string
  poster?: string
}

export function AnimatedMachine({ src, poster }: AnimatedMachineProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Ensure autoplay works
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked — will play on first interaction
      })
    }
  }, [])

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover"
      style={{ display: 'block' }}
    />
  )
}
