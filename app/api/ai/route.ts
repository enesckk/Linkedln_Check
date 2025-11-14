import { NextRequest, NextResponse } from 'next/server'
import { evaluateWithAI } from '@/lib/core/aiEngine'
import type { MergedData, RuleResults, AiFeedback } from '@/utils/types'

/**
 * POST /api/ai
 * 
 * Merged data ve rule results üzerinde AI değerlendirmesi yapar
 * Gemini veya GPT API kullanır
 * 
 * AI görevleri:
 * - merged_data yorumlama
 * - rule_results üzerinden eksik analizi
 * - profesyonellik skoru (0-100)
 * - headline önerisi
 * - about önerisi
 * - genel değerlendirme
 * 
 * Request body:
 * {
 *   mergedData: MergedData,
 *   ruleResults?: RuleResults,
 *   reportId: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data?: { aiFeedback: AiFeedback },
 *   error?: string
 * }
 */

interface AiRequest {
  mergedData: MergedData
  ruleResults?: RuleResults
  reportId: string
}

interface AiResponse {
  success: boolean
  data?: {
    aiFeedback: AiFeedback
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<AiResponse>> {
  try {
    // Request body'yi parse et
    const body: AiRequest = await request.json()
    const { mergedData, ruleResults, reportId } = body

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

    // Validation: ruleResults zorunlu
    if (!ruleResults) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rule results zorunludur.',
        },
        { status: 400 }
      )
    }

    // AI değerlendirmesi
    const aiOutput = await evaluateWithAI({
      merged: mergedData,
      rules: ruleResults,
    })

    // AiFeedback formatına dönüştür (zaten aynı format)
    const aiFeedback: AiFeedback = {
      headlineSuggestion: aiOutput.headlineSuggestion,
      aboutSuggestion: aiOutput.aboutSuggestion,
      overallFeedback: aiOutput.overallFeedback,
      aiScore: aiOutput.aiScore,
      insights: aiOutput.insights,
    }

    return NextResponse.json({
      success: true,
      data: {
        aiFeedback,
      },
    })
  } catch (error) {
    console.error('AI evaluation error:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'AI değerlendirmesi sırasında bir hata oluştu.'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
