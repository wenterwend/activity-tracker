import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { buildPrompt, hashPrompt, summarizeEntries } from '../lib/claude.js'

const router = Router()

router.use(requireAuth)

// POST /ai/summary
// Body: { entries: [...], period_start: string, period_end: string }
router.post('/summary', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'AI feature is not configured' })
  }

  const { entries, period_start, period_end } = req.body

  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'entries array is required and must be non-empty' })
  }
  if (!period_start || !period_end) {
    return res.status(400).json({ error: 'period_start and period_end are required' })
  }

  const prompt = buildPrompt(entries)
  const prompt_hash = hashPrompt(prompt)

  // Check cache first
  const { data: cached } = await req.supabase
    .from('ai_summaries')
    .select('summary_text')
    .eq('user_id', req.user.id)
    .eq('prompt_hash', prompt_hash)
    .maybeSingle()

  if (cached) {
    console.log(`[AI] Cache hit for prompt_hash: ${prompt_hash.slice(0, 12)}…`)
    return res.json({ summary: cached.summary_text, cached: true })
  }

  console.log(`[AI] Cache miss — calling Claude for prompt_hash: ${prompt_hash.slice(0, 12)}…`)

  let summary_text
  try {
    summary_text = await summarizeEntries(entries)
  } catch (err) {
    console.error('[AI] Claude error:', err.message)
    return res.status(502).json({ error: 'AI generation failed. Please try again.' })
  }

  // Upsert into cache — non-fatal if it fails
  const { error: insertError } = await req.supabase
    .from('ai_summaries')
    .upsert(
      { user_id: req.user.id, period_start, period_end, prompt_hash, summary_text },
      { onConflict: 'user_id,prompt_hash' }
    )

  if (insertError) {
    console.error('[AI] Cache write failed:', insertError.message)
  }

  res.json({ summary: summary_text, cached: false })
})

export { router as aiRouter }
