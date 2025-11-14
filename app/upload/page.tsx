'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FileUploader from '@/components/FileUploader'
import UrlInput from '@/components/UrlInput'
import PipelineSteps, { Step } from '@/components/PipelineSteps'
import ErrorAlert from '@/components/ErrorAlert'
import { linkedinUrlSchema } from '@/utils/validators'
import {
  uploadPdf,
  scrapeProfile,
  mergeData,
  checkRules,
  analyzeWithAI,
  createReport,
} from '@/utils/apiHelpers'

/**
 * Upload Page
 * Professional SaaS Pipeline UI with step-by-step progress
 * LinkedIn Profil Analizi başlangıç sayfası
 */

// Step definitions
const STEP_DEFINITIONS = [
  { id: 1, title: 'PDF işleniyor' },
  { id: 2, title: 'Profil çekiliyor (scraping)' },
  { id: 3, title: 'Veriler birleştiriliyor' },
  { id: 4, title: 'Kurallar değerlendiriliyor' },
  { id: 5, title: 'AI analizi yapılıyor' },
  { id: 6, title: 'Rapor oluşturuluyor' },
]

export default function UploadPage() {
  const router = useRouter()

  // Form state
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [linkedinUrl, setLinkedinUrl] = useState<string>('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)

  // Pipeline state
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [steps, setSteps] = useState<Step[]>(
    STEP_DEFINITIONS.map((def) => ({ ...def, status: 'pending' as const }))
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Validation helpers
  const validateUrl = (url: string): boolean => {
    try {
      linkedinUrlSchema.parse(url)
      setUrlError(null)
      return true
    } catch {
      setUrlError('Geçerli bir LinkedIn profil URL\'i girin')
      return false
    }
  }

  const validatePdf = (file: File | null): boolean => {
    if (!file) {
      setPdfError('PDF dosyası zorunludur')
      return false
    }
    if (file.type !== 'application/pdf') {
      setPdfError('Sadece PDF dosyaları kabul edilir')
      return false
    }
    setPdfError(null)
    return true
  }

  // Update step status helper
  const updateStepStatus = (stepId: number, status: Step['status']) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, status } : step
      )
    )
  }

  // Main analysis pipeline
  const handleAnalyze = async () => {
    // Reset errors
    setErrorMessage(null)
    setUrlError(null)
    setPdfError(null)

    // Validation
    if (!validateUrl(linkedinUrl)) {
      return
    }

    if (!validatePdf(pdfFile)) {
      return
    }

    // Initialize pipeline
    setIsLoading(true)
    setCurrentStep(0)
    setSteps(
      STEP_DEFINITIONS.map((def) => ({ ...def, status: 'pending' as const }))
    )

    try {
      // STEP 1: Upload PDF
      setCurrentStep(1)
      updateStepStatus(1, 'loading')
      
      const pdfData = await uploadPdf(pdfFile!, linkedinUrl)
      updateStepStatus(1, 'success')

      // STEP 2: Scrape Profile
      setCurrentStep(2)
      updateStepStatus(2, 'loading')
      
      const scrapedData = await scrapeProfile(linkedinUrl)
      updateStepStatus(2, 'success')

      // STEP 3: Merge Data
      setCurrentStep(3)
      updateStepStatus(3, 'loading')
      
      // Create temporary report ID for pipeline
      const tempReportId = 'temp-' + Date.now()
      const mergedData = await mergeData(pdfData, scrapedData, tempReportId)
      updateStepStatus(3, 'success')

      // STEP 4: Check Rules
      setCurrentStep(4)
      updateStepStatus(4, 'loading')
      
      const ruleResults = await checkRules(mergedData, tempReportId)
      updateStepStatus(4, 'success')

      // STEP 5: AI Analysis
      setCurrentStep(5)
      updateStepStatus(5, 'loading')
      
      const aiFeedback = await analyzeWithAI(mergedData, ruleResults, tempReportId)
      updateStepStatus(5, 'success')

      // STEP 6: Create Final Report
      setCurrentStep(6)
      updateStepStatus(6, 'loading')
      
      // TODO: Get actual userId from session/auth
      const userId = 'user-' + Date.now() // Placeholder
      const reportId = await createReport(
        userId,
        linkedinUrl,
        pdfData,
        scrapedData,
        mergedData,
        ruleResults,
        aiFeedback
      )
      updateStepStatus(6, 'success')

      // Redirect to report page
      if (reportId) {
        // Small delay to show success state
        await new Promise((resolve) => setTimeout(resolve, 500))
        router.push(`/report/${reportId}`)
      } else {
        throw new Error('Report ID alınamadı')
      }
    } catch (err) {
      console.error('Analysis pipeline error:', err)
      
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.'

      setErrorMessage(errorMsg)
      
      // Mark current step as error
      if (currentStep > 0) {
        updateStepStatus(currentStep, 'error')
      }
      
      setIsLoading(false)
    }
  }

  // Form validation
  const isFormValid = pdfFile && linkedinUrl && !urlError && !pdfError && !isLoading

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              LinkedIn Profil Analizi
            </h1>
            <p className="text-gray-600">
              Profesyonel LinkedIn profilinizi analiz edin ve gelişim önerileri alın
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Upload Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Profil Bilgileri
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAnalyze()
              }}
              className="space-y-6"
            >
              {/* URL Input */}
              <UrlInput
                value={linkedinUrl}
                onChange={(url) => {
                  setLinkedinUrl(url)
                  setUrlError(null)
                }}
                error={urlError || undefined}
              />

              {/* PDF Uploader */}
              <FileUploader
                onFileSelect={(file) => {
                  setPdfFile(file)
                  setPdfError(null)
                }}
                selectedFile={pdfFile}
                error={pdfError || undefined}
              />

              {/* Error Alert */}
              {errorMessage && (
                <ErrorAlert
                  message={errorMessage}
                  onClose={() => setErrorMessage(null)}
                />
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                  isFormValid
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Analiz yapılıyor...
                  </span>
                ) : (
                  'Analiz Et'
                )}
              </button>

              {/* Info Text */}
              <p className="text-xs text-center text-gray-500">
                Analiz işlemi birkaç dakika sürebilir. Lütfen sayfayı kapatmayın.
              </p>
            </form>
          </div>

          {/* Right: Pipeline Steps */}
          <div>
            <PipelineSteps currentStep={currentStep} steps={steps} />
          </div>
        </div>
      </div>
    </div>
  )
}
