# Trusted Networx Partner Hub — Design Teardown & Claude Code Build Spec

**Source analyzed:** `hub.goodweek.com/partner/*` (Goodweek Partner Hub, logged-in partner view, July 2026)
**Goal:** Recreate the same class of white-label partner/agent portal for **Trusted Networx** — a hub where your telecom agents, MSPs, and VAR partners get sales enablement content, structured onboarding/training, deal registration, and co-branding tools.

---

## 1. What This Product Is

The Goodweek Partner Hub is a **vendor-to-partner enablement portal**. One vendor (Goodweek) recruits channel partners (MSPs), and each partner gets a login to a hub that contains:

1. **Home dashboard** — personalized greeting, quick actions, onboarding progress tracker, recent notifications
2. **Content Library** — folders of sales decks, battle cards, one-pagers with per-item Preview/Share and *view tracking* (prospects viewing shared decks fire notifications and analytics)
3. **Documentation** — an LMS-lite: 6 course-style sections, each with timed lessons, progress %, "Mark as completed," and a "Present" mode
4. **Opportunities** — lightweight deal registration + 7-stage pipeline with ACV math and per-deal engagement analytics
5. **Settings** — Brand & Company (logo upload + company profile for co-branded collateral) and Team Members (invites, roles, key contacts)
6. **AI Assistant** — floating button opening a right-side chat drawer trained on hub docs and content

The strategic mechanics worth copying: the vendor controls the content and training; the partner self-serves; deal registration feeds the vendor's pipeline visibility; shared content is **tracked** (who viewed what, when), which turns collateral into engagement intelligence; and the co-branding settings let the vendor generate partner-branded collateral automatically.

For Trusted Networx the mapping is: **Trusted Networx = the vendor**, your agents/MSPs/VARs = the partners, and the products are POTS replacement, hosted voice/UCaaS, connectivity, wireless failover, and managed telecom.

---

## 2. Tech Stack Observed

| Layer | Observed |
|---|---|
| Framework | **Next.js (App Router)** — `_next/static/chunks/main-app-*.js` |
| UI | React 18+, single compiled CSS file (utility-class/Tailwind-style output) |
| Font | **Inter** via `next/font` (`__Inter_f367f3` with fallback) — all weights 400/500/600/700 |
| Styling system | CSS custom properties for brand tokens (`--brand-primary`, `--brand-secondary`, `--accent`) — this is how they white-label per tenant |
| Charts | Line/area chart on deal detail (Recharts-style SVG rendering) |
| Auth | Email login + **Passkey/WebAuthn** option ("Touch ID, Face ID, or device PIN") |
| Data | UUID entity IDs in URLs (`/partner/deals/2d64416f-...`) → Postgres-style backend (Supabase or similar fits) |

**Recommended build stack for the clone:** Next.js 14+ App Router, Tailwind CSS + shadcn/ui, Supabase (Postgres + Auth + Storage + Row-Level Security for multi-tenant partner isolation), Recharts, deployed on Vercel. This matches the original almost 1:1 and is the stack Claude Code executes fastest.

---

## 3. Design System

### 3.1 Color Tokens (as observed on Goodweek)

| Token | Value | Used for |
|---|---|---|
| `--brand-primary` | `#FF5F39` (orange) | Primary buttons, active links, badges, accents, notification dot |
| `--brand-secondary` | `#C43F1E` (deep orange/rust) | Secondary brand accents |
| `--accent` | `#FF5F39` | Same as primary |
| Sidebar background | `#181916` (near-black warm charcoal) | Fixed left nav |
| Main content background | `#F7F6F4`-range warm off-white | Page canvas |
| Card background | `#FFFFFF` | All content cards |
| Hero gradient | `linear-gradient(to bottom right, #E84E2A, #FF6F4B, #F59E0B)` | Home welcome banner |
| Dark button | `#111` (near-black) | Secondary CTAs ("Create Opportunity", "Save Changes") |
| Text primary | `#181916` | Headings |
| Text muted | gray ~`#6B7280` | Descriptions, table headers, timestamps |

### 3.2 Trusted Networx Token Swap

Your site (`trustednetworx.com`) uses **dark navy `#0A1428`** as its theme color. Direct token mapping:

