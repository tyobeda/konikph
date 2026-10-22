# Rencana Fitur konikph.site

Dokumen ini memuat saran fitur untuk website **KONI Kabupaten Kepahiang** (`konikph.site`) yang dibangun dari basis kode **PKS.art (PKSart)**. Isinya terbagi menjadi fitur yang **dipertahankan**, **diubah**, **dikurangi/dihapus**, dan **ditambahkan**, ditutup dengan urutan pengerjaan.

> Acuan: dokumen `fitur.md` (35 rute PKSart) dan data cabor yang sudah dirapikan (`data_koni_kepahiang_2027.xlsx`/`.json`).

---

## 0. Prinsip Dasar

1. **Fork, bukan berbagi.** konikph.site memakai salinan kode sendiri, database baru, penyimpanan file baru, kunci rahasia baru, dan akun admin baru. Tidak ada data PKS yang dibawa.
2. **Bersih dari identitas partai.** KONI adalah organisasi olahraga yang menerima dana hibah daerah, jadi logo, font, brand kit, teks "PKS/DPW/PKSart", tagar, dan gambar bawaan harus hilang seluruhnya, termasuk di template email, halaman 404, footer, dan metadata SEO.
3. **Fungsi utama website KONI:** media berita, media informasi, dan Twibbon. Fitur lain bersifat pendukung.
4. **Dikelola non-teknisi.** Semua konten (berita, bingkai twibbon, pengurus, agenda) harus bisa diubah lewat panel admin tanpa menyentuh kode.

---

## 1. Fitur yang DIPERTAHANKAN (hampir tanpa perubahan)

| Fitur PKSart | Rute | Catatan untuk KONI |
|---|---|---|
| Generator Twibbon (Canvas) | `/twibbon/[id]` | Inti website. Geser, zoom, rotasi, ekspor HD, dan proses di browser sudah ideal. |
| Galeri template Twibbon | `/twibbon` | Ganti filter "wilayah" menjadi filter cabor/event. |
| Penghitung pemakaian twibbon | (di `/twibbon`) | Berguna untuk laporan kampanye (HUT KONI, Haornas, Porkab). |
| CMS halaman kustom | `/p/[slug]`, `/[slug]`, `/admin/pages` | Dipakai untuk Profil, Sejarah, Visi-Misi, Kebijakan Privasi, FAQ. |
| SEO dan OpenGraph dinamis | (CMS) | Penting agar tautan berita tampil rapi saat dibagikan ke WhatsApp. |
| Panel admin dan dashboard | `/admin` | Isi statistik disesuaikan (berita, twibbon, cabor). |
| Pengaturan situs global | `/admin/settings` | Identitas, logo, favicon, OG image, banner, dan sosial media. |
| Mode pemeliharaan per-modul | `/maintenance` | Berguna saat modul tertentu diperbaiki. |
| Analitik mandiri | `/admin/analytics` | Tanpa pihak ketiga, cocok untuk memantau pengunjung dan sumber trafik (WhatsApp, Instagram). |
| Autentikasi dasar | `/login`, `/reset-password` | Pertahankan alurnya, ganti peran dan teks. |
| Notifikasi dan toast | `/notifikasi` | Dipakai untuk status persetujuan konten. |
| Mode gelap/terang, mobile-first, bottom nav | (global) | Sebagian besar pengunjung memakai ponsel. |
| Halaman 404 kustom | `not-found.tsx` | Ganti teks dan identitas visualnya. |
| Moderasi dan lapor konten | (di galeri) | Dipertahankan bila galeri komunitas dipakai. |
| Filter kata terlarang | `/admin/settings` | Sesuaikan daftar kata untuk konteks KONI. |

---

## 2. Fitur yang DIUBAH (konsepnya dipakai, isinya diganti)

| Fitur PKSart | Menjadi di KONI | Perubahan utama |
|---|---|---|
| **Wilayah DPW** (`/admin/wilayah`) | **Cabang Olahraga (Cabor)** | Skema data diganti (lihat bagian 5). Diisi 23 cabor dari data yang sudah dirapikan. |
| **Direktori sekretariat DPW** (`/creators` tab 2) | **Direktori Cabor** | Ketua, WhatsApp satu klik, sekretariat, dan jadwal latihan. |
| **Direktori dan profil desainer** (`/creators`, `/creators/[id]`) | **Pengurus KONI dan Pengurus Cabor** | Foto, jabatan, dan kontak. Data terstruktur, bukan teks bebas. |
| **Register desainer** (`/register`) | **Daftar Pengurus/Kontributor** | Dropdown wilayah diganti **Cabor**. Persetujuan admin tetap dipertahankan. |
| **Peran pengguna** | Super Admin, Admin, Pengurus Cabor, Kontributor Media | Pengurus Cabor hanya mengelola konten cabornya sendiri. |
| **Galeri karya desain** (`/`, `/explore`, `/artwork/[id]`) | **Galeri Foto, Poster Event, dan Infografis** | Kategori diganti: Dokumentasi, Poster Event, Infografis, Piagam. Carousel dan unduhan tetap. |
| **Unggah dan Karya Saya** (`/upload`, `/my-artworks`) | **Unggah Konten Cabor** | Format master (PSD, AI, CDR, Figma) cukup yang relevan, tag diganti. |
| **Koleksi `/logo`** | **Logo KONI dan Logo Cabor** | Tag `#logo` dipertahankan untuk pengelompokan. |
| **Brand Kit** (`/assets`) | **Aset Resmi dan Unduhan** | Logo KONI, panduan identitas, AD/ART, surat edaran, formulir. Tentukan mana publik dan mana khusus pengurus. |
| **Banner CTA beranda** | Banner agenda/pengumuman | Mengarah ke twibbon event atau pendaftaran kegiatan. |
| **Beranda** | Beranda KONI | Hero berita utama, agenda terdekat, tombol Twibbon, sorotan prestasi, statistik ringkas (jumlah cabor, atlet, event). |

