'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Trophy, 
  Search, 
  Filter, 
  Share2, 
  CalendarPlus, 
  ChevronRight, 
  Sparkles,
  Award,
  Users
} from 'lucide-react';
import { CABOR_LIST } from '@/lib/data';

interface AgendaItem {
  id: string;
  title: string;
  category: 'Kejuaraan' | 'Seleksi' | 'Pelatihan' | 'Organisasi';
  cabor: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  time: string;
  location: string;
  description: string;
  status: 'Akan Datang' | 'Berlangsung' | 'Selesai';
  organizer: string;
}

const INITIAL_AGENDA: AgendaItem[] = [
  {
    id: 'porprov-bengkulu-2026',
    title: 'Pekan Olahraga Provinsi (Porprov) Bengkulu 2026',
    category: 'Kejuaraan',
    cabor: 'KONI (Umum)',
    startDate: '2026-11-10',
    endDate: '2026-11-20',
    time: '08:00 - 18:00 WIB',
    location: 'Kota Bengkulu & GOR Tebat Monok',
    description: 'Pesta olahraga akbar se-Provinsi Bengkulu. Kontingen Kabupaten Kepahiang menargetkan peringkat 5 besar dengan mengandalkan 23 cabang olahraga unggulan.',
    status: 'Akan Datang',
    organizer: 'KONI Provinsi Bengkulu & KONI Kepahiang',
  },
  {
    id: 'porkab-kepahiang-2026',
    title: 'Pekan Olahraga Kabupaten (Porkab) Kepahiang 2026',
    category: 'Kejuaraan',
    cabor: 'KONI (Umum)',
    startDate: '2026-08-15',
    endDate: '2026-08-22',
    time: '08:30 - 17:30 WIB',
    location: 'Kompleks GOR Tebat Monok & Stadion Mini',
    description: 'Ajang seleksi dan kompetisi multi-cabor antarkecamatan se-Kabupaten Kepahiang dalam rangka menjaring atlet potensial daerah.',
    status: 'Akan Datang',
    organizer: 'KONI Kabupaten Kepahiang',
  },
  {
    id: 'kejurda-karate-bupati-cup',
    title: 'Kejurda Karate Bupati Cup Kepahiang 2026',
    category: 'Kejuaraan',
    cabor: 'FORKI (Karate)',
    startDate: '2026-07-25',
    endDate: '2026-07-27',
    time: '09:00 - 17:00 WIB',
    location: 'Gedung Serbaguna GOR Tebat Monok',
    description: 'Kejuaraan karate terbuka memperebutkan Piala Bergilir Bupati Kepahiang untuk kategori usia dini, kadet, dan junior.',
    status: 'Akan Datang',
    organizer: 'Pengkab FORKI Kepahiang',
  },
  {
    id: 'seleksi-atlet-pasi-2026',
    title: 'Seleksi Terbuka Atletik Pelajar Menuju Porprov',
    category: 'Seleksi',
    cabor: 'PASI (Atletik)',
    startDate: '2026-06-18',
    endDate: '2026-06-19',
    time: '07:00 - 12:00 WIB',
    location: 'Lintasan Lari Stadion Mini Tebat Monok',
    description: 'Seleksi nomor lari 100m, 400m, 1500m, tolak peluru, dan lompat jauh bagi pelajar tingkat SMP dan SMA.',
    status: 'Akan Datang',
    organizer: 'Pengkab PASI Kepahiang',
  },
  {
    id: 'kejuaraan-silat-pelajar-ipsi',
    title: 'Kejuaraan Pencak Silat Pelajar se-Kepahiang',
    category: 'Kejuaraan',
    cabor: 'IPSI (Pencak Silat)',
    startDate: '2026-05-20',
    endDate: '2026-05-23',
    time: '08:00 - 21:00 WIB',
    location: 'Padepokan Silat Tebat Monok',
    description: 'Kompetisi seni tanding dan tunggal IPSI untuk memupuk sportivitas serta regenerasi pendekar muda Kepahiang.',
    status: 'Selesai',
    organizer: 'Pengkab IPSI Kepahiang',
  },
  {
    id: 'turnamen-futsal-pemuda-pssi',
    title: 'Turnamen Futsal Pemuda Bupati Cup',
    category: 'Kejuaraan',
    cabor: 'PSSI (Sepak Bola & Futsal)',
    startDate: '2026-05-02',
    endDate: '2026-05-06',
    time: '14:00 - 22:00 WIB',
    location: 'Lapangan Futsal Tebat Monok',
    description: 'Turnamen futsal antar-desa dan kelurahan se-Kabupaten Kepahiang dalam rangka pembinaan bibit pesepak bola muda.',
    status: 'Selesai',
    organizer: 'Askab PSSI Kepahiang',
  },
  {
    id: 'pelatihan-pelatih-cabor-2026',
    title: 'Coaching Clinic & Sertifikasi Pelatih Cabor Tingkat Daerah',
    category: 'Pelatihan',
    cabor: 'KONI (Umum)',
    startDate: '2026-07-05',
    endDate: '2026-07-07',
    time: '08:30 - 16:30 WIB',
    location: 'Aula Sekretariat KONI Kepahiang',
    description: 'Peningkatan kapasitas ilmu kepelatihan sport science dan manajemen atlet bagi para pelatih 23 cabang olahraga.',
    status: 'Akan Datang',
    organizer: 'Bidang Pembinaan Prestasi KONI Kepahiang',
  },
  {
    id: 'rakerda-koni-kepahiang-2026',
    title: 'Rapat Kerja Kabupaten (Rakerkab) KONI Kepahiang 2026',
    category: 'Organisasi',
    cabor: 'KONI (Umum)',
    startDate: '2026-08-01',
    time: '09:00 - 16:00 WIB',
    location: 'Gedung Pertemuan Pemkab Kepahiang',
    description: 'Evaluasi program kerja dan pemantapan kesiapan kontingen Porprov Bengkulu 2026 bersama 23 pengurus cabor.',
    status: 'Akan Datang',
    organizer: 'Sekretariat KONI Kepahiang',
  },
];