| Token | Trusted Networx value | Notes |
|---|---|---|
| `--brand-primary` | **Confirm from your logo** — assumption: a bright accent (e.g., cyan/teal `#00B4D8` or electric blue `#2E7CF6`) | This drives every button, link, badge. Pick ONE high-contrast accent. |
| `--brand-secondary` | Darker shade of the accent | Hover states |
| Sidebar background | `#0A1428` (your navy) | Replaces the warm charcoal — instantly reads as your brand |
| Hero gradient | `linear-gradient(to bottom right, #0A1428, #14345C, <accent>)` | Navy-to-accent gradient replaces orange |
| Canvas | Keep the warm off-white or move to cool `#F5F7FA` | Cool gray pairs better with navy |

Everything else (cards, radii, typography scale) stays identical. **The entire rebrand is ~6 CSS variables + logo + product nouns.** That's the point of building it with tokens.

### 3.3 Typography

- **Font:** Inter everywhere (load via `next/font/google`)
- Page titles: 28–32px / 700
- Card section titles: 20px / 600–700
- Hero H1: ~40px / 700, white on gradient
- Body/descriptions: 14–16px / 400, muted gray
- Table headers: 12px / 500, UPPERCASE, letter-spaced, muted
- Buttons: 14px / 500
- Sidebar nav items: 14–15px / 500

### 3.4 Shape, Spacing, Elevation

- Border radius: **8px buttons/inputs, 12–16px cards, full-round avatars/FAB**
- Cards: white, 1px light border (`#E5E7EB`-range), very subtle shadow, generous 24–32px internal padding
- Layout: fixed **256px sidebar**, fluid main column with max-width ~1240px, 24px gutters
- Density: airy — one concept per card, clear section separation

---

## 4. Application Shell

```
┌────────────┬──────────────────────────────────────────────┐
│  SIDEBAR   │ TOP BAR: page title ── [+ Register opp] [🔔2]│
│  (dark,    ├──────────────────────────────────────────────┤
│  256px,    │                                              │
│  fixed)    │   MAIN CONTENT (cards on off-white canvas)   │
│            │                                              │
│  Logo      │                                    [AI FAB]  │
│  ─ Home    │                                              │
│  ─ Content │                                              │
│  ─ Docs    │                                              │
│  ─ Opps    │                                              │
│  ─ Settings│                                              │
│    ├ Brand │                                              │
│    └ Team  │                                              │
│  ────────  │                                              │
│  Avatar +  │                                              │
│  name/role │                                              │
│  Language  │                                              │
│  Sign out  │                                              │
│  Collapse  │                                              │
└────────────┴──────────────────────────────────────────────┘
```

**Sidebar** (dark `#181916` → your `#0A1428`): logo mark + wordmark top; nav items with line icons (home, book, document, briefcase, gear); active item gets a lighter rounded-rectangle background; Settings expands inline to sub-items. Bottom block: circular avatar (brand-color fill, white initial), user name + "Partner" role label, language selector (flag + "English"), Sign out, and a Collapse toggle (collapses to icon-only rail).

**Top bar** (white, sticky): current page title left; **primary CTA "+ Register opportunity"** (brand-color pill, white text) and a bell icon with a red count badge right. The CTA being global — visible on every page — is deliberate: deal registration is the #1 partner action. Keep that.

**Floating AI button:** brand-color circular FAB, bottom-right, sparkle icon. Opens a right-side chat drawer (~380px): dark header "Goodweek AI Assistant" with refresh/close, empty state ("How can I help? Ask me about the Partner Hub, platform, sales materials, pricing…"), input pinned bottom, disclaimer line "Responses are generated using AI and may contain mistakes."

---

## 5. Page-by-Page Breakdown

### 5.1 Home (`/partner/home`)

1. **Hero banner** — brand gradient, rounded ~16px. Contents: small greeting line ("Good evening, Carter Dewey."), big H1 ("Ready to sell Goodweek?"), 2-line subtext summarizing what the hub does, then a horizontal button row: **"Start the track →"** (white solid button — resumes onboarding), plus three translucent white-outline buttons ("Open the app", "Library", "Opportunities"). Partner company name in small text below.
2. **Onboarding Progress card** — "Click any stage to see its checklist," "Stage X of 6" counter at right. A 6-node horizontal stepper (numbered circles + connector line; active = filled dark, done = brand color, future = gray outline) labeled with the six documentation sections. Below it, the expanded stage panel: stage number, title, "In Progress" pill, description, checklist of items with checkboxes (e.g., Your Team, Key Documents, Support Model, Pipeline Goals), "0/4" progress fraction + tiny radial progress indicator. Checklist items map 1:1 to lessons in Documentation.
3. **Recent Notifications card** — list rows: bold event title ("Battle Card: General Objection Handling was viewed"), gray one-line description ("A prospect viewed your '…' deck."), right-aligned date. Content-view tracking events land here.

