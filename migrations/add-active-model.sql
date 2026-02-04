-- Migration: Add active_model column to status table
-- Run this in Supabase Dashboard -> SQL Editor

ALTER TABLE status ADD COLUMN IF NOT EXISTS active_model text;

-- Update existing status row to have a default model
UPDATE status SET active_model = 'unknown' WHERE active_model IS NULL;
