'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ChevronDown, ArrowRight, Handshake, Users, MapPin } from 'lucide-react'
import { presentationSections, heroMetrics, timelinePhases, riskItems, visionContent, askContent, openingContent } from '@/lib/content'
import config from '@/lib/siteConfig'

/* ------------------------------------------------------------------ */
/* PRESENTATION — 8-section scroll-snap, projector-ready               */
/* ------------------------------------------------------------------ */

const sections = presentationSections.map(s => s.shortTitle)

function CountUp({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [value, setValue] = useState('0')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const numericPart = target.replace(/[^0-9.]/g, '')
        const num = parseFloat(numericPart)
        if (isNaN(num)) { setValue(target); return }
        const duration = 1500
        const steps = 40
        const stepTime = duration / steps
        let step = 0
        const interval = setInterval(() => {
          step++
          const progress = step / steps
          const current = num * progress
          if (target.includes(',')) {
            setValue(Math.round(current).toLocaleString())
          } else if (target.includes('.')) {
            setValue(current.toFixed(target.split('.')[1]?.replace(/[^0-9]/g, '').length || 0))
          } else {
            setValue(Math.round(current).toString())
          }
          if (step >= steps) {
            clearInterval(interval)
            setValue(target.replace(suffix, '').trim())
          }
        }, stepTime)
        observer.disconnect()
        return () => clearInterval(interval)
      }
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, suffix])

  return (
    <div ref={ref} className="font-mono font-bold text-3xl min-[400px]:text-5xl md:text-7xl text-white leading-none">
      {value}<span className="text-brand-gold">{suffix}</span>
    </div>
  )
}

