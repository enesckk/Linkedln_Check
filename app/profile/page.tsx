import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * Profile Sayfası
 * Kullanıcı ayarları ve profil bilgileri
 */
export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Giriş yapmanız gerekiyor.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Profil Ayarları</h1>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <p className="text-gray-700">{session.user?.email}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">İsim</label>
          <p className="text-gray-700">{session.user?.name || 'Belirtilmemiş'}</p>
        </div>

        {/* TODO: Profil güncelleme formu eklenecek */}
      </div>
    </div>
  )
}

