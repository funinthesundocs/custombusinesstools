'use client'

import Image from 'next/image'
import { User } from 'lucide-react'

/* ------------------------------------------------------------------ */
/* TEAM PAGE — Leadership                                              */
/* ------------------------------------------------------------------ */

export default function TeamPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/site-photos/Mountains.webp"
          alt="Davao Oriental"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="relative z-10 text-center px-6">
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            Leadership
          </h1>
          <p className="text-white/70 text-lg md:text-xl">
            The people behind Genluiching Mining Corporation
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="content-wrapper max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Jett Tupas card */}
            <div data-aos="fade-up" className="bg-white rounded-xl shadow-[0_2px_8px_rgba(12,25,38,0.06)] p-8 text-center">
              <div className="w-32 h-32 rounded-full bg-bg-surface flex items-center justify-center mx-auto mb-6">
                <User className="text-text-muted" size={56} />
              </div>
              <h3 className="text-2xl font-bold text-text-primary">Jett Tupas</h3>
              <p className="text-brand-navy font-medium mt-1">President &amp; CEO</p>
              <p className="text-text-muted text-sm mt-1">Genluiching Mining Corporation</p>
            </div>

            {/* Corporate structure */}
            <div data-aos="fade-up" data-aos-delay="100">
              <h2 className="text-2xl font-bold text-text-primary mb-6">Corporate Structure</h2>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>
                  Genluiching Mining Corporation is a Philippine SEC-registered company with an established
                  operational team across exploration, community relations, and corporate development.
                </p>
                <p>
                  The company maintains offices in Makati City for corporate affairs and an operational
                  base in Mati City, Davao Oriental for on-site activities. A mineral sales office operates
                  from Honolulu, Hawaii for international market development.
                </p>
                <p>
                  GMC&apos;s workforce includes over 60% indigenous Lumad community members, reflecting a deep
                  commitment to local employment and community partnership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
