'use client'

/**
 * Loading Component
 * Professional loading spinner with enhanced design
 * 
 * Props:
 * - message?: string
 * - currentStep?: number
 * - totalSteps?: number
 */
interface LoadingProps {
  message?: string
  currentStep?: number
  totalSteps?: number
}

export default function Loading({ message, currentStep, totalSteps }: LoadingProps) {
  const displayMessage = message || 'Analiz yapılıyor, lütfen bekleyin...'
  const showSteps = currentStep !== undefined && totalSteps !== undefined

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
        {/* Enhanced Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute top-0 left-0 animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-blue-400 opacity-50" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>

        {/* Message */}
        <p className="text-center text-gray-700 font-semibold text-lg mb-6">{displayMessage}</p>

        {/* Steps Progress */}
        {showSteps && (
          <div className="space-y-3 mb-6">
            {Array.from({ length: totalSteps! }, (_, index) => {
              const stepNumber = index + 1
              const isCompleted = stepNumber < currentStep!
              const isCurrent = stepNumber === currentStep!

              return (
                <div key={stepNumber} className="flex items-center space-x-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-500 text-white shadow-md'
                        : isCurrent
                        ? 'bg-blue-600 text-white animate-pulse shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5"
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
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span
                    className={`text-sm transition-colors ${
                      isCurrent
                        ? 'text-blue-700 font-semibold'
                        : isCompleted
                        ? 'text-gray-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {getStepLabel(stepNumber)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Enhanced Progress Bar */}
        {showSteps && (
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-blue-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${(currentStep! / totalSteps!) * 100}%` }}
              ></div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-3 font-medium">
              Adım {currentStep} / {totalSteps}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function getStepLabel(stepNumber: number): string {
  const labels = [
    '',
    'PDF işleniyor',
    'Profil çekiliyor',
    'Veriler birleştiriliyor',
    'Kurallar değerlendiriliyor',
    'AI analizi yapılıyor',
    'Rapor oluşturuluyor',
  ]
  return labels[stepNumber] || `Adım ${stepNumber}`
}
