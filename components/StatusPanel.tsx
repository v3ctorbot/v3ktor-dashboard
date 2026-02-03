import { useState, useEffect } from 'react'
import { OperationalState } from '@/lib/types'
import { BoltIcon } from '@heroicons/react/24/outline'

interface StatusPanelProps {
  state: OperationalState
  currentTask: string | null
  currentTaskId: string | null
  activeSubAgents: Array<{
    role: string
    assigned_task: string
    status: string
  }>
}

export default function StatusPanel({ state, currentTask, currentTaskId, activeSubAgents }: StatusPanelProps) {
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

  return (
    <div className="card h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <BoltIcon className="text-ft-light" style={{ width: '20px', height: '20px' }} />
          <div>
            <h2 className="text-xl font-bold font-heading text-white">V3ktor Status</h2>
          </div>
        </div>
        <div className="text-xs text-klaus-muted font-mono bg-klaus-bg px-2 py-1 rounded border border-klaus-border">{time}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
        {/* Operational State */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-klaus-muted uppercase tracking-wider font-semibold">State</label>
          <div className={`px-3 py-1.5 rounded-md text-sm font-semibold text-center border ${stateColors[state]}`}>
            {stateLabels[state]}
          </div>
        </div>

        {/* Current Primary Task */}
        <div className="flex flex-col gap-1 lg:col-span-2">
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
