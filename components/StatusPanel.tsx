'use client'

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
}

export default function StatusPanel({ state, currentTask, currentTaskId, activeSubAgents }: StatusPanelProps) {
  const stateColors = {
    working: 'bg-green-100 text-green-800 border-green-300',
    idle: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    waiting: 'bg-blue-100 text-blue-800 border-blue-300',
    offline: 'bg-red-100 text-red-800 border-red-300',
  }

  const stateLabels = {
    working: '🟢 Working',
    idle: '🟡 Idle',
    waiting: '🔵 Waiting for Input',
    offline: '🔴 Offline / Paused',
  }

  return (
    <div className="bg-ft-light text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 font-heading">V3ktor Status</h2>

      {/* Operational State */}
      <div className="mb-4">
        <label className="text-sm opacity-80 block mb-1">Operational State</label>
        <div className={`px-4 py-2 rounded-md font-semibold ${stateColors[state]}`}>
          {stateLabels[state]}
        </div>
      </div>

      {/* Current Primary Task */}
      <div className="mb-4">
        <label className="text-sm opacity-80 block mb-1">Current Primary Task</label>
        {currentTask ? (
          <div className="bg-white/10 px-4 py-3 rounded-md">
            <div className="font-semibold">{currentTask}</div>
            {currentTaskId && <div className="text-xs opacity-70">ID: {currentTaskId}</div>}
          </div>
        ) : (
          <div className="bg-white/10 px-4 py-3 rounded-md text-sm">
            {state === 'idle' ? 'No active task. ' : 'Waiting for input. '}
            {state === 'idle' && 'Reason: Awaiting user instruction.'}
          </div>
        )}
      </div>

      {/* Active Sub-Agents */}
      {activeSubAgents.length > 0 && (
        <div>
          <label className="text-sm opacity-80 block mb-1">Active Sub-Agents</label>
          <div className="space-y-2">
            {activeSubAgents.map((agent, idx) => (
              <div key={idx} className="bg-white/10 px-3 py-2 rounded-md text-sm">
                <div className="font-medium">{agent.role}</div>
                <div className="text-xs opacity-70">Task: {agent.assigned_task}</div>
                <div className="text-xs">Status: {agent.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
