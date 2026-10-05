'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES, REGIONS } from '@/lib/data';

interface FilterBarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeCategory,
  onSelectCategory,
  selectedRegion,
  onSelectRegion,
}) => {
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }
  };

  const scrollToCategory = (cat: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    onSelectCategory(cat);
    const container = scrollContainerRef.current;
    if (!container) return;

    const target = e?.currentTarget || (container.querySelector(`[data-category="${cat}"]`) as HTMLElement);
    if (target) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const currentScroll = container.scrollLeft;
      const targetOffset = targetRect.left - containerRect.left;
      const targetScroll = currentScroll + targetOffset - (containerRect.width / 2) + (targetRect.width / 2);
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
      setTimeout(checkScrollability, 350);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollability, 350);
    }
  };

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const target = container.querySelector(`[data-category="${activeCategory}"]`) as HTMLElement;
    if (target) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const currentScroll = container.scrollLeft;
      const targetOffset = targetRect.left - containerRect.left;
      const targetScroll = currentScroll + targetOffset - (containerRect.width / 2) + (targetRect.width / 2);
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
      setTimeout(checkScrollability, 350);
    }
  }, [activeCategory]);

  // Drag-to-scroll support
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftStartRef.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 6) {
      hasDraggedRef.current = true;
    }
    container.scrollLeft = scrollLeftStartRef.current - walk;
    checkScrollability();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 50);
    checkScrollability();
  };

  return (
    <div className="w-full bg-white dark:bg-[#161B26] border border-gray-100 dark:border-gray-800 rounded-2xl p-2.5 sm:p-3 mb-6 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Category Pills Container with Modern Scroll Controls */}
        <div className="relative flex-1 min-w-0 flex items-center gap-1.5 px-0.5">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center border transition-all ${
              canScrollLeft
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-[#F26522] hover:text-white hover:border-[#F26522] shadow-xs active:scale-95 cursor-pointer'
                : 'opacity-25 text-gray-400 dark:text-gray-600 border-transparent cursor-not-allowed'
            }`}
            title="Scroll Kiri"
            aria-label="Scroll Kiri"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Category Pills (Horizontal scrollable, no native browser scrollbar) */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollability}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth w-full select-none cursor-grab active:cursor-grabbing"
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  data-category={cat}
                  onClick={(e) => {
                    if (hasDraggedRef.current) return;
                    scrollToCategory(cat, e);
                  }}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl whitespace-nowrap transition-all duration-200 select-none shrink-0 ${
                    isActive
                      ? 'bg-black dark:bg-white text-white dark:text-gray-950 shadow-md shadow-black/10 scale-[1.02]'
                      : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center border transition-all ${
              canScrollRight
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-[#F26522] hover:text-white hover:border-[#F26522] shadow-xs active:scale-95 cursor-pointer'
                : 'opacity-25 text-gray-400 dark:text-gray-600 border-transparent cursor-not-allowed'
            }`}
            title="Scroll Kanan"
            aria-label="Scroll Kanan"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Region Filter Selector */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800 pt-2 md:pt-0">
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1">
            Daerah <ChevronDown size={14} className="text-gray-400" />
          </span>

          <div className="relative">
            <button
              onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
              className="flex items-center justify-between min-w-[150px] px-3.5 py-1.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 transition-all"
            >
              <span className="truncate">{selectedRegion || 'Semua Daerah'}</span>
            </button>

            {isRegionDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95">
                {REGIONS.map((region) => (
                  <button
                    key={region}
                    onClick={() => {
                      onSelectRegion(region === 'Semua Daerah' ? '' : region);
                      setIsRegionDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-[#F26522] ${
                      (selectedRegion === region || (!selectedRegion && region === 'Semua Daerah'))
                        ? 'font-bold text-[#F26522] bg-orange-50/50 dark:bg-orange-950/30'
                        : 'text-gray-700 dark:text-gray-300 font-medium'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
