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

    // Listen for header refresh events
    const handleRefreshEvent = () => {
      fetchAllData()
    }
    if (typeof window !== 'undefined') window.addEventListener('v3ktor:refresh', handleRefreshEvent)

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

    const activitySubscription = supabase
      .channel('activity-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setActivityLog((prev) => [payload.new as ActivityLogEntry, ...prev])
        }
      })

    const notesSubscription = supabase
      .channel('notes-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotes((prev) => [payload.new as Note, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setNotes((prev) => prev.map((n) => (n.id === payload.new.id ? payload.new as Note : n)))
        }
      })

    const statusSubscription = supabase
      .channel('status-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'status' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setStatus(payload.new as Status)
        }
      })

    const deliverablesSubscription = supabase
      .channel('deliverables-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliverables' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDeliverables((prev) => [payload.new as Deliverable, ...prev])
        }
      })

    const tokenSubscription = supabase
      .channel('tokens-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'token_usage' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTokenUsage((prev) => [payload.new as TokenUsage, ...prev])
        }
      })

    return () => {
      tasksSubscription.unsubscribe()
      activitySubscription.unsubscribe()
      notesSubscription.unsubscribe()
      statusSubscription.unsubscribe()
      deliverablesSubscription.unsubscribe()
      tokenSubscription.unsubscribe()
      if (typeof window !== 'undefined') window.removeEventListener('v3ktor:refresh', handleRefreshEvent)
    }
  }, [])

  const fetchAllData = async () => {
    const [tasksRes, activityRes, notesRes, statusRes, deliverablesRes, tokenRes] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('activity_log').select('*').order('timestamp', { ascending: false }),
      supabase.from('notes').select('*').order('created_at', { ascending: false }),
      supabase.from('status').select('*').single(),
      supabase.from('deliverables').select('*').order('created_at', { ascending: false }),
      supabase.from('token_usage').select('*').order('timestamp', { ascending: false })
    ])

    if (tasksRes.data) setTasks(tasksRes.data)
    if (activityRes.data) setActivityLog(activityRes.data)
    if (notesRes.data) setNotes(notesRes.data)
    if (deliverablesRes.data) setDeliverables(deliverablesRes.data)
    if (tokenRes.data) setTokenUsage(tokenRes.data)

    // Handle Status (Initialize if missing)
    if (statusRes.data) {
      setStatus(statusRes.data)
    } else if (statusRes.error && (statusRes.error.code === 'PGRST116' || statusRes.error.details?.includes('0 rows'))) {
      console.log('Status row missing, initializing...')
      const newStatus = {
        operational_state: 'idle',
        current_task: null,
        current_task_id: null,
        active_sub_agents: []
      }
      const { data, error } = await supabase.from('status').insert(newStatus).select().single()
      if (data) setStatus(data as Status)
      if (error) console.error('Failed to initialize status:', error)
    }
  }

  const handleAddNote = async (content: string) => {
    const { error } = await supabase.from('notes').insert({ content, status: 'unseen' })
    if (error) console.error('Failed to add note:', error)
  }

  const handleMarkSeen = async (noteId: string) => {
    const { error } = await supabase.from('notes').update({ status: 'seen' }).eq('id', noteId)
    if (error) console.error('Failed to mark note as seen:', error)
  }

  const handleMarkProcessed = async (noteId: string, relatedTaskId?: string) => {
    const updateData: any = { status: 'processed', processed_at: new Date().toISOString() }
    if (relatedTaskId) updateData.related_task_id = relatedTaskId

    const { error } = await supabase.from('notes').update(updateData).eq('id', noteId)
    if (error) console.error('Failed to mark note as processed:', error)
  }

  return (
    <div className="min-h-screen">
      {/* Professional Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6 pb-8">

        {/* ROW 1: Status & Tokens (Hero Section) */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9">
          {status && (
            <div className="h-full">
              <StatusPanel
                state={status.operational_state}
                currentTask={status.current_task}
                currentTaskId={status.current_task_id}
                activeSubAgents={status.active_sub_agents || []}
              />
            </div>
          )}
        </div>
        <div className="col-span-12 lg:col-span-4 xl:col-span-3">
          <div className="h-full">
            <TokenUsageComponent usage={tokenUsage} />
          </div>
        </div>

        {/* ROW 2: Main Workspace (Tasks & Activity) */}
        <div className="col-span-12 lg:col-span-8">
          <div className="h-[700px] flex flex-col">
            <TaskBoard tasks={tasks} />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="h-[700px] flex flex-col">
            <ActivityLog logs={activityLog} />
          </div>
        </div>

        {/* ROW 3: Tools (Communication & Artifacts) */}
        <div className="col-span-12 lg:col-span-6">
          <div className="h-full">
            <NotesPanel
              notes={notes}
              tasks={tasks}
              onAddNote={handleAddNote}
              onMarkSeen={handleMarkSeen}
              onMarkProcessed={handleMarkProcessed}
            />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <div className="h-full">
            <DeliverablesTab deliverables={deliverables} />
          </div>
        </div>

      </div>
    </div>
  )
}
