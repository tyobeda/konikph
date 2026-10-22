'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const INITIAL_NEWS_KEPAHIANG = [
  {
    title: 'Sambutan & Arahan Ketua Umum KONI Kabupaten Kepahiang: Bersatu Mengukir Prestasi Olahraga',
    slug: 'sambutan-arahan-ketua-umum-koni-kabupaten-kepahiang',
    excerpt: 'Amanat dan visi besar pembinaan 23 cabang olahraga Kabupaten Kepahiang oleh Ketua Umum Erwin Agustinus, ST guna melahirkan atlet-atlet berprestasi yang mengharumkan nama daerah.',
    content: `<p><strong>Kepahiang, Bengkulu</strong> — Salam Olahraga! Puji dan syukur kita panjatkan ke hadirat Tuhan Yang Maha Esa, atas limpahan rahmat dan karunia-Nya sehingga pembinaan olahraga di Kabupaten Kepahiang terus bergerak maju dengan penuh semangat dan integritas.</p>
<p>Sebagai wadah induk seluruh cabang olahraga di Kabupaten Kepahiang, Komite Olahraga Nasional Indonesia (KONI) berkomitmen penuh untuk menghadirkan ekosistem pembinaan atlet yang profesional, transparan, dan berbasis sains olahraga modern. Kami meyakini bahwa setiap pemuda dan pemudi di Bumi Sehasen memiliki potensi luar biasa untuk menjadi juara di pentas regional, nasional, hingga internasional.</p>
<p>Menjelang perhelatan Pekan Olahraga Provinsi (Porprov) Bengkulu 2026, KONI Kepahiang telah merumuskan program pemusatan latihan terpadu serta memastikan ketersediaan sarana dan prasarana yang memadai bagi seluruh 23 cabang olahraga resmi. Mari satukan langkah, junjung tinggi sportivitas, dan kobarkan semangat pantang menyerah demi kejayaan olahraga Kabupaten Kepahiang tercinta!</p>`,
    category: 'Pengumuman',
    caborCode: 'KONI',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200',
    authorName: 'Erwin Agustinus, ST (Ketua Umum KONI)',
    status: 'Published',
    isFeatured: true,
    viewsCount: 520,
    publishedAt: new Date('2026-06-15T10:00:00Z'),
  },
  {
    title: 'KONI Kepahiang Targetkan Masuk 3 Besar Porprov Bengkulu 2026',
    slug: 'koni-kepahiang-targetkan-masuk-3-besar-porprov-bengkulu-2026',
    excerpt: 'Ketua Umum KONI Kabupaten Kepahiang optimis dengan kesiapan fisik dan mental seluruh cabor unggulan yang sudah menjalani pemusatan latihan terpadu di dataran tinggi Kabawetan.',
    content: `<p><strong>Kepahiang, Bengkulu</strong> — Komite Olahraga Nasional Indonesia (KONI) Kabupaten Kepahiang secara resmi menetapkan target ambisius untuk menembus peringkat tiga besar dalam ajang Pekan Olahraga Provinsi (Porprov) Bengkulu tahun 2026.</p>
<p>Hal ini disampaikan langsung oleh Ketua Umum KONI Kepahiang, Erwin Agustinus, ST dalam rapat persiapan yang diselenggarakan di Sekretariat KONI Kepahiang, GOR Tebat Monok. Dalam arahannya, beliau menekankan bahwa pembinaan atlet berbasis ilmu pengetahuan olahraga (<em>sport science</em>) dan latihan fisik di kontur pegunungan Kabawetan memberikan keunggulan daya tahan tubuh bagi para atlet daerah.</p>
<p>Cabang-cabang olahraga unggulan seperti Pencak Silat, Atletik, Sepak Bola, Karate, Catur, dan Panjat Tebing diproyeksikan menjadi lumbung medali emas kontingen Kepahiang. KONI juga memastikan ketersediaan sarana prasarana serta pemenuhan gizi atlet selama masa pemusatan latihan berlangsung.</p>`,
    category: 'Prestasi',
    caborCode: 'KONI',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200',
    authorName: 'Humas KONI Kepahiang',
    status: 'Published',
    isFeatured: true,
    viewsCount: 342,
    publishedAt: new Date('2026-06-10T08:00:00Z'),
  },
  {
    title: 'KONI Kepahiang Selenggarakan Rapat Koordinasi Anggaran dan Evaluasi Cabor',
    slug: 'koni-kepahiang-rapat-koordinasi-anggaran-evaluasi-cabor',
    excerpt: 'Rapat koordinasi membahas peningkatan transparansi pengelolaan dana hibah serta penyusunan timeline uji coba tanding bagi seluruh instruktur klub olahraga binaan.',
    content: `<p><strong>Kepahiang</strong> — Dalam upaya meningkatkan akuntabilitas dan efisiensi serta transparansi tata kelola organisasi, KONI Kabupaten Kepahiang menggelar Rapat Koordinasi (Rakor) Tahunan bertempat di Aula GOR Tebat Monok, Kepahiang.</p>
<p>Rapat ini dihadiri oleh pimpinan komite dan perwakilan pengurus dari 23 cabang olahraga resmi. Agenda utama rapat berfokus pada evaluasi program kerja tahun berjalan, penyelarasan proposal anggaran pembinaan tahun 2027, serta standarisasi pelaporan penggunaan dana hibah olahraga daerah.</p>
<p>Bendahara Umum KONI Kepahiang, Yulia Bahraini, M.Pd.I, menegaskan bahwa seluruh pengurus cabor wajib menyusun laporan pertanggungjawaban yang transparan dan akuntabel guna memastikan keberlanjutan pembinaan prestasi atlet di masa depan.</p>`,
    category: 'Kegiatan',
    caborCode: 'KONI',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200',
    authorName: 'Sekretariat KONI',
    status: 'Published',
    isFeatured: false,
    viewsCount: 215,
    publishedAt: new Date('2026-06-08T09:30:00Z'),
  },
  {
    title: 'Antusiasme Tinggi, Bupati Kepahiang Resmikan Kejuaraan Daerah Bupati Cup 2026',
    slug: 'antusiasme-tinggi-bupati-resmikan-kejuaraan-daerah-bupati-cup-2026',
    excerpt: 'Kompetisi akbar tahunan ini diikuti ratusan atlet lokal berbakat dari 8 kecamatan untuk memperebutkan piala bergilir serta beasiswa pembinaan olahraga.',
    content: `<p><strong>Kepahiang</strong> — Geliat pesta olahraga terasa di seantero Kabupaten Kepahiang dengan dibukanya secara resmi kompetisi olahraga tahunan Bupati Cup 2026. Acara pembukaan megah yang dipusatkan di Stadion Mini Padang Lekat ini dibuka langsung oleh Bupati Kepahiang didampingi jajaran Forkopimda dan Ketua Umum KONI Kepahiang.</p>
<p>Tahun ini, Bupati Cup mempertandingkan beberapa cabang olahraga favorit masyarakat antara lain Sepak Bola, Futsal, Bulutangkis, Bola Voli, dan Pencak Silat. Sebanyak 8 kontingen kecamatan se-Kabupaten Kepahiang mengirimkan atlet-atlet terbaiknya.</p>
<p>Ajang ini juga menjadi sarana pemantauan bakat (<em>scouting</em>) resmi bagi tim pemandu bakat KONI Kepahiang dalam rangka pembentukan kontingen atlet Porprov Bengkulu mendatang.</p>`,
    category: 'Kegiatan',
    caborCode: 'PSSI',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200',
    authorName: 'Media Center Kepahiang',
    status: 'Published',
    isFeatured: true,
    viewsCount: 489,
    publishedAt: new Date('2026-06-04T14:00:00Z'),
  },
  {
    title: 'Peluncuran Program "KONI Masuk Desa" untuk Deteksi Dini Bakat Atlet Cilik',
    slug: 'peluncuran-program-koni-masuk-desa-deteksi-dini-atlet-cilik',
    excerpt: 'Program pembinaan di pelosok desa Kepahiang menyisir anak-anak sekolah dasar terpencil yang memiliki bakat atletik alami untuk disalurkan ke sistem akademi KONI.',
    content: `<p><strong>Kepahiang</strong> — KONI Kabupaten Kepahiang meluncurkan inisiatif revolusioner bertajuk "KONI Masuk Desa" guna mengendus keberadaan talenta-talenta olahraga luar biasa yang tersembunyi di wilayah pedesaan jauh dari pusat kota.</p>
<p>Pengurus bidang Litbang dan Bidang Pembinaan Prestasi (Binpres) KONI bekerja sama dengan para guru pendidikan jasmani di sekolah-sekolah dasar di wilayah Seberang Musi, Muara Kemumu, Merigi, dan Tebat Karai. Melalui tes antropometri dan tes kebugaran fungsional, anak-anak dengan keunggulan fisik alami akan dibina secara intensif.</p>
<p>"Banyak anak-anak di Kepahiang terbiasa dengan medan perbukitan sehingga memiliki kapasitas VO2 Max dan stamina alami yang sangat tinggi. Melalui program ini, bakat alami mereka akan diasah menjadi atlet profesional yang siap mengharumkan nama daerah," jelas tim Binpres KONI Kepahiang.</p>`,
    category: 'Pengumuman',
    caborCode: 'PASI',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1200',
    authorName: 'Litbang KONI',
    status: 'Published',
    isFeatured: false,
    viewsCount: 304,
    publishedAt: new Date('2026-05-29T10:15:00Z'),
  },
];

