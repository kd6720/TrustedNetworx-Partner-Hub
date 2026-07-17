-- TrustedNetworx Partner Hub Schema
-- Run this in Supabase SQL Editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Partners table
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  primary_contact_id UUID,
  lines_under_mgmt INTEGER DEFAULT 0,
  team_size INTEGER DEFAULT 0,
  tools JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'rep')) DEFAULT 'rep',
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Key contacts
CREATE TABLE key_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('billing', 'support', 'legal')),
  name TEXT,
  email TEXT,
  phone TEXT,
  UNIQUE(partner_id, type)
);

-- Content folders
CREATE TABLE content_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content items
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id UUID REFERENCES content_folders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('deck', 'doc', 'video')),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Share links (tracked)
CREATE TABLE share_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id),
  user_id UUID REFERENCES users(id),
  deal_id UUID,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content views (analytics)
CREATE TABLE content_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_link_id UUID REFERENCES share_links(id) ON DELETE CASCADE,
  viewer_fingerprint TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documentation sections
CREATE TABLE doc_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  sort INTEGER DEFAULT 0
);

-- Documentation lessons
CREATE TABLE doc_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES doc_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  body TEXT,
  duration_min INTEGER DEFAULT 5,
  sort INTEGER DEFAULT 0
);

-- Lesson progress
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES doc_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Deals
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id),
  company_name TEXT NOT NULL,
  stage TEXT CHECK (stage IN (
    '1. Qualification', '2. Site Survey', '3. Proposal',
    '4. Contracting', '5. Closed Won', '6. Awaiting Install', '7. Activated'
  )) DEFAULT '1. Qualification',
  vertical TEXT,
  contact_name TEXT,
  contact_email TEXT,
  notes TEXT,
  lines INTEGER DEFAULT 0,
  mrc_per_line NUMERIC(10,2) DEFAULT 0,
  close_date DATE,
  owner_id UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_advanced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deal stage history
CREATE TABLE deal_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id),
  user_id UUID REFERENCES users(id),
  type TEXT,
  title TEXT,
  body TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-Level Security
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (each table filtered by partner_id from user metadata)
-- Example: CREATE POLICY "partner_access" ON deals FOR ALL USING (partner_id = (SELECT partner_id FROM users WHERE id = auth.uid()));
-- Add per-table policies based on your auth setup.

-- Seed data: Documentation sections
INSERT INTO doc_sections (title, sort) VALUES
  ('Working with TrustedNetworx', 1),
  ('Account & Operations', 2),
  ('Product Training', 3),
  ('Sales Enablement', 4),
  ('Marketing', 5),
  ('Client Onboarding', 6);

-- Seed data: Content folders
INSERT INTO content_folders (name, description, sort) VALUES
  ('Co-Branded Collateral', 'Sales decks, one-pagers, and competitive briefs with your branding', 1),
  ('Pitch & Demo Resources', 'Demo scripts, elevator pitches, and presentation resources', 2),
  ('Product Sheets & Battle Cards', 'Technical specs, feature comparisons, and objection handling', 3);
