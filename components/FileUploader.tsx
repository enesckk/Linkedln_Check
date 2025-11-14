'use client'

import { useRef } from 'react'

/**
 * FileUploader Component
 * LinkedIn PDF Export dosyası yükleme için kullanılır
 * Drag & drop veya tıklayıp seçme desteği
 * 
 * Props:
 * - onFileSelect: (file: File | null) => void
 * - selectedFile: File | null
 * - error?: string
 */
interface FileUploaderProps {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
  error?: string
}

export default function FileUploader({ onFileSelect, selectedFile, error }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    
    if (file && file.type !== 'application/pdf') {
      onFileSelect(null)
      return
    }

    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    
    if (file && file.type === 'application/pdf') {
      onFileSelect(file)
    } else {
      onFileSelect(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        LinkedIn PDF Export <span className="text-red-500">*</span>
      </label>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          error
            ? 'border-red-300 bg-red-50'
            : selectedFile
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {selectedFile ? (
          <div>
            <div className="flex items-center justify-center mb-2">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-green-700 font-medium">{selectedFile.name}</p>
            <p className="text-sm text-gray-600 mt-1">
              {formatFileSize(selectedFile.size)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Farklı bir dosya seçmek için tıklayın
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-gray-700 font-medium mb-2">
              PDF dosyasını buraya sürükleyin veya tıklayın
            </p>
            <p className="text-sm text-gray-500">
              Sadece PDF dosyaları kabul edilir
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
