'use client'

import { CheckCircle } from 'lucide-react'
import { aboutContent } from '@/lib/content'
import config from '@/lib/siteConfig'

/* ------------------------------------------------------------------ */
/* ABOUT PAGE — Timeline + governance credentials                      */
/* ------------------------------------------------------------------ */

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden" style={{ backgroundColor: config.brand.dark }}>
        <div className="relative z-10 text-center px-6">
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            About {config.company.short_name}
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto">
            {config.company.tagline}
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

      {/* Milestones */}
      <section id="milestones" className="section-padding bg-bg-surface">
        <div className="content-wrapper">
          <h2 data-aos="fade-up" className="font-playfair text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
            Our Journey
          </h2>
          <p data-aos="fade-up" data-aos-delay="100" className="text-text-secondary text-center max-w-2xl mx-auto mb-10">
            Key milestones in our history
          </p>
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

      {/* Vision & Values */}
      <section className="section-padding">
        <div className="content-wrapper">
          <h2 data-aos="fade-up" className="font-playfair text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
            Vision &amp; Values
          </h2>
          <p data-aos="fade-up" data-aos-delay="100" className="text-brand-gold text-lg font-medium text-center mb-12">
            {aboutContent.vision}
          </p>
          <div className="text-center py-12 text-gray-400">
            Configure vision and values content for your domain
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
            {aboutContent.governance.map((item, i) => (
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
            <p>{config.company.address.line1}</p>
            <p>{config.company.address.line2}</p>
            <p>{config.company.address.city}, {config.company.address.country}</p>
            <p className="mt-3">
              <a href={`mailto:${config.company.email}`} className="text-brand-navy hover:text-brand-gold transition-colors font-medium">
                {config.company.email}
              </a>
            </p>
          </address>
        </div>
      </section>
    </>
  )
}
