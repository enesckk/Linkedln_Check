/**
 * URL Validation Utility
 * LinkedIn profil URL'lerini doğrular
 */

/**
 * LinkedIn profil URL'sinin geçerli olup olmadığını kontrol eder
 * 
 * @param url - Kontrol edilecek URL
 * @returns URL geçerliyse true, değilse false
 */
export function validateLinkedInUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  try {
    const urlObj = new URL(url)
    
    // LinkedIn domain kontrolü
    const isValidDomain = 
      urlObj.hostname === 'www.linkedin.com' || 
      urlObj.hostname === 'linkedin.com'
    
    // Profil path kontrolü (/in/ ile başlamalı)
    const isValidPath = urlObj.pathname.startsWith('/in/')
    
    return isValidDomain && isValidPath
  } catch {
    return false
  }
}

/**
 * URL'den profil kullanıcı adını çıkarır
 * 
 * @param url - LinkedIn profil URL'i
 * @returns Profil kullanıcı adı veya null
 */
export function extractProfileSlug(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const match = urlObj.pathname.match(/\/in\/([^/?]+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

