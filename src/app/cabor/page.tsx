'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Search,
  PhoneCall,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  Users,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useData } from '@/context/DataContext';

const CABOR_CATEGORIES = [
  'Semua',
  'Bela Diri',
  'Bola Besar',
  'Bola Kecil',
  'Raket',
  'Atletik',
  'Akuatik',
  'Akurasi',
  'Olahraga Otak',
  'Ketangkasan',
  'Daya Tahan',
  'Kebugaran',
  'E-Sport',
];

export default function CaborDirectoryPage() {
  const { dpwList = [], isMounted } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const filteredCabor = dpwList.filter((cabor) => {
    const matchesSearch =
      cabor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cabor.coordinator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cabor.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cabor.category && cabor.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'Semua' || cabor.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-red-900 p-8 sm:p-12 text-white shadow-xl mb-10 border border-red-900/40">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/90 text-white text-xs font-bold rounded-full mb-4 shadow-xs">
              <Sparkles size={14} />
              <span>Direktori Resmi KONI Kabupaten Kepahiang</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Cabang Olahraga Binaan
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
              Mengenal 23 cabang olahraga resmi yang berada di bawah naungan Komite Olahraga Nasional Indonesia (KONI) Kabupaten Kepahiang, lengkap dengan ketua cabor, jadwal latihan, dan kontak pengurus.
            </p>
          </div>

          <div className="absolute right-[-30px] bottom-[-30px] opacity-10 text-white pointer-events-none">
            <Trophy size={280} />
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {CABOR_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Cabor (e.g. Silat, FORKI)..."
              className="w-full bg-white dark:bg-gray-900 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-red-600 shadow-xs"
            />
          </div>
        </div>

        {/* Cabor Grid Cards */}
        {filteredCabor.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCabor.map((cabor) => (
              <div
                key={cabor.id}
                className="bg-white dark:bg-[#111622] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-red-200 dark:hover:border-red-950/60"
              >
                <div>
                  {/* Card Top: Code & Category */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white font-black text-sm flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      {cabor.code.slice(0, 4)}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {cabor.category && (
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40">
                          {cabor.category}
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Terdaftar di KONI
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <Link href={`/cabor/${cabor.code.toLowerCase()}`}>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {cabor.name}
                    </h3>
                  </Link>

                  {cabor.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                      {cabor.description}
                    </p>
                  )}

                  {/* Details List */}
                  <div className="mt-5 space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800/80 text-xs">
                    {/* Ketua */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-400 dark:text-gray-500 font-semibold flex items-center gap-1.5">
                        <Users size={13} className="text-gray-400" />
                        <span>Ketua Cabor</span>
                      </span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 truncate text-right">
                        {cabor.coordinator}
                      </span>
                    </div>

                    {/* Sekretariat */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-400 dark:text-gray-500 font-semibold flex items-center gap-1.5 shrink-0">
                        <MapPin size={13} className="text-red-500" />
                        <span>Sekretariat</span>
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300 truncate text-right">
                        {cabor.address || 'GOR Tebat Monok'}
                      </span>
                    </div>

                    {/* Jadwal Latihan */}
                    {cabor.schedule && (
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-gray-400 dark:text-gray-500 font-semibold flex items-center gap-1.5 shrink-0 mt-0.5">
                          <Clock size={13} className="text-amber-500" />
                          <span>Latihan</span>
                        </span>
                        <span className="font-semibold text-gray-600 dark:text-gray-300 text-right line-clamp-1">
                          {cabor.schedule}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
                  {cabor.phone ? (
                    <a
                      href={`https://wa.me/${cabor.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Halo Pengurus ${cabor.name} KONI Kabupaten Kepahiang, saya ingin bertanya seputar kegiatan latihan dan pembinaan.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl text-xs font-bold transition-all"
                    >
                      <PhoneCall size={13} />
                      <span>WhatsApp Cabor</span>
                    </a>
                  ) : (
                    <div />
                  )}

                  <Link
                    href={`/cabor/${cabor.code.toLowerCase()}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                  >
                    <span>Detail Cabor</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white dark:bg-[#111622] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 max-w-lg mx-auto">
            <Trophy size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Tidak Ada Cabang Olahraga Ditemukan
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              Tidak ada data cabor yang cocok dengan pencarian "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
              }}
              className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Reset Filter
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
