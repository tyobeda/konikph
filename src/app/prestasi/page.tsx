'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  Trophy, 
  Medal, 
  Award, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  TrendingUp,
  Users,
  User,
  Sparkles,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { PRESTASI_RECORDS, TOURNAMENT_EVENTS, PrestasiRecord } from '@/lib/prestasiData';
import { CABOR_LIST } from '@/lib/data';

export default function PrestasiDirectoryPage() {
  const [participantFilter, setParticipantFilter] = useState<'Semua' | 'Perseorangan' | 'Tim'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedal, setSelectedMedal] = useState<string>('Semua');
  const [selectedCabor, setSelectedCabor] = useState<string>('Semua');
  const [selectedYear, setSelectedYear] = useState<string>('Semua');
  const [selectedLevel, setSelectedLevel] = useState<string>('Semua');

  // Overall Statistics
  const stats = useMemo(() => {
    let gold = 0;
    let silver = 0;
    let bronze = 0;
    let individual = 0;
    let team = 0;

    PRESTASI_RECORDS.forEach((rec) => {
      if (rec.medal === 'Emas') gold++;
      if (rec.medal === 'Perak') silver++;
      if (rec.medal === 'Perunggu') bronze++;
      if (rec.participantType === 'Perseorangan') individual++;
      if (rec.participantType === 'Tim') team++;
    });

    return {
      total: PRESTASI_RECORDS.length,
      gold,
      silver,
      bronze,
      individual,
      team,
    };
  }, []);

  // Top 5 Most Accomplished Cabor
  const top5Cabor = useMemo(() => {
    const tally: Record<
      string,
      {
        cabor: string;
        gold: number;
        silver: number;
        bronze: number;
        total: number;
        athletesCount: number;
      }
    > = {};

    PRESTASI_RECORDS.forEach((rec) => {
      if (!tally[rec.cabor]) {
        tally[rec.cabor] = {
          cabor: rec.cabor,
          gold: 0,
          silver: 0,
          bronze: 0,
          total: 0,
          athletesCount: 0,
        };
      }
      if (rec.medal === 'Emas') tally[rec.cabor].gold++;
      if (rec.medal === 'Perak') tally[rec.cabor].silver++;
      if (rec.medal === 'Perunggu') tally[rec.cabor].bronze++;
      tally[rec.cabor].total++;
      tally[rec.cabor].athletesCount++;
    });

    return Object.values(tally)
      .sort((a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || b.total - a.total)
      .slice(0, 5);
  }, []);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return PRESTASI_RECORDS.filter((item) => {
      // Type (Perseorangan vs Tim)
      if (participantFilter !== 'Semua' && item.participantType !== participantFilter) {
        return false;
      }
      // Medal
      if (selectedMedal !== 'Semua' && item.medal !== selectedMedal) {
        return false;
      }
      // Cabor
      if (selectedCabor !== 'Semua' && item.cabor !== selectedCabor) {
        return false;
      }
      // Year
      if (selectedYear !== 'Semua' && item.year.toString() !== selectedYear) {
        return false;
      }
      // Level
      if (selectedLevel !== 'Semua' && item.level !== selectedLevel) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCabor = item.cabor.toLowerCase().includes(q);
        const matchEvent = item.event.toLowerCase().includes(q);
        const matchClass = item.matchClass.toLowerCase().includes(q);
        const matchCoach = item.coach?.toLowerCase().includes(q);
        const matchMembers = item.teamMembers?.some((m) => m.toLowerCase().includes(q));

        if (!matchName && !matchCabor && !matchEvent && !matchClass && !matchCoach && !matchMembers) {
          return false;
        }
      }

      return true;
    });
  }, [participantFilter, selectedMedal, selectedCabor, selectedYear, selectedLevel, searchQuery]);

  // Reset Filters
  const handleResetFilters = () => {
    setParticipantFilter('Semua');
    setSearchQuery('');
    setSelectedMedal('Semua');
    setSelectedCabor('Semua');
    setSelectedYear('Semua');
    setSelectedLevel('Semua');
  };

  const hasActiveFilters =
    participantFilter !== 'Semua' ||
    selectedMedal !== 'Semua' ||
    selectedCabor !== 'Semua' ||
    selectedYear !== 'Semua' ||
    selectedLevel !== 'Semua' ||
    searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] transition-colors duration-200 overflow-x-hidden w-full max-w-full">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-red-600 transition-colors">Beranda</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-bold">Rekam Jejak Prestasi</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-950 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden border border-amber-900/30">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-red-600 text-white text-xs font-black uppercase tracking-wider rounded-full mb-3 shadow-sm">
              <Trophy size={13} />
              <span>Database Rekam Prestasi Atlet & Tim</span>
            </span>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Rekam Jejak Prestasi Olahraga KONI Kepahiang
            </h1>

            <p className="text-xs sm:text-sm text-amber-200/90 mt-2 leading-relaxed">
              Arsip resmi torehan medali dan capaian gemilang para atlet perseorangan dan tim cabang olahraga binaan KONI Kabupaten Kepahiang di berbagai kejuaraan resmi daerah, provinsi, regional, dan nasional.
            </p>

            {/* Quick Stat Highlights */}
            <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-white/10 text-xs max-w-full">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <span className="text-amber-400 font-black text-sm">{stats.total}</span>
                <span className="text-gray-200 font-semibold">Total Prestasi</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <User size={13} className="text-blue-400" />
                <span className="text-white font-black text-sm">{stats.individual}</span>
                <span className="text-gray-200 font-semibold">Perseorangan</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <Users size={13} className="text-purple-400" />
                <span className="text-white font-black text-sm">{stats.team}</span>
                <span className="text-gray-200 font-semibold">Tim / Beregu</span>
              </div>
              <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 rounded-xl backdrop-blur-sm text-amber-300">
                <span>🥇 {stats.gold} Emas</span>
                <span className="text-white/40">•</span>
                <span>🥈 {stats.silver} Perak</span>
                <span className="text-white/40">•</span>
                <span>🥉 {stats.bronze} Perunggu</span>
              </div>
            </div>
          </div>

          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-white pointer-events-none">
            <Trophy size={280} />
          </div>
        </div>

        {/* ── 5 Besar Cabor Paling Berprestasi ── */}
        <section className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-1.5">
                <Trophy size={13} />
                <span>Leaderboard Olahraga Daerah</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                5 Besar Cabor Paling Berprestasi
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Cabang olahraga dengan sumbangan medali dan prestasi terbanyak untuk Kabupaten Kepahiang
              </p>
            </div>

            <Link
              href="/cabor"
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Lihat Semua 23 Cabor</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {top5Cabor.map((item, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;
              const isSelected = selectedCabor === item.cabor;

              return (
                <div
                  key={item.cabor}
                  onClick={() => {
                    setSelectedCabor(isSelected ? 'Semua' : item.cabor);
                    const el = document.getElementById('daftar-rekam-prestasi');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                    isSelected
                      ? 'ring-2 ring-red-500 bg-red-50/50 dark:bg-red-950/20 border-red-500'
                      : isFirst
                      ? 'bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-gray-900 border-amber-300/80 dark:border-amber-800/60 shadow-md hover:shadow-lg hover:border-amber-400'
                      : isSecond
                      ? 'bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/30 dark:to-gray-900 border-slate-300/80 dark:border-slate-700/60 shadow-xs hover:shadow-md hover:border-slate-400'
                      : isThird
                      ? 'bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/20 dark:to-gray-900 border-orange-200/80 dark:border-orange-800/40 shadow-xs hover:shadow-md hover:border-orange-300'
                      : 'bg-white dark:bg-[#111622] border-gray-200/80 dark:border-gray-800 shadow-xs hover:border-red-500/40 hover:shadow-md'
                  }`}
                  title="Klik untuk memfilter prestasi cabor ini"
                >
                  {/* Top Rank Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-xs font-black uppercase ${
                        isFirst
                          ? 'bg-amber-500 text-white shadow-xs'
                          : isSecond
                          ? 'bg-slate-400 text-white'
                          : isThird
                          ? 'bg-amber-700 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {isFirst ? '🏆 #1' : isSecond ? '🥈 #2' : isThird ? '🥉 #3' : `#${idx + 1}`}
                    </span>

                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {item.total} Prestasi
                    </span>
                  </div>

                  {/* Middle Row: Cabor Info (Left) + Medals (Right) */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-snug group-hover:text-red-600 transition-colors truncate">
                        {item.cabor}
                      </h3>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                        {item.athletesCount} atlet / tim tercatat
                      </p>
                    </div>

                    {/* Medals right-aligned */}
                    <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold pl-2">
                      <span className="text-amber-600 dark:text-amber-400 whitespace-nowrap" title="Medali Emas">
                        🥇 {item.gold}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap" title="Medali Perak">
                        🥈 {item.silver}
                      </span>
                      <span className="text-amber-700 dark:text-amber-500 whitespace-nowrap" title="Medali Perunggu">
                        🥉 {item.bronze}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Tournament Banner (Link to Specific Event Klasemen /porprovxbengkulu) */}
        <div className="mb-8 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-red-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                  Ajang Utama
                </span>
                <span className="text-xs font-bold text-white/90">PORPROV X Bengkulu 2026</span>
              </div>
              <h3 className="text-base sm:text-lg font-black mt-0.5">
                Lihat Rekap Klasemen & Rincian Medali PORPROV X Bengkulu
              </h3>
            </div>
          </div>

          <Link
            href="/prestasi/porprovxbengkulu"
            className="px-5 py-2.5 bg-white hover:bg-gray-100 text-red-600 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 shrink-0 self-end md:self-center"
          >
            <span>Buka Halaman PORPROV</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* ── Main Section: Filter Tabs (Semua / Perseorangan / Tim) ── */}
        <section id="daftar-rekam-prestasi" className="space-y-6 scroll-mt-24">
          
          {/* Header Row & Tab Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/80 dark:border-gray-800">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Award size={20} className="text-red-600" />
                <span>Daftar Rekam Prestasi Cabor</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Menampilkan {filteredRecords.length} dari total {PRESTASI_RECORDS.length} riwayat prestasi
              </p>
            </div>

            {/* Segmented Tab: Semua / Perseorangan / Tim (Responsive & Non-Overflowing) */}
            <div className="flex flex-wrap sm:inline-flex items-center p-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 max-w-full gap-1">
              <button
                type="button"
                onClick={() => setParticipantFilter('Semua')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-initial text-center ${
                  participantFilter === 'Semua'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Semua ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => setParticipantFilter('Perseorangan')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial ${
                  participantFilter === 'Perseorangan'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <User size={13} />
                <span>Perseorangan ({stats.individual})</span>
              </button>
              <button
                type="button"
                onClick={() => setParticipantFilter('Tim')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial ${
                  participantFilter === 'Tim'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Users size={13} />
                <span>Tim / Beregu ({stats.team})</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-[#111622] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-4 sm:p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              
              {/* Search input */}
              <div className="lg:col-span-2 relative">
                <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari atlet, nama tim, nomor tanding..."
                  className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-3 py-2 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Filter Cabor */}
              <div>
                <select
                  value={selectedCabor}
                  onChange={(e) => setSelectedCabor(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
                >
                  <option value="Semua">Semua Cabor</option>
                  {CABOR_LIST.filter((c) => c !== 'KONI (Umum)').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Filter Medali */}
              <div>
                <select
                  value={selectedMedal}
                  onChange={(e) => setSelectedMedal(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
                >
                  <option value="Semua">Semua Medali</option>
                  <option value="Emas">🥇 Emas</option>
                  <option value="Perak">🥈 Perak</option>
                  <option value="Perunggu">🥉 Perunggu</option>
                </select>
              </div>

              {/* Filter Tingkat */}
              <div>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
                >
                  <option value="Semua">Semua Tingkat</option>
                  <option value="Daerah">Tingkat Daerah / Kab.</option>
                  <option value="Provinsi">Tingkat Provinsi</option>
                  <option value="Regional">Tingkat Regional Sumatera</option>
                  <option value="Nasional">Tingkat Nasional</option>
                  <option value="Internasional">Tingkat Internasional</option>
                </select>
              </div>
            </div>

            {/* Active Filters Bar & Reset */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  Filter aktif: {participantFilter !== 'Semua' ? `[Tipe: ${participantFilter}] ` : ''}
                  {selectedCabor !== 'Semua' ? `[${selectedCabor}] ` : ''}
                  {selectedMedal !== 'Semua' ? `[Medali ${selectedMedal}] ` : ''}
                  {selectedLevel !== 'Semua' ? `[Tingkat ${selectedLevel}] ` : ''}
                  {searchQuery ? `[Kata kunci: "${searchQuery}"] ` : ''}
                </span>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-2.5 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Reset Filter</span>
                </button>
              </div>
            )}
          </div>

          {/* Records Grid */}
          {filteredRecords.length === 0 ? (
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-12 text-center text-gray-500">
              <Trophy size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="font-bold text-base text-gray-800 dark:text-gray-200">
                Tidak ada rekam prestasi yang cocok
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Coba sesuaikan kata kunci pencarian, ubah filter cabor, atau klik reset filter di atas.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRecords.map((item) => {
                const isGold = item.medal === 'Emas';
                const isSilver = item.medal === 'Perak';
                const isTeam = item.participantType === 'Tim';

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#111622] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs hover:border-red-500/40 hover:shadow-md transition-all p-5 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header: Medal Badge & Participant Type Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            isGold
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300/40'
                              : isSilver
                              ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300/40'
                              : 'bg-amber-900/10 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-800/40'
                          }`}
                        >
                          <Medal size={14} />
                          <span>Medali {item.medal}</span>
                        </span>

                        {/* Type Badge: Tim or Perseorangan */}
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                            isTeam
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40'
                          }`}
                        >
                          {isTeam ? <Users size={12} /> : <User size={12} />}
                          <span>{item.participantType}</span>
                        </span>
                      </div>

                      {/* Athlete / Team Name */}
                      <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight group-hover:text-red-600 transition-colors">
                        {item.name}
                      </h3>

                      {/* Cabor Name */}
                      <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">
                        {item.cabor}
                      </p>

                      {/* Event Details */}
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/60 space-y-1.5 text-xs">
                        
                        {/* Event Link if slug exists */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1">
                            {item.event}
                          </span>
                          {item.eventSlug && (
                            <Link
                              href={`/prestasi/${item.eventSlug}`}
                              className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5 shrink-0"
                              title="Lihat Rekap Kejuaraan"
                            >
                              <span>Lihat Event</span>
                              <ExternalLink size={10} />
                            </Link>
                          )}
                        </div>

                        {/* Match Class / Number */}
                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                          Nomor: <strong className="text-gray-900 dark:text-gray-200">{item.matchClass}</strong>
                        </p>

                        {/* If Team, list members */}
                        {isTeam && item.teamMembers && item.teamMembers.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                              Anggota Tim:
                            </span>
                            <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                              {item.teamMembers.join(', ')}
                            </p>
                          </div>
                        )}

                        {/* Notes */}
                        {item.notes && (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 italic pt-1 line-clamp-2">
                            "{item.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Info: Level, Location & Year */}
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400">
                      <span className="font-semibold text-gray-600 dark:text-gray-400">
                        Tingkat {item.level}
                      </span>
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                        {item.year}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
