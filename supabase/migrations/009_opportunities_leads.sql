-- TrustedNetworx Partner Hub — Opportunities, Leads, Library, Notifications, Registration
-- Migration 009

-- ============================================================
-- 1. OPPORTUNITIES — deal pipeline
-- ============================================================
CREATE TYPE vertical_enum AS ENUM (
  'senior_living', 'hospitality', 'healthcare', 'property_management', 'enterprise'
);

CREATE TABLE IF NOT EXISTS opportunities (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  company_name  text NOT NULL,
  stage         int NOT NULL DEFAULT 1 CHECK (stage BETWEEN 1 AND 7),
  close_date    date,
  lines         int DEFAULT 1,
  mrc_per_line  numeric(10,2) DEFAULT 0,
  vertical      vertical_enum,
  contact_name  text,
  contact_email text,
  notes         text,
  owner_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  last_advanced_at timestamptz
);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read own opportunities"
    ON opportunities FOR SELECT
    USING (owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert opportunities"
    ON opportunities FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own opportunities"
    ON opportunities FOR UPDATE
    USING (owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own opportunities"
    ON opportunities FOR DELETE
    USING (owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. LIBRARY ITEMS
-- ============================================================
CREATE TYPE library_item_type AS ENUM ('deck', 'document', 'video');

CREATE TABLE IF NOT EXISTS library_items (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id           uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  folder               text NOT NULL DEFAULT 'General',
  title                text NOT NULL,
  description          text,
  type                 library_item_type NOT NULL DEFAULT 'document',
  file_path            text,
  storage_object_path  text,
  size_bytes           int DEFAULT 0,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can read library items"
    ON library_items FOR SELECT
    USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can insert library items"
    ON library_items FOR INSERT
    WITH CHECK (EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update library items"
    ON library_items FOR UPDATE
    USING (EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 3. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       text NOT NULL,
  body        text,
  read        boolean DEFAULT false,
  link        text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 4. REGISTRATION REQUESTS
-- ============================================================
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS registration_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   text NOT NULL,
  work_email  text NOT NULL,
  company     text NOT NULL,
  status      registration_status DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can insert registration requests"
    ON registration_requests FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can read registration requests"
    ON registration_requests FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update registration requests"
    ON registration_requests FOR UPDATE
    USING (EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 5. KANBAN TASKS — add assignee_id (existing columns kept)
-- ============================================================
ALTER TABLE kanban_tasks ADD COLUMN IF NOT EXISTS assignee_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- ============================================================
-- 6. SEED DEMO OPPORTUNITIES
-- ============================================================
INSERT INTO opportunities (account_id, company_name, stage, lines, mrc_per_line, vertical, contact_name, notes)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Sunset Senior Living',    4, 120, 38, 'senior_living',      'Sarah Chen',     'Demo deal — 4 communities, POTS replacement + voice'),
  ('00000000-0000-0000-0000-000000000001', 'Bayview Hospitality Group', 3, 85,  42, 'hospitality',        'Michael Torres',  'Demo deal — 3 hotels, internet + hosted PBX'),
  ('00000000-0000-0000-0000-000000000001', 'Metro Medical Center',    2, 200, 36, 'healthcare',         'Dr. Patel',       'Demo deal — 1 hospital campus, compliance lines + failover');

-- ============================================================
-- 7. SEED DEMO LEADS
-- ============================================================
INSERT INTO leads (account_id, name, company, email, phone, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'James Wilson', 'Oakridge Properties', 'james@oakridge.com', '(415) 555-0101', 'new'),
  ('00000000-0000-0000-0000-000000000001', 'Amanda Lee', 'Pacific Inn Group', 'alee@pacificinn.com', '(503) 555-0202', 'contacted'),
  ('00000000-0000-0000-0000-000000000001', 'Robert Kim', 'Evergreen Senior Living', 'rkim@evergreensl.com', '(206) 555-0303', 'qualified');
