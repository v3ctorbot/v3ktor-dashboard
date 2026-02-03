"use client"

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
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <BoltIcon className="header-icon text-ft-light" />
          <div>
            <h2 className="text-xl font-bold font-heading">V3ktor Status</h2>
            <div className="text-sm text-gray-500">Operational overview</div>
          </div>
        </div>
        <div className="text-sm text-gray-600">Updated: <span className="font-mono">{new Date().toLocaleTimeString()}</span></div>
      </div>

      {/* Operational State */}
      <div className="mb-4">
        <label className="text-sm text-gray-600 block mb-2">Operational State</label>
        <div className="inline-flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${stateColors[state]}`}>
            {stateLabels[state]}
          </div>
        </div>
      </div>

      {/* Current Primary Task */}
      <div className="mb-4">
        <label className="text-sm text-gray-600 block mb-2">Current Primary Task</label>
        {currentTask ? (
          <div className="bg-gray-50 px-4 py-3 rounded-md">
            <div className="font-semibold text-gray-800">{currentTask}</div>
            {currentTaskId && <div className="text-xs text-gray-500">ID: {currentTaskId}</div>}
          </div>
        ) : (
          <div className="bg-gray-50 px-4 py-3 rounded-md text-sm text-gray-600">
            {state === 'idle' ? 'No active task.' : 'Waiting for input.'}
            {state === 'idle' && ' Reason: Awaiting user instruction.'}
          </div>
        )}
      </div>

      {/* Active Sub-Agents */}
      {activeSubAgents.length > 0 && (
        <div>
          <label className="text-sm text-gray-600 block mb-2">Active Sub-Agents</label>
          <div className="space-y-2">
            {activeSubAgents.map((agent, idx) => (
              <div key={idx} className="bg-gray-50 px-3 py-2 rounded-md text-sm">
                <div className="font-medium text-gray-800">{agent.role}</div>
                <div className="text-xs text-gray-500">Task: {agent.assigned_task}</div>
                <div className="text-xs text-gray-500">Status: {agent.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
