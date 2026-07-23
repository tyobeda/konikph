'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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

  return (
    <div className="w-full bg-white border-b border-gray-100 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Category Pills (Horizontal scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all select-none ${
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Region Filter Selector */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            Daerah <ChevronDown size={14} className="text-gray-500" />
          </span>

          <div className="relative">
            <button
              onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
              className="flex items-center justify-between min-w-[160px] px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F26522]"
            >
              <span className="truncate">{selectedRegion || 'DPW Jabar, DKI, etc.'}</span>
            </button>

            {isRegionDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30 animate-in fade-in">
                {REGIONS.map((region) => (
                  <button
                    key={region}
                    onClick={() => {
                      onSelectRegion(region === 'Semua Daerah' ? '' : region);
                      setIsRegionDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 hover:text-[#F26522] ${
                      (selectedRegion === region || (!selectedRegion && region === 'Semua Daerah'))
                        ? 'font-bold text-[#F26522] bg-orange-50/50'
                        : 'text-gray-700'
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
