# TrustedNetworx Partner Hub — Comprehensive Platform Guide

**Version:** 1.0 · **Last updated:** July 2026
**Deployment:** GitHub → Vercel · **Database:** Supabase
**URL:** `https://hub.trustednetworx.com`

---

## Table of Contents

1. [What Is This Platform](#1-what-is-this-platform)
2. [Roles & Permissions](#2-roles--permissions)
3. [Architecture](#3-architecture)
4. [Account Lifecycle](#4-account-lifecycle)
5. [Page-by-Page Reference](#5-page-by-page-reference)
6. [CRM — Lead Management](#6-crm--lead-management)
7. [Training Hub](#7-training-hub)
8. [Content Library](#8-content-library)
9. [Documentation / LMS](#9-documentation--lms)
10. [Opportunities & Pipeline](#10-opportunities--pipeline)
11. [Admin Panel](#11-admin-panel)
12. [Settings](#12-settings)
13. [AI Assistant](#13-ai-assistant)
14. [Data Model](#14-data-model)
15. [Security & RLS](#15-security--rls)
16. [Deployment & Operations](#16-deployment--operations)
17. [FAQ](#17-faq)

---

## 1. What Is This Platform

The TrustedNetworx Partner Hub is a **white-label partner enablement portal** for telecom agents, MSPs, VARs, and interconnect partners. It gives TrustedNetworx:

- **Pipeline visibility** — see every deal every partner is working, in real time
- **Content distribution** — sales decks, battle cards, one-pagers served from a single source
- **Training & certification** — structured LMS with video courses, documents, and progress tracking
- **Lead management built in** — CRM with contacts, companies, leads, and embeddable capture forms
- **Multi-tenant isolation** — each partner agency sees only their own data; you see everything as admin

The product line includes: **POTS replacement, Hosted PBX / UCaaS, SIP trunking, internet connectivity, wireless failover, and managed voice.**

---

## 2. Roles & Permissions

### Admin (Carter)

| Can do | Cannot do |
|---|---|
| See all accounts, all data, all deals | — |
| Create/suspend partner accounts | — |
| Assign roles (admin/manager/user) | — |
| Approve or deny registration requests | — |
| View audit log of all admin actions | — |
| Invite partners by email | — |

### Manager (Partner agency lead)

| Can do | Cannot do |
|---|---|
| See all data within their own agency | See other agencies' data |
| Invite new users to their agency | Promote users to admin |
| View all agency deals and contacts | Access admin panel |
| Manage team members (deactivate) | Change their own role |

### User (Agent / Sales rep)

| Can do | Cannot do |
|---|---|
| See their own leads, contacts, companies | See other users' data (even same agency) |
| Register deals | Invite other users |
| Access content library and training | Access admin panel |
| Use the AI Assistant | Change roles |

**Role assignment:** A user's role is stored in the `profiles` table and loaded on every session. Role changes take effect on next login. The service role key is never exposed to the client.

---

## 3. Architecture

```
┌──────────────────────────────────────────────┐
│                 Vercel                       │
│  ┌────────────────────────────────────────┐  │
│  │  Next.js 16 App Router (18 routes)     │  │
│  │  Tailwind v4 · shadcn/ui · Recharts   │  │
│  │  @supabase/ssr · lucide-react          │  │
│  └──────────────┬─────────────────────────┘  │
└─────────────────┼────────────────────────────┘
                  │ HTTPS
┌─────────────────┼────────────────────────────┐
│            Supabase                           │
│  ┌──────────────┴──────────────────────────┐ │
│  │  Auth (JWT with role + account_id)      │ │
│  │  Postgres (RLS per table, per role)     │ │
│  │  Storage (content-library, logos)       │ │
│  └─────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, CSS custom properties |
| Auth | Supabase Auth (email/password, JWT) |
| Database | Supabase Postgres with Row-Level Security |
| Charts | Recharts |
| Icons | lucide-react |
| Font | Inter (via next/font/google) |
| Deployment | Vercel (push-to-deploy from GitHub) |

---

## 4. Account Lifecycle

### Registration Flow

```
Partner visits /register
        │
        ├─ @gmail/@yahoo/@outlook? ──→ BLOCKED: "Use work email"
        │
        ├─ Domain already has account? ──→ BLOCKED: "Ask your admin to invite you"
        │
        └─ New business domain ──→ PENDING: Held for admin approval
                                        │
                          ┌─────────────┴─────────────┐
                          ▼                           ▼
                     APPROVED                      DENIED
                          │                           │
                    Account created              Request closed
                    Profile created              Audit logged
                    Email confirmation sent
```

### Invite Flow

```
Admin goes to /admin
        │
        ├─ "Invite Partner" — enters email
        │       │
        │       └─ Supabase sends invite email
        │              │
        │              └─ Partner clicks link, sets password
        │                     │
        │                     └─ Auto-attached to domain's account
        │
        └─ "Approve" pending registration
                │
                └─ Partner's domain → new account created
                      Partner signs up → auto-attached
```

### Deactivation

- Manager or Admin deactivates a user
- User's session is invalidated immediately
- User's data is preserved (soft delete) — no data loss
- Reactivation restores access

---

## 5. Page-by-Page Reference

### 5.1 Home Dashboard (`/`)

Personalized greeting, quick-action cards, 6-stage onboarding tracker, recent notifications.

**Admin view:** Sees a blue banner "Admin view — all accounts, all data." Stats are global (across all partner agencies).

**Agent view:** Sees only their own stats, their own onboarding progress, their own notifications.

### 5.2 Content Library (`/library`)

Folder-based content browser. Folders: Co-Branded Collateral, Pitch & Demo Resources, Compliance & Life-Safety. Each folder shows item count and last-modified date.

**Item actions:** Preview (opens file viewer) · Share (generates tracked link) · Download.

**Future:** Tracked share links log viewer events → feed engagement analytics on deal detail pages.

### 5.3 Documentation LMS (`/documentation`)

Three-column layout: left section tree, center lesson content, right progress card.

**6 sections:** Working with TrustedNetworx, Account & Operations, Product Training, Sales Enablement, Marketing, Client Onboarding.

**Lesson features:** Mark as completed, Present mode (fullscreen for screen-sharing), progress bars.

### 5.4 Training Hub (`/training`)

Quick links to Video Library, Document Library, Certification (coming soon). Featured training cards with type badges, duration, and module counts.

- **Videos (`/training/videos`):** 9 video cards with play overlays, categorized by Product/Sales/Technical/Onboarding
- **Documents (`/training/documents`):** 12 downloadable docs with type badges (PDF, XLSX, DOCX) and page counts

### 5.5 CRM Dashboard (`/crm`)

Live Supabase data. Shows total leads, companies, contacts, and won deals. Quick-link cards to Leads, Contacts, Companies, Forms. Recent leads table with status badges.

**Scoping:** Admin sees everything. Agents see only their own records.

### 5.6 CRM — Leads (`/crm/leads`)

Full leads table with search and status filter. Columns: name, company, status badge, estimated value, date. Statuses: new, contacted, qualified, proposal_sent, won, lost.

### 5.7 CRM — Contacts (`/crm/contacts`)

People directory. Columns: name, email, phone, status, created date. Search across name and email.

### 5.8 CRM — Companies (`/crm/companies`)

Grid of organization profiles. Each card shows company name, industry, contact count, lead count, and website. Click-through to detail views.

### 5.9 CRM — Forms (`/crm/forms`)

Embeddable lead capture forms. Shows form name, submission count, embed code with copy button, and preview link.

### 5.10 Opportunities (`/opportunities`)

Pipeline view with 7 telecom-tuned stages: Qualification → Discovery/Site Survey → Proposal → Contracting → Closed Won → Awaiting Install → Activated. Deal detail page with stage stepper, ACV calculator (lines × MRC × 12), and engagement analytics.

### 5.11 Admin Panel (`/admin`)

**Restricted to admin role.** Three sections:

1. **Pending Approvals** — one-click approve/deny for each registration request. Shows name, email, domain, company, date.
2. **All Registrations** — full table with status badges (pending/approved/denied).
3. **Quick Actions** — Invite Partner (email input + send) and Audit Log link.

All approval/denial actions are logged to the `audit_log` table.

### 5.12 Settings — Brand & Company (`/settings/brand-kit`)

Logo upload (drag-and-drop, max 5MB, PNG/JPG/SVG), company info fields, primary contact for co-branded materials, and passkey authentication setup card.

### 5.13 Settings — Team Members (`/settings/users`)

Invite user form (email + role: Rep/Admin), team member list with role badges and "(you)" indicator, and Billing/Support/Legal key contacts section.

### 5.14 Login (`/login`)

Email/password form with "Request Access" link to `/register`.

### 5.15 Register (`/register`)

Multi-state form: form → checking → blocked/pending/approved. Validates business email domain. Blocks free-mail providers. New domains held for admin approval.

---

## 6. CRM — Lead Management

The built-in CRM replaces the need for a separate tool. It covers the full lead lifecycle:

```
New → Contacted → Qualified → Proposal Sent → Won/Lost
```

### Features
- **Lead table** with status badges and filters
- **Contact directory** linked to companies
- **Company profiles** with industry and lead counts
- **Embeddable forms** for website lead capture
- **Pipeline tracking** with estimated value per lead
- **Search** across all entities

### Data Scoping
Every record carries `account_id` and `owner_user_id`. Row-Level Security ensures:
- **Users** see only their own records
- **Managers** see all records in their account
- **Admins** see all records globally

---

## 7. Training Hub

### Video Library
9 onboarding and product training videos across 4 categories:
- **Product Training:** POTS Replacement overview, UCaaS walkthrough, SIP trunking deep dive
- **Technical:** Wireless failover setup, installation guides
- **Sales:** Objection handling, pipeline building, battle cards
- **Onboarding:** Portal orientation, deal registration process

### Document Library
12 downloadable resources:
- Sales playbooks, competitive intelligence briefs, feature comparison matrices
- Technical specs and deployment guides
- Partner agreement templates, co-branding guidelines
- Pricing and commission structures

### Certification (Planned)
Structured certification tracks with badges and rewards for completing training modules.

---

## 8. Content Library

### Folder Structure
| Folder | Contents |
|---|---|
| Co-Branded Collateral | Sales decks, one-pagers, competitive briefs with partner branding |
| Pitch & Demo Resources | Demo scripts, elevator pitches, presentation templates |
| Compliance & Life-Safety | NFPA 72, elevator, fire-alarm line modernization materials |

### Share Tracking (Planned)
When a partner shares a document, the system generates a tokenized public link. Each view is logged, feeding:
- Notification to the partner ("Your POTS one-pager was viewed")
- Engagement analytics on the deal detail page

---

## 9. Documentation / LMS

### Course Sections
1. **Working with TrustedNetworx** — Your team, key documents, support model, pipeline goals
2. **Account & Operations** — Billing, commissions, deal registration
3. **Product Training** — POTS replacement, Hosted PBX/UCaaS, SIP, failover, portal
4. **Sales Enablement** — Pitch scripts, objection handling, competitive positioning
5. **Marketing** — Co-branding, campaign materials, social media assets
6. **Client Onboarding** — Installation process, timelines, customer handoff

### Support Model
- **Partner = Level 1 support** — First line for end customers
- **TrustedNetworx NOC = Level 2 support** — Escalation for complex issues
- TrustedNetworx does not communicate directly with end clients — the partner is the face of the service

---

## 10. Opportunities & Pipeline

### 7 Stages (Telecom-Tuned)
1. **Qualification** — Initial contact, needs assessment
2. **Discovery / Site Survey** — Technical evaluation, site walk
3. **Proposal** — Quote generation, solution design
4. **Contracting** — Agreement, terms, signatures
5. **Closed Won** — Deal signed, handoff to implementation
6. **Awaiting Install** — Equipment shipped, install scheduled
7. **Activated** — Service live, billing started

### Deal Economics
- **Lines/seats** × **MRC per line** × **12 months** = Estimated ACV
- Calculated live on the deal detail page
- Admin sees all deals across all partners

---

## 11. Admin Panel

Located at `/admin` — only accessible to users with `role = "admin"`.

### Pending Approvals
- Each registration request shows: name, email, domain, company, submission date
- **Approve** → Creates account, logs action, partner can sign up
- **Deny** → Request closed, logged to audit

### Invite Partner
Manual email invite form. Sends Supabase invite email. Recipient signs up and is auto-attached to their domain's account.

### Audit Log
Records every admin action:
- Account approvals and denials
- Role changes
- Cross-tenant access
- User deactivations

---

## 12. Settings

### Brand & Company
- Logo upload (feeds co-branded collateral generation)
- Company name (locked — contact channel manager to change)
- Website, phone, email
- Partner profile fields: lines under management, team size, voice platforms, PSA/ticketing, verticals

### Team Members
- Invite by email with role assignment (Rep or Admin)
- Team member list with avatars, role pills, "(you)" indicator
- Key contacts: Billing, Support, Legal (name/email/phone)

### Passkey Authentication (Planned)
WebAuthn passkey support for passwordless sign-in.

---

## 13. AI Assistant

Floating green button bottom-right on every page. Opens a right-side chat drawer:
- Dark header: "TrustedNetworx Assistant"
- Empty state prompt: "How can I help? Ask about the Partner Hub, platform, sales materials, pricing, or TrustedNetworx solutions."
- Disclaimer: "Responses are generated using AI and may contain mistakes."

**Planned:** RAG-powered — trained on documentation, product specs, and sales playbooks.

---

## 14. Data Model

### Core Tables (Supabase Postgres)

```
accounts              — id, domain, company_name, plan, is_active
profiles              — id (FK → auth.users), email, full_name, role, account_id
pending_registrations — email, domain, company_name, status, reviewed_by
blocked_domains       — domain, reason
audit_log             — actor_id, action, target_user_id, details (JSONB)

leads                 — account_id, owner_user_id, name, company_name,
                        status, estimated_value, contact info, notes
contacts              — account_id, owner_user_id, first_name, last_name,
                        email, phone, company_id, status
companies             — account_id, owner_user_id, name, website,
                        industry, size, address
```

### Row-Level Security
Every table carries `account_id` and `owner_user_id`. RLS policies scope queries automatically:
- `WHERE owner_user_id = auth.uid()` for user role
- `WHERE account_id = current_account` for manager role
- No filter for admin role (sees all)

---

## 15. Security & RLS

### Authentication
- Supabase Auth with JWT tokens
- Role and account_id embedded in JWT claims
- Session validated on every request
- Passwords hashed with bcrypt

### Data Isolation
- Row-Level Security on all tables
- Every query filtered at the database level — not hidden in UI
- Out-of-scope IDs return 404 (not 403) to avoid leaking existence
- Service role key never exposed to client

### Audit Trail
- All admin actions logged to `audit_log`
- Actor ID, target user, action type, timestamp, details (JSONB)
- Admin-only read access to audit log

---

## 16. Deployment & Operations

### Source Code
- **Repository:** `github.com/kd6720/TrustedNetworx-Partner-Hub`
- **Branch:** `main` (push-to-deploy)

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://xzivshbiuntjspleimkq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### Deploy
1. Push to `main` → GitHub Actions builds
2. Vercel picks up the build and deploys
3. `npx supabase db push` applies any new migrations

### Local Development
```bash
git clone git@github.com:kd6720/TrustedNetworx-Partner-Hub.git
cd TrustedNetworx-Partner-Hub
npm install
cp .env.example .env.local   # Fill in Supabase keys
npm run dev                   # http://localhost:3000
```

### Migrations
```bash
# Push new migrations to Supabase
npx supabase db push

# Pull remote schema changes
npx supabase db pull
```

---

## 17. FAQ

**Q: Can a partner see another partner's data?**
No. RLS enforces strict tenant isolation. Even if they guess a record ID, the database returns nothing.

**Q: How do I add a new partner?**
Go to `/admin` → "Invite Partner" → enter their work email. They receive an invite and sign up.

**Q: Can someone sign up with a Gmail address?**
No. Free-mail domains (Gmail, Yahoo, Outlook, etc.) are blocked. Business email required.

**Q: What happens when I approve a registration?**
The partner's domain gets an account. They can sign up. Their profile is auto-created with the `user` role. Their data is isolated to their account.

**Q: How do I see all deals across all partners?**
As admin, go to `/opportunities` or `/crm` — you see everything. Agents see only their own.

**Q: Where is the data stored?**
Supabase Postgres (us-east-1). All tables have RLS. Backups managed by Supabase.

**Q: Can I change a user's role?**
Yes. Update the `role` field in the `profiles` table (via Supabase dashboard or API). The change takes effect on next login.

**Q: How do I deactivate a user?**
Set `is_active = false` in their profile. Their session is invalidated. Their data is preserved.

**Q: Is there an API?**
The Supabase REST API is available at `https://xzivshbiuntjspleimkq.supabase.co/rest/v1/`. Use the anon key for client-side (RLS-scoped) or service role key for admin operations.

**Q: Can I white-label this for another brand?**
Yes. The MIX Networks Partner Hub (`kd6720/MIX-Networks-Partner-Hub`) is a separate deployment with the same codebase, rebranded for MIX Networks. Both run on the same architecture.

---

*Generated for TrustedNetworx Partner Hub · July 2026*
