import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

const ENTRY_SELECT = `
  *,
  entry_tags (
    tag_id,
    tags ( id, name )
  ),
  entry_shared_tags (
    shared_tag_id,
    shared_tags ( id, name )
  )
`

function normalizeEntry({ entry_tags, entry_shared_tags, ...entry }) {
  const personal = entry_tags.map(et => ({ ...et.tags, type: 'personal' }))
  const shared = (entry_shared_tags || []).map(est => ({ ...est.shared_tags, type: 'shared' }))
  return { ...entry, tags: [...personal, ...shared] }
}

router.get('/', async (req, res) => {
  const { data, error } = await req.supabase
    .from('entries')
    .select(ENTRY_SELECT)
    .eq('user_id', req.user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data.map(normalizeEntry))
})

router.get('/:id', async (req, res) => {
  const { data, error } = await req.supabase
    .from('entries')
    .select(ENTRY_SELECT)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle()

  if (error) return res.status(500).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'Not found' })
  res.json(normalizeEntry(data))
})

router.post('/', async (req, res) => {
  const { task_name, date, time_spent_minutes, notes, tag_ids = [], shared_tag_ids = [] } = req.body

  if (!task_name?.trim()) return res.status(400).json({ error: 'task_name is required' })
  if (!date) return res.status(400).json({ error: 'date is required' })
  if (!time_spent_minutes || Number(time_spent_minutes) <= 0) {
    return res.status(400).json({ error: 'time_spent_minutes must be a positive number' })
  }

  const { data: entry, error } = await req.supabase
    .from('entries')
    .insert({
      user_id: req.user.id,
      task_name: task_name.trim(),
      date,
      time_spent_minutes: Number(time_spent_minutes),
      notes: notes?.trim() || null,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  if (tag_ids.length > 0) {
    const { error: tagError } = await req.supabase
      .from('entry_tags')
      .insert(tag_ids.map(tag_id => ({ entry_id: entry.id, tag_id })))
    if (tagError) return res.status(500).json({ error: tagError.message })
  }

  if (shared_tag_ids.length > 0) {
    const { error: sharedTagError } = await req.supabase
      .from('entry_shared_tags')
      .insert(shared_tag_ids.map(shared_tag_id => ({ entry_id: entry.id, shared_tag_id })))
    if (sharedTagError) return res.status(500).json({ error: sharedTagError.message })
  }

  res.status(201).json({ ...entry, tags: [] })
})

router.put('/:id', async (req, res) => {
  const { task_name, date, time_spent_minutes, notes, tag_ids = [], shared_tag_ids = [] } = req.body

  if (!task_name?.trim()) return res.status(400).json({ error: 'task_name is required' })
  if (!date) return res.status(400).json({ error: 'date is required' })
  if (!time_spent_minutes || Number(time_spent_minutes) <= 0) {
    return res.status(400).json({ error: 'time_spent_minutes must be a positive number' })
  }

  const { data: entry, error } = await req.supabase
    .from('entries')
    .update({
      task_name: task_name.trim(),
      date,
      time_spent_minutes: Number(time_spent_minutes),
      notes: notes?.trim() || null,
    })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  if (!entry) return res.status(404).json({ error: 'Not found' })

  // Replace all tags atomically
  await req.supabase.from('entry_tags').delete().eq('entry_id', req.params.id)
  await req.supabase.from('entry_shared_tags').delete().eq('entry_id', req.params.id)

  if (tag_ids.length > 0) {
    await req.supabase
      .from('entry_tags')
      .insert(tag_ids.map(tag_id => ({ entry_id: req.params.id, tag_id })))
  }

  if (shared_tag_ids.length > 0) {
    await req.supabase
      .from('entry_shared_tags')
      .insert(shared_tag_ids.map(shared_tag_id => ({ entry_id: req.params.id, shared_tag_id })))
  }

  res.json({ ...entry, tags: [] })
})

router.delete('/:id', async (req, res) => {
  const { error } = await req.supabase
    .from('entries')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)

  if (error) return res.status(500).json({ error: error.message })
  res.status(204).end()
})

export { router as entriesRouter }
