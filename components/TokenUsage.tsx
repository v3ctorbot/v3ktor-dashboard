'use client'

import type { TokenUsage } from '@/lib/types'

interface TokenUsageProps {
  usage: TokenUsage[]
}

export default function TokenUsage({ usage }: TokenUsageProps) {
  const totalTokens = usage.reduce((sum, entry) => sum + entry.tokens_used, 0)
  const avgPerSession = usage.length > 0 ? Math.round(totalTokens / usage.length) : 0

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-ft-dark" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a6 6 0 100 12A6 6 0 0010 2zM9 7h2v3H9V7z" />
        </svg>
        <h2 className="text-xl font-bold mb-0 text-ft-dark font-heading">Token Usage</h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-ft-dark">{totalTokens.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Tokens Used</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-ft-dark">{usage.length}</div>
          <div className="text-sm text-gray-600">Sessions Tracked</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-ft-dark">{avgPerSession.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Avg Per Session</div>
        </div>
      </div>

      {/* Usage History */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {usage.map((entry) => (
          <div key={entry.id} className="flex justify-between items-center bg-white p-3 rounded-md text-sm border border-gray-100">
            <div className="flex-1">
              <div className="font-medium text-gray-800">Session: {entry.session_id}</div>
              <div className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</div>
            </div>
            <div className="text-lg font-bold text-ft-dark">{entry.tokens_used.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
