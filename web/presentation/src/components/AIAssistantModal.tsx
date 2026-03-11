'use client'

import { useEffect } from 'react'
import { useAIAssistant } from '@/contexts/AIAssistantContext'
import { AIChat } from './AIChat'

export function AIAssistantModal() {
  const { isOpen, close } = useAIAssistant()

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKey)
      return () => window.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, close])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[9999] w-full sm:max-w-[420px] bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Chat fills the panel — close button passed via prop */}
        {isOpen && <AIChat onClose={close} />}
      </div>
    </>
  )
}
