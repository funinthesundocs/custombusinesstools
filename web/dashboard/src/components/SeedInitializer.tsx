'use client'

import { useEffect, useRef } from 'react'

export function SeedInitializer() {
  const seeded = useRef(false)

  useEffect(() => {
    if (seeded.current) return
    seeded.current = true

    fetch('/api/seed', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.dealId) {
          localStorage.setItem('kop-deal-id', data.dealId)
        }
      })
      .catch(console.error)
  }, [])

  return null
}
