'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function HomePage() {
  const { artworks, users, dpwList, siteSettings, isMounted } = useData();
  const [activeCategory, setActiveCategory] = useState('Semua Karya');
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
      const matchesSearch =
        !searchQuery ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.author.region.toLowerCase().includes(selectedRegion.toLowerCase());

      return matchesCategory && matchesRegion && matchesSearch;
    });
  }, [artworks, activeCategory, selectedRegion, searchQuery]);

  // Display pagination limit
  const [visibleCount, setVisibleCount] = useState(12);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);
  
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [gridMinHeight, setGridMinHeight] = useState<number | undefined>(undefined);

  // Smooth filter handler
  const handleCategoryChange = (val: string) => {
    if (gridContainerRef.current) {
      setGridMinHeight(gridContainerRef.current.offsetHeight);
    }
    setActiveCategory(val);
    setTimeout(() => setGridMinHeight(undefined), 600);
  };

  const handleRegionChange = (val: string) => {
    if (gridContainerRef.current) {
      setGridMinHeight(gridContainerRef.current.offsetHeight);
    }
    setSelectedRegion(val);
    setTimeout(() => setGridMinHeight(undefined), 600);
  };

  // Reset pagination count when category/region/search changes
  useEffect(() => {
    setVisibleCount(12);
  }, [activeCategory, selectedRegion, searchQuery]);

  // Load more when reaching bottom of page
  const loadMoreItems = useCallback(() => {
    if (visibleCount >= baseFiltered.length) return;
    setVisibleCount((prev) => Math.min(prev + 8, baseFiltered.length));
  }, [visibleCount, baseFiltered.length]);

  // Intersection Observer for Infinite Scroll trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTargetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMoreItems]);

  const displayedArtworks = baseFiltered.slice(0, visibleCount);
  const hasMore = visibleCount < baseFiltered.length;

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
                <img
                  src={heroFeaturedArtwork.imageUrl}
                  alt={heroFeaturedArtwork.title}
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
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
                  <img
                    src={heroFeaturedArtwork.author.avatar}
                    alt={heroFeaturedArtwork.author.name}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-[#F26522]"
                  />
                  <div>
                    <p className="text-xs font-extrabold text-white">
                      {heroFeaturedArtwork.author.name}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium">
                      {heroFeaturedArtwork.author.region} • Format {heroFeaturedArtwork.format || 'PSD/AI'}
                    </p>
                  </div>
                </div>

                {/* CTA Action Buttons (1 Row 2 Columns on Mobile) */}
                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-3">
                  <Link
                    href={`/artwork/${heroFeaturedArtwork.id}`}
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
              Feed Timeline Terbaru PKSart
            </h2>
          </div>

          <Link
            href="/explore"
            className="text-xs font-bold text-[#F26522] hover:underline flex items-center gap-1"
          >
            <span>Buka Mode Eksplorasi</span>
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

            {/* Infinite Scroll Loader Target */}
            {hasMore && (
              <div
                ref={observerTargetRef}
                className="py-8 flex items-center justify-center text-gray-400 text-xs font-semibold"
              >
                <span>Memuat karya berikutnya...</span>
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
      {isMounted && siteSettings.ctaEnabled && (
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
