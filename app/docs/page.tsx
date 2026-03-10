'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Deliverable, Task, Goal } from '@/lib/types'
import { BookOpenIcon, LinkIcon, FolderIcon, CheckCircleIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

const CLI_COMMANDS = [
  { cmd: 'status working "task description" TASK-XXX', desc: 'Set V3ktor status to working on a task' },
  { cmd: 'status idle', desc: 'Mark V3ktor as idle' },
  { cmd: 'log "action_type" "target" "success" \'{"key":"val"}\'', desc: 'Log an activity entry' },
  { cmd: 'task create "TASK-XXX" "Title" high', desc: 'Create or upsert a task' },
  { cmd: 'task update "TASK-XXX" "done"', desc: 'Update task status' },
  { cmd: 'task list [status]', desc: 'List tasks (optional filter by status)' },
  { cmd: 'goal create "GOAL-XXX" "Title" "Description"', desc: 'Create a new goal' },
  { cmd: 'goal update "GOAL-XXX" 75', desc: 'Update goal progress (0-100)' },
  { cmd: 'token log <input> <output> <model>', desc: 'Log token usage for a session' },
  { cmd: 'briefing create "type" "Title" "Content"', desc: 'Create a briefing (daily_brief, ops_alert, needs_decision, weekly_summary)' },
  { cmd: 'briefing list', desc: 'List recent briefings' },
  { cmd: 'heartbeat', desc: 'Update status timestamp (keep dashboard alive)' },
  { cmd: 'notes unseen', desc: 'List unseen notes from Fernando' },
  { cmd: 'notes seen <id>', desc: 'Mark a note as seen' },
  { cmd: 'notes processed <id>', desc: 'Mark a note as processed' },
]

const TABLES = [
  { name: 'tasks', desc: 'Task board — todo / in_progress / done', key: 'task_id' },
  { name: 'activity_log', desc: 'All actions logged by V3ktor or sub-agents', key: 'id' },
  { name: 'notes', desc: 'Instructions from Fernando to V3ktor', key: 'id' },
  { name: 'status', desc: 'Single-row operational state of V3ktor', key: 'id' },
  { name: 'deliverables', desc: 'Files, links, and artifacts produced', key: 'id' },
  { name: 'token_usage', desc: 'LLM session token logs', key: 'id' },
  { name: 'goals', desc: 'Strategic goals with progress tracking', key: 'goal_id' },
  { name: 'briefings', desc: 'Daily briefs, ops alerts, and decisions', key: 'id' },
]

export default function DocsPage() {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const [delRes, taskRes, goalRes] = await Promise.all([
        supabase.from('deliverables').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('goals').select('*').order('created_at', { ascending: false }),
      ])
      if (delRes.data) setDeliverables(delRes.data)
      if (taskRes.data) setTasks(taskRes.data)
      if (goalRes.data) setGoals(goalRes.data)
      setLoading(false)
    }
    fetch()
  }, [])

  const doneTasks = tasks.filter(t => t.status === 'done')
  const activeGoals = goals.filter(g => g.status === 'active')

  return (
    <div className="min-h-screen space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-3">
          <BookOpenIcon className="w-7 h-7 text-ft-light" />
          Ops Docs
        </h1>
        <p className="text-sm text-klaus-muted mt-1">CLI reference, schema overview, deliverables, and operational context.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Goals', value: activeGoals.length, color: 'text-green-400' },
          { label: 'Completed Tasks', value: doneTasks.length, color: 'text-blue-400' },
          { label: 'Deliverables', value: deliverables.length, color: 'text-ft-light' },
          { label: 'DB Tables', value: TABLES.length, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-klaus-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* CLI Reference */}
      <section>
        <h2 className="text-xs uppercase tracking-widest font-bold text-ft-light mb-3 flex items-center gap-2">
          <ClipboardDocumentListIcon className="w-4 h-4" />
          V3ktor CLI Reference
        </h2>
        <div className="card">
          <p className="text-xs text-klaus-muted mb-3 font-mono">node /Users/felmco/Documents/v3ktor-dashboard/scripts/v3ktor-cli.mjs &lt;command&gt;</p>
          <div className="space-y-2">
            {CLI_COMMANDS.map(c => (
              <div key={c.cmd} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-klaus-border/50 last:border-0">
                <code className="text-xs font-mono text-green-400 whitespace-nowrap shrink-0">{c.cmd}</code>
                <span className="text-xs text-gray-400">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schema */}
      <section>
        <h2 className="text-xs uppercase tracking-widest font-bold text-ft-light mb-3 flex items-center gap-2">
          <FolderIcon className="w-4 h-4" />
          Supabase Schema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TABLES.map(t => (
            <div key={t.name} className="bg-klaus-bg border border-klaus-border rounded-xl p-3 flex items-start gap-3">
              <code className="text-xs font-mono font-bold text-ft-light shrink-0 mt-0.5">{t.name}</code>
              <div>
                <p className="text-xs text-gray-300">{t.desc}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">pk: {t.key}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deliverables */}
      <section>
        <h2 className="text-xs uppercase tracking-widest font-bold text-ft-light mb-3 flex items-center gap-2">
          <LinkIcon className="w-4 h-4" />
          Deliverables
        </h2>
        {loading ? (
          <div className="text-center py-10 text-klaus-muted text-sm">Loading…</div>
        ) : deliverables.length === 0 ? (
          <div className="card text-center py-10 text-klaus-muted text-sm">No deliverables yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {deliverables.map(d => (
              <div key={d.id} className="bg-klaus-bg border border-klaus-border rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-white leading-snug">{d.title}</p>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-ft-light/10 text-ft-light border-ft-light/30 shrink-0">
                    {d.type}
                  </span>
                </div>
                {d.file_path && <p className="text-[10px] font-mono text-gray-600 truncate">{d.file_path}</p>}
                {d.external_url && (
                  <a href={d.external_url} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-ft-light hover:text-white flex items-center gap-1 truncate transition-colors">
                    <LinkIcon className="w-3 h-3 shrink-0" />
                    {d.external_url}
                  </a>
                )}
                {d.related_task_id && (
                  <p className="text-[10px] text-gray-600 font-mono">→ {d.related_task_id}</p>
                )}
                <p className="text-[10px] text-gray-600">{new Date(d.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completed tasks */}
      <section>
        <h2 className="text-xs uppercase tracking-widest font-bold text-ft-light mb-3 flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4" />
          Completed Tasks ({doneTasks.length})
        </h2>
        {loading ? (
          <div className="text-center py-10 text-klaus-muted text-sm">Loading…</div>
        ) : doneTasks.length === 0 ? (
          <div className="card text-center py-10 text-klaus-muted text-sm">No completed tasks yet.</div>
        ) : (
          <div className="card space-y-1.5">
            {doneTasks.slice(0, 20).map(t => (
              <div key={t.id} className="flex items-start gap-3 py-2 border-b border-klaus-border/50 last:border-0">
                <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-white font-semibold truncate">{t.title}</p>
                  <p className="text-[10px] text-gray-600 font-mono">{t.task_id} · {new Date(t.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {doneTasks.length > 20 && (
              <p className="text-xs text-center text-gray-600 pt-1">+{doneTasks.length - 20} more</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
