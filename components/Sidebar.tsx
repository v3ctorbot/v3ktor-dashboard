'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, DocumentTextIcon, ClockIcon, ArrowLeftOnRectangleIcon, FlagIcon, InboxIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'

type HealthLevel = 'healthy' | 'stale' | 'dead'

function getHealth(updatedAt: string | null): HealthLevel {
  if (!updatedAt) return 'dead'
  const minutesAgo = (Date.now() - new Date(updatedAt).getTime()) / 60000
  if (minutesAgo < 10) return 'healthy'
  if (minutesAgo < 30) return 'stale'
  return 'dead'
}

const healthDot: Record<HealthLevel, string> = {
  healthy: 'bg-green-500',
  stale: 'bg-yellow-400',
  dead: 'bg-red-500',
}

const healthLabel: Record<HealthLevel, string> = {
  healthy: 'Online',
  stale: 'Stale',
  dead: 'Offline',
}

const healthText: Record<HealthLevel, string> = {
  healthy: 'text-green-400',
  stale: 'text-yellow-400',
  dead: 'text-red-400',
}

const menuItems = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Inbox', href: '/inbox', icon: InboxIcon, alertKey: 'inbox' },
  { name: 'Goals', href: '/goals', icon: FlagIcon },
  { name: 'Log', href: '/log', icon: ClockIcon },
  { name: 'Docs', href: '/docs', icon: DocumentTextIcon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [health, setHealth] = useState<HealthLevel>('dead')
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [inboxCount, setInboxCount] = useState(0)

  useEffect(() => {
    supabase.from('status').select('updated_at').limit(1).single().then(({ data }) => {
      if (data?.updated_at) {
        setUpdatedAt(data.updated_at)
        setHealth(getHealth(data.updated_at))
      }
    })

    // Count unread inbox items (unseen notes + unread needs_decision briefings)
    Promise.all([
      supabase.from('notes').select('id', { count: 'exact', head: true }).eq('status', 'unseen'),
      supabase.from('briefings').select('id', { count: 'exact', head: true }).eq('status', 'unread').eq('type', 'needs_decision'),
    ]).then(([notes, briefings]) => {
      setInboxCount((notes.count || 0) + (briefings.count || 0))
    }).catch(() => setInboxCount(0))

    const statusSub = supabase
      .channel('sidebar-status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'status' }, (payload) => {
        const at = payload.new.updated_at
        setUpdatedAt(at)
        setHealth(getHealth(at))
      })
      .subscribe()

    const interval = setInterval(() => setHealth(getHealth(updatedAt)), 60000)

    return () => {
      statusSub.unsubscribe()
      clearInterval(interval)
    }
  }, [updatedAt])

  return (
    <div className="w-64 bg-klaus-sidebar border-r border-klaus-border h-screen flex flex-col flex-shrink-0 fixed left-0 top-0 z-50">
      {/* Profile Section */}
      <div className="p-6 flex flex-col items-center border-b border-klaus-border/50">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center mb-3 shadow-lg ring-2 ring-klaus-border">
          <span className="text-2xl">⚡</span>
        </div>
        <h2 className="text-klaus-text font-bold text-lg">V3ktor</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className={`w-2 h-2 rounded-full ${healthDot[health]} ${health === 'healthy' ? 'animate-pulse' : ''}`} />
          <span className={`text-xs font-medium ${healthText[health]}`}>{healthLabel[health]}</span>
        </div>
        <button className="mt-4 w-full py-2 bg-klaus-card hover:bg-slate-700 text-klaus-text text-xs font-semibold rounded-lg border border-klaus-border transition-all">
          Ready for tasks
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                ? 'bg-klaus-card text-ft-light border border-ft-light/20 shadow-sm'
                : 'text-klaus-muted hover:text-klaus-text hover:bg-klaus-card/50'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.alertKey === 'inbox' && inboxCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {inboxCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-klaus-border/50">
        <button className="w-full flex items-center justify-center gap-2 text-klaus-muted hover:text-red-400 text-xs font-medium transition-colors p-2">
          <ArrowLeftOnRectangleIcon className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
