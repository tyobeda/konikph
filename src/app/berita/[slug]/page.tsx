import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Calendar,
  User,
  Eye,
  ChevronRight,
  Trophy,
  ArrowLeft,
  Sparkles,
  Clock,
  Flame,
  Pencil,
} from 'lucide-react';
import { getNewsBySlug, getNewsList } from '@/actions/news';
import { getDpwOfficeByCode } from '@/actions/dpw';
import ShareNewsButtons from './ShareNewsButtons';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getSession } from '@/lib/serverAuth';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getNewsBySlug(slug);

  if (!res.success || !res.data) {
    return {
      title: 'Berita Tidak Ditemukan | KONI Kepahiang',
    };
  }

  const news = res.data;
  const title = `${news.title} | Berita KONI Kepahiang`;
  const description =
    news.excerpt || news.content.replace(/<[^>]+>/g, '').slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: news.imageUrl ? [{ url: news.imageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: news.imageUrl ? [news.imageUrl] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const res = await getNewsBySlug(slug);

  if (!res.success || !res.data) {
    notFound();
  }

  const news = res.data;

  // Check if current user is admin
  const session = await getSession();
  const isAdmin = session?.role === 'Super Admin';

  // Fetch recent news for sidebar
  const recentRes = await getNewsList({ status: 'Published', limit: 5 });
  const recentNews = (recentRes.success && recentRes.data ? recentRes.data : []).filter(
    (n) => n.id !== news.id
  );

  // Fetch related cabor info if exists
  let relatedCabor: any = null;
  if (news.caborCode && news.caborCode !== 'KONI') {
    const caborRes = await getDpwOfficeByCode(news.caborCode);
    if (caborRes.success) {
      relatedCabor = caborRes.data;
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6 transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Beranda
          </Link>
          <ChevronRight size={14} />
          <Link href="/berita" className="hover:text-red-600 transition-colors">
            Warta Berita
          </Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 dark:text-slate-300 truncate max-w-xs sm:max-w-md">
            {news.title}
          </span>
        </nav>

        {/* Back Link */}
        <div>
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Indeks Berita</span>
          </Link>
        </div>

        {/* Main Layout: Article Reader & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Article Body (col-span-8) */}
          <article className="lg:col-span-8 bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-red-600 text-white shadow-sm">
                {news.category}
              </span>
              {news.caborCode && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 flex items-center gap-1">
                  <Trophy size={13} className="text-amber-500" />
                  {news.caborCode}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              {news.title}
            </h1>

            {/* Author, Date, Views */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <User size={14} className="text-red-600" />
                  {news.authorName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {new Date(news.publishedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  3 menit baca
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400">
                <Eye size={14} />
                <span>{news.viewsCount} kali dibaca</span>
              </div>
            </div>

            {/* Main Featured Image */}
            {news.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  className="w-full max-h-[460px] object-cover"
                />
              </div>
            )}

            {/* Excerpt Lead Box */}
            {news.excerpt && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border-l-4 border-red-600 text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "{news.excerpt}"
              </div>
            )}

            {/* Rich Article Content */}
            <div
              className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed text-sm sm:text-base space-y-4"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />

            {/* Share Buttons */}
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
              <ShareNewsButtons title={news.title} slug={news.slug} />
            </div>
          </article>

          {/* Sidebar (col-span-4) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Related Cabor Info Box */}
            {relatedCabor && (
              <div className="bg-gradient-to-br from-red-600 to-amber-600 rounded-3xl p-6 text-white shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Cabang Olahraga Terkait
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black">{relatedCabor.name}</h3>
                  <p className="text-xs text-red-100 mt-1 line-clamp-2">
                    {relatedCabor.description || 'Pengurus Cabang Olahraga Resmi KONI Kabupaten Kepahiang.'}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-red-100">
                    Sekretariat: {relatedCabor.city}
                  </span>
                  <Link
                    href={`/cabor/${relatedCabor.code.toLowerCase()}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-all shadow-md"
                  >
                    <span>Detail Cabor</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            )}

            {/* Twibbon Promo Banner */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center font-bold">
                  <Sparkles size={16} />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Dukung Atlet Kepahiang
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pasang twibbon resmi kejuaraan olahraga dan bagikan ke WhatsApp atau Instagram untuk mengobarkan semangat juara!
              </p>
              <Link
                href="/twibbon"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all"
              >
                <span>Jelajahi Twibbon Cabor</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Recent News Widget */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Flame size={18} className="text-red-500" />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Berita Lainnya
                </h4>
              </div>

              <div className="space-y-4">
                {recentNews.map((item) => (
                  <Link
                    key={item.id}
                    href={`/berita/${item.slug}`}
                    className="group flex items-start gap-3 transition-colors"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-16 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-16 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center text-slate-400">
                        <Trophy size={18} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 leading-snug">
                        {item.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(item.publishedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      {/* Floating Edit Button — visible only for Super Admin */}
      {isAdmin && (
        <Link
          href={`/admin/berita/edit/${news.id}`}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-2xl transition-all hover:scale-105 hover:shadow-red-500/40 group"
          title="Edit berita ini"
        >
          <Pencil size={16} className="group-hover:rotate-12 transition-transform" />
          <span>Edit Berita</span>
        </Link>
      )}
    </div>
  );
}
