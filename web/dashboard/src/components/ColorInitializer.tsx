'use client'

import { useEffect } from 'react'
import { getStoredColor, setStoredColor } from '@/lib/colors'

export function ColorInitializer() {
  useEffect(() => {
    const color = getStoredColor()
    setStoredColor(color)
  }, [])

  return null
}
