'use client';

import React, { useState, useRef } from 'react';
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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl p-2.5 sm:p-3 mb-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Category Pills Container with Modern Scroll Controls */}
        <div className="relative flex-1 min-w-0 flex items-center group px-1">
          {/* Scroll Left Button */}
          <button
            onClick={() => scroll('left')}
            className="hidden sm:flex absolute left-0 z-10 w-7 h-7 bg-white/90 backdrop-blur-md rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-gray-900 hover:scale-110 items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            title="Scroll Kiri"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Category Pills (Horizontal scrollable, no native browser scrollbar) */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth w-full pr-2 sm:pr-0"
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl whitespace-nowrap transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-black text-white shadow-md shadow-black/10 scale-[1.02]'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scroll('right')}
            className="hidden sm:flex absolute right-0 z-10 w-7 h-7 bg-white/90 backdrop-blur-md rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-gray-900 hover:scale-110 items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            title="Scroll Kanan"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Region Filter Selector */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
          <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
            Daerah <ChevronDown size={14} className="text-gray-400" />
          </span>

          <div className="relative">
            <button
              onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
              className="flex items-center justify-between min-w-[150px] px-3.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 hover:bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 transition-all"
            >
              <span className="truncate">{selectedRegion || 'Semua Daerah'}</span>
            </button>

            {isRegionDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95">
                {REGIONS.map((region) => (
                  <button
                    key={region}
                    onClick={() => {
                      onSelectRegion(region === 'Semua Daerah' ? '' : region);
                      setIsRegionDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-orange-50 hover:text-[#F26522] ${
                      (selectedRegion === region || (!selectedRegion && region === 'Semua Daerah'))
                        ? 'font-bold text-[#F26522] bg-orange-50/50'
                        : 'text-gray-700 font-medium'
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
