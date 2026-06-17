import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { serviceClient } from '../lib/serviceClient.js'

const router = Router()

// Haiku pricing (approximate, per token)
const HAIKU_INPUT_COST  = 0.80  / 1_000_000
const HAIKU_OUTPUT_COST = 4.00  / 1_000_000

router.use(requireAuth)

// ── /admin/me — returns admin status for the calling user (no admin required) ─

router.get('/me', async (req, res) => {
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('is_admin')
    .eq('id', req.user.id)
    .maybeSingle()
  res.json({ is_admin: !!profile?.is_admin })
})

// All routes below require admin role
router.use(requireAdmin)

// ── Stats ─────────────────────────────────────────────────────────────────────

router.get('/stats', async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]

  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: totalEntries },
    { count: personalTags },
    { count: sharedTags },
    { data: aiRows },
    { data: recentEntries },
  ] = await Promise.all([
    serviceClient.from('profiles').select('*', { count: 'exact', head: true }),
    serviceClient.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
    serviceClient.from('entries').select('*', { count: 'exact', head: true }),
    serviceClient.from('tags').select('*', { count: 'exact', head: true }),
    serviceClient.from('shared_tags').select('*', { count: 'exact', head: true }),
    serviceClient.from('ai_summaries').select('input_tokens, output_tokens'),
    serviceClient.from('entries').select('date').gte('date', thirtyDaysAgo).order('date'),
  ])

  const aiCalls = aiRows?.length ?? 0
  const inputTokens  = aiRows?.reduce((s, r) => s + (r.input_tokens  ?? 0), 0) ?? 0
  const outputTokens = aiRows?.reduce((s, r) => s + (r.output_tokens ?? 0), 0) ?? 0
  const estimatedCostUsd = inputTokens * HAIKU_INPUT_COST + outputTokens * HAIKU_OUTPUT_COST

  // Group entries by date for the last 30 days
  const byDate = {}
  recentEntries?.forEach(e => { byDate[e.date] = (byDate[e.date] ?? 0) + 1 })
  const entriesPerDay = Object.entries(byDate).map(([date, count]) => ({ date, count }))

  res.json({
    users: {
      total: totalUsers ?? 0,
      active: activeUsers ?? 0,
      deactivated: (totalUsers ?? 0) - (activeUsers ?? 0),
    },
    entries: {
      total: totalEntries ?? 0,
      per_day: entriesPerDay,
    },
    tags: {
      personal: personalTags ?? 0,
      shared: sharedTags ?? 0,
    },
    ai: {
      calls: aiCalls,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      estimated_cost_usd: Math.round(estimatedCostUsd * 10000) / 10000,
    },
  })
})

// ── Users ─────────────────────────────────────────────────────────────────────

router.get('/users', async (req, res) => {
  const { search } = req.query
  let query = serviceClient.from('profiles').select('*').order('created_at', { ascending: false })
  if (search) query = query.ilike('email', `%${search}%`)

  const { data: profiles, error } = await query
  if (error) return res.status(500).json({ error: error.message })

  const users = await Promise.all(profiles.map(async profile => {
    const [{ count: entryCount }, { count: tagCount }] = await Promise.all([
      serviceClient.from('entries').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
      serviceClient.from('tags').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    ])
    return { ...profile, entry_count: entryCount ?? 0, tag_count: tagCount ?? 0 }
  }))

  res.json(users)
})

router.put('/users/:id/status', async (req, res) => {
  const { is_active } = req.body
  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active (boolean) is required' })
  }

  const { error } = await serviceClient
    .from('profiles')
    .update({ is_active })
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })

  await serviceClient.from('audit_log').insert({
    user_id: req.user.id,
    action: is_active ? 'user_reactivated' : 'user_deactivated',
    metadata: { target_user_id: req.params.id },
  })

  res.json({ ok: true })
})

// ── Audit log ─────────────────────────────────────────────────────────────────

router.get('/audit-log', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500)
  const { data, error } = await serviceClient
    .from('audit_log')
    .select('id, user_id, action, metadata, created_at, profiles(email)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// ── Orphaned tags ─────────────────────────────────────────────────────────────

router.get('/tags/orphaned', async (req, res) => {
  const [{ data: personalOrphans }, { data: sharedOrphans }] = await Promise.all([
    serviceClient.rpc('get_orphaned_personal_tags'),
    serviceClient.rpc('get_orphaned_shared_tags'),
  ])

  res.json({
    personal: personalOrphans ?? [],
    shared: sharedOrphans ?? [],
  })
})

router.delete('/tags/orphaned', async (req, res) => {
  const { personal_tag_ids = [], shared_tag_ids = [] } = req.body

  let deletedPersonal = 0
  let deletedShared = 0

  if (personal_tag_ids.length > 0) {
    const { error, count } = await serviceClient
      .from('tags')
      .delete({ count: 'exact' })
      .in('id', personal_tag_ids)
    if (error) return res.status(500).json({ error: error.message })
    deletedPersonal = count ?? 0
  }

  if (shared_tag_ids.length > 0) {
    const { error, count } = await serviceClient
      .from('shared_tags')
      .delete({ count: 'exact' })
      .in('id', shared_tag_ids)
    if (error) return res.status(500).json({ error: error.message })
    deletedShared = count ?? 0
  }

  await serviceClient.from('audit_log').insert({
    user_id: req.user.id,
    action: 'orphaned_tags_deleted',
    metadata: { personal_count: deletedPersonal, shared_count: deletedShared },
  })

  res.json({ deleted_personal: deletedPersonal, deleted_shared: deletedShared })
})

// ── Data export (JSON → client generates CSV) ─────────────────────────────────

router.get('/export', async (req, res) => {
  const { data: profiles } = await serviceClient
    .from('profiles')
    .select('id, email, is_admin, is_active, last_active_at, created_at')
    .order('created_at', { ascending: false })

  const rows = await Promise.all((profiles ?? []).map(async profile => {
    const [{ count: entryCount }, { count: tagCount }] = await Promise.all([
      serviceClient.from('entries').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
      serviceClient.from('tags').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    ])
    return {
      user_id: profile.id,
      email: profile.email ?? '',
      is_admin: profile.is_admin,
      is_active: profile.is_active,
      entry_count: entryCount ?? 0,
      tag_count: tagCount ?? 0,
      last_active_at: profile.last_active_at ?? '',
      created_at: profile.created_at,
    }
  }))

  res.json(rows)
})

// ── System message management ─────────────────────────────────────────────────

router.get('/system-message', async (req, res) => {
  const { data, error } = await serviceClient
    .from('system_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data ?? null)
})

router.post('/system-message', async (req, res) => {
  const { message } = req.body
  if (!message?.trim()) return res.status(400).json({ error: 'message is required' })

  // Deactivate all existing messages then insert new one
  await serviceClient.from('system_messages').update({ is_active: false }).eq('is_active', true)

  const { data, error } = await serviceClient
    .from('system_messages')
    .insert({ message: message.trim(), created_by: req.user.id, is_active: true })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  await serviceClient.from('audit_log').insert({
    user_id: req.user.id,
    action: 'system_message_published',
    metadata: { message_id: data.id },
  })

  res.status(201).json(data)
})

router.delete('/system-message', async (req, res) => {
  await serviceClient.from('system_messages').update({ is_active: false }).eq('is_active', true)

  await serviceClient.from('audit_log').insert({
    user_id: req.user.id,
    action: 'system_message_cleared',
  })

  res.status(204).end()
})

export { router as adminRouter }
