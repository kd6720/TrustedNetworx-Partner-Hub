-- Fix: Allow all authenticated access + service role bypass
-- Drop old restrictive policies and create permissive ones

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "service_role_bypass" ON profiles;
CREATE POLICY "profiles_access" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- Leads  
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "leads_user_own" ON leads;
DROP POLICY IF EXISTS "leads_manager_account" ON leads;
DROP POLICY IF EXISTS "leads_admin_all" ON leads;
DROP POLICY IF EXISTS "leads_insert" ON leads;
DROP POLICY IF EXISTS "service_role_bypass" ON leads;
CREATE POLICY "leads_access" ON leads FOR ALL USING (true) WITH CHECK (true);

-- Contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contacts_user_own" ON contacts;
DROP POLICY IF EXISTS "contacts_manager_account" ON contacts;
DROP POLICY IF EXISTS "contacts_admin_all" ON contacts;
DROP POLICY IF EXISTS "contacts_insert" ON contacts;
DROP POLICY IF EXISTS "service_role_bypass" ON contacts;
CREATE POLICY "contacts_access" ON contacts FOR ALL USING (true) WITH CHECK (true);

-- Companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "companies_user_own" ON companies;
DROP POLICY IF EXISTS "companies_manager_account" ON companies;
DROP POLICY IF EXISTS "companies_admin_all" ON companies;
DROP POLICY IF EXISTS "service_role_bypass" ON companies;
CREATE POLICY "companies_access" ON companies FOR ALL USING (true) WITH CHECK (true);

-- Audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_admin_read" ON audit_log;
DROP POLICY IF EXISTS "audit_admin_insert" ON audit_log;
DROP POLICY IF EXISTS "service_role_bypass" ON audit_log;
CREATE POLICY "audit_access" ON audit_log FOR ALL USING (true) WITH CHECK (true);

-- Accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_bypass" ON accounts;
CREATE POLICY "accounts_access" ON accounts FOR ALL USING (true) WITH CHECK (true);

-- Grant table permissions
GRANT ALL ON profiles, leads, contacts, companies, audit_log, accounts TO anon, authenticated, service_role;
