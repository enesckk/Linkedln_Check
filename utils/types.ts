/**
 * Type Definitions
 * Proje genelinde kullanılan tüm TypeScript tipleri
 */

/**
 * PDF Data Structure
 * LinkedIn PDF Export'tan parse edilen veri
 */
export interface PdfData {
  headline: string
  about: string
  experience: Array<{
    title: string
    company: string
    description: string
    startDate?: string
    endDate?: string
  }>
  education: Array<{
    school: string
    degree: string
    field: string
    startDate?: string
    endDate?: string
  }>
  skills: string[]
  certifications: Array<{
    name: string
    issuer: string
    date: string
  }>
  languages: Array<{
    language: string
    proficiency: string
  }>
}

/**
 * Scraped Data Structure
 * Scraping microservice'den gelen veri
 */
export interface ScrapedData {
  banner: string | null
  profilePhoto: {
    url: string | null
    resolution: string | null
  }
  connectionsCount: number
  featuredItems: Array<{
    type: string
    title: string
    url: string
  }>
  endorsements: Array<{
    skill: string
    count: number
  }>
  activity: Array<{
    type: string
    content: string
    date: string
  }>
  recommendations: Array<{
    author: string
    text: string
    date: string
  }>
  mediaAttachments: Array<{
    type: string
    url: string
  }>
}

/**
 * Merged Data Structure
 * PDF + Scraped data'nın birleştirilmiş hali
 */
export interface MergedData extends PdfData {
  banner: string | null
  profilePhoto: {
    url: string | null
    resolution: string | null
  }
  connectionsCount: number
  featuredItems: Array<{
    type: string
    title: string
    url: string
  }>
  endorsements: Array<{
    skill: string
    count: number
  }>
  activity: Array<{
    type: string
    content: string
    date: string
  }>
  recommendations: Array<{
    author: string
    text: string
    date: string
  }>
  mediaAttachments: Array<{
    type: string
    url: string
  }>
}

/**
 * Rule Results Structure
 * Rule engine'in kontrol sonuçları
 * 19 kural için boolean sonuçlar ve toplam skor
 */
export interface RuleResults {
  results: Record<string, boolean>
  score: number
}

/**
 * AI Feedback Structure
 * AI değerlendirme sonuçları
 */
export interface AiFeedback {
  headlineSuggestion?: string
  aboutSuggestion?: string
  overallFeedback?: string
  aiScore?: number // 0-100
  insights?: {
    strengths: string[]
    improvements: string[]
  }
}

/**
 * Report Structure
 * Frontend'de kullanılan rapor yapısı
 */
export interface Report {
  id: string
  userId: string
  linkedinUrl: string
  status: 'processing' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
  mergedData?: MergedData
  ruleResults?: RuleResults
  aiFeedback?: AiFeedback
}

