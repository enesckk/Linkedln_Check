/**
 * LinkedIn Scraper Microservice
 * Express.js + Playwright tabanlı LinkedIn profil scraping servisi
 * 
 * Endpoints:
 * - POST /scrape - LinkedIn profil scraping
 * 
 * Authentication:
 * - x-api-key header required
 */

import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import scrapeRoute from './routes/scrapeRoute'
import { apiKeyAuth } from './middleware/apiKeyAuth'

const app: Express = express()
const PORT = process.env.PORT || 3001

// Middleware'ler
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API Key authentication middleware (tüm /scrape endpoint'leri için)
app.use('/scrape', apiKeyAuth)

// Routes
app.use('/', scrapeRoute)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  })
})

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  })
})

// Server'ı başlat
app.listen(PORT, () => {
  console.log(`🚀 LinkedIn Scraper Service running on port ${PORT}`)
  console.log(`🔐 API Key required for /scrape endpoint`)
})

export default app

