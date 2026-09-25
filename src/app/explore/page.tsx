'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useData } from '@/context/DataContext';
import { ArtworkCard } from '@/components/ArtworkCard';
import { CATEGORIES, REGIONS } from '@/lib/data';
import {
  Search,
  Filter,
  Sparkles,
  SlidersHorizontal,
  Compass,
  Tag,
  MapPin,
  FileCode,
  TrendingUp,
  Clock,
  ArrowUpDown,
  Grid,
} from 'lucide-react';

import { MaintenanceContent } from '@/app/maintenance/page';

export default function ExplorePage() {
  const router = useRouter();
  const { artworks, currentUser, isModuleUnderMaintenance } = useData();

  if (isModuleUnderMaintenance('explore')) {
    return <MaintenanceContent />;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Hikmah-Motivasi');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('Semua Format');
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'downloads'>('trending');

  const popularTags = ['#SpandukDPW', '#PosterMilenial', '#FeedInstagram', '#TwibbonResmi', '#InfografisPKS'];
  const formats = ['Semua Format', 'PSD', 'AI', 'CDR', 'CANVA', 'PNG/SVG'];

  // Advanced Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    let result = artworks.filter((art) => {
      // Category Filter
      const matchesCategory =
        activeCategory === 'Semua Karya' || art.category === activeCategory;

      // Region Filter
      const matchesRegion =
        !selectedRegion ||
        art.region.toLowerCase().includes(selectedRegion.toLowerCase()) ||
        art.author.region.toLowerCase().includes(selectedRegion.toLowerCase());

      // Format Filter
      const matchesFormat =
        selectedFormat === 'Semua Format' ||
        (art.format && art.format.toUpperCase().includes(selectedFormat.toUpperCase()));

      // Search Query Filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        art.author.name.toLowerCase().includes(q) ||
        art.author.region.toLowerCase().includes(q) ||
        (art.tags && art.tags.some(tag => tag.toLowerCase().includes(q)));

      // Moderation filter: Only approved artworks are visible publicly
      const isApproved = !art.status || art.status === 'Disetujui';
      const isAuthor = currentUser && (art.author?.id === currentUser.id || art.author?.name === currentUser.name);
      const isAdmin = currentUser?.role === 'Super Admin';
      if (!isApproved && !isAuthor && !isAdmin) {
        return false;
      }

      return matchesCategory && matchesRegion && matchesFormat && matchesSearch;
    });

    // Sorting Logic
    if (sortBy === 'trending') {
      result.sort((a, b) => b.likesCount - a.likesCount);
    } else if (sortBy === 'downloads') {
      result.sort((a, b) => b.downloadsCount - a.downloadsCount);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return result;
  }, [artworks, activeCategory, selectedRegion, selectedFormat, searchQuery, sortBy, currentUser]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, selectedRegion, selectedFormat, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedArtworks = filteredAndSorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6 transition-colors duration-200">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* 🔍 EXPLORATION HERO & SEARCH MATRIX */}
        <div className="bg-gradient-to-br from-[#1E293B] via-[#0f172a] to-[#1E293B] rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F26522] text-white text-xs font-bold rounded-full mb-3">
              <Compass size={14} />
              <span>Eksplorasi & Discovery Engine</span>
            </span>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Temukan Aset Desain Resmi PKS Lebih Cepat
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Cari dan saring ribuan karya poster, spanduk, feeds media sosial, dan templat CDR/PSD dari seluruh Wilayah PKS se-Indonesia.
            </p>

            {/* Big Search Bar */}
            <div className="mt-6 relative max-w-2xl">
              <Search size={20} className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik kata kunci (misal: Spanduk Jabar, Poster Milenial)..."
                className="w-full bg-white text-gray-900 text-sm font-semibold rounded-2xl pl-12 pr-4 py-3 border border-transparent focus:outline-none focus:ring-4 focus:ring-orange-500/30 shadow-lg"
              />
            </div>

            {/* Popular Tags */}
            <div className="mt-4 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 font-bold">Tag Populer:</span>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag.replace('#', ''))}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg transition-colors font-medium border border-white/10"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="absolute right-[-30px] bottom-[-30px] opacity-10 text-white pointer-events-none">
            <Compass size={280} />
          </div>
        </div>

        {/* 🎛️ ADVANCED FILTER & SORT MATRIX */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm mb-8 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-extrabold text-sm sm:text-base">
              <SlidersHorizontal size={18} className="text-[#F26522]" />
              <span>Matriks Filter & Urutan Karya</span>
            </div>
            
            <button
              onClick={() => {
                setActiveCategory('Semua Karya');
                setSelectedRegion('');
                setSelectedFormat('Semua Format');
                setSearchQuery('');
                setSortBy('trending');
              }}
              className="text-xs text-[#F26522] hover:underline font-bold"
            >
              Reset Semua Filter
            </button>
          </div>

          {/* Filter Row 1: Categories */}
          <div>
            <label className="block text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Kategori Desain
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    activeCategory === cat
                      ? 'bg-[#F26522] text-white border-[#F26522] shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Row 2: Region, Format, & Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            
            {/* Region Dropdown */}
            <div>
              <label className="block text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Wilayah
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#F26522]"
              >
                {REGIONS.map((reg) => (
                  <option key={reg} value={reg === 'Semua Daerah' ? '' : reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Dropdown */}
            <div>
              <label className="block text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Format Berkas Master
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#F26522]"
              >
                {formats.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <label className="block text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Urutkan Berdasarkan
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#F26522]"
              >
                <option value="trending">Terpopuler (Banyak Disukai)</option>
                <option value="downloads">Paling Banyak Diunduh</option>
                <option value="newest">Terbaru Diunggah</option>
              </select>
            </div>

          </div>
        </div>

        {/* 📊 RESULTS HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-extrabold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Grid size={16} className="text-[#F26522]" />
            <span>Hasil Eksplorasi ({filteredAndSorted.length} Karya Ditemukan)</span>
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {totalPages > 1
              ? `Halaman ${currentPage} dari ${totalPages} (20 per halaman)`
              : 'Menampilkan karya terverifikasi'}
          </span>
        </div>

        {/* GALLERY MASONRY GRID */}
        {paginatedArtworks.length > 0 ? (
          <>
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {paginatedArtworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 450, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                >
                  &laquo; Sebelum
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 450, behavior: 'smooth' });
                    }}
                    className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all border ${
                      currentPage === page
                        ? 'bg-[#F26522] text-white border-[#F26522] shadow-sm scale-105'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                    window.scrollTo({ top: 450, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                >
                  Lanjut &raquo;
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center my-8">
            <FileCode size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
              Tidak ada karya yang sesuai dengan filter
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
              Coba kurangi opsi filter atau hapus kata kunci pencarian Anda.
            </p>
            <button
              onClick={() => {
                setActiveCategory('Semua Karya');
                setSelectedRegion('');
                setSelectedFormat('Semua Format');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-[#F26522] text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Reset Filter Eksplorasi
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
