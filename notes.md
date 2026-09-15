# 📌 PKSart Project Handoff & Technical Notes

Dokumen ini dibuat khusus untuk mempermudah AI Agent berikutnya dalam memahami arsitektur, fitur, konfigurasi, dan status terkini dari proyek **PKSart** (Pusat Unduhan Aset Desain Resmi & Komunitas Desainer PKS).

---

## 🛠️ Stack Teknologi Utama
- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI Library & Icon**: React 19, Tailwind CSS v4, Lucide React
- **Database & ORM**: PostgreSQL via Prisma ORM
- **Authentication**: Custom Session-based Cookie Auth (`/api/auth/session`, `/api/auth/login`)
- **Deployment**: Docker Containerized Deployment di VPS Linux (IP: `43.133.155.196` / Domain: `pksart.site`)

---

## 🚀 Perintah Dasar (Development & Deployment)

### 1. Lokal (Development)
```bash
# Menjalankan server lokal (host 0.0.0.0 agar bisa diakses network lokal)
npm run dev

# Cek Tipe TypeScript (Wajib dijalankan setiap sebelum commit/push)
npx tsc --noEmit
```

### 2. Deployment ke VPS via SSH
Proyek menggunakan Docker Compose di VPS. Untuk mendeploy perubahan terbaru ke VPS:
```bash
ssh -i "C:\Users\Windows 10\.ssh\id_rsa" -o StrictHostKeyChecking=no ubuntu@43.133.155.196 "cd /home/ubuntu/pksart && git pull origin main && docker compose build --no-cache && docker compose up -d"
```
> ⚠️ **Catatan Penting Deployment**: Setiap ada perubahan kode React/Next.js, pastikan selalu menggunakan flag `--no-cache` pada `docker compose build` di VPS agar artifacts minified Next.js ter-compile ulang dari source terbaru!

---

## 🎯 Aturan Bisnis & Konvensi Penting (Critical Rules)

### 1. Terminologi & Labeling
- **Penggunaan Kata "Wilayah"**: Seluruh istilah daerah/DPW di UI publik telah disepakati menggunakan kata **"Wilayah"** (bukan "DPW" atau "Daerah" saja).
- **Footer Global**: Semua halaman utama dan form auth (Login/Register) wajib menyertakan komponen `<Footer />` dengan teks:
  ```html
  Made with ❤️ by <a href="https://namagraph.com" target="_blank">NDS</a>
  ```

### 2. Sistem Autentikasi & Proteksi Navigasi
- State `currentUser` diatur melalui `DataContext.tsx`.
- **Sensitivitas Menu "Aset Desain"**: Menu / Tab "Aset Desain" di Header & Beranda **HANYA BOLEH TAMPIL** untuk pengguna yang sudah login (`isMounted && currentUser`). Bagi pengguna publik (unauthenticated / incognito), menu ini disembunyikan.

### 3. Pilihan Wilayah pada Register & Upload
- Pilihan **Wilayah** pada halaman Register (`/register`) dan Upload (`/upload`) bersumber dari `dpwList` secara dinamis di database PostgreSQL (`DpwOffice` model).
- Field Wilayah pada form pendaftaran **tidak terisi otomatis (default kosong)** agar calon pendaftar memilih wilayahnya secara manual.

### 4. Input & Edit Metadata Karya (`Artwork`)
- **Form Unggah Karya (`/upload`)**:
  - Memiliki input **Tanggal Karya** (`type="date"`) dan **Jam Karya** (`type="time"`) terpisah (berjajar **2 kolom 1 baris** pada tampilan mobile HP).
  - Default terisi otomatis dengan tanggal dan waktu saat itu.
- **Form Edit Karya (Modal Edit di Halaman Detail Karya & My Artworks)**:
  - Dropdown "Wilayah DPW" **SUDAH DIHAPUS** pada modal edit.
  - Memiliki input **Tanggal Karya** & **Jam Karya** untuk mengubah timestamp `createdAt`.
  - **Tautan File Master**: Kolom input "Tautan File Master / Tautan Berbagi" bersifat kondisional. Kolom ini **HANYA MUNCIUL** apabila pilihan *Format File Master* bernilai selain `"Hanya gambar"` (misal: PSD, AI, CDR, CANVA, FIGMA). Jika diubah ke `"Hanya gambar"`, link otomatis dikosongkan.

### 6. Modul Utama Lain yang Tersedia
- **Brand Kits / Aset Resmi (`/assets`)**: Halaman khusus aset resmi (logo, font, panduan warna) yang hanya dapat diakses setelah login.
- **Generator Twibbon (`/twibbon`)**: Pembuat twibbon interaktif dengan fitur unggah bingkai PNG transparan & tempel foto pengguna.
- **Eksplorasi Karya (`/explore`)**: Fitur pencarian lanjutan dengan matriks filter kategori, format file master, serta sorting (Terpopuler, Paling Banyak Diunduh, Terbaru).
- **Halaman Creator / Desainer (`/creators`)**: Katalog profil desainer & pengurus wilayah PKS se-Indonesia.

### 7. Moderasi & Admin Dashboard (`/admin`)
- Akun desainer yang baru mendaftar membutuhkan persetujuan Admin (status `Pending Approval`).
- Pengaturan situs (`/admin/settings`) menyediakan fitur *Auto Approve Artworks*, filter kata-kata dilarang (*forbidden words*), serta manajemen banner & pemeliharaan modul (*maintenance mode*).

---

## 🔒 Variabel Lingkungan (.env)
- `DATABASE_URL`: URI koneksi PostgreSQL utama.
- `DIRECT_URL`: URI koneksi langsung PostgreSQL (direct connection Prisma).
- `JWT_SECRET` / `SESSION_SECRET`: Secret key untuk enkripsi cookie sesi auth.

---

## 📁 Struktur Berkas Penting

- `src/context/DataContext.tsx` — Pusat state global aplikasi (users, artworks, dpwList, auth state, dll.).
- `src/actions/artwork.ts` — Server Action Prisma untuk CRUD karya/artwork.
- `src/actions/user.ts` — Server Action Prisma untuk registrasi & manajemen pengguna.
- `src/actions/dpw.ts` — Server Action Prisma untuk manajemen wilayah/DPW.
- `src/app/register/page.tsx` — Halaman registrasi akun desainer baru.
- `src/app/login/page.tsx` — Halaman login dengan fitur toggle eye (show/hide password).
- `src/app/upload/page.tsx` — Form tambah karya baru (termasuk kompresi gambar otomatis < 2MB).
- `src/app/artwork/[id]/ArtworkDetailContent.tsx` — Detail karya & modal edit postingan karya.
- `src/app/my-artworks/page.tsx` — Manajemen karya pribadi uploader & modal edit postingan.
- `src/app/admin/artworks/page.tsx` — Dashboard admin untuk moderasi & edit metadata karya.
- `src/components/Footer.tsx` — Komponen Footer global (*Made with ❤️ by NDS*).

---

## 💡 Status Terakhir Sebelum Handoff
- ✅ Semua fitur terbaru sudah dites menggunakan `npx tsc --noEmit` dan berjalan lancar.
- ✅ Server lokal berjalan di port `3000` (`http://localhost:3000`).
- ✅ Versi Git terkini di-push ke branch `main`.

*Semoga sukses melanjutkan pengembangan proyek PKSart!* 🎨🔥
