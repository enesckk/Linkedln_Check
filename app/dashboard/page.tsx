import { redirect } from 'next/navigation'
import { db } from '@/db/client'
import { requireUser } from '@/lib/auth'
import ReportCard from '@/components/ReportCard'
import LogoutButton from '@/components/LogoutButton'

/**
 * Dashboard Page
 * Kullanıcının tüm analiz raporlarını listeler
 * Authentication gerektirir
 */
export default async function DashboardPage() {
  // Authentication kontrolü
  let user
  try {
    user = await requireUser()
  } catch {
    redirect('/login')
  }

  // Kullanıcının raporlarını çek
  const reports = await db.report.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      aiFeedback: true,
      ruleResults: true,
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Analiz Raporları
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Hoş geldiniz, {user.name || user.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/upload"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Yeni Analiz
              </a>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {reports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Henüz analiz raporu yok
            </h2>
            <p className="text-gray-600 mb-6">
              İlk LinkedIn profil analizinizi oluşturmak için başlayın.
            </p>
            <a
              href="/upload"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              İlk Analizi Başlat
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
