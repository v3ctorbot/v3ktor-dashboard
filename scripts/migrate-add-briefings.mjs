#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yeicnhotqdfwnjkkopcr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllaWNuaG90cWRmd25qa2tvcGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzg0MzgsImV4cCI6MjA4NTYxNDQzOH0.QpZZsSMq6dlqaF3r8pkVs4LtreYlSpir9LRKC-8gE_c'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Try inserting a test row — if the table doesn't exist it will fail clearly
async function checkTable() {
  const { error } = await supabase.from('briefings').select('id').limit(1)
  if (!error) {
    console.log('✅ briefings table already exists.')
    return true
  }
  if (error.code === '42P01') {
    console.log('❌ briefings table does not exist. Please run the SQL in migrations/add-briefings.sql via the Supabase dashboard SQL editor.')
    console.log('\nSQL to run:\n')
    const fs = await import('fs')
    const sql = fs.readFileSync(new URL('../migrations/add-briefings.sql', import.meta.url), 'utf8')
    console.log(sql)
    return false
  }
  console.log('Error checking table:', error)
  return false
}

checkTable()
