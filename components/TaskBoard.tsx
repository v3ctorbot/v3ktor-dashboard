'use client'

import { useState } from 'react'
import { Task, TaskStatus, Priority } from '@/lib/types'
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

interface TaskBoardProps {
  tasks: Task[]
}

const statusColumns: { status: TaskStatus, label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
]

const priorityColors: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

const originLabels: Record<string, string> = {
  user: '👤 User',
  v3ktor: '⚡ V3ktor',
  sub_agent: '🤖 Sub-Agent',
}

export default function TaskBoard({ tasks }: TaskBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    // TODO: Implement move via Supabase
    console.log('Move task', taskId, 'to', newStatus)
  }

  const totalTasks = tasks.length

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ClipboardDocumentListIcon className="w-6 h-6 text-ft-dark" />
          <h2 className="text-xl font-bold text-ft-dark font-heading">Task Board</h2>
        </div>
        <div className="text-sm text-gray-500">Total: <span className="font-mono">{totalTasks}</span></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusColumns.map((column) => (
          <div key={column.status} className="bg-gray-50 rounded-lg p-4 min-h-[380px]">
            <h3 className="flex items-center justify-between font-semibold mb-3 text-ft-dark pb-2 border-b-2 border-ft-light">
              <span>{column.label}</span>
              <span className="text-xs text-gray-500">{tasks.filter((t) => t.status === column.status).length}</span>
            </h3>

            <div className="space-y-3">
              {tasks
                .filter((task) => task.status === column.status)
                .map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTask(task.id)}
                    onDragEnd={() => setDraggedTask(null)}
                    onClick={() => {
                      // Simple move to next status
                      if (column.status === 'todo') moveTask(task.task_id, 'in_progress')
                      else if (column.status === 'in_progress') moveTask(task.task_id, 'done')
                    }}
                    className={`relative cursor-move bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5`}
                  >
                    {/* Priority Badge */}
                    <div className={`absolute -left-1 top-4 px-2 py-0.5 text-xs font-semibold rounded-r-md ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </div>

                    {/* Task ID */}
                    <div className="text-xs text-gray-500 mb-1 font-mono">
                      {task.task_id}
                    </div>

                    {/* Title */}
                    <div className="font-semibold text-gray-800 mb-2">
                      {task.title}
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Origin + Timestamp */}
                    <div className="flex justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                      <span>{originLabels[task.origin] || task.origin}</span>
                      <span>{new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
