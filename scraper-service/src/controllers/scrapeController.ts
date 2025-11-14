/**
 * Scrape Controller
 * Scraping isteklerini yönetir ve response döndürür
 */

import { Request, Response } from 'express'
import { scrapeLinkedInProfile } from '../services/scrapeService'
import { validateLinkedInUrl } from '../utils/validateUrl'
import { sendError, sendSuccess } from '../utils/errorHandler'

/**
 * Scrape request body interface
 */
interface ScrapeRequest {
  url: string
}

/**
 * POST /scrape endpoint handler
 * LinkedIn profil URL'ini alır ve scraping işlemini başlatır
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function scrapeProfile(req: Request, res: Response): Promise<void> {
  try {
    const { url } = req.body as ScrapeRequest

    // Validation: URL kontrolü
    if (!url || typeof url !== 'string') {
      sendError(res, 'URL is required and must be a string', 400, 'INVALID_URL')
      return
    }

    // Validation: LinkedIn URL format kontrolü
    if (!validateLinkedInUrl(url)) {
      sendError(res, 'Invalid LinkedIn profile URL format', 400, 'INVALID_LINKEDIN_URL')
      return
    }

    // Scraping işlemini başlat
    const scrapedData = await scrapeLinkedInProfile(url)

    // Başarılı response döndür
    sendSuccess(res, scrapedData, 200)
  } catch (error) {
    console.error('Scrape controller error:', error)

    // Hata türüne göre status code belirle
    const statusCode = error instanceof Error && error.message.includes('timeout')
      ? 504
      : 500

    sendError(
      res,
      error instanceof Error ? error.message : 'Internal server error',
      statusCode,
      'SCRAPING_ERROR'
    )
  }
}

