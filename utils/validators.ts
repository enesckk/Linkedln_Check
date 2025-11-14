import { z } from 'zod'

/**
 * Validators
 * Form ve API input validasyonları için Zod schema'ları
 */

/**
 * LinkedIn URL Validator
 */
export const linkedinUrlSchema = z
  .string()
  .url('Geçerli bir URL girin')
  .refine(
    (url) => url.includes('linkedin.com/in/'),
    'LinkedIn profil URL\'i olmalı (linkedin.com/in/...)'
  )

/**
 * PDF File Validator
 */
export const pdfFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.type === 'application/pdf',
    'Sadece PDF dosyaları kabul edilir'
  )
  .refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB
    'Dosya boyutu en fazla 10MB olabilir'
  )

/**
 * Upload Request Validator
 */
export const uploadRequestSchema = z.object({
  pdf: pdfFileSchema,
  url: linkedinUrlSchema,
})

/**
 * Scrape Request Validator
 */
export const scrapeRequestSchema = z.object({
  url: linkedinUrlSchema,
  reportId: z.string().optional(),
})

/**
 * Merge Request Validator
 */
export const mergeRequestSchema = z.object({
  pdfData: z.any().optional(),
  scrapedData: z.any().optional(),
  reportId: z.string(),
})

/**
 * Check Request Validator
 */
export const checkRequestSchema = z.object({
  mergedData: z.any(),
  reportId: z.string(),
})

/**
 * AI Request Validator
 */
export const aiRequestSchema = z.object({
  mergedData: z.any(),
  ruleResults: z.any().optional(),
  reportId: z.string(),
})

/**
 * Report Request Validator
 */
export const reportRequestSchema = z.object({
  userId: z.string(),
  linkedinUrl: linkedinUrlSchema,
})

