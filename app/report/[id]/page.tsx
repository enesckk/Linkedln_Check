import { notFound } from 'next/navigation'
import { db } from '@/db/client'
import ScoreBadge from '@/components/ScoreBadge'
import ReportExportButton from '@/components/ReportExportButton'
import { formatDate } from '@/utils/formatters'

/**
 * Report Detail Page
 * LinkedIn profil analiz raporunun detay sayfası
 * Tüm analiz sonuçlarını gösterir ve PDF export sağlar
 */

interface ReportPageProps {
  params: { id: string }
}

export default async function ReportDetailPage({ params }: ReportPageProps) {
  // 1. Veriyi DB'den çek
  const report = await db.report.findUnique({
    where: { id: params.id },
    include: {
      pdfRawData: true,
      scrapedRawData: true,
      mergedData: true,
      ruleResults: true,
      aiFeedback: true,
    },
  })

  if (!report) {
    notFound()
  }

  // Veri parse etme
  const mergedData = report.mergedData?.data as any
  const ruleResults = report.ruleResults?.results as any
  const aiFeedback = report.aiFeedback

  // Skor hesaplama (rule score + AI score ortalaması)
  const ruleScore = report.ruleResults?.score || 0
  const aiScore = aiFeedback?.aiScore || 0
  const averageScore = Math.round((ruleScore + aiScore) / 2)

  // Rule results parse et
  // Yeni format: { results: Record<string, boolean>, score: number }
  const rules = ruleResults?.results
    ? Object.entries(ruleResults.results).map(([key, passed]) => ({
        name: key,
        passed: passed === true,
        message: passed
          ? `${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} kuralı geçti`
          : `${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} kuralı geçmedi`,
      }))
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div id="report-content" className="max-w-6xl mx-auto">
        {/* A) Başlık Bölümü */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                LinkedIn Profil Analizi
              </h1>
              <p className="text-gray-600">
                Analiz Tarihi: {formatDate(report.createdAt)}
              </p>
              {report.linkedinUrl && (
                <p className="text-sm text-gray-500 mt-1">
                  {report.linkedinUrl}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <ScoreBadge score={averageScore} />
              <ReportExportButton reportId={params.id} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* B) Özet Bilgi Kartı */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Özet Bilgiler
            </h2>
            <div className="space-y-4">
              {/* Headline */}
              {mergedData?.headline && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Headline
                  </p>
                  <p className="text-gray-900">{mergedData.headline}</p>
                </div>
              )}

              {/* About */}
              {mergedData?.about && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    About
                  </p>
                  <p className="text-gray-900 line-clamp-3">
                    {mergedData.about}
                  </p>
                </div>
              )}

              {/* Connections */}
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-700">Bağlantılar:</p>
                <span className="text-gray-900 font-semibold">
                  {mergedData?.connections || report.scrapedRawData?.connections || 'N/A'}
                </span>
              </div>

              {/* Banner & Photo Status */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="flex items-center gap-2">
                  {report.scrapedRawData?.bannerUrl ? (
                    <>
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
                      <span className="text-sm text-gray-700">Banner Mevcut</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 text-red-600"
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
                      <span className="text-sm text-gray-700">Banner Yok</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {report.scrapedRawData?.profilePhoto ? (
                    <>
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
                      <span className="text-sm text-gray-700">Fotoğraf Mevcut</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 text-red-600"
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
                      <span className="text-sm text-gray-700">Fotoğraf Yok</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* C) Rule Results Kartı */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Kural Kontrolleri
            </h2>
            <div className="space-y-3">
              {rules.length > 0 ? (
                rules.map((rule) => (
                  <div
                    key={rule.name}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    {rule.passed ? (
                      <svg
                        className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
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
                    ) : (
                      <svg
                        className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          rule.passed ? 'text-green-700' : 'text-red-700'
                        }`}
                      >
                        {rule.name.charAt(0).toUpperCase() + rule.name.slice(1)}
                      </p>
                      {rule.message && (
                        <p className="text-xs text-gray-600 mt-1">{rule.message}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Kural sonucu bulunamadı</p>
              )}
            </div>
          </div>
        </div>

        {/* D) AI Feedback Bölümü */}
        {aiFeedback && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              AI Değerlendirmesi
            </h2>
            <div className="space-y-6">
              {/* AI Score */}
              {aiFeedback.aiScore !== null && aiFeedback.aiScore !== undefined && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">AI Skoru</p>
                  <ScoreBadge score={aiFeedback.aiScore} />
                </div>
              )}

              {/* Headline Suggestion */}
              {aiFeedback.headlineSuggestion && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Headline Önerisi
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-gray-900">{aiFeedback.headlineSuggestion}</p>
                  </div>
                </div>
              )}

              {/* About Suggestion */}
              {aiFeedback.aboutSuggestion && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    About Önerisi
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-gray-900 whitespace-pre-line">
                      {aiFeedback.aboutSuggestion}
                    </p>
                  </div>
                </div>
              )}

              {/* Overall Feedback */}
              {aiFeedback.overallFeedback && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Genel Değerlendirme
                  </p>
                  <div className="bg-gray-50 border-l-4 border-gray-500 p-4 rounded">
                    <p className="text-gray-900 whitespace-pre-line">
                      {aiFeedback.overallFeedback}
                    </p>
                  </div>
                </div>
              )}

              {/* Insights */}
              {aiFeedback.insights && Array.isArray(aiFeedback.insights) && aiFeedback.insights.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Önemli Noktalar
                  </p>
                  <ul className="space-y-2">
                    {aiFeedback.insights.map((insight: any, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-gray-900"
                      >
                        <span className="text-blue-600 mt-1">•</span>
                        <span>
                          {typeof insight === 'string'
                            ? insight
                            : insight.message || JSON.stringify(insight)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* E) Merged Data Bölümü */}
        {mergedData && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Detaylı Bilgiler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills */}
              {mergedData.skills && Array.isArray(mergedData.skills) && mergedData.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Yetenekler</p>
                  <div className="flex flex-wrap gap-2">
                    {mergedData.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {mergedData.education && Array.isArray(mergedData.education) && mergedData.education.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Eğitim</p>
                  <div className="space-y-2">
                    {mergedData.education.map((edu: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p className="font-medium text-gray-900">{edu.school}</p>
                        {edu.degree && (
                          <p className="text-sm text-gray-600">{edu.degree}</p>
                        )}
                        {edu.field && (
                          <p className="text-sm text-gray-600">{edu.field}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {mergedData.certifications && Array.isArray(mergedData.certifications) && mergedData.certifications.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Sertifikalar
                  </p>
                  <div className="space-y-2">
                    {mergedData.certifications.map((cert: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p className="font-medium text-gray-900">{cert.name}</p>
                        {cert.issuer && (
                          <p className="text-sm text-gray-600">{cert.issuer}</p>
                        )}
                        {cert.date && (
                          <p className="text-xs text-gray-500">{cert.date}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {mergedData.languages && Array.isArray(mergedData.languages) && mergedData.languages.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Diller</p>
                  <div className="space-y-2">
                    {mergedData.languages.map((lang: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <span className="text-gray-900">{lang.language}</span>
                        {lang.proficiency && (
                          <span className="text-sm text-gray-600">{lang.proficiency}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Endorsed Skills */}
              {mergedData.endorsedSkills && Array.isArray(mergedData.endorsedSkills) && mergedData.endorsedSkills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Onaylanan Yetenekler
                  </p>
                  <div className="space-y-2">
                    {mergedData.endorsedSkills.map((skill: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded"
                      >
                        <span className="text-gray-900">{skill.skill}</span>
                        {skill.count && (
                          <span className="text-sm text-blue-600 font-medium">
                            {skill.count} onay
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Items */}
              {mergedData.featured && Array.isArray(mergedData.featured) && mergedData.featured.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Öne Çıkanlar
                  </p>
                  <div className="space-y-2">
                    {mergedData.featured.map((item: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p className="font-medium text-gray-900">{item.title}</p>
                        {item.type && (
                          <p className="text-xs text-gray-500">{item.type}</p>
                        )}
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Görüntüle →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
