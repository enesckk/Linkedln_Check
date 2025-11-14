/**
 * Formatters
 * Veri formatlama ve görüntüleme için yardımcı fonksiyonlar
 */

/**
 * Tarih formatlama
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Tarih ve saat formatlama
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Skor formatlama (0-100)
 */
export function formatScore(score: number): string {
  return `${Math.round(score)}/100`
}

/**
 * Kelime sayısı formatlama
 */
export function formatWordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

/**
 * LinkedIn URL'den profil adını çıkar
 */
export function extractProfileName(url: string): string {
  const match = url.match(/linkedin\.com\/in\/([^/?]+)/)
  return match ? match[1] : 'Bilinmeyen Profil'
}

/**
 * Dosya boyutu formatlama
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Bağlantı sayısı formatlama (500+ gibi)
 */
export function formatConnections(count: number): string {
  if (count >= 500) return '500+'
  return count.toString()
}

