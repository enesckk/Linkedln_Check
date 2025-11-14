# LinkedIn Scraper Microservice

Node.js + Playwright tabanlı LinkedIn profil scraping servisi.

## 🚀 Features

- LinkedIn profil verilerini scrape eder
- Playwright (Chromium) kullanır
- RESTful API (Express.js)
- API Key authentication
- TypeScript
- Clean-code, modular architecture

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

`.env` dosyası oluşturun:

```bash
cp .env.example .env
```

Gerekli environment variables:
- `PORT` - Server port (default: 3001)
- `SCRAPER_API_KEY` - API authentication key
- `PLAYWRIGHT_HEADLESS` - Headless mode (default: true)
- `PLAYWRIGHT_TIMEOUT` - Request timeout in ms (default: 30000)

## 🏃 Development

```bash
npm run dev
```

## 🏗️ Build

```bash
npm run build
npm start
```

## 📡 API Endpoints

### POST /scrape

LinkedIn profil scraping endpoint'i.

**Headers:**
```
x-api-key: your-api-key-here
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://www.linkedin.com/in/profile-name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bannerUrl": "...",
    "profilePhoto": "...",
    "photoResolution": "...",
    "connections": 500,
    "featured": [],
    "endorsements": [],
    "activity": [],
    "recommendations": [],
    "media": []
  }
}
```

### GET /health

Health check endpoint (API key gerektirmez).

## 🔐 Security

Tüm `/scrape` endpoint'leri `x-api-key` header'ı ile korunur.

## 🚢 Deployment

### Railway

1. Railway'de yeni proje oluştur
2. GitHub repo'yu bağla
3. Environment variables ekle
4. Deploy

### Render

1. Render'da yeni Web Service oluştur
2. GitHub repo'yu bağla
3. Environment variables ekle
4. Build command: `npm run build`
5. Start command: `npm start`

## 📝 Notes

- Playwright browser'ı ilk çalıştırmada indirilir
- Scraping logic placeholder olarak bırakılmıştır, implement edilmesi gerekiyor
- LinkedIn HTML yapısı değişebilir, selector'lar güncellenmelidir

