'use client'

import { useState, useEffect } from 'react'
import { OperationalState } from '@/lib/types'

interface StatusPanelProps {
  state: OperationalState
  currentTask: string | null
  currentTaskId: string | null
  activeSubAgents: Array<{
    role: string
    assigned_task: string
    status: string
  }>
  activeModel?: string | null
}

export default function StatusPanel({ state, currentTask, currentTaskId, activeSubAgents, activeModel }: StatusPanelProps) {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    setTime(new Date().toLocaleTimeString())
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(interval)
  }, [])

  const stateColors = {
    working: 'bg-green-500/20 text-green-300 border-green-500/50',
    idle: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    waiting: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    offline: 'bg-red-500/20 text-red-300 border-red-500/50',
  }

  const stateLabels = {
    working: '🟢 Working',
    idle: '🟡 Idle',
    waiting: '🔵 Waiting for Input',
    offline: '🔴 Offline / Paused',
  }

  // Model display names
  const modelNames: Record<string, string> = {
    'anthropic/claude-opus-4-5': 'Opus 4.5',
    'anthropic/claude-sonnet-4': 'Sonnet 4',
    'zai/glm-4.7': 'GLM-4.7',
    'deepseek/deepseek-chat': 'DeepSeek V3',
    'google/gemini-3-pro-preview': 'Gemini 3 Pro',
    'google/gemini-2.5-pro': 'Gemini 2.5 Pro',
    'unknown': 'Unknown'
  }

  return (
    <div className="card h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        {/* V3ktor Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Lightning Bolt */}
            <svg viewBox="0 0 100 100" className="w-8 h-8">
              <defs>
                <linearGradient id="bolt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#A78BFA" />
                </linearGradient>
              </defs>
              <polygon
                points="50,5 25,45 45,45 35,75 65,50 50,50 75,45 50,5"
                fill="url(#bolt-gradient)"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              {/* Glow effect */}
              <polygon
                points="50,8 27,43 45,43 36,72 62,49 50,49 73,45 50,8"
                fill="#A78BFA"
                opacity="0.3"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-white">V3ktor</h2>
          </div>
        </div>
        <div className="text-xs text-klaus-muted font-mono bg-klaus-bg px-2 py-1 rounded border border-klaus-border">{time}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
        {/* Operational State */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-klaus-muted uppercase tracking-wider font-semibold">State</label>
          <div className={`px-3 py-1.5 rounded-md text-sm font-semibold text-center border ${stateColors[state]}`}>
            {stateLabels[state]}
          </div>
        </div>

        {/* Active Model */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-klaus-muted uppercase tracking-wider font-semibold">Active Model</label>
          <div className="bg-klaus-bg border border-klaus-border px-3 py-1.5 rounded-md text-sm font-medium text-ft-light">
            {modelNames[activeModel || 'unknown'] || activeModel || 'Loading...'}
          </div>
        </div>
      </div>

      {/* Current Primary Task */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-klaus-muted uppercase tracking-wider font-semibold">Current Task</label>
        <div className="bg-klaus-bg border border-klaus-border px-3 py-1.5 rounded-md flex justify-between items-center text-sm min-h-[34px]">
          {currentTask ? (
            <>
              <span className="font-medium text-gray-200 truncate mr-2">{currentTask}</span>
              {currentTaskId && <span className="text-xs text-gray-500 font-mono shrink-0">{currentTaskId}</span>}
            </>
          ) : (
            <span className="text-gray-500 italic">No active task</span>
          )}
        </div>
      </div>

      {/* Active Sub-Agents (Mini Footer) */}
      {activeSubAgents.length > 0 && (
        <div className="mt-3 pt-3 border-t border-klaus-border flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-klaus-muted shrink-0">Sub-Agents:</span>
          {activeSubAgents.map((agent, idx) => (
            <span key={idx} className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded text-xs border border-blue-500/30 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              {agent.role}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
