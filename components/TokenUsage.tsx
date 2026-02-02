'use client'

import { TokenUsage } from '@/lib/types'

interface TokenUsageProps {
  usage: TokenUsage[]
}

export default function TokenUsage({ usage }: TokenUsageProps) {
  const totalTokens = usage.reduce((sum, entry) => sum + entry.tokens_used, 0)
  const avgPerSession = usage.length > 0 ? Math.round(totalTokens / usage.length) : 0

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-ft-dark font-heading">
        💰 Token Usage (Simple Tracking)
      </h2>

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
          <div key={entry.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md text-sm">
            <div className="flex-1">
              <div className="font-medium text-gray-800">Session: {entry.session_id}</div>
              <div className="text-xs text-gray-500">
                {new Date(entry.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="text-lg font-bold text-ft-dark">
              {entry.tokens_used.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
