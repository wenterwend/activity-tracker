import { createClient } from '@supabase/supabase-js'
import { serviceClient } from '../lib/serviceClient.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

// Session is considered "new" if last_active was null or more than 30 min ago
function isNewSession(lastActiveAt) {
  if (!lastActiveAt) return true
  return Date.now() - new Date(lastActiveAt).getTime() > 30 * 60 * 1000
}

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Invalid token' })

  // Check is_active and get last_active_at in one query
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('is_active, last_active_at')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.is_active === false) {
    return res.status(401).json({ error: 'Account deactivated' })
  }

  req.user = user
  req.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  })

  // Fire-and-forget: upsert profile (handles first-time users) + optional audit log
  const wasNewSession = isNewSession(profile?.last_active_at)
  serviceClient
    .from('profiles')
    .upsert({ id: user.id, email: user.email, last_active_at: new Date().toISOString() }, { onConflict: 'id' })
    .then(() => {
      if (wasNewSession) {
        serviceClient.from('audit_log').insert({ user_id: user.id, action: 'user_login' })
      }
    })
    .catch(err => console.error('[Auth] Profile upsert failed:', err.message))

  next()
}
