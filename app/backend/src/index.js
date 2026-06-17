import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { healthRouter } from './routes/health.js'
import { entriesRouter } from './routes/entries.js'
import { tagsRouter } from './routes/tags.js'
import { reportsRouter } from './routes/reports.js'
import { aiRouter } from './routes/ai.js'
import { adminRouter } from './routes/admin.js'
import { systemRouter } from './routes/system.js'

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(express.json())

app.use('/health', healthRouter)
app.use('/entries', entriesRouter)
app.use('/tags', tagsRouter)
app.use('/reports', reportsRouter)
app.use('/ai', aiRouter)
app.use('/admin', adminRouter)
app.use('/system', systemRouter)

const port = process.env.PORT ?? 4000
app.listen(port, () => console.log(`API running on port ${port}`))