### 5.2 Content Library (`/partner/library`)

- Page title + full-width search ("Search all content…")
- **Folder table** (skeleton shimmer rows while loading): columns NAME / ITEMS / LAST MODIFIED, folder icon + name + gray description per row, chevron on hover, e.g. "Co-Branded Collateral — Sales decks, one-pagers, and competitive briefs with your branding" and "Pitch & Demo Resources — Demo scripts, elevator pitches, and presentation resources."
- **Folder view:** breadcrumb (brand-color parent link › current), folder title, scoped search right-aligned. Item table: TYPE-badge thumbnail ("Deck" chip), name (600 weight) + optional gray description, type pill, date added, size, and ACTIONS: **"👁 Preview"** (white outline) + **"Share"** (brand-color solid). Share generates a tracked link — views feed notifications and the deal engagement timeline.

### 5.3 Documentation (`/partner/documentation`) — the LMS

Three-column layout inside main area:

- **Left rail:** "Search docs…", DOCUMENTATION label, collapsible section tree — 6 sections (Working with Goodweek / Account & Operations / Product Training / Sales Enablement / Marketing / Client Onboarding), lessons indented beneath; active lesson gets a brand-color left border + bold.
- **Center:** breadcrumb (Documentation / Section / Lesson), lesson H1 + subtitle, **"Present" button** (turns the lesson into slides for screen-sharing), then stacked content cards: "What we cover here" bullet summary; rich sections with headings, callout boxes ("Important"), numbered step lists (Support Tiers), copy-to-clipboard prompt blocks, embedded CTA buttons ("Open Brand & Company Settings"), and a "Related articles" card grid at bottom (3 cards: title, description, "Read more").
- **Right rail (course progress card):** section title, "3 lessons · Approx. 23 min", "Your progress 0%" bar, lesson list with per-lesson durations (5/10/8 min), current lesson highlighted, prev/next arrows + **"✓ Mark as completed."**

Lesson completion drives both the progress bar here and the Home page onboarding stepper.

### 5.4 Opportunities (`/partner/deals`)

- **Pipeline list:** "Opportunity Pipeline" title; dark "＋ Create Opportunity" button; search by prospect name; "All Stages" filter dropdown. Table: PROSPECT / STAGE (gray pill, e.g. "1. Qualification") / CLOSE DATE / LICENSES / EST. ACV / ACTIONS ("View" link in brand color).
- **7 stages:** 1. Qualification → 2. Vetting → 3. Trial → 4. Contracting → 5. Closed Won → 6. Won Not Activated → 7. Activated. (For Trusted Networx: rename to fit telecom, e.g. 1. Qualification → 2. Site Survey/Discovery → 3. Proposal → 4. Contracting → 5. Closed Won → 6. Awaiting Install → 7. Activated/Billing.)
- **Deal detail (`/partner/deals/{uuid}`):**
  - "← Back to Opportunities", prospect name H1, current-stage pill top-right
  - **Stage stepper card:** all 7 stages as pills with chevrons, active = brand color; "Created / Last advanced" dates; **"Advance to [next stage]"** brand-color button
  - **Opportunity Details card (left):** Create Date (read-only), Close Date picker, License Count, License Price inputs, and a computed **Estimated ACV panel** — "$2,100.00 — 5 licenses × $35.00 × 12 months" — recalculating live; dark "Save Changes" button. (For telecom: rename Licenses → Lines/Sites/Seats and make the ACV formula per-product: lines × MRC × 12.)
  - **Account Information card (right):** Company Name, Seats, Owner, Created By
  - **Associated Decks card:** "Create Deck" action; empty state text
  - **Engagement Timeline card:** "1 content item tracked"; Day/Week/Month toggle; 4 stat tiles (Total Views — brand-tinted, Unique Viewers — blue-tinted, Most Viewed item — green-tinted, Last Viewed · Trend — gray); an area/line chart of views over time with dashed "Today" marker; legend with per-content-item series. This is the payoff of tracked share links, scoped to the deal.
