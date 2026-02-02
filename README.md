# V3ktor Operational Visibility Dashboard

**Radical transparency into everything V3ktor does.**

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd /Users/felmco/.openclaw/workspace/v3ktor-dashboard
npm install
```

### 2. Set Up Supabase

Create a new project at https://supabase.com

Run this SQL in Supabase SQL Editor:

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

-- Enable Realtime
alter publication supabase_realtime add table tasks, activity_log, notes, deliverables, status, token_usage;
```

### 3. Configure Environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

### 4. Run Locally

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Deploy to Vercel

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login --token=$(cat ~/.secrets/vercel-token.txt)

# Deploy
vercel --prod
```

---

## 📊 Dashboard Components

| Component | Purpose |
|-----------|---------|
| **Status Panel** | Current state, primary task, active sub-agents |
| **Task Board** | Kanban (To Do, In Progress, Done) |
| **Activity Log** | Every action logged (CRITICAL) |
| **Notes Panel** | User → V3ktor communication |
| **Deliverables Tab** | All artifacts produced |
| **Token Usage** | Simple token tracking |

---

## 🎨 Design System

### Future Tales Brand Colors
- Primary Dark: `#1A2850`
- Primary Light: `#01A2E9`
- Secondary Blue 1: `#2D3E50`
- Secondary Blue 2: `#475569`
- Neutral Gray: `#94A3B8`

### Typography
- Headings: Gill Sans
- Body: Avenir Next

### Visual Tone
- Transparent
- Technological
- Calm
- Precise
- Efficient
- Data-first

---

## 📱 Responsive Design

| Breakpoint | Layout |
|-----------|----------|
| Desktop (>1024px) | 2x3 grid (6 panels) |
| Tablet (768-1024px) | 2x2 or 1x3 grid |
| Mobile (<768px) | Stacked panels (single column) |

---

## 🔌 Core Principles

1. **Radical Transparency** — Every action is logged, no silent actions
2. **Single Source of Truth** — Dashboard reflects real internal state
3. **Self-Updating** — V3ktor updates without being asked
4. **Human Override** — User tasks supersede autonomous decisions
5. **Never Lies** — Failures and uncertainty are explicit
6. **Token Awareness** — Simple visibility into token usage

---

## 🚀 Deploy Status

**Current:** 🚧 Building locally
**Target:** Vercel (Free Tier)
**Database:** Supabase (Free Tier)

**Next:** Initialize Supabase project → Deploy to Vercel

---

**This dashboard is NOT optional — it's a core governance mechanism for V3ktor.**
