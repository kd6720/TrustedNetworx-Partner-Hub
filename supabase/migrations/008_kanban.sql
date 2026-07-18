-- TrustedNetworx Partner Hub — Kanban Project Management
-- Migration 008

-- ============================================================
-- 1. KANBAN BOARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS kanban_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',  -- indigo
  icon TEXT DEFAULT 'Layout',
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. KANBAN COLUMNS (workflow stages)
-- ============================================================
CREATE TABLE IF NOT EXISTS kanban_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#94a3b8',  -- slate-400
  sort_order INT DEFAULT 0,
  task_limit INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default columns for new boards via trigger or app logic

-- ============================================================
-- 3. TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS kanban_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES kanban_columns(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES kanban_tasks(id) ON DELETE CASCADE,  -- for subtasks
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'in_review', 'completed', 'archived')),
  project TEXT,
  due_date DATE,
  target_completion_date DATE,
  estimated_hours DECIMAL(6,2),
  actual_hours DECIMAL(6,2),
  completion_percentage INT DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  is_recurring BOOLEAN DEFAULT false,
  recurring_cron TEXT,  -- cron expression for recurrence
  tags TEXT[],
  sort_order INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID[] DEFAULT '{}',  -- array of user IDs (future multi-agent)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast board+column queries
CREATE INDEX IF NOT EXISTS idx_tasks_board_column ON kanban_tasks(board_id, column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_account ON kanban_tasks(account_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON kanban_tasks(parent_id);

-- ============================================================
-- 4. TASK DEPENDENCIES
-- ============================================================
CREATE TABLE IF NOT EXISTS kanban_task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES kanban_tasks(id) ON DELETE CASCADE,
  depends_on_id UUID NOT NULL REFERENCES kanban_tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(task_id, depends_on_id),
  CHECK(task_id != depends_on_id)
);

-- ============================================================
-- 5. TASK ATTACHMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS kanban_task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES kanban_tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'link' CHECK (type IN ('link', 'file', 'image', 'prompt', 'document')),
  size_bytes BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. TASK COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS kanban_task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES kanban_tasks(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. TASK ACTIVITY LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS kanban_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES kanban_tasks(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),
  actor_name TEXT,
  action TEXT NOT NULL,
  field TEXT,
  old_value TEXT,
  new_value TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_task ON kanban_activity_log(task_id);

-- ============================================================
-- 8. AGENT SCHEDULES (cron visibility)
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  purpose TEXT,
  agent_id TEXT,  -- which Hermes agent
  schedule_expression TEXT NOT NULL,  -- cron or natural language
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  last_status TEXT CHECK (last_status IN ('success', 'failure', 'running', 'pending', 'paused')),
  last_duration_ms INT,
  last_error TEXT,
  is_active BOOLEAN DEFAULT true,
  trigger_type TEXT DEFAULT 'cron' CHECK (trigger_type IN ('cron', 'manual', 'webhook', 'event')),
  linked_board_id UUID REFERENCES kanban_boards(id) ON DELETE SET NULL,
  linked_task_id UUID REFERENCES kanban_tasks(id) ON DELETE SET NULL,
  project TEXT,
  category TEXT,
  execution_count INT DEFAULT 0,
  failure_count INT DEFAULT 0,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. AGENT HEALTH / CONNECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Hermes Agent',
  endpoint_url TEXT,
  api_key_encrypted TEXT,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'connecting')),
  last_heartbeat TIMESTAMPTZ,
  version TEXT,
  capabilities TEXT[],
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 10. ROW LEVEL SECURITY
-- ============================================================

