'use client'

import { AIChat } from '@/components/AIChat'

export default function AdvisorPage() {
  return (
    <>
      {/* Hide nav/footer for clean advisor experience */}
      <style>{`nav, footer { display: none !important; }`}</style>
      <AIChat fullPage />
    </>
  )
}
