/**
 * Scrape Routes
 * Scraping endpoint'lerini tanımlar
 */

import { Router } from 'express'
import { scrapeProfile } from '../controllers/scrapeController'

const router = Router()

/**
 * POST /scrape
 * LinkedIn profil scraping endpoint'i
 */
router.post('/scrape', scrapeProfile)

export default router