- **Register opportunity modal** (global CTA): title + close ✕; tabs **"Quick add" / "Bulk import"**; fields: Company name* (required, brand-color focus ring), Stage dropdown (defaults 1. Qualification), Seats/licenses, Vertical/industry, Contact name, Contact email, Notes ("Optional context for your Goodweek rep"); footer: Cancel (light) / "Register opportunity" (disabled until valid).

### 5.5 Settings — Brand & Company (`/partner/settings/brand-kit`)

- Tabs: **Brand & Company** | Team Members
- **Company Brand card:** dashed drag-and-drop logo upload zone ("PNG, JPG, or SVG up to 5MB") — the logo feeds co-branded collateral; Company Name (locked — "Contact your rep to change"); Company Website / Phone / Email; "Primary Contact for Co-Branded Materials" (team-member dropdown); partner-profile qualifiers: Seats Under Management, MSP Team Size, PSA, RMM, Other Critical Tools (for Trusted Networx swap to: Lines Under Management, Agent Team Size, Current Voice Platform, Monitoring/Ticketing Tools, Verticals Served); dark "Save Company Info" button.
- **Passkey Authentication card:** description + "Set up Passkey" dark button.

### 5.6 Settings — Team Members (`/partner/settings/users`)

- **Invite User card:** email input + Role dropdown (**Rep / Admin**) + "Invite User" button
- **Team Members card:** rows with initial-avatar, name + "(you)" + role pill (Admin blue-tinted, Rep gray), email, "Edit Profile" / "Remove" actions
- **Key Contacts card:** three columns — BILLING / SUPPORT / LEGAL contact, each Name/Email/Phone, "Save Contacts." (These route invoices and support escalations — keep this; it maps perfectly to your MSP/agent support model.)

---

## 6. Data Model (build this in Postgres/Supabase)

```
organizations        (vendor tenant — Trusted Networx)
partners             id, org_id, company_name, logo_url, website, phone, email,
                     primary_contact_id, lines_under_mgmt, team_size, tools jsonb
users                id, partner_id, name, email, role enum(admin, rep), avatar
key_contacts         partner_id, type enum(billing, support, legal), name, email, phone
content_folders      id, name, description, sort
content_items        id, folder_id, title, description, type enum(deck, doc, video),
                     file_url, created_at
share_links          id, content_item_id, partner_id, user_id, deal_id nullable, token
content_views        id, share_link_id, viewer_fingerprint, viewed_at   ← powers analytics
doc_sections         id, title, sort                      (6 rows)
doc_lessons          id, section_id, title, subtitle, body (rich/MDX), duration_min, sort
lesson_progress      user_id, lesson_id, completed_at     ← powers stepper + progress bars
deals                id, partner_id, company_name, stage enum(7), vertical,
                     contact_name, contact_email, notes, seats int,
                     unit_price numeric, close_date, owner_id, created_by,
                     created_at, last_advanced_at
deal_stage_history   deal_id, from_stage, to_stage, changed_at
notifications        id, partner_id, user_id, type, title, body, read, created_at
```

Derived values: `est_acv = seats × unit_price × 12` (compute client-side live + persist). Deal engagement = `content_views` joined through `share_links.deal_id`.

**Row-Level Security:** every partner-scoped table filtered by `partner_id` from the JWT. This is what makes it safely multi-partner.

---

## 7. Feature Priorities for the Clone

**Phase 1 — core shell + enablement (ship first):**
sidebar/topbar shell, auth (email + magic link; passkeys later), Home with hero + onboarding stepper + notifications, Content Library (folders, items, preview, share), Settings (brand + team + invites).

**Phase 2 — pipeline:**
deal registration modal, pipeline table + filters, deal detail with stage stepper, ACV math, stage history.

**Phase 3 — the differentiators:**
tracked share links + view events → notifications + engagement timeline chart; Documentation LMS with progress; co-branded collateral generation (stamp partner logo onto templated decks/one-pagers).

**Phase 4 — AI assistant:**
chat drawer backed by RAG over doc_lessons + content_items (Claude API), same disclaimer line.

Phase 3 is where the original earns its keep — don't cut view tracking. It's the loop that tells you (and your agent) that a prospect opened the POTS-replacement one-pager three times yesterday.

---

## 8. Copy Deck — Goodweek → Trusted Networx Rebrand Map

