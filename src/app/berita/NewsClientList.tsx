'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Calendar,
  User,
  ArrowRight,
  Trophy,
  Newspaper,
  Flame,
  Clock,
} from 'lucide-react';

const CATEGORIES = ['Semua', 'Prestasi', 'Kegiatan', 'Pengumuman', 'Hasil Pertandingan', 'Opini'];

export default function NewsClientList({ initialNews }: { initialNews: any[] }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const filtered = initialNews.filter((item) => {
    const matchCategory =
      selectedCategory === 'Semua' || item.category === selectedCategory;

    const matchSearch =
      search.trim() === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      (item.caborCode && item.caborCode.toLowerCase().includes(search.toLowerCase()));

    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-8">
      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berita atau cabor..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Grid of News Cards */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-[#1E293B] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <Newspaper size={44} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
            Tidak Ada Berita Ditemukan
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Tidak ada artikel yang cocok dengan filter atau kata kunci "{search}". Coba gunakan kata kunci lain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={
                    item.imageUrl ||
                    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800'
                  }
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-md">
                    {item.category}
                  </span>
                  {item.caborCode && (
                    <span className="bg-slate-900/80 backdrop-blur-sm text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/20">
                      {item.caborCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(item.publishedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      3 mnt baca
                    </span>
                  </div>

                  <Link href={`/berita/${item.slug}`}>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.excerpt || item.content.replace(/<[^>]+>/g, '').slice(0, 100)}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-slate-400 truncate max-w-[130px]">
                    {item.authorName}
                  </span>

                  <Link
                    href={`/berita/${item.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Baca</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
