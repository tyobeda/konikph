# 🎨 Dokumentasi Lengkap Halaman & Fitur PKSart

Dokumen ini menjabarkan seluruh struktur halaman, rute aplikasi, dan daftar fitur yang tersedia pada platform **PKSart** (Pusat Unduhan Aset Desain Resmi & Komunitas Desainer PKS).

---

## 📊 1. Ringkasan Halaman Aplikasi

Aplikasi PKSart memiliki total **35 halaman (routes)** aktif (atau **36** termasuk halaman 404 Kustom), yang dikelompokkan ke dalam 7 klaster utama:

| No | Klaster Halaman | Jumlah Rute | Hak Akses |
|---|---|:---:|---|
| 1 | **Halaman Publik & Galeri Utama** | 8 Rute | Publik (Semua Pengunjung) |
| 2 | **Generator & Galeri Twibbon** | 3 Rute | Publik & Kreator |
| 3 | **Brand Kit / Aset Resmi Terproteksi** | 2 Rute | Khusus Pengguna Terdaftar (Login) |
| 4 | **Autentikasi & Akun Pengguna** | 6 Rute | Publik & Pengguna Terdaftar |
| 5 | **Kontribusi & Manajemen Karya Kreator** | 2 Rute | Kreator / Desainer Terverifikasi |
| 6 | **CMS Halaman Kustom & Dinamis** | 2 Rute | Publik |
| 7 | **Panel Administrasi (Super Admin / Admin)** | 12 Rute | Super Admin & Admin |
| **Total** | | **35 Rute** | *(+1 Halaman 404 Kustom)* |

---

## 🗺️ 2. Daftar Lengkap Seluruh Halaman (35 Rute)

### A. Halaman Publik & Galeri Utama
1. **`/` (Beranda / Homepage)**
   - *File*: `src/app/page.tsx`
   - *Akses*: Publik
   - *Fungsi*: Etalase utama platform, menampilkan hero banner karya unggulan, widget statistik unduhan & karya nasional, bilah pencarian cepat, filter kategori tematik, galeri karya grid dengan *infinite feel*, dan tautan banner media sosial resmi.
2. **`/explore` (Eksplorasi Karya)**
   - *File*: `src/app/explore/page.tsx`
   - *Akses*: Publik
   - *Fungsi*: Pencarian lanjutan karya dengan multi-filter kategori (Poster, Spanduk, Infografis, dll), filter format file master (PSD, AI, CDR, Canva, Figma, PDF), filter asal wilayah, serta pengurutan (Terbaru, Terpopuler, Paling Banyak Diunduh).
3. **`/artwork/[id]` (Detail Karya Desain)**
   - *File*: `src/app/artwork/[id]/page.tsx`
   - *Akses*: Publik
   - *Fungsi*: Tampilan pratinjau resolusi tinggi (mendukung slide carousel multi-gambar), unduhan cerdas (*smart download*), tombol sukai (like), hitung tampilan (view counter), bagikan ke media sosial, kolom komentar diskusi, tombol lapor konten, info kreator, serta modal edit karya (bagi pemilik karya atau Admin).
4. **`/logo` (Koleksi Logo Resmi PKS)**
   - *File*: `src/app/logo/page.tsx`
   - *Akses*: Publik
   - *Fungsi*: Katalog khusus seluruh materi ber-tag `#logo` dan varian logo resmi PKS dengan filter format mentahan, pratinjau transparan, dan unduhan cepat.
5. **`/creators` (Direktori Desainer & Wilayah)**
   - *File*: `src/app/creators/page.tsx`
   - *Akses*: Publik
   - *Fungsi*: Direktori resmi dua tab: Tab daftar seluruh desainer terdaftar se-Indonesia dan Tab direktori kantor sekretariat DPW PKS lengkap dengan kontak WhatsApp koordinator wilayah.
6. **`/desainer` (Peringkat / Leaderboard Desainer)**
   - *File*: `src/app/desainer/page.tsx`
   - *Akses*: Publik
   - *Fungsi*: Papan peringkat desainer terpopuler PKSart dengan podium 3 besar (Juara 1, 2, dan 3) dan daftar peringkat 4 ke bawah berdasarkan akumulasi total unduhan dan apresiasi sukai (likes).
