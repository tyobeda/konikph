#!/bin/bash
echo "=================================================="
echo "🚀 MEMULAI DEPLOYMENT PKSART KE VPS"
echo "=================================================="

# 1. Masuk ke direktori projek di VPS
echo "📂 [1/4] Masuk ke direktori /var/www/pks.art..."
cd /var/www/pks.art

# 2. Ambil update kode terbaru dari GitHub
echo "📥 [2/4] Mengunduh update kode dari GitHub main branch..."
git pull origin main

# 3. Build container Docker
echo "🔨 [3/4] Kompilasi Docker Build..."
docker compose build

# 4. Jalankan ulang container di background
echo "⚡ [4/4] Menjalankan ulang container Docker..."
docker compose up -d

echo "=================================================="
echo "✅ DEPLOYMENT SELESAI & BERHASIL TAYANG!"
echo "=================================================="
