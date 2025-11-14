# 🚀 Quick Start Guide

LinkedIn Analyzer'ı production'a deploy etmek için hızlı başlangıç rehberi.

---

## ⚡ 5 Dakikada Deploy

### 1. Environment Variables Hazırla

**Next.js (.env):**
```bash
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://your-app.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=postgresql://...
SCRAPER_SERVICE_URL=https://your-scraper.railway.app
SCRAPER_API_KEY=$(openssl rand -base64 32)
GEMINI_API_KEY=your-gemini-key
```

**Scraper Service (.env):**
```bash
SCRAPER_API_KEY=<same-as-above>
PORT=3000
PLAYWRIGHT_HEADLESS=true
```

### 2. Vercel Deploy

```bash
# Vercel CLI ile
npm i -g vercel
vercel login
vercel --prod

# Veya GitHub'a push (otomatik deploy)
git push origin main
```

**Vercel Dashboard'da:**
- Environment variables ekle
- Build settings kontrol et
- Domain ayarla

### 3. Railway Deploy (Scraper)

```bash
cd scraper-service
railway login
railway init
railway up
```

**Railway Dashboard'da:**
- Environment variables ekle
- Domain generate et
- URL'i Vercel'e ekle

### 4. Database Setup

```bash
# Production DB'ye migrate
DATABASE_URL="production-url" npx prisma migrate deploy
```

### 5. Test

1. `/login` → Google ile giriş
2. `/upload` → PDF + URL yükle
3. `/dashboard` → Raporları görüntüle

---

## 📋 Checklist

- [ ] Environment variables set edildi
- [ ] Database migration çalıştırıldı
- [ ] Google OAuth callback URL ayarlandı
- [ ] Scraper service deploy edildi
- [ ] API key'ler eşleşiyor
- [ ] Test edildi

---

## 🔗 Detaylı Dokümantasyon

- **Production Setup**: `PRODUCTION_SETUP.md`
- **Deployment Guide**: `DEPLOYMENT.md`
- **Environment Variables**: `.env.example`

---

**Hazır! 🎉**

