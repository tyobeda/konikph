'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Activity, ArrowRight } from 'lucide-react';
import { MATCH_SCORES_DATA, MatchScore } from '@/lib/matchScores';

export function LiveScoreTicker() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const hasLiveMatch = MATCH_SCORES_DATA.some((m) => m.status === 'LIVE');

  return (
    <div className="mb-6 relative group">
      <div className="bg-white dark:bg-[#111622] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-1.5 sm:p-2 flex items-center gap-2 overflow-hidden transition-all">
        
        {/* Left Live Anchor Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 shrink-0">
          <span className="relative flex h-2 w-2">
            {hasLiveMatch && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            )}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 whitespace-nowrap">
            {hasLiveMatch ? 'Live Skor' : 'Hasil Skor'}
          </span>
        </div>

        {/* Scroll Left Button (Desktop) */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="hidden md:flex p-1 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0 cursor-pointer"
          aria-label="Scroll skor ke kiri"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Horizontal Matches Track */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 flex-1 min-w-0"
        >
          {MATCH_SCORES_DATA.map((match) => {
            const isLive = match.status === 'LIVE';
            const isFinished = match.status === 'FT';

            return (
              <div
                key={match.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs shrink-0 transition-all ${
                  isLive
                    ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200/80 dark:border-red-900/50 text-gray-900 dark:text-white'
                    : 'bg-gray-50/80 dark:bg-gray-900/60 border-gray-200/60 dark:border-gray-800 text-gray-800 dark:text-gray-200'
                }`}
              >
                {/* Match Status Tag */}
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap ${
                    isLive
                      ? 'bg-red-600 text-white animate-pulse'
                      : isFinished
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                  }`}
                >
                  {match.statusLabel}
                </span>

                {/* Cabor Tag */}
                <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase">
                  {match.cabor}:
                </span>

                {/* Teams & Score */}
                <div className="flex items-center gap-1.5 font-bold whitespace-nowrap">
                  <span className={match.teamHome.isKepahiang ? 'text-red-600 dark:text-red-400 font-black' : ''}>
                    {match.teamHome.name}
                  </span>

                  {match.status !== 'UPCOMING' ? (
                    <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 font-mono font-black text-xs text-gray-900 dark:text-white shadow-2xs">
                      {match.teamHome.score} - {match.teamAway.score}
                    </span>
                  ) : (
                    <span className="text-gray-400 font-mono text-[11px]">vs</span>
                  )}

                  <span className={match.teamAway.isKepahiang ? 'text-red-600 dark:text-red-400 font-black' : ''}>
                    {match.teamAway.name}
                  </span>
                </div>

                {/* Note / Subtext */}
                {match.note && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 border-l border-gray-200 dark:border-gray-700 pl-2 hidden sm:inline whitespace-nowrap">
                    {match.note}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Scroll Right Button (Desktop) */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className="hidden md:flex p-1 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0 cursor-pointer"
          aria-label="Scroll skor ke kanan"
        >
          <ChevronRight size={16} />
        </button>

        {/* More Link */}
        <Link
          href="/agenda"
          className="px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0 flex items-center gap-1 whitespace-nowrap"
          title="Lihat semua jadwal pertandingan"
        >
          <span className="hidden sm:inline">Jadwal</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

export default LiveScoreTicker;
