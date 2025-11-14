import Link from 'next/link'

/**
 * Ana sayfa
 * Kullanıcıyı /upload sayfasına yönlendirir
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">LinkedIn Analyzer</h1>
        <p className="text-lg mb-8">Profesyonel LinkedIn Profil Analiz Sistemi</p>
        <Link
          href="/upload"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Analiz Başlat
        </Link>
      </div>
    </main>
  )
}

