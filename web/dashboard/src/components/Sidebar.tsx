'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, Bot,
  Settings, Wrench,
  ChevronLeft, ChevronRight
} from 'lucide-react'

const MAIN_NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/knowledge', icon: BookOpen, label: 'Knowledge' },
  { href: '/agents', icon: Bot, label: 'Agent' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

const EXTRA_NAV = [
  { href: '/workshop', icon: Wrench, label: 'Workshop' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const renderItem = (item: typeof MAIN_NAV[0], dimmed = false) => {
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all mb-0.5 ${
          isActive
            ? 'text-white bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/20'
            : `${dimmed ? 'text-zinc-600' : 'text-zinc-400'} hover:text-zinc-200 hover:bg-white/5 border border-transparent`
        }`}
        title={collapsed ? item.label : undefined}
      >
        <item.icon size={18} className={isActive ? 'text-[var(--color-primary)]' : ''} />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    )
  }

  return (
    <aside className={`flex flex-col bg-zinc-950 border-r border-white/5 transition-all duration-200 ease-in-out ${
      collapsed ? 'w-[72px]' : 'w-[240px]'
    }`}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-white/5">
        {!collapsed && (
          <span className="text-sm font-bold tracking-wider text-zinc-100">RAG Factory</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-0.5">
          {MAIN_NAV.map(item => renderItem(item))}
        </div>

        {/* Divider before Workshop */}
        <div className="my-4 border-t border-white/5" />

        <div className="space-y-0.5">
          {EXTRA_NAV.map(item => renderItem(item, true))}
        </div>
      </nav>
    </aside>
  )
}
