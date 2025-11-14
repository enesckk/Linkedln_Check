'use client'

import { useState, useEffect } from 'react'
import { linkedinUrlSchema } from '@/utils/validators'

/**
 * UrlInput Component
 * LinkedIn profil URL'i girişi için kullanılır
 * Real-time validation ile hata gösterimi
 * 
 * Props:
 * - value: string
 * - onChange: (url: string) => void
 * - error?: string
 */
interface UrlInputProps {
  value: string
  onChange: (url: string) => void
  error?: string
}

export default function UrlInput({ value, onChange, error: externalError }: UrlInputProps) {
  const [localError, setLocalError] = useState<string | null>(null)
  const [isTouched, setIsTouched] = useState(false)

  useEffect(() => {
    if (!isTouched) return

    if (!value) {
      setLocalError('LinkedIn URL zorunludur')
      return
    }

    try {
      linkedinUrlSchema.parse(value)
      setLocalError(null)
    } catch (err) {
      setLocalError('Geçerli bir LinkedIn profil URL\'i girin (linkedin.com/in/...)')
    }
  }, [value, isTouched])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    if (!isTouched) {
      setIsTouched(true)
    }
  }

  const handleBlur = () => {
    setIsTouched(true)
  }

  const displayError = externalError || localError
  const isValid = !displayError && value && isTouched

  return (
    <div>
      <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700 mb-2">
        LinkedIn Profil URL <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          id="linkedin-url"
          type="url"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="https://www.linkedin.com/in/your-profile"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
            displayError
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : isValid
              ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
          required
        />
        {isValid && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>
      {displayError && (
        <p className="mt-2 text-sm text-red-600">{displayError}</p>
      )}
      {!displayError && value && (
        <p className="mt-1 text-xs text-gray-500">
          LinkedIn profil sayfanızın tam URL'ini girin
        </p>
      )}
    </div>
  )
}
