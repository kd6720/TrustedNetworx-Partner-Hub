-- Email Integration — SMTP connections + email activity logging

-- Email connections (per-user SMTP/IMAP/OAuth config)
CREATE TABLE IF NOT EXISTS email_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook', 'smtp', 'imap')),
  email_address TEXT NOT NULL,
  display_name TEXT,
  
  -- SMTP settings (for sending)
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_user TEXT,
  smtp_password_enc TEXT,  -- encrypted at rest
  
  -- IMAP settings (for receiving, optional)
  imap_host TEXT,
  imap_port INTEGER DEFAULT 993,
  imap_user TEXT,
  imap_password_enc TEXT,
  imap_use_ssl BOOLEAN DEFAULT true,
  
  -- OAuth (for Gmail/Outlook native, future)
  oauth_provider TEXT,
  oauth_access_token_enc TEXT,
  oauth_refresh_token_enc TEXT,
  oauth_expires_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'ok' CHECK (sync_status IN ('ok', 'error', 'expired')),
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, email_address)
);

-- Email activities (sent/received emails logged against records)
CREATE TABLE IF NOT EXISTS email_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  connection_id UUID REFERENCES email_connections(id) ON DELETE SET NULL,
  
  -- Direction
  direction TEXT NOT NULL CHECK (direction IN ('sent', 'received')),
  
  -- Email metadata
  message_id TEXT,             -- RFC Message-ID for dedup
  thread_id TEXT,              -- For threading
  subject TEXT,
  body_text TEXT,              -- Plain-text body (for search)
  body_html TEXT,              -- HTML body (for display)
  snippet TEXT,                -- First 200 chars for previews
  
  -- Participants
  from_address TEXT NOT NULL,
  from_name TEXT,
  to_addresses TEXT[],         -- Array of recipient emails
  cc_addresses TEXT[],
  bcc_addresses TEXT[],
  
  -- Attachments
  has_attachments BOOLEAN DEFAULT false,
  attachment_count INTEGER DEFAULT 0,
  
  -- Linked record (polymorphic — links to one entity)
  linked_type TEXT CHECK (linked_type IN ('contact', 'lead', 'opportunity', 'company', 'account')),
  linked_id UUID,
  
  -- Auto-link status
  auto_linked BOOLEAN DEFAULT false,  -- true if matched by email address
  linked_by UUID REFERENCES auth.users(id), -- who manually linked it
  
  -- Status
  status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sending', 'sent', 'delivered', 'bounced', 'failed')),
  error_message TEXT,
  
  -- Inbound-specific
  received_at TIMESTAMPTZ,     -- When the email was actually received
  processed_at TIMESTAMPTZ,    -- When our system processed it
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- BCC dropbox settings per account (for auto-logging)
CREATE TABLE IF NOT EXISTS email_dropbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE UNIQUE,
  dropbox_address TEXT NOT NULL UNIQUE,  -- e.g., bcc+acct123@inbound.trustednetworx.com
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_activities_account ON email_activities(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_activities_user ON email_activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_activities_linked ON email_activities(linked_type, linked_id);
CREATE INDEX IF NOT EXISTS idx_email_activities_message_id ON email_activities(message_id);
CREATE INDEX IF NOT EXISTS idx_email_connections_user ON email_connections(user_id);

-- RLS
ALTER TABLE email_connections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "email_connections_access" ON email_connections;
CREATE POLICY "email_connections_access" ON email_connections FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE email_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "email_activities_access" ON email_activities;
CREATE POLICY "email_activities_access" ON email_activities FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE email_dropbox ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "email_dropbox_access" ON email_dropbox;
CREATE POLICY "email_dropbox_access" ON email_dropbox FOR ALL USING (true) WITH CHECK (true);

-- Grants
GRANT ALL ON email_connections, email_activities, email_dropbox TO anon, authenticated, service_role;
