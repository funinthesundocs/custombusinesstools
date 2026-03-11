'use client'

import { useState, useEffect } from 'react'
import { Send, MapPin, Mail } from 'lucide-react'
import config from '@/lib/siteConfig'

/* ------------------------------------------------------------------ */
/* CONTACT PAGE — Form + office info                                   */
/* ------------------------------------------------------------------ */

export default function ContactPage() {
  const [online, setOnline] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  useEffect(() => {
    setOnline(navigator.onLine)
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { error } = await supabase.from('contact_submissions').insert({
        name: form.name,
        email: form.email,
        company: form.company || null,
        message: form.message,
      })
      if (error) throw error
      setStatus('sent')
      setForm({ name: '', email: '', company: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[250px] flex items-center justify-center overflow-hidden" style={{ backgroundColor: config.brand.dark }}>
        <div className="relative z-10 text-center px-6">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-3">
            Contact Us
          </h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="content-wrapper">
          <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
            {/* Contact info */}
            <div data-aos="fade-up">
              <h2 className="text-3xl font-bold text-text-primary mb-8">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="text-brand-navy flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-text-primary">Office</h3>
                    <p className="text-text-secondary text-sm mt-1">
                      {config.company.address.line1}<br />
                      {config.company.address.line2}<br />
                      {config.company.address.city}, {config.company.address.country}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="text-brand-navy flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-text-primary">Email</h3>
                    <a href={`mailto:${config.company.email}`} className="text-brand-navy text-sm hover:underline">
                      {config.company.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Form or offline fallback */}
            <div data-aos="fade-up" data-aos-delay="100">
              {!online ? (
                <div className="bg-bg-surface rounded-xl p-8 text-center">
                  <h3 className="text-xl font-bold text-text-primary mb-4">Currently Offline</h3>
                  <p className="text-text-secondary mb-4">Please contact us directly:</p>
                  <a href={`mailto:${config.company.email}`} className="text-brand-navy font-semibold hover:underline">
                    {config.company.email}
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition text-[16px] sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition text-[16px] sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Company</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={e => setForm({ ...form, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition text-[16px] sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition resize-none text-[16px] sm:text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="bg-brand-navy text-white px-8 py-3 rounded-lg font-semibold text-[15px] hover:bg-opacity-90 transition-all disabled:opacity-60 flex items-center gap-2"
                  >
                    <Send size={16} />
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                  </button>
                  {status === 'sent' && <p className="text-success font-medium">Message sent successfully. We will be in touch.</p>}
                  {status === 'error' && <p className="text-red-600 font-medium">Something went wrong. Please email us directly.</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
