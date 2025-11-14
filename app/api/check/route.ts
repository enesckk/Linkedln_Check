import { NextRequest, NextResponse } from 'next/server'
import { checkRules } from '@/lib/core/ruleEngine'
import type { MergedData, RuleResults } from '@/utils/types'

/**
 * POST /api/check
 * 
 * Merged data üzerinde rule engine'i çalıştırır
 * Checklist mantığı ile belirli kuralları kontrol eder
 * 
 * Request body:
 * {
 *   mergedData: MergedData,
 *   reportId: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data?: { ruleResults: RuleResults },
 *   error?: string
 * }
 */

interface CheckRequest {
  mergedData: MergedData
  reportId: string
}

interface CheckResponse {
  success: boolean
  data?: {
    ruleResults: RuleResults
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<CheckResponse>> {
  try {
    // Request body'yi parse et
    const body: CheckRequest = await request.json()
    const { mergedData, reportId } = body

    // Validation
    if (!mergedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Merged data zorunludur.',
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

    // Rule engine'i çalıştır
    const ruleResults = checkRules(mergedData)

    return NextResponse.json({
      success: true,
      data: {
        ruleResults,
      },
    })
  } catch (error) {
    console.error('Rule check error:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Kural kontrolü sırasında bir hata oluştu.'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
