import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { buildPrompt, hashPrompt, summarizeEntries } from '../lib/claude.js'
import { serviceClient } from '../lib/serviceClient.js'

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
    return res.json({ summary: cached.summary_text, cached: true })
  }

  let result
  try {
    result = await summarizeEntries(entries)
  } catch (err) {
    console.error('[AI] Claude error:', err.message)
    return res.status(502).json({ error: 'AI generation failed. Please try again.' })
  }

  const { text: summary_text, input_tokens, output_tokens } = result

  // Upsert into cache — non-fatal if it fails
  const { error: insertError } = await req.supabase
    .from('ai_summaries')
    .upsert(
      { user_id: req.user.id, period_start, period_end, prompt_hash, summary_text, input_tokens, output_tokens },
      { onConflict: 'user_id,prompt_hash' }
    )

  if (insertError) {
    console.error('[AI] Cache write failed:', insertError.message)
  }

  // Audit log — fire-and-forget
  serviceClient.from('audit_log').insert({
    user_id: req.user.id,
    action: 'ai_summary_generated',
    metadata: { input_tokens, output_tokens, period_start, period_end },
  })

  res.json({ summary: summary_text, cached: false })
})

export { router as aiRouter }
