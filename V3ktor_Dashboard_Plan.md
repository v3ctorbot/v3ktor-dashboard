# V3ktor Operational Visibility Dashboard

**Project Status:** 🚧 Building
**Date:** 2026-02-02
**Free Tier:** Yes (Vercel + Supabase)

---

## Tech Stack (Free Tier)

| Layer | Technology | Free Tier |
|--------|-------------|------------|
| **Frontend** | Next.js 15 + React + Tailwind + shadcn/ui | Vercel (100GB bandwidth) |
| **Backend** | Supabase Edge Functions | 500K requests/month |
| **Database** | Supabase PostgreSQL | 500MB, 50K rows |
| **Auth** | Supabase Auth | Email + Social login |
| **Storage** | Supabase Storage | 1GB |
| **Code** | GitHub | Free |

---

## Database Schema (Supabase)

### Tables

```sql
-- 1. Tasks (Kanban)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  origin TEXT CHECK (origin IN ('user', 'v3ktor', 'sub_agent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activity Log (CRITICAL)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action_type TEXT NOT NULL,
  actor TEXT NOT NULL,
  target TEXT,
  outcome TEXT CHECK (outcome IN ('success', 'partial', 'failed')),
  metadata JSONB
);

-- 3. Notes (User → V3ktor)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  status TEXT CHECK (status IN ('unseen', 'seen', 'processed')) DEFAULT 'unseen',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  related_task_id TEXT
);

-- 4. Deliverables (Docs/Files)
CREATE TABLE deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  file_path TEXT,
  external_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  related_task_id TEXT
);

-- 5. Status (Current State)
CREATE TABLE status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operational_state TEXT CHECK (operational_state IN ('working', 'idle', 'waiting', 'offline')),
  current_task TEXT,
  current_task_id TEXT,
  active_sub_agents JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Token Usage (Simple Tracking)
CREATE TABLE token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Next.js App (Vercel)               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐          │
│  │  Status      │  │ Task Board    │          │
│  │  Panel       │  │ (Kanban)     │          │
│  └──────────────┘  └──────────────┘          │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐          │
│  │ Activity    │  │ Notes Panel   │          │
│  │ Log         │  │              │          │
│  └──────────────┘  └──────────────┘          │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐          │
│  │Deliverables │  │ Token        │          │
│  │ Tab         │  │ Usage        │          │
│  └──────────────┘  └──────────────┘          │
│                                                         │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL)              │
│  - tasks              - activity_log             │
│  - notes              - deliverables              │
│  - status             - token_usage               │
└─────────────────────────────────────────────────────────┘
```

---

## UI Breakdown by Priority

### 1. Status Panel (Top, Always Visible)
- Operational state badge (working/idle/waiting/offline)
- Current primary task + task ID
- Active sub-agents list
- Real-time updates via Supabase realtime

### 2. Task Board (Kanban)
- 3 columns: To Do, In Progress, Done
- Task cards with: ID, title, description, priority, origin, timestamps
- Drag-drop or click to move

### 3. Activity Log (CRITICAL)
- Append-only, newest first
- Every entry: timestamp, action type, actor, target, outcome, metadata
- Searchable, filterable
- Never collapsed

### 4. Notes Panel
- User input for instructions
- Status: Unseen → Seen → Processed
- Links to related tasks when processed

### 5. Deliverables Tab
- List of all artifacts (reports, docs, files)
- Type, creation date, related task ID
- External link support (Google Drive folders)

### 6. Token Usage
- Simple counter per session
- Graph or table showing tokens used over time
- Session-based tracking

---

## Design System (Future Tales Brand)

```css
/* Colors */
--primary-dark: #1A2850;
--primary-light: #01A2E9;
--secondary-blue-1: #2D3E50;
--secondary-blue-2: #475569;
--neutral-gray: #94A3B8;
--text-primary: #1A2850;
--text-secondary: #475569;

/* Typography */
--font-heading: 'Gill Sans', sans-serif;
--font-body: 'Avenir Next', sans-serif;

/* Component Classes */
.status-panel { background: var(--primary-light); }
.task-card { border: 1px solid var(--neutral-gray); }
.log-entry { font-family: var(--font-body); }
```

---

## Responsive Strategy

| Breakpoint | Layout Changes |
|-----------|----------------|
| Desktop (>1024px) | 6-panel grid (2x3) |
| Tablet (768-1024px) | 3-panel grid (1x3) or 2x2 |
| Mobile (<768px) | Single column, stacked panels, horizontal scroll removed |

---

## Implementation Plan

### Sprint 1: Core Structure
1. ✅ Create Next.js project with shadcn/ui
2. ✅ Set up Supabase database schema
3. ✅ Build Status Panel component
4. ✅ Build Activity Log component

### Sprint 2: Task Management
5. Build Task Board (Kanban)
6. Task CRUD operations
7. Priority and status filtering

### Sprint 3: Communication
8. Build Notes Panel
9. Mark notes as seen/processed
10. Link notes to tasks

### Sprint 4: Deliverables
11. Build Deliverables Tab
12. Upload functionality
13. External URL support

### Sprint 5: Token Awareness
14. Build Token Usage component
15. Simple tracking display

### Sprint 6: Polish
16. Responsive refinement
17. Realtime subscriptions
18. Deploy to Vercel

---

## File Structure

```
/app
  /layout.tsx          # Root layout
  /page.tsx            # Dashboard main
  /components
    /StatusPanel.tsx
    /TaskBoard.tsx
    /ActivityLog.tsx
    /NotesPanel.tsx
    /DeliverablesTab.tsx
    /TokenUsage.tsx
  /lib
    /supabase.ts       # Supabase client
    /types.ts          # TypeScript types
  /hooks
    /useRealtime.ts    # Supabase realtime
```

---

## Token & Cost Optimization

| Strategy | Effect |
|----------|----------|
| Supabase Realtime | No polling, instant updates |
| Server components | Reduce client-side bundle |
| Edge Functions | Fast database queries |
| Efficient queries | Select only needed columns |

**Estimated token cost:** < 1K tokens/month (database updates)

---

## Deployment

**Vercel:**
- Project: v3ktor-dashboard
- Domain: (auto-generated by Vercel)
- Environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

**Supabase:**
- Project: v3ktor-ops-dashboard
- Tables: 6 (see schema above)

**GitHub:**
- Repo: v3ktor-dashboard
- Branch: main

---

## Status: 🚧 Ready to Build

**Next Step:** Initialize Next.js project + Supabase setup

**Estimated Build Time:** 2-3 hours
**Free Tier Constraints:** All within limits

---

**This dashboard is NOT optional — it's the core governance mechanism for V3ktor.**
