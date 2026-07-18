# Partner Hub — Admin Guide
## For Carter Dewey · TrustedNetworx

As the platform admin, you have **unrestricted access** to everything. This guide covers what only you can do.

---

## Your Dashboard

When you sign in at `/login`, you'll see a blue banner at the top of the CRM:
> "🔐 Admin view: You see all accounts and all data. Agents see only their own records."

This means every list, every stat, every pipeline view is **global** — across all partner agencies.

---

## What Only You Can Do

### 1. Approve or Deny New Partners

Partners request access at `/register`. Their requests land in your **Admin Panel** (`/admin`).

**To approve:**
1. Go to **Settings → Admin Panel** (or click `/admin`)
2. Under "Pending Approvals," review each request
3. Click **Approve** — their domain gets an account, they can sign up
4. Click **Deny** — request closed, they're blocked

You'll see each request's: name, email, domain, company name, and date submitted.

**What happens on approve:** The `pending_registrations` table updates to "approved." An account is created for their domain. When they sign up, they auto-attach to that account.

### 2. Invite Partners Manually

Skip the registration flow entirely:

1. Go to `/admin`
2. Under "Invite Partner," enter their work email
3. Click **Invite**
4. They receive a Supabase invite email → set password → auto-attached to their account

Use this for partners you've already spoken to — it's instant.

### 3. View All Registrations

The "All Registrations" table at `/admin` shows every registration ever submitted: approved, denied, and pending. Useful for tracking who's requested access over time.

### 4. Audit Log

Every admin action is logged:
- Who you approved/denied
- When you changed a role
- When you accessed another account's data

The audit log is queryable via the `audit_log` table in Supabase (or through the Admin Panel audit link — coming soon).

### 5. See All Pipeline Deals

Go to `/opportunities` or `/crm`. You see every deal from every partner: their pipeline stage, estimated ACV, close dates, and engagement analytics.

**What partners see:** Only their own deals.

### 6. Manage Partner Accounts

In Supabase dashboard → Table Editor → `accounts`:
- View all partner domains and company names
- Toggle `is_active` to suspend an entire agency
- Change plan tier (`free` / `pro` / `enterprise`)

### 7. Assign or Change Roles

In Supabase dashboard → Table Editor → `profiles`:
- Set `role` to `admin`, `manager`, or `user`
- Role changes take effect on next login
- Only you can assign the `admin` role

---

## Quick Reference

| Task | Where |
|---|---|
| Approve a new partner | `/admin` → Pending Approvals |
| Invite a partner | `/admin` → Invite Partner |
| See all deals | `/opportunities` or `/crm` |
| See all leads | `/crm/leads` |
| Suspend an agency | Supabase → `accounts` → `is_active = false` |
| Change a user's role | Supabase → `profiles` → `role` |
| View audit log | Supabase → `audit_log` table |

---

## Your Login

- **URL:** `https://hub.trustednetworx.com/login`
- **Email:** `carter@trustednetworx.com`
- **Role:** `admin` (global access)

If you forget your password, use the Supabase dashboard → Authentication → Users → Reset Password.

---

## Security Notes

- Your admin access bypasses all Row-Level Security — you see everything
- Never share your password or the service role key
- The anon key is safe to expose (it's in the client) — it's RLS-scoped
- Deactivated users cannot sign in, but their data is preserved

---

*Admin Guide · TrustedNetworx Partner Hub · July 2026*
