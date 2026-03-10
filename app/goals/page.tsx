'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Goal } from '@/lib/types'
import { FlagIcon, PlusIcon, CheckCircleIcon, PauseCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

const statusConfig = {
  active: { label: 'Active', dot: 'bg-green-500 animate-pulse', badge: 'bg-green-500/15 text-green-300 border-green-500/40' },
  paused: { label: 'Paused', dot: 'bg-yellow-400', badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40' },
  completed: { label: 'Completed', dot: 'bg-blue-500', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/40' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-500', badge: 'bg-red-500/15 text-red-400 border-red-500/40' },
}

const progressColor: Record<Goal['status'], string> = {
  active: 'bg-green-500',
  paused: 'bg-yellow-400',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-500',
}

function formatTargetDate(dateStr: string | null) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const diffDays = Math.ceil((d.getTime() - Date.now()) / 86400000)
  const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (diffDays < 0) return { label: `${formatted} (${Math.abs(diffDays)}d overdue)`, overdue: true }
  if (diffDays === 0) return { label: `${formatted} (today)`, overdue: false }
  if (diffDays <= 7) return { label: `${formatted} (${diffDays}d left)`, overdue: false }
  return { label: formatted, overdue: false }
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', target_date: '', status: 'active' as Goal['status'] })
  const [filterStatus, setFilterStatus] = useState<Goal['status'] | 'all'>('all')

  useEffect(() => {
    supabase.from('goals').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setGoals(data)
      setLoading(false)
    })

    const sub = supabase.channel('goals-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, (payload) => {
        if (payload.eventType === 'INSERT') setGoals(p => [payload.new as Goal, ...p])
        else if (payload.eventType === 'UPDATE') setGoals(p => p.map(g => g.id === payload.new.id ? payload.new as Goal : g))
        else if (payload.eventType === 'DELETE') setGoals(p => p.filter(g => g.id !== payload.old.id))
      })
      .subscribe()

    return () => { sub.unsubscribe() }
  }, [])

  const createGoal = async () => {
    if (!form.title.trim()) return
    const goalId = `GOAL-${Date.now().toString(36).toUpperCase()}`
    await supabase.from('goals').insert({
      goal_id: goalId,
      title: form.title,
      description: form.description || null,
      target_date: form.target_date || null,
      status: form.status,
      progress: 0,
    })
    setForm({ title: '', description: '', target_date: '', status: 'active' })
    setIsAdding(false)
  }

  const updateProgress = async (goalId: string, progress: number) => {
    await supabase.from('goals').update({ progress, updated_at: new Date().toISOString() }).eq('goal_id', goalId)
  }

  const updateStatus = async (goalId: string, status: Goal['status']) => {
    await supabase.from('goals').update({ status, updated_at: new Date().toISOString() }).eq('goal_id', goalId)
  }

  const filtered = goals.filter(g => filterStatus === 'all' || g.status === filterStatus)
  const order: Goal['status'][] = ['active', 'paused', 'completed', 'cancelled']
  const sorted = [...filtered].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status))

  const stats = {
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    avgProgress: goals.filter(g => g.status === 'active').reduce((s, g) => s + g.progress, 0) / Math.max(goals.filter(g => g.status === 'active').length, 1),
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-3">
            <FlagIcon className="w-7 h-7 text-ft-light" />
            Goals
          </h1>
          <p className="text-sm text-klaus-muted mt-1">Long-term objectives for V3ktor and Future Tales.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="btn flex items-center gap-2 text-sm">
          <PlusIcon className="w-4 h-4" /> New Goal
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active', value: stats.active, color: 'text-green-400' },
          { label: 'Completed', value: stats.completed, color: 'text-blue-400' },
          { label: 'Avg Progress', value: `${Math.round(stats.avgProgress)}%`, color: 'text-ft-light' },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-klaus-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add goal form */}
      {isAdding && (
        <div className="card mb-6 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-bold text-white mb-4">New Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input text-sm" placeholder="Goal title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
            <input className="input text-sm" type="date" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} />
            <textarea className="textarea text-sm md:col-span-2" placeholder="Description (optional)" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-2 mt-3 justify-end">
            <button onClick={() => setIsAdding(false)} className="text-sm text-gray-400 hover:text-white px-3 py-1.5">Cancel</button>
            <button onClick={createGoal} className="btn text-sm px-4">Create Goal</button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'paused', 'completed', 'cancelled'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors border ${filterStatus === s ? 'bg-ft-light/20 text-ft-light border-ft-light/40' : 'text-klaus-muted border-transparent hover:text-white'}`}
          >
            {s === 'all' ? `All (${goals.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${goals.filter(g => g.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Goals grid */}
      {loading ? (
        <div className="text-center py-20 text-klaus-muted">Loading goals…</div>
      ) : sorted.length === 0 ? (
        <div className="card text-center py-16 text-klaus-muted">
          <FlagIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="italic">No goals found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map(goal => {
            const cfg = statusConfig[goal.status]
            const target = formatTargetDate(goal.target_date)
            return (
              <div key={goal.id} className={`card flex flex-col gap-3 ${goal.status === 'cancelled' ? 'opacity-50' : ''}`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-white leading-snug">{goal.title}</p>
                    <p className="text-[10px] text-klaus-muted font-mono mt-0.5">{goal.goal_id}</p>
                  </div>
                  <select
                    value={goal.status}
                    onChange={e => updateStatus(goal.goal_id, e.target.value as Goal['status'])}
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-transparent cursor-pointer ${cfg.badge}`}
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {goal.description && (
                  <p className="text-xs text-gray-400 leading-relaxed">{goal.description}</p>
                )}

                {/* Progress */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-klaus-muted">Progress</span>
                    <span className="text-[10px] font-bold text-white">{goal.progress}%</span>
                  </div>
                  <input
                    type="range" min={0} max={100} value={goal.progress}
                    onChange={e => updateProgress(goal.goal_id, parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-klaus-border accent-ft-light"
                  />
                </div>

                {target && (
                  <p className={`text-[10px] font-medium ${target.overdue ? 'text-red-400' : 'text-klaus-muted'}`}>
                    🎯 {target.label}
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
