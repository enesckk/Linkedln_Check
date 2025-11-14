# ----------------------------
# 1. Base image
# ----------------------------
FROM mcr.microsoft.com/playwright:v1.41.2-jammy

# Playwright image içinde:
# - Chromium
# - Firefox
# - WebKit
# - Linux system deps
# hazır yüklüdür.

# ----------------------------
# 2. Çalışma dizini
# ----------------------------
WORKDIR /app

# ----------------------------
# 3. Package dosyalarını kopyala
# ----------------------------
COPY package.json package-lock.json ./

# ----------------------------
# 4. Bağımlılıkları yükle
# ----------------------------
RUN npm install

# ----------------------------
# 5. Tüm dosyaları kopyala
# ----------------------------
COPY . .

# ----------------------------
# 6. Typescript build
# ----------------------------
RUN npm run build

# ----------------------------
# 7. Port
# ----------------------------
EXPOSE 3000

# ----------------------------
# 8. Start command
# ----------------------------
CMD ["node", "dist/index.js"]

