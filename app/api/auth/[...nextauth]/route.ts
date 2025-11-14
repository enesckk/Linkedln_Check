import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

/**
 * NextAuth API Route Handler
 * Authentication endpoint'leri
 */
const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }
