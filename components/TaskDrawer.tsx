'use client'

import { Task, ActivityLogEntry, Outcome } from '@/lib/types'
import { XMarkIcon, ClockIcon } from '@heroicons/react/24/outline'

interface TaskDrawerProps {
  task: Task
  logs: ActivityLogEntry[]
  onClose: () => void
}

const outcomeColors: Record<Outcome, string> = {
  success: 'text-green-400',
  partial: 'text-yellow-400',
  failed: 'text-red-400',
}

const outcomeBar: Record<Outcome, string> = {
  success: 'bg-green-500',
  partial: 'bg-yellow-400',
  failed: 'bg-red-500',
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

const statusBadge: Record<string, string> = {
  todo: 'bg-slate-700 text-slate-300',
  in_progress: 'bg-blue-500/20 text-blue-300',
  done: 'bg-green-500/20 text-green-300',
}

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function TaskDrawer({ task, logs, onClose }: TaskDrawerProps) {
  // Filter logs linked to this task — check metadata.task_id or target field
  const linked = logs
    .filter((l) => {
      const metaMatch = l.metadata?.task_id === task.task_id
      const targetMatch = l.target === task.task_id
      return metaMatch || targetMatch
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#151E32] border-l border-klaus-border z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-klaus-border">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-1.5 rounded uppercase font-bold tracking-wider ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${statusBadge[task.status]}`}>
                {task.status.replace('_', ' ')}
              </span>
              <span className="text-[10px] text-klaus-muted font-mono">{task.task_id}</span>
            </div>
            <h2 className="text-base font-bold text-white leading-snug">{task.title}</h2>
            {task.description && (
              <p className="text-xs text-klaus-muted mt-1 leading-relaxed">{task.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-klaus-muted hover:text-white transition-colors shrink-0"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 px-5 py-2 border-b border-klaus-border/50 text-[10px] text-klaus-muted">
          <span>Origin: <span className="text-white font-semibold">{task.origin}</span></span>
          <span>Created: <span className="text-white font-semibold">{new Date(task.created_at).toLocaleDateString()}</span></span>
          <span>Updated: <span className="text-white font-semibold">{relativeTime(task.updated_at)}</span></span>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-4 h-4 text-ft-light" />
            <h3 className="text-sm font-bold text-white">Activity Timeline</h3>
            <span className="text-[10px] text-klaus-muted ml-auto">{linked.length} entries</span>
          </div>

          {linked.length === 0 ? (
            <div className="text-center py-10 text-klaus-muted">
              <div className="rounded-full bg-klaus-bg w-12 h-12 flex items-center justify-center mx-auto mb-3 border border-klaus-border">
                <ClockIcon className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm italic">No activity linked to this task yet.</p>
              <p className="text-xs mt-1 text-gray-600">
                V3ktor logs work by including<br />
                <code className="text-ft-light/70">{`{"task_id":"${task.task_id}"}`}</code><br />
                in the metadata field.
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-klaus-border" />

              <div className="space-y-4">
                {linked.map((log, idx) => (
                  <div key={log.id} className="flex gap-3 relative">
                    {/* Dot */}
                    <div className={`w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 border-2 border-[#151E32] z-10 ${log.outcome ? outcomeBar[log.outcome] : 'bg-slate-500'}`} />

                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-gray-200">{log.action_type}</span>
                        {log.outcome && (
                          <span className={`text-[10px] font-bold uppercase shrink-0 ${outcomeColors[log.outcome]}`}>
                            {log.outcome}
                          </span>
                        )}
                      </div>

                      {log.target && log.target !== task.task_id && (
                        <p className="text-xs text-gray-500 truncate">→ {log.target}</p>
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-ft-light/60 font-mono">{log.actor}</span>
                        <span className="text-[10px] text-gray-600">{new Date(log.timestamp).toLocaleString()}</span>
                        <span className="text-[10px] text-gray-600 ml-auto">{relativeTime(log.timestamp)}</span>
                      </div>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="mt-1.5">
                          <summary className="text-[10px] text-klaus-muted cursor-pointer hover:text-white">Details</summary>
                          <pre className="mt-1 text-[10px] bg-black/30 p-2 rounded overflow-x-auto text-gray-400 border border-klaus-border/50 font-mono">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
