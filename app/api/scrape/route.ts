import { NextRequest, NextResponse } from 'next/server'
import { scrapeRequestSchema } from '@/utils/validators'
import type { ScrapedData } from '@/utils/types'

/**
 * POST /api/scrape
 * 
 * LinkedIn profil URL'ini harici scraping microservice'e gönderir
 * Railway'de çalışan Playwright servisine istek atar
 * 
 * Request body:
 * {
 *   "url": "https://www.linkedin.com/in/..."
 * }
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "data"?: ScrapedData,
 *   "error"?: string
 * }
 */

interface ScrapeRequest {
  url: string
}

interface ScrapeResponse {
  success: boolean
  data?: ScrapedData
  error?: string
}

/**
 * Scraper service response interface
 */
interface ScraperServiceResponse {
  success: boolean
  data?: ScrapedData
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<ScrapeResponse>> {
  try {
    // 1. Request body'yi parse et
    const body: ScrapeRequest = await request.json()
    const { url } = body

    // 2. URL validation
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'URL is required and must be a string',
        },
        { status: 400 }
      )
    }

    // Zod schema ile URL validation
    try {
      scrapeRequestSchema.parse({ url })
    } catch (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid LinkedIn profile URL format',
        },
        { status: 400 }
      )
    }

    // 3. Environment variables kontrolü
    const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL
    const scraperApiKey = process.env.SCRAPER_API_KEY

    if (!scraperServiceUrl) {
      console.error('SCRAPER_SERVICE_URL environment variable is not set')
      return NextResponse.json(
        {
          success: false,
          error: 'Scraper service is not configured',
        },
        { status: 500 }
      )
    }

    if (!scraperApiKey) {
      console.error('SCRAPER_API_KEY environment variable is not set')
      return NextResponse.json(
        {
          success: false,
          error: 'Scraper service authentication is not configured',
        },
        { status: 500 }
      )
    }

    // 4. Scraper service'e fetch ile istek at
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 saniye timeout

    try {
      const response = await fetch(`${scraperServiceUrl}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': scraperApiKey,
        },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // 5. HTTP error durumlarını handle et
      if (!response.ok) {
        let errorMessage = 'Scraper service error'

        try {
          const errorData: ScraperServiceResponse = await response.json()
          errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }

        // Status code'a göre user-safe error message
        if (response.status === 401 || response.status === 403) {
          return NextResponse.json(
            {
              success: false,
              error: 'Authentication failed with scraper service',
            },
            { status: 502 }
          )
        }

        if (response.status === 404) {
          return NextResponse.json(
            {
              success: false,
              error: 'Scraper service endpoint not found',
            },
            { status: 502 }
          )
        }

        if (response.status === 504 || response.status === 408) {
          return NextResponse.json(
            {
              success: false,
              error: 'Scraper service request timeout',
            },
            { status: 504 }
          )
        }

        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
          },
          { status: 502 }
        )
      }

      // 6. Başarılı response'u parse et
      const responseData: ScraperServiceResponse = await response.json()

      // Response format validation
      if (!responseData.success || !responseData.data) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid response format from scraper service',
          },
          { status: 502 }
        )
      }

      // 7. Başarılı response döndür
      return NextResponse.json({
        success: true,
        data: responseData.data,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)

      // Timeout error handling
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          {
            success: false,
            error: 'Request timeout: Scraper service did not respond in time',
          },
          { status: 504 }
        )
      }

      // Network error handling
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to connect to scraper service',
          },
          { status: 502 }
        )
      }

      throw fetchError
    }
  } catch (error) {
    console.error('Scraping API error:', error)

    // User-safe error message
    const errorMessage =
      error instanceof Error
        ? error.message.includes('JSON')
          ? 'Invalid response from scraper service'
          : 'An unexpected error occurred during scraping'
        : 'An unexpected error occurred during scraping'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
