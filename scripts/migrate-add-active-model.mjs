#!/usr/bin/env node
/**
 * Migration: Add active_model column to status table
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yeicnhotqdfwnjkkopcr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllaWNuaG90cWRmd25qa2tvcGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzg0MzgsImV4cCI6MjA4NTYxNDQzOH0.QpZZsSMq6dlqaF3r8pkVs4LtreYlSpir9LRKC-8gE_c'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function runMigration() {
  try {
    // Add active_model column to status table
    const { error } = await supabase.rpc('execute_sql', {
      sql: 'ALTER TABLE status ADD COLUMN IF NOT EXISTS active_model text;'
    })

    if (error && error.message.includes('already exists')) {
      console.log('Column already exists, skipping...')
    } else if (error) {
      console.error('Migration failed:', error)
      process.exit(1)
    } else {
      console.log('✓ Migration successful: Added active_model column')
    }
  } catch (err) {
    // Try direct SQL via REST API
    console.log('Trying alternative method...')
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        sql: 'ALTER TABLE status ADD COLUMN IF NOT EXISTS active_model text;'
      })
    })

    if (response.ok) {
      console.log('✓ Migration successful via REST API')
    } else {
      console.error('Migration failed:', await response.text())
      process.exit(1)
    }
  }
}

runMigration()
