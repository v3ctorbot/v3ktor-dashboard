'use client'

import { useState, useEffect } from 'react'
import { OperationalState } from '@/lib/types'

interface StatusPanelProps {
  state: OperationalState
  currentTask: string | null
  currentTaskId: string | null
  lastSeen: string | null
  activeModel: string | null | undefined
  activeSubAgents: Array<{ role: string; assigned_task: string; status: string }>
}

type HealthLevel = 'healthy' | 'stale' | 'dead'

function getHealth(lastSeen: string | null): { level: HealthLevel; label: string; age: string } {
  if (!lastSeen) return { level: 'dead', label: 'Offline', age: '—' }
  const minutesAgo = (Date.now() - new Date(lastSeen).getTime()) / 60000
  if (minutesAgo < 10) return { level: 'healthy', label: 'Live', age: `${Math.floor(minutesAgo)}m ago` }
  if (minutesAgo < 30) return { level: 'stale', label: 'Stale', age: `${Math.floor(minutesAgo)}m ago` }
  const h = Math.floor(minutesAgo / 60)
  return { level: 'dead', label: 'Offline', age: h >= 1 ? `${h}h ago` : `${Math.floor(minutesAgo)}m ago` }
}

const stateStyles: Record<OperationalState, { bg: string; text: string; dot: string; label: string }> = {
  working: { bg: 'bg-green-500/15 border-green-500/40',  text: 'text-green-300',  dot: 'bg-green-400 animate-pulse', label: 'Working'  },
  idle:    { bg: 'bg-yellow-500/15 border-yellow-500/40', text: 'text-yellow-300', dot: 'bg-yellow-400',              label: 'Idle'     },
  waiting: { bg: 'bg-blue-500/15 border-blue-500/40',    text: 'text-blue-300',   dot: 'bg-blue-400 animate-pulse',  label: 'Waiting'  },
  offline: { bg: 'bg-red-500/15 border-red-500/40',      text: 'text-red-300',    dot: 'bg-red-500',                 label: 'Offline'  },
}

const MODEL_SHORT: Record<string, string> = {
  'anthropic/claude-sonnet-4-6': 'Sonnet 4.6',
  'anthropic/claude-opus-4-6':   'Opus 4.6',
  'anthropic/claude-opus-4-5':   'Opus 4.5',
  'anthropic/claude-haiku':      'Haiku',
  'google/gemini-2.5-pro':       'Gemini 2.5 Pro',
  'google/gemini-2.0-flash':     'Gemini Flash',
  'openai/gpt-4o':               'GPT-4o',
  'deepseek/deepseek-chat':      'DeepSeek V3',
}

export default function StatusPanel({
  state, currentTask, currentTaskId, lastSeen, activeModel, activeSubAgents,
}: StatusPanelProps) {
  const [time, setTime] = useState('')
  const [health, setHealth] = useState(() => getHealth(lastSeen))

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setHealth(getHealth(lastSeen))
    const id = setInterval(() => setHealth(getHealth(lastSeen)), 30000)
    return () => clearInterval(id)
  }, [lastSeen])

  const healthDot: Record<HealthLevel, string> = { healthy: 'bg-green-400 animate-pulse', stale: 'bg-yellow-400', dead: 'bg-red-500' }
  const healthText: Record<HealthLevel, string> = { healthy: 'text-green-400', stale: 'text-yellow-400', dead: 'text-red-400' }

  const ss = stateStyles[state]
  const modelName = activeModel ? (MODEL_SHORT[activeModel] ?? activeModel.split('/').pop()) : null

  return (
    <div className="card h-full flex flex-col gap-3">
      {/* Row 1: Identity + health + clock */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 100 100" className="w-7 h-7 shrink-0">
            <defs>
              <linearGradient id="bolt2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#FBBF24" />
              </linearGradient>
            </defs>
            <polygon points="50,5 25,45 45,45 35,75 65,50 50,50 75,45 50,5" fill="url(#bolt2)" stroke="#fff" strokeWidth="2" />
          </svg>
          <span className="text-lg font-bold font-heading text-white">V3ktor</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Health */}
          <div className="flex items-center gap-1.5 bg-klaus-bg border border-klaus-border px-2.5 py-1 rounded-lg">
            <span className={`w-1.5 h-1.5 rounded-full ${healthDot[health.level]}`} />
            <span className={`text-[11px] font-semibold ${healthText[health.level]}`}>{health.label}</span>
            <span className="text-[11px] text-klaus-muted">{health.age}</span>
          </div>
          {/* Clock */}
          <div className="text-xs text-klaus-muted font-mono bg-klaus-bg border border-klaus-border px-2.5 py-1 rounded-lg">{time}</div>
        </div>
      </div>

      {/* Row 2: State + Task + Model */}
      <div className="grid grid-cols-12 gap-3 flex-1">
        {/* State */}
        <div className="col-span-3 flex flex-col gap-1.5">
          <label className="text-[10px] text-klaus-muted uppercase tracking-wider font-semibold">State</label>
          <div className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 ${ss.bg}`}>
            <span className={`w-2 h-2 rounded-full ${ss.dot}`} />
            <span className={`text-sm font-bold ${ss.text}`}>{ss.label}</span>
          </div>
        </div>

        {/* Current Task */}
        <div className="col-span-6 flex flex-col gap-1.5">
          <label className="text-[10px] text-klaus-muted uppercase tracking-wider font-semibold">Current Task</label>
          <div className="flex-1 flex items-center bg-klaus-bg border border-klaus-border rounded-lg px-3 py-2 min-h-[42px]">
            {currentTask ? (
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-sm font-medium text-gray-200 truncate">{currentTask}</span>
                {currentTaskId && <span className="text-[10px] text-gray-500 font-mono shrink-0">{currentTaskId}</span>}
              </div>
            ) : (
              <span className="text-sm text-gray-500 italic">No active task</span>
            )}
          </div>
        </div>

        {/* Active Model */}
        <div className="col-span-3 flex flex-col gap-1.5">
          <label className="text-[10px] text-klaus-muted uppercase tracking-wider font-semibold">Model</label>
          <div className="flex-1 flex items-center bg-klaus-bg border border-klaus-border rounded-lg px-3 py-2 min-h-[42px]">
            {modelName ? (
              <span className="text-xs font-semibold text-ft-light truncate">{modelName}</span>
            ) : (
              <span className="text-xs text-gray-600 italic">—</span>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Sub-agents (only if active) */}
      {activeSubAgents.length > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t border-klaus-border overflow-x-auto">
          <span className="text-[10px] text-klaus-muted shrink-0 uppercase tracking-wider">Sub-agents</span>
          {activeSubAgents.map((a, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-xs shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              {a.role}
              {a.assigned_task && <span className="text-blue-400/60 text-[10px]">· {a.assigned_task}</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
