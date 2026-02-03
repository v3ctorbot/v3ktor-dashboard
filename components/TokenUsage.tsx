'use client'

import type { TokenUsage } from '@/lib/types'

interface TokenUsageProps {
  usage: TokenUsage[]
}

import { ChartBarIcon } from '@heroicons/react/24/outline'

export default function TokenUsage({ usage }: TokenUsageProps) {
  const totalTokens = usage.reduce((sum, entry) => sum + entry.tokens_used, 0)
  const avgPerSession = usage.length > 0 ? Math.round(totalTokens / usage.length) : 0

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4 border-b border-klaus-border pb-3">
        <ChartBarIcon className="text-ft-light w-5 h-5" />
        <h2 className="text-xl font-bold mb-0 text-white font-heading">Token Usage</h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
        <div className="bg-klaus-bg border border-klaus-border p-3 rounded-lg text-center flex flex-col justify-center min-h-[5rem]">
          <div className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</div>
          <div className="text-[10px] text-klaus-muted uppercase tracking-wider whitespace-nowrap overflow-hidden text-overflow-ellipsis">Total Tokens Used</div>
        </div>
        <div className="bg-klaus-bg border border-klaus-border p-3 rounded-lg text-center flex flex-col justify-center min-h-[5rem]">
          <div className="text-2xl font-bold text-white">{usage.length}</div>
          <div className="text-[10px] text-klaus-muted uppercase tracking-wider whitespace-nowrap overflow-hidden text-overflow-ellipsis">Sessions Tracked</div>
        </div>
        <div className="bg-klaus-bg border border-klaus-border p-3 rounded-lg text-center flex flex-col justify-center min-h-[5rem] sm:col-span-2 xl:col-span-1">
          <div className="text-2xl font-bold text-white">{avgPerSession.toLocaleString()}</div>
          <div className="text-[10px] text-klaus-muted uppercase tracking-wider whitespace-nowrap overflow-hidden text-overflow-ellipsis">Avg Per Session</div>
        </div>
      </div>

      {/* Usage History & Visuals */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {usage.length === 0 ? (
          <div className="text-center py-8 text-gray-500 italic">No usage history.</div>
        ) : (
          usage.map((entry) => {
            const maxTokens = Math.max(...usage.map(u => u.tokens_used), 1)
            const percentage = Math.max((entry.tokens_used / maxTokens) * 100, 5) // Min 5% width for visibility
            return (
              <div key={entry.id} className="bg-klaus-card p-3 rounded-md border border-klaus-border text-sm hover:border-ft-light/30 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-medium text-gray-200">Session: {entry.session_id}</div>
                    <div className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="text-lg font-bold text-white">{entry.tokens_used.toLocaleString()}</div>
                </div>

                {/* Simple Bar Chart */}
                <div className="w-full bg-klaus-bg rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-ft-light h-1.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(1,162,233,0.5)]"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
