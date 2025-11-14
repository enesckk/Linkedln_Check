import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import type { MergedData, RuleResults, AiFeedback } from '@/utils/types'

/**
 * GET /api/report?reportId=xxx
 * Belirli bir raporu getirir
 * 
 * POST /api/report
 * Final report oluşturur ve tüm verileri DB'ye kaydeder
 * 
 * Request body (POST):
 * {
 *   userId: string,
 *   linkedinUrl: string,
 *   pdfData?: any,
 *   scrapedData?: any,
 *   mergedData: MergedData,
 *   ruleResults: RuleResults,
 *   aiFeedback: AiFeedback
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data?: { reportId: string } | { report: any },
 *   error?: string
 * }
 */

interface CreateReportRequest {
  userId: string
  linkedinUrl: string
  pdfData?: any
  scrapedData?: any
  mergedData: MergedData
  ruleResults: RuleResults
  aiFeedback: AiFeedback
}

interface ReportResponse {
  success: boolean
  data?: {
    reportId?: string
    report?: any
  }
  error?: string
}

/**
 * GET /api/report?reportId=xxx
 * Raporu getir
 */
export async function GET(request: NextRequest): Promise<NextResponse<ReportResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams
    const reportId = searchParams.get('reportId')

    // Validation
    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report ID gerekli.',
        },
        { status: 400 }
      )
    }

    // TODO: Prisma ile raporu çek
    // const report = await db.report.findUnique({
    //   where: { id: reportId },
    //   include: {
    //     pdfRawData: true,
    //     scrapedRawData: true,
    //     mergedData: true,
    //     ruleResults: true,
    //     aiFeedback: true,
    //   }
    // })

    // if (!report) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: 'Rapor bulunamadı.',
    //     },
    //     { status: 404 }
    //   )
    // }

    return NextResponse.json({
      success: true,
      data: {
        // report
      },
    })
  } catch (error) {
    console.error('Get report error:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Rapor getirilirken bir hata oluştu.'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/report
 * Final report oluştur ve DB'ye kaydet
 */
export async function POST(request: NextRequest): Promise<NextResponse<ReportResponse>> {
  try {
    // Request body'yi parse et
    const body: CreateReportRequest = await request.json()
    const { userId, linkedinUrl, pdfData, scrapedData, mergedData, ruleResults, aiFeedback } = body

    // Validation
    if (!userId || !linkedinUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID ve LinkedIn URL zorunludur.',
        },
        { status: 400 }
      )
    }

    if (!mergedData || !ruleResults || !aiFeedback) {
      return NextResponse.json(
        {
          success: false,
          error: 'Merged data, rule results ve AI feedback zorunludur.',
        },
        { status: 400 }
      )
    }

    // TODO: Transaction ile tüm verileri DB'ye kaydet
    // const report = await db.$transaction(async (tx) => {
    //   // 1. Report oluştur
    //   const newReport = await tx.report.create({
    //     data: {
    //       userId,
    //       linkedinUrl,
    //       status: 'completed',
    //     },
    //   })
    //
    //   // 2. PDF Raw Data kaydet
    //   if (pdfData) {
    //     await tx.pdfRawData.create({
    //       data: {
    //         reportId: newReport.id,
    //         ...pdfData,
    //       },
    //     })
    //   }
    //
    //   // 3. Scraped Raw Data kaydet
    //   if (scrapedData) {
    //     await tx.scrapedRawData.create({
    //       data: {
    //         reportId: newReport.id,
    //         ...scrapedData,
    //       },
    //     })
    //   }
    //
    //   // 4. Merged Data kaydet
    //   await tx.mergedData.create({
    //     data: {
    //       reportId: newReport.id,
    //       ...mergedData,
    //     },
    //   })
    //
    //   // 5. Rule Results kaydet
    //   await tx.ruleResults.create({
    //     data: {
    //       reportId: newReport.id,
    //       results: ruleResults,
    //       score: calculateRuleScore(ruleResults),
    //     },
    //   })
    //
    //   // 6. AI Feedback kaydet
    //   await tx.aiFeedback.create({
    //     data: {
    //       reportId: newReport.id,
    //       headlineSuggestion: aiFeedback.headlineSuggestion,
    //       aboutSuggestion: aiFeedback.aboutSuggestion,
    //       overallFeedback: aiFeedback.generalEvaluation,
    //       aiScore: aiFeedback.score,
    //       insights: aiFeedback.missingPoints,
    //     },
    //   })
    //
    //   return newReport
    // })

    // Placeholder response
    return NextResponse.json({
      success: true,
      data: {
        // reportId: report.id
      },
    })
  } catch (error) {
    console.error('Create report error:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Rapor oluşturulurken bir hata oluştu.'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
