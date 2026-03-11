'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

export type EvidenceType = 'image'

export interface EvidenceData {
  title: string
  type: EvidenceType
  src?: string
  imageWidth?: number
  imageHeight?: number
  caption: string
  source: string
}

interface EvidenceModalProps {
  evidence: EvidenceData | null
  onClose: () => void
}

export function EvidenceModal({ evidence, onClose }: EvidenceModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (!evidence) return
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [evidence, handleKeyDown])

  if (!evidence) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black" />

      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        <X size={20} className="text-white" />
      </button>

      {evidence.src && (
        <div className="relative z-[1] flex items-center justify-center w-full h-full p-4 md:p-8" onClick={e => e.stopPropagation()}>
          <Image
            src={evidence.src}
            alt={evidence.title}
            width={evidence.imageWidth || 1920}
            height={evidence.imageHeight || 1080}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            sizes="100vw"
            priority
          />
        </div>
      )}
    </div>
  )
}
