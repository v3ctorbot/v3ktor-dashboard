'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ActivityLogEntry, Briefing, Note, Task } from '@/lib/types'
import { InboxIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, DocumentPlusIcon } from '@heroicons/react/24/outline'

type InboxItem =
  | { kind: 'decision'; data: Briefing }
  | { kind: 'alert'; data: Briefing }
  | { kind: 'note'; data: Note }
  | { kind: 'failure'; data: ActivityLogEntry }
  | { kind: 'stalled'; data: Task }

const kindConfig = {
  decision: { icon: '🔴', label: 'Needs Decision', border: 'border-red-500/50', badge: 'bg-red-500/15 text-red-300 border-red-500/40' },
  alert: { icon: '⚠️', label: 'Ops Alert', border: 'border-orange-500/50', badge: 'bg-orange-500/15 text-orange-300 border-orange-500/40' },
  note: { icon: '📝', label: 'Unread Note', border: 'border-blue-500/50', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/40' },
  failure: { icon: '💥', label: 'Failed Action', border: 'border-red-400/40', badge: 'bg-red-400/10 text-red-400 border-red-400/30' },
  stalled: { icon: '⏸️', label: 'Stalled Task', border: 'border-yellow-500/40', badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40' },
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [creatingTask, setCreatingTask] = useState<string | null>(null) // tracks title being created

  const fetchAll = async () => {
    setLoading(true)
    const since24h = new Date(Date.now() - 86400000).toISOString()

    const [briefingsRes, notesRes, failuresRes, tasksRes] = await Promise.all([
      supabase.from('briefings').select('*').neq('status', 'archived').in('type', ['needs_decision', 'ops_alert']).order('created_at', { ascending: false }),
      supabase.from('notes').select('*').eq('status', 'unseen').order('created_at', { ascending: false }),
      supabase.from('activity_log').select('*').eq('outcome', 'failed').gte('timestamp', since24h).order('timestamp', { ascending: false }),
      supabase.from('tasks').select('*').eq('status', 'in_progress').order('updated_at', { ascending: true }),
    ])

    const allTasks = tasksRes.data || []
    setTasks(allTasks)

    // Stalled = in_progress for more than 12h without an update
    const stalledTasks = allTasks.filter(t => {
      const hoursStalled = (Date.now() - new Date(t.updated_at).getTime()) / 3600000
      return hoursStalled > 12
    })

    const collected: InboxItem[] = [
      ...(briefingsRes.data || []).filter(b => b.type === 'needs_decision').map(b => ({ kind: 'decision' as const, data: b })),
      ...(briefingsRes.data || []).filter(b => b.type === 'ops_alert').map(b => ({ kind: 'alert' as const, data: b })),
      ...(notesRes.data || []).map(n => ({ kind: 'note' as const, data: n })),
      ...(failuresRes.data || []).map(l => ({ kind: 'failure' as const, data: l })),
      ...stalledTasks.map(t => ({ kind: 'stalled' as const, data: t })),
    ]

    setItems(collected)
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()

    const sub = supabase.channel('inbox-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'briefings' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, fetchAll)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, fetchAll)
      .subscribe()

    return () => { sub.unsubscribe() }
  }, [])

  const resolveBriefing = async (id: string) => {
    await supabase.from('briefings').update({ status: 'archived' }).eq('id', id)
    setItems(prev => prev.filter(i => !(i.kind === 'decision' || i.kind === 'alert') || (i.data as Briefing).id !== id))
  }

  const resolveNote = async (id: string) => {
    await supabase.from('notes').update({ status: 'seen' }).eq('id', id)
    setItems(prev => prev.filter(i => !(i.kind === 'note') || (i.data as Note).id !== id))
  }

  const createTaskFromItem = async (title: string) => {
    if (creatingTask) return // already creating something
    setCreatingTask(title)
    try {
      // Check for existing open task with same title to avoid duplicates
      const { data: existing } = await supabase
        .from('tasks')
        .select('id')
        .eq('title', title)
        .in('status', ['todo', 'in_progress'])
        .limit(1)
      if (existing && existing.length > 0) return // already exists
      const taskId = `TASK-${Date.now().toString(36).toUpperCase()}`
      await supabase.from('tasks').insert({ task_id: taskId, title, priority: 'high', status: 'todo', origin: 'user' })
    } finally {
      setCreatingTask(null)
    }
  }

  const decisionItems = items.filter(i => i.kind === 'decision')
  const otherItems = items.filter(i => i.kind !== 'decision')

  return (
    <div className="min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-3">
            <InboxIcon className="w-7 h-7 text-ft-light" />
            Ops Inbox
          </h1>
          <p className="text-sm text-klaus-muted mt-1">Everything that needs your attention, in one place.</p>
        </div>
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {items.length} open
            </span>
          )}
          <button onClick={fetchAll} className="btn text-xs px-3 py-1.5">Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-klaus-muted">Loading inbox…</div>
      ) : items.length === 0 ? (
        <div className="card text-center py-16">
          <CheckCircleIcon className="w-14 h-14 text-green-500 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-white mb-2">All clear</h2>
          <p className="text-sm text-klaus-muted">No decisions needed, no failures, no stalled tasks.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Needs Decision — top, full width, prominent */}
          {decisionItems.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-widest font-bold text-red-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Needs Your Decision ({decisionItems.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {decisionItems.map((item) => (
                  <InboxCard key={(item.data as Briefing).id} item={item} tasks={tasks}
                    creatingTask={creatingTask}
                    onResolve={() => resolveBriefing((item.data as Briefing).id)}
                    onCreateTask={() => createTaskFromItem((item.data as Briefing).title)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Everything else */}
          {otherItems.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-widest font-bold text-klaus-muted mb-3">
                Other Items ({otherItems.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {otherItems.map((item, idx) => {
                  const id = 'id' in item.data ? item.data.id : idx.toString()
                  return (
                    <InboxCard key={id} item={item} tasks={tasks}
                      creatingTask={creatingTask}
                      onResolve={item.kind === 'note' ? () => resolveNote((item.data as Note).id) : item.kind === 'alert' ? () => resolveBriefing((item.data as Briefing).id) : undefined}
                      onCreateTask={item.kind === 'stalled'
                        ? undefined
                        : () => createTaskFromItem(
                          item.kind === 'note' ? (item.data as Note).content.slice(0, 80)
                            : item.kind === 'failure' ? `Fix: ${(item.data as ActivityLogEntry).action_type}`
                              : (item.data as Briefing).title
                        )}
                    />
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function InboxCard({ item, tasks, creatingTask, onResolve, onCreateTask }: {
  item: InboxItem
  tasks: Task[]
  creatingTask: string | null
  onResolve?: () => void
  onCreateTask?: () => void
}) {
  const cfg = kindConfig[item.kind]

  let title = ''
  let body = ''
  let ts = ''
  let taskId: string | null = null

  if (item.kind === 'decision' || item.kind === 'alert') {
    const b = item.data as Briefing
    title = b.title
    body = b.content
    ts = b.created_at
    taskId = b.related_task_id
  } else if (item.kind === 'note') {
    const n = item.data as Note
    title = 'Note from Fernando'
    body = n.content
    ts = n.created_at
    taskId = n.related_task_id
  } else if (item.kind === 'failure') {
    const l = item.data as ActivityLogEntry
    title = `Failed: ${l.action_type}`
    body = l.target || JSON.stringify(l.metadata || {})
    ts = l.timestamp
  } else if (item.kind === 'stalled') {
    const t = item.data as Task
    const hrs = Math.floor((Date.now() - new Date(t.updated_at).getTime()) / 3600000)
    title = t.title
    body = `In progress for ${hrs}h with no update. Task ID: ${t.task_id}`
    ts = t.updated_at
    taskId = t.task_id
  }

  const linkedTask = taskId ? tasks.find(t => t.task_id === taskId) : null

  return (
    <div className={`bg-klaus-bg border ${cfg.border} rounded-xl p-4 flex flex-col gap-3`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>{cfg.icon}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cfg.badge}`}>{cfg.label}</span>
        </div>
        <span className="text-[10px] text-klaus-muted shrink-0">{timeAgo(ts)}</span>
      </div>

      <div>
        <p className="text-sm font-bold text-white leading-snug">{title}</p>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-4 whitespace-pre-line">{body}</p>
      </div>

      {linkedTask && (
        <div className="text-[10px] text-ft-light/60 font-mono bg-black/20 px-2 py-1 rounded">
          → {linkedTask.task_id}: {linkedTask.title}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-klaus-border/50">
        {onCreateTask && (
          <button
            onClick={onCreateTask}
            disabled={!!creatingTask}
            className="flex items-center gap-1 text-[11px] text-ft-light hover:text-white font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <DocumentPlusIcon className="w-3.5 h-3.5" />
            {creatingTask ? 'Creating…' : 'Create Task'}
          </button>
        )}
        {onResolve && (
          <button
            onClick={onResolve}
            className="flex items-center gap-1 text-[11px] text-green-400 hover:text-green-300 font-semibold transition-colors ml-auto"
          >
            <CheckCircleIcon className="w-3.5 h-3.5" />
            Resolve
          </button>
        )}
      </div>
    </div>
  )
}
