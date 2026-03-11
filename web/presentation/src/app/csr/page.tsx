'use client'

import Image from 'next/image'
import { Shield, Leaf, Users, Heart } from 'lucide-react'

/* ------------------------------------------------------------------ */
/* CSR PAGE — Community & Sustainability                               */
/* hero-landscape-enhanced.png as hero background                      */
/* ------------------------------------------------------------------ */

const pillars = [
  {
    Icon: Users,
    title: 'Indigenous Community Partnership',
    desc: 'Over 60% of GMC\'s workforce are indigenous Lumad community members. They serve as mining laborers, road mappers, guides who know the terrain better than any surveyor, stockyard personnel, and property custodians.',
    color: 'bg-brand-navy',
  },
  {
    Icon: Shield,
    title: 'FPIC Approved',
    desc: 'Free, Prior, and Informed Consent has been formally approved through the NCIP process. The community is not just consulted — they are partners in every operational decision.',
    color: 'bg-success',
  },
  {
    Icon: Leaf,
    title: 'Environmental Stewardship',
    desc: 'GMC operates a forest tree nursery at the Mati site, tended by the Lumad community. Wild pine, hardwood, and fruit-bearing seedlings are propagated in alternative green areas. Progressive reclamation ensures the land is returned to productive use.',
    color: 'bg-brand-copper',
  },
  {
    Icon: Heart,
    title: 'Community Foundation',
    desc: 'Planned programs include literacy education, livelihood training in agriculture and trades, enterprise creation and marketing support for Lumad-led businesses, socialized housing, and primary health care.',
    color: 'bg-brand-gold',
  },
]

export default function CSRPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/generated/hero-landscape-enhanced.webp"
          alt="Davao Oriental landscape"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="relative z-10 text-center px-6">
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            Caring for Creation
          </h1>
          <p className="text-white/70 text-lg md:text-xl">
            Responsible mining that serves communities and protects the environment
          </p>
        </div>
      </section>

      {/* 60% Lumad metric */}
      <section className="section-padding bg-bg-surface">
        <div className="content-wrapper text-center max-w-3xl mx-auto">
          <div data-aos="fade-up" className="font-mono font-bold text-5xl min-[400px]:text-7xl md:text-8xl text-brand-navy mb-4">60%</div>
          <div data-aos="fade-up" data-aos-delay="100" className="text-text-muted uppercase tracking-[0.2em] text-sm mb-8">Indigenous Lumad Workforce</div>
          <p data-aos="fade-up" data-aos-delay="200" className="text-text-secondary text-lg leading-relaxed">
            More than half of GMC&apos;s operational workforce are members of the indigenous Lumad community.
            This is not a target or aspiration — it is a reflection of how GMC has operated from the beginning.
            The community&apos;s knowledge of the land, combined with formal geological science, creates an
            exploration capability that neither could achieve alone.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="section-padding">
        <div className="content-wrapper">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pillars.map((p, i) => (
              <div key={p.title} data-aos="fade-up" data-aos-delay={i * 100} className="bg-white rounded-xl shadow-[0_2px_8px_rgba(12,25,38,0.06)] p-8 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${p.color} rounded-lg flex items-center justify-center mb-6`}>
                  <p.Icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{p.title}</h3>
                <p className="text-text-secondary leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo row */}
      <section className="section-padding bg-bg-surface">
        <div className="content-wrapper">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div data-aos="fade-up" className="rounded-2xl overflow-hidden aspect-[4/3] relative">
              <Image
                src="/images/site-photos/Creation.webp"
                alt="Environmental stewardship at GMC"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
            <div data-aos="fade-up" data-aos-delay="100" className="rounded-2xl overflow-hidden aspect-[4/3] relative">
              <Image
                src="/images/site-photos/Mountains.webp"
                alt="Davao Oriental mountains"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision banner */}
      <section className="relative py-24 overflow-hidden">
        <Image
          src="/images/generated/topo-texture-dark.webp"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0C1926]/85" />
        <div className="relative content-wrapper text-center">
          <h2 data-aos="fade-up" className="font-playfair text-3xl md:text-4xl font-bold text-white mb-4 max-w-3xl mx-auto">
            Building for Communities to Thrive
          </h2>
          <p data-aos="fade-up" data-aos-delay="100" className="text-white/50 text-lg max-w-2xl mx-auto">
            When a strategic partner joins, the impact scales — from hundreds of families to thousands, from local employment to regional transformation.
          </p>
        </div>
      </section>
    </>
  )
}
