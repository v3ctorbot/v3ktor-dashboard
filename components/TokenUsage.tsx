'use client'

import { useState } from 'react'
import type { TokenUsage } from '@/lib/types'
import { ChartBarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

interface TokenUsageProps {
  usage: TokenUsage[]
  activeModel?: string | null
}

// Actual pricing per million tokens (USD) — matches CLI
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'anthropic/claude-opus-4-6':    { input: 5,    output: 25   },
  'anthropic/claude-opus-4-5':    { input: 5,    output: 25   },
  'anthropic/claude-sonnet-4-6':  { input: 3,    output: 15   },
  'anthropic/claude-sonnet-4':    { input: 3,    output: 15   },
  'anthropic/claude-haiku':       { input: 0.25, output: 1.25 },
  'openai/gpt-4o':                { input: 2.5,  output: 10   },
  'openai/gpt-4-turbo':           { input: 10,   output: 30   },
  'google/gemini-2.5-pro':        { input: 1.25, output: 10   },
  'google/gemini-2.0-flash':      { input: 0.1,  output: 0.4  },
  'google/gemini-3-pro-preview':  { input: 1.25, output: 10   },
  'deepseek/deepseek-chat':       { input: 0.14, output: 0.28 },
  'deepseek/deepseek-reasoner':   { input: 0.55, output: 2.19 },
  'zai/glm-4.7':                  { input: 0.5,  output: 1.5  },
}

const MODEL_NAME: Record<string, string> = {
  'anthropic/claude-opus-4-6':    'Claude Opus 4.6',
  'anthropic/claude-opus-4-5':    'Claude Opus 4.5',
  'anthropic/claude-sonnet-4-6':  'Claude Sonnet 4.6',
  'anthropic/claude-sonnet-4':    'Claude Sonnet',
  'anthropic/claude-haiku':       'Claude Haiku',
  'openai/gpt-4o':                'GPT-4o',
  'google/gemini-2.5-pro':        'Gemini 2.5 Pro',
  'google/gemini-2.0-flash':      'Gemini 2.0 Flash',
  'google/gemini-3-pro-preview':  'Gemini 3 Pro',
  'deepseek/deepseek-chat':       'DeepSeek V3',
  'deepseek/deepseek-reasoner':   'DeepSeek R1',
  'zai/glm-4.7':                  'GLM-4.7',
}

const MODEL_COLOR: Record<string, string> = {
  'anthropic/claude-opus-4-6':    'text-amber-300',
  'anthropic/claude-opus-4-5':    'text-amber-400',
  'anthropic/claude-sonnet-4-6':  'text-blue-400',
  'anthropic/claude-sonnet-4':    'text-blue-400',
  'anthropic/claude-haiku':       'text-green-400',
  'openai/gpt-4o':                'text-purple-400',
  'google/gemini-2.5-pro':        'text-indigo-400',
  'google/gemini-3-pro-preview':  'text-indigo-400',
  'deepseek/deepseek-chat':       'text-cyan-400',
  'zai/glm-4.7':                  'text-teal-400',
}

function getName(model: string) { return MODEL_NAME[model] ?? model.split('/').pop() ?? model }
function getColor(model: string) { return MODEL_COLOR[model] ?? 'text-gray-400' }
function getPricing(model: string) { return MODEL_PRICING[model] ?? { input: 1, output: 5 } }

