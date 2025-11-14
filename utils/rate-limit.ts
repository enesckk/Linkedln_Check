/**
 * Rate Limiting Utility
 * API endpoint'lerinde rate limiting için kullanılır
 * In-memory store (production'da Redis önerilir)
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()

/**
 * Rate limit kontrolü yapar
 * 
 * @param identifier - Client identifier (IP, user ID, vb.)
 * @param maxRequests - Maksimum istek sayısı (default: 10)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 dakika)
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  // Yeni kayıt veya window süresi dolmuş
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return true
  }

  // Rate limit aşılmış
  if (record.count >= maxRequests) {
    return false
  }

  // İstek sayısını artır
  record.count++
  return true
}

/**
 * Rate limit bilgisini getirir
 * 
 * @param identifier - Client identifier
 * @returns Remaining requests ve reset time
 */
export function getRateLimitInfo(identifier: string): {
  remaining: number
  resetTime: number
} | null {
  const record = rateLimitMap.get(identifier)
  if (!record) return null

  return {
    remaining: Math.max(0, 10 - record.count), // Default maxRequests = 10
    resetTime: record.resetTime,
  }
}

/**
 * Rate limit map'ini temizler (eski kayıtlar)
 * Production'da Redis kullanıldığında gerekli değil
 */
export function cleanupRateLimit() {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

// Her 5 dakikada bir cleanup çalıştır
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimit, 5 * 60 * 1000)
}