| Original | Trusted Networx version |
|---|---|
| "Ready to sell Goodweek?" | "Ready to sell Trusted Networx?" |
| "Everything you need to pitch, handle objections, run a demo, and close." | Keep verbatim — it's good copy |
| Partner persona: MSP | Agent / MSP / VAR |
| "Working with Goodweek" (section 1) | "Working with Trusted Networx" |
| Product Training: "Goodweek platform, Spaces, AI features" | "POTS replacement, hosted voice, failover, portal & provisioning" |
| Battle cards: vs. Copilot/Gemini/Jarvis | vs. incumbent LECs, DIY cellular routers, competing POTS-replacement vendors, hosted-voice competitors |
| Licenses / Seats | Lines / Sites / Seats (per product) |
| "License Price" | "MRC per line" |
| MSP Profile Setup (PSA/RMM fields) | Agent Profile Setup (current voice platform, monitoring/ticketing, verticals) |
| Support tiers: MSP = L1, Goodweek = L2 | Agent/MSP = L1, Trusted Networx NOC = L2 — identical model, keep it |
| "Goodweek AI Assistant" | "Networx Assistant" (or similar) |

---

## 9. Claude Code Build Prompt (paste this to start the build)

> Build a white-label partner enablement portal for Trusted Networx (managed telecom: POTS replacement, hosted voice, connectivity, wireless failover) using Next.js 14 App Router, Tailwind, shadcn/ui, and Supabase (Postgres + Auth + Storage, RLS multi-tenant by partner_id).
>
> **Shell:** fixed 256px dark-navy (#0A1428) sidebar — logo, nav (Home, Content Library, Documentation, Opportunities, Settings→{Brand & Company, Team Members}), bottom user block (avatar, name, role, language, sign out, collapse). White sticky top bar with page title, global "+ Register opportunity" accent-color pill button, notification bell with unread badge. Floating accent-color AI-assistant FAB bottom-right opening a right chat drawer. Inter font, off-white canvas, white cards with 12–16px radius, 1px light borders, subtle shadows. Brand via CSS variables: --brand-primary, --brand-secondary, sidebar bg, hero gradient (navy → accent).
>
> **Pages:** (1) Home — gradient hero with greeting + H1 "Ready to sell Trusted Networx?" + CTA row; 6-stage onboarding stepper card with expandable per-stage checklists tied to documentation lessons; recent-notifications card. (2) Content Library — folder table → item table with type badges, Preview and tracked Share links; skeleton loading rows. (3) Documentation — LMS with left section/lesson tree, center rich lesson content (callouts, step lists, copy blocks, related-article cards, Present button), right progress card (durations, % bar, Mark as completed, prev/next). (4) Opportunities — pipeline table (search, stage filter) with 7 stages (Qualification, Site Survey, Proposal, Contracting, Closed Won, Awaiting Install, Activated); deal detail with stage-stepper + advance button, editable details card computing Est. ACV = lines × MRC × 12 live, account info card, associated decks card, engagement timeline card (stat tiles + views-over-time area chart from tracked share-link views, Day/Week/Month toggle). Register-opportunity modal (Quick add / Bulk import tabs; company*, stage, lines, vertical, contact, notes). (5) Settings — Brand & Company (logo dropzone, company info, primary contact select, agent-profile fields) and Team Members (invite with Rep/Admin roles, member list with role pills, Billing/Support/Legal key contacts grid, passkey setup card).
>
> **Data model + RLS** per the schema in this spec. Seed with demo content (3 folders, 8 items, 6 doc sections with 3 lessons each, 2 deals). Content share links get public tokenized viewer pages that log view events → notifications + deal engagement chart.

---

## 10. Assumptions & Open Items

1. **Brand accent color** — your site theme is navy #0A1428; the spec assumes you'll pick one bright accent from your logo for buttons/links. Swap it into `--brand-primary` and everything follows.
2. **Company name** — I used "Trusted Networx" (matching trustednetworx.com and your hub profile). If the new entity is "Trusted Networks," it's a copy-deck find/replace.
3. **Pipeline stage names** — I proposed telecom-flavored stages; confirm against how you actually run deals (especially whether "Trial" has an equivalent — e.g., pilot site).
4. **Deal economics** — original models seats × license price × 12. Telecom needs per-product line items eventually (lines, MRC, NRC, term). Phase 2 can ship with the simple model; don't over-engineer v1.
5. **Co-branded collateral generation** was promised in Goodweek's UI but partially stubbed ("fields will be saved once database columns are added" was visible in their own settings page — they shipped before finishing it). Treat it as Phase 3, not launch-blocking.
