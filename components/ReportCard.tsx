import Link from 'next/link'
import ScoreBadge from './ScoreBadge'
import { formatDate } from '@/utils/formatters'

/**
 * ReportCard Component
 * Dashboard'da raporları listelemek için kullanılır
 * Her kart bir raporun özet bilgilerini gösterir
 * 
 * Props:
 * - report: Report object with aiFeedback and ruleResults
 */
interface ReportCardProps {
  report: {
    id: string
    linkedinUrl: string
    createdAt: Date
    aiFeedback?: {
      aiScore: number | null
    } | null
    ruleResults?: {
      score: number | null
    } | null
  }
}

export default function ReportCard({ report }: ReportCardProps) {
  // Skor hesaplama (AI score veya rule score)
  const aiScore = report.aiFeedback?.aiScore ?? null
  const ruleScore = report.ruleResults?.score ?? null
  const score = aiScore !== null ? aiScore : ruleScore !== null ? ruleScore : 0

  const date = formatDate(report.createdAt)

  return (
    <Link href={`/report/${report.id}`}>
      <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-100 hover:border-blue-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analiz Raporu
            </h3>
            <p className="text-sm text-gray-600 truncate" title={report.linkedinUrl}>
              {report.linkedinUrl}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <ScoreBadge score={score} />
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">{date}</span>
          <span className="text-xs text-blue-600 font-medium hover:text-blue-700">
            Görüntüle →
          </span>
        </div>
      </div>
    </Link>
  )
}
