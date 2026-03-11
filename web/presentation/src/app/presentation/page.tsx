'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, AlertTriangle, ArrowRight, ChevronDown, Handshake, Users, MapPin } from 'lucide-react'

/* ------------------------------------------------------------------ */
/* PRESENTATION — 8-section scroll-snap, projector-ready               */
/* Gemini images ARE the slides. No text overlaid on baked-in content. */
/* ------------------------------------------------------------------ */

const sections = [
  'Opening', 'The Opportunity', 'The Alignment', 'The Proof',
  'The Plan', 'The Protection', 'The Vision', 'The Ask',
]

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
        {/* ============================================================ */}
        {/* SECTION 1 — OPENING                                          */}
        {/* Dark + topo texture + counting metrics                       */}
        {/* ============================================================ */}
        <section data-section="0" className="min-h-screen flex items-center justify-center snap-start relative bg-[#0C1926]">
          <Image
            src="/images/generated/topo-texture-dark.webp"
            alt=""
            fill
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
            <h1 className="font-playfair font-bold text-[clamp(1.75rem,5vw,4.5rem)] text-white mb-4 leading-tight">
              A Partnership Built for This Moment
            </h1>
            <p className="text-brand-gold text-xl md:text-2xl font-medium tracking-wide mb-16">
              Genluiching Mining Corporation
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {[
                { target: '5,906', suffix: ' ha', label: 'Concession' },
                { target: '9', suffix: '', label: 'Labs' },
                { target: '8', suffix: '', label: 'Core Samples' },
                { target: '493', suffix: 'm', label: 'Drilled' },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <CountUp target={m.target} suffix={m.suffix} />
                  <div className="text-white/40 text-xs uppercase tracking-[0.2em] mt-3">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
            <ChevronDown className="text-white/30" size={28} />
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 2 — THE OPPORTUNITY                                  */}
        {/* Three Gemini mineral images displayed LARGE as cards          */}
        {/* Images have baked-in text — DO NOT overlay                    */}
        {/* ============================================================ */}
        <section data-section="1" className="min-h-screen flex items-center snap-start bg-white">
          <div className="content-wrapper w-full py-16">
            <h2 className="font-playfair text-3xl md:text-5xl font-bold text-text-primary text-center mb-12">
              The Opportunity
            </h2>
            <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto mb-12">
              {[
                { src: '/images/generated/iron-hero-data.webp', alt: 'Iron Ore — 67.31% Fe, POSCO Confirmed' },
                { src: '/images/generated/copper-hero-data.webp', alt: 'Copper — 39.5% Cu, Near-Concentrate Grade' },
                { src: '/images/generated/gold-hero-data.webp', alt: 'Gold — 20.35 g/t Au, Highest Fire Assay' },
              ].map((img, i) => (
                <div
                  key={img.src}
                  className="relative rounded-2xl overflow-hidden shadow-lg aspect-[16/10]"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="font-playfair text-2xl md:text-3xl font-bold text-text-primary">
                21.6 million metric tons. From less than 9% explored.
              </p>
              <p className="text-text-muted mt-2">
                518 hectares explored of a 5,906-hectare concession
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 3 — THE ALIGNMENT                                    */}
        {/* partnership-ecosystem.png IS the slide                        */}
        {/* ============================================================ */}
        <section data-section="2" className="min-h-screen flex items-center justify-center snap-start bg-[#0C1926] relative">
          <div className="content-wrapper w-full py-16">
            <h2 className="font-playfair text-3xl md:text-5xl font-bold text-white text-center mb-10">
              The Alignment
            </h2>
            <div className="max-w-5xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/generated/partnership-ecosystem.webp"
                  alt="GMC and Strategic Partner — complementary capabilities forming the natural next step"
                  width={1920}
                  height={1080}
                  className="w-full h-auto"
                  sizes="(min-width: 1024px) 80vw, 100vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 4 — THE PROOF                                        */}
        {/* cross-section-infographic.png fills viewport                  */}
        {/* ============================================================ */}
        <section data-section="3" className="min-h-screen flex items-center justify-center snap-start bg-[#0C1926] relative">
          <div className="content-wrapper w-full py-16">
            <h2 className="font-playfair text-3xl md:text-5xl font-bold text-white text-center mb-10">
              The Proof
            </h2>
            <div className="max-w-6xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/generated/cross-section-infographic.webp"
                  alt="Geological deposit cross-section — 8 core samples, iron oxide cap, transition zone, sulfide zone, porphyry target"
                  width={1920}
                  height={1080}
                  className="w-full h-auto"
                  sizes="100vw"
                />
              </div>
              <p className="text-white/30 text-xs text-center mt-4 italic">
                Based on SGECS geological assessment filed with MGB Region XI, June 2025
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 5 — THE PLAN                                         */}
        {/* 5-phase timeline with decision gates                         */}
        {/* ============================================================ */}
        <section data-section="4" className="min-h-screen flex items-center snap-start bg-white">
          <div className="content-wrapper w-full py-16">
            <h2 className="font-playfair text-3xl md:text-5xl font-bold text-text-primary text-center mb-16">
              The Plan
            </h2>
            <div className="max-w-5xl mx-auto">
              {/* Desktop horizontal timeline */}
              <div className="hidden md:block relative">
                {/* Connecting line */}
                <div className="absolute top-7 left-[10%] right-[10%] h-0.5 bg-border" />
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { phase: 1, title: 'Exploration Partnership', desc: 'Confirm copper at depth. Ship first vessel.' },
                    { phase: 2, title: 'Feasibility Study', desc: 'JORC-compliant resource estimate.' },
                    { phase: 3, title: 'Permitting', desc: 'ECC. Development permits.' },
                    { phase: 4, title: 'Plant Construction', desc: 'Processing facility. AAAA capability.' },
                    { phase: 5, title: 'Production', desc: 'Commercial operations. Recurring revenue.' },
                  ].map((p) => (
                    <div key={p.phase} className="text-center relative">
                      <div className="w-14 h-14 rounded-full bg-brand-navy text-white flex items-center justify-center font-mono font-bold text-lg mx-auto mb-4 relative z-10 shadow-lg">
                        {p.phase}
                      </div>
                      <h3 className="font-bold text-text-primary text-sm mb-2">{p.title}</h3>
                      <p className="text-text-secondary text-xs leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
                {/* Decision gates */}
                <div className="flex justify-between mt-6 px-[15%]">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="text-center">
                      <div className="w-3 h-3 rotate-45 bg-brand-gold mx-auto mb-1" />
                      <span className="text-brand-gold text-[10px] uppercase tracking-widest font-semibold">Evaluate → Commit</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile vertical timeline */}
              <div className="md:hidden space-y-6">
                {[
                  { phase: 1, title: 'Exploration Partnership', desc: 'Confirm copper at depth. Ship first vessel.' },
                  { phase: 2, title: 'Feasibility Study', desc: 'JORC-compliant resource estimate.' },
                  { phase: 3, title: 'Permitting', desc: 'ECC. Development permits.' },
                  { phase: 4, title: 'Plant Construction', desc: 'Processing facility. AAAA capability.' },
                  { phase: 5, title: 'Production', desc: 'Commercial operations. Recurring revenue.' },
                ].map(p => (
                  <div key={p.phase} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-navy text-white flex items-center justify-center font-mono font-bold flex-shrink-0">
                      {p.phase}
                    </div>
                    <div className="bg-bg-surface rounded-xl p-5 flex-1">
                      <h3 className="font-bold text-text-primary">{p.title}</h3>
                      <p className="text-text-secondary text-sm mt-1">{p.desc}</p>
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

        {/* ============================================================ */}
        {/* SECTION 6 — THE PROTECTION                                   */}
        {/* Risk status rows on dark + topo                              */}
        {/* ============================================================ */}
        <section data-section="5" className="min-h-screen flex items-center snap-start relative bg-[#0C1926]">
          <Image
            src="/images/generated/topo-texture-dark.webp"
            alt=""
            fill
            className="object-cover opacity-20"
            sizes="100vw"
          />
          <div className="relative z-10 content-wrapper w-full py-16">
            <h2 className="font-playfair text-3xl md:text-5xl font-bold text-white text-center mb-4">
              The Protection
            </h2>
            <p className="text-white/40 text-lg text-center mb-16 max-w-2xl mx-auto">
              We have already thought about everything you are about to ask
            </p>
            <div className="max-w-3xl mx-auto divide-y divide-white/10">
              <RiskRow status="green" title="FPIC Approval" desc="Approved by indigenous communities. 60% Lumad workforce. Years of genuine partnership." />
              <RiskRow status="green" title="MGB Operator" desc="Director ORDER confirming GMC as authorized operator of MPSA 251(A)-2007-XI." />
              <RiskRow status="green" title="Legal Standing" desc="Final court ruling on DMC-GMC dispute. Permanently resolved as a matter of law. Cannot be refiled." />
              <RiskRow status="amber" title="Copper at Depth" desc="Sulfide minerals confirmed at 60–65m. Eight core samples validate the porphyry model. Phase 1 drilling priority." />
              <RiskRow status="amber" title="Mercury Trace" desc="Identified proactively. 1,245–1,429 mg/kg in ore samples. Minamata Convention compliance required. Solvable engineering challenge." />
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 7 — THE VISION                                       */}
        {/* hero-landscape-enhanced.png full bleed                       */}
        {/* ============================================================ */}
        <section data-section="6" className="min-h-screen flex items-center justify-center snap-start relative">
          <Image
            src="/images/generated/hero-landscape-enhanced.webp"
            alt="Davao Oriental — tropical mountains at golden hour"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <h2 className="font-playfair font-bold text-4xl md:text-6xl text-white mb-6 leading-tight">
              Building for Business to Prosper<br className="hidden md:block" />and Communities to Thrive
            </h2>
            <p className="text-white/60 text-xl mt-8">
              <span className="font-mono font-bold text-white text-3xl">32</span> years remaining on MPSA.
              A multi-generational partnership.
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 8 — THE ASK                                          */}
        {/* Clean white, extreme negative space                          */}
        {/* ============================================================ */}
        <section data-section="7" className="min-h-screen flex items-center snap-start bg-white">
          <div className="content-wrapper w-full text-center py-16">
            <h2 className="font-playfair font-bold text-4xl md:text-6xl text-brand-navy mb-16">
              The Next Step
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
              {[
                { Icon: Handshake, label: 'Phase 1 exploration partnership' },
                { Icon: Users, label: 'Technical team introduction' },
                { Icon: MapPin, label: 'Joint site assessment' },
              ].map(item => (
                <div key={item.label} className="bg-bg-surface rounded-xl p-8">
                  <item.Icon className="text-brand-gold mx-auto mb-4" size={32} />
                  <h3 className="font-semibold text-text-primary text-lg">{item.label}</h3>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              {online && (
                <Link
                  href="/advisor"
                  className="inline-flex items-center gap-2 bg-brand-navy text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:bg-brand-navy/90 text-[15px]"
                >
                  Ask Our AI Advisor
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
            <Image
              src="/images/scraped/gmc/cropped-GMC-Logo-2-270x270.png"
              alt="GMC"
              width={48}
              height={48}
              className="mx-auto opacity-30"
            />
          </div>
        </section>
      </div>
    </>
  )
}
