'use client'

import Image from 'next/image'
import { evidencePortfolio } from '@/lib/content'

/* ------------------------------------------------------------------ */
/* ASSETS PAGE — Evidence Portfolio                                     */
/* Gemini images (cross-section, evidence-portfolio) ARE the content   */
/* ------------------------------------------------------------------ */

const mineralCards = [
  {
    src: '/images/generated/iron-hero-data.webp',
    alt: 'Iron Ore — 67.31% Fe, POSCO Confirmed',
    detail: 'Shipping-grade premium iron ore — comparable to top-tier Brazilian and Australian product. Very low phosphorus and sulfur, suitable for direct export to global steelmakers.',
  },
  {
    src: '/images/generated/copper-hero-data.webp',
    alt: 'Copper — 39.5% Cu, Near-Concentrate Grade',
    detail: 'Near-concentrate grade at surface — indicating strong supergene enrichment above the primary sulfide system. Four independent laboratories across a decade confirm this as a systematic feature.',
  },
  {
    src: '/images/generated/gold-hero-data.webp',
    alt: 'Gold — 20.35 g/t Au, Highest Fire Assay',
    detail: 'Highest gold result ever recorded from this concession. Seven-year grade consistency (2017–2024) from the same laboratory confirms this is a systematic feature, not an anomaly.',
  },
]

export default function AssetsPage() {
  return (
    <>
      {/* Short Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/site-photos/Mati Mining Site.webp"
          alt="Mati Mining Site"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="relative z-10 text-center px-6">
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            The Evidence Portfolio
          </h1>
          <p className="text-white/70 text-lg md:text-xl">
            Nine laboratories. Five countries. One deposit model.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* DEPOSIT CROSS-SECTION — Gemini image IS the diagram           */}
      {/* ============================================================ */}
      <section id="cross-section" className="section-padding">
        <div className="content-wrapper">
          <h2 data-aos="fade-up" className="font-playfair text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
            Deposit Cross-Section
          </h2>
          <p data-aos="fade-up" data-aos-delay="100" className="text-text-secondary text-center max-w-2xl mx-auto mb-10">
            Eight core samples to 493 meters total depth across the concession
          </p>
          <div data-aos="fade-up" data-aos-delay="200" className="max-w-6xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/generated/cross-section-infographic.webp"
                alt="Geological cross-section — iron oxide cap, transition zone, sulfide zone, porphyry target with 8 core samples"
                width={1920}
                height={1080}
                className="w-full h-auto"
                sizes="100vw"
              />
            </div>
            <p className="text-text-muted text-xs text-center mt-4 italic">
              Based on SGECS geological assessment filed with MGB Region XI, June 2025
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MINERAL CARDS — Gemini images with baked-in data              */}
      {/* ============================================================ */}
      <section className="section-padding bg-bg-surface">
        <div className="content-wrapper">
          <h2 data-aos="fade-up" className="font-playfair text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
            Primary Commodities
          </h2>
          <p data-aos="fade-up" data-aos-delay="100" className="text-text-secondary text-center max-w-2xl mx-auto mb-12">
            Three minerals validated by independent laboratories across five countries
          </p>
          <div className="space-y-12 max-w-5xl mx-auto">
            {mineralCards.map((card, i) => (
              <div
                key={card.src}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className={`grid lg:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[16/10]">
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                </div>
                <div>
                  <p className="text-text-secondary leading-relaxed text-lg">{card.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* EVIDENCE GRID — Gemini image + detailed table                 */}
      {/* ============================================================ */}
      <section className="section-padding">
        <div className="content-wrapper">
          <h2 data-aos="fade-up" className="font-playfair text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
            Nine Laboratories, Five Countries
          </h2>
          <p data-aos="fade-up" data-aos-delay="100" className="text-text-secondary text-center max-w-2xl mx-auto mb-10">
            Each laboratory answered a different question. Together they tell one story.
          </p>

          {/* Gemini evidence portfolio image */}
          <div data-aos="fade-up" data-aos-delay="200" className="max-w-5xl mx-auto mb-16">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/generated/evidence-portfolio.webp"
                alt="Evidence portfolio — 9 laboratories across 5 countries with key data points"
                width={1920}
                height={1080}
                className="w-full h-auto"
                sizes="100vw"
              />
            </div>
          </div>

          {/* Detailed lab table */}
          <div data-aos="fade-up" className="max-w-5xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-brand-navy/20">
                    <th className="py-3 pr-4 text-xs uppercase tracking-widest text-text-muted font-semibold">Laboratory</th>
                    <th className="py-3 pr-4 text-xs uppercase tracking-widest text-text-muted font-semibold">Country</th>
                    <th className="py-3 pr-4 text-xs uppercase tracking-widest text-text-muted font-semibold">Question Answered</th>
                    <th className="py-3 text-xs uppercase tracking-widest text-text-muted font-semibold">Key Result</th>
                  </tr>
                </thead>
                <tbody>
                  {evidencePortfolio.map((lab, i) => (
                    <tr key={i} className="border-b border-border hover:bg-bg-surface/50 transition-colors">
                      <td className="py-4 pr-4 font-semibold text-text-primary text-sm">{lab.lab}</td>
                      <td className="py-4 pr-4 text-text-secondary text-sm">{lab.country}</td>
                      <td className="py-4 pr-4 text-text-secondary text-sm">{lab.question}</td>
                      <td className="py-4 font-mono text-sm text-brand-navy font-medium">{lab.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* VOLUME ESTIMATES                                              */}
      {/* ============================================================ */}
      <section className="section-padding bg-bg-surface">
        <div className="content-wrapper text-center max-w-3xl mx-auto">
          <h2 data-aos="fade-up" className="font-playfair text-3xl md:text-4xl font-bold text-text-primary mb-8">
            Resource Estimates
          </h2>
          <div data-aos="fade-up" data-aos-delay="100" className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(12,25,38,0.06)] p-8">
              <div className="font-mono font-bold text-4xl min-[400px]:text-5xl text-brand-navy">21.6M</div>
              <div className="font-mono text-brand-copper text-lg mt-1">MT</div>
              <div className="text-text-muted text-sm uppercase tracking-widest mt-2">Copper Ore</div>
            </div>
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(12,25,38,0.06)] p-8">
              <div className="font-mono font-bold text-4xl min-[400px]:text-5xl text-brand-navy">16M</div>
              <div className="font-mono text-brand-iron text-lg mt-1">MT</div>
              <div className="text-text-muted text-sm uppercase tracking-widest mt-2">Iron Ore</div>
            </div>
          </div>
          <p data-aos="fade-up" data-aos-delay="200" className="text-text-muted text-sm italic">
            Per SGECS geological assessment filed with MGB Region XI, June 2025. Estimates based on 518 hectares
            explored — less than 9% of the total 5,906-hectare concession. Not JORC-compliant; Phase 2 feasibility
            study targets JORC-compliant resource estimate.
          </p>
        </div>
      </section>
    </>
  )
}
