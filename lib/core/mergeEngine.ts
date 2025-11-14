// Core logic module for LinkedIn Analyzer
// Clean-code, modular, type-safe implementation

/**
 * Merge Engine Module
 * PDF data ve scraped data'yı birleştirir (Data Fusion)
 * PDF öncelikli, scraping tamamlayıcı mantığı ile çalışır
 */

import type { PdfParsedData } from './pdfParser'
import type { ScrapedData } from './scraperClient'

// Input interface
export interface MergeInput {
  pdf?: PdfParsedData | null
  scraped?: ScrapedData | null
}

// Output interface
export interface MergedData {
  headline?: string
  about?: string
  skills?: string[]
  education?: Array<{
    school: string
    degree: string
    field: string
    startDate?: string
    endDate?: string
  }>
  certifications?: Array<{
    name: string
    issuer: string
    date: string
  }>
  languages?: Array<{
    language: string
    proficiency: string
  }>
  experiences?: Array<{
    title: string
    company: string
    description: string
    startDate?: string
    endDate?: string
  }>
  projects?: Array<{
    name: string
    description: string
    url?: string
  }>
  location?: string
  bannerUrl?: string | null
  profilePhoto?: string | null
  photoResolution?: string | null
  connections?: number | null
  featured?: Array<{
    type: string
    title: string
    url: string
  }>
  endorsedSkills?: Array<{
    skill: string
    count: number
  }>
  media?: Array<{
    type: string
    url: string
  }>
  hasPortfolioLink?: boolean
  customUrlClean?: boolean
}

/**
 * Main function: Merge PDF and scraped data
 * PDF öncelikli, scraping tamamlayıcı mantığı ile veri birleştirme
 * 
 * Supports both MergeInput object and separate parameters for backward compatibility
 * 
 * @param inputOrPdf - MergeInput object OR PdfParsedData (for backward compatibility)
 * @param scraped - ScrapedData (optional, for backward compatibility)
 * @returns Merged data structure
 */
export function mergeData(
  inputOrPdf: MergeInput | PdfParsedData | null | undefined,
  scraped?: ScrapedData | null
): MergedData {
  try {
    // Handle both input formats: object or separate parameters
    let pdf: PdfParsedData | null | undefined
    let scrapedData: ScrapedData | null | undefined

    if (inputOrPdf && 'pdf' in inputOrPdf && 'scraped' in inputOrPdf) {
      // New format: MergeInput object
      const input = inputOrPdf as MergeInput
      pdf = input.pdf
      scrapedData = input.scraped
    } else {
      // Old format: separate parameters (backward compatibility)
      pdf = inputOrPdf as PdfParsedData | null | undefined
      scrapedData = scraped
    }

    // Validation: At least one data source required
    if (!pdf && !scrapedData) {
      throw new Error('At least one data source (PDF or scraped) is required')
    }

    // Helper: Normalize string values (empty string → null)
    const normalizeString = (value: string | null | undefined): string | null => {
      if (!value || typeof value !== 'string' || value.trim() === '') {
        return null
      }
      return value.trim()
    }

    // Helper: Normalize array values (empty array → undefined)
    const normalizeArray = <T>(value: T[] | null | undefined): T[] | undefined => {
      if (!value || !Array.isArray(value) || value.length === 0) {
        return undefined
      }
      return value
    }

    // Helper: Portfolio link kontrolü
    const checkPortfolioLink = (): boolean => {
      // PDF about içinde portfolio keywords kontrolü
      if (pdf?.about) {
        const aboutLower = pdf.about.toLowerCase()
        const portfolioKeywords = ['github.com', 'vercel.app', 'portfolio', 'behance', 'dribbble', 'personal website', 'my website']
        if (portfolioKeywords.some(keyword => aboutLower.includes(keyword))) {
          return true
        }
      }

      // Scraped featured items içinde portfolio link kontrolü
      if (scrapedData?.featured && Array.isArray(scrapedData.featured)) {
        const portfolioKeywords = ['github.com', 'vercel.app', 'portfolio', 'behance', 'dribbble']
        const hasPortfolio = scrapedData.featured.some(item => {
          const url = item.url?.toLowerCase() || ''
          return portfolioKeywords.some(keyword => url.includes(keyword))
        })
        if (hasPortfolio) {
          return true
        }
      }

      return false
    }

    // Helper: Profile photo string extraction
    const extractProfilePhoto = (): string | null => {
      if (scrapedData?.profilePhoto) {
        // String ise direkt döndür
        if (typeof scrapedData.profilePhoto === 'string') {
          return normalizeString(scrapedData.profilePhoto)
        }
        // Object ise url'ini al
        if (typeof scrapedData.profilePhoto === 'object' && scrapedData.profilePhoto !== null) {
          const photoObj = scrapedData.profilePhoto as any
          return normalizeString(photoObj.url)
        }
      }
      return null
    }

    // ============================================
    // DATA FUSION - PDF ÖNCELİKLİ
    // ============================================

    const mergedData: MergedData = {
      // Text-based fields (PDF öncelikli)
      headline: normalizeString(pdf?.headline) ?? normalizeString((scrapedData as any)?.headline) ?? undefined,
      about: normalizeString(pdf?.about) ?? normalizeString((scrapedData as any)?.about) ?? undefined,
      
      // Skills (PDF öncelikli, array length kontrolü ile)
      skills: pdf?.skills && Array.isArray(pdf.skills) && pdf.skills.length > 0
        ? pdf.skills
        : normalizeArray(scrapedData?.featured?.map(item => item.title).filter(Boolean) as string[]) ?? undefined,
      
      // Education (sadece PDF'den)
      education: normalizeArray(pdf?.education),
      
      // Certifications (sadece PDF'den)
      certifications: normalizeArray(pdf?.certifications),
      
      // Languages (sadece PDF'den)
      languages: normalizeArray(pdf?.languages),
      
      // Experiences (PDF öncelikli)
      experiences: normalizeArray(pdf?.experiences) ?? normalizeArray((scrapedData as any)?.experiences),
      
      // Projects (sadece PDF'den)
      projects: normalizeArray(pdf?.projects),
      
      // Location (PDF öncelikli)
      location: normalizeString(pdf?.location) ?? normalizeString((scrapedData as any)?.location) ?? undefined,
      
      // Visual/Media fields (Scraping öncelikli)
      bannerUrl: normalizeString(scrapedData?.bannerUrl),
      profilePhoto: extractProfilePhoto(),
      photoResolution: normalizeString(scrapedData?.photoResolution),
      connections: scrapedData?.connections ?? null,
      
      // Featured items (sadece scraping'den)
      featured: normalizeArray(scrapedData?.featured),
      
      // Endorsed skills (scraping'den, endorsements → endorsedSkills mapping)
      endorsedSkills: normalizeArray(scrapedData?.endorsements),
      
      // Media (sadece scraping'den)
      media: normalizeArray(scrapedData?.media),
      
      // Computed fields
      hasPortfolioLink: checkPortfolioLink(),
      customUrlClean: pdf?.customUrlClean ?? undefined,
    }

    return mergedData
  } catch (error) {
    console.error('Merge error:', error)
    throw new Error(
      error instanceof Error
        ? `Data merge failed: ${error.message}`
        : 'Data merge failed with unknown error'
    )
  }
}
