import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Newspaper,
  Calendar,
  User,
  ArrowRight,
  Search,
  Sparkles,
  Trophy,
  Flame,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { getNewsList } from '@/actions/news';
import NewsClientList from './NewsClientList';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Berita & Publikasi Olahraga | KONI Kabupaten Kepahiang',
  description:
    'Rilis berita terkini, jadwal kejuaraan, liputan kegiatan atlet, dan pengumuman resmi Komite Olahraga Nasional Indonesia (KONI) Kabupaten Kepahiang.',
};

export const revalidate = 60; // ISR cache for 1 minute

export default async function BeritaPage() {
  const res = await getNewsList({ status: 'Published', limit: 60 });
  const allNews = res.success && res.data ? res.data : [];

  const featured = allNews.find((n) => n.isFeatured) || allNews[0] || null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6 transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Beranda
          </Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 dark:text-slate-200">Warta Berita & Rilis</span>
        </nav>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-red-900/30">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Flame size={14} className="text-amber-400" />
              <span>Pusat Berita & Media Resmi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Warta & Prestasi Atlet <span className="text-red-500">Kepahiang</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Ikuti perkembangan terkini 23 Cabang Olahraga binaan KONI Kepahiang, liputan kejuaraan daerah, pembinaan talenta muda, hingga persiapan Porprov Bengkulu.
            </p>
          </div>
        </div>

        {/* Featured Hero Article */}
        {featured && (
          <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 relative overflow-hidden min-h-[260px] sm:min-h-[360px]">
                <img
                  src={featured.imageUrl || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200'}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-red-600 text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                    <Sparkles size={13} />
                    Sorotan Utama
                  </span>
                  <span className="bg-black/60 backdrop-blur-md text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30">
                    {featured.category}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {new Date(featured.publishedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Trophy size={13} className="text-amber-500" />
                      {featured.caborCode || 'KONI Kepahiang'}
                    </span>
                  </div>

                  <Link href={`/berita/${featured.slug}`}>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug">
                      {featured.title}
                    </h2>
                  </Link>

                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {featured.excerpt || featured.content.replace(/<[^>]+>/g, '').slice(0, 160)}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <User size={14} className="text-slate-400" />
                    <span>{featured.authorName}</span>
                  </div>

                  <Link
                    href={`/berita/${featured.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 group-hover:translate-x-1 transition-all"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Client-side Filterable List */}
        <NewsClientList initialNews={allNews} />
      </main>

      <Footer />
    </div>
  );
}
