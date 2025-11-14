// Core logic module for LinkedIn Analyzer
// Clean-code, modular, type-safe skeleton
// Implementations will be added in next steps

/**
 * Scraper Client Module
 * Harici scraping microservice'e istek atar ve LinkedIn profil verilerini çeker
 */

// Input interface
export interface ScrapeInput {
  url: string
}

// Output interface
export interface ScrapedData {
  bannerUrl?: string
  profilePhoto?: string
  photoResolution?: string
  connections?: number
  featured?: Array<{
    type: string
    title: string
    url: string
  }>
  endorsements?: Array<{
    skill: string
    count: number
  }>
  activity?: Array<{
    type: string
    content: string
    date: string
  }>
  recommendations?: Array<{
    author: string
    text: string
    date: string
  }>
  media?: Array<{
    type: string
    url: string
  }>
}

/**
 * Main function: Scrape LinkedIn profile
 * 
 * @param input - Scraping input with URL
 * @returns Scraped profile data
 */
export async function scrapeProfile(input: ScrapeInput): Promise<ScrapedData> {
  try {
    const { url } = input

    // Validation
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL provided')
    }

    // URL format validation
    if (!isValidLinkedInUrl(url)) {
      throw new Error('Invalid LinkedIn profile URL format')
    }

    // Get scraper service URL and API key from environment
    const scraperUrl = process.env.SCRAPER_SERVICE_URL || process.env.SCRAPER_URL
    const apiKey = process.env.SCRAPER_API_KEY

    if (!scraperUrl) {
      throw new Error('SCRAPER_SERVICE_URL or SCRAPER_URL environment variable is not set')
    }

    if (!apiKey) {
      throw new Error('SCRAPER_API_KEY environment variable is not set')
    }

    // Make POST request to scraping microservice
    const response = await fetch(`${scraperUrl}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ url }),
    })

    // Handle error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error || `Scraper service error: ${response.statusText} (${response.status})`
      )
    }

    // Parse response
    const responseData = await response.json()

    // Validate response structure
    if (!responseData.success || !responseData.data) {
      throw new Error('Invalid response format from scraper service')
    }

    // Map response data to ScrapedData interface
    const scrapedData: ScrapedData = {
      bannerUrl: responseData.data.bannerUrl || undefined,
      profilePhoto: responseData.data.profilePhoto || undefined,
      photoResolution: responseData.data.photoResolution || undefined,
      connections: responseData.data.connections ?? undefined,
      featured: responseData.data.featured || [],
      endorsements: responseData.data.endorsements || [],
      activity: responseData.data.activity || [],
      recommendations: responseData.data.recommendations || [],
      media: responseData.data.media || [],
    }

    return scrapedData
  } catch (error) {
    console.error('Scraping error:', error)
    throw new Error(
      error instanceof Error
        ? `Scraping failed: ${error.message}`
        : 'Scraping failed with unknown error'
    )
  }
}

/**
 * Helper: Validate LinkedIn URL format
 */
function isValidLinkedInUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return (
      urlObj.hostname.includes('linkedin.com') &&
      urlObj.pathname.includes('/in/')
    )
  } catch {
    return false
  }
}

// Alias for backward compatibility with API routes
export const scrapeLinkedInProfile = scrapeProfile
