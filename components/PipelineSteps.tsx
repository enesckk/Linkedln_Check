'use client'

/**
 * PipelineSteps Component
 * Professional SaaS pipeline stepper UI
 * Shows step-by-step progress with status indicators
 * 
 * Props:
 * - currentStep: number (1-6)
 * - steps: array of step objects with status
 */

export interface Step {
  id: number
  title: string
  status: 'pending' | 'loading' | 'success' | 'error'
}

interface PipelineStepsProps {
  currentStep: number
  steps: Step[]
}

export default function PipelineSteps({ currentStep, steps }: PipelineStepsProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Analiz İlerlemesi
      </h2>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          
          return (
            <div key={step.id} className="relative">
              {/* Step Content */}
              <div className="flex items-start space-x-4">
                {/* Step Number/Icon */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step.status === 'success'
                        ? 'bg-green-500 text-white'
                        : step.status === 'error'
                        ? 'bg-red-500 text-white'
                        : step.status === 'loading'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.status === 'success' ? (
                      <CheckCircleIcon />
                    ) : step.status === 'error' ? (
                      <XCircleIcon />
                    ) : step.status === 'loading' ? (
                      <LoadingSpinner />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                </div>

                {/* Step Info */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm font-medium transition-colors ${
                        step.status === 'success'
                          ? 'text-green-700'
                          : step.status === 'error'
                          ? 'text-red-700'
                          : step.status === 'loading'
                          ? 'text-blue-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`absolute left-5 top-10 w-0.5 h-8 transition-colors ${
                    step.status === 'success'
                      ? 'bg-green-500'
                      : step.status === 'error'
                      ? 'bg-red-500'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            İlerleme: {steps.filter(s => s.status === 'success').length} / {steps.length}
          </span>
          <span className="text-gray-600">
            {Math.round((steps.filter(s => s.status === 'success').length / steps.length) * 100)}%
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${(steps.filter(s => s.status === 'success').length / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

// CheckCircle Icon Component
function CheckCircleIcon() {
  return (
    <svg
      className="w-6 h-6"
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
  )
}

// XCircle Icon Component
function XCircleIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin w-5 h-5"
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
  )
}

