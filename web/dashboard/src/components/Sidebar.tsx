'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Database, Cpu, Bot, Factory,
  Package, Globe, ShieldCheck, Settings, Activity,
  ChevronLeft, ChevronRight, Brain
} from 'lucide-react'

const NAV_ITEMS = {
  operations: [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/intelligence', icon: Database, label: 'Knowledge Base' },
    { href: '/documents', icon: Cpu, label: 'Embed Control' },
    { href: '/agents', icon: Bot, label: 'Agent Config' },
    { href: '/production', icon: Factory, label: 'Production' },
    { href: '/deliverables', icon: Package, label: 'Deliverables' },
    { href: '/presentation', icon: Globe, label: 'Presentation Site' },
    { href: '/verification', icon: ShieldCheck, label: 'Verification' },
    { href: '/agent', icon: Brain, label: 'AI Agent' },
  ],
  system: [
    { href: '/settings', icon: Settings, label: 'Settings' },
    { href: '/activity', icon: Activity, label: 'Activity Log' },
  ]
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside className={`flex flex-col bg-zinc-900 border-r border-zinc-800 transition-all duration-200 ease-in-out ${
      collapsed ? 'w-16' : 'w-[260px]'
    }`}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-12 border-b border-zinc-800">
        {!collapsed && (
          <span className="text-sm font-bold tracking-wider text-zinc-100">RAG Factory</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-2">
          {!collapsed && <p className="text-[10px] uppercase tracking-widest text-zinc-600 px-2 mb-2">Operations</p>}
          {NAV_ITEMS.operations.map(item => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-all mb-0.5 ${
                  isActive
                    ? 'text-white border-l-2 border-[var(--color-primary)] bg-[var(--color-primary-muted)] shadow-[inset_0_0_12px_var(--color-primary-muted)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border-l-2 border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className={isActive ? 'text-[var(--color-primary)]' : ''} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </div>

        <div className="px-3 mt-4">
          {!collapsed && <p className="text-[10px] uppercase tracking-widest text-zinc-600 px-2 mb-2">System</p>}
          {NAV_ITEMS.system.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-all mb-0.5 ${
                  isActive
                    ? 'text-white border-l-2 border-[var(--color-primary)] bg-[var(--color-primary-muted)] shadow-[inset_0_0_12px_var(--color-primary-muted)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border-l-2 border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className={isActive ? 'text-[var(--color-primary)]' : ''} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
