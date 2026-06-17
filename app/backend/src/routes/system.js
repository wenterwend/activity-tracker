import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { serviceClient } from '../lib/serviceClient.js'

const router = Router()

router.use(requireAuth)

// GET /system/message — active system message for all authenticated users
router.get('/message', async (req, res) => {
  const { data, error } = await serviceClient
    .from('system_messages')
    .select('id, message, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data ?? null)
})

export { router as systemRouter }
