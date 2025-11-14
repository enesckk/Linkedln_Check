# 🔧 Production Setup Guide

LinkedIn Analyzer için production ortamı kurulum rehberi.

---

## 📌 1. Environment Variables

### Next.js Application (.env)

`.env.example` dosyasını kopyalayın ve değerleri doldurun:

```bash
cp .env.example .env
```

**Gerekli Değişkenler:**

```env
# NextAuth
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-app.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>

# Database
DATABASE_URL=postgresql://user:password@host:port/database?schema=public

# Scraper Service
SCRAPER_SERVICE_URL=https://your-scraper.railway.app
SCRAPER_API_KEY=<secure-random-key>

# AI Provider
AI_PROVIDER=gemini
GEMINI_API_KEY=<from-google-makersuite>
```

### Scraper Service (.env)

`scraper-service/.env.example` dosyasını kopyalayın:

```bash
cd scraper-service
cp .env.example .env
```

**Önemli:** `SCRAPER_API_KEY` Next.js'teki ile **tamamen aynı** olmalı!

---

## 📌 2. Vercel Environment Settings

Vercel Dashboard → Project Settings → Environment Variables:

### Production Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Güçlü secret üret |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production URL |
| `DATABASE_URL` | PostgreSQL connection string | Vercel Postgres veya external |
| `SCRAPER_SERVICE_URL` | Railway scraper URL | `https://xxx.railway.app` |
| `SCRAPER_API_KEY` | Random secure key | Railway ile aynı |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Google Console'dan al |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Google Console'dan al |
| `GEMINI_API_KEY` | Gemini API key | Google MakerSuite'den al |
| `AI_PROVIDER` | `gemini` | veya `openai` |

### Preview Variables

Aynı değişkenleri Preview environment için de ekle (test için).

---

## 📌 3. Railway Scraper Service

### Railway Deployment

1. **New Project** → **Deploy from GitHub repo**
2. `scraper-service` klasörünü seç
3. **Root Directory**: `scraper-service`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm start`

### Environment Variables (Railway)

Railway → Variables sekmesi:

```env
PORT=3000
NODE_ENV=production
SCRAPER_API_KEY=<same-as-vercel>
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000
```

### Playwright Browser Installation

`scraper-service/package.json` içine ekle:

```json
{
  "scripts": {
    "postinstall": "npx playwright install chromium --with-deps"
  }
}
```

### Custom Domain

Railway → Settings → Networking:

- Generate domain veya custom domain ekle
- Domain'i `SCRAPER_SERVICE_URL` olarak Vercel'e ekle

---

## 📌 4. CORS & API Security

### Scraper Service CORS

`scraper-service/src/index.ts` içinde zaten yapılandırılmış:

```typescript
app.use(cors()) // Tüm origin'lere açık (production'da kısıtla)

// Production için:
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'https://your-app.vercel.app',
  credentials: true,
}))
```

### API Key Protection

Scraper service'te `x-api-key` middleware zaten var (`apiKeyAuth.ts`).

**Production Checklist:**
- [ ] API key güçlü (32+ karakter)
- [ ] API key environment variable'da
- [ ] API key git'e commit edilmedi
- [ ] Scraper service sadece API key ile erişilebilir

### Rate Limiting (Önerilen)

`app/api/rate-limit.ts`:

```typescript
import { NextRequest } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs = 60000
): boolean {
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

Kullanım:

```typescript
// app/api/scrape/route.ts
import { checkRateLimit } from '@/utils/rate-limit'

const clientId = request.headers.get('x-forwarded-for') || 'unknown'
if (!checkRateLimit(clientId, 5, 60000)) {
  return NextResponse.json(
    { success: false, error: 'Rate limit exceeded' },
    { status: 429 }
  )
}
```

---

## 📌 5. Performance Optimizations

### API Routes Runtime

`next.config.js` ve `vercel.json` içinde Node.js runtime ayarlandı.

### Database Query Optimization

**Indexes ekle (Prisma schema):**

```prisma
model Report {
  // ... existing fields
  @@index([userId])
  @@index([createdAt])
  @@index([status])
}

model User {
  // ... existing fields
  @@index([email])
}
```

**Selective queries:**

```typescript
// Sadece gerekli field'ları çek
const reports = await db.report.findMany({
  where: { userId },
  select: {
    id: true,
    createdAt: true,
    linkedinUrl: true,
    aiFeedback: { select: { aiScore: true } },
  },
  take: 20, // Pagination
})
```

### Fetch Timeout

Tüm external API çağrılarında:

```typescript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 30000)

try {
  const response = await fetch(url, {
    signal: controller.signal,
    // ...
  })
} finally {
  clearTimeout(timeoutId)
}
```

### Playwright Browser Reuse

`scraper-service/src/services/scrapeService.ts`:

```typescript
let browserInstance: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  }
  return browserInstance
}

// Cleanup on process exit
process.on('SIGTERM', async () => {
  if (browserInstance) {
    await browserInstance.close()
  }
})
```

---

## 📌 6. PDF Export Optimization

### Current Implementation

Şu anda `html2pdf.js` kullanılıyor (client-side).

### Production Alternatives

**Option 1: Server-side PDF (Önerilen)**

```typescript
// app/api/report/[id]/export/route.ts
import { db } from '@/db/client'
import puppeteer from 'puppeteer'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const report = await db.report.findUnique({ where: { id: params.id } })
  
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(`${process.env.NEXTAUTH_URL}/report/${params.id}`, {
    waitUntil: 'networkidle0',
  })
  
  const pdf = await page.pdf({ format: 'A4' })
  await browser.close()
  
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="report-${params.id}.pdf"`,
    },
  })
}
```

**Option 2: Memory Optimization (html2pdf.js için)**

```typescript
// components/ReportExportButton.tsx
const opt = {
  margin: [5, 5, 5, 5],
  filename: `report-${reportId}.pdf`,
  image: { type: 'jpeg', quality: 0.85 }, // Quality düşür
  html2canvas: { 
    scale: 1.5, // Scale düşür (2 yerine)
    useCORS: true,
    logging: false,
    memory: 256, // Memory limit
  },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
}
```

**Option 3: Chunked Export (Büyük raporlar için)**

Raporu bölümlere ayır ve ayrı ayrı export et.

---

## 📌 7. Security Notes

### Input Validation

Tüm API routes'da Zod validation:

```typescript
// app/api/upload-pdf/route.ts
import { uploadRequestSchema } from '@/utils/validators'

