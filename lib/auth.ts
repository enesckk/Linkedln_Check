import { getServerSession } from 'next-auth'
import { authConfig } from '@/auth.config'

/**
 * Auth Helper Functions
 * Server component'lerde session ve user bilgilerine erişim için yardımcı fonksiyonlar
 */

/**
 * Get current session
 * @returns Current session or null
 */
export async function getSession() {
  return await getServerSession(authConfig)
}

/**
 * Get current user
 * @returns Current user or null
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

/**
 * Require user (throws error if not authenticated)
 * @returns Current user
 * @throws Error if user is not authenticated
 */
export async function requireUser() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session.user
}
