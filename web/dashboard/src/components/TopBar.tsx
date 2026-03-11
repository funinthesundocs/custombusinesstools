'use client'

import { usePathname } from 'next/navigation'
import { Settings, Bell } from 'lucide-react'
import Link from 'next/link'
import config from '@/lib/siteConfig'

const PAGE_NAMES: Record<string, string> = {
  '/': 'Dashboard',
  '/intelligence': 'Intelligence',
  '/documents': 'Documents',
  '/agents': 'Agent Teams',
  '/production': 'Production',
  '/deliverables': 'Deliverables',
  '/presentation': 'Presentation Site',
  '/verification': 'Verification',
  '/settings': 'Settings',
  '/activity': 'Activity Log',
}

export function TopBar() {
  const pathname = usePathname()
  const pageName = PAGE_NAMES[pathname] || 'Dashboard'

  return (
    <header className="flex items-center justify-between h-12 px-4 bg-zinc-800 border-b border-zinc-700 shrink-0">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-bold text-[var(--color-primary)] tracking-wider">KOP</span>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-400">{config.company.short_name}</span>
        <span className="text-zinc-600">/</span>
        <span className="text-white font-medium">{pageName}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 rounded-full border-2 border-zinc-600" style={{ backgroundColor: 'var(--color-primary)' }} />
        <Link href="/settings" className="text-zinc-400 hover:text-zinc-200 transition-colors">
          <Settings size={16} />
        </Link>
        <button className="relative text-zinc-400 hover:text-zinc-200 transition-colors">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[var(--color-primary)] text-[8px] font-bold flex items-center justify-center text-black">3</span>
        </button>
      </div>
    </header>
  )
}
