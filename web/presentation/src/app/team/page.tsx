'use client'

import { User } from 'lucide-react'
import { teamMembers } from '@/lib/content'
import config from '@/lib/siteConfig'

/* ------------------------------------------------------------------ */
/* TEAM PAGE — Leadership                                              */
/* ------------------------------------------------------------------ */

export default function TeamPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden" style={{ backgroundColor: config.brand.dark }}>
        <div className="relative z-10 text-center px-6">
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            Leadership
          </h1>
          <p className="text-white/70 text-lg md:text-xl">
            The people behind {config.company.name}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="content-wrapper max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} data-aos="fade-up" className="bg-white rounded-xl shadow-[0_2px_8px_rgba(12,25,38,0.06)] p-8 text-center">
                <div className="w-32 h-32 rounded-full bg-bg-surface flex items-center justify-center mx-auto mb-6">
                  <User className="text-text-muted" size={56} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary">{member.name}</h3>
                <p className="text-brand-navy font-medium mt-1">{member.title}</p>
                <p className="text-text-muted text-sm mt-1">{config.company.name}</p>
              </div>
            ))}
          </div>

          {/* Corporate structure */}
          <div data-aos="fade-up" data-aos-delay="100" className="mt-16 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Corporate Structure</h2>
            <div className="text-text-secondary leading-relaxed">
              <p>
                {config.company.name} maintains a professional corporate structure
                with offices and operational teams aligned to its business objectives.
              </p>
              <div className="text-center py-8 text-gray-400 mt-4 bg-bg-surface rounded-xl">
                Configure corporate structure details for your domain
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
