/**
 * ScoreBadge Component
 * Profesyonellik skorunu görsel olarak gösterir
 * 0-100 arası skor için renk kodlaması yapar
 * 
 * Props:
 * - score: number (0-100)
 */
interface ScoreBadgeProps {
  score: number
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Mükemmel'
    if (score >= 60) return 'İyi'
    if (score >= 40) return 'Orta'
    return 'Geliştirilmeli'
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`${getScoreColor(score)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
        {score}/100
      </div>
      <span className="text-xs text-gray-600">{getScoreText(score)}</span>
    </div>
  )
}

