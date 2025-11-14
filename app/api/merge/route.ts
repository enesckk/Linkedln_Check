import { NextRequest, NextResponse } from 'next/server'
import { mergeData } from '@/lib/core/mergeEngine'
import type { PdfParsedData } from '@/lib/core/pdfParser'
import type { ScrapedData } from '@/lib/core/scraperClient'
import type { MergedData } from '@/lib/core/mergeEngine'

/**
 * POST /api/merge
 * 
 * PDF data ve scraped data'yı birleştirir (Data Fusion)
 * Mantık: PDF varsa öncelikli, PDF'de olmayan alanlar scraping'den alınır
 * 
 * Request body:
 * {
 *   pdfData?: PdfData,
 *   scrapedData?: ScrapedData,
 *   reportId: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data?: { mergedData: MergedData },
 *   error?: string
 * }
 */

interface MergeRequest {
  pdfData?: PdfParsedData | null
  scrapedData?: ScrapedData | null
  reportId: string
}

interface MergeResponse {
  success: boolean
  data?: {
    mergedData: MergedData
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<MergeResponse>> {
  try {
    // Request body'yi parse et
    const body: MergeRequest = await request.json()
    const { pdfData, scrapedData, reportId } = body

    // Validation
    if (!pdfData && !scrapedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'En az bir veri kaynağı (PDF veya scraped) gerekli.',
        },
        { status: 400 }
      )
    }

    if (!reportId || typeof reportId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Report ID zorunludur.',
        },
        { status: 400 }
      )
    }

    // Veri füzyonu işlemi
    const mergedData = mergeData({ pdf: pdfData, scraped: scrapedData })

    return NextResponse.json({
      success: true,
      data: {
        mergedData,
      },
    })
  } catch (error) {
    console.error('Merge error:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Veri birleştirme işlemi sırasında bir hata oluştu.'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