7. **`/creators/[id]` (Profil Publik Desainer)**
   - *File*: `src/app/creators/[id]/page.tsx`
   - *Akses*: Publik
   - *Fungsi*: Halaman portofolio desainer menampilkan bio, foto profil, lencana verifikasi, asal wilayah, kontak WhatsApp & portofolio medsos, metrik statistik, serta galeri seluruh karya yang diunggah oleh desainer bersangkutan.
8. **`/maintenance` (Status Pemeliharaan Sistem)**
   - *File*: `src/app/maintenance/page.tsx`
   - *Akses*: Publik
   - *Fungsi*: Tampilan status informatif ketika situs secara keseluruhan atau modul tertentu (Karya, Twibbon, Creators, Assets, Login) sedang dalam mode pemeliharaan.

---

### B. Generator & Galeri Twibbon
9. **`/twibbon` (Galeri Template Twibbon)**
   - *File*: `src/app/twibbon/page.tsx`
   - *Akses*: Publik
   - *Fungsi*: Katalog bingkai foto / twibbon kampanye dan ucapan resmi PKS, pratinjau bingkai transparan, filter wilayah, pencarian, dan penghitung riil penggunaan twibbon (`{usedCount}x Dibuat`).
10. **`/twibbon/[id]` (Generator Twibbon Interaktif)**
    - *File*: `src/app/twibbon/[id]/page.tsx`
    - *Akses*: Publik
    - *Fungsi*: Mesin pembuat twibbon langsung di peramban (browser) menggunakan HTML5 Canvas. Pengguna dapat mengunggah foto pribadi, menggeser (drag), memperbesar/memperkecil (pinch/zoom), memutar (rotate), lalu mengunduh hasil foto berbingkai dengan kualitas HD.
11. **`/twibbon/create` (Unggah Bingkai Twibbon Baru)**
    - *File*: `src/app/twibbon/create/page.tsx`
    - *Akses*: Kreator / Desainer Login (atau dibatasi khusus Admin sesuai pengaturan situs)
    - *Fungsi*: Form pengunggahan bingkai foto PNG transparan baru, judul kampanye, rasio bingkai (1:1, 4:5, 9:16), asal wilayah, dan deskripsi/keterangan template (hingga 1000 karakter).

---

### C. Brand Kit / Aset Resmi Terproteksi
12. **`/assets` (Pusat Unduhan Brand Kit & Aset Resmi)**
    - *File*: `src/app/assets/page.tsx`
    - *Akses*: Terproteksi (Hanya Pengguna yang Telah Login)
    - *Fungsi*: Hub aset resmi partai: logo vektor (AI, EPS, SVG, PNG), panduan warna resmi partai, berkas tipografi/font resmi, elemen grafis, dan kit media sosial resmi.
13. **`/assets/[slug]` (Detail Berkas Brand Kit)**
    - *File*: `src/app/assets/[slug]/page.tsx`
    - *Akses*: Terproteksi (Pengguna Login)
    - *Fungsi*: Halaman rincian aset resmi, spesifikasi format, panduan pemakaian, pratinjau resolusi tinggi, tombol unduh berkas master mentahan, serta rekomendasi aset terkait lainnya.

---

### D. Autentikasi & Akun Pengguna
14. **`/login` (Masuk Akun)**
    - *File*: `src/app/login/page.tsx`
    - *Akses*: Publik
    - *Fungsi*: Autentikasi email dan kata sandi, toggle show/hide kata sandi, auto-redirect cerdas sesuai role (ke admin dashboard atau profil desainer), dan opsi pemulihan akun.
15. **`/register` (Pendaftaran Akun Desainer)**
    - *File*: `src/app/register/page.tsx`
    - *Akses*: Publik
    - *Fungsi*: Form pendaftaran desainer baru dengan input Nama, Email, WhatsApp aktif (wajib), Alamat lengkap, dan pilihan Wilayah DPW dinamis dari basis data.
16. **`/pending-approval` (Status Menunggu Persetujuan Admin)**
    - *File*: `src/app/pending-approval/page.tsx`
    - *Akses*: Pengguna Terdaftar (Status: Pending)
    - *Fungsi*: Informasi status bagi akun desainer baru yang sedang ditinjau oleh Super Admin sebelum mendapatkan hak akses unggah karya.
