/**
 * Scraping Service
 * Playwright kullanarak LinkedIn profil verilerini scrape eder
 * Clean-code, async, type-safe, modüler implementasyon
 */

import { chromium, Browser, Page } from 'playwright'
import { 
  normalizeString, 
  extractNumber, 
  normalizeUrl, 
  extractImageResolution 
} from '../utils/normalize'
import { 
  LINKEDIN_SELECTORS, 
  trySelectorsText, 
  trySelectorsAttribute, 
  trySelectorsAll 
} from '../utils/selectors'

/**
 * Scraped data interface
 * LinkedIn profilinden çıkarılan veri yapısı
 */
export interface ScrapedData {
  bannerUrl: string | null
  profilePhoto: string | null
  photoResolution: string | null
  connections: number | null
  featured: Array<{
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
  media: Array<{
    type: string
    url: string
  }>
}

/**
 * LinkedIn profilini scrape eder
 * 
 * @param url - LinkedIn profil URL'i
 * @returns Scraped profile data
 */
export async function scrapeLinkedInProfile(url: string): Promise<ScrapedData> {
  let browser: Browser | null = null

  try {
    // Playwright browser'ı başlat
    browser = await chromium.launch({
      headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
    })

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })

    const page = await context.newPage()

    // Timeout ayarla
    const timeout = parseInt(process.env.PLAYWRIGHT_TIMEOUT || '30000', 10)
    page.setDefaultTimeout(timeout)

    // LinkedIn sayfasına git
    await page.goto(url, { waitUntil: 'networkidle', timeout: timeout })

    // Sayfanın yüklenmesini bekle
    await page.waitForTimeout(2000)

    // Tüm extraction fonksiyonlarını paralel çalıştır
    const [
      bannerUrl,
      profilePhoto,
      photoResolution,
      connections,
      featured,
      endorsements,
      activity,
      recommendations,
      media,
    ] = await Promise.all([
      extractBannerUrl(page),
      extractProfilePhoto(page),
      extractPhotoResolution(page),
      extractConnections(page),
      extractFeaturedItems(page),
      extractEndorsements(page),
      extractActivity(page),
      extractRecommendations(page),
      extractMedia(page),
    ])

    return {
      bannerUrl,
      profilePhoto,
      photoResolution,
      connections,
      featured,
      endorsements,
      activity,
      recommendations,
      media,
    }
  } catch (error) {
    console.error('Scraping error:', error)
    
    // Error durumunda boş data döndür (graceful degradation)
    return {
      bannerUrl: null,
      profilePhoto: null,
      photoResolution: null,
      connections: null,
      featured: [],
      endorsements: [],
      activity: [],
      recommendations: [],
      media: [],
    }
  } finally {
    // Browser'ı kapat
    if (browser) {
      try {
        await browser.close()
      } catch (err) {
        console.error('Error closing browser:', err)
      }
    }
  }
}

/**
 * Helper: Banner URL çıkarır
 * LinkedIn profil sayfasındaki banner/background image'ı bulur
 */
async function extractBannerUrl(page: Page): Promise<string | null> {
  try {
    // Önce img tag'lerini dene
    const bannerUrl = await trySelectorsAttribute(
      page,
      LINKEDIN_SELECTORS.BANNER,
      'src'
    )

    if (bannerUrl) {
      return normalizeUrl(bannerUrl, page.url())
    }

    // Background image CSS property'sinden çıkar
    const bannerElement = await page.$('section.pv-profile-section.pv-top-card-section')
    if (bannerElement) {
      const style = await bannerElement.getAttribute('style')
      if (style) {
        const match = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/)
        if (match && match[1]) {
          return normalizeUrl(match[1], page.url())
        }
      }
    }

    // Evaluate ile direkt DOM'dan çek
    const bannerFromEval = await page.evaluate(() => {
      const img = document.querySelector('section.pv-profile-section.pv-top-card-section img')
      if (img) {
        return (img as HTMLImageElement).src || null
      }
      
      // Background image kontrolü
      const section = document.querySelector('section.pv-profile-section.pv-top-card-section')
      if (section) {
        const style = window.getComputedStyle(section)
        const bgImage = style.backgroundImage
        if (bgImage && bgImage !== 'none') {
          const match = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/)
          return match ? match[1] : null
        }
      }
      
      return null
    })

    return normalizeUrl(bannerFromEval, page.url())
  } catch (error) {
    console.error('Error extracting banner URL:', error)
    return null
  }
}

