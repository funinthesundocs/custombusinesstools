'use client'

import Link from 'next/link'
import config from '@/lib/siteConfig'

const columns = [
  {
    title: 'Company',
    links: [
      { href: '/about', label: `About ${config.company.short_name}` },
      { href: '/team', label: 'Leadership' },
      { href: '/contact', label: 'Contact Us' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/presentation', label: 'Presentation' },
      { href: '/about#milestones', label: 'Timeline' },
    ],
  },
  {
    title: 'Governance',
    links: [
      { href: '/about#governance', label: 'Corporate Governance' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-bg-dark text-white" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Back to Top */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-end">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-white/40 hover:text-white text-sm flex items-center gap-2 transition-colors"
          >
            Back to Top
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="rotate-180">
              <path d="M6 2L6 10M6 2L2 6M6 2L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div>
                <div className="font-playfair font-bold text-lg">{config.company.short_name}</div>
                <div className="text-[10px] tracking-[0.15em] uppercase text-white/40">{config.company.name}</div>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mb-6">
              {config.company.description}
            </p>
          </div>

          {/* Link Columns */}
          {columns.map(col => (
            <div key={col.title}>
              <h4 className="font-semibold text-xs uppercase tracking-[0.2em] text-white/40 mb-5">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/70 hover:text-white text-sm transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact + Copyright */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <address className="not-italic text-sm text-white/50 space-y-1">
              <p>{config.company.address.line1}</p>
              <p>{config.company.address.line2}</p>
              <p>{config.company.address.city}, {config.company.address.country}</p>
              <p className="pt-1">
                <a href={`mailto:${config.company.email}`} className="text-white/60 hover:text-brand-gold transition-colors">
                  {config.company.email}
                </a>
              </p>
            </address>
            <p className="text-white/30 text-sm">
              &copy; {new Date().getFullYear()} {config.company.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
