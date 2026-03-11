'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface AIAssistantContextType {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const AIAssistantContext = createContext<AIAssistantContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
})

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return (
    <AIAssistantContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </AIAssistantContext.Provider>
  )
}

export function useAIAssistant() {
  return useContext(AIAssistantContext)
}