function RiskRow({ status, title, desc }: { status: 'green' | 'amber'; title: string; desc: string }) {
  const isGreen = status === 'green'
  return (
    <div className="flex items-start gap-5 py-5">
      <div className="flex-shrink-0 mt-1">
        <div className={`w-4 h-4 rounded-full ${isGreen ? 'bg-success shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'}`}>
          {isGreen && (
            <div className="w-4 h-4 rounded-full bg-success animate-pulse" />
          )}
        </div>
      </div>
      <div>
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <p className="text-white/50 text-sm mt-1">{desc}</p>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IconMap: Record<string, any> = {
  Handshake,
  Users,
  MapPin,
}

export default function PresentationPage() {
  const [currentSection, setCurrentSection] = useState(0)
  const [online, setOnline] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOnline(navigator.onLine)
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const sectionEls = container.querySelectorAll('[data-section]')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = parseInt((entry.target as HTMLElement).dataset.section || '0')
          setCurrentSection(idx)
        }
      })
    }, { root: container, threshold: 0.5 })
    sectionEls.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const container = containerRef.current
    if (!container) return
    const sectionEls = container.querySelectorAll('[data-section]')
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault()
      const next = Math.min(currentSection + 1, sections.length - 1)
      sectionEls[next]?.scrollIntoView({ behavior: 'smooth' })
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = Math.max(currentSection - 1, 0)
      sectionEls[prev]?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentSection])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      {/* Hide default nav/footer for presentation */}
      <style>{`nav, footer { display: none !important; }`}</style>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/10">
        <div
          className="h-full bg-brand-gold transition-all duration-500"
          style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
        />
      </div>

      {/* Section counter */}
      <div className="fixed bottom-6 right-6 z-50 font-mono text-sm text-white/60 bg-black/40 backdrop-blur rounded-full px-3 py-1" style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}>
        {currentSection + 1} / {sections.length}
      </div>

      {/* Scroll-snap container */}
      <div
        ref={containerRef}
        className="h-[100dvh] overflow-y-auto snap-y snap-mandatory"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {/* SECTION 1 — OPENING */}
        <section data-section="0" className="min-h-screen flex items-center justify-center snap-start relative" style={{ backgroundColor: config.brand.dark }}>
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
            <h1 className="font-playfair font-bold text-[clamp(1.75rem,5vw,4.5rem)] text-white mb-4 leading-tight">
              {openingContent.headline}
            </h1>
            <p className="text-brand-gold text-xl md:text-2xl font-medium tracking-wide mb-16">
              {config.company.name}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {heroMetrics.map(m => (
                <div key={m.label} className="text-center">
                  <CountUp target={m.value} suffix={m.suffix} />
                  <div className="text-white/40 text-xs uppercase tracking-[0.2em] mt-3">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
            <ChevronDown className="text-white/30" size={28} />
          </div>
        </section>

        {/* SECTION 2 — THE OPPORTUNITY */}
        <section data-section="1" className="min-h-screen flex items-center snap-start bg-white">
          <div className="content-wrapper w-full py-16">
            <h2 className="font-playfair text-3xl md:text-5xl font-bold text-text-primary text-center mb-12">
              The Opportunity
            </h2>
            <div className="text-center py-20 text-gray-400">
              Configure opportunity content for your domain
            </div>
          </div>
        </section>

        {/* SECTION 3 — THE ALIGNMENT */}
        <section data-section="2" className="min-h-screen flex items-center justify-center snap-start relative" style={{ backgroundColor: config.brand.dark }}>
          <div className="content-wrapper w-full py-16">
            <h2 className="font-playfair text-3xl md:text-5xl font-bold text-white text-center mb-10">
              The Alignment
            </h2>
            <div className="text-center py-20 text-white/30">
              Configure alignment content for your domain
            </div>
          </div>
        </section>

        {/* SECTION 4 — THE PROOF */}
        <section data-section="3" className="min-h-screen flex items-center justify-center snap-start relative" style={{ backgroundColor: config.brand.dark }}>
          <div className="content-wrapper w-full py-16">
            <h2 className="font-playfair text-3xl md:text-5xl font-bold text-white text-center mb-10">
              The Proof
            </h2>
            <div className="text-center py-20 text-white/30">
              Configure proof/evidence content for your domain
            </div>
          </div>
        </section>

        {/* SECTION 5 — THE PLAN */}
        <section data-section="4" className="min-h-screen flex items-center snap-start bg-white">
          <div className="content-wrapper w-full py-16">
            <h2 className="font-playfair text-3xl md:text-5xl font-bold text-text-primary text-center mb-16">
              The Plan
            </h2>
            <div className="max-w-5xl mx-auto">
              {/* Desktop horizontal timeline */}
              <div className="hidden md:block relative">
                <div className="absolute top-7 left-[10%] right-[10%] h-0.5 bg-border" />
                <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${timelinePhases.length}, 1fr)` }}>
                  {timelinePhases.map((p) => (
                    <div key={p.phase} className="text-center relative">
                      <div className="w-14 h-14 rounded-full bg-brand-navy text-white flex items-center justify-center font-mono font-bold text-lg mx-auto mb-4 relative z-10 shadow-lg">
                        {p.phase}
                      </div>
                      <h3 className="font-bold text-text-primary text-sm mb-2">{p.title}</h3>
                      <p className="text-text-secondary text-xs leading-relaxed">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile vertical timeline */}
              <div className="md:hidden space-y-6">
                {timelinePhases.map(p => (
                  <div key={p.phase} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-navy text-white flex items-center justify-center font-mono font-bold flex-shrink-0">
                      {p.phase}
                    </div>
                    <div className="bg-bg-surface rounded-xl p-5 flex-1">
                      <h3 className="font-bold text-text-primary">{p.title}</h3>
                      <p className="text-text-secondary text-sm mt-1">{p.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center text-text-muted text-sm mt-10 font-medium">
                Phase 1 commitment only. Decision gates at every stage.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 6 — THE PROTECTION */}
        <section data-section="5" className="min-h-screen flex items-center snap-start relative" style={{ backgroundColor: config.brand.dark }}>
          <div className="relative z-10 content-wrapper w-full py-16">
            <h2 className="font-playfair text-3xl md:text-5xl font-bold text-white text-center mb-4">
              The Protection
            </h2>
            <p className="text-white/40 text-lg text-center mb-16 max-w-2xl mx-auto">
              We have already thought about everything you are about to ask
            </p>
            <div className="max-w-3xl mx-auto divide-y divide-white/10">
              {riskItems.map((item, i) => (
                <RiskRow key={i} status={item.status} title={item.title} desc={item.description} />
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 7 — THE VISION */}
        <section data-section="6" className="min-h-screen flex items-center justify-center snap-start relative" style={{ backgroundColor: config.brand.dark }}>
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <h2 className="font-playfair font-bold text-4xl md:text-6xl text-white mb-6 leading-tight">
              {visionContent.headline}
            </h2>
            <p className="text-white/60 text-xl mt-8">
              {visionContent.subheadline}
            </p>
          </div>
        </section>

        {/* SECTION 8 — THE ASK */}
        <section data-section="7" className="min-h-screen flex items-center snap-start bg-white">
          <div className="content-wrapper w-full text-center py-16">
            <h2 className="font-playfair font-bold text-4xl md:text-6xl text-brand-navy mb-16">
              {askContent.headline}
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
              {askContent.items.map(item => {
                const Icon = IconMap[item.icon] || Handshake
                return (
                  <div key={item.label} className="bg-bg-surface rounded-xl p-8">
                    <Icon className="text-brand-gold mx-auto mb-4" size={32} />
                    <h3 className="font-semibold text-text-primary text-lg">{item.label}</h3>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              {online && (
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-brand-navy text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:bg-brand-navy/90 text-[15px]"
                >
                  Get In Touch
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
