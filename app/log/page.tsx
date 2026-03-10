'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ActivityLogEntry, Outcome } from '@/lib/types'
import { ClockIcon, FunnelIcon } from '@heroicons/react/24/outline'

const outcomeColors: Record<Outcome, string> = {
  success: 'text-green-400',
  partial: 'text-yellow-400',
  failed: 'text-red-400',
}

const outcomeBorder: Record<Outcome, string> = {
  success: 'border-l-green-500/50',
  partial: 'border-l-yellow-400/50',
  failed: 'border-l-red-500/70',
}

export default function LogPage() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterOutcome, setFilterOutcome] = useState<Outcome | 'all'>('all')
  const [filterActor, setFilterActor] = useState<string>('all')
  const [filterAction, setFilterAction] = useState<string>('')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 50

  useEffect(() => {
    supabase.from('activity_log').select('*').order('timestamp', { ascending: false }).then(({ data }) => {
      if (data) setLogs(data)
      setLoading(false)
    })

    const sub = supabase.channel('log-page')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, (payload) => {
        setLogs(p => [payload.new as ActivityLogEntry, ...p])
      })
      .subscribe()

    return () => { sub.unsubscribe() }
  }, [])

  const actors = [...new Set(logs.map(l => l.actor))].filter(Boolean)

  const filtered = logs.filter(l => {
    const outcomeMatch = filterOutcome === 'all' || l.outcome === filterOutcome
    const actorMatch = filterActor === 'all' || l.actor === filterActor
    const actionMatch = !filterAction || l.action_type.toLowerCase().includes(filterAction.toLowerCase())
    return outcomeMatch && actorMatch && actionMatch
  })

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  return (
    <div className="min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-3">
            <ClockIcon className="w-7 h-7 text-ft-light" />
            Activity Log
          </h1>
          <p className="text-sm text-klaus-muted mt-1">Full audit trail — {logs.length} entries total.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6 flex flex-wrap gap-3 items-center">
        <FunnelIcon className="w-4 h-4 text-ft-light shrink-0" />
        <input
          className="input text-xs px-2 py-1.5 w-48"
          placeholder="Filter by action…"
          value={filterAction}
          onChange={e => { setFilterAction(e.target.value); setPage(0) }}
        />
        <select
          className="bg-klaus-bg border border-klaus-border text-xs rounded px-2 py-1.5 text-klaus-text"
          value={filterOutcome}
          onChange={e => { setFilterOutcome(e.target.value as any); setPage(0) }}
        >
          <option value="all">All Outcomes</option>
          <option value="success">Success</option>
          <option value="partial">Partial</option>
          <option value="failed">Failed</option>
        </select>
        <select
          className="bg-klaus-bg border border-klaus-border text-xs rounded px-2 py-1.5 text-klaus-text"
          value={filterActor}
          onChange={e => { setFilterActor(e.target.value); setPage(0) }}
        >
          <option value="all">All Actors</option>
          {actors.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className="text-xs text-klaus-muted ml-auto">{filtered.length} matching</span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-klaus-muted">Loading…</div>
      ) : paged.length === 0 ? (
        <div className="card text-center py-16 text-klaus-muted italic">No entries match your filters.</div>
      ) : (
        <div className="card flex flex-col divide-y divide-klaus-border/40">
          {paged.map(log => (
            <div key={log.id} className={`py-3 px-4 border-l-2 ${log.outcome ? outcomeBorder[log.outcome] : 'border-l-transparent'} hover:bg-white/[0.02] transition-colors`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-200">{log.action_type}</span>
                    {log.target && <span className="text-xs text-gray-500 truncate max-w-xs">→ {log.target}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-ft-light/60 font-mono">{log.actor}</span>
                    <span className="text-[10px] text-gray-600">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <details className="mt-1.5">
                      <summary className="text-[10px] text-gray-600 cursor-pointer hover:text-gray-400">Details</summary>
                      <pre className="mt-1 text-[10px] bg-black/30 p-2 rounded overflow-x-auto text-gray-400 border border-klaus-border/40 font-mono">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {log.outcome && (
                    <span className={`text-[10px] font-bold uppercase ${outcomeColors[log.outcome]}`}>{log.outcome}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn text-xs px-3 py-1.5 disabled:opacity-30">← Prev</button>
          <span className="text-xs text-klaus-muted">Page {page + 1} of {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="btn text-xs px-3 py-1.5 disabled:opacity-30">Next →</button>
        </div>
      )}
    </div>
  )
}