17. **`/reset-password` (Permintaan & Reset Kata Sandi)**
    - *File*: `src/app/reset-password/page.tsx`
    - *Akses*: Publik
    - *Fungsi*: Form pengajuan pemulihan kata sandi melalui tautan token terenkripsi.
18. **`/profile` (Pengaturan Akun Desainer)**
    - *File*: `src/app/profile/page.tsx`
    - *Akses*: Pengguna Login
    - *Fungsi*: Pengaturan data pribadi desainer: perbarui nama, foto avatar, nomor WhatsApp, domisili wilayah, alamat lengkap, dan ubah kata sandi akun.
19. **`/notifikasi` (Pusat Notifikasi Pengguna)**
    - *File*: `src/app/notifikasi/page.tsx`
    - *Akses*: Pengguna Login
    - *Fungsi*: Riwayat pemberitahuan aktivitas akun: status persetujuan karya, status verifikasi akun oleh admin, laporan, serta pengumuman sistem.

---

### E. Kontribusi & Manajemen Karya Kreator
20. **`/upload` (Unggah Karya Desain Baru)**
    - *File*: `src/app/upload/page.tsx`
    - *Akses*: Kreator / Desainer Aktif
    - *Fungsi*: Form unggah karya desain dengan fitur multi-slide/carousel, kompresi gambar otomatis client-side (<2MB), penentuan tanggal & jam karya mandiri, pemilihan format file master (PSD, AI, CDR, CANVA, FIGMA, dll), tautan berbagi master, kategori, tagar, dan deskripsi hingga 2000 karakter.
21. **`/my-artworks` (Manajemen Karya Saya)**
    - *File*: `src/app/my-artworks/page.tsx`
    - *Akses*: Kreator / Desainer Login
    - *Fungsi*: Dashboard portofolio pribadi kreator: tab filter status karya (Semua, Disetujui, Menunggu Moderasi, Ditolak), metrik total unduhan & sukai per karya, tombol pratinjau, modal edit metadata karya, dan konfirmasi hapus karya.

---

### F. CMS Halaman Kustom & Dinamis
22. **`/p/[slug]` (Halaman Kustom CMS Publik)**
    - *File*: `src/app/p/[slug]/page.tsx`
    - *Akses*: Publik
    - *Fungsi*: Perender halaman statis/kebijakan seperti Panduan Desain, Syarat & Ketentuan, FAQ, Kebijakan Privasi yang dibuat dan disunting melalui modul CMS admin.
23. **`/[slug]` (Halaman Kustom Root Path / Vanity URL)**
    - *File*: `src/app/[slug]/page.tsx`
    - *Akses*: Publik
    - *Fungsi*: Perender halaman kustom yang memilih rute root URL (misal: `/panduan`, `/tentang-kami`) dengan integrasi OpenGraph metadata dinamis.

---

### G. Panel Administrasi (Super Admin / Admin)
24. **`/admin` (Dashboard Overview)**
    - *File*: `src/app/admin/page.tsx`
    - *Akses*: Super Admin & Admin
    - *Fungsi*: Rangkuman statistik platform secara komprehensif: total karya terbit, total kreator, total unduhan nasional, jumlah karya pending moderasi, jumlah akun pending approval, serta tautan cepat ke modul penting.
25. **`/admin/analytics` (Analisis Pengunjung & Performa Web)**
    - *File*: `src/app/admin/analytics/page.tsx`
    - *Akses*: Super Admin & Admin
    - *Fungsi*: Analitik internal mandiri tanpa pihak ketiga: total tampilan halaman (pageviews), pengunjung unik, tren perangkat (Mobile vs Desktop), browser, sistem operasi, sebaran pengunjung per provinsi/wilayah, serta asal rujukan trafik (Instagram, Direct, Google, WhatsApp).
26. **`/admin/artworks` (Manajemen & Moderasi Karya)**
    - *File*: `src/app/admin/artworks/page.tsx`
    - *Akses*: Super Admin & Admin
    - *Fungsi*: Pusat moderasi karya: persetujuan (approve), penolakan (reject) dengan alasan, penyuntingan lengkap metadata karya, penggantian gambar, penetapan status Unggulan (*Featured*), serta penghapusan karya.
