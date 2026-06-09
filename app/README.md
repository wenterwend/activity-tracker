# TaskJournal

A personal work logging tool for small teams. Log tasks, tag them, run reports, and optionally generate AI-powered summaries.

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
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configure environment variables

```sh
# Frontend
cp frontend/.env.example frontend/.env

# Backend
cp backend/.env.example backend/.env
```

Fill in your Supabase project URL and anon key in both files. Find these in your Supabase dashboard under **Project Settings → API**.

### 3. Run the database migration

Open the Supabase dashboard → **SQL Editor**, paste the contents of `supabase/migrations/001_initial_schema.sql`, and run it. This creates all four tables with Row Level Security enabled.

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
cd frontend && npm run dev

# Terminal 2 — backend (http://localhost:4000)
cd backend && npm run dev
```

## Available routes

| Route | Description |
|---|---|
| `/login` | Email/password + OAuth login |
| `/signup` | New account registration |
| `/auth/callback` | OAuth redirect handler |
| `/dashboard` | Entry list (protected) |

## API endpoints (Sprint 1)

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check — returns `{ ok: true }` |
