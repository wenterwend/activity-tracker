import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

const ENTRY_SELECT = `
  *,
  entry_tags (
    tag_id,
    tags ( id, name )
  )
`

function normalizeEntry({ entry_tags, ...entry }) {
  return { ...entry, tags: entry_tags.map(et => et.tags) }
}

// GET /entries — all entries for the current user with tags, date DESC then created_at DESC
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

// GET /entries/:id — single entry with tags (used by edit form)
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

// POST /entries
router.post('/', async (req, res) => {
  const { task_name, date, time_spent_minutes, notes, tag_ids = [] } = req.body

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

  res.status(201).json({ ...entry, tags: [] })
})

// PUT /entries/:id
router.put('/:id', async (req, res) => {
  const { task_name, date, time_spent_minutes, notes, tag_ids = [] } = req.body

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

  // Replace tags atomically: delete all then re-insert
  await req.supabase.from('entry_tags').delete().eq('entry_id', req.params.id)
  if (tag_ids.length > 0) {
    await req.supabase
      .from('entry_tags')
      .insert(tag_ids.map(tag_id => ({ entry_id: req.params.id, tag_id })))
  }

  res.json({ ...entry, tags: [] })
})

// DELETE /entries/:id
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
