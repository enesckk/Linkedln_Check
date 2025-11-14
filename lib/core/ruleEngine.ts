// Core logic module for LinkedIn Analyzer
// Clean-code, modular, type-safe skeleton
// Implementations will be added in next steps

/**
 * Rule Engine Module
 * Merged data üzerinde checklist kurallarını çalıştırır
 * Her kural için boolean sonuç döndürür ve rule-based score hesaplar
 */

import type { MergedData } from './mergeEngine'
import { RULE_CONSTANTS } from '@/utils/constants'

// Output interface
export interface RuleResults {
  results: Record<string, boolean>
  score: number
}

/**
 * Main function: Evaluate rules on merged data
 * 19 kuralı kontrol eder ve score hesaplar
 * 
 * @param merged - Merged data to evaluate
 * @returns Rule evaluation results with score (0-100)
 */
export function evaluateRules(merged: MergedData): RuleResults {
  try {
    // Validation
    if (!merged || typeof merged !== 'object') {
      throw new Error('Invalid merged data provided')
    }

    // Helper: Kelime sayısını hesapla
    const getWordCount = (text: string | null | undefined): number => {
      if (!text || typeof text !== 'string') return 0
      return text.split(/\s+/).filter(Boolean).length
    }

    // Helper: İngilizce keyword kontrolü
    const hasEnglishKeywords = (text: string | null | undefined): boolean => {
      if (!text || typeof text !== 'string') return false
      const lowerText = text.toLowerCase()
      const englishKeywords = ['experience', 'education', 'about', 'skills', 'work', 'professional', 'career']
      return englishKeywords.some(keyword => lowerText.includes(keyword))
    }

    // Helper: Portfolio link kontrolü
    const hasPortfolioLink = (): boolean => {
      if (merged.hasPortfolioLink === true) return true
      
      if (merged.featured && Array.isArray(merged.featured)) {
        const portfolioKeywords = ['github.com', 'vercel.app', 'portfolio', 'behance', 'dribbble', 'personal website']
        return merged.featured.some(item => {
          const url = item.url?.toLowerCase() || ''
          return portfolioKeywords.some(keyword => url.includes(keyword))
        })
      }
      
      return false
    }

    // Helper: Experience chronological kontrolü
    const isExperienceChronological = (): boolean => {
      if (!merged.experiences || !Array.isArray(merged.experiences) || merged.experiences.length === 0) {
        return false
      }

      try {
        const sorted = [...merged.experiences].sort((a, b) => {
          const dateA = a.endDate || a.startDate || ''
          const dateB = b.endDate || b.startDate || ''
          
          // Tarihleri parse et (YYYY-MM veya YYYY formatı)
          const parseDate = (dateStr: string): number => {
            if (!dateStr) return 0
            const parts = dateStr.split('-')
            const year = parseInt(parts[0]) || 0
            const month = parseInt(parts[1]) || 0
            return year * 12 + month
          }

          return parseDate(dateB) - parseDate(dateA) // En yeni önce
        })

        // Orijinal sıralama ile karşılaştır
        return JSON.stringify(sorted) === JSON.stringify(merged.experiences)
      } catch {
        return false
      }
    }

    // Helper: Experience descriptive kontrolü
    const isExperienceDescriptive = (): boolean => {
      if (!merged.experiences || !Array.isArray(merged.experiences)) {
        return false
      }

      if (merged.experiences.length === 0) {
        return false
      }

      // Her deneyimde en az 20 kelime var mı kontrol et
      const hasDescriptiveExperiences = merged.experiences.some(exp => {
        const desc = exp.description || ''
        return getWordCount(desc) >= RULE_CONSTANTS.EXPERIENCE_DESCRIPTION_MIN_WORDS
      })

      // Veya toplam deneyim sayısı >= 1 (zaten kontrol edildi)
      return hasDescriptiveExperiences || merged.experiences.length >= 1
    }

    // ============================================
    // 19 KURAL KONTROLÜ
    // ============================================

    // 1) url_customized
    const url_customized = merged.customUrlClean === true

    // 2) profile_photo_present
    // profilePhoto string veya object olabilir
    const profile_photo_present = (() => {
      if (!merged.profilePhoto) return false
      if (typeof merged.profilePhoto === 'string') {
        return merged.profilePhoto !== ''
      }
      if (typeof merged.profilePhoto === 'object') {
        return (merged.profilePhoto as any)?.url != null && (merged.profilePhoto as any)?.url !== ''
      }
      return false
    })()

    // 3) banner_present
    const banner_present = merged.bannerUrl != null && merged.bannerUrl !== ''

    // 4) english_profile
    const english_profile = hasEnglishKeywords(merged.about) || hasEnglishKeywords(merged.headline)

    // 5) headline_descriptive
    const headline_descriptive = (merged.headline?.length || 0) >= RULE_CONSTANTS.HEADLINE_MIN_LENGTH

    // 6) location_present
    const location_present = merged.location != null && merged.location !== ''

    // 7) about_length_ok
    const about_length_ok = getWordCount(merged.about) >= RULE_CONSTANTS.ABOUT_MIN_WORDS

    // 8) featured_used
    const featured_used = merged.featured != null && Array.isArray(merged.featured) && merged.featured.length > 0

    // 9) portfolio_link_present
    const portfolio_link_present = hasPortfolioLink()

    // 10) connections_500
    const connections_500 = (merged.connections || 0) >= RULE_CONSTANTS.CONNECTIONS_MIN_COUNT

    // 11) experience_chronological
    const experience_chronological = isExperienceChronological()

    // 12) experience_descriptive
    const experience_descriptive = isExperienceDescriptive()

    // 13) experience_media_present
    const experience_media_present = merged.media != null && Array.isArray(merged.media) && merged.media.length > 0

    // 14) education_present
    const education_present = merged.education != null && Array.isArray(merged.education) && merged.education.length > 0

    // 15) certifications_present
    const certifications_present = merged.certifications != null && Array.isArray(merged.certifications) && merged.certifications.length > 0

    // 16) projects_present
    const projects_present = merged.projects != null && Array.isArray(merged.projects) && merged.projects.length > 0

    // 17) skills_present
    const skills_present = merged.skills != null && Array.isArray(merged.skills) && merged.skills.length >= 5

    // 18) skills_endorsed
    const skills_endorsed = merged.endorsedSkills != null && Array.isArray(merged.endorsedSkills) && merged.endorsedSkills.length > 0

    // 19) languages_present
    const languages_present = merged.languages != null && Array.isArray(merged.languages) && merged.languages.length > 0

    // ============================================
    // RESULTS OBJESİNİ OLUŞTUR
    // ============================================
    const results: Record<string, boolean> = {
      url_customized,
      profile_photo_present,
      banner_present,
      english_profile,
      headline_descriptive,
      location_present,
      about_length_ok,
      featured_used,
      portfolio_link_present,
      connections_500,
      experience_chronological,
      experience_descriptive,
      experience_media_present,
      education_present,
      certifications_present,
      projects_present,
      skills_present,
      skills_endorsed,
      languages_present,
    }

    // ============================================
    // SCORE HESAPLAMA
    // ============================================
    const totalRules = Object.keys(results).length // 19
    const passedRules = Object.values(results).filter(passed => passed === true).length
    const score = Math.round((passedRules / totalRules) * 100)

    return {
      results,
      score,
    }
  } catch (error) {
    console.error('Rule evaluation error:', error)
    throw new Error(
      error instanceof Error
        ? `Rule evaluation failed: ${error.message}`
        : 'Rule evaluation failed with unknown error'
    )
  }
}

// Alias for backward compatibility with API routes
export const checkRules = evaluateRules
