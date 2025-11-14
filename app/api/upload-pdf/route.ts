import { NextRequest, NextResponse } from 'next/server'
import { parsePdf } from '@/lib/core/pdfParser'
import type { PdfData } from '@/utils/types'

/**
 * POST /api/upload-pdf
 * 
 * LinkedIn PDF Export dosyasını alır ve parse eder
 * 
 * Request: multipart/form-data
 * - pdf: File
 * - url: string (LinkedIn profil URL'i)
 * 
 * Response:
 * {
 *   success: boolean,
 *   data?: { pdfData: PdfData },
 *   error?: string
 * }
 */

interface UploadPdfRequest {
  pdf: File
  url: string
}

interface UploadPdfResponse {
  success: boolean
  data?: {
    pdfData: PdfData
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadPdfResponse>> {
  try {
    // Form data'yı al
    const formData = await request.formData()
    const pdfFile = formData.get('pdf') as File | null
    const linkedinUrl = formData.get('url') as string | null

    // Validation
    if (!pdfFile || !linkedinUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'PDF dosyası ve LinkedIn URL zorunludur.',
        },
        { status: 400 }
      )
    }

    // PDF dosyasını buffer'a çevir
    const arrayBuffer = await pdfFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // PDF'i parse et
    const pdfData = await parsePdf({ file: buffer })

    return NextResponse.json({
      success: true,
      data: {
        pdfData,
      },
    })
  } catch (error) {
    console.error('PDF upload error:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'PDF işleme sırasında bir hata oluştu.'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