27. **`/admin/creators` (Kelola Desainer & Pengguna)**
    - *File*: `src/app/admin/creators/page.tsx`
    - *Akses*: Super Admin & Admin
    - *Fungsi*: Manajemen akun: persetujuan akun baru pending, penetapan lencana verifikasi desainer (*Verified Badge*), penyesuaian hak akses (Super Admin, Admin, Desainer), penangguhan (suspend), dan pencarian desainer.
28. **`/admin/wilayah` (Kelola Wilayah DPW / Daerah)**
    - *File*: `src/app/admin/wilayah/page.tsx`
    - *Akses*: Super Admin & Admin
    - *Fungsi*: Manajemen wilayah struktur PKS se-Indonesia: tambah wilayah baru, ubah nama wilayah, kode daerah, nama koordinator, nomor telepon, alamat kantor sekretariat, koordinat peta (latitude/longitude), dan toggle status aktif wilayah.
29. **`/admin/twibbon` (Moderasi & Kelola Template Twibbon)**
    - *File*: `src/app/admin/twibbon/page.tsx`
    - *Akses*: Super Admin & Admin
    - *Fungsi*: Moderasi bingkai twibbon yang diunggah oleh desainer: status persetujuan, penetapan bingkai unggulan, peninjauan pratinjau, dan penghapusan bingkai yang melanggar.
30. **`/admin/brandkit` (Kelola Brand Kit & Aset Resmi)**
    - *File*: `src/app/admin/brandkit/page.tsx`
    - *Akses*: Super Admin & Admin
    - *Fungsi*: Pengelolaan aset resmi partai: tambah kategori aset baru, unggah file master mentahan, atur pratinjau, kelola hak akses publik/privat, dan pantau jumlah unduhan aset resmi.
31. **`/admin/pages` (Daftar Halaman Kustom CMS)**
    - *File*: `src/app/admin/pages/page.tsx`
    - *Akses*: Super Admin & Admin
    - *Fungsi*: Tabel daftar halaman kustom, pengaturan slug rute, toggle status publikasi, pemilihan rute `/p/:slug` vs root `/:slug`, dan pembuatan halaman baru.
32. **`/admin/pages/[id]` (Editor Halaman Kustom)**
    - *File*: `src/app/admin/pages/[id]/page.tsx`
    - *Akses*: Super Admin & Admin
    - *Fungsi*: Editor konten visual terstruktur untuk merancang isi artikel halaman kustom, pengaturan SEO, dan gambar thumbnail OpenGraph pratinjau media sosial.
33. **`/admin/settings` (Pengaturan Konfigurasi Global Situs)**
    - *File*: `src/app/admin/settings/page.tsx`
    - *Akses*: Super Admin
    - *Fungsi*: Pengaturan komprehensif sistem yang terbagi dalam 5 tab:
      - *Identitas Situs*: Nama web, deskripsi, logo navbar, logo admin, logo footer, favicon, dan thumbnail OG image media sosial.
      - *Banner Pengumuman / CTA*: Judul ajakan, deskripsi, gambar latar banner, tautan tombol utama, dan multi-tautan sosial media resmi.
      - *Moderasi Konten*: Toggle auto-approve karya desainer, toggle izin tautan di kolom komentar, filter kata-kata dilarang (*forbidden words*), serta batasan pembuat twibbon.
      - *Format File Master*: Manajemen daftar format file mentahan (PSD, AI, CDR, CANVA, FIGMA, PDF, dll) secara dinamis.
      - *Mode Pemeliharaan (Maintenance)*: Saklar pemeliharaan per-modul atau menyeluruh dilengkapi pesan khusus.
34. **`/admin/desainer` (Analisis Performa Desainer)**
    - *File*: `src/app/admin/desainer/page.tsx`
    - *Akses*: Super Admin & Admin
    - *Fungsi*: Tampilan analisis mendalam performa desainer se-Indonesia diurutkan dari total unduhan, jumlah karya, dan tingkat keterlibatan apresiasi pengguna.
35. **`/admin/unduh` (Peringkat Unduhan Karya)**
    - *File*: `src/app/admin/unduh/page.tsx`
    - *Akses*: Super Admin & Admin
    - *Fungsi*: Log performa karya paling diminati di Indonesia dengan metrik unduhan riil, filter kata kunci, dan tautan pratinjau karya.

