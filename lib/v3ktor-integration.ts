/**
 * V3ktor Integration Module
 * 
 * This module provides functions for V3ktor (the AI agent) to interact with
 * the dashboard database. It enables:
 * - Activity logging
 * - Status updates
 * - Task management
 * - Note processing
 * - Deliverable creation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Types
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type Origin = 'user' | 'v3ktor' | 'sub_agent'
export type Outcome = 'success' | 'partial' | 'failed'
export type NoteStatus = 'unseen' | 'seen' | 'processed'
export type OperationalState = 'working' | 'idle' | 'waiting' | 'offline'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

let supabase: SupabaseClient | null = null

export function getClient(): SupabaseClient {
  if (!supabase) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured')
    }
    supabase = createClient(supabaseUrl, supabaseKey)
  }
  return supabase
}

// ============================================
// ACTIVITY LOGGING
// ============================================

export interface LogActivityParams {
  action_type: string
  actor: string
  target?: string
  outcome?: Outcome
  metadata?: Record<string, any>
}

export async function logActivity(params: LogActivityParams) {
  const client = getClient()
  const { data, error } = await client
    .from('activity_log')
    .insert({
      action_type: params.action_type,
      actor: params.actor,
      target: params.target || null,
      outcome: params.outcome || null,
      metadata: params.metadata || null,
      timestamp: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// STATUS MANAGEMENT
// ============================================

export interface UpdateStatusParams {
  operational_state?: OperationalState
  current_task?: string | null
  current_task_id?: string | null
  active_sub_agents?: Array<{
    role: string
    assigned_task: string
    status: string
  }>
}

export async function updateStatus(params: UpdateStatusParams) {
  const client = getClient()
  
  // Get current status row (there should be only one)
  const { data: existing } = await client
    .from('status')
    .select('id')
    .limit(1)
    .single()

  const updateData = {
    ...params,
    updated_at: new Date().toISOString()
  }

  if (existing) {
    const { data, error } = await client
      .from('status')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await client
      .from('status')
      .insert({
        operational_state: params.operational_state || 'idle',
        current_task: params.current_task || null,
        current_task_id: params.current_task_id || null,
        active_sub_agents: params.active_sub_agents || [],
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    if (error) throw error
    return data
  }
}

export async function getStatus() {
  const client = getClient()
  const { data, error } = await client
    .from('status')
    .select('*')
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

// ============================================
// TASK MANAGEMENT
// ============================================

export interface CreateTaskParams {
  task_id: string
  title: string
  description?: string
  priority?: Priority
  status?: TaskStatus
  origin?: Origin
}

export async function createTask(params: CreateTaskParams) {
  const client = getClient()
  const { data, error } = await client
    .from('tasks')
    .insert({
      task_id: params.task_id,
      title: params.title,
      description: params.description || null,
      priority: params.priority || 'medium',
      status: params.status || 'todo',
      origin: params.origin || 'v3ktor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTask(taskId: string, updates: Partial<CreateTaskParams>) {
  const client = getClient()
  const { data, error } = await client
    .from('tasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('task_id', taskId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTasks(status?: TaskStatus) {
  const client = getClient()
  let query = client.from('tasks').select('*')
  if (status) {
    query = query.eq('status', status)
  }
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ============================================
// NOTES MANAGEMENT
// ============================================

export async function getUnseenNotes() {
  const client = getClient()
  const { data, error } = await client
    .from('notes')
    .select('*')
    .eq('status', 'unseen')
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

export async function markNoteSeen(noteId: string) {
  const client = getClient()
  const { data, error } = await client
    .from('notes')
    .update({ status: 'seen' })
    .eq('id', noteId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function markNoteProcessed(noteId: string, relatedTaskId?: string) {
  const client = getClient()
  const { data, error } = await client
    .from('notes')
    .update({
      status: 'processed',
      processed_at: new Date().toISOString(),
      related_task_id: relatedTaskId || null
    })
    .eq('id', noteId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// DELIVERABLES MANAGEMENT
// ============================================

export interface CreateDeliverableParams {
  title: string
  type: string
  file_path?: string
  external_url?: string
  related_task_id?: string
}

export async function createDeliverable(params: CreateDeliverableParams) {
  const client = getClient()
  const { data, error } = await client
    .from('deliverables')
    .insert({
      title: params.title,
      type: params.type,
      file_path: params.file_path || null,
      external_url: params.external_url || null,
      related_task_id: params.related_task_id || null,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// TOKEN USAGE TRACKING
// ============================================

export async function logTokenUsage(sessionId: string, tokensUsed: number) {
  const client = getClient()
  const { data, error } = await client
    .from('token_usage')
    .insert({
      session_id: sessionId,
      tokens_used: tokensUsed,
      timestamp: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Quick log for common V3ktor actions
 */
export async function v3ktorLog(
  action: string,
  target?: string,
  outcome: Outcome = 'success',
  metadata?: Record<string, any>
) {
  return logActivity({
    action_type: action,
    actor: 'v3ktor',
    target,
    outcome,
    metadata
  })
}

/**
 * Set V3ktor to working state with current task
 */
export async function startWorking(taskDescription: string, taskId?: string) {
  await updateStatus({
    operational_state: 'working',
    current_task: taskDescription,
    current_task_id: taskId || null
  })
  await v3ktorLog('status_change', 'working', 'success', { task: taskDescription })
}

/**
 * Set V3ktor to idle state
 */
export async function goIdle() {
  await updateStatus({
    operational_state: 'idle',
    current_task: null,
    current_task_id: null
  })
  await v3ktorLog('status_change', 'idle', 'success')
}

/**
 * Set V3ktor to waiting state
 */
export async function setWaiting(reason: string) {
  await updateStatus({
    operational_state: 'waiting',
    current_task: reason
  })
  await v3ktorLog('status_change', 'waiting', 'success', { reason })
}
