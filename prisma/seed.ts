import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { INITIAL_CABOR_KEPAHIANG } from '../src/data/cabor';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.comment.deleteMany();
  await prisma.artworkReport.deleteMany();
  await prisma.artwork.deleteMany();
  await prisma.twibbonFrame.deleteMany();
  await prisma.user.deleteMany();
  await prisma.dpwOffice.deleteMany();
  await prisma.brandKit.deleteMany();

  console.log('Seeding Cabang Olahraga KONI Kepahiang...');
  for (const cabor of INITIAL_CABOR_KEPAHIANG) {
    await prisma.dpwOffice.create({
      data: {
        id: `cabor-${cabor.code.toLowerCase()}`,
        name: cabor.name,
        code: cabor.code,
        coordinator: cabor.coordinator,
        phone: cabor.phone,
        email: cabor.email,
        address: cabor.address,
        category: cabor.category,
        description: cabor.description,
        schedule: cabor.schedule,
        orderIndex: cabor.orderIndex,
        lat: cabor.lat,
        lng: cabor.lng,
        activeCreators: 0,
        totalArtworks: 0,
        isActive: true,
      }
    });
  }

  console.log('Seeding Users & Pengurus...');
  const createdUsers = [];

  // Super Admin KONI
  const superAdmin = await prisma.user.create({
    data: {
      id: 'superadmin_1',
      name: 'Super Admin KONI Kepahiang',
      email: 'admin@konikph.site',
      phone: '081199887766',
      password: bcrypt.hashSync('admin', 10),
      address: 'Sekretariat KONI GOR Tebat Monok, Kepahiang',
      region: 'KONI (Umum)',
      role: 'Super Admin',
      avatar: '/favicon.ico',
      isVerified: true,
      status: 'Active',
    }
  });
  createdUsers.push(superAdmin);

  const pengurusData = [
    { name: 'Erwin Agustinus, ST', email: 'erwin@konikph.site', region: 'KONI (Umum)', role: 'Admin' },
    { name: 'Jaya Saputra, S. Pd, Gr', email: 'jaya@konikph.site', region: 'KONI (Umum)', role: 'Admin' },
    { name: 'Redo Terisdo, S. Pd, Gr', email: 'redo@konikph.site', region: 'KONI (Umum)', role: 'Admin' },
    { name: 'Riki Yuliansyah', email: 'riki@konikph.site', region: 'KONI (Umum)', role: 'Admin' },
    { name: 'H. Amwat, S.Sos', email: 'amwat@konikph.site', region: 'IPSI (Pencak Silat)', role: 'Pengurus Cabor' },
    { name: 'Giri Ramanda, ST', email: 'giri@konikph.site', region: 'PSSI (Sepak Bola & Futsal)', role: 'Pengurus Cabor' },
    { name: 'Ir. Ahmad Yani', email: 'ahmadyani@konikph.site', region: 'FORKI (Karate)', role: 'Pengurus Cabor' },
    { name: 'Hendra Saputra, SE', email: 'hendra@konikph.site', region: 'PERBASI (Bola Basket)', role: 'Pengurus Cabor' },
    { name: 'Suherman, S.Kom', email: 'suherman@konikph.site', region: 'PERCASI (Catur)', role: 'Pengurus Cabor' },
    { name: 'Andrianto, M.Pd', email: 'andrianto@konikph.site', region: 'PASI (Atletik)', role: 'Pengurus Cabor' },
  ];

  for (const [index, p] of pengurusData.entries()) {
    const u = await prisma.user.create({
      data: {
        id: `user_${index + 1}`,
        name: p.name,
        email: p.email,
        phone: `0812730000${(index + 1).toString().padStart(2, '0')}`,
        address: `Jl. Lintas Kepahiang - Bengkulu No. ${index + 1}, Kepahiang`,
        region: p.region,
        role: p.role,
        isVerified: true,
        status: 'Active',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=DC2626&color=fff&size=200`,
      }
    });
    createdUsers.push(u);
  }

  console.log('Seeding Dokumen & Aset Resmi...');
  const brandKits = [
    { title: 'Logo Resmi KONI Kabupaten Kepahiang', format: 'PNG / SVG', description: 'Ukuran 2.5 MB', fileUrl: '#', iconType: 'image', color: 'bg-red-50 text-red-600 border-red-200', category: 'Logo' },
    { title: 'AD / ART & Pedoman Organisasi KONI', format: 'PDF', description: 'Ukuran 4.8 MB', fileUrl: '#', iconType: 'file-text', color: 'bg-blue-50 text-blue-600 border-blue-200', category: 'Dokumen' },
    { title: 'Formulir Pendaftaran Atlet & Verifikasi Cabor', format: 'DOCX / PDF', description: 'Ukuran 1.2 MB', fileUrl: '#', iconType: 'file-text', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', category: 'Formulir' },
    { title: 'Panduan Penyelenggaraan Porkab & Porprov Kepahiang', format: 'PDF', description: 'Ukuran 3.1 MB', fileUrl: '#', iconType: 'file-text', color: 'bg-amber-50 text-amber-600 border-amber-200', category: 'Panduan' },
  ];

  for (const kit of brandKits) {
    await prisma.brandKit.create({
      data: kit
    });
  }

  console.log('Seeding Dummy Postingan Karya (Artworks)...');
  const dummyArtworks = [
    {
      id: 'art-sambutan-ketua-koni',
      title: 'Sambutan & Arahan Ketua Umum KONI Kabupaten Kepahiang',
      slug: 'sambutan-arahan-ketua-umum-koni-kabupaten-kepahiang',
      description: 'Sambutan resmi Ketua Umum KONI Kabupaten Kepahiang Erwin Agustinus, ST mengenai komitmen pembinaan atlet daerah, sinergi 23 cabang olahraga, transparansi tata kelola, dan tekad membawa Kepahiang menembus 3 besar Porprov Bengkulu 2026.',
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200',
      category: 'Publikasi Resmi',
      region: 'KONI (Umum)',
      format: 'PDF / PNG',
      tags: ['Sambutan', 'KetuaKONI', 'ErwinAgustinus', 'VisiMisi', 'Porprov2026', 'KepahiangMaju'],
      likesCount: 384,
      commentsCount: 18,
      downloadsCount: 490,
      stampsCount: 120,
      authorId: 'superadmin_1',
      isFeatured: true,
      status: 'Disetujui',
    },
    {
      id: 'art-porprov-2026',
      title: 'Semangat Menuju Porprov Bengkulu 2026',
      slug: 'semangat-menuju-porprov-bengkulu-2026',
      description: 'Poster resmi kampanye persiapan kontingen atlet Kabupaten Kepahiang menuju Pekan Olahraga Provinsi (Porprov) Bengkulu 2026.',
      imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1200',
      category: 'Poster Event & Kejuaraan',
      region: 'KONI (Umum)',
      format: 'PSD / PNG',
      tags: ['Porprov', 'Bengkulu2026', 'KONI', 'Prestasi'],
      likesCount: 245,
      commentsCount: 12,
      downloadsCount: 520,
      stampsCount: 88,
      authorId: 'superadmin_1',
      isFeatured: false,
      status: 'Disetujui',
    },
    {
      id: 'art-kejurda-karate',
      title: 'Kejurda Karate Bupati Cup Kepahiang 2026',
      slug: 'kejurda-karate-bupati-cup-kepahiang-2026',
      description: 'Desain publikasi dan pamflet kejuaraan daerah karate se-Kabupaten Kepahiang binaan FORKI.',
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=1200',
      category: 'Poster Event & Kejuaraan',
      region: 'FORKI (Karate)',
      format: 'AI / PDF',
      tags: ['Karate', 'FORKI', 'BupatiCup'],
      likesCount: 189,
      commentsCount: 8,
      downloadsCount: 310,
      stampsCount: 54,
      authorId: 'user_7',
      isFeatured: false,
      status: 'Disetujui',
    },
    {
      id: 'art-seleksi-atletik',
      title: 'Seleksi Atletik Menuju Porprov 2026',
      slug: 'seleksi-atletik-menuju-porprov-2026',
      description: 'Dokumentasi dan infografis pelaksanaan seleksi terbuka cabor atletik PASI Kepahiang di Stadion Tebat Monok.',
      imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=1200',
      category: 'Dokumentasi Kegiatan',
      region: 'PASI (Atletik)',
      format: 'JPG / PNG',
      tags: ['Atletik', 'PASI', 'Seleksi'],
      likesCount: 142,
      commentsCount: 5,
      downloadsCount: 280,
      stampsCount: 42,
      authorId: 'user_10',
      isFeatured: false,
      status: 'Disetujui',
    },
    {
      id: 'art-logo-resmi-koni',
      title: 'Logo Resmi KONI Kabupaten Kepahiang (Vektor HD)',
      slug: 'logo-resmi-koni-kabupaten-kepahiang',
      description: 'Berkas mentahan lambang dan identitas visual resmi Komite Olahraga Nasional Indonesia Kabupaten Kepahiang.',
      imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=1200',
      category: 'Logo & Lambang Cabor',
      region: 'KONI (Umum)',
      format: 'CDR / AI / PNG',
      tags: ['Logo', 'Vector', 'KONI'],
      likesCount: 350,
      commentsCount: 22,
      downloadsCount: 890,
      stampsCount: 195,
      authorId: 'superadmin_1',
      isFeatured: false,
      status: 'Disetujui',
    },
    {
      id: 'art-kejuaraan-silat',
      title: 'Kejuaraan Pencak Silat Pelajar Se-Kepahiang',
      slug: 'kejuaraan-pencak-silat-pelajar-se-kepahiang',
      description: 'Spanduk backdrop dan banner kejuaraan pencak silat pelajar memperebutkan piala bergilir KONI Kepahiang.',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200',
      category: 'Poster Event & Kejuaraan',
      region: 'IPSI (Pencak Silat)',
      format: 'PSD / CDR',
      tags: ['Silat', 'IPSI', 'Pelajar'],
      likesCount: 215,
      commentsCount: 14,
      downloadsCount: 410,
      stampsCount: 76,
      authorId: 'user_5',
      isFeatured: false,
      status: 'Disetujui',
    },
    {
      id: 'art-turnamen-futsal',
      title: 'Turnamen Futsal Pemuda Bupati Cup 2026',
      slug: 'turnamen-futsal-pemuda-bupati-cup-2026',
      description: 'Pamflet pendaftaran turnamen futsal cabor PSSI Kabupaten Kepahiang.',
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200',
      category: 'Poster Event & Kejuaraan',
      region: 'PSSI (Sepak Bola & Futsal)',
      format: 'PNG / PDF',
      tags: ['Futsal', 'PSSI', 'BupatiCup'],
      likesCount: 178,
      commentsCount: 9,
      downloadsCount: 340,
      stampsCount: 65,
      authorId: 'user_6',
      isFeatured: false,
      status: 'Disetujui',
    },
    {
      id: 'art-infografis-gizi',
      title: 'Infografis Panduan Nutrisi & Kebugaran Atlet Daerah',
      slug: 'infografis-panduan-nutrisi-kebugaran-atlet',
      description: 'Panduan pola makan bergizi, hidrasi, dan istirahat optimal untuk menjaga performa atlet saat bertanding.',
      imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1200',
      category: 'Infografis Olahraga',
      region: 'KONI (Umum)',
      format: 'PDF / PNG',
      tags: ['Gizi', 'Nutrisi', 'Kebugaran'],
      likesCount: 132,
      commentsCount: 4,
      downloadsCount: 250,
      stampsCount: 38,
      authorId: 'superadmin_1',
      isFeatured: false,
      status: 'Disetujui',
    },
    {
      id: 'art-piagam-kejurda',
      title: 'Template Piagam Penghargaan Juara Kejurda Kepahiang',
      slug: 'template-piagam-penghargaan-juara-kejurda',
      description: 'Desain sertifikat dan piagam resmi pengukuhan juara kejuaraan cabang olahraga binaan KONI Kepahiang.',
      imageUrl: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&q=80&w=1200',
      category: 'Prestasi & Piagam',
      region: 'KONI (Umum)',
      format: 'CDR / PSD',
      tags: ['Sertifikat', 'Piagam', 'Prestasi'],
      likesCount: 165,
      commentsCount: 7,
      downloadsCount: 430,
      stampsCount: 71,
      authorId: 'superadmin_1',
      isFeatured: false,
      status: 'Disetujui',
    },
  ];

  for (const art of dummyArtworks) {
    await prisma.artwork.create({
      data: art,
    });
  }

  console.log('Seeding Dummy Template Twibbon...');
  const dummyTwibbons = [
    {
      id: 'twibbon-porprov-2026',
      title: 'Dukung Kontingen Kepahiang Menuju Porprov Bengkulu 2026',
      slug: 'dukung-kontingen-kepahiang-porprov-2026',
      description: 'Ayo pasang foto terbaikmu dan semarakkan perjuangan para atlet Kabupaten Kepahiang dalam ajang Pekan Olahraga Provinsi (Porprov) Bengkulu!',
      imageUrl: '/uploads/twibbon_1787157851029_ynsvch.jpg',
      category: 'Porprov',
      region: 'KONI (Umum)',
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
      usedCount: 524,
      isFeatured: true,
      status: 'Disetujui',
      authorId: 'superadmin_1',
    },
    {
      id: 'twibbon-haornas-kepahiang',
      title: 'Peringatan Hari Olahraga Nasional (HAORNAS) Kepahiang',
      slug: 'haornas-kepahiang-2026',
      description: 'Bersama KONI Kabupaten Kepahiang, jadikan olahraga sebagai gaya hidup sehat dan pembuktian prestasi generasi muda Bumi Sehasen.',
      imageUrl: '/uploads/1791364946109_3q9etz.png',
      category: 'HUT & Peringatan',
      region: 'KONI (Umum)',
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
      usedCount: 388,
      isFeatured: true,
      status: 'Disetujui',
      authorId: 'superadmin_1',
    },
    {
      id: 'twibbon-karate-bupati-cup',
      title: 'Kejurda Karate Bupati Cup Kepahiang 2026',
      slug: 'twibbon-kejurda-karate-bupati-cup-2026',
      description: 'Bingkai resmi atlet, pelatih, dan suporter Kejuaraan Daerah Karate se-Kabupaten Kepahiang binaan FORKI Kepahiang.',
      imageUrl: '/uploads/1791365763495_rugx8e.png',
      category: 'Kejuaraan',
      region: 'FORKI (Karate)',
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
      usedCount: 215,
      isFeatured: false,
      status: 'Disetujui',
      authorId: 'user_7',
    },
    {
      id: 'twibbon-pssi-kepahiang',
      title: 'Sepak Bola & Futsal Askab PSSI Kepahiang',
      slug: 'twibbon-sepak-bola-pssi-kepahiang',
      description: 'Bangkit sepak bola Kepahiang! Gelorakan semangat fair play dan solidaritas pemuda pencinta bola Kabupaten Kepahiang.',
      imageUrl: '/uploads/1785844032498.png',
      category: 'Cabor',
      region: 'PSSI (Sepak Bola & Futsal)',
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
      usedCount: 298,
      isFeatured: false,
      status: 'Disetujui',
      authorId: 'user_6',
    },
    {
      id: 'twibbon-ipsi-pencak-silat',
      title: 'Pencak Silat Pelajar Binaan IPSI Kepahiang',
      slug: 'twibbon-silat-pelajar-ipsi-kepahiang',
      description: 'Lestarikan warisan budaya leluhur bangsa, junjung tinggi budi pekerti luhur dan jiwa ksatria atlet silat Kepahiang.',
      imageUrl: '/uploads/1785845599233.png',
      category: 'Cabor',
      region: 'IPSI (Pencak Silat)',
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
      usedCount: 176,
      isFeatured: false,
      status: 'Disetujui',
      authorId: 'user_5',
    },
    {
      id: 'twibbon-atlet-binaan',
      title: 'Bangga Menjadi Atlet Binaan KONI Kepahiang',
      slug: 'twibbon-bangga-atlet-binaan-koni-kepahiang',
      description: 'Bingkai kebanggaan seluruh atlet dari 23 Cabang Olahraga resmi binaan KONI Kabupaten Kepahiang. Pantang menyerah, raih emas!',
      imageUrl: '/uploads/1785847250765.png',
      category: 'Dukungan Atlet',
      region: 'KONI (Umum)',
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
      usedCount: 462,
      isFeatured: true,
      status: 'Disetujui',
      authorId: 'superadmin_1',
    },
  ];

  for (const tw of dummyTwibbons) {
    await prisma.twibbonFrame.create({
      data: tw,
    });
  }

  console.log('Database seeded successfully for KONI Kepahiang!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
