'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  Trophy, 
  Medal, 
  Award, 
  Calendar, 
  MapPin, 
  ArrowLeft,
  ChevronRight, 
  TrendingUp,
  Users,
  User,
  Search,
  Filter,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { TOURNAMENT_EVENTS, PRESTASI_RECORDS, TournamentEvent, PrestasiRecord } from '@/lib/prestasiData';

export default function TournamentDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const eventData: TournamentEvent | undefined = useMemo(() => {
    return TOURNAMENT_EVENTS.find((e) => e.slug === slug);
  }, [slug]);

  const [activeTab, setActiveTab] = useState<'semua' | 'perseorangan' | 'tim'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedal, setSelectedMedal] = useState<string>('Semua');

  if (!eventData) {
    // If slug not found in predefined list, provide fallback or notFound
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px]">
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Ajang Kejuaraan Tidak Ditemukan</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-md mx-auto">
            Halaman data kejuaraan "{slug}" belum terdaftar atau telah diarsipkan.
          </p>
          <Link
            href="/prestasi"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs shadow-md hover:bg-red-700 transition-all"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Direktori Prestasi</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Achievements specifically for this tournament
  const eventAchievements = useMemo(() => {
    return PRESTASI_RECORDS.filter((rec) => {
      const matchSlug = rec.eventSlug === slug || rec.event.toLowerCase().includes(eventData.shortName.toLowerCase());
      const matchType = 
        activeTab === 'semua' || 
        (activeTab === 'perseorangan' && rec.participantType === 'Perseorangan') ||
        (activeTab === 'tim' && rec.participantType === 'Tim');
      const matchMedal = selectedMedal === 'Semua' || rec.medal === selectedMedal;
      const matchSearch = 
        rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.cabor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.matchClass.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSlug && matchType && matchMedal && matchSearch;
    });
  }, [slug, eventData, activeTab, selectedMedal, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-red-600 transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/prestasi" className="hover:text-red-600 transition-colors">Rekam Prestasi</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-bold truncate max-w-xs sm:max-w-md">
            {eventData.shortName}
          </span>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/prestasi"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Semua Rekam Prestasi</span>
          </Link>
        </div>

        {/* Hero Section: Tournament Overview */}
        <div className="bg-gradient-to-br from-gray-950 via-slate-900 to-red-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden border border-red-900/30">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-sm">
                <Trophy size={13} />
                <span>Hasil Resmi Multi-Event</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-gray-300 backdrop-blur-sm">
                Tahun {eventData.year}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {eventData.name}
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl">
              {eventData.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-gray-300">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-red-400" />
                <span>{eventData.period}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-red-400" />
                <span>{eventData.location}</span>
              </div>
            </div>
          </div>

          <div className="absolute right-[-30px] bottom-[-30px] opacity-10 text-white pointer-events-none">
            <Trophy size={280} />
          </div>
        </div>

        {/* Contingent Performance Summary Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Peringkat Kontingen */}
          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-3xl p-5 flex flex-col justify-between shadow-lg shadow-red-600/20">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                Klasemen Kontingen
              </span>
              <p className="text-3xl sm:text-4xl font-black mt-2 leading-none">
                Peringkat #{eventData.contingentRank}
              </p>
            </div>
            <p className="text-xs text-white/80 mt-2 font-medium">
              Dari {eventData.totalContingents} Kontingen Daerah
            </p>
          </div>

          {/* Emas */}
          <div className="bg-white dark:bg-[#111622] rounded-3xl p-5 border border-amber-200/80 dark:border-amber-800/40 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <Medal size={24} />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 leading-none">
                {eventData.medals.gold}
              </p>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1 uppercase tracking-wider">
                Emas
              </p>
            </div>
          </div>

          {/* Perak */}
          <div className="bg-white dark:bg-[#111622] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/40 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-400 to-gray-300 text-white flex items-center justify-center shadow-md shadow-slate-400/20 shrink-0">
              <Medal size={24} />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-600 dark:text-slate-300 leading-none">
                {eventData.medals.silver}
              </p>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1 uppercase tracking-wider">
                Perak
              </p>
            </div>
          </div>

          {/* Perunggu */}
          <div className="bg-white dark:bg-[#111622] rounded-3xl p-5 border border-amber-800/30 dark:border-amber-800/30 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-700/20 shrink-0">
              <Medal size={24} />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-500 leading-none">
                {eventData.medals.bronze}
              </p>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1 uppercase tracking-wider">
                Perunggu
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="col-span-2 lg:col-span-1 bg-white dark:bg-[#111622] rounded-3xl p-5 border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gray-900 to-gray-700 text-white flex items-center justify-center shadow-md shrink-0">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-none">
                {eventData.medals.total}
              </p>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1 uppercase tracking-wider">
                Total Medali
              </p>
            </div>
          </div>
        </div>

        {/* Klasemen Perolehan Medali Kontingen per Cabang Olahraga */}
        <section className="bg-white dark:bg-[#111622] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-6 sm:p-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-red-600" />
                <span>Klasemen Medali Kontingen per Cabang Olahraga</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Rincian perolehan medali yang disumbangkan masing-masing cabor pada {eventData.shortName}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 uppercase text-[11px] font-bold">
                  <th className="py-3 px-3">Peringkat</th>
                  <th className="py-3 px-3">Cabang Olahraga</th>
                  <th className="py-3 px-3 text-center">🥇 Emas</th>
                  <th className="py-3 px-3 text-center">🥈 Perak</th>
                  <th className="py-3 px-3 text-center">🥉 Perunggu</th>
                  <th className="py-3 px-3 text-center font-black">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-medium">
                {eventData.standingsByCabor.map((item, idx) => (
                  <tr key={item.cabor} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-gray-400">
                      {idx === 0 ? '🏆 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">
                      <Link href="/cabor" className="hover:text-red-600 transition-colors">
                        {item.cabor}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-600 dark:text-amber-400">
                      {item.gold}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-500 dark:text-slate-400">
                      {item.silver}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-700 dark:text-amber-500">
                      {item.bronze}
                    </td>
                    <td className="py-3 px-3 text-center font-black text-gray-900 dark:text-white">
                      {item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Rincian Atlet & Tim Peraih Medali di Ajang Ini */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Award size={20} className="text-red-600" />
                <span>Rincian Atlet & Tim Peraih Medali</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Daftar pahlawan olahraga Kabupaten Kepahiang di {eventData.shortName}
              </p>
            </div>

            {/* Toggle Perseorangan vs Tim */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('semua')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'semua'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Semua ({eventAchievements.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('perseorangan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'perseorangan'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <User size={13} />
                <span>Perseorangan</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tim')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'tim'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Users size={13} />
                <span>Tim / Beregu</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white dark:bg-[#111622] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari atlet, nomor tanding, cabor..."
                className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-3 py-2 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <select
                value={selectedMedal}
                onChange={(e) => setSelectedMedal(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
              >
                <option value="Semua">Semua Medali</option>
                <option value="Emas">🥇 Medali Emas</option>
                <option value="Perak">🥈 Medali Perak</option>
                <option value="Perunggu">🥉 Medali Perunggu</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {eventAchievements.length === 0 ? (
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-gray-200/80 dark:border-gray-800 p-12 text-center text-gray-500">
              <Trophy size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Tidak ada atlet/tim yang cocok</p>
              <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau kategori yang Anda pilih.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {eventAchievements.map((item) => {
                const isGold = item.medal === 'Emas';
                const isSilver = item.medal === 'Perak';
                const isBronze = item.medal === 'Perunggu';
                const isTeam = item.participantType === 'Tim';

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#111622] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Medal & Type Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${
                            isGold
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300/40'
                              : isSilver
                              ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300/40'
                              : 'bg-amber-900/10 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-800/40'
                          }`}
                        >
                          <Medal size={13} />
                          <span>Medali {item.medal}</span>
                        </span>

                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isTeam
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        }`}>
                          {isTeam ? <Users size={12} /> : <User size={12} />}
                          <span>{item.participantType}</span>
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                        {item.name}
                      </h3>

                      <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-1">
                        {item.cabor}
                      </p>

                      {/* Details: Class & Members */}
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/60 space-y-1.5 text-xs">
                        <p className="font-bold text-gray-800 dark:text-gray-200">
                          {item.matchClass}
                        </p>

                        {isTeam && item.teamMembers && (
                          <div className="pt-1">
                            <span className="text-[11px] font-semibold text-gray-400 block mb-0.5">Anggota Tim:</span>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                              {item.teamMembers.join(', ')}
                            </p>
                          </div>
                        )}

                        {item.notes && (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 italic pt-1">
                            "{item.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400">
                      <span>{item.date || eventData.period}</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {item.location || eventData.location}
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
