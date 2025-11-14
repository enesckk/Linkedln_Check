/**
 * API Key Authentication Middleware
 * Tüm isteklerin x-api-key header'ı ile korunmasını sağlar
 */

import { Request, Response, NextFunction } from 'express'
import { sendError } from '../utils/errorHandler'

/**
 * API Key doğrulama middleware'i
 * x-api-key header'ını kontrol eder ve environment variable ile karşılaştırır
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string
  const validApiKey = process.env.SCRAPER_API_KEY

  // API Key kontrolü
  if (!validApiKey) {
    console.error('SCRAPER_API_KEY environment variable is not set')
    sendError(res, 'Server configuration error', 500, 'SERVER_ERROR')
    return
  }

  if (!apiKey) {
    sendError(res, 'API key is required. Please provide x-api-key header.', 401, 'MISSING_API_KEY')
    return
  }

  if (apiKey !== validApiKey) {
    sendError(res, 'Invalid API key', 403, 'INVALID_API_KEY')
    return
  }

  // API Key geçerli, isteği devam ettir
  next()
}

