'use client'

import { Goal } from '@/lib/types'
import { FlagIcon, CheckCircleIcon, PauseCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface GoalsPanelProps {
  goals: Goal[]
}

const statusConfig = {
  active: {
    label: 'Active',
    classes: 'bg-green-500/15 text-green-300 border-green-500/40',
    icon: <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />,
  },
  paused: {
    label: 'Paused',
    classes: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40',
    icon: <PauseCircleIcon className="w-3 h-3 inline-block" />,
  },
  completed: {
    label: 'Completed',
    classes: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    icon: <CheckCircleIcon className="w-3 h-3 inline-block" />,
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-red-500/15 text-red-400 border-red-500/40',
    icon: <XCircleIcon className="w-3 h-3 inline-block" />,
  },
}

const progressBarColor: Record<Goal['status'], string> = {
  active: 'bg-green-500',
  paused: 'bg-yellow-400',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-500',
}

function formatTargetDate(dateStr: string | null): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / 86400000)
  const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (diffDays < 0) return `${formatted} (${Math.abs(diffDays)}d overdue)`
  if (diffDays === 0) return `${formatted} (today)`
  if (diffDays <= 7) return `${formatted} (${diffDays}d left)`
  return formatted
}

export default function GoalsPanel({ goals }: GoalsPanelProps) {
  const order: Goal['status'][] = ['active', 'paused', 'completed', 'cancelled']
  const sorted = [...goals].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status))

  const activeCount = goals.filter((g) => g.status === 'active').length
  const completedCount = goals.filter((g) => g.status === 'completed').length

  return (
    <div className="card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlagIcon className="w-5 h-5 text-ft-light" />
          <h2 className="text-base font-bold font-heading text-white">Goals</h2>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-klaus-muted">
          <span className="text-green-400 font-semibold">{activeCount} active</span>
          <span>·</span>
          <span className="text-blue-400 font-semibold">{completedCount} done</span>
          <span>·</span>
          <span>{goals.length} total</span>
        </div>
      </div>

      {/* Goals List */}
      {sorted.length === 0 ? (
        <div className="text-center py-8 text-klaus-muted text-sm italic">
          No goals yet. V3ktor can create them via:<br />
          <code className="text-xs text-ft-light/70 mt-1 inline-block">v3ktor-cli goal create GOAL-001 "Title"</code>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {sorted.map((goal) => {
            const cfg = statusConfig[goal.status]
            const targetLabel = formatTargetDate(goal.target_date)
            const isOverdue = targetLabel?.includes('overdue')

            return (
              <div
                key={goal.id}
                className={`bg-klaus-bg border border-klaus-border rounded-lg p-3 flex flex-col gap-2 ${goal.status === 'cancelled' ? 'opacity-50' : ''}`}
              >
                {/* Title + Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">{goal.title}</p>
                    <p className="text-[10px] text-klaus-muted font-mono mt-0.5">{goal.goal_id}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${cfg.classes}`}>
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </div>

                {/* Description */}
                {goal.description && (
                  <p className="text-xs text-klaus-muted leading-snug line-clamp-2">{goal.description}</p>
                )}

                {/* Progress Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-klaus-muted">Progress</span>
                    <span className="text-[10px] font-semibold text-white">{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-klaus-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressBarColor[goal.status]}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Target Date */}
                {targetLabel && (
                  <p className={`text-[10px] font-medium ${isOverdue ? 'text-red-400' : 'text-klaus-muted'}`}>
                    🎯 {targetLabel}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
