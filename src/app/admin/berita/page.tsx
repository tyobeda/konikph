'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Newspaper,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Sparkles,
  Loader2,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { getNewsList, updateNews, deleteNews } from '@/actions/news';

const CATEGORIES = ['Semua', 'Prestasi', 'Kegiatan', 'Pengumuman', 'Hasil Pertandingan', 'Opini'];

export default function AdminNewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  const [isPending, startTransition] = useTransition();

  // Delete Confirm
  const [deletingItem, setDeletingItem] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const resNews = await getNewsList({ status: selectedStatus === 'Semua' ? undefined : selectedStatus });
      if (resNews.success && resNews.data) {
        setNews(resNews.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  const filteredNews = news.filter((item) => {
    const matchSearch =
      search.trim() === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.caborCode && item.caborCode.toLowerCase().includes(search.toLowerCase()));

    const matchCategory =
      selectedCategory === 'Semua' || item.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  const handleDelete = async () => {
    if (!deletingItem) return;
    startTransition(async () => {
      const res = await deleteNews(deletingItem.id);
      if (res.success) {
        setDeletingItem(null);
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus berita');
      }
    });
  };

  const toggleStatus = async (item: any) => {
    const nextStatus = item.status === 'Published' ? 'Draft' : 'Published';
    await updateNews(item.id, { status: nextStatus });
    loadData();
  };

  const toggleFeatured = async (item: any) => {
    await updateNews(item.id, { isFeatured: !item.isFeatured });
    loadData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-600 via-red-700 to-amber-600 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Pusat Informasi & Pers
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Kelola Berita & Publikasi Olahraga
          </h1>
          <p className="text-red-100 text-sm md:text-base mt-1 max-w-2xl">
            Kelola rilis berita resmi, pengumuman seleksi atlet, hasil kejuaraan, dan agenda kegiatan 23 Cabang Olahraga KONI Kepahiang.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/berita"
            target="_blank"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm px-4 py-3 rounded-2xl transition-all"
          >
            <Eye size={18} />
            <span className="hidden sm:inline">Halaman Publik</span>
          </Link>
          <Link
            href="/admin/berita/create"
            className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 font-bold text-sm px-5 py-3 rounded-2xl shadow-lg transition-all"
          >
            <Plus size={18} />
            <span>Tulis Berita Baru</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berita berdasarkan judul/cabor..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white border-red-600 shadow-sm shadow-red-600/30'
                  : 'bg-slate-100 dark:bg-slate-800/80 border-transparent dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="ml-auto md:ml-2 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="Semua">Semua Status</option>
            <option value="Published">Tayang (Published)</option>
            <option value="Draft">Draf</option>
          </select>
        </div>
      </div>

      {/* News Table / Grid */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 size={32} className="animate-spin mx-auto mb-3 text-red-500" />
            <p className="text-sm font-medium">Memuat data berita KONI Kepahiang...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Newspaper size={48} className="mx-auto mb-3 opacity-30 text-red-500" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">Belum Ada Berita</h3>
            <p className="text-xs text-slate-400 mt-1">
              Tidak ada berita yang cocok dengan filter atau belum ada artikel yang ditulis.
            </p>
            <Link
              href="/admin/berita/create"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all shadow-md"
            >
              <Plus size={14} />
              <span>Tulis Berita Pertama</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Artikel Berita</th>
                  <th className="py-3.5 px-4">Kategori & Cabor</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Sorotan</th>
                  <th className="py-3.5 px-4 text-center">Dibaca</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
                {filteredNews.map((item) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700/80">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Newspaper size={18} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-md">
                          <Link
                            href={`/admin/berita/edit/${item.id}`}
                            className="font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-1 text-sm transition-colors"
                          >
                            {item.title}
                          </Link>
                          <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-1 mt-0.5">
                            {item.excerpt || item.content.replace(/<[^>]+>/g, '').slice(0, 80)}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                            <span>{new Date(item.publishedAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                            <span>•</span>
                            <span>{item.authorName}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 w-fit px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20">
                          {item.category}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          <Trophy size={11} className="text-amber-500" />
                          {item.caborCode || 'KONI'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(item)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                          item.status === 'Published'
                            ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25'
                            : 'bg-slate-500/10 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20 hover:bg-slate-500/25'
                        }`}
                      >
                        {item.status === 'Published' ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleFeatured(item)}
                        className={`p-1.5 rounded-xl border transition-all ${
                          item.isFeatured
                            ? 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/25 hover:bg-amber-500/25'
                            : 'text-slate-400 dark:text-slate-500 border-transparent hover:text-amber-400 hover:bg-amber-500/10'
                        }`}
                        title={item.isFeatured ? 'Artikel Sorotan Utama (Klik untuk batal)' : 'Jadikan Sorotan Utama'}
                      >
                        <Sparkles size={16} />
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap font-medium text-slate-500 dark:text-slate-400">
                      {item.viewsCount}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/berita/${item.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 transition-colors"
                          title="Lihat Pratinjau Publik"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/admin/berita/edit/${item.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 dark:hover:bg-blue-500/15 transition-colors"
                          title="Edit Berita (Blogger Style)"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/15 transition-colors"
                          title="Hapus Berita"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Hapus Artikel Berita?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus artikel <strong>"{deletingItem.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
