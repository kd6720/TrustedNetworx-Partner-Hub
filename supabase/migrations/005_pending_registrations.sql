-- Pending accounts for admin approval flow
CREATE TABLE IF NOT EXISTS pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT,
  domain TEXT NOT NULL,
  company_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pending_access" ON pending_registrations;
CREATE POLICY "pending_access" ON pending_registrations FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON pending_registrations TO anon, authenticated, service_role;

-- Free-mail domains blocklist (prevent personal email signups)
CREATE TABLE IF NOT EXISTS blocked_domains (
  domain TEXT PRIMARY KEY,
  reason TEXT DEFAULT 'Free email provider',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE blocked_domains ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "blocked_access" ON blocked_domains;
CREATE POLICY "blocked_access" ON blocked_domains FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON blocked_domains TO anon, authenticated, service_role;

-- Seed blocked domains
INSERT INTO blocked_domains (domain) VALUES
  ('gmail.com'), ('yahoo.com'), ('outlook.com'), ('hotmail.com'),
  ('icloud.com'), ('protonmail.com'), ('aol.com'), ('mail.com'),
  ('live.com'), ('me.com'), ('msn.com'), ('ymail.com')
ON CONFLICT (domain) DO NOTHING;

-- Update the new user trigger to check pending registrations
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_domain TEXT;
  acc_id UUID;
  pending RECORD;
BEGIN
  user_domain := split_part(NEW.email, '@', 2);

  -- Check for pending registration approval
  SELECT * INTO pending FROM pending_registrations
    WHERE email = NEW.email AND status = 'approved';

  -- Find or create account
  SELECT id INTO acc_id FROM accounts WHERE domain = user_domain;
  
  IF acc_id IS NULL THEN
    IF user_domain = 'trustednetworx.com' THEN
      INSERT INTO accounts (domain, company_name) VALUES (user_domain, 'TrustedNetworx')
      RETURNING id INTO acc_id;
    ELSIF pending.id IS NOT NULL THEN
      -- Approved registration: create account
      INSERT INTO accounts (domain, company_name)
      VALUES (user_domain, COALESCE(pending.company_name, user_domain))
      RETURNING id INTO acc_id;
    ELSE
      acc_id := NULL;
    END IF;
  END IF;

  INSERT INTO profiles (id, email, full_name, role, account_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN user_domain = 'trustednetworx.com' THEN 'admin' ELSE 'user' END,
    acc_id
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
