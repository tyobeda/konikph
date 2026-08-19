'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FilterBar } from '@/components/FilterBar';
import { ArtworkCard } from '@/components/ArtworkCard';
import { WelcomePopup } from '@/components/WelcomePopup';
import { Artwork } from '@/lib/types';
import {
  Sparkles,
  TrendingUp,
  Download,
  Users,
  Building,
  Flame,
  ArrowRight,
  Rss,
  Compass,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';

export default function HomePage() {
  const router = useRouter();
  const { artworks, users, dpwList, siteSettings, isMounted, isModuleUnderMaintenance } = useData();

  useEffect(() => {
    if (isMounted && isModuleUnderMaintenance()) {
      router.replace('/maintenance');
    }
  }, [isMounted, isModuleUnderMaintenance, router]);

  const [activeCategory, setActiveCategory] = useState('Hikmah-Motivasi');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Total downloads aggregate calculation
  const totalDownloadsCount = useMemo(() => {
    return artworks.reduce((sum, item) => sum + (item.downloadsCount || 0), 0);
  }, [artworks]);

  // Featured Trending Item for Hero Banner
  const heroFeaturedArtwork = useMemo(() => {
    return artworks.find((a) => a.isFeatured) || artworks[0];
  }, [artworks]);

  // Base list of items filtered instantly
  const baseFiltered = useMemo(() => {
    return artworks.filter((art: Artwork) => {
      // Category filter
      const matchesCategory =
        activeCategory === 'Semua Karya' || art.category === activeCategory;

      // Region filter
      const matchesRegion =
        !selectedRegion ||
        art.region.toLowerCase().includes(selectedRegion.toLowerCase()) ||
        art.author.region.toLowerCase().includes(selectedRegion.toLowerCase());

      // Search term filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        art.author.name.toLowerCase().includes(q) ||
        art.author.region.toLowerCase().includes(q) ||
        (art.tags && art.tags.some(tag => tag.toLowerCase().includes(q)));

      return matchesCategory && matchesRegion && matchesSearch;
    });
  }, [artworks, activeCategory, selectedRegion, searchQuery]);

  // Page-based pagination (20 items per page)
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [gridMinHeight, setGridMinHeight] = useState<number | undefined>(undefined);

  const totalPages = Math.ceil(baseFiltered.length / ITEMS_PER_PAGE) || 1;

  // Smooth filter handler
  const handleCategoryChange = (val: string) => {
    if (gridContainerRef.current) {
      setGridMinHeight(gridContainerRef.current.offsetHeight);
    }
    setActiveCategory(val);
    setCurrentPage(1);
    setTimeout(() => setGridMinHeight(undefined), 600);
  };

  const handleRegionChange = (val: string) => {
    if (gridContainerRef.current) {
      setGridMinHeight(gridContainerRef.current.offsetHeight);
    }
    setSelectedRegion(val);
    setCurrentPage(1);
    setTimeout(() => setGridMinHeight(undefined), 600);
  };

  // Reset page to 1 when category/region/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, selectedRegion, searchQuery]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    if (gridContainerRef.current) {
      gridContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const displayedArtworks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return baseFiltered.slice(start, start + ITEMS_PER_PAGE);
  }, [baseFiltered, currentPage]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6">
      {/* Welcome Popup Dialog */}
      <WelcomePopup />

      {/* Header */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* 🌟 HERO SHOWCASE BANNER (TIMELINE HIGHLIGHTS) */}
        {heroFeaturedArtwork && (
          <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 rounded-xl overflow-hidden mb-8 relative">
            <div className="flex flex-col lg:grid lg:grid-cols-12 items-stretch lg:items-center">
              
              {/* Image Banner Preview (Top on Mobile, Right on Desktop) */}
              <div className="order-1 lg:order-2 lg:col-span-5 relative h-56 sm:h-72 lg:h-full min-h-[220px] sm:min-h-[280px] overflow-hidden bg-slate-800">
                <Image
                  src={heroFeaturedArtwork.imageUrl}
                  alt={heroFeaturedArtwork.title}
                  fill
                  priority
                  unoptimized={heroFeaturedArtwork.imageUrl.startsWith('data:')}
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-gray-900/90 via-gray-900/30 to-transparent" />
              </div>

              {/* Text Info Column (Bottom on Mobile, Left on Desktop) */}
              <div className="order-2 lg:order-1 lg:col-span-7 p-5 sm:p-8 lg:p-10 text-white z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F26522] text-white text-xs font-bold rounded-full mb-3 shadow-sm">
                  <Flame size={14} className="animate-pulse" />
                  <span>Karya Trending Minggu Ini</span>
                </div>

                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                  {heroFeaturedArtwork.title}
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed line-clamp-2">
                  {heroFeaturedArtwork.description}
                </p>

                {/* Creator info */}
                <div className="flex items-center gap-3 mt-4 p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 max-w-fit">
                  <Image
                    src={heroFeaturedArtwork.author.avatar || 'https://ui-avatars.com/api/?name=User'}
                    alt={heroFeaturedArtwork.author.name}
                    width={36}
                    height={36}
                    unoptimized={Boolean(heroFeaturedArtwork.author.avatar?.startsWith('data:'))}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-[#F26522]"
                  />
                  <div>
                    <p className="text-xs font-extrabold text-white">
                      {heroFeaturedArtwork.author.name}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium">
                      {(heroFeaturedArtwork.author.region || heroFeaturedArtwork.region || '').replace(/^DPW\s+/i, 'Wilayah ')} • Format {heroFeaturedArtwork.format || 'PSD/AI'}
                    </p>
                  </div>
                </div>

                {/* CTA Action Buttons (1 Row 2 Columns on Mobile) */}
                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-3">
                  <Link
                    href={`/artwork/${heroFeaturedArtwork.slug || heroFeaturedArtwork.id}`}
                    className="py-2.5 px-3 sm:px-5 bg-[#F26522] hover:bg-[#d85417] text-white text-[11px] sm:text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 text-center truncate"
                  >
                    <span className="truncate">Lihat & Unduh</span>
                    <ArrowRight size={14} className="shrink-0" />
                  </Link>

                  <Link
                    href="/explore"
                    className="py-2.5 px-3 sm:px-5 bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1.5 text-center truncate"
                  >
                    <Compass size={14} className="shrink-0" />
                    <span className="truncate">Mode Eksplorasi</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 📰 TIMELINE FEED SECTION HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Rss size={20} className="text-[#F26522]" />
            <h2 className="text-lg font-extrabold text-gray-900">
              Feed Timeline
            </h2>
          </div>

          <Link
            href="/explore"
            className="text-xs font-bold text-[#F26522] hover:underline flex items-center gap-1"
          >
            <span>Eksplorasi</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Filter Bar */}
        <FilterBar
          activeCategory={activeCategory}
          onSelectCategory={handleCategoryChange}
          selectedRegion={selectedRegion}
          onSelectRegion={handleRegionChange}
        />

        {/* Masonry Feed Grid */}
        <div 
          ref={gridContainerRef}
          style={{ minHeight: gridMinHeight !== undefined ? `${gridMinHeight}px` : 'auto', transition: 'min-height 0.6s ease-in-out' }}
          className="relative transition-all duration-300"
        >
          {artworks.length === 0 && !isMounted ? (
            <div className="py-20 text-center text-gray-400 text-xs font-semibold">
              <span>Memuat linimasa karya...</span>
            </div>
          ) : displayedArtworks.length > 0 ? (
            <>
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {displayedArtworks.map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} />
                ))}
              </div>

              {/* 📄 Pagination Navigation Controls (20 Karya Per Halaman) */}
              {totalPages > 1 && (
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200/80">
                  <div className="text-xs text-gray-500 font-semibold">
                    Menampilkan <span className="font-extrabold text-gray-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-extrabold text-gray-800">{Math.min(currentPage * ITEMS_PER_PAGE, baseFiltered.length)}</span> dari <span className="font-extrabold text-gray-800">{baseFiltered.length}</span> karya
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-orange-50 hover:text-[#F26522] hover:border-orange-200 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 transition-all shadow-sm"
                      aria-label="Halaman Sebelumnya"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page Number Buttons */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .reduce<(number | string)[]>((acc, page, idx, array) => {
                        if (idx > 0 && page - (array[idx - 1] as number) > 1) {
                          acc.push('...');
                        }
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        typeof p === 'number' ? (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`min-w-[36px] h-9 px-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                              currentPage === p
                                ? 'bg-[#F26522] text-white shadow-orange-500/20'
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-orange-50 hover:text-[#F26522] hover:border-orange-200'
                            }`}
                          >
                            {p}
                          </button>
                        ) : (
                          <span key={`dots-${idx}`} className="px-1 text-gray-400 text-xs font-bold">
                            ...
                          </span>
                        )
                      )}

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-orange-50 hover:text-[#F26522] hover:border-orange-200 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 transition-all shadow-sm"
                      aria-label="Halaman Berikutnya"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
              🔍
            </div>
            <h3 className="text-lg font-bold text-gray-800">Karya tidak ditemukan</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              Coba ubah kata kunci pencarian atau reset filter kategori/daerah.
            </p>
            <button
              onClick={() => {
                setActiveCategory('Semua Karya');
                setSelectedRegion('');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-[#F26522] text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              Reset Filter
            </button>
          </div>
        )}
        </div>
      </main>

      {/* Dynamic CTA Banner Section - Full Width, No Rounded Corners */}
      {siteSettings?.ctaEnabled !== false && (
        <section 
          className="w-full relative py-12 px-6 sm:px-12 md:py-16 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8 bg-cover bg-center text-white mt-16 bg-[#141517] border-t border-gray-800"
          style={{ 
            backgroundImage: siteSettings.ctaBgUrl 
              ? `url(${siteSettings.ctaBgUrl})` 
              : 'none' 
          }}
        >
          <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Left Content Area */}
            <div className="flex-1 flex flex-col z-10 text-center md:text-left">
              {/* Logo & Description Row */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {siteSettings.ctaLogoUrl ? (
                  <img 
                    src={siteSettings.ctaLogoUrl} 
                    alt="CTA Logo" 
                    className="h-16 object-contain shrink-0" 
                  />
                ) : (
                  <div className="text-2xl font-black text-white shrink-0 tracking-tight">
                    PKS<span className="text-[#F26522]">art</span>
                  </div>
                )}
                
                {/* Vertical Divider (Hidden on mobile) */}
                <div className="hidden md:block h-16 w-px bg-gray-700/60 shrink-0 self-center" />
                
                {/* Paragraph Text */}
                <p className="text-xs sm:text-sm text-gray-300 font-normal leading-relaxed text-center md:text-left max-w-2xl whitespace-pre-line">
                  {siteSettings.ctaDescription}
                </p>
              </div>

              {/* Horizontal Links Separated by | */}
              {siteSettings.ctaLinks && siteSettings.ctaLinks.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2.5 gap-y-1 text-xs sm:text-sm text-gray-400 font-semibold mt-8 mb-4">
                  {siteSettings.ctaLinks.map((link, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-gray-700 font-normal">|</span>}
                      <Link href={link.url} className="hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Social Media Link */}
              {siteSettings.ctaSocialText && (
                <div className="text-xs sm:text-sm text-gray-500 font-semibold hover:text-white transition-colors mt-2">
                  <Link href={siteSettings.ctaSocialUrl || '#'}>
                    {siteSettings.ctaSocialText}
                  </Link>
                </div>
              )}
            </div>

            {/* Right Mascot/Graphic Area */}
            {siteSettings.ctaImageUrl && (
              <div className="flex-1 max-w-md w-full flex justify-center md:justify-end z-10">
                <img 
                  src={siteSettings.ctaImageUrl} 
                  alt="Mascots Mascot" 
                  className="max-h-60 sm:max-h-64 object-contain drop-shadow-2xl transition-transform hover:scale-[1.02]" 
                />
              </div>
            )}
            
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