/**
 * Helper: Profile Photo URL çıkarır
 * LinkedIn profil fotoğrafını bulur
 */
async function extractProfilePhoto(page: Page): Promise<string | null> {
  try {
    // Selector'larla dene
    const photoUrl = await trySelectorsAttribute(
      page,
      LINKEDIN_SELECTORS.PROFILE_PHOTO,
      'src'
    )

    if (photoUrl) {
      return normalizeUrl(photoUrl, page.url())
    }

    // Evaluate ile direkt DOM'dan çek
    const photoFromEval = await page.evaluate(() => {
      const selectors = [
        '.pv-top-card-profile-picture img',
        '.profile-photo img',
        'img[alt*="profile"]',
        '.pv-top-card__photo img',
      ]

      for (const selector of selectors) {
        const img = document.querySelector(selector)
        if (img) {
          const src = (img as HTMLImageElement).src
          if (src && !src.includes('placeholder')) {
            return src
          }
        }
      }

      return null
    })

    return normalizeUrl(photoFromEval, page.url())
  } catch (error) {
    console.error('Error extracting profile photo:', error)
    return null
  }
}

/**
 * Helper: Photo Resolution çıkarır
 * Profile photo URL'inden resolution bilgisi çıkarır
 */
async function extractPhotoResolution(page: Page): Promise<string | null> {
  try {
    const photoUrl = await extractProfilePhoto(page)
    if (!photoUrl) {
      return null
    }

    // URL'den resolution çıkar
    const resolution = extractImageResolution(photoUrl)
    if (resolution) {
      return resolution
    }

    // Image metadata'sından çek (eğer yüklenebilirse)
    try {
      const resolutionFromEval = await page.evaluate((url) => {
        return new Promise<string | null>((resolve) => {
          const img = new Image()
          img.onload = () => {
            resolve(`${img.naturalWidth}x${img.naturalHeight}`)
          }
          img.onerror = () => resolve(null)
          img.src = url
        })
      }, photoUrl)

      return resolutionFromEval
    } catch {
      return null
    }
  } catch (error) {
    console.error('Error extracting photo resolution:', error)
    return null
  }
}

/**
 * Helper: Connections count çıkarır
 * "500+ connections" formatındaki metni parse eder
 */
async function extractConnections(page: Page): Promise<number | null> {
  try {
    // Text content'i al
    const connectionsText = await trySelectorsText(
      page,
      LINKEDIN_SELECTORS.CONNECTIONS
    )

    if (connectionsText) {
      const number = extractNumber(connectionsText)
      if (number !== null) {
        return number
      }
    }

    // Evaluate ile direkt DOM'dan çek
    const connectionsFromEval = await page.evaluate(() => {
      const selectors = [
        '.pv-top-card-v2-section__connections',
        '.t-bold span',
        '[data-test-id="connections"]',
      ]

      for (const selector of selectors) {
        const element = document.querySelector(selector)
        if (element) {
          const text = element.textContent || ''
          // "500+" veya "1,234 connections" formatını parse et
          const match = text.match(/(\d{1,3}(?:,\d{3})*)\+?/)
          if (match) {
            return parseInt(match[1].replace(/,/g, ''), 10)
          }
        }
      }

      return null
    })

    return connectionsFromEval
  } catch (error) {
    console.error('Error extracting connections:', error)
    return null
  }
}

/**
 * Helper: Featured items çıkarır
 * Featured section'daki linkleri toplar
 */