-- Boards: account members can read/write
ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "boards_account_read" ON kanban_boards FOR SELECT USING (
  account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "boards_account_write" ON kanban_boards FOR INSERT WITH CHECK (
  account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "boards_account_update" ON kanban_boards FOR UPDATE USING (
  account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "boards_account_delete" ON kanban_boards FOR DELETE USING (
  account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Columns
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "columns_account_read" ON kanban_columns FOR SELECT USING (
  board_id IN (SELECT id FROM kanban_boards WHERE account_id = (SELECT account_id FROM profiles WHERE id = auth.uid()))
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "columns_account_write" ON kanban_columns FOR INSERT WITH CHECK (
  board_id IN (SELECT id FROM kanban_boards WHERE account_id = (SELECT account_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "columns_account_update" ON kanban_columns FOR UPDATE USING (
  board_id IN (SELECT id FROM kanban_boards WHERE account_id = (SELECT account_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "columns_account_delete" ON kanban_columns FOR DELETE USING (
  board_id IN (SELECT id FROM kanban_boards WHERE account_id = (SELECT account_id FROM profiles WHERE id = auth.uid()))
);

-- Tasks (inherit board RLS via board_id)
ALTER TABLE kanban_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_account_read" ON kanban_tasks FOR SELECT USING (
  account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "tasks_account_write" ON kanban_tasks FOR INSERT WITH CHECK (
  account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "tasks_account_update" ON kanban_tasks FOR UPDATE USING (
  account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "tasks_account_delete" ON kanban_tasks FOR DELETE USING (
  account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Activity, Comments, Attachments inherit from task
ALTER TABLE kanban_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_task_scope" ON kanban_activity_log FOR SELECT USING (
  task_id IN (SELECT id FROM kanban_tasks WHERE account_id = (SELECT account_id FROM profiles WHERE id = auth.uid()))
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "activity_task_insert" ON kanban_activity_log FOR INSERT WITH CHECK (
  task_id IN (SELECT id FROM kanban_tasks WHERE account_id = (SELECT account_id FROM profiles WHERE id = auth.uid()))
);

ALTER TABLE kanban_task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_task_scope" ON kanban_task_comments FOR SELECT USING (
  task_id IN (SELECT id FROM kanban_tasks WHERE account_id = (SELECT account_id FROM profiles WHERE id = auth.uid()))
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "comments_task_insert" ON kanban_task_comments FOR INSERT WITH CHECK (
  task_id IN (SELECT id FROM kanban_tasks WHERE account_id = (SELECT account_id FROM profiles WHERE id = auth.uid()))
);

ALTER TABLE kanban_task_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attachments_task_scope" ON kanban_task_attachments FOR SELECT USING (
  task_id IN (SELECT id FROM kanban_tasks WHERE account_id = (SELECT account_id FROM profiles WHERE id = auth.uid()))
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "attachments_task_insert" ON kanban_task_attachments FOR INSERT WITH CHECK (
  task_id IN (SELECT id FROM kanban_tasks WHERE account_id = (SELECT account_id FROM profiles WHERE id = auth.uid()))
);

-- Schedules
ALTER TABLE agent_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedules_account_read" ON agent_schedules FOR SELECT USING (
  account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "schedules_account_write" ON agent_schedules FOR INSERT WITH CHECK (
  account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "schedules_account_update" ON agent_schedules FOR UPDATE USING (
  account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "schedules_account_delete" ON agent_schedules FOR DELETE USING (
  account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
);

-- Agent connections
ALTER TABLE agent_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "connections_account_read" ON agent_connections FOR SELECT USING (
  account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "connections_account_write" ON agent_connections FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  AND account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "connections_account_update" ON agent_connections FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  AND account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
);

-- Task dependencies
ALTER TABLE kanban_task_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deps_task_scope" ON kanban_task_dependencies FOR SELECT USING (
  task_id IN (SELECT id FROM kanban_tasks WHERE account_id = (SELECT account_id FROM profiles WHERE id = auth.uid()))
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "deps_task_insert" ON kanban_task_dependencies FOR INSERT WITH CHECK (
  task_id IN (SELECT id FROM kanban_tasks WHERE account_id = (SELECT account_id FROM profiles WHERE id = auth.uid()))
);

-- ============================================================
-- 11. AUTO-CREATE DEFAULT BOARD + COLUMNS FOR NEW ACCOUNTS
-- ============================================================
CREATE OR REPLACE FUNCTION create_default_kanban_board()
RETURNS TRIGGER AS $$
DECLARE
  board_id UUID;
BEGIN
  -- Create default board
  INSERT INTO kanban_boards (account_id, name, description, color, created_by)
  VALUES (NEW.id, 'Active Projects', 'Default workspace for tracking projects and tasks', '#6366f1', NEW.created_by)
  RETURNING id INTO board_id;

  -- Create default columns
  INSERT INTO kanban_columns (board_id, name, color, sort_order) VALUES
    (board_id, 'Backlog', '#94a3b8', 0),
    (board_id, 'Ready', '#3b82f6', 1),
    (board_id, 'In Progress', '#f59e0b', 2),
    (board_id, 'In Review', '#8b5cf6', 3),
    (board_id, 'Completed', '#10b981', 4);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_account_created ON accounts;
CREATE TRIGGER on_account_created
  AFTER INSERT ON accounts
  FOR EACH ROW EXECUTE FUNCTION create_default_kanban_board();
