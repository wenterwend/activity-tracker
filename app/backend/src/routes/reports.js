import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

// GET /reports?start=YYYY-MM-DD&end=YYYY-MM-DD[&tag_ids=id1,id2][&exclude_tag_ids=id3,id4]
router.get('/', async (req, res) => {
  const { start, end, tag_ids, exclude_tag_ids } = req.query

  if (!start || !end) {
    return res.status(400).json({ error: 'start and end query params are required' })
  }

  const includeFilter = tag_ids ? tag_ids.split(',').filter(Boolean) : []
  const excludeFilter = exclude_tag_ids ? exclude_tag_ids.split(',').filter(Boolean) : []

  const { data, error } = await req.supabase
    .from('entries')
    .select(`
      id, task_name, date, time_spent_minutes, notes, created_at,
      entry_tags ( tag_id, tags ( id, name ) )
    `)
    .eq('user_id', req.user.id)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })

  let results = data.map(({ entry_tags, ...entry }) => ({
    ...entry,
    tags: entry_tags.map(et => et.tags),
  }))

  // AND include filter: entry must have ALL requested tags
  if (includeFilter.length > 0) {
    results = results.filter(entry =>
      includeFilter.every(tid => entry.tags.some(t => t.id === tid))
    )
  }

  // NOT exclude filter: entry must not have ANY of the excluded tags
  if (excludeFilter.length > 0) {
    results = results.filter(entry =>
      !excludeFilter.some(tid => entry.tags.some(t => t.id === tid))
    )
  }

  res.json(results)
})

export { router as reportsRouter }
