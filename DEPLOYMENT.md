# 🚀 Production Deployment Guide

LinkedIn Analyzer uygulamasını production'a deploy etmek için adım adım rehber.

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Vercel Deployment](#vercel-deployment)
3. [Railway Scraper Service](#railway-scraper-service)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Security Configuration](#security-configuration)
7. [Performance Optimizations](#performance-optimizations)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Genel Bakış

Bu uygulama iki ana bileşenden oluşur:

1. **Next.js Application** (Vercel'de deploy edilir)
   - Frontend + API Routes
   - NextAuth authentication
   - Prisma ORM ile PostgreSQL

2. **Scraper Microservice** (Railway'de deploy edilir)
   - Playwright ile LinkedIn scraping
   - RESTful API
   - API Key authentication

---

## 📦 Vercel Deployment

### Adım 1: Vercel Projesi Oluştur

1. [Vercel Dashboard](https://vercel.com/dashboard)'a git
2. "Add New Project" tıkla
3. GitHub repository'ni bağla
4. Root directory: `/` (proje root'u)

### Adım 2: Build Settings

Vercel otomatik olarak Next.js'i algılar, ancak şunları kontrol et:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (otomatik)
- **Install Command**: `npm install`

### Adım 3: Environment Variables

Vercel Dashboard → Project Settings → Environment Variables:

```env
# NextAuth
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-app.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>

# Database
DATABASE_URL=<production-postgresql-url>

# Scraper Service
SCRAPER_SERVICE_URL=https://your-scraper.railway.app
SCRAPER_API_KEY=<same-key-as-railway>

# AI Provider
AI_PROVIDER=gemini
GEMINI_API_KEY=<from-google-makersuite>
# veya
OPENAI_API_KEY=<from-openai-platform>

# Node Environment
NODE_ENV=production
```

**Önemli Notlar:**
- `NEXTAUTH_URL` production URL'iniz olmalı
- `SCRAPER_API_KEY` Railway'deki ile aynı olmalı
- Tüm environment variables'ı hem Production hem Preview için ekle

### Adım 4: Database Migration

Vercel'de deploy olduktan sonra:

```bash
# Local'den production DB'ye migrate et
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
```

Veya Vercel CLI ile:

```bash
vercel env pull
npx prisma migrate deploy
```

### Adım 5: Deploy

```bash
# Vercel CLI ile deploy
vercel --prod

# veya GitHub'a push yap (otomatik deploy)
git push origin main
```

---

## 🚂 Railway Scraper Service

### Adım 1: Railway Projesi Oluştur

1. [Railway Dashboard](https://railway.app/dashboard)'a git
2. "New Project" → "Deploy from GitHub repo"
3. `scraper-service` klasörünü seç

### Adım 2: Build & Start Commands

Railway → Settings → Deploy:

- **Root Directory**: `scraper-service`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Adım 3: Environment Variables

Railway → Variables:

```env
PORT=3000
NODE_ENV=production
SCRAPER_API_KEY=<same-key-as-vercel>
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000
```

### Adım 4: Playwright Browser Installation

Railway'de Playwright browser'larını install etmek için:

**Option 1: Build hook ekle**

`scraper-service/package.json`:

```json
{
  "scripts": {
    "postinstall": "npx playwright install chromium"
  }
}
```

**Option 2: Railway buildpack kullan**

Railway otomatik olarak algılar, ancak manuel eklemek için:

```bash
# Railway CLI ile
railway add
```

### Adım 5: Custom Domain (Opsiyonel)

Railway → Settings → Networking:

- Generate domain veya custom domain ekle
- Domain'i `SCRAPER_SERVICE_URL` olarak Vercel'e ekle

---

## 🔐 Environment Variables

### Next.js (.env)

Tüm environment variables `.env.example` dosyasında listelenmiştir.

**Production Checklist:**

- [ ] `NEXTAUTH_SECRET` - Güçlü bir secret (32+ karakter)
- [ ] `NEXTAUTH_URL` - Production URL
- [ ] `DATABASE_URL` - Production PostgreSQL connection string
- [ ] `SCRAPER_SERVICE_URL` - Railway scraper URL
- [ ] `SCRAPER_API_KEY` - Railway ile aynı key
- [ ] `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- [ ] `GEMINI_API_KEY` veya `OPENAI_API_KEY` - AI provider key

### Scraper Service (.env)

`scraper-service/.env.example` dosyasına bakın.

**Önemli:**
- `SCRAPER_API_KEY` Next.js'teki ile **tamamen aynı** olmalı
- `PORT` Railway otomatik ayarlar, ancak 3000 default

---

## 🗄️ Database Setup

### Production PostgreSQL Seçenekleri

1. **Vercel Postgres** (Önerilen)
   - Vercel Dashboard → Storage → Postgres
   - Otomatik connection string

2. **Supabase**
   - [supabase.com](https://supabase.com)
   - Free tier mevcut
   - Connection string: `postgresql://postgres:[password]@[host]:5432/postgres`

3. **Railway Postgres**
   - Railway → New → Database → Postgres
   - Connection string otomatik

### Migration

```bash
# Production DB'ye migrate
DATABASE_URL="production-url" npx prisma migrate deploy

# Schema'yı push et (development için)
DATABASE_URL="production-url" npx prisma db push
```

### Indexes (Performance)

Prisma schema'ya ekle (opsiyonel, performans için):

```prisma
model Report {
  // ... existing fields
  @@index([userId])
  @@index([createdAt])
}

model User {
  // ... existing fields
  @@index([email])
}
```

---

## 🔒 Security Configuration

### API Security

1. **Input Validation**
   - Tüm API routes'da Zod validation kullan
   - `utils/validators.ts` dosyasındaki schema'ları kullan

2. **Error Handling**
   - User-safe error messages
   - Sensitive bilgi log'lanmamalı
   - Production'da stack trace gösterilmemeli

3. **Rate Limiting** (Önerilen)

`app/api/rate-limit.ts` oluştur:

```typescript
import { NextRequest, NextResponse } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(identifier: string, maxRequests = 10, windowMs = 60000) {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}
```

### CORS Configuration

Scraper service'te CORS zaten yapılandırılmış (`scraper-service/src/index.ts`).

**Production'da:**
- Sadece Next.js domain'inden gelen istekleri kabul et
- `x-api-key` header zorunlu

### NextAuth Security

- `NEXTAUTH_SECRET` mutlaka set edilmeli
- `NEXTAUTH_URL` production URL olmalı
- HTTPS zorunlu (Vercel otomatik sağlar)

---

## ⚡ Performance Optimizations

### 1. API Routes Runtime

`next.config.js` içinde API routes'ları Node.js runtime'da çalıştır:

```javascript
// Zaten yapılandırıldı (vercel.json)
```

### 2. Database Query Optimization

```typescript
// Prisma query'lerinde select kullan
const reports = await db.report.findMany({
  where: { userId },
  select: {
    id: true,
    createdAt: true,
    linkedinUrl: true,
    aiFeedback: { select: { aiScore: true } },
  },
  orderBy: { createdAt: 'desc' },
  take: 20, // Pagination
})
```

### 3. Fetch Timeout

Tüm external API çağrılarında timeout ekle:

```typescript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s

try {
  const response = await fetch(url, {
    signal: controller.signal,
    // ...
  })
} finally {
  clearTimeout(timeoutId)
}
```

### 4. Playwright Browser Reuse

Scraper service'te browser instance'ı reuse et:

```typescript
// scraper-service/src/services/scrapeService.ts
let browserInstance: Browser | null = null

export async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await chromium.launch({ headless: true })
  }
  return browserInstance
}
```

### 5. PDF Export Optimization

Büyük raporlar için:

```typescript
// Server-side PDF generation (alternatif)
import { PDFDocument } from 'pdf-lib'

// veya
// html2pdf.js yerine puppeteer kullan (daha stabil)
```

---

## 🧪 Testing

### Pre-Deployment Checklist

- [ ] Tüm environment variables set edildi
- [ ] Database migration çalıştırıldı
- [ ] Google OAuth callback URL ayarlandı
- [ ] Scraper service erişilebilir
- [ ] API key'ler eşleşiyor

### Production Test Pipeline

1. **Login Test**
   ```
   - /login sayfasına git
   - Google ile giriş yap
   - /dashboard'a yönlendirildiğini kontrol et
   ```

2. **Upload Test**
   ```
   - /upload sayfasına git
   - PDF + URL gir
   - Pipeline'ın çalıştığını kontrol et
   - /report/[id] sayfasına yönlendirildiğini kontrol et
   ```

3. **Scraper Test**
   ```
   - Scraper service health check: GET /health
   - API key ile scrape test: POST /scrape
   ```

4. **Database Test**
   ```
   - Rapor oluştur
   - Dashboard'da göründüğünü kontrol et
   - Report detail sayfasını aç
   ```

### Monitoring

- **Vercel Analytics**: Otomatik
- **Railway Metrics**: Dashboard'da görüntüle
- **Error Tracking**: Sentry eklenebilir (opsiyonel)

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "NEXTAUTH_URL is not set"

**Çözüm:**
```bash
# Vercel'de environment variable ekle
NEXTAUTH_URL=https://your-app.vercel.app
```

#### 2. "Database connection failed"

**Çözüm:**
- Connection string'i kontrol et
- SSL mode gerekebilir: `?sslmode=require`
- Firewall rules kontrol et

#### 3. "Scraper service timeout"

**Çözüm:**
- Railway'de timeout artır
- Playwright browser'ın install edildiğini kontrol et
- Memory limit artır (Railway settings)

#### 4. "PDF export fails"

**Çözüm:**
- html2pdf.js yerine server-side PDF generation kullan
- Memory limit artır
- Timeout artır

#### 5. "Google OAuth redirect mismatch"

**Çözüm:**
- Google Console → OAuth 2.0 → Authorized redirect URIs
- `https://your-app.vercel.app/api/auth/callback/google` ekle

---

## 📝 Additional Notes

### Prisma Production Best Practices

```typescript
// db/client.ts içinde
export const db = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error'],
  errorFormat: 'minimal',
})
```

### Error Logging

Production'da error'ları logla:

```typescript
// utils/logger.ts
export function logError(error: Error, context?: string) {
  if (process.env.NODE_ENV === 'production') {
    // Sentry, LogRocket, vb.
    console.error(`[${context}]`, error.message)
  } else {
    console.error(error)
  }
}
```

### Health Checks

API route oluştur:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
}
```

---

## ✅ Final Checklist

Deployment öncesi:

- [ ] Tüm environment variables set edildi
- [ ] Database migration çalıştırıldı
- [ ] Google OAuth callback URL'leri ayarlandı
- [ ] Scraper service deploy edildi ve test edildi
- [ ] API key'ler eşleşiyor
- [ ] Production URL'ler doğru
- [ ] Security headers aktif
- [ ] Error handling test edildi
- [ ] Performance optimizations uygulandı

---

## 🎉 Deployment Complete!

Artık uygulamanız production'da çalışıyor. İyi çalışmalar! 🚀

