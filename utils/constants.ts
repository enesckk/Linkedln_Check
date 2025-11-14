/**
 * Constants
 * Proje genelinde kullanılan sabitler
 */

/**
 * Rule Engine Constants
 * Kural kontrolü için minimum değerler
 */
export const RULE_CONSTANTS = {
  HEADLINE_MIN_LENGTH: 10,
  ABOUT_MIN_WORDS: 40,
  SKILLS_MIN_COUNT: 5, // Updated: 5 skills minimum
  CONNECTIONS_MIN_COUNT: 500,
  EXPERIENCE_DESCRIPTION_MIN_WORDS: 20,
} as const

/**
 * File Upload Constants
 */
export const FILE_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['application/pdf'],
} as const

/**
 * API Constants
 */
export const API_CONSTANTS = {
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
} as const

/**
 * Score Constants
 */
export const SCORE_CONSTANTS = {
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  EXCELLENT_THRESHOLD: 80,
  GOOD_THRESHOLD: 60,
  AVERAGE_THRESHOLD: 40,
} as const

/**
 * Report Status Constants
 */
export const REPORT_STATUS = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

/**
 * AI Provider Constants
 */
export const AI_PROVIDERS = {
  GEMINI: 'gemini',
  OPENAI: 'openai',
} as const

