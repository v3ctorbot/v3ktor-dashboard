'use client'

import { Briefing, BriefingType } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { InboxIcon } from '@heroicons/react/24/outline'

interface BriefingPanelProps {
  briefings: Briefing[]
}

const typeConfig: Record<BriefingType, { label: string; classes: string; icon: string }> = {
  daily_brief: {
    label: 'Daily Brief',
    classes: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    icon: '📋',
  },
  ops_alert: {
    label: 'Ops Alert',
    classes: 'bg-orange-500/15 text-orange-300 border-orange-500/40',
    icon: '⚠️',
  },
  needs_decision: {
    label: 'Needs Decision',
    classes: 'bg-red-500/15 text-red-300 border-red-500/40',
    icon: '🔴',
  },
  weekly_summary: {
    label: 'Weekly Summary',
    classes: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
    icon: '📊',
  },
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function BriefingPanel({ briefings }: BriefingPanelProps) {
  const unread = briefings.filter((b) => b.status === 'unread')
  const needsDecision = briefings.filter((b) => b.type === 'needs_decision' && b.status !== 'archived')
  const rest = briefings.filter((b) => b.status !== 'archived' && b.type !== 'needs_decision').slice(0, 8)

  const markRead = async (id: string) => {
    await supabase.from('briefings').update({ status: 'read' }).eq('id', id)
  }

  const archive = async (id: string) => {
    await supabase.from('briefings').update({ status: 'archived' }).eq('id', id)
  }

  return (
    <div className="card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <InboxIcon className="w-5 h-5 text-ft-light" />
          <h2 className="text-base font-bold font-heading text-white">Ops Brief</h2>
          {unread.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unread.length}
            </span>
          )}
        </div>
        <span className="text-[11px] text-klaus-muted">V3ktor's daily digest</span>
      </div>

      {briefings.filter(b => b.status !== 'archived').length === 0 ? (
        <div className="text-center py-8 text-klaus-muted text-sm italic">
          No briefings yet. V3ktor will write here daily.<br />
          <code className="text-xs text-ft-light/70 mt-1 inline-block">
            v3ktor-cli briefing create daily_brief "Title" "Content"
          </code>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Needs Decision — always first, left column */}
          {needsDecision.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-red-400">Needs Your Decision</p>
              {needsDecision.map((b) => (
                <BriefingCard key={b.id} briefing={b} onRead={markRead} onArchive={archive} />
              ))}
            </div>
          )}

          {/* Rest — split across remaining columns */}
          <div className={`flex flex-col gap-2 ${needsDecision.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            {rest.length === 0 ? (
              <p className="text-xs text-klaus-muted italic">No other active briefings.</p>
            ) : (
              <div className={`grid gap-3 ${needsDecision.length > 0 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
                {rest.map((b) => (
                  <BriefingCard key={b.id} briefing={b} onRead={markRead} onArchive={archive} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function BriefingCard({
  briefing,
  onRead,
  onArchive,
}: {
  briefing: Briefing
  onRead: (id: string) => void
  onArchive: (id: string) => void
}) {
  const cfg = typeConfig[briefing.type]
  const isUnread = briefing.status === 'unread'

  return (
    <div className={`bg-klaus-bg border rounded-lg p-3 flex flex-col gap-2 transition-opacity ${isUnread ? 'border-ft-light/30' : 'border-klaus-border opacity-70'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span>{cfg.icon}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cfg.classes}`}>
            {cfg.label}
          </span>
          {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-ft-light animate-pulse" />}
        </div>
        <span className="text-[10px] text-klaus-muted shrink-0">{formatDate(briefing.date)}</span>
      </div>

      <p className="text-sm font-semibold text-white leading-snug">{briefing.title}</p>
      <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{briefing.content}</p>

      {briefing.related_task_id && (
        <p className="text-[10px] text-ft-light/60 font-mono">→ {briefing.related_task_id}</p>
      )}

      <div className="flex gap-2 mt-1">
        {isUnread && (
          <button
            onClick={() => onRead(briefing.id)}
            className="text-[10px] text-green-400 hover:text-green-300 font-semibold transition-colors"
          >
            Mark read
          </button>
        )}
        <button
          onClick={() => onArchive(briefing.id)}
          className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors ml-auto"
        >
          Archive
        </button>
      </div>
    </div>
  )
}
