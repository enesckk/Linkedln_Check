/**
 * Normalization Utility
 * String temizleme ve normalizasyon fonksiyonları
 */

/**
 * String'i temizler ve normalize eder
 * - Trim yapar
 * - Boş string'leri null'a çevirir
 * - Whitespace'leri normalize eder
 * 
 * @param str - Temizlenecek string
 * @returns Temizlenmiş string veya null
 */
export function normalizeString(str: string | null | undefined): string | null {
  if (!str || typeof str !== 'string') {
    return null
  }

  const trimmed = str.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * String'den sayı çıkarır
 * "500+" → 500
 * "1,234" → 1234
 * "500 connections" → 500
 * 
 * @param str - Parse edilecek string
 * @returns Sayı veya null
 */
export function extractNumber(str: string | null | undefined): number | null {
  if (!str) return null

  try {
    // "+" işaretini ve "connections" gibi kelimeleri kaldır
    const cleaned = str.replace(/[^\d,]/g, '').replace(/,/g, '')
    const num = parseInt(cleaned, 10)
    return isNaN(num) ? null : num
  } catch {
    return null
  }
}

/**
 * URL'i normalize eder
 * - Relative URL'leri absolute'e çevirir
 * - Query parametrelerini temizler (opsiyonel)
 * 
 * @param url - Normalize edilecek URL
 * @param baseUrl - Base URL (relative URL'ler için)
 * @returns Normalize edilmiş URL veya null
 */
export function normalizeUrl(url: string | null | undefined, baseUrl?: string): string | null {
  if (!url) return null

  try {
    const trimmed = url.trim()
    if (trimmed.length === 0) return null

    // Absolute URL ise direkt döndür
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed
    }

    // Relative URL ise base URL ile birleştir
    if (baseUrl) {
      try {
        const base = new URL(baseUrl)
        return new URL(trimmed, base).href
      } catch {
        return null
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Array'i normalize eder
 * - Boş array'leri null'a çevirir
 * - Null/undefined'ı null'a çevirir
 * 
 * @param arr - Normalize edilecek array
 * @returns Normalize edilmiş array veya null
 */
export function normalizeArray<T>(arr: T[] | null | undefined): T[] | null {
  if (!arr || !Array.isArray(arr)) {
    return null
  }

  return arr.length > 0 ? arr : null
}

/**
 * Image URL'den resolution bilgisi çıkarır
 * LinkedIn image URL'lerinde genellikle width/height parametreleri vardır
 * 
 * @param url - Image URL
 * @returns Resolution string (örn: "400x400") veya null
 */
export function extractImageResolution(url: string | null | undefined): string | null {
  if (!url) return null

  try {
    const urlObj = new URL(url)
    
    // LinkedIn image URL formatı: .../profile-displayphoto-shrink_400_400/...
    const match = url.match(/shrink_(\d+)_(\d+)/)
    if (match) {
      return `${match[1]}x${match[2]}`
    }

    // Query parametrelerinden width/height kontrolü
    const width = urlObj.searchParams.get('w') || urlObj.searchParams.get('width')
    const height = urlObj.searchParams.get('h') || urlObj.searchParams.get('height')
    
    if (width && height) {
      return `${width}x${height}`
    }

    return null
  } catch {
    return null
  }
}

/**
 * String'den HTML tag'lerini temizler
 * 
 * @param html - HTML içeren string
 * @returns Temizlenmiş text
 */
export function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null

  try {
    // Basit HTML tag temizleme (regex ile)
    return html.replace(/<[^>]*>/g, '').trim() || null
  } catch {
    return html
  }
}