---

## 3. Fitur yang DIKURANGI atau DIHAPUS

| Fitur PKSart | Tindakan | Alasan |
|---|---|---|
| Leaderboard dan podium desainer (`/desainer`) | **Hapus** | Tidak relevan. Bisa diganti papan prestasi/medali (bagian 4). |
| `/admin/desainer`, `/admin/unduh` | **Hapus** | Analisis performa desainer tidak dibutuhkan. |
| Lencana verifikasi desainer | **Sederhanakan** | Cukup status "akun disetujui". Kalau dipakai, ubah artinya menjadi "Pengurus Terverifikasi". |
| Komentar publik di karya | **Matikan dulu** | Butuh moderator. Aktifkan setelah ada yang bertugas. |
| Tombol "Suka" dan hitung unduhan kreator | **Opsional/sembunyikan** | Metrik kompetisi desainer tidak diperlukan. Counter unduhan aset resmi tetap berguna. |
| Format file master panjang (Blender, Figma, dll.) | **Kurangi** | Sisakan yang dipakai (misalnya Canva, PDF, PNG). |
| Kategori galeri lama (Spanduk partai, Feed media sosial partai) | **Ganti** | Tidak sesuai konteks KONI. |
| Peta DPW se-Indonesia dan jumlah kontributor tiap wilayah | **Hapus/ganti** | Diganti peta lokasi GOR/sekretariat dan lokasi latihan cabor. |
| Seluruh teks, logo, font, dan data PKS | **Hapus total** | Lihat prinsip dasar nomor 2. |

---

## 4. Fitur yang DITAMBAHKAN (belum ada di PKSart)

### Prioritas 1: wajib untuk peluncuran

**1. Modul Berita** (kebutuhan utama)
- Data: judul, slug, isi, gambar utama, kategori, tag cabor, penulis, tanggal terbit, status (draf/terbit/terjadwal).
- Halaman: `/berita`, `/berita/[slug]`, `/berita/kategori/[nama]`, dan pencarian berita.
- Admin: `/admin/berita` dengan editor, jadwal terbit, unggulan di beranda.
- Pelengkap: tombol bagikan WhatsApp/Facebook, berita terkait, RSS, dan OpenGraph per berita.
- Kategori awal: Pengumuman, Kegiatan, Prestasi, Hasil Pertandingan, Opini/Artikel.

**2. Halaman Cabor** (`/cabor`, `/cabor/[slug]`)
- Daftar 23 cabor dalam bentuk kartu (logo, singkatan, olahraga).
- Detail: profil singkat, ketua dan pengurus, kontak WhatsApp, sekretariat, jadwal latihan, berita cabor, galeri, dan prestasi.

**3. Profil dan Pengurus KONI**
- Sejarah KONI Kepahiang (lokal, bukan hanya sejarah KONI nasional), visi-misi, struktur organisasi, dan dasar pembentukan.
- Daftar pengurus: nama, jabatan, foto, dan urutan tampil yang bisa diatur.

**4. Kontak dan Lokasi**
- Alamat sekretariat GOR Tebat Monok, email, WhatsApp, peta, dan tautan media sosial resmi.

### Prioritas 2: tahap lanjutan

**5. Agenda dan Kalender Kegiatan**
- Porkab, Porprov, kejuaraan, dan jadwal latihan, dengan filter cabor dan tombol "Tambah ke kalender".

**6. Prestasi dan Hasil Pertandingan**
- Event, tahun, nama atlet/tim, cabor, peringkat, dan medali.
- Dasar untuk papan perolehan medali (pengganti leaderboard desainer).

**7. Pusat Unduhan Dokumen**
- Formulir pendaftaran, AD/ART, surat edaran, panduan. Bisa memakai ulang modul Brand Kit/Aset.

**8. Galeri Foto dan Video**
- Album per kegiatan. Bisa memakai ulang modul galeri karya.

### Prioritas 3: opsional, setelah ada keputusan