async function extractFeaturedItems(page: Page): Promise<Array<{ type: string; title: string; url: string }>> {
  try {
    const featuredItems = await page.evaluate(() => {
      const items: Array<{ type: string; title: string; url: string }> = []

      // Helper: String normalize
      const normalizeString = (str: string | null | undefined): string | null => {
        if (!str || typeof str !== 'string') return null
        const trimmed = str.trim()
        return trimmed.length > 0 ? trimmed : null
      }

      // Helper: URL normalize
      const normalizeUrl = (url: string | null | undefined): string | null => {
        if (!url) return null
        try {
          const trimmed = url.trim()
          if (trimmed.length === 0) return null
          if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed
          }
          return null
        } catch {
          return null
        }
      }

      // Featured section'ı bul
      const featuredSection = document.querySelector('section[data-section="featured"]') ||
                              document.querySelector('.pv-featured-section')

      if (!featuredSection) {
        return items
      }

      // Tüm linkleri topla
      const links = featuredSection.querySelectorAll('a[href]')
      links.forEach((link) => {
        const href = (link as HTMLAnchorElement).href
        const title = normalizeString(link.textContent || '') || 'Untitled'
        const url = normalizeUrl(href) || ''

        if (url) {
          // URL'den type çıkar (github, vercel, portfolio, vb.)
          let type = 'link'
          if (url.includes('github.com')) type = 'github'
          else if (url.includes('vercel.app')) type = 'vercel'
          else if (url.includes('portfolio') || url.includes('behance') || url.includes('dribbble')) type = 'portfolio'
          else if (url.includes('medium.com')) type = 'medium'
          else if (url.includes('youtube.com')) type = 'youtube'

          items.push({ type, title, url })
        }
      })

      return items
    })

    return featuredItems.filter(item => item.url.length > 0)
  } catch (error) {
    console.error('Error extracting featured items:', error)
    return []
  }
}

/**
 * Helper: Endorsements çıkarır
 * Skills section'daki endorsement sayılarını toplar
 */
async function extractEndorsements(page: Page): Promise<Array<{ skill: string; count: number }>> {
  try {
    const endorsements = await page.evaluate(() => {
      const items: Array<{ skill: string; count: number }> = []

      // Helper: String normalize
      const normalizeString = (str: string | null | undefined): string | null => {
        if (!str || typeof str !== 'string') return null
        const trimmed = str.trim()
        return trimmed.length > 0 ? trimmed : null
      }

      // Skills section'ı bul
      const skillsSection = document.querySelector('section[data-section="skills"]') ||
                           document.querySelector('.pv-skills-section')

      if (!skillsSection) {
        return items
      }

      // Skill item'ları bul
      const skillItems = skillsSection.querySelectorAll('.pv-skill-category-entity__skill-wrapper, .skill-item')

      skillItems.forEach((item) => {
        // Skill adını al
        const skillNameElement = item.querySelector('.pv-skill-category-entity__name-text, .skill-name')
        const skillName = normalizeString(skillNameElement?.textContent || '') || 'Unknown'

        // Endorsement count'u al
        const countElement = item.querySelector('.pv-skill-category-entity__endorsement-count, .endorsement-count')
        const countText = countElement?.textContent || ''
        
        // "+23" veya "23" formatını parse et
        const match = countText.match(/(\d+)/)
        const count = match ? parseInt(match[1], 10) : 0

        if (skillName && count > 0) {
          items.push({ skill: skillName, count })
        }
      })

      return items
    })

    return endorsements
  } catch (error) {
    console.error('Error extracting endorsements:', error)
    return []
  }
}

/**
 * Helper: Activity çıkarır (son 3 aktivite)
 * Recent activity section'dan son aktiviteleri toplar
 */
async function extractActivity(page: Page): Promise<Array<{ type: string; content: string; date: string }>> {
  try {
    const activities = await page.evaluate(() => {
      const items: Array<{ type: string; content: string; date: string }> = []

      // Helper: String normalize
      const normalizeString = (str: string | null | undefined): string | null => {
        if (!str || typeof str !== 'string') return null
        const trimmed = str.trim()
        return trimmed.length > 0 ? trimmed : null
      }

      // Activity section'ı bul
      const activitySection = document.querySelector('section[data-section="activity"]') ||
                             document.querySelector('.pv-recent-activity-section')

      if (!activitySection) {
        return items
      }

      // Activity item'ları bul (max 3)
      const activityItems = Array.from(
        activitySection.querySelectorAll('.pv-recent-activity-section__list-item, .activity-item')
      ).slice(0, 3)

      activityItems.forEach((item) => {
        // Type belirle (post, like, comment, vb.)
        let type = 'post'
        const itemText = item.textContent?.toLowerCase() || ''
        if (itemText.includes('liked')) type = 'like'
        else if (itemText.includes('commented')) type = 'comment'
        else if (itemText.includes('shared')) type = 'share'

        // Content al
        const contentElement = item.querySelector('.activity-content, .feed-item-content')
        const content = normalizeString(contentElement?.textContent || '') || 'No content'

        // Date al
        const dateElement = item.querySelector('.activity-date, time, .feed-item-date')
        const date = normalizeString(dateElement?.textContent || dateElement?.getAttribute('datetime') || '') || 'Unknown date'

        items.push({ type, content, date })
      })

      return items
    })

    return activities
  } catch (error) {
    console.error('Error extracting activity:', error)
    return []
  }
}

