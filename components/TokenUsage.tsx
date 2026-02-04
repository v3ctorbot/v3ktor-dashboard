'use client'

import type { TokenUsage } from '@/lib/types'
import { ChartBarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

interface TokenUsageProps {
  usage: TokenUsage[]
}

// Model display names and cost tiers
const MODEL_INFO: Record<string, { name: string; tier: string; color: string }> = {
  'anthropic/claude-opus-4-5': { name: 'Claude Opus', tier: '💰💰💰', color: 'text-amber-400' },
  'anthropic/claude-sonnet-4': { name: 'Claude Sonnet', tier: '💰💰', color: 'text-blue-400' },
  'anthropic/claude-haiku': { name: 'Claude Haiku', tier: '💰', color: 'text-green-400' },
  'openai/gpt-4o': { name: 'GPT-4o', tier: '💰💰', color: 'text-purple-400' },
  'zai/glm-4.7': { name: 'GLM-4.7', tier: '💰', color: 'text-cyan-400' },
  'deepseek/deepseek-chat': { name: 'DeepSeek V3', tier: '💰', color: 'text-blue-500' },
  'google/gemini-2.5-pro': { name: 'Gemini 2.5 Pro', tier: '💰', color: 'text-indigo-400' },
  'google/gemini-3-pro-preview': { name: 'Gemini 3 Pro', tier: '💰💰', color: 'text-indigo-500' },
  'unknown': { name: 'Unknown', tier: '', color: 'text-gray-400' }
}

function getModelInfo(model: string) {
  return MODEL_INFO[model] || MODEL_INFO['unknown']
}

export default function TokenUsage({ usage }: TokenUsageProps) {
  // Calculate totals with new fields
  const totalInput = usage.reduce((sum, e) => sum + (e.input_tokens || 0), 0)
  const totalOutput = usage.reduce((sum, e) => sum + (e.output_tokens || 0), 0)
  const totalTokens = usage.reduce((sum, e) => sum + (e.tokens_used || 0), 0)
  const totalCost = usage.reduce((sum, e) => sum + (parseFloat(String(e.estimated_cost)) || 0), 0)
  
  // Get latest model info
  const latestEntry = usage[0]
  const currentModel = latestEntry?.model || 'unknown'
  const modelInfo = getModelInfo(currentModel)

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-klaus-border pb-3">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="text-ft-light w-5 h-5" />
          <h2 className="text-xl font-bold mb-0 text-white font-heading">Token Usage</h2>
        </div>
        {totalCost > 0 && (
          <div className="flex items-center gap-1 text-amber-400 text-sm font-medium">
            <CurrencyDollarIcon className="w-4 h-4" />
            <span>${totalCost.toFixed(4)}</span>
          </div>
        )}
      </div>

      {/* Current Model Indicator */}
      {latestEntry && (
        <div className="bg-klaus-bg border border-klaus-border rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-klaus-muted uppercase tracking-wider mb-1">Active Model</div>
              <div className={`font-bold ${modelInfo.color}`}>{modelInfo.name}</div>
            </div>
            <div className="text-right">
              <div className="text-lg">{modelInfo.tier}</div>
              <div className="text-xs text-klaus-muted">Cost Tier</div>
            </div>
          </div>
          {latestEntry.context_used !== undefined && latestEntry.context_max !== undefined && latestEntry.context_max > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-klaus-muted mb-1">
                <span>Context Window</span>
                <span>{Math.round((latestEntry.context_used / latestEntry.context_max) * 100)}%</span>
              </div>
              <div className="w-full bg-klaus-card rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-ft-light to-cyan-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((latestEntry.context_used / latestEntry.context_max) * 100, 100)}%` }}
                />
              </div>
              <div className="text-xs text-klaus-muted mt-1">
                {(latestEntry.context_used || 0).toLocaleString()} / {(latestEntry.context_max || 0).toLocaleString()} tokens
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-klaus-bg border border-klaus-border p-2 rounded-lg text-center">
          <div className="text-lg font-bold text-green-400">{totalInput.toLocaleString()}</div>
          <div className="text-[9px] text-klaus-muted uppercase tracking-wider">Input</div>
        </div>
        <div className="bg-klaus-bg border border-klaus-border p-2 rounded-lg text-center">
          <div className="text-lg font-bold text-orange-400">{totalOutput.toLocaleString()}</div>
          <div className="text-[9px] text-klaus-muted uppercase tracking-wider">Output (5x cost)</div>
        </div>
      </div>

      {/* Usage History */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1 min-h-0 max-h-[280px]">
        {usage.length === 0 ? (
          <div className="text-center py-6 text-gray-500 italic text-sm">No usage history.</div>
        ) : (
          usage.slice(0, 10).map((entry) => {
            const model = getModelInfo(entry.model || 'unknown')
            const inputPct = entry.tokens_used > 0 ? ((entry.input_tokens || 0) / entry.tokens_used) * 100 : 50
            
            return (
              <div key={entry.id} className="bg-klaus-card p-2 rounded-md border border-klaus-border text-xs hover:border-ft-light/30 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className={`font-medium ${model.color}`}>{model.name}</span>
                    <div className="text-klaus-muted text-[10px]">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{(entry.tokens_used || 0).toLocaleString()}</div>
                    {entry.estimated_cost !== undefined && parseFloat(String(entry.estimated_cost)) > 0 && (
                      <div className="text-amber-400 text-[10px]">${parseFloat(String(entry.estimated_cost)).toFixed(4)}</div>
                    )}
                  </div>
                </div>
                
                {/* Input/Output Bar */}
                <div className="w-full bg-klaus-bg rounded-full h-1.5 overflow-hidden flex">
                  <div
                    className="bg-green-500 h-1.5"
                    style={{ width: `${inputPct}%` }}
                    title={`Input: ${entry.input_tokens || 0}`}
                  />
                  <div
                    className="bg-orange-500 h-1.5"
                    style={{ width: `${100 - inputPct}%` }}
                    title={`Output: ${entry.output_tokens || 0}`}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
