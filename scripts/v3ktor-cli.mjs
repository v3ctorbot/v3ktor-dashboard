#!/usr/bin/env node
/**
 * V3ktor Dashboard CLI
 * 
 * Standalone CLI for V3ktor to interact with the dashboard from OpenClaw.
 * 
 * Usage:
 *   node scripts/v3ktor-cli.mjs log <action> [target] [outcome] [metadata_json]
 *   node scripts/v3ktor-cli.mjs status <state|get> [current_task] [task_id] [active_model]
 *   node scripts/v3ktor-cli.mjs heartbeat
 *   node scripts/v3ktor-cli.mjs task create <task_id> <title> [description] [priority] [status]
 *   node scripts/v3ktor-cli.mjs task update <task_id> <status>
 *   node scripts/v3ktor-cli.mjs task list [status]
 *   node scripts/v3ktor-cli.mjs notes unseen
 *   node scripts/v3ktor-cli.mjs notes seen <note_id>
 *   node scripts/v3ktor-cli.mjs notes processed <note_id> [related_task_id]
 *   node scripts/v3ktor-cli.mjs deliverable <title> <type> [file_path] [external_url] [task_id]
 *   node scripts/v3ktor-cli.mjs tokens <session_id> <input_tokens> <output_tokens> [model] [context_used] [context_max]
 *   node scripts/v3ktor-cli.mjs goal <create|update|list> ...
 *   node scripts/v3ktor-cli.mjs briefing create <type> <title> <content> [task_id]
 *   node scripts/v3ktor-cli.mjs briefing latest [type]
 *   node scripts/v3ktor-cli.mjs briefing read <id>
 *   node scripts/v3ktor-cli.mjs summary <day|week|month>
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

async function updateStatus(state, currentTask, taskId, activeModel) {
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
    active_model: activeModel || null,
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
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('tasks')
    .upsert({
      task_id: taskId,
      title,
      description: description || null,
      priority: priority || 'medium',
      status: status || 'todo',
      origin: 'v3ktor',
      created_at: now,
      updated_at: now
    }, { onConflict: 'task_id', ignoreDuplicates: false })
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

// Models on flat subscription — log tokens for visibility, cost = 0
const SUBSCRIPTION_MODELS = new Set([
  'openai-codex/gpt-5.2',
])

// Model pricing per million tokens (USD)
const MODEL_PRICING = {
  'openai-codex/gpt-5.2': { input: 0, output: 0 }, // subscription plan
  'anthropic/claude-opus-4-6': { input: 5, output: 25 },
  'anthropic/claude-opus-4-5': { input: 5, output: 25 },
  'anthropic/claude-sonnet-4-6': { input: 3, output: 15 },
  'anthropic/claude-sonnet-4': { input: 3, output: 15 },
  'anthropic/claude-haiku': { input: 0.25, output: 1.25 },
  'openai/gpt-4o': { input: 2.5, output: 10 },
  'openai/gpt-4-turbo': { input: 10, output: 30 },
  'zai/glm-4.7': { input: 0.5, output: 1.5 },
  'deepseek/deepseek-chat': { input: 0.14, output: 0.28 },
  'deepseek/deepseek-reasoner': { input: 0.55, output: 2.19 },
  'google/gemini-2.5-pro': { input: 1.25, output: 10 },
  'google/gemini-pro': { input: 0.5, output: 1.5 },
  'google/gemini-1.5-pro': { input: 1.25, output: 5 },
  'google/gemini-2.0-flash': { input: 0.1, output: 0.4 },
  'default': { input: 1, output: 5 }
}

function calculateCost(model, inputTokens, outputTokens) {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['default']
  const inputCost = (inputTokens / 1_000_000) * pricing.input
  const outputCost = (outputTokens / 1_000_000) * pricing.output
  return inputCost + outputCost
}

async function logTokens(sessionId, inputTokens, outputTokens, model, contextUsed, contextMax) {
  const input = parseInt(inputTokens) || 0
  const output = parseInt(outputTokens) || 0
  const totalTokens = input + output
  const estimatedCost = calculateCost(model || 'default', input, output)

  const { data, error } = await supabase
    .from('token_usage')
    .insert({
      session_id: sessionId,
      tokens_used: totalTokens,
      input_tokens: input,
      output_tokens: output,
      model: model || 'unknown',
      estimated_cost: estimatedCost,
      context_used: parseInt(contextUsed) || 0,
      context_max: parseInt(contextMax) || 200000,
      timestamp: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  console.log(JSON.stringify({ success: true, data, cost_usd: estimatedCost }))
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

async function heartbeat() {
  const { data: existing } = await supabase
    .from('status')
    .select('id')
    .limit(1)
    .single()

  if (!existing) {
    console.log(JSON.stringify({ success: false, error: 'No status row found. Run: status idle first.' }))
    return
  }

  const { data, error } = await supabase
    .from('status')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', existing.id)
    .select('id, operational_state, updated_at')
    .single()

  if (error) throw error
  console.log(JSON.stringify({ success: true, data }))
}

// ============================================
// GOALS MANAGEMENT
// ============================================

async function createGoal(goalId, title, description, targetDate, status) {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('goals')
    .upsert({
      goal_id: goalId,
      title,
      description: description || null,
      target_date: targetDate || null,
      status: status || 'active',
      progress: 0,
      created_at: now,
      updated_at: now
    }, { onConflict: 'goal_id', ignoreDuplicates: false })
    .select()
    .single()

  if (error) throw error
  console.log(JSON.stringify({ success: true, data }))
}

async function updateGoal(goalId, field, value) {
  const updateData = { updated_at: new Date().toISOString() }
  
  if (field === 'progress') {
    updateData.progress = parseInt(value)
  } else if (field === 'status') {
    updateData.status = value
  } else if (field === 'title') {
    updateData.title = value
  } else if (field === 'description') {
    updateData.description = value
  }

  const { data, error } = await supabase
    .from('goals')
    .update(updateData)
    .eq('goal_id', goalId)
    .select()
    .single()

  if (error) throw error
  console.log(JSON.stringify({ success: true, data }))
}

async function listGoals(status) {
  let query = supabase.from('goals').select('*')
  if (status) {
    query = query.eq('status', status)
  }
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  console.log(JSON.stringify({ success: true, data }))
}

// ============================================
// BRIEFINGS
// ============================================

async function createBriefing(type, title, content, relatedTaskId) {
  const validTypes = ['daily_brief', 'ops_alert', 'needs_decision', 'weekly_summary']
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`)
  }

  const { data, error } = await supabase
    .from('briefings')
    .insert({
      type,
      title,
      content,
      source: 'v3ktor',
      status: 'unread',
      related_task_id: relatedTaskId || null,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  console.log(JSON.stringify({ success: true, data }))
}

async function latestBriefings(type) {
  let query = supabase
    .from('briefings')
    .select('*')
    .neq('status', 'archived')
    .order('created_at', { ascending: false })
    .limit(10)

  if (type) query = query.eq('type', type)

  const { data, error } = await query
  if (error) throw error
  console.log(JSON.stringify({ success: true, data }))
}

async function markBriefingRead(id) {
  const { data, error } = await supabase
    .from('briefings')
    .update({ status: 'read' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  console.log(JSON.stringify({ success: true, data }))
}

// ============================================
// TOKEN SUMMARY
// ============================================

async function getTokenSummary(period) {
  let since = new Date()
  if (period === 'day') {
    since.setHours(0, 0, 0, 0)
  } else if (period === 'week') {
    since.setDate(since.getDate() - 7)
  } else if (period === 'month') {
    since.setMonth(since.getMonth() - 1)
  }

  const { data, error } = await supabase
    .from('token_usage')
    .select('*')
    .gte('timestamp', since.toISOString())
    .order('timestamp', { ascending: false })

  if (error) throw error

  const summary = {
    period,
    total_input: 0,
    total_output: 0,
    total_cost: 0,
    entries: data?.length || 0,
    by_model: {}
  }

  for (const entry of (data || [])) {
    summary.total_input += entry.input_tokens || 0
    summary.total_output += entry.output_tokens || 0
    summary.total_cost += parseFloat(entry.estimated_cost) || 0

    const model = entry.model || 'unknown'
    if (!summary.by_model[model]) {
      summary.by_model[model] = { input: 0, output: 0, cost: 0 }
    }
    summary.by_model[model].input += entry.input_tokens || 0
    summary.by_model[model].output += entry.output_tokens || 0
    summary.by_model[model].cost += parseFloat(entry.estimated_cost) || 0
  }

  console.log(JSON.stringify({ success: true, data: summary }))
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
          // status <state> [current_task] [task_id] [active_model]
          await updateStatus(args[1], args[2], args[3], args[4])
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
        // tokens <session_id> <input_tokens> <output_tokens> [model] [context_used] [context_max]
        await logTokens(args[1], args[2], args[3], args[4], args[5], args[6])
        break

      case 'goal':
        if (args[1] === 'create') {
          await createGoal(args[2], args[3], args[4], args[5], args[6])
        } else if (args[1] === 'update') {
          await updateGoal(args[2], args[3], args[4])
        } else if (args[1] === 'list') {
          await listGoals(args[2])
        }
        break

      case 'briefing':
        if (args[1] === 'create') {
          await createBriefing(args[2], args[3], args[4], args[5])
        } else if (args[1] === 'latest') {
          await latestBriefings(args[2])
        } else if (args[1] === 'read') {
          await markBriefingRead(args[2])
        }
        break

      case 'heartbeat':
        await heartbeat()
        break

      case 'summary':
        await getTokenSummary(args[1] || 'day')
        break

      default:
        console.log(JSON.stringify({
          success: false,
          error: 'Unknown command',
          usage: {
            log: 'log <action> [target] [outcome] [metadata_json]',
            status: 'status <state|get> [current_task] [task_id] [active_model]',
            briefing: 'briefing <create|latest|read> ...',
            heartbeat: 'heartbeat  (lightweight ping — updates updated_at only)',
            task: 'task <create|update|list> ...',
            notes: 'notes <unseen|seen|processed> ...',
            deliverable: 'deliverable <title> <type> [file_path] [external_url] [task_id]',
            tokens: 'tokens <session_id> <input> <output> [model] [context_used] [context_max]',
            goal: 'goal <create|update|list> ...',
            summary: 'summary <day|week|month>'
          }
        }))
    }
  } catch (err) {
    console.log(JSON.stringify({ success: false, error: err.message }))
    process.exit(1)
  }
}

main()