/**
 * Helper: Recommendations çıkarır
 * Recommendations section'dan tavsiyeleri toplar
 */
async function extractRecommendations(page: Page): Promise<Array<{ author: string; text: string; date: string }>> {
  try {
    const recommendations = await page.evaluate(() => {
      const items: Array<{ author: string; text: string; date: string }> = []

      // Helper: String normalize
      const normalizeString = (str: string | null | undefined): string | null => {
        if (!str || typeof str !== 'string') return null
        const trimmed = str.trim()
        return trimmed.length > 0 ? trimmed : null
      }

      // Recommendations section'ı bul
      const recommendationsSection = document.querySelector('section[data-section="recommendations"]') ||
                                     document.querySelector('.pv-recommendations-section')

      if (!recommendationsSection) {
        return items
      }

      // Recommendation item'ları bul
      const recommendationItems = recommendationsSection.querySelectorAll(
        '.pv-recommendation-entity, .recommendation-item'
      )

      recommendationItems.forEach((item) => {
        // Author al
        const authorElement = item.querySelector('.recommendation-author, .pv-recommendation-entity__header')
        const author = normalizeString(authorElement?.textContent || '') || 'Unknown'

        // Text al
        const textElement = item.querySelector('.recommendation-text, .pv-recommendation-entity__text')
        const text = normalizeString(textElement?.textContent || '') || 'No recommendation text'

        // Date al
        const dateElement = item.querySelector('.recommendation-date, time')
        const date = normalizeString(dateElement?.textContent || dateElement?.getAttribute('datetime') || '') || 'Unknown date'

        items.push({ author, text, date })
      })

      return items
    })

    return recommendations
  } catch (error) {
    console.error('Error extracting recommendations:', error)
    return []
  }
}

/**
 * Helper: Media attachments çıkarır
 * Experience section'daki media dosyalarını toplar
 */
async function extractMedia(page: Page): Promise<Array<{ type: string; url: string }>> {
  try {
    const mediaItems = await page.evaluate(() => {
      const items: Array<{ type: string; url: string }> = []

      // Helper: URL normalize
      const normalizeUrl = (url: string | null | undefined): string | null => {
        if (!url) return null
        try {
          const trimmed = url.trim()
          if (trimmed.length === 0) return null
          if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed
          }
          return null
        } catch {
          return null
        }
      }

      // Experience section'ı bul
      const experienceSection = document.querySelector('section[data-section="experience"]') ||
                                document.querySelector('.pv-profile-section.experience-section')

      if (!experienceSection) {
        return items
      }

      // Media elementlerini bul (img, video, vb.)
      const mediaElements = experienceSection.querySelectorAll(
        '.pv-entity__media img, .experience-media img, .pv-entity__photo img, video'
      )

      mediaElements.forEach((element) => {
        let url = ''
        let type = 'image'

        if (element.tagName === 'IMG') {
          url = (element as HTMLImageElement).src || ''
          type = 'image'
        } else if (element.tagName === 'VIDEO') {
          url = (element as HTMLVideoElement).src || ''
          type = 'video'
        }

        const normalizedUrl = normalizeUrl(url)
        if (normalizedUrl) {
          items.push({ type, url: normalizedUrl })
        }
      })

      return items
    })

    return mediaItems.filter(item => item.url.length > 0)
  } catch (error) {
    console.error('Error extracting media:', error)
    return []
  }
}
