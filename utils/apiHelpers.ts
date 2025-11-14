/**
 * API Helper Functions
 * Pipeline API çağrıları için yardımcı fonksiyonlar
 */

/**
 * Upload PDF endpoint'ine istek atar
 */
export async function uploadPdf(pdfFile: File, linkedinUrl: string) {
  const formData = new FormData()
  formData.append('pdf', pdfFile)
  formData.append('url', linkedinUrl)

  const response = await fetch('/api/upload-pdf', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'PDF upload failed')
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'PDF upload failed')
  }

  return data.data?.pdfData
}

/**
 * Scrape endpoint'ine istek atar
 */
export async function scrapeProfile(url: string) {
  const response = await fetch('/api/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Scraping failed')
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Scraping failed')
  }

  return data.data
}

/**
 * Merge endpoint'ine istek atar
 */
export async function mergeData(pdfData: any, scrapedData: any, reportId: string) {
  const response = await fetch('/api/merge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pdfData, scrapedData, reportId }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Data merge failed')
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Data merge failed')
  }

  return data.data?.mergedData
}

/**
 * Check endpoint'ine istek atar
 */
export async function checkRules(mergedData: any, reportId: string) {
  const response = await fetch('/api/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mergedData, reportId }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Rule check failed')
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Rule check failed')
  }

  return data.data?.ruleResults
}

/**
 * AI endpoint'ine istek atar
 */
export async function analyzeWithAI(mergedData: any, ruleResults: any, reportId: string) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mergedData, ruleResults, reportId }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'AI analysis failed')
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'AI analysis failed')
  }

  return data.data?.aiFeedback
}

/**
 * Report endpoint'ine istek atar ve reportId döndürür
 */
export async function createReport(
  userId: string,
  linkedinUrl: string,
  pdfData: any,
  scrapedData: any,
  mergedData: any,
  ruleResults: any,
  aiFeedback: any
) {
  const response = await fetch('/api/report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      linkedinUrl,
      pdfData,
      scrapedData,
      mergedData,
      ruleResults,
      aiFeedback,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Report creation failed')
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Report creation failed')
  }

  return data.data?.reportId
}

