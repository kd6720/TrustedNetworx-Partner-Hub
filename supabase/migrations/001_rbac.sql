-- TrustedNetworx Partner Hub — Multi-tenant RBAC Schema
-- Target: Supabase PostgreSQL

-- ============================================================
-- 1. TENANTS (accounts grouped by email domain)
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,           -- e.g. 'acmecorp.com'
  company_name TEXT,
  plan TEXT DEFAULT 'free',              -- free | pro | enterprise
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  actor_email TEXT,
  action TEXT NOT NULL,                   -- role_change | cross_tenant_access | user_deactivated | user_invited
  target_user_id UUID REFERENCES auth.users(id),
  target_account_id UUID REFERENCES accounts(id),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. LEADS (scoped to account + owner)
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  company_name TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  source TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost')),
  estimated_value DECIMAL(12,2),
  notes TEXT,
  next_follow_up DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. CONTACTS
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  company_id UUID REFERENCES accounts(id),
  notes TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. COMPANIES
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  size TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  notes TEXT,
  lead_source TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

-- Profiles: Users see own profile, managers see account members, admins see all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (
    auth.uid() = id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR ((SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
        AND account_id = (SELECT account_id FROM profiles WHERE id = auth.uid()))
  );

-- Leads: USER = own, MANAGER = account, ADMIN = all
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_user_own" ON leads
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY "leads_manager_account" ON leads
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
    AND account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "leads_admin_all" ON leads
  FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "leads_insert" ON leads FOR INSERT WITH CHECK (
  owner_user_id = auth.uid()
  AND account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
);

-- Contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_user_own" ON contacts
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY "contacts_manager_account" ON contacts
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
    AND account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "contacts_admin_all" ON contacts
  FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "contacts_insert" ON contacts FOR INSERT WITH CHECK (
  owner_user_id = auth.uid()
  AND account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
);

-- Companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies_user_own" ON companies
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY "companies_manager_account" ON companies
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
    AND account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "companies_admin_all" ON companies
  FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Audit log: admin read-only
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_admin_read" ON audit_log
  FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "audit_admin_insert" ON audit_log FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ============================================================
-- 8. SEED DATA
-- ============================================================

-- Create the TrustedNetworx vendor account
INSERT INTO accounts (id, domain, company_name, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'trustednetworx.com', 'TrustedNetworx', 'enterprise')
ON CONFLICT (domain) DO NOTHING;

-- ============================================================
-- 9. HELPER FUNCTION: get current user's role
-- ============================================================
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- 10. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_domain TEXT;
  acc_id UUID;
BEGIN
  -- Extract domain from email
  user_domain := split_part(NEW.email, '@', 2);

  -- Find or create account
  SELECT id INTO acc_id FROM accounts WHERE domain = user_domain;
  IF acc_id IS NULL THEN
    -- For trustednetworx.com, auto-create
    IF user_domain = 'trustednetworx.com' THEN
      INSERT INTO accounts (domain, company_name) VALUES (user_domain, 'TrustedNetworx')
      RETURNING id INTO acc_id;
    ELSE
      -- Unknown domain: attach to no account (admin must assign)
      acc_id := NULL;
    END IF;
  END IF;

  -- Determine role: trustednetworx.com staff get admin
  INSERT INTO profiles (id, email, full_name, role, account_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN user_domain = 'trustednetworx.com' THEN 'admin' ELSE 'user' END,
    acc_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
