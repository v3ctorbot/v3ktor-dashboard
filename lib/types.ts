// Database types for V3ktor Dashboard

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type Origin = 'user' | 'v3ktor' | 'sub_agent'
export type Outcome = 'success' | 'partial' | 'failed'
export type NoteStatus = 'unseen' | 'seen' | 'processed'
export type OperationalState = 'working' | 'idle' | 'waiting' | 'offline'

export interface Task {
  id: string
  task_id: string
  title: string
  description: string | null
  priority: Priority
  status: TaskStatus
  origin: Origin
  created_at: string
  updated_at: string
}

export interface ActivityLogEntry {
  id: string
  timestamp: string
  action_type: string
  actor: string
  target: string | null
  outcome: Outcome | null
  metadata: Record<string, any> | null
}

export interface Note {
  id: string
  content: string
  status: NoteStatus
  created_at: string
  processed_at: string | null
  related_task_id: string | null
}

export interface Deliverable {
  id: string
  title: string
  type: string
  file_path: string | null
  external_url: string | null
  created_at: string
  related_task_id: string | null
}

export interface Status {
  id: string
  operational_state: OperationalState
  current_task: string | null
  current_task_id: string | null
  active_sub_agents: Array<{
    role: string
    assigned_task: string
    status: string
  }>
  updated_at: string
}

export interface TokenUsage {
  id: string
  session_id: string
  tokens_used: number
  timestamp: string
}
