// Core logic module for LinkedIn Analyzer
// Clean-code, modular, type-safe implementation

/**
 * AI Engine Module
 * Merged data ve rule results üzerinde AI değerlendirmesi yapar
 * Gemini veya GPT API kullanarak öneriler ve feedback üretir
 */

import type { MergedData } from './mergeEngine'
import type { RuleResults } from './ruleEngine'

// Input interface
export interface AiInput {
  merged: MergedData
  rules: RuleResults
}

// Output interface
export interface AiOutput {
  headlineSuggestion?: string
  aboutSuggestion?: string
  overallFeedback?: string
  aiScore?: number
  insights?: {
    strengths: string[]
    improvements: string[]
  }
}

/**
 * Main function: Analyze profile with AI
 * 
 * @param input - Merged data and rule results
 * @returns AI-generated feedback and suggestions
 */
export async function analyzeProfile(input: AiInput): Promise<AiOutput> {
  try {
    const { merged, rules } = input

    // Validation
    if (!merged || typeof merged !== 'object') {
      throw new Error('Invalid merged data provided')
    }

    if (!rules || typeof rules !== 'object') {
      throw new Error('Invalid rule results provided')
    }

    // Determine AI provider from environment
    const aiProvider = (process.env.AI_PROVIDER || 'gemini').toLowerCase()

    // Build evaluation prompt
    const prompt = buildEvaluationPrompt(merged, rules)

    // Call AI API based on provider
    let aiResponse: AiOutput

    if (aiProvider === 'gemini') {
      aiResponse = await callGeminiAPI(prompt, rules.score)
    } else if (aiProvider === 'openai') {
      aiResponse = await callOpenAIAPI(prompt, rules.score)
    } else {
      throw new Error(`Unsupported AI provider: ${aiProvider}`)
    }

    return aiResponse
  } catch (error) {
    console.error('AI analysis error:', error)
    
    // Fallback response
    return {
      headlineSuggestion: 'Profesyonel Başlık Önerisi',
      aboutSuggestion: 'Profiliniz hakkında detaylı bir açıklama yazın.',
      overallFeedback: 'AI analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.',
      aiScore: 50,
      insights: {
        strengths: [],
        improvements: ['AI analizi tamamlanamadı. Lütfen tekrar deneyin.'],
      },
    }
  }
}

/**
 * Build evaluation prompt for AI
 * Türkçe, profesyonel, detaylı prompt oluşturur
 */
function buildEvaluationPrompt(merged: MergedData, rules: RuleResults): string {
  // Merged data'yı string'e çevir
  const mergedDataStr = JSON.stringify(merged, null, 2)
  const ruleResultsStr = JSON.stringify(rules, null, 2)

  // Rule results'dan başarılı/başarısız kuralları çıkar
  const passedRules = Object.entries(rules.results)
    .filter(([_, passed]) => passed)
    .map(([rule]) => rule)
  const failedRules = Object.entries(rules.results)
    .filter(([_, passed]) => !passed)
    .map(([rule]) => rule)

  return `Sen bir Senior Career Consultant, LinkedIn Optimization Expert ve Professional Branding Mentor'sun.

Görevin: Bir LinkedIn profilini analiz etmek ve profesyonel öneriler sunmak.

PROFİL VERİLERİ:
${mergedDataStr}

KURAL SONUÇLARI:
- Toplam Skor: ${rules.score}/100
- Geçen Kurallar: ${passedRules.length}/19
- Geçmeyen Kurallar: ${failedRules.length}/19
- Geçmeyen Kurallar Listesi: ${failedRules.join(', ')}

GÖREVLERİN:

1. Mevcut profili değerlendir ve profesyonel bir analiz yap.

2. Eksik alanları açıkla (geçmeyen kurallara göre).

3. Yeni bir HEADLINE öner:
   - Kısa, net, profesyonel
   - Format: "Rol | Yetkinlik | Değer önerisi"
   - Örnek: "Software Engineer | Cloud & AI | Scalable Solutions"
   - 80 karakteri geçmemeli
   - Gereksiz kelime kullanma

4. 4 paragraf ideal bir ABOUT kısmı yaz:
   - 1. Paragraf: Kim olduğunu anlat (rol, deneyim yılı)
   - 2. Paragraf: Teknik yetenekleri vurgula (skills, teknolojiler)
   - 3. Paragraf: Başarıları / projeleri belirt (experience, projects)
   - 4. Paragraf: Kariyer hedefini yaz (ne yapmak istiyor, nasıl değer katıyor)
   - Job description gibi değil, kişisel marka yazısı gibi olmalı
   - Profesyonel ama samimi bir üslup

5. Profilin güçlü yanlarını listele (3-5 madde).

6. Geliştirilmesi gereken alanları listele (3-5 madde).

7. 0-100 arasında "AI Professionalism Score" üret:
   - Profil bütünlüğü
   - Deneyim açıklığı
   - About kalitesi
   - Skills uyumu
   - Profesyonel görünüm
   - RuleResults.score'u dikkate al (%50 ağırlık)
   - Final Score = (rules.score * 0.5) + (AI değerlendirme * 0.5)

8. Genel feedback yaz (2-3 cümle, profesyonel ve yapıcı).

ÖNEMLİ: Yalnızca aşağıdaki JSON formatında çıktı döndür. Başka hiçbir şey yazma:

{
  "headlineSuggestion": "string",
  "aboutSuggestion": "string (4 paragraf, \\n\\n ile ayrılmış)",
  "overallFeedback": "string",
  "aiScore": number (0-100),
  "insights": {
    "strengths": ["string", "string", ...],
    "improvements": ["string", "string", ...]
  }
}

Sadece JSON döndür, başka hiçbir açıklama yapma.`
}

