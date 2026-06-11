# TaskJournal

A personal work logging tool for small teams. Log tasks, tag them, run date-range reports, export to CSV or PDF, and generate AI-powered summaries with Claude.

## Features

- **Work entries** — log tasks with date, time spent, notes, and tags
- **Tag filtering** — filter entries by tags with include (AND) and exclude (NOT) modes
- **Reports** — date-range reports with tag filters, totals, CSV and PDF export
- **AI summaries** — Claude-powered narrative summary of any report period (cached per unique result set)
- **Auth** — email/password sign-up, Google OAuth, and Microsoft OAuth
- **Inline tag creation** — create tags from within the entry form without losing unsaved work
- **Mobile-ready** — responsive layout with hamburger nav, skeleton loaders, and toast notifications

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express (ES modules) |
| Database / Auth | Supabase (PostgreSQL + Supabase Auth) |
| AI | Anthropic Claude (`claude-haiku-4-5`) |
| Export | jsPDF (lazy-loaded), client-side CSV |

## Project Structure

```
app/
├── frontend/          React + Vite + Tailwind CSS
├── backend/           Node.js + Express REST API
└── supabase/
    └── migrations/    SQL schema (run in Supabase SQL editor)
```

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

## Setup

### 1. Install dependencies

```sh
cd app/frontend && npm install
cd ../backend && npm install
```

### 2. Configure environment variables

```sh
# Frontend
cp app/frontend/.env.example app/frontend/.env

# Backend
cp app/backend/.env.example app/backend/.env
```

Fill in your Supabase project URL and anon key in both files. Find these in the Supabase dashboard under **Project Settings → API**.

To enable AI summaries, add your Anthropic API key to `backend/.env`. The AI panel is silently disabled if the key is absent.

### 3. Run the database migrations

Open the Supabase dashboard → **SQL Editor** and run both migration files in order:

1. `supabase/migrations/001_initial_schema.sql` — creates all tables with Row Level Security
2. `supabase/migrations/002_grants.sql` — grants table privileges to the `authenticated` role (required for RLS to work correctly)

### 4. Configure OAuth providers (optional)

In the Supabase dashboard → **Authentication → Providers**:

**Google**
1. Enable the Google provider.
2. Add your OAuth client ID and secret from [Google Cloud Console](https://console.cloud.google.com).
3. Set the authorized redirect URI to: `https://<project-ref>.supabase.co/auth/v1/callback`

**Microsoft (Azure)**
1. Enable the Azure provider.
2. Register an app in [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations.
3. Add your client ID and secret.
4. Set the redirect URI to: `https://<project-ref>.supabase.co/auth/v1/callback`

### 5. Start development servers

```sh
# Terminal 1 — frontend (http://localhost:5173)
cd app/frontend && npm run dev

# Terminal 2 — backend (http://localhost:4000)
cd app/backend && npm run dev
```

For deployment instructions see **DEPLOYMENT.md**.

## App Routes

| Route | Description |
|---|---|
| `/login` | Email/password + OAuth sign-in |
| `/signup` | New account registration |
| `/auth/callback` | OAuth redirect handler |
| `/dashboard` | Entry list with include/exclude tag filter |
| `/entries/new` | Create a new work entry |
| `/entries/:id/edit` | Edit an existing entry |
| `/tags` | Manage personal tags |
| `/reports` | Date-range reports with export and AI summary |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check — returns `{ ok: true }` |
| GET | `/entries` | All entries for the current user (newest first) |
| POST | `/entries` | Create an entry |
| GET | `/entries/:id` | Single entry with tags |
| PUT | `/entries/:id` | Update an entry |
| DELETE | `/entries/:id` | Delete an entry |
| GET | `/tags` | All tags for the current user (alphabetical) |
| POST | `/tags` | Create a tag |
| DELETE | `/tags/:id` | Delete a tag |
| GET | `/reports` | Filtered entries: `?start=&end=[&tag_ids=][&exclude_tag_ids=]` |
| POST | `/ai/summary` | Generate (or return cached) AI summary for a set of entries |

All endpoints except `/health` require a valid Supabase JWT in the `Authorization: Bearer <token>` header.

## Environment Variables

### `backend/.env`

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase publishable anon key |
| `PORT` | Port for the Express server (default `4000`) |
| `FRONTEND_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `ANTHROPIC_API_KEY` | Anthropic API key — leave blank to disable AI summaries |

### `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable anon key |
| `VITE_API_URL` | Backend base URL (e.g. `http://localhost:4000`) |