export async function getNewsList(params?: {
  category?: string;
  caborCode?: string;
  status?: string;
  search?: string;
  limit?: number;
}) {
  try {
    const where: any = {};
    if (params?.status) {
      where.status = params.status;
    } else {
      where.status = 'Published';
    }

    if (params?.category && params.category !== 'Semua') {
      where.category = params.category;
    }

    if (params?.caborCode && params.caborCode !== 'Semua') {
      where.caborCode = params.caborCode;
    }

    if (params?.search && params.search.trim() !== '') {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { excerpt: { contains: params.search, mode: 'insensitive' } },
        { content: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    let news = await prisma.news.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: params?.limit || 50,
    });

    if (news.length === 0 && !params?.search && !params?.category && !params?.caborCode) {
      await seedInitialNews();
      news = await prisma.news.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: params?.limit || 50,
      });
    }

    return {
      success: true,
      data: news.map((n) => ({
        ...n,
        publishedAt: n.publishedAt.toISOString(),
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Error fetching news list:', error);
    return { success: false, error: 'Gagal memuat berita' };
  }
}

export async function getNewsBySlug(slug: string) {
  try {
    const item = await prisma.news.findUnique({
      where: { slug },
    });

    if (!item) {
      return { success: false, error: 'Berita tidak ditemukan' };
    }

    // Increment views asynchronously
    prisma.news.update({
      where: { id: item.id },
      data: { viewsCount: { increment: 1 } },
    }).catch(() => {});

    return {
      success: true,
      data: {
        ...item,
        publishedAt: item.publishedAt.toISOString(),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Error fetching news by slug:', error);
    return { success: false, error: 'Gagal memuat artikel berita' };
  }
}

export async function getNewsById(id: string) {
  try {
    const item = await prisma.news.findUnique({
      where: { id },
    });

    if (!item) {
      return { success: false, error: 'Artikel berita tidak ditemukan' };
    }

    return {
      success: true,
      data: {
        ...item,
        publishedAt: item.publishedAt.toISOString(),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Error fetching news by id:', error);
    return { success: false, error: 'Gagal memuat artikel berita' };
  }
}

export async function createNews(data: {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  imageUrl?: string;
  imagePosition?: string;
  category?: string;
  caborCode?: string;
  authorName?: string;
  status?: string;
  isFeatured?: boolean;
}) {
  try {
    const slug =
      data.slug?.trim() ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
        '-' +
        Date.now().toString().slice(-4);

    const created = await prisma.news.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || data.content.replace(/<[^>]+>/g, '').slice(0, 160) + '...',
        content: data.content,
        imageUrl: data.imageUrl || null,
        imagePosition: data.imagePosition || '50% 50%',
        category: data.category || 'Kegiatan',
        caborCode: data.caborCode || 'KONI',
        authorName: data.authorName || 'Humas KONI Kepahiang',
        status: data.status || 'Published',
        isFeatured: Boolean(data.isFeatured),
        publishedAt: new Date(),
      },
    });

    revalidatePath('/berita');
    revalidatePath(`/berita/${slug}`);
    revalidatePath('/admin/berita');
    revalidatePath('/');
    return { success: true, data: created };
  } catch (error: any) {
    console.error('Error creating news:', error);
    return { success: false, error: error.message || 'Gagal membuat berita' };
  }
}

export async function updateNews(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    imagePosition: string;
    category: string;
    caborCode: string;
    authorName: string;
    status: string;
    isFeatured: boolean;
  }>
) {
  try {
    const updated = await prisma.news.update({
      where: { id },
      data,
    });

    revalidatePath('/berita');
    revalidatePath(`/berita/${updated.slug}`);
    revalidatePath('/admin/berita');
    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Error updating news:', error);
    return { success: false, error: error.message || 'Gagal memperbarui berita' };
  }
}

export async function updateNewsImagePosition(id: string, imagePosition: string) {
  try {
    const updated = await prisma.news.update({
      where: { id },
      data: { imagePosition },
    });

    revalidatePath('/');
    revalidatePath('/berita');
    revalidatePath(`/berita/${updated.slug}`);
    revalidatePath('/admin/berita');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Error updating news image position:', error);
    return { success: false, error: error.message || 'Gagal memperbarui posisi gambar' };
  }
}

export async function deleteNews(id: string) {
  try {
    await prisma.news.delete({
      where: { id },
    });

    revalidatePath('/berita');
    revalidatePath('/admin/berita');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting news:', error);
    return { success: false, error: error.message || 'Gagal menghapus berita' };
  }
}

export async function seedInitialNews() {
  try {
    const count = await prisma.news.count();
    if (count > 0) return { success: true, count };

    for (const item of INITIAL_NEWS_KEPAHIANG) {
      await prisma.news.create({
        data: item,
      });
    }

    revalidatePath('/berita');
    revalidatePath('/');
    return { success: true, count: INITIAL_NEWS_KEPAHIANG.length };
  } catch (error) {
    console.error('Error seeding news:', error);
    return { success: false, error: 'Gagal inisialisasi berita awal' };
  }
}
