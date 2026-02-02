'use client'

import { ActivityLogEntry, Outcome } from '@/lib/types'

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
    success: '✅',
    partial: '⚠️',
    failed: '❌',
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-ft-dark font-heading">
        📋 Activity Log (ABSOLUTELY NON-NEGOTIABLE)
      </h2>

      {logs.length === 0 ? (
        <p className="text-gray-500 italic">No activity recorded yet.</p>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="border border-ft-neutral p-4 rounded-md hover:shadow-md transition-shadow">
              {/* Timestamp */}
              <div className="text-xs text-gray-500 mb-2 font-mono">
                {new Date(log.timestamp).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </div>

              {/* Main Entry */}
              <div className="flex gap-4 mb-2">
                {/* Actor */}
                <div className="font-semibold text-ft-dark min-w-[100px]">
                  {log.actor}
                </div>

                {/* Action Type */}
                <div className="flex-1">
                  <span className="font-medium">{log.action_type}</span>
                  {log.target && <span className="text-gray-600"> → {log.target}</span>}
                </div>

                {/* Outcome */}
                {log.outcome && (
                  <div className={`font-bold ${outcomeColors[log.outcome]}`}>
                    {outcomeIcons[log.outcome]} {log.outcome}
                  </div>
                )}
              </div>

              {/* Metadata */}
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-ft-secondary-2 hover:underline">
                    Details
                  </summary>
                  <div className="mt-2 pl-4 border-l-2 border-ft-neutral text-gray-600">
                    {Object.entries(log.metadata).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
