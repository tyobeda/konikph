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
  Share2,
  MessageCircle,
  Video,
  AtSign,
  Phone,
  Globe,
  Layers,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { MaintenanceContent } from '@/app/maintenance/page';

export default function HomePage() {
  const router = useRouter();
  const { artworks, users, dpwList, siteSettings, isMounted, isModuleUnderMaintenance } = useData();

  if (isModuleUnderMaintenance()) {
    return <MaintenanceContent />;
  }

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

  // Handle images for carousel hero banner (guarantee slide 1 / first image is displayed)
  const heroImages = useMemo(() => {
    if (!heroFeaturedArtwork) return [];
    if (Array.isArray(heroFeaturedArtwork.imageUrls) && heroFeaturedArtwork.imageUrls.length > 0) {
      const valid = heroFeaturedArtwork.imageUrls.filter(Boolean);
      if (valid.length > 0) return valid;
    }
    if (heroFeaturedArtwork.imageUrl) {
      return [heroFeaturedArtwork.imageUrl];
    }
    return ['/img/1315216787313421.jpg'];
  }, [heroFeaturedArtwork]);

  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  // Reset slide index when featured artwork changes
  useEffect(() => {
    setHeroSlideIndex(0);
  }, [heroFeaturedArtwork?.id]);

  // Auto-slide effect if multiple images in carousel
  useEffect(() => {
    if (!heroImages || heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroImages]);

  const currentHeroImage = heroImages[heroSlideIndex] || heroImages[0] || heroFeaturedArtwork?.imageUrl || '/img/1315216787313421.jpg';

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
              <div className="order-1 lg:order-2 lg:col-span-5 relative h-56 sm:h-72 lg:h-full min-h-[220px] sm:min-h-[280px] overflow-hidden bg-slate-800 group">
                <Link
                  href={`/artwork/${heroFeaturedArtwork.slug || heroFeaturedArtwork.id}`}
                  className="block w-full h-full relative"
                >
                  <Image
                    key={currentHeroImage}
                    src={currentHeroImage}
                    alt={`${heroFeaturedArtwork.title}${heroImages.length > 1 ? ` - Slide ${heroSlideIndex + 1}` : ''}`}
                    fill
                    priority
                    unoptimized={Boolean(currentHeroImage.startsWith('data:') || currentHeroImage.startsWith('/uploads/'))}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-700"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-gray-900/90 via-gray-900/30 to-transparent pointer-events-none" />
                </Link>

                {/* Carousel Indicator Badge & Navigation */}
                {heroImages.length > 1 && (
                  <>
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold rounded-full border border-white/10 shadow-sm pointer-events-none">
                      <Layers size={13} className="text-[#F26522]" />
                      <span>Carousel ({heroSlideIndex + 1}/{heroImages.length})</span>
                    </div>

                    {/* Dots indicator bottom right */}
                    <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
                      {heroImages.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setHeroSlideIndex(idx);
                          }}
                          className={`rounded-full transition-all cursor-pointer ${
                            heroSlideIndex === idx
                              ? 'w-4 h-1.5 bg-[#F26522]'
                              : 'w-1.5 h-1.5 bg-white/50 hover:bg-white'
                          }`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    {/* Prev/Next Mini Arrow Buttons on Hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setHeroSlideIndex((prev) => (prev > 0 ? prev - 1 : heroImages.length - 1));
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs"
                      aria-label="Previous Slide"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setHeroSlideIndex((prev) => (prev < heroImages.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs"
                      aria-label="Next Slide"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
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
                      {(heroFeaturedArtwork.author.region || heroFeaturedArtwork.region || '').replace(/^DPW\s+/i, 'Wilayah ')}
                      {heroFeaturedArtwork.format && !['Hanya gambar', 'Hanya Gambar', 'HANYA_GAMBAR', 'Gambar'].includes(heroFeaturedArtwork.format.trim()) && (
                        ` • Format ${heroFeaturedArtwork.format}`
                      )}
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

              {/* Multi Social Media Links List with Icons */}
              {((siteSettings as any).ctaSocialLinks && (siteSettings as any).ctaSocialLinks.length > 0) ? (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                  {(siteSettings as any).ctaSocialLinks.map((item: any, idx: number) => {
                    const platform = (item.platform || '').toLowerCase();
                    return (
                      <a
                        key={idx}
                        href={item.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-[#F26522] text-gray-300 hover:text-white border border-white/10 hover:border-[#F26522] rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        {platform === 'instagram' && (
                          <svg className="w-3.5 h-3.5 text-pink-500 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        )}
                        {platform === 'facebook' && (
                          <svg className="w-3.5 h-3.5 text-blue-500 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>
                        )}
                        {platform === 'youtube' && (
                          <svg className="w-3.5 h-3.5 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                        )}
                        {platform === 'tiktok' && (
                          <svg className="w-3.5 h-3.5 text-cyan-400 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.96-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.33 1.55-1.3 2.55.01 1.01.55 1.97 1.39 2.51.85.54 1.95.63 2.87.23.95-.41 1.62-1.33 1.68-2.35.05-3.8.02-7.61.02-11.41z"/></svg>
                        )}
                        {platform === 'twitter' && (
                          <svg className="w-3.5 h-3.5 text-sky-400 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        )}
                        {platform === 'threads' && (
                          <img src="/threads-logo.svg" alt="Threads" className="w-3.5 h-3.5 object-contain filter invert" />
                        )}
                        {platform === 'whatsapp' && (
                          <svg className="w-3.5 h-3.5 text-emerald-400 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                        )}
                        {(!['instagram', 'facebook', 'youtube', 'tiktok', 'twitter', 'threads', 'whatsapp'].includes(platform)) && (
                          <Globe size={14} className="text-gray-400" />
                        )}
                        <span>{item.label}</span>
                      </a>
                    );
                  })}
                </div>
              ) : siteSettings.ctaSocialText ? (
                <div className="text-xs sm:text-sm text-gray-500 font-semibold hover:text-white transition-colors mt-2">
                  <Link href={siteSettings.ctaSocialUrl || '#'}>
                    {siteSettings.ctaSocialText}
                  </Link>
                </div>
              ) : null}
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
