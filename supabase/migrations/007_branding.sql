-- TrustedNetworx Partner Hub — Branding + Profile Extensions
-- Migration 007

-- ============================================================
-- 1. PROFILE EXTENSIONS: phone, title, preferences
-- ============================================================
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"notifications": {"email": true, "marketing": false, "leads": true}}'::jsonb;

-- ============================================================
-- 2. PROFILE UPDATE POLICIES (allow self-edit)
-- ============================================================
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Manager can update users in their account (for role changes)
DROP POLICY IF EXISTS "manager_update_account_users" ON profiles;
CREATE POLICY "manager_update_account_users" ON profiles
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
    AND account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  );

-- Admin can update anyone
DROP POLICY IF EXISTS "admin_update_any" ON profiles;
CREATE POLICY "admin_update_any" ON profiles
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================
-- 3. ACCOUNT BRANDING TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS account_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE UNIQUE,
  company_name_override TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#06b6d4',   -- cyan (TrustedNetworx default)
  accent_color TEXT DEFAULT '#0891b2',    -- darker cyan
  sidebar_color TEXT DEFAULT '#0f172a',   -- slate-900
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: account members can read, manager can write
ALTER TABLE account_branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "branding_read_account_members" ON account_branding
  FOR SELECT USING (
    account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "branding_insert_manager" ON account_branding
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
    AND account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "branding_update_manager" ON account_branding
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
    AND account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================
-- 4. STORAGE BUCKET FOR BRANDING ASSETS
-- ============================================================
-- Run this in Supabase Dashboard > Storage or via API
-- CREATE POLICY "branding_assets_read_auth" ON storage.objects
--   FOR SELECT USING (bucket_id = 'branding' AND auth.role() = 'authenticated');
-- CREATE POLICY "branding_assets_insert_manager" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'branding' 
--     AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
--   );
