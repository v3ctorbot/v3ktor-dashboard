'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
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

import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function TaskBoard({ tasks }: TaskBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null)

  const [isAdding, setIsAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium')

  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [filterOrigin, setFilterOrigin] = useState<string>('all')

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
    setDraggedTask(taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    // Identify column from the closest column container
    const col = (e.target as HTMLElement).closest('[data-column-id]')?.getAttribute('data-column-id') as TaskStatus
    if (col) setDragOverCol(col)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    const relatedTarget = e.relatedTarget as HTMLElement
    // Only clear if leaving the column completely, simpler to just rely on dragOver updating
    if (!relatedTarget?.closest('[data-column-id]')) {
      setDragOverCol(null)
    }
  }

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    setDragOverCol(null)
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      moveTask(taskId, status)
      setDraggedTask(null)
    }
  }

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      // Optimistic update (UI first) could be added here, but for now just Supabase
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('task_id', taskId)

      if (error) {
        console.error('Error updating task status:', error)
      } else {
        console.log('Task moved successfully:', taskId, newStatus)
      }
    } catch (err) {
      console.error('Unexpected error moving task:', err)
    }
  }

  const addTask = async () => {
    if (!newTaskTitle.trim()) return

    try {
      const taskId = `TASK-${Math.floor(Math.random() * 10000)}` // Simple ID generation
      const { error } = await supabase
        .from('tasks')
        .insert({
          task_id: taskId,
          title: newTaskTitle,
          priority: newTaskPriority,
          status: 'todo',
          origin: 'user'
        })

      if (error) {
        console.error('Error adding task:', error)
      } else {
        setNewTaskTitle('')
        setIsAdding(false)
      }
    } catch (err) {
      console.error('Unexpected error adding task:', err)
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        console.error('Error deleting task:', error)
      }
    } catch (err) {
      console.error('Unexpected error deleting task:', err)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority
    const originMatch = filterOrigin === 'all' || task.origin === filterOrigin
    return priorityMatch && originMatch
  })

  return (
    <div className="card flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <ClipboardDocumentListIcon className="text-ft-light" style={{ width: '20px', height: '20px' }} />
          <h2 className="text-xl font-bold text-white font-heading">Task Board</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <select
            className="bg-klaus-bg border border-klaus-border text-xs rounded px-2 py-1 text-klaus-text focus:outline-none focus:border-ft-light"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            className="bg-klaus-bg border border-klaus-border text-xs rounded px-2 py-1 text-klaus-text focus:outline-none focus:border-ft-light"
            value={filterOrigin}
            onChange={(e) => setFilterOrigin(e.target.value as any)}
          >
            <option value="all">All Sources</option>
            <option value="user">User</option>
            <option value="v3ktor">V3ktor</option>
            <option value="sub_agent">Sub-Agent</option>
          </select>

          <button
            onClick={() => setIsAdding(true)}
            className="bg-ft-light hover:bg-ft-light/80 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1"
          >
            <PlusIcon className="w-3 h-3" /> Add Task
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-4 p-3 bg-klaus-bg border border-klaus-border rounded-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col gap-2">
            <input
              className="input text-sm"
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
            <div className="flex gap-2">
              <select
                className="bg-klaus-card border border-klaus-border text-xs rounded px-2 py-1 text-white"
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
              >
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
                <option value="low">Low</option>
              </select>
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setIsAdding(false)} className="text-xs text-gray-400 hover:text-white">Cancel</button>
                <button onClick={addTask} className="bg-ft-light px-3 py-1 rounded text-xs font-bold text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 overflow-x-auto pb-2">
        {(['todo', 'in_progress', 'done'] as const).map((colId) => {
          const colTasks = filteredTasks.filter(t => t.status === colId)
          const isDragOver = dragOverCol === colId

          return (
            <div
              key={colId}
              data-column-id={colId} // Add data attribute for drag over detection
              className={`flex flex-col rounded-xl overflow-hidden transition-colors ${isDragOver ? 'bg-klaus-card/80 ring-2 ring-ft-light/50' : 'bg-klaus-bg/50 border border-klaus-border/30'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, colId)}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-klaus-border/50 flex justify-between items-center bg-klaus-bg/30">
                <h3 className="text-xs font-bold uppercase tracking-wider text-klaus-muted">
                  {colId.replace('_', ' ')}
                </h3>
                <span className="bg-klaus-card text-klaus-text text-[10px] px-1.5 py-0.5 rounded border border-klaus-border/50">
                  {colTasks.length}
                </span>
              </div>

              {/* Task List */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-24 border-2 border-dashed border-klaus-border rounded-lg flex items-center justify-center">
                    <span className="text-xs text-klaus-border">Empty</span>
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.task_id)}
                      className="bg-klaus-card p-3 rounded-lg border border-klaus-border shadow-sm hover:border-ft-light/50 transition-all cursor-move group relative"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] px-1.5 rounded uppercase font-bold tracking-wider ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.origin === 'user' && <span className="text-[10px] text-gray-500">USER</span>}
                        {(task.origin === 'v3ktor' || task.origin === 'sub_agent') && <span className="text-[10px] text-ft-light">SYS</span>}
                      </div>

                      <p className="text-sm font-medium text-gray-200 mb-2 leading-tight">
                        {task.title}
                      </p>

                      <div className="flex justify-between items-center pt-2 border-t border-klaus-border/50 mt-2">
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(task.created_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Task"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