export default function AgendaPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [selectedCabor, setSelectedCabor] = useState<string>('Semua');

  const filteredAgenda = useMemo(() => {
    return INITIAL_AGENDA.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.cabor.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
      const matchStatus = selectedStatus === 'Semua' || item.status === selectedStatus;
      const matchCabor = selectedCabor === 'Semua' || item.cabor === selectedCabor;
      return matchSearch && matchCategory && matchStatus && matchCabor;
    });
  }, [search, selectedCategory, selectedStatus, selectedCabor]);

  const generateGCalUrl = (item: AgendaItem) => {
    const title = encodeURIComponent(item.title);
    const details = encodeURIComponent(`${item.description}\n\nPenyelenggara: ${item.organizer}\nCabang Olahraga: ${item.cabor}`);
    const location = encodeURIComponent(item.location);
    const startFormatted = item.startDate.replace(/-/g, '');
    const endFormatted = item.endDate ? item.endDate.replace(/-/g, '') : startFormatted;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startFormatted}/${endFormatted}`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.toLocaleDateString('id-ID', { day: 'numeric' }),
      month: d.toLocaleDateString('id-ID', { month: 'short' }),
      year: d.toLocaleDateString('id-ID', { year: 'numeric' }),
    };
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-red-600 transition-colors">Beranda</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-bold">Agenda & Kalender Kegiatan</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-red-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden border border-gray-800">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full mb-3 shadow-sm">
              <Calendar size={13} />
              <span>Kalender Olahraga Resmi</span>
            </span>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Agenda & Kalender Olahraga Kepahiang
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
              Jadwal lengkap turnamen, pekan olahraga, seleksi atlet daerah, pelatihan kepelatihan, dan kegiatan resmi 23 cabang olahraga di bawah naungan KONI Kabupaten Kepahiang.
            </p>
          </div>

          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-white pointer-events-none">
            <Calendar size={280} />
          </div>
        </div>

        {/* Filters & Search Matrix */}
        <div className="bg-white dark:bg-[#111622] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 sm:p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari turnamen, lokasi..."
                className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-3 py-2.5 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Kejuaraan">Kejuaraan & Turnamen</option>
                <option value="Seleksi">Seleksi Atlet</option>
                <option value="Pelatihan">Pelatihan & Coaching</option>
                <option value="Organisasi">Rapat & Kongres</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
              >
                <option value="Semua">Semua Status</option>
                <option value="Akan Datang">Akan Datang</option>
                <option value="Berlangsung">Sedang Berlangsung</option>
                <option value="Selesai">Telah Selesai</option>
              </select>
            </div>

            {/* Cabor Filter */}
            <div>
              <select
                value={selectedCabor}
                onChange={(e) => setSelectedCabor(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
              >
                <option value="Semua">Semua Cabang Olahraga</option>
                {CABOR_LIST.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Agenda Cards Grid */}
        {filteredAgenda.length === 0 ? (
          <div className="bg-white dark:bg-[#111622] rounded-3xl border border-gray-100 dark:border-gray-800 p-12 text-center text-gray-500 dark:text-gray-400">
            <Calendar size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="font-bold text-base text-gray-800 dark:text-gray-200">Tidak ada agenda yang cocok</p>
            <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau filter yang Anda pilih.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAgenda.map((item) => {
              const dateInfo = formatDate(item.startDate);
              const isUpcoming = item.status === 'Akan Datang';
              const isOngoing = item.status === 'Berlangsung';

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#111622] rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div className="p-6">
                    {/* Header Row: Date Block & Status Badge */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 flex flex-col items-center justify-center text-center shrink-0">
                          <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 leading-none">
                            {dateInfo.month}
                          </span>
                          <span className="text-xl font-black text-gray-900 dark:text-white leading-none mt-1">
                            {dateInfo.day}
                          </span>
                        </div>
                        <div>
                          <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {item.cabor}
                          </span>
                          <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-white mt-1 group-hover:text-red-600 transition-colors leading-snug">
                            {item.title}
                          </h3>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shrink-0 ${
                          isOngoing
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : isUpcoming
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 mb-4">
                      {item.description}
                    </p>

                    {/* Metadata List */}
                    <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-red-600 shrink-0" />
                        <span>{item.time} {item.endDate ? `• Berakhir: ${formatDate(item.endDate).day} ${formatDate(item.endDate).month} ${formatDate(item.endDate).year}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-red-600 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={13} className="text-red-600 shrink-0" />
                        <span className="truncate">Penyelenggara: {item.organizer}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2">
                    <a
                      href={generateGCalUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                    >
                      <CalendarPlus size={14} />
                      <span>Tambah ke Google Calendar</span>
                    </a>

                    <Link
                      href="/twibbon"
                      className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-red-600 transition-colors"
                    >
                      <span>Twibbon Event</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
