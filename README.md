# TrustedNetworx Partner Hub

White-label partner enablement portal for TrustedNetworx — managed telecom solutions (POTS replacement, hosted voice/UCaaS, connectivity, wireless failover).

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **TypeScript**
- **Supabase** (Postgres + Auth + Storage + RLS)
- **Recharts** (engagement charts)
- **lucide-react** (icons)

## Getting Started

```bash
npm install
cp .env.example .env.local
# Fill in your Supabase project URL and anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Setup

Run the SQL in `supabase/migrations/001_schema.sql` in your Supabase SQL editor to create the schema with Row-Level Security.

## Project Structure

```
src/
  app/
    (dashboard)/
      layout.tsx        # Shell: sidebar + topbar + AI FAB
      page.tsx          # Home: hero, onboarding stepper, notifications
      library/          # Content Library: folders, items, preview, share
      documentation/    # LMS: section tree, lessons, progress
      opportunities/    # Pipeline, deal detail, ACV math
        [id]/           # Individual deal view
      settings/
        brand-kit/      # Brand & Company
        users/          # Team Members
  components/
    sidebar.tsx         # Dark navy fixed sidebar
    topbar.tsx          # Sticky top bar with CTA
```

## Brand Tokens

Edit `src/app/globals.css` to change brand colors:

```css
--color-brand-primary: #00B4D8;   /* Cyan accent */
--color-sidebar: #0A1428;         /* TrustedNetworx navy */
```

## Deployment

```bash
npm run build
# Deploy dist to Vercel or Netlify
```

## License

Proprietary — TrustedNetworx Inc.
