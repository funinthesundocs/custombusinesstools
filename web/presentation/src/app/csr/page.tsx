'use client'

import { csrContent } from '@/lib/content'
import config from '@/lib/siteConfig'

/* ------------------------------------------------------------------ */
/* CSR PAGE — Community & Sustainability                               */
/* ------------------------------------------------------------------ */

export default function CSRPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden" style={{ backgroundColor: config.brand.dark }}>
        <div className="relative z-10 text-center px-6">
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            {csrContent.headline}
          </h1>
          <p className="text-white/70 text-lg md:text-xl">
            Our commitment to responsible business practices
          </p>
        </div>
      </section>

      {/* Key metric */}
      <section className="section-padding bg-bg-surface">
        <div className="content-wrapper text-center max-w-3xl mx-auto">
          <div data-aos="fade-up" className="font-mono font-bold text-5xl min-[400px]:text-7xl md:text-8xl text-brand-navy mb-4">
            {csrContent.lumadMetric.value}
          </div>
          <div data-aos="fade-up" data-aos-delay="100" className="text-text-muted uppercase tracking-[0.2em] text-sm mb-8">
            {csrContent.lumadMetric.label}
          </div>
          <p data-aos="fade-up" data-aos-delay="200" className="text-text-secondary text-lg leading-relaxed">
            {csrContent.lumadMetric.detail}
          </p>
        </div>
      </section>

      {/* Programs */}
      <section className="section-padding">
        <div className="content-wrapper max-w-4xl mx-auto">
          <h2 data-aos="fade-up" className="font-playfair text-3xl md:text-4xl font-bold text-text-primary text-center mb-8">
            {csrContent.foundation.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {csrContent.foundation.programs.map((program, i) => (
              <div key={i} data-aos="fade-up" data-aos-delay={i * 100} className="bg-white rounded-xl shadow-[0_2px_8px_rgba(12,25,38,0.06)] p-6">
                <p className="text-text-secondary">{program}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision banner */}
      <section className="relative py-24 overflow-hidden" style={{ backgroundColor: config.brand.dark }}>
        <div className="relative content-wrapper text-center">
          <h2 data-aos="fade-up" className="font-playfair text-3xl md:text-4xl font-bold text-white mb-4 max-w-3xl mx-auto">
            {config.company.tagline}
          </h2>
          <p data-aos="fade-up" data-aos-delay="100" className="text-white/50 text-lg max-w-2xl mx-auto">
            {csrContent.environmentalStewardship}
          </p>
        </div>
      </section>
    </>
  )
}