**9. Data Atlet dan Pelatih**
- Tampilkan seminimal mungkin (nama, cabor, prestasi). Jangan tampilkan NIK atau alamat rumah. Atlet di bawah umur memerlukan izin orang tua.

**10. Transparansi Program dan Anggaran**
- Ringkasan program per cabor. Angka 2027 masih berstatus **usulan**, jadi harus diberi label jelas dan baru ditayangkan setelah disetujui pimpinan.

**11. Pendaftaran Online Kegiatan** (kejuaraan/seleksi)
- Formulir dengan unggah berkas dan ekspor data untuk panitia.

**12. Buletin/Newsletter dan Notifikasi WhatsApp Broadcast**
- Opsional, bila pengelola siap menjalankannya.

---

## 5. Perubahan Data: Wilayah menjadi Cabor

| Kolom lama (Wilayah) | Kolom baru (Cabor) |
|---|---|
| nama wilayah | nama resmi |
| kode daerah | singkatan (FORKI, PASI, dst.) |
| koordinator | ketua cabor |
| telepon | WhatsApp ketua/sekretaris |
| alamat kantor | sekretariat |
| latitude/longitude | lokasi latihan (opsional) |
| (baru) | jenis olahraga, logo cabor, jadwal latihan, deskripsi singkat, urutan tampil |
| toggle aktif | toggle aktif |

Anggaran usulan per cabor **tidak** dimasukkan ke tabel publik. Simpan sebagai data internal admin (opsional) atau halaman transparansi nanti.

Perlu ada satu entri khusus **"KONI (Umum)"** untuk konten yang tidak terkait cabor tertentu.

Data awal 23 cabor dan 3 pos non-cabor tersedia di `data_koni_kepahiang_2027.json`. Nama resmi masih perlu dicocokkan dengan SK/AD-ART KONI Kepahiang.

---

## 6. Peta Navigasi yang Disarankan

**Menu utama:** Beranda · Berita · Cabor · Twibbon · Agenda · Prestasi · Profil · Kontak

**Menu bawah (mobile):** Beranda · Berita · Twibbon · Cabor · Menu

**Footer:** Pengurus · Unduhan · Galeri · Kebijakan Privasi · Media Sosial

---

## 7. Daftar Periksa Non-Kode

- [ ] Logo resmi KONI Kepahiang (format PNG transparan dan vektor) dan warna identitas
- [ ] Nama resmi tiap cabor dan logo cabor
- [ ] Data pengurus KONI (nama, jabatan, foto) dan sejarah KONI Kepahiang
- [ ] Siapa yang menjadi admin dan penulis berita, dan seberapa sering diperbarui
- [ ] Keputusan: anggaran per cabor tampil publik atau tidak
- [ ] Angka riil usulan menggantikan angka sementara Rp 40.000.000 (9 cabor)
- [ ] Total usulan 2027 yang benar: **Rp 1.936.389.500** (selisih Rp 500 dari dokumen asli sudah dikoreksi)
- [ ] Domain: `konikph.site` (pertimbangkan mendaftarkan juga `.or.id` dan mengarahkannya ke situs yang sama), HTTPS, dan email pengirim
- [ ] Backup database terjadwal dan akun admin cadangan
- [ ] Bank twibbon awal: minimal 2-3 bingkai siap pakai saat peluncuran

---

## 8. Urutan Pengerjaan

| Tahap | Isi | Hasil |
|---|---|---|
| **1. Rebrand dan bersih-bersih** | Fork, database baru, identitas KONI, hapus jejak PKS, domain | Situs kosong bertema KONI yang aman |
| **2. Wilayah menjadi Cabor** | Ubah skema, isi 23 cabor, ubah menu dan formulir daftar | Direktori cabor aktif |
| **3. Berita dan halaman Cabor** | Modul Berita, `/cabor/[slug]`, Profil, Pengurus, Kontak | Website sudah layak diluncurkan |
| **4. Informasi tambahan** | Agenda, Prestasi, Unduhan, Galeri | Pusat informasi lengkap |
| **5. Opsional** | Atlet, transparansi anggaran, pendaftaran online | Sesuai keputusan pimpinan |

Twibbon dapat dipakai sejak tahap 1 karena fiturnya sudah jadi. Ini bisa menjadi fitur pembuka untuk peluncuran awal.

---

## 9. Ringkasan Cepat

- **Tetap:** Twibbon, CMS halaman, panel admin, pengaturan situs, analitik, mode pemeliharaan, login dasar, SEO, tampilan mobile.
- **Ubah:** Wilayah menjadi Cabor, desainer menjadi pengurus/kontributor, galeri karya menjadi galeri kegiatan, Brand Kit menjadi unduhan resmi.
- **Kurangi/hapus:** Leaderboard desainer, analisis performa desainer, komentar publik (sementara), peta DPW, seluruh identitas PKS.
- **Tambah:** Berita, halaman Cabor, Pengurus, Profil, Kontak, lalu Agenda, Prestasi, Unduhan, Galeri, dan opsional Atlet serta Transparansi.
