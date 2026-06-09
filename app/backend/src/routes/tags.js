import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

// GET /tags — all tags for the current user, alphabetical
router.get('/', async (req, res) => {
  const { data, error } = await req.supabase
    .from('tags')
    .select('*')
    .eq('user_id', req.user.id)
    .order('name')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /tags
router.post('/', async (req, res) => {
  const { name } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'name is required' })

  const { data, error } = await req.supabase
    .from('tags')
    .insert({ user_id: req.user.id, name: name.trim() })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Tag name already exists' })
    return res.status(500).json({ error: error.message })
  }
  res.status(201).json(data)
})

// DELETE /tags/:id
router.delete('/:id', async (req, res) => {
  const { error } = await req.supabase
    .from('tags')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).end()
})

export { router as tagsRouter }
