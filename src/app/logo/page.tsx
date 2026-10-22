'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Tag,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  UploadCloud,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArtworkCard } from '@/components/ArtworkCard';
import { useData } from '@/context/DataContext';

export default function LogoArtworksPage() {
  const { artworks, siteSettings, currentUser, isMounted } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('Semua Format');
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'downloads'>('newest');

  // Dynamic Master File Formats for Filter
  const formats = useMemo(() => {
    const list =
      siteSettings?.masterFileFormats && siteSettings.masterFileFormats.length > 0
        ? siteSettings.masterFileFormats
        : [
            { id: 'PSD', label: 'PSD' },
            { id: 'AI', label: 'AI' },
            { id: 'CDR', label: 'CDR' },
            { id: 'CANVA', label: 'CANVA' },
            { id: 'FIGMA', label: 'FIGMA' },
            { id: 'PDF', label: 'PDF' },
          ];
    return ['Semua Format', ...list.map((f) => f.id), 'PNG/SVG'];
  }, [siteSettings?.masterFileFormats]);

  // Filter artworks with tag 'logo'
  const logoArtworks = useMemo(() => {
    return artworks.filter((art) => {
      // Moderation check: only approved artworks (or owned by current user / admin)
      const isApproved =
        art.status === 'Disetujui' ||
        (currentUser &&
          (currentUser.role === 'Super Admin' ||
            currentUser.role === 'Admin' ||
            art.authorId === currentUser.id ||
            art.author?.email === currentUser.email));

      if (!isApproved) return false;

      // Tag & category matching for 'logo'
      const hasTag = Boolean(
        art.tags &&
          art.tags.some((t) => {
            const clean = t.toLowerCase().replace('#', '').trim();
            return (
              clean === 'logo' ||
              clean.startsWith('logo') ||
              clean.endsWith('logo') ||
              clean.includes('logo')
            );
          })
      );

      const hasDescHashtag = Boolean(
        art.description && /#logo\b/i.test(art.description)
      );

      const hasCategory = Boolean(
        art.category && art.category.toLowerCase().trim() === 'logo'
      );

      const hasTitle = Boolean(art.title && /\blogo\b/i.test(art.title));

      return hasTag || hasDescHashtag || hasCategory || hasTitle;
    });
  }, [artworks, currentUser]);

  // Filter & Sort logo artworks
  const filteredAndSorted = useMemo(() => {
    let result = logoArtworks.filter((art) => {
      // Format Filter
      const matchesFormat =
        selectedFormat === 'Semua Format' ||
        (art.format &&
          art.format.toUpperCase().includes(selectedFormat.toUpperCase()));

      // Search Query Filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        (art.description && art.description.toLowerCase().includes(q)) ||
        (art.region && art.region.toLowerCase().includes(q)) ||
        (art.tags &&
          art.tags.some((tag) => tag.toLowerCase().includes(q)));

      return matchesFormat && matchesSearch;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'trending') {
        const scoreA = (a.likesCount || 0) * 2 + (a.downloadsCount || 0) * 3;
        const scoreB = (b.likesCount || 0) * 2 + (b.downloadsCount || 0) * 3;
        return scoreB - scoreA;
      }
      if (sortBy === 'downloads') {
        return (b.downloadsCount || 0) - (a.downloadsCount || 0);
      }
      // 'newest' default
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });
  }, [logoArtworks, selectedFormat, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6 transition-colors duration-200">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium">
          <Link href="/" className="hover:text-[#F26522] transition-colors">
            Beranda
          </Link>
          <ChevronRight size={13} className="text-gray-400" />
          <Link href="/explore" className="hover:text-[#F26522] transition-colors">
            Jelajahi
          </Link>
          <ChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-900 dark:text-white font-bold">Logo</span>
        </nav>

        {/* 🎨 HERO BANNER */}
        <div className="bg-gradient-to-br from-[#1E293B] via-[#0f172a] to-[#1E293B] rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full mb-3 shadow-sm">
              <Tag size={13} />
              <span>Tag Khusus: #logo</span>
            </span>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Koleksi Logo KONI & Cabang Olahraga Kepahiang
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Kumpulan logo resmi KONI Kabupaten Kepahiang, 23 cabor naungan, dan materi identitas visual kegiatan olahraga dengan tag <strong>#logo</strong>. Dilengkapi berkas vektor dan transparansi HD.
            </p>

            {/* Search Input Bar */}
            <div className="mt-6 relative max-w-2xl">
              <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari logo (contoh: KONI Kepahiang, FORKI, PASI, PSSI, TI)..."
                className="w-full bg-white text-gray-900 text-sm font-semibold rounded-2xl pl-11 pr-4 py-3 border border-transparent focus:outline-none focus:ring-4 focus:ring-red-500/30 shadow-lg"
              />
            </div>
          </div>

          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-white pointer-events-none">
            <Tag size={260} />
          </div>
        </div>

        {/* 🎛️ FILTER & SORT CONTROLS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-extrabold text-sm sm:text-base">
              <SlidersHorizontal size={18} className="text-[#F26522]" />
              <span>Filter Format & Urutan</span>
              <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
                ({filteredAndSorted.length} karya ditemukan)
              </span>
            </div>

            {(selectedFormat !== 'Semua Format' || searchQuery || sortBy !== 'newest') && (
              <button
                onClick={() => {
                  setSelectedFormat('Semua Format');
                  setSearchQuery('');
                  setSortBy('newest');
                }}
                className="text-xs text-[#F26522] hover:underline font-bold self-start sm:self-auto cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Format Dropdown */}
            <div>
              <label className="block text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
                Format Berkas Master
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#F26522]"
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
              <label className="block text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase mb-1.5 flex items-center gap-1">
                <ArrowUpDown size={12} />
                <span>Urutkan Hasil</span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#F26522]"
              >
                <option value="newest">Terbaru Diunggah</option>
                <option value="trending">Paling Populer (Trending)</option>
                <option value="downloads">Paling Banyak Diunduh</option>
              </select>
            </div>
          </div>
        </div>

        {/* 🖼️ ARTWORKS GRID */}
        {!isMounted ? (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-4 gap-4 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-2xl h-64 border border-gray-100 dark:border-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredAndSorted.length > 0 ? (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-4 gap-4 space-y-4">
            {filteredAndSorted.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-10 sm:p-14 text-center border border-gray-100 dark:border-gray-800 shadow-sm max-w-lg mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-950/40 text-[#F26522] flex items-center justify-center mx-auto shadow-inner">
              <Tag size={32} />
            </div>

            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {searchQuery || selectedFormat !== 'Semua Format'
                  ? 'Tidak Ada Logo yang Cocok'
                  : 'Belum Ada Karya dengan Tag #logo'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                {searchQuery || selectedFormat !== 'Semua Format'
                  ? 'Coba ganti kata kunci pencarian atau reset filter format master berkas di atas.'
                  : 'Sertakan tag #logo pada kolom deskripsi saat mengunggah karya agar desain logo Anda otomatis tampil di galeri ini.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <Link
                href="/upload"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UploadCloud size={15} />
                <span>Unggah Desain Logo</span>
              </Link>
              <Link
                href="/explore"
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Compass size={15} />
                <span>Jelajahi Semua Desain</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
