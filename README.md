# תקציב החתונה — Wedding Budget Planner

Private wedding expense tracker for two Google accounts. React + Vite + Tailwind + Supabase.

## Setup

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql).
3. In that SQL file, replace `partner1@gmail.com` and `partner2@gmail.com` with your two Google emails.
4. Also update the same emails in [`src/config/allowedUsers.ts`](src/config/allowedUsers.ts).

### 3. Enable Google Auth

1. In Supabase: **Authentication → Providers → Google** — enable it.
2. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/).
3. Add the Supabase callback URL shown in the provider settings.
4. Under **Authentication → URL Configuration**, set your site URL (e.g. `http://localhost:5173`) and redirect URLs.

### 4. Environment variables

```bash
cp .env.example .env
```

Fill in:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run locally

```bash
npm run dev
```

## Features

- Google sign-in (only the two allowlisted emails)
- Summary: estimated, agreed, paid, remaining (₪)
- Expenses table: add / edit / archive, search, filter, sort, totals
- Soft archive via `archived_at`

## Notes

- No separate backend — the browser talks to Supabase directly.
- Access is enforced with RLS (`is_allowed_user()`).
- Both users share the same `expenses` table with equal permissions.
