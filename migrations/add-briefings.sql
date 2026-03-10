-- Briefings table for V3ktor daily ops summaries
create table if not exists briefings (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  type text not null check (type in ('daily_brief', 'ops_alert', 'needs_decision', 'weekly_summary')),
  title text not null,
  content text not null,
  source text not null default 'v3ktor',
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  related_task_id text,
  created_at timestamptz default now()
);

-- Enable realtime
alter publication supabase_realtime add table briefings;
