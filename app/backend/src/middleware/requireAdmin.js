import { serviceClient } from '../lib/serviceClient.js'

export async function requireAdmin(req, res, next) {
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('is_admin')
    .eq('id', req.user.id)
    .maybeSingle()

  if (!profile?.is_admin) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}