/**
 * Call Gemini API
 * Google Gemini API'yi çağırır ve response'u parse eder
 */
async function callGeminiAPI(prompt: string, ruleScore: number): Promise<AiOutput> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }

  try {
    // Gemini API endpoint (v1beta)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    // Extract text from Gemini response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      throw new Error('No text in Gemini response')
    }

    // Parse JSON from response
    const parsed = parseAIResponse(text, ruleScore)
    return parsed
  } catch (error) {
    console.error('Gemini API error:', error)
    throw error
  }
}

/**
 * Call OpenAI API
 * OpenAI GPT API'yi çağırır ve response'u parse eder
 */
async function callOpenAIAPI(prompt: string, ruleScore: number): Promise<AiOutput> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }

  try {
    // OpenAI API endpoint
    const apiUrl = 'https://api.openai.com/v1/chat/completions'

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Sen bir Senior Career Consultant, LinkedIn Optimization Expert ve Professional Branding Mentor\'sun. Yalnızca JSON formatında yanıt ver.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    // Extract text from OpenAI response
    const text = data.choices?.[0]?.message?.content
    if (!text) {
      throw new Error('No text in OpenAI response')
    }

    // Parse JSON from response
    const parsed = parseAIResponse(text, ruleScore)
    return parsed
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

/**
 * Parse AI response and extract JSON
 * AI response'undan JSON'u çıkarır ve validate eder
 */
function parseAIResponse(text: string, ruleScore: number): AiOutput {
  try {
    // JSON'u text'ten çıkar (markdown code block varsa temizle)
    let jsonText = text.trim()

    // Markdown code block'ları temizle
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    // JSON parse et
    const parsed = JSON.parse(jsonText)

    // Validate and normalize output
    const output: AiOutput = {
      headlineSuggestion: parsed.headlineSuggestion || 'Profesyonel Başlık Önerisi',
      aboutSuggestion: parsed.aboutSuggestion || 'Profiliniz hakkında detaylı bir açıklama yazın.',
      overallFeedback: parsed.overallFeedback || 'Profil analizi tamamlandı.',
      aiScore: calculateFinalScore(parsed.aiScore, ruleScore),
      insights: {
        strengths: Array.isArray(parsed.insights?.strengths)
          ? parsed.insights.strengths
          : [],
        improvements: Array.isArray(parsed.insights?.improvements)
          ? parsed.insights.improvements
          : [],
      },
    }

    // Validate score range
    if (output.aiScore !== undefined) {
      output.aiScore = Math.max(0, Math.min(100, output.aiScore))
    }

    return output
  } catch (error) {
    console.error('Error parsing AI response:', error)
    console.error('Raw response:', text)

    // Fallback response
    return {
      headlineSuggestion: 'Profesyonel Başlık Önerisi',
      aboutSuggestion: 'Profiliniz hakkında detaylı bir açıklama yazın.',
      overallFeedback: 'AI analizi sırasında bir hata oluştu.',
      aiScore: calculateFinalScore(50, ruleScore),
      insights: {
        strengths: [],
        improvements: ['AI yanıtı parse edilemedi.'],
      },
    }
  }
}

/**
 * Calculate final AI score
 * Rule score'un %50'si + AI değerlendirmenin %50'si
 */
function calculateFinalScore(aiScore: number | undefined, ruleScore: number): number {
  // AI score yoksa veya geçersizse, sadece rule score kullan
  if (typeof aiScore !== 'number' || isNaN(aiScore) || aiScore < 0 || aiScore > 100) {
    return ruleScore
  }

  // Final score = (ruleScore * 0.5) + (aiScore * 0.5)
  const finalScore = ruleScore * 0.5 + aiScore * 0.5

  // 0-100 aralığına normalize et
  return Math.max(0, Math.min(100, Math.round(finalScore)))
}

// Alias for backward compatibility with API routes
export const evaluateWithAI = analyzeProfile
