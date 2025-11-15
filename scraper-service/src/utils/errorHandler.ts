/**
 * Error Handler Utility
 * Hata yönetimi ve formatlama için yardımcı fonksiyonlar
 */

import { Request, Response, NextFunction } from 'express'

/**
 * API hata response formatı
 */
export interface ApiError {
  success: false
  error: string
  code?: string
}

/**
 * Başarılı API response formatı
 */
export interface ApiSuccess<T> {
  success: true
  data: T
}

/**
 * Hata response'u gönderir
 * 
 * @param res - Express response objesi
 * @param message - Hata mesajı
 * @param statusCode - HTTP status code (default: 500)
 * @param code - Hata kodu (opsiyonel)
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string
): void {
  const errorResponse: ApiError = {
    success: false,
    error: message,
    ...(code && { code }),
  }

  res.status(statusCode).json(errorResponse)
}

/**
 * Başarılı response'u gönderir
 * 
 * @param res - Express response objesi
 * @param data - Response data
 * @param statusCode - HTTP status code (default: 200)
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200
): void {
  const successResponse: ApiSuccess<T> = {
    success: true,
    data,
  }

  res.status(statusCode).json(successResponse)
}

/**
 * Express error handler middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err)
  sendError(res, err.message || 'Internal server error', 500)
}

