#!/usr/bin/env node
/**
 * V3ktor Dashboard CLI
 * 
 * Standalone CLI for V3ktor to interact with the dashboard from OpenClaw.
 * 
 * Usage:
 *   node scripts/v3ktor-cli.mjs log <action> [target] [outcome] [metadata_json]
 *   node scripts/v3ktor-cli.mjs status <state> [current_task] [task_id]
 *   node scripts/v3ktor-cli.mjs task create <task_id> <title> [description] [priority] [status]
 *   node scripts/v3ktor-cli.mjs task update <task_id> <status>
 *   node scripts/v3ktor-cli.mjs task list [status]
 *   node scripts/v3ktor-cli.mjs notes unseen
 *   node scripts/v3ktor-cli.mjs notes seen <note_id>
 *   node scripts/v3ktor-cli.mjs notes processed <note_id> [related_task_id]
 *   node scripts/v3ktor-cli.mjs deliverable <title> <type> [file_path] [external_url] [task_id]
 *   node scripts/v3ktor-cli.mjs tokens <session_id> <tokens_used>
 */

import { createClient } from '@supabase/supabase-js'

// Supabase credentials
const SUPABASE_URL = 'https://yeicnhotqdfwnjkkopcr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllaWNuaG90cWRmd25qa2tvcGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzg0MzgsImV4cCI6MjA4NTYxNDQzOH0.QpZZsSMq6dlqaF3r8pkVs4LtreYlSpir9LRKC-8gE_c'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ============================================
// COMMANDS
// ============================================

async function logActivity(action, target, outcome, metadataJson) {
  const metadata = metadataJson ? JSON.parse(metadataJson) : null
  const { data, error } = await supabase
    .from('activity_log')
    .insert({
      action_type: action,
      actor: 'v3ktor',
      target: target || null,
      outcome: outcome || 'success',
      metadata,
      timestamp: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  console.log(JSON.stringify({ success: true, data }))
}

async function updateStatus(state, currentTask, taskId) {
  // Get existing status row
  const { data: existing } = await supabase
    .from('status')
    .select('id')
    .limit(1)
    .single()

  const updateData = {
    operational_state: state,
    current_task: currentTask || null,
    current_task_id: taskId || null,
    updated_at: new Date().toISOString()
  }

  let result
  if (existing) {
    result = await supabase
      .from('status')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single()
  } else {
    result = await supabase
      .from('status')
      .insert({ ...updateData, active_sub_agents: [] })
      .select()
      .single()
  }

  if (result.error) throw result.error
  console.log(JSON.stringify({ success: true, data: result.data }))
}

async function createTask(taskId, title, description, priority, status) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      task_id: taskId,
      title,
      description: description || null,
      priority: priority || 'medium',
      status: status || 'todo',
      origin: 'v3ktor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  console.log(JSON.stringify({ success: true, data }))
}

async function updateTask(taskId, status) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('task_id', taskId)
    .select()
    .single()

  if (error) throw error
  console.log(JSON.stringify({ success: true, data }))
}

async function listTasks(status) {
  let query = supabase.from('tasks').select('*')
  if (status) {
    query = query.eq('status', status)
  }
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  console.log(JSON.stringify({ success: true, data }))
}

async function getUnseenNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('status', 'unseen')
    .order('created_at', { ascending: true })

  if (error) throw error
  console.log(JSON.stringify({ success: true, data }))
}

async function markNoteSeen(noteId) {
  const { data, error } = await supabase
    .from('notes')
    .update({ status: 'seen' })
    .eq('id', noteId)
    .select()
    .single()

  if (error) throw error
  console.log(JSON.stringify({ success: true, data }))
}

async function markNoteProcessed(noteId, relatedTaskId) {
  const { data, error } = await supabase
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
  console.log(JSON.stringify({ success: true, data }))
}

async function createDeliverable(title, type, filePath, externalUrl, taskId) {
  const { data, error } = await supabase
    .from('deliverables')
    .insert({
      title,
      type,
      file_path: filePath || null,
      external_url: externalUrl || null,
      related_task_id: taskId || null,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  console.log(JSON.stringify({ success: true, data }))
}

async function logTokens(sessionId, tokensUsed) {
  const { data, error } = await supabase
    .from('token_usage')
    .insert({
      session_id: sessionId,
      tokens_used: parseInt(tokensUsed),
      timestamp: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  console.log(JSON.stringify({ success: true, data }))
}

async function getStatus() {
  const { data, error } = await supabase
    .from('status')
    .select('*')
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  console.log(JSON.stringify({ success: true, data: data || null }))
}

// ============================================
// MAIN
// ============================================

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  try {
    switch (command) {
      case 'log':
        await logActivity(args[1], args[2], args[3], args[4])
        break

      case 'status':
        if (args[1] === 'get') {
          await getStatus()
        } else {
          await updateStatus(args[1], args[2], args[3])
        }
        break

      case 'task':
        if (args[1] === 'create') {
          await createTask(args[2], args[3], args[4], args[5], args[6])
        } else if (args[1] === 'update') {
          await updateTask(args[2], args[3])
        } else if (args[1] === 'list') {
          await listTasks(args[2])
        }
        break

      case 'notes':
        if (args[1] === 'unseen') {
          await getUnseenNotes()
        } else if (args[1] === 'seen') {
          await markNoteSeen(args[2])
        } else if (args[1] === 'processed') {
          await markNoteProcessed(args[2], args[3])
        }
        break

      case 'deliverable':
        await createDeliverable(args[1], args[2], args[3], args[4], args[5])
        break

      case 'tokens':
        await logTokens(args[1], args[2])
        break

      default:
        console.log(JSON.stringify({
          success: false,
          error: 'Unknown command',
          usage: {
            log: 'log <action> [target] [outcome] [metadata_json]',
            status: 'status <state|get> [current_task] [task_id]',
            task: 'task <create|update|list> ...',
            notes: 'notes <unseen|seen|processed> ...',
            deliverable: 'deliverable <title> <type> [file_path] [external_url] [task_id]',
            tokens: 'tokens <session_id> <tokens_used>'
          }
        }))
    }
  } catch (err) {
    console.log(JSON.stringify({ success: false, error: err.message }))
    process.exit(1)
  }
}

main()