try {
  const validated = uploadRequestSchema.parse(body)
} catch (error) {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
}
```

### Error Handling

```typescript
// Production'da user-safe errors
catch (error) {
  console.error('Error:', error) // Log server-side
  
  return NextResponse.json(
    {
      success: false,
      error: process.env.NODE_ENV === 'production'
        ? 'An error occurred'
        : error.message,
    },
    { status: 500 }
  )
}
```

### Prisma Configuration

```typescript
// db/client.ts
export const db = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error'],
  errorFormat: 'minimal',
  rejectOnNotFound: false, // NextAuth için gerekli
})
```

### Environment Variables Security

- [ ] `.env` dosyası `.gitignore`'da
- [ ] Production secrets güçlü (32+ karakter)
- [ ] API keys rotate edilebilir
- [ ] `NEXTAUTH_SECRET` unique ve güçlü

### Scraper Service Security

- [ ] Public erişim yok (sadece x-api-key)
- [ ] CORS kısıtlanmış (production'da)
- [ ] Rate limiting aktif
- [ ] Timeout'lar ayarlanmış

---

## 📌 8. Database Indexes

Prisma schema'ya ekle:

```prisma
model Report {
  // ... existing fields
  @@index([userId, createdAt(sort: Desc)])
  @@index([status])
}

model User {
  // ... existing fields
  @@index([email])
}

model PdfRawData {
  // ... existing fields
  @@index([reportId])
}

model ScrapedRawData {
  // ... existing fields
  @@index([reportId])
}
```

Migration:

```bash
npx prisma migrate dev --name add_indexes
```

---

## ✅ Production Checklist

Deployment öncesi kontrol listesi:

### Environment
- [ ] Tüm environment variables set edildi
- [ ] `.env` dosyası git'e commit edilmedi
- [ ] Production secrets güçlü

### Database
- [ ] Production database oluşturuldu
- [ ] Migration çalıştırıldı
- [ ] Indexes eklendi
- [ ] Connection string test edildi

### Authentication
- [ ] Google OAuth callback URL'leri ayarlandı
- [ ] `NEXTAUTH_URL` production URL
- [ ] `NEXTAUTH_SECRET` set edildi

### Services
- [ ] Scraper service deploy edildi
- [ ] Scraper service health check çalışıyor
- [ ] API key'ler eşleşiyor
- [ ] CORS ayarları doğru

### Testing
- [ ] Login test edildi
- [ ] Upload pipeline test edildi
- [ ] Scraper service test edildi
- [ ] PDF export test edildi
- [ ] Error handling test edildi

### Performance
- [ ] Database queries optimize edildi
- [ ] Fetch timeout'ları ayarlandı
- [ ] Rate limiting aktif (opsiyonel)
- [ ] Browser reuse implement edildi

### Security
- [ ] Input validation aktif
- [ ] Error messages user-safe
- [ ] Security headers aktif
- [ ] API key protection aktif

---

## 🚀 Quick Start

1. **Environment Variables:**
   ```bash
   cp .env.example .env
   # .env dosyasını doldur
   ```

2. **Database:**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

3. **Deploy:**
   ```bash
   # Vercel
   vercel --prod
   
   # Railway (scraper-service)
   cd scraper-service
   railway up
   ```

4. **Test:**
   - Login: `/login`
   - Upload: `/upload`
   - Dashboard: `/dashboard`

---

## 📞 Support

Sorun yaşarsanız:

1. `DEPLOYMENT.md` dosyasına bakın
2. Log'ları kontrol edin (Vercel/Railway)
3. Environment variables'ı doğrulayın
4. Database connection'ı test edin

---

**Production'a hazır! 🎉**