---

### H. Halaman Utilitas & Error
36. **`not-found.tsx` (Halaman Error 404 Kustom)**
    - *File*: `src/app/not-found.tsx`
    - *Akses*: Publik
    - *Fungsi*: Tampilan ramah bertema PKSart saat halaman atau karya yang dicari tidak ditemukan atau telah dihapus, dilengkapi tombol kembali ke Beranda dan pencarian alternatif.

---

## ⚡ 3. Penjabaran Fitur Utama Platform PKSart

### 1. Sistem Galeri & Kurasi Karya Desain
- **Multi-Slide Carousel Viewer**: Dukungan unggah karya dengan beberapa slide gambar sekaligus dalam 1 postingan karya (format carousel Instagram), dilengkapi navigasi titik mandiri, gesture swipe di perangkat layar sentuh, dan tombol navigasi kiri-kanan.
- **Kompresi Gambar Otomatis Client-Side**: Sebelum gambar diunggah ke server, peramban secara otomatis mengompresi gambar tanpa mengurangi ketajaman visual sehingga ukuran berkas tetap di bawah 2MB untuk mempercepat loading web.
- **Pencarian & Multi-Filtering Lanjutan**: Pengunjung dapat mencari karya berdasarkan judul, tagar, kategori (Poster, Spanduk, Infografis, Feed Media Sosial, dll), format mentahan, maupun asal wilayah DPW.
- **Sorting Dinamis**: Pilihan pengurutan karya berdasarkan: Terbaru, Terpopuler, dan Paling Banyak Diunduh.
- **Tagar Khusus `#logo`**: Deteksi tag otomatis untuk mengelompokkan desain ke halaman `/logo`.

### 2. Sistem Smart Download (Unduhan Cerdas)
- **Unduh Otomatis File Asli**: Jika karya bertipe *"Hanya gambar"*, sistem langsung mengunduh berkas gambar JPG/PNG resolusi penuh asli tanpa perantara.
- **Integrasi Langsung Canva**: Tautan Canva secara otomatis dibuka di tab baru untuk memudahkan desainer menduplikasi template.
- **Integrasi Google Drive Direct Download**: Tautan Google Drive file tunggal otomatis dikonversi menjadi *direct download link*, sementara tautan folder tetap dibuka di Google Drive.
- **Pencatatan Counter Unduhan Real-Time**: Setiap kali tombol unduh ditekan, sistem secara otomatis mengagregasi total unduhan pada basis data dan memperbarui statistik kreator.

### 3. Generator Twibbon Interaktif (Canvas Twibbon Engine)
- **Mesin Canvas Berperforma Tinggi**: Memproses bingkai transparan PNG dan foto pengguna secara langsung di sisi client (browser) tanpa membebani server.
- **Kontrol Penuh Manipulasi Foto**:
  - Geser (Pan & Drag) posisi foto di dalam bingkai.
  - Perbesar / perkecil (Pinch to Zoom & Scale Slider).
  - Rotasi derajat foto (Rotation Control).
  - Ganti foto tanpa me-refresh halaman.
- **Ekspor Hasil Kualitas HD**: Menghasilkan berkas gambar akhir beresolusi tinggi siap bagikan ke WhatsApp, Instagram, dan Facebook.
- **Metrik Pemakaian Riil**: Penghitung riil penggunaan twibbon (`{usedCount}x Dibuat`) dan daftar penggunaan terkini.

### 4. Brand Kit & Aset Resmi Terproteksi
- **Proteksi Hak Akses**: Halaman `/assets` dan `/assets/[slug]` hanya dapat dibuka oleh desainer resmi yang telah login. Tautan menu disembunyikan bagi pengunjung umum/anonim.
- **Penyimpanan Aset Mentahan Resmi**: Menampung berkas vektor AI, EPS, SVG, font resmi partai, kode warna hex/CMYK resmi, dan elemen grafis identitas partai.
- **Kategori & Pratinjau**: Pengelompokan aset berdasarkan kategori lengkap dengan deskripsi aturan penggunaan logo & font partai.

