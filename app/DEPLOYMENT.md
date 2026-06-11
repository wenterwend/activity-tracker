# TaskJournal Deployment Configuration Guide

## Overview

This document covers all configuration steps required to deploy TaskJournal across the following services:
- **Supabase** — database, auth, row-level security
- **Google OAuth** — social login
- **Microsoft OAuth** — social login
- **Render** — backend API hosting
- **Vercel** — frontend hosting

---

## 1. Supabase

### 1.1 Project Setup
1. Create a project at [supabase.com](https://supabase.com)
2. Note your **Project URL** (`https://<string>.supabase.co`) and **publishable API key** from **Project Settings → API Keys**

### 1.2 Security Settings
Navigate to your project settings and apply the following:

| Setting | Value |
|---|---|
| Enable Data API | ✅ On |
| Automatically expose new tables | ❌ Off |
| Enable automatic RLS | ✅ On |

### 1.3 Database Table Permissions
Run the following in **SQL Editor**:

```sql
-- Grant access to all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON entries TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tags TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON entry_tags TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_summaries TO anon, authenticated;

-- RLS: entries
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own entries" ON entries
  FOR ALL USING (auth.uid() = user_id);

-- RLS: tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own tags" ON tags
  FOR ALL USING (auth.uid() = user_id);

-- RLS: entry_tags
ALTER TABLE entry_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own entry_tags" ON entry_tags
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM entries WHERE id = entry_tags.entry_id)
  );

-- RLS: ai_summaries
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own summaries" ON ai_summaries
  FOR ALL USING (auth.uid() = user_id);
```

### 1.4 Auth Redirect URLs
Navigate to **Authentication → Settings** and configure:

| Setting | Value |
|---|---|
| Site URL | `https://your-vercel-app.vercel.app` |
| Redirect URLs | `https://your-vercel-app.vercel.app` |
| Redirect URLs | `https://your-vercel-app.vercel.app/**` |

---

## 2. Google OAuth

### 2.1 Google Cloud Console Setup
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services → OAuth consent screen**
4. Set **User Type** to **External**
5. Fill in app name, support email, and developer contact
6. Add test users while in development

### 2.2 Create OAuth Credentials
1. Navigate to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth Client ID**
3. Select **Web application**
4. Add the following:

**Authorized JavaScript Origins:**
```
https://your-vercel-app.vercel.app
http://localhost:5173
```

**Authorized Redirect URIs:**
```
https://<string>.supabase.co/auth/v1/callback
```

5. Copy the **Client ID** and **Client Secret**

### 2.3 Configure in Supabase
1. Navigate to **Authentication → Sign in / Providers → Google**
2. Toggle Google **on**
3. Paste the **Client ID** and **Client Secret**
4. Save

---

## 3. Microsoft OAuth

### 3.1 Azure App Registration
1. Go to [portal.azure.com](https://portal.azure.com)
2. Navigate to **Azure Active Directory → App registrations → New registration**
3. Set **Supported account types** to **Accounts in any organizational directory and personal Microsoft accounts**
4. Add Redirect URI:
```
https://<string>.supabase.co/auth/v1/callback
```
5. Copy the **Application (client) ID**

### 3.2 Create Client Secret
1. Navigate to **Certificates & secrets → New client secret**
2. Copy the secret value immediately (it won't be shown again)

### 3.3 Configure in Supabase
1. Navigate to **Authentication → Sign in / Providers → Azure**
2. Toggle Azure **on**
3. Paste the **Client ID** and **Client Secret**
4. Save

---

## 4. Render (Backend)

### 4.1 Initial Setup
1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **New → Web Service**
3. Import your GitHub repo
4. Configure:

| Setting | Value |
|---|---|
| Root Directory | `app/backend` |
| Build Command | `npm install` |
| Start Command | `node src/index.js` |

### 4.2 Environment Variables
Add the following under **Environment**:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://<string>.supabase.co` |
| `SUPABASE_ANON_KEY` | your publishable key |
| `FRONTEND_URL` | `https://your-vercel-app.vercel.app` |
| `NODE_ENV` | `production` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` (required for AI summary feature) |

### 4.3 Free Tier Note
Render free tier spins down after 15 minutes of inactivity. First request after idle takes ~30 seconds. To prevent this either:
- Upgrade to Render paid tier ($7/mo), or
- Use [UptimeRobot](https://uptimerobot.com) (free) to ping your backend URL every 10 minutes

---

## 5. Vercel (Frontend)

### 5.1 Initial Setup
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New → Project**
3. Import your GitHub repo
4. Set **Root Directory** to `app/frontend`

### 5.2 Environment Variables
Add the following under **Settings → Environment Variables**.  
Ensure **Production** is checked for each variable:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://<string>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | your publishable key |
| `VITE_API_URL` | `https://your-render-service.onrender.com` |

### 5.3 Routing Configuration
Ensure `vercel.json` exists in `app/frontend` with the following content to support client-side routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 5.4 Redeployment
After any environment variable changes, trigger a clean redeploy:
1. Go to **Deployments**
2. Click three dots on the latest deployment
3. Select **Redeploy**
4. Disable **Use existing build cache**

---

## 6. Ongoing Deployments

Every `git push` to your main branch automatically redeploys both Vercel and Render. No manual steps required after initial setup.

---

## 7. Troubleshooting Quick Reference

| Symptom | Likely Cause | Fix |
|---|---|---|
| Blank page / `supabaseUrl is required` | Env vars not set or wrong environment checked | Verify Vercel env vars are set for Production, clean redeploy |
| `Cannot GET /` on Render URL | Normal — no root route defined | Backend is working fine |
| Google OAuth 404 | Missing `vercel.json` rewrite rule | Add `vercel.json` to `app/frontend` |
| Google OAuth 403 `org_internal` | OAuth consent set to Internal | Change to External in Google Cloud Console |
| `Failed to fetch` on tags/entries | CORS misconfigured | Add `FRONTEND_URL` to Render env vars |
| AI summary 503 | Missing Anthropic API key | Add `ANTHROPIC_API_KEY` to Render env vars |
