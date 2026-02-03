'use client'

import { ActivityLogEntry, Outcome } from '@/lib/types'
import { ClockIcon } from '@heroicons/react/24/outline'

interface ActivityLogProps {
  logs: ActivityLogEntry[]
}

export default function ActivityLog({ logs }: ActivityLogProps) {
  const outcomeColors: Record<Outcome, string> = {
    success: 'text-green-600',
    partial: 'text-yellow-600',
    failed: 'text-red-600',
  }

  const outcomeIcons: Record<Outcome, string> = {
    success: 'Success',
    partial: 'Partial',
    failed: 'Failed',
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ClockIcon className="w-6 h-6 text-ft-dark" />
          <h2 className="text-xl font-bold text-ft-dark font-heading">Activity Log</h2>
        </div>
        <div className="text-sm text-gray-500">Recent events</div>
      </div>

      {logs.length === 0 ? (
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">✳</div>
          <p className="italic">No activity recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[520px] overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="border border-gray-100 p-4 rounded-md hover:shadow-md transition-shadow bg-white">
              <div className="flex items-start gap-3">
                <div className="text-sm font-mono text-gray-400 min-w-[120px]">{new Date(log.timestamp).toLocaleString()}</div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{log.action_type}</div>
                      {log.target && <div className="text-sm text-gray-500">→ {log.target}</div>}
                      <div className="text-xs text-gray-500 mt-1">by {log.actor}</div>
                    </div>

                    {log.outcome && (
                      <div className={`text-sm font-semibold ${outcomeColors[log.outcome]}`}>{outcomeIcons[log.outcome]}</div>
                    )}
                  </div>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <details className="text-sm mt-2">
                      <summary className="cursor-pointer text-ft-secondary-2 hover:underline">Details</summary>
                      <div className="mt-2 pl-3 border-l-2 border-gray-100 text-gray-600">
                        {Object.entries(log.metadata).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="font-medium text-gray-700">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
