// Shared TypeScript interfaces for the Partner Hub
// Replace all `any` types in components with these

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "manager" | "user";
  account_id: string | null;
}

export interface Lead {
  id: string;
  account_id: string;
  owner_user_id: string;
  name: string;
  company_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  estimated_value: number | null;
  notes: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  account_id: string;
  owner_user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  company_id: string | null;
  status: string;
  created_at: string;
}

export interface Company {
  id: string;
  account_id: string;
  owner_user_id: string;
  name: string;
  website: string | null;
  industry: string | null;
  size: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  created_at: string;
}

export interface EmailConnection {
  id: string;
  user_id: string;
  account_id: string;
  provider: "gmail" | "outlook" | "smtp" | "imap";
  email_address: string;
  display_name: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  imap_host: string | null;
  imap_port: number | null;
  is_active: boolean;
  is_default: boolean;
  sync_status: "ok" | "error" | "expired";
}

export interface EmailActivity {
  id: string;
  account_id: string;
  user_id: string;
  connection_id: string | null;
  direction: "sent" | "received";
  subject: string | null;
  body_text: string | null;
  snippet: string | null;
  from_address: string;
  from_name: string | null;
  to_addresses: string[];
  linked_type: "contact" | "lead" | "opportunity" | "company" | null;
  linked_id: string | null;
  status: string;
  has_attachments: boolean;
  created_at: string;
}

export interface PendingRegistration {
  id: string;
  email: string;
  full_name: string | null;
  domain: string;
  company_name: string | null;
  status: "pending" | "approved" | "denied";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}
