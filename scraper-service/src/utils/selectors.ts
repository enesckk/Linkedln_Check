/**
 * Selectors Utility
 * LinkedIn profil sayfası için CSS selector'ları ve helper fonksiyonlar
 */

/**
 * LinkedIn profil sayfası için selector'lar
 * Bu selector'lar LinkedIn'in güncel HTML yapısına göre güncellenmelidir
 */
export const LINKEDIN_SELECTORS = {
  // Banner image
  BANNER: [
    'section.pv-profile-section.pv-top-card-section img',
    '.pv-top-card-section img',
    '.profile-banner img',
    'img[alt*="background"]',
  ],

  // Profile photo
  PROFILE_PHOTO: [
    '.pv-top-card-profile-picture img',
    '.profile-photo img',
    'img[alt*="profile"]',
    '.pv-top-card__photo img',
  ],

  // Connections count
  CONNECTIONS: [
    '.pv-top-card-v2-section__connections',
    '.t-bold span',
    '[data-test-id="connections"]',
    '.connections-count',
  ],

  // Featured section
  FEATURED_SECTION: [
    'section[data-section="featured"]',
    '.pv-featured-section',
    '.featured-section',
  ],

  // Featured items links
  FEATURED_ITEMS: [
    'section[data-section="featured"] a[href]',
    '.pv-featured-section a',
    '.featured-section a[href]',
  ],

  // Skills section
  SKILLS_SECTION: [
    'section[data-section="skills"]',
    '.pv-skills-section',
    '.skills-section',
  ],

  // Skill items with endorsements
  SKILL_ITEMS: [
    '.pv-skill-category-entity__skill-wrapper',
    '.skill-item',
    '.endorsed-skill-item',
  ],

  // Endorsement count (span içinde "+23" gibi)
  ENDORSEMENT_COUNT: [
    '.pv-skill-category-entity__endorsement-count',
    '.endorsement-count',
    'span[aria-label*="endorsement"]',
  ],

  // Experience section
  EXPERIENCE_SECTION: [
    'section[data-section="experience"]',
    '.pv-profile-section.experience-section',
    '#experience-section',
  ],

  // Media attachments in experience
  EXPERIENCE_MEDIA: [
    '.pv-entity__media img',
    '.experience-media img',
    '.pv-entity__photo img',
  ],

  // Activity section
  ACTIVITY_SECTION: [
    'section[data-section="activity"]',
    '.pv-recent-activity-section',
    '.activity-section',
  ],

  // Activity items
  ACTIVITY_ITEMS: [
    '.pv-recent-activity-section__list-item',
    '.activity-item',
    '.feed-item',
  ],

  // Recommendations section
  RECOMMENDATIONS_SECTION: [
    'section[data-section="recommendations"]',
    '.pv-recommendations-section',
    '.recommendations-section',
  ],

  // Recommendation items
  RECOMMENDATION_ITEMS: [
    '.pv-recommendation-entity',
    '.recommendation-item',
    '.recommendation-card',
  ],
} as const

/**
 * Selector'ları sırayla dener ve ilk bulunan elementi döndürür
 * 
 * @param page - Playwright Page instance
 * @param selectors - Denenecek selector array'i
 * @returns İlk bulunan element veya null
 */
export async function trySelectors(
  page: any,
  selectors: readonly string[]
): Promise<any> {
  for (const selector of selectors) {
    try {
      const element = await page.$(selector)
      if (element) {
        return element
      }
    } catch {
      // Selector bulunamadı, bir sonrakini dene
      continue
    }
  }
  return null
}

/**
 * Multiple selector'ları dener ve ilk bulunan text'i döndürür
 * 
 * @param page - Playwright Page instance
 * @param selectors - Denenecek selector array'i
 * @returns İlk bulunan text veya null
 */
export async function trySelectorsText(
  page: any,
  selectors: readonly string[]
): Promise<string | null> {
  for (const selector of selectors) {
    try {
      const text = await page.textContent(selector)
      if (text && text.trim().length > 0) {
        return text.trim()
      }
    } catch {
      continue
    }
  }
  return null
}

/**
 * Multiple selector'ları dener ve ilk bulunan attribute'u döndürür
 * 
 * @param page - Playwright Page instance
 * @param selectors - Denenecek selector array'i
 * @param attribute - Alınacak attribute adı (örn: 'src', 'href')
 * @returns İlk bulunan attribute değeri veya null
 */
export async function trySelectorsAttribute(
  page: any,
  selectors: readonly string[],
  attribute: string
): Promise<string | null> {
  for (const selector of selectors) {
    try {
      const value = await page.getAttribute(selector, attribute)
      if (value && value.trim().length > 0) {
        return value.trim()
      }
    } catch {
      continue
    }
  }
  return null
}

/**
 * Multiple selector'ları dener ve tüm eşleşen elementleri döndürür
 * 
 * @param page - Playwright Page instance
 * @param selectors - Denenecek selector array'i
 * @returns Bulunan tüm elementler veya boş array
 */
export async function trySelectorsAll(
  page: any,
  selectors: readonly string[]
): Promise<any[]> {
  for (const selector of selectors) {
    try {
      const elements = await page.$$(selector)
      if (elements && elements.length > 0) {
        return elements
      }
    } catch {
      continue
    }
  }
  return []
}

