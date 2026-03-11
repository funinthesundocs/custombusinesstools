'use client'

import Image from 'next/image'
import { CheckCircle } from 'lucide-react'
import { aboutContent } from '@/lib/content'

/* ------------------------------------------------------------------ */
/* ABOUT PAGE — Timeline infographic + governance credentials          */
/* ------------------------------------------------------------------ */

const values = [
  { title: 'Bringing Precious Ores to the Light', desc: 'Geological wealth creates lasting prosperity for communities, partners, and the nation.' },
  { title: 'Caring for Creation', desc: 'Progressive rehabilitation from day one. Mining that protects the environment, not just extracts from it.' },
  { title: 'Work of Human Hands', desc: '60% indigenous Lumad workforce. FPIC approved. Development that serves the people who live on the land.' },
]

const governance = [
  'SEC-registered corporation (2012)',
  'Active Mati and Makati business permits (2026)',
  'Bureau of Customs exporter registration (February 2026)',
  'PHILEXPORT membership (current through December 2026)',
  'All filings current with MGB Region XI',
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/generated/operations-cinematic.webp"
          alt="Mining operations at GMC"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="relative z-10 text-center px-6">
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            About GMC
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto">
            Fifteen years of building knowledge, community trust, and geological certainty
          </p>
        </div>
      </section>

      {/* Company overview */}
      <section className="section-padding">
        <div className="content-wrapper max-w-4xl mx-auto">
          <p data-aos="fade-up" className="text-text-secondary text-lg leading-relaxed text-center">
            {aboutContent.body}
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TIMELINE — Gemini timeline-infographic.png IS the timeline    */}
      {/* ============================================================ */}
      <section id="milestones" className="section-padding bg-bg-surface">
        <div className="content-wrapper">
          <h2 data-aos="fade-up" className="font-playfair text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
            Our Journey
          </h2>
          <p data-aos="fade-up" data-aos-delay="100" className="text-text-secondary text-center max-w-2xl mx-auto mb-10">
            From MPSA grant to partnership-ready — a decade and a half of validated progress
          </p>
          <div data-aos="fade-up" data-aos-delay="200" className="max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/generated/timeline-infographic.webp"
                alt="GMC Timeline — 2007 MPSA Granted through 2025-2026 Partnership Ready"
                width={1920}
                height={1080}
                className="w-full h-auto"
                sizes="100vw"
              />
            </div>
          </div>

          {/* Detailed milestones below the image */}
          <div data-aos="fade-up" className="mt-12 max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {aboutContent.milestones.map((m) => (
                <div key={m.year} className="bg-white rounded-xl shadow-[0_2px_8px_rgba(12,25,38,0.06)] p-5">
                  <div className="font-mono font-bold text-brand-navy text-xl mb-1">{m.year}</div>
                  <p className="text-text-secondary text-sm leading-relaxed">{m.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding">
        <div className="content-wrapper">
          <h2 data-aos="fade-up" className="font-playfair text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
            Vision &amp; Values
          </h2>
          <p data-aos="fade-up" data-aos-delay="100" className="text-brand-gold text-lg font-medium text-center mb-12">
            {aboutContent.vision}
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((v, i) => (
              <div key={v.title} data-aos="fade-up" data-aos-delay={i * 100} className="bg-white rounded-xl shadow-[0_2px_8px_rgba(12,25,38,0.06)] p-8">
                <h3 className="text-xl font-bold text-brand-navy mb-3">{v.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Governance */}
      <section id="governance" className="section-padding bg-bg-surface">
        <div className="content-wrapper max-w-3xl mx-auto">
          <h2 data-aos="fade-up" className="font-playfair text-3xl md:text-4xl font-bold text-text-primary text-center mb-12">
            Corporate Governance
          </h2>
          <div className="space-y-4">
            {governance.map((item, i) => (
              <div key={item} data-aos="fade-up" data-aos-delay={i * 50} className="flex items-start gap-4 bg-white rounded-lg p-4 shadow-[0_1px_4px_rgba(12,25,38,0.04)]">
                <CheckCircle className="text-success flex-shrink-0 mt-0.5" size={20} />
                <span className="text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office */}
      <section className="section-padding">
        <div className="content-wrapper max-w-3xl mx-auto text-center">
          <h2 data-aos="fade-up" className="font-playfair text-2xl font-bold text-text-primary mb-4">
            Corporate Office
          </h2>
          <address data-aos="fade-up" data-aos-delay="100" className="not-italic text-text-secondary leading-relaxed">
            <p>Unit 1411 Ayala Tower One</p>
            <p>6767 Ayala Avenue, Makati City 1226</p>
            <p>Philippines</p>
            <p className="mt-3">
              <a href="mailto:gmc@genluiching.com" className="text-brand-navy hover:text-brand-gold transition-colors font-medium">
                gmc@genluiching.com
              </a>
            </p>
          </address>
        </div>
      </section>
    </>
  )
}
