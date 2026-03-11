'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import config from '@/lib/siteConfig'

interface HomePageClientProps {
  heroImages: string[]
}

export default function HomePageClient({ heroImages }: HomePageClientProps) {
  return (
    <>
      {/* ============================================================ */}
      {/* HERO                                                          */}
      {/* ============================================================ */}
      <section className="relative w-full h-[100dvh] flex items-start pt-[calc(16vh+60px)] md:pt-[calc(12vh+60px)]" style={{ height: '100dvh', backgroundColor: config.brand.dark }}>
        <div className="max-w-7xl mx-auto px-6 w-full">
          <h1 className="font-playfair text-[clamp(1.75rem,5vw,3.5rem)] text-white font-bold leading-[1.15] mb-5">
            {config.company.tagline}
          </h1>
          <p className="text-white/80 text-base md:text-xl max-w-2xl mb-8 leading-relaxed">
            {config.company.description}
          </p>
          <Link
            href="/presentation"
            className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-bold px-6 py-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg tracking-wide"
          >
            EXPLORE
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* OVERVIEW                                                      */}
      {/* ============================================================ */}
      <section className="section-padding">
        <div className="content-wrapper max-w-4xl mx-auto text-center">
          <h2 data-aos="fade-up" className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-6">
            {config.company.name}
          </h2>
          <p data-aos="fade-up" data-aos-delay="100" className="text-text-secondary text-lg leading-relaxed">
            {config.company.description}
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PARTNERSHIP CTA                                               */}
      {/* ============================================================ */}
      <section className="relative py-32 overflow-hidden" style={{ backgroundColor: config.brand.dark }}>
        <div className="relative content-wrapper text-center">
          <h2 data-aos="fade-up" className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 max-w-3xl mx-auto leading-tight">
            {config.company.tagline}
          </h2>
          <div data-aos="fade-up" data-aos-delay="200" className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/presentation"
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-lg text-[15px]"
            >
              View Presentation
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-8 py-4 rounded-full border border-white/20 transition-all duration-300 text-[15px]"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
