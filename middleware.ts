import { withAuth } from 'next-auth/middleware'

/**
 * Middleware
 * Protected route'ları korur
 * /dashboard, /upload, /profile, /report/* sayfaları authentication gerektirir
 */
export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: ['/dashboard/:path*', '/upload/:path*', '/profile/:path*', '/report/:path*'],
}

