'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, MessageCircle } from 'lucide-react'
import { useAIAssistant } from '@/contexts/AIAssistantContext'

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/assets', label: 'Assets' },
  { href: '/presentation', label: 'Presentation' },
  { href: '/team', label: 'Team' },
  { href: '/csr', label: 'CSR' },
  { href: '/contact', label: 'Contact' },
]

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { toggle: toggleAI } = useAIAssistant()

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Close mobile menu on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [mobileOpen])

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/images/scraped/gmc/cropped-GMC-Logo-2-270x270.png"
              alt="GMC"
              width={46}
              height={46}
            />
            <div className="flex flex-col">
              <span className="font-playfair font-bold text-[22px] leading-tight text-brand-navy">
                GMC
              </span>
              <span className="hidden sm:block text-[14px] tracking-[0.15em] uppercase leading-tight text-text-muted">
                Genluiching Mining
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-[16px] font-medium tracking-wide transition-all duration-300 rounded-lg text-text-primary hover:text-brand-navy hover:bg-brand-navy/5"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/presentation"
              className="ml-3 px-5 py-2 text-[16px] font-semibold tracking-wide rounded-full transition-all duration-300 bg-[#0A0F6B] text-white hover:bg-[#0A0F6B]/90"
            >
              View Presentation
            </Link>
            <button
              onClick={toggleAI}
              className="ml-2 flex items-center gap-1.5 px-4 py-2 text-[16px] font-semibold tracking-wide rounded-full transition-all duration-300 bg-brand-gold text-white hover:bg-brand-gold/90"
              aria-label="Ask Nugget"
            >
              <MessageCircle size={14} />
              Ask Nugget
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2 -mr-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="text-text-primary" size={24} />
            ) : (
              <Menu className="text-text-primary" size={24} />
            )}
          </button>
        </div>

        {/* Mobile Fullscreen Menu */}
        <div className={`lg:hidden fixed inset-0 top-[72px] bg-white transition-all duration-300 ${
          mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="px-6 py-8 flex flex-col gap-1 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-text-primary text-lg font-medium py-4 min-h-[48px] flex items-center border-b border-border/50 transition-colors hover:text-brand-navy"
                onClick={() => setMobileOpen(false)}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/presentation"
              className="mt-6 bg-[#0A0F6B] text-white text-center py-4 min-h-[48px] flex items-center justify-center rounded-xl font-semibold text-[15px]"
              onClick={() => setMobileOpen(false)}
            >
              View Presentation
            </Link>
            <button
              onClick={() => { setMobileOpen(false); toggleAI() }}
              className="mt-3 bg-brand-gold text-white text-center py-4 min-h-[48px] rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} />
              Ask Nugget
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
