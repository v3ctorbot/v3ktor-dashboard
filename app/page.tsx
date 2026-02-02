'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Task, ActivityLogEntry, Note, Deliverable, Status, TokenUsage, TaskStatus, NoteStatus } from '@/lib/types'
import StatusPanel from '@/components/StatusPanel'
import TaskBoard from '@/components/TaskBoard'
import ActivityLog from '@/components/ActivityLog'
import NotesPanel from '@/components/NotesPanel'
import DeliverablesTab from '@/components/DeliverablesTab'
import TokenUsageComponent from '@/components/TokenUsage'

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [status, setStatus] = useState<Status | null>(null)
  const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([])

  useEffect(() => {
    // Initial data fetch
    fetchAllData()

    // Set up realtime subscriptions
    const tasksSubscription = supabase
      .channel('tasks-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setTasks((prev) => {
            const filtered = prev.filter((t) => t.id !== payload.new.id)
            return [...filtered, payload.new as Task]
          })
        }
      })
      .subscribe()

    const activitySubscription = supabase
      .channel('activity-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, (payload) => {
        setActivityLog((prev) => [payload.new as ActivityLogEntry, ...prev])
      })
      .subscribe()

    const notesSubscription = supabase
      .channel('notes-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotes((prev) => [payload.new as Note, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setNotes((prev) => prev.map((n) => (n.id === payload.new.id ? payload.new as Note : n)))
        }
      })
      .subscribe()

    const statusSubscription = supabase
      .channel('status-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'status' }, (payload) => {
        if (payload.new) {
          setStatus(payload.new as Status)
        }
      })
      .subscribe()

    const deliverablesSubscription = supabase
      .channel('deliverables-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'deliverables' }, (payload) => {
        setDeliverables((prev) => [payload.new as Deliverable, ...prev])
      })
      .subscribe()

    const tokenSubscription = supabase
      .channel('token-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'token_usage' }, (payload) => {
        setTokenUsage((prev) => [payload.new as TokenUsage, ...prev])
      })
      .subscribe()

    return () => {
      tasksSubscription.unsubscribe()
      activitySubscription.unsubscribe()
      notesSubscription.unsubscribe()
      statusSubscription.unsubscribe()
      deliverablesSubscription.unsubscribe()
      tokenSubscription.unsubscribe()
    }
  }, [])

  const fetchAllData = async () => {
    const [tasksRes, activityRes, notesRes, statusRes, deliverablesRes, tokenRes] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('activity_log').select('*').order('timestamp', { ascending: false }),
      supabase.from('notes').select('*').order('created_at', { ascending: false }),
      supabase.from('status').select('*').single(),
      supabase.from('deliverables').select('*').order('created_at', { ascending: false }),
      supabase.from('token_usage').select('*').order('timestamp', { ascending: false }),
    ])

    if (tasksRes.data) setTasks(tasksRes.data)
    if (activityRes.data) setActivityLog(activityRes.data)
    if (notesRes.data) setNotes(notesRes.data)
    if (statusRes.data) setStatus(statusRes.data)
    if (deliverablesRes.data) setDeliverables(deliverablesRes.data)
    if (tokenRes.data) setTokenUsage(tokenRes.data)
  }

  const handleAddNote = async (content: string) => {
    const { error } = await supabase
      .from('notes')
      .insert({ content, status: 'unseen' })
    if (error) console.error('Failed to add note:', error)
  }

  const handleMarkSeen = async (noteId: string) => {
    const { error } = await supabase
      .from('notes')
      .update({ status: 'seen' })
      .eq('id', noteId)
    if (error) console.error('Failed to mark note as seen:', error)
  }

  const handleMarkProcessed = async (noteId: string) => {
    const { error } = await supabase
      .from('notes')
      .update({ status: 'processed' })
      .eq('id', noteId)
    if (error) console.error('Failed to mark note as processed:', error)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Desktop: 2x3 Grid | Mobile: Stacked */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Row 1: Status + Task Board + Activity Log */}
        <div className="md:col-span-1">
          {status && (
            <StatusPanel
              state={status.operational_state}
              currentTask={status.current_task}
              currentTaskId={status.current_task_id}
              activeSubAgents={status.active_sub_agents || []}
            />
          )}
        </div>

        <div className="md:col-span-1">
          <TaskBoard tasks={tasks} />
        </div>

        <div className="md:col-span-1">
          <ActivityLog logs={activityLog} />
        </div>

        {/* Row 2: Notes + Deliverables + Token Usage */}
        <div className="md:col-span-1">
          <NotesPanel
            notes={notes}
            onAddNote={handleAddNote}
            onMarkSeen={handleMarkSeen}
            onMarkProcessed={handleMarkProcessed}
          />
        </div>

        <div className="md:col-span-1">
          <DeliverablesTab deliverables={deliverables} />
        </div>

        <div className="md:col-span-1">
          <TokenUsage usage={tokenUsage} />
        </div>
      </div>
    </div>
  )
}
