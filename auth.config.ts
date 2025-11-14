import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { db } from '@/db/client'

/**
 * NextAuth Configuration
 * Authentication yapılandırması
 * 
 * Providers:
 * - Google OAuth
 * - Credentials (opsiyonel)
 * 
 * Adapter:
 * - PrismaAdapter (database session management)
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // TODO: Implement credentials authentication if needed
        // const user = await db.user.findUnique({ where: { email: credentials.email } })
        // if (user && await bcrypt.compare(credentials.password, user.password)) {
        //   return { id: user.id, email: user.email, name: user.name }
        // }

        return null
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Google OAuth ile giriş yapıldığında kullanıcıyı DB'ye kaydet
      if (account?.provider === 'google' && user.email) {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        })

        if (!existingUser) {
          await db.user.create({
            data: {
              email: user.email,
              name: user.name || null,
              image: user.image || null,
            },
          })
        }
      }
      return true
    },
    async session({ session, user }) {
      // Session'a user ID ekle (database strategy)
      if (session.user && user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