### 5. Komunitas Desainer & Struktur Wilayah
- **Peta & Direktori Sekretariat DPW PKS**: Memuat data kantor wilayah PKS se-Indonesia, nama koordinator, nomor kontak WhatsApp yang dapat dihubungi langsung dengan satu klik, dan jumlah kontributor aktif di tiap daerah.
- **Podium & Leaderboard Desainer**: Halaman apresiasi desainer terbaik PKSart dengan podium visual 3 besar dan peringkat nasional berdasarkan total unduhan karya.
- **Profil Desainer Publik**: Setiap desainer memiliki halaman profil mandiri (`/creators/[slug]`) yang menampilkan portofolio karya, nomor WhatsApp, akun media sosial, dan lencana verifikasi resmi.

### 6. Sistem Moderasi & Keamanan Konten
- **Bebas Moderasi Khusus Akun Terverifikasi**: Desainer yang telah mendapatkan lencana terverifikasi (`isVerified: true`) atau memiliki role *Super Admin* memiliki hak istimewa bebas moderasi (karya langsung terbit seketika saat diunggah).
- **Sistem Moderasi Akun Non-Verifikasi**: Jika opsi *Auto Approve Artworks* dimatikan pada pengaturan, karya dari desainer baru berstatus *Pending* dan menunggu persetujuan Admin di `/admin/artworks`.
- **Filter Kata Terlarang (Forbidden Words)**: Penyaringan otomatis kata-kata tidak pantas pada judul atau deskripsi karya.
- **Lapor Karya (Report Content)**: Fitur pelaporan karya bermasalah oleh pengguna kepada admin untuk ditindaklanjuti.

### 7. Mesin Analitik Mandiri (Zero Third-Party Tracker)
- **Privasi & Kecepatan**: Tidak bergantung pada Google Analytics pihak ketiga, melainkan dicatat secara asinkron langsung ke PostgreSQL melalui model `PageView`.
- **Visualisasi Komprehensif**: Menyajikan grafik tren pengunjung harian, persentase mobile vs desktop, peramban (Chrome, Safari, Edge), sistem operasi, wilayah provinsi pengunjung, dan saluran rujukan (Instagram, Google, Direct, WhatsApp).

### 8. CMS Halaman Kustom (Custom Pages)
- **Pembuatan Halaman Bebas**: Super Admin dapat membuat halaman informasi baru tanpa perlu koding ulang.
- **Rute URL Fleksibel**: Dapat memilih apakah halaman beralamat di `/p/[slug]` (misal: `/p/faq`) atau langsung di root `/[slug]` (misal: `/panduan`).
- **OpenGraph & SEO Dinamis**: Pengaturan judul, deskripsi, dan gambar pratinjau thumbnail untuk setiap halaman yang dibuat.

### 9. Manajemen Pengaturan Global & Mode Pemeliharaan
- **Kustomisasi Identitas Platform**: Ganti nama web, logo navbar, logo panel admin, logo footer, dan favicon langsung dari dasbor tanpa mengubah berkas kode sumber.
- **Banner Pengumuman & Multi-Sosmed**: Konfigurasi teks banner pengumuman di beranda, tombol aksi, serta multi-tautan akun media sosial resmi.
- **Mode Pemeliharaan Per-Modul**: Super Admin dapat mengaktifkan mode *Maintenance* secara spesifik pada modul yang sedang diperbaiki (misal hanya modul Twibbon atau Creators) tanpa melumpuhkan seluruh platform.
- **Format File Master Dinamis**: Super Admin dapat menambah dan mengubah daftar format master (PSD, AI, CDR, Canva, Figma, Blender, dll).

### 10. Desain & Aksesibilitas Modern
- **Mode Gelap & Terang (Dark / Light Theme)**: Sistem tema bawaan yang tersinkronisasi dengan preferensi peramban pengguna atau dapat diubah manual via tombol toggle di header.
- **Mobile-First & Responsif**: Seluruh navigasi, kartu karya, form unggah, dan modal dirancang presisi untuk pengalaman pengguna ponsel pintar (termasuk bottom navigation bar mobile).
- **Notifikasi Toast Interaktif**: Umpan balik visual langsung saat pengguna menyalin tautan, mengunduh karya, atau menyimpan pengaturan.

---

*Dokumen ini diperbarui secara berkala sesuai dengan evolusi dan rilis fitur terbaru PKSart.*