function isToday(ts: string) {
  const d = new Date(ts)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

export default function TokenUsagePanel({ usage, activeModel }: TokenUsageProps) {
  const [view, setView] = useState<'today' | 'all'>('today')

  const filtered = view === 'today' ? usage.filter(e => isToday(e.timestamp)) : usage

  const totalCostAll   = usage.reduce((s, e) => s + (parseFloat(String(e.estimated_cost)) || 0), 0)
  const totalCostToday = usage.filter(e => isToday(e.timestamp)).reduce((s, e) => s + (parseFloat(String(e.estimated_cost)) || 0), 0)

  const totalInput  = filtered.reduce((s, e) => s + (e.input_tokens  || 0), 0)
  const totalOutput = filtered.reduce((s, e) => s + (e.output_tokens || 0), 0)

  // Active model from status, fallback to latest log
  const currentModel = activeModel ?? usage[0]?.model ?? null
  const pricing = currentModel ? getPricing(currentModel) : null

  // Latest entry for context window
  const latest = usage[0]
  const hasContext = latest?.context_used && latest?.context_max && latest.context_max > 0 && latest.context_used > 0

  return (
    <div className="card h-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-ft-light" />
          <h2 className="text-base font-bold font-heading text-white">Token Usage</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-amber-400 font-bold">${totalCostAll.toFixed(4)}</span>
          <span className="text-[10px] text-gray-600">all-time</span>
        </div>
      </div>

      {/* Active model + pricing */}
      {currentModel && pricing && (
        <div className="bg-klaus-bg border border-klaus-border rounded-lg p-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[10px] text-klaus-muted uppercase tracking-wider mb-0.5">Active Model</p>
              <p className={`text-sm font-bold ${getColor(currentModel)}`}>{getName(currentModel)}</p>
            </div>
            <div className="text-right text-[10px] text-klaus-muted leading-relaxed">
              <div>${pricing.input}/MTok in</div>
              <div>${pricing.output}/MTok out</div>
            </div>
          </div>

          {/* Context window — only if real data */}
          {hasContext && (
            <div>
              <div className="flex justify-between text-[10px] text-klaus-muted mb-1">
                <span>Context Window</span>
                <span>{Math.round((latest.context_used! / latest.context_max!) * 100)}%</span>
              </div>
              <div className="w-full bg-klaus-card rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-ft-light to-cyan-400 h-1.5 rounded-full"
                  style={{ width: `${Math.min((latest.context_used! / latest.context_max!) * 100, 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-gray-600 mt-1">
                {(latest.context_used!).toLocaleString()} / {(latest.context_max!).toLocaleString()} tokens
              </div>
            </div>
          )}
        </div>
      )}

      {/* Today / All toggle + cost */}
      <div className="flex items-center gap-2">
        <div className="flex bg-klaus-bg border border-klaus-border rounded-lg overflow-hidden text-[11px] font-semibold">
          <button
            onClick={() => setView('today')}
            className={`px-3 py-1.5 transition-colors ${view === 'today' ? 'bg-ft-light/20 text-ft-light' : 'text-klaus-muted hover:text-white'}`}
          >
            Today
          </button>
          <button
            onClick={() => setView('all')}
            className={`px-3 py-1.5 transition-colors ${view === 'all' ? 'bg-ft-light/20 text-ft-light' : 'text-klaus-muted hover:text-white'}`}
          >
            All
          </button>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <CurrencyDollarIcon className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-sm font-bold text-amber-400">
            {view === 'today' ? `$${totalCostToday.toFixed(4)}` : `$${totalCostAll.toFixed(4)}`}
          </span>
        </div>
      </div>

      {/* Token totals */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-klaus-bg border border-klaus-border rounded-lg p-2 text-center">
          <div className="text-base font-bold text-green-400">{totalInput.toLocaleString()}</div>
          <div className="text-[9px] text-gray-600 uppercase tracking-wider">Input tokens</div>
        </div>
        <div className="bg-klaus-bg border border-klaus-border rounded-lg p-2 text-center">
          <div className="text-base font-bold text-orange-400">{totalOutput.toLocaleString()}</div>
          <div className="text-[9px] text-gray-600 uppercase tracking-wider">Output tokens</div>
        </div>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {filtered.length === 0 ? (
          <div className="text-center py-6 text-gray-600 italic text-xs">
            {view === 'today' ? 'No usage logged today.' : 'No usage history.'}
          </div>
        ) : (
          filtered.slice(0, 12).map((entry) => {
            const p = getPricing(entry.model || '')
            const inputCost  = ((entry.input_tokens  || 0) / 1_000_000) * p.input
            const outputCost = ((entry.output_tokens || 0) / 1_000_000) * p.output
            const total = entry.tokens_used || (entry.input_tokens || 0) + (entry.output_tokens || 0)
            const inputPct = total > 0 ? ((entry.input_tokens || 0) / total) * 100 : 50

            return (
              <div key={entry.id} className="bg-klaus-card border border-klaus-border rounded-lg px-2.5 py-2 hover:border-ft-light/30 transition-colors">
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <p className={`text-xs font-semibold ${getColor(entry.model || '')}`}>{getName(entry.model || 'unknown')}</p>
                    <p className="text-[10px] text-gray-600">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">{total.toLocaleString()} tok</p>
                    <p className="text-[10px] text-amber-400">${(inputCost + outputCost).toFixed(4)}</p>
                  </div>
                </div>
                {/* Input/output split bar */}
                <div className="w-full bg-black/30 rounded-full h-1 overflow-hidden flex">
                  <div className="bg-green-500 h-1" style={{ width: `${inputPct}%` }} title={`In: ${(entry.input_tokens||0).toLocaleString()}`} />
                  <div className="bg-orange-500 h-1" style={{ width: `${100 - inputPct}%` }} title={`Out: ${(entry.output_tokens||0).toLocaleString()}`} />
                </div>
                <div className="flex justify-between text-[9px] text-gray-700 mt-0.5">
                  <span>in {(entry.input_tokens||0).toLocaleString()}</span>
                  <span>out {(entry.output_tokens||0).toLocaleString()}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
