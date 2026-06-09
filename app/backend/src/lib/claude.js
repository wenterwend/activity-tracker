import Anthropic from '@anthropic-ai/sdk'
import { createHash } from 'crypto'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export function buildPrompt(entries) {
  const lines = entries.map((e, i) => {
    const hours = (e.time_spent_minutes / 60).toFixed(2)
    const tags = e.tags?.map(t => t.name).join(', ') || 'no tags'
    const notes = e.notes ? ` — ${e.notes}` : ''
    return `${i + 1}. [${e.date}] ${e.task_name} (${hours}h, tags: ${tags})${notes}`
  })
  return lines.join('\n')
}

export function hashPrompt(prompt) {
  return createHash('sha256').update(prompt).digest('hex')
}

export async function summarizeEntries(entries) {
  const entryList = buildPrompt(entries)

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: `You are a helpful productivity assistant. The user will provide a list of work log entries.
Summarize the work done during this period in 3–5 concise paragraphs.
Highlight patterns, recurring themes, and the most time-consuming areas.
Be specific and reference actual task names. Do not invent tasks that are not in the log.
Format as plain text — no markdown headers, no bullet points.`,
    messages: [
      {
        role: 'user',
        content: `Here are my work log entries:\n\n${entryList}\n\nPlease summarize my activity.`,
      },
    ],
  })

  return message.content[0].text
}
