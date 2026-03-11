'use client'

import { evidencePortfolio } from '@/lib/content'
import config from '@/lib/siteConfig'

/* ------------------------------------------------------------------ */
/* ASSETS PAGE — Evidence Portfolio                                     */
/* ------------------------------------------------------------------ */

export default function AssetsPage() {
  return (
    <>
      {/* Short Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden" style={{ backgroundColor: config.brand.dark }}>
        <div className="relative z-10 text-center px-6">
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            Evidence Portfolio
          </h1>
          <p className="text-white/70 text-lg md:text-xl">
            Verified data supporting our business case
          </p>
        </div>
      </section>

      {/* Evidence Grid */}
      <section className="section-padding">
        <div className="content-wrapper">
          <h2 data-aos="fade-up" className="font-playfair text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
            Validation Sources
          </h2>
          <p data-aos="fade-up" data-aos-delay="100" className="text-text-secondary text-center max-w-2xl mx-auto mb-10">
            Each source answered a different question. Together they tell one story.
          </p>

          {/* Evidence table */}
          <div data-aos="fade-up" className="max-w-5xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-brand-navy/20">
                    <th className="py-3 pr-4 text-xs uppercase tracking-widest text-text-muted font-semibold">Source</th>
                    <th className="py-3 pr-4 text-xs uppercase tracking-widest text-text-muted font-semibold">Country</th>
                    <th className="py-3 pr-4 text-xs uppercase tracking-widest text-text-muted font-semibold">Question Answered</th>
                    <th className="py-3 text-xs uppercase tracking-widest text-text-muted font-semibold">Key Result</th>
                  </tr>
                </thead>
                <tbody>
                  {evidencePortfolio.map((item, i) => (
                    <tr key={i} className="border-b border-border hover:bg-bg-surface/50 transition-colors">
                      <td className="py-4 pr-4 font-semibold text-text-primary text-sm">{item.lab}</td>
                      <td className="py-4 pr-4 text-text-secondary text-sm">{item.country}</td>
                      <td className="py-4 pr-4 text-text-secondary text-sm">{item.question}</td>
                      <td className="py-4 font-mono text-sm text-brand-navy font-medium">{item.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
