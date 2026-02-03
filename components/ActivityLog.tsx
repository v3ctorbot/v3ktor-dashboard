'use client'

import { ActivityLogEntry, Outcome } from '@/lib/types'
import { ClockIcon } from '@heroicons/react/24/outline'

interface ActivityLogProps {
  logs: ActivityLogEntry[]
}

export default function ActivityLog({ logs }: ActivityLogProps) {
  const outcomeColors: Record<Outcome, string> = {
    success: 'text-green-400',
    partial: 'text-yellow-400',
    failed: 'text-red-400',
  }

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-klaus-border pb-3">
        <div className="flex items-center gap-3">
          <ClockIcon className="text-ft-light" style={{ width: '20px', height: '20px' }} />
          <h2 className="text-xl font-bold text-white font-heading">Activity Log</h2>
        </div>
        <div className="text-xs text-klaus-muted uppercase tracking-widest font-semibold">Live Feed</div>
      </div>

      {logs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-2">
          <div className="rounded-full bg-klaus-bg p-3 border border-klaus-border">
            <ClockIcon className="w-6 h-6 text-gray-600" />
          </div>
          <p className="italic text-sm">No activity recorded yet.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="border-l-2 border-l-klaus-border pl-3 py-1 hover:border-l-ft-light transition-colors group">
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs font-mono text-gray-500 group-hover:text-ft-light transition-colors">{new Date(log.timestamp).toLocaleTimeString()}</span>
                {log.outcome && (
                  <span className={`text-[10px] font-bold uppercase ${outcomeColors[log.outcome]}`}>{log.outcome}</span>
                )}
              </div>
              <div className="text-sm font-semibold text-gray-300">{log.action_type}</div>
              {log.target && <div className="text-xs text-gray-500 truncate">→ {log.target}</div>}

              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <details className="mt-1">
                  <summary className="text-[10px] text-klaus-muted cursor-pointer hover:underline opacity-80 hover:opacity-100">Details</summary>
                  <pre className="mt-1 text-[10px] bg-klaus-bg p-1.5 rounded overflow-x-auto text-gray-400 border border-klaus-border font-mono">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
