# LinkedIn Analyzer Web Application

Next.js 14 tabanlı profesyonel LinkedIn Profil Analiz sistemi.

## Özellikler

- PDF parsing + scraping + AI evaluation + rule engine + data fusion
- Modern UI/UX
- Type-safe TypeScript
- Prisma ORM + PostgreSQL
- NextAuth authentication

## Kurulum

\`\`\`bash
npm install
npm run db:generate
npm run db:push
npm run dev
\`\`\`

## Proje Yapısı

- `/app` - Next.js App Router sayfaları
- `/app/api` - API route'ları
- `/components` - Reusable React bileşenleri
- `/lib/core` - Core business logic
- `/db` - Prisma schema ve client
- `/utils` - Yardımcı fonksiyonlar ve tipler

