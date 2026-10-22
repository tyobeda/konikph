import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Trophy,
  Users,
  MapPin,
  Clock,
  PhoneCall,
  Calendar,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Newspaper,
  ShieldAlert,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toUpperCase();

  const cabor = await prisma.dpwOffice.findFirst({
    where: {
      OR: [
        { code: { equals: decodedSlug, mode: 'insensitive' } },
        { name: { contains: decodedSlug, mode: 'insensitive' } },
      ],
    },
  });

  if (!cabor) {
    return {
      title: 'Cabang Olahraga Tidak Ditemukan | KONI Kepahiang',
    };
  }

  const title = `${cabor.code} - ${cabor.name} | KONI Kabupaten Kepahiang`;
  const description =
    cabor.description ||
    `Profil cabang olahraga ${cabor.name} (${cabor.code}) di bawah naungan Komite Olahraga Nasional Indonesia (KONI) Kabupaten Kepahiang.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: cabor.logoUrl ? [{ url: cabor.logoUrl }] : undefined,
    },
  };
}

export default async function CaborDetailPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toUpperCase();

  const cabor = await prisma.dpwOffice.findFirst({
    where: {
      OR: [
        { code: { equals: decodedSlug, mode: 'insensitive' } },
        { name: { contains: decodedSlug, mode: 'insensitive' } },
      ],
    },
  });

  if (!cabor) {
    notFound();
  }

  // Get news related to this cabor
  const relatedNews = await prisma.news.findMany({
    where: {
      OR: [
        { caborCode: cabor.code },
        { title: { contains: cabor.name, mode: 'insensitive' } },
        { title: { contains: cabor.code, mode: 'insensitive' } },
      ],
      status: 'Published',
    },
    orderBy: { publishedAt: 'desc' },
    take: 6,
  });

  // Get twibbons related to this cabor if any
  const relatedTwibbons = await prisma.twibbonFrame.findMany({
    where: {
      OR: [
        { title: { contains: cabor.code, mode: 'insensitive' } },
        { title: { contains: cabor.name, mode: 'insensitive' } },
        { category: { contains: cabor.category || '', mode: 'insensitive' } },
      ],
      status: 'Disetujui',
    },
    take: 4,
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Beranda
          </Link>
          <ChevronRight size={14} />
          <Link href="/cabor" className="hover:text-red-600 transition-colors">
            Cabang Olahraga
          </Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 dark:text-slate-200">{cabor.code}</span>
        </nav>

        <div>
          <Link
            href="/cabor"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Semua 23 Cabang Olahraga</span>
          </Link>
        </div>

        {/* Hero Cabor Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-red-900/30">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center shrink-0 shadow-xl overflow-hidden">
                {cabor.logoUrl ? (
                  <img
                    src={cabor.logoUrl}
                    alt={cabor.code}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-xl">
                    {cabor.code.slice(0, 4)}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase bg-red-600 text-white shadow-md">
                    {cabor.code}
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm">
                    {cabor.category || 'Umum'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                  {cabor.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  {cabor.description ||
                    `Pengurus Cabang Olahraga ${cabor.name} resmi Kabupaten Kepahiang di bawah koordinasi KONI Kepahiang.`}
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            {cabor.phone && (
              <a
                href={`https://wa.me/${cabor.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Halo Pengurus ${cabor.name} KONI Kabupaten Kepahiang, saya ingin bertanya seputar atlet/pendaftaran/kegiatan.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-xl transition-all hover:scale-105 shrink-0"
              >
                <PhoneCall size={16} />
                <span>Hubungi Pengurus</span>
              </a>
            )}
          </div>
        </div>

        {/* Content Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Info Column (col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Profil & Struktur Card */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={20} className="text-red-600" />
                <span>Profil & Manajemen Cabor</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Ketua */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">
                    Ketua Pengcab
                  </span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {cabor.coordinator || 'Dalam Konfirmasi Pengurus'}
                  </span>
                </div>

                {/* Nomor Kontak */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">
                    Kontak Layanan
                  </span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {cabor.phone || '0811-9988-7766 (Sekretariat KONI)'}
                  </span>
                </div>

                {/* Alamat Sekretariat */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1.5">
                    <MapPin size={13} className="text-red-500" />
                    Sekretariat & Basecamp
                  </span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {cabor.address || 'GOR Tebat Monok, Jl. Lintas Kepahiang - Bengkulu'}
                  </span>
                </div>

                {/* Jadwal Latihan */}
                {cabor.schedule && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 sm:col-span-2">
                    <span className="text-amber-800 dark:text-amber-300 font-bold block mb-1 flex items-center gap-1.5">
                      <Clock size={13} className="text-amber-600" />
                      Jadwal Latihan Rutin & Pemusatan Atlet
                    </span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {cabor.schedule}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Berita Terkait Cabor ini */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Newspaper size={18} className="text-red-600" />
                  <span>Kabar & Prestasi {cabor.code}</span>
                </h3>
                <Link
                  href="/berita"
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <span>Semua Berita</span>
                  <ChevronRight size={13} />
                </Link>
              </div>

              {relatedNews.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Belum ada artikel berita khusus untuk cabor {cabor.name}. Nantikan rilis liputan kejuaraan mendatang!
                </div>
              ) : (
                <div className="space-y-4">
                  {relatedNews.map((item) => (
                    <Link
                      key={item.id}
                      href={`/berita/${item.slug}`}
                      className="group flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-20 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-20 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center text-slate-400">
                          <Trophy size={20} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-red-600 uppercase">
                          {item.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(item.publishedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column (col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Twibbon & Kampanye Box */}
            <div className="bg-gradient-to-br from-red-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-amber-300" />
                <h3 className="text-lg font-black">Twibbon Resmi {cabor.code}</h3>
              </div>
              <p className="text-xs text-red-100 leading-relaxed">
                Pasang foto profilmu dengan bingkai resmi kebanggaan {cabor.name} Kabupaten Kepahiang. Suarakan semangat sportivitas ke seluruh media sosial!
              </p>

              <Link
                href="/twibbon"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-white text-red-600 hover:bg-red-50 rounded-2xl text-xs font-black shadow-md transition-all"
              >
                <span>Buka Twibbon Creator</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Sekretariat KONI Info Card */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                <span>Pusat Pembinaan Olahraga</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seluruh cabang olahraga di Kabupaten Kepahiang terafiliasi resmi dan mendapat pengawasan teknis serta pembinaan anggaran dari Komite Olahraga Nasional Indonesia (KONI) Kepahiang.
              </p>
              <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
                <p>📍 <strong>Sekretariat Induk:</strong> GOR Tebat Monok, Kepahiang</p>
                <p>✉️ <strong>Email:</strong> kepahiangkoni@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
