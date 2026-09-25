'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Globe,
  MapPin,
  Smartphone,
  Monitor,
  Share2,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Trash2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Activity,
  Layers,
  Laptop,
} from 'lucide-react';
import {
  getAnalyticsStats,
  seedSampleAnalyticsData,
  clearAnalyticsLogs,
} from '@/actions/analytics';

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  const fetchStats = async (range = timeRange) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${range}&t=${Date.now()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
        return;
      }
      const serverRes = await getAnalyticsStats(range);
      if (serverRes.success && serverRes.data) {
        setStats(serverRes.data);
      }
    } catch (e) {
      console.error(e);
      try {
        const serverRes = await getAnalyticsStats(range);
        if (serverRes.success && serverRes.data) {
          setStats(serverRes.data);
        }
      } catch (err) {}
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(timeRange);
  }, [timeRange]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed', count: 25, range: timeRange }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
        triggerToast(`+${json.count || 25} data kunjungan simulasi baru berhasil ditambahkan!`);
        return;
      }
      const serverRes = await seedSampleAnalyticsData(25);
      if (serverRes.success) {
        if (serverRes.data) setStats(serverRes.data);
        else await fetchStats(timeRange);
        triggerToast(`+${serverRes.count || 25} data kunjungan simulasi baru berhasil ditambahkan!`);
      }
    } catch (e) {
      alert('Gagal membuat data simulasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    setIsLoading(true);
    setShowClearModal(false);
    try {
      const res = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear', range: timeRange }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
        triggerToast('Seluruh log analitik berhasil dibersihkan.');
        return;
      }
      const serverRes = await clearAnalyticsLogs();
      if (serverRes.success) {
        if (serverRes.data) setStats(serverRes.data);
        else await fetchStats(timeRange);
        triggerToast('Seluruh log analitik berhasil dibersihkan.');
      }
    } catch (e) {
      alert('Gagal membersihkan data.');
    } finally {
      setIsLoading(false);
    }
  };



  const getSourceBadgeColor = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('instagram')) return 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800/60';
    if (s.includes('whatsapp')) return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
    if (s.includes('google')) return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
    if (s.includes('tiktok')) return 'bg-slate-900 dark:bg-slate-800 text-white border-slate-700 dark:border-slate-600';
    if (s.includes('facebook')) return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60';
    if (s.includes('twitter') || s.includes('x')) return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700';
    if (s.includes('direct')) return 'bg-orange-50 dark:bg-orange-950/40 text-[#F26522] dark:text-orange-400 border-orange-200 dark:border-orange-800/60';
    return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return `${diffSec} dtk lalu`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay} hari lalu`;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchLogQuery, timeRange]);

  const filteredLogs = stats?.recentLogs?.filter((log: any) => {
    if (!searchLogQuery) return true;
    const q = searchLogQuery.toLowerCase();
    return (
      log.path?.toLowerCase().includes(q) ||
      log.ip?.toLowerCase().includes(q) ||
      log.region?.toLowerCase().includes(q) ||
      log.city?.toLowerCase().includes(q) ||
      log.source?.toLowerCase().includes(q) ||
      log.device?.toLowerCase().includes(q) ||
      log.browser?.toLowerCase().includes(q)
    );
  }) || [];

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const mobileViews = stats?.devices?.find((d: any) => d.name === 'Mobile')?.count || 0;
  const desktopViews = stats?.devices?.find((d: any) => d.name === 'Desktop')?.count || 0;
  const mobilePercent = stats?.totalViews > 0 ? Math.round((mobileViews / stats.totalViews) * 100) : 75;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="text-amber-400" size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-[#F26522] flex items-center justify-center font-bold shadow-inner">
              <BarChart3 size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Analisis Trafik & Pengunjung
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Pantau asal rujukan trafik, sebaran geolokasi IP provinsi & negara, serta performa konten real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Controls & Period Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200/80 dark:border-gray-700">
            {(['today', '7d', '30d', 'all'] as const).map((r) => {
              const labels = {
                today: 'Hari Ini',
                '7d': '7 Hari',
                '30d': '30 Hari',
                all: 'Semua',
              };
              const active = timeRange === r;
              return (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {labels[r]}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => fetchStats()}
            disabled={isLoading}
            className="p-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors shadow-sm cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-[#F26522]' : ''} />
          </button>

          <button
            onClick={() => setShowClearModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Bersihkan Log Analitik"
          >
            <Trash2 size={15} />
            <span>Bersihkan Log</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Overview (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Page Views */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Tayangan (Views)
            </p>
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#F26522] flex items-center justify-center">
              <Eye size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
              {stats?.totalViews?.toLocaleString() || 0}
            </h3>
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp size={12} />
              <span>Semua halaman terakumulasi</span>
            </p>
          </div>
        </div>

        {/* Card 2: Unique Visitors */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Pengunjung Unik (IP)
            </p>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
              {stats?.uniqueVisitors?.toLocaleString() || 0}
            </h3>
            <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-1">
              Berdasarkan IP unik pengunjung
            </p>
          </div>
        </div>

        {/* Card 3: Today's Page Views */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Kunjungan Hari Ini
            </p>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Activity size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
              {stats?.todayCount?.toLocaleString() || 0}
            </h3>
            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-1">
              Sejak pukul 00:00 WIB
            </p>
          </div>
        </div>

        {/* Card 4: Mobile vs Desktop */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Pengguna Smartphone
            </p>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Smartphone size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
              {mobilePercent}%
            </h3>
            <p className="text-[11px] font-medium text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-2">
              <span>{mobileViews} HP</span>
              <span>•</span>
              <span>{desktopViews} Komputer</span>
            </p>
          </div>
        </div>
      </div>

      {/* Visual Chart: Daily Views & Visitors Trend (Sleek SVG Line Chart) */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Grafik Tren Kunjungan Harian ({timeRange === 'today' ? 'Hari Ini' : timeRange === '7d' ? '7 Hari' : timeRange === '30d' ? '30 Hari' : 'Semua'})
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Visualisasi tren harian tayangan halaman (*Page Views*) dan pengunjung unik.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
              <span className="w-3 h-3 rounded-full bg-[#F26522] inline-block shadow-xs" />
              <span>Page Views</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-xs" />
              <span>Pengunjung Unik</span>
            </div>
          </div>
        </div>

        {/* SVG Line Chart Representation */}
        <div className="pt-2">
          {stats?.viewsTrend && stats.viewsTrend.length > 0 ? (
            <AnalyticsLineChart viewsTrend={stats.viewsTrend} timeRange={timeRange} />
          ) : (
            <div className="h-44 flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 font-medium">
              Belum ada data grafik untuk periode ini.
            </div>
          )}
        </div>
      </div>

      {/* Traffic Channels / Referrer */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#F26522] flex items-center justify-center">
                <Share2 size={16} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Asal Saluran Trafik (Referrer)
                </h2>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Dari mana pengunjung datang ke website PKSart
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 mt-4">
            {stats?.sources && stats.sources.length > 0 ? (
              stats.sources.map((item: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 font-bold text-gray-400 dark:text-gray-500 text-[11px]">
                        #{idx + 1}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getSourceBadgeColor(item.name)}`}>
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300">
                      <span>{item.count} kunjungan</span>
                      <span className="text-gray-400 dark:text-gray-500 font-normal">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${item.percentage}%` }}
                      className="h-full bg-gradient-to-r from-orange-400 to-[#F26522] rounded-full transition-all"
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 py-8 text-center">
                Belum ada rekaman saluran trafik.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Grid 2 Columns: Top Pages & Devices Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* SECTION 3: Halaman Paling Sering Dikunjungi */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Layers size={16} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Halaman Paling Populer (Top Pages)
                </h2>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Konten dan landing page yang paling diminati pengunjung
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800 mt-2">
            {stats?.topPages && stats.topPages.length > 0 ? (
              stats.topPages.map((page: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-bold text-gray-400 dark:text-gray-500 text-xs w-5">
                      #{idx + 1}
                    </span>
                    <Link
                      href={page.name}
                      target="_blank"
                      className="font-mono text-gray-800 dark:text-gray-200 hover:text-[#F26522] dark:hover:text-[#F26522] truncate transition-colors flex items-center gap-1"
                    >
                      <span className="truncate">{page.name === '/' ? '/ (Beranda Utama)' : page.name}</span>
                      <ExternalLink size={11} className="text-gray-400 dark:text-gray-500" />
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-bold">
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-[11px]">
                      {page.count} views
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 text-[11px] w-8 text-right">
                      {page.percentage}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 py-6 text-center">
                Belum ada data halaman.
              </p>
            )}
          </div>
        </div>

        {/* SECTION 4: Perangkat, Browser & OS */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Laptop size={16} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Perangkat & Browser Pengunjung
                </h2>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Kategori browser, OS, dan rasio hardware
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Devices */}
            <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Tipe Perangkat
              </p>
              <div className="space-y-2">
                {stats?.devices?.map((d: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{d.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{d.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Browsers */}
            <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Browser
              </p>
              <div className="space-y-2">
                {stats?.browsers?.slice(0, 4).map((b: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{b.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{b.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* OS */}
            <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Sistem Operasi
              </p>
              <div className="space-y-2">
                {stats?.operatingSystems?.slice(0, 4).map((o: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{o.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{o.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Negara Pengunjung */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
              Negara Asal Pengunjung
            </p>
            <div className="flex flex-wrap gap-2">
              {stats?.countries?.map((c: any, idx: number) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-xl text-xs flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200"
                >
                  <span>{c.name === 'Indonesia' ? '🇮🇩' : '🌐'}</span>
                  <span>{c.name}</span>
                  <span className="text-gray-400 dark:text-gray-500 font-normal">({c.count})</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* SECTION 5: Real-Time Live Activity Stream / Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Log Kunjungan Pengunjung Real-Time
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Daftar aktivitas penjelajahan halaman terbaru dari setiap pengunjung
            </p>
          </div>

          {/* Search Box in Table */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={15} />
            <input
              type="text"
              placeholder="Cari IP, rute, kota, provinsi..."
              value={searchLogQuery}
              onChange={(e) => setSearchLogQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-5">Waktu</th>
                <th className="py-3 px-5">IP & Perangkat</th>
                <th className="py-3 px-5">Lokasi (Geo-IP)</th>
                <th className="py-3 px-5">Halaman Dibuka</th>
                <th className="py-3 px-5">Asal Referer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors">
                    
                    {/* Waktu */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatRelativeTime(log.createdAt)}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* IP & Perangkat */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="font-mono font-bold text-gray-900 dark:text-white">
                        {log.ip}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <span>{log.device}</span>
                        <span>•</span>
                        <span>{log.browser} ({log.os})</span>
                      </div>
                    </td>

                    {/* Lokasi */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <span>{log.country === 'Indonesia' ? '🇮🇩' : '🌐'}</span>
                        <span>{log.region}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        {log.city || 'Indonesia'}
                      </div>
                    </td>

                    {/* Halaman Dibuka */}
                    <td className="py-3.5 px-5 max-w-[200px] truncate">
                      <Link
                        href={log.path}
                        target="_blank"
                        className="font-mono text-gray-900 dark:text-gray-100 hover:text-[#F26522] dark:hover:text-[#F26522] font-semibold flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{log.path}</span>
                        <ExternalLink size={11} className="text-gray-400 dark:text-gray-500 shrink-0" />
                      </Link>
                    </td>

                    {/* Referer */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getSourceBadgeColor(log.source)}`}>
                        {log.source}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-gray-500">
                    Tidak ada log kunjungan yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-gray-50/50 dark:bg-gray-800/40">
          <div className="text-gray-500 dark:text-gray-400 font-medium">
            Menampilkan <span className="font-bold text-gray-800 dark:text-gray-200">{filteredLogs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - <span className="font-bold text-gray-800 dark:text-gray-200">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> dari <span className="font-bold text-gray-800 dark:text-gray-200">{filteredLogs.length}</span> log aktivitas
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm text-xs cursor-pointer"
            >
              &larr; Prev
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-[#F26522] text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || filteredLogs.length === 0}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm text-xs cursor-pointer"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Clear Logs Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Bersihkan Semua Log Analitik?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tindakan ini akan menghapus riwayat log kunjungan pengunjung secara permanen dari database.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleClearLogs}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Ya, Bersihkan Log
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// 📈 Custom Sleek SVG Line Chart Component with Smooth Curves & Hover Tooltips
function AnalyticsLineChart({ viewsTrend, timeRange }: { viewsTrend: Array<{ date: string; views: number; visitors: number }>; timeRange: string }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!viewsTrend || viewsTrend.length === 0) return null;

  const width = 900;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const maxVal = Math.max(
    ...viewsTrend.map((d) => d.views),
    ...viewsTrend.map((d) => d.visitors),
    5
  );

  const pointsViews = viewsTrend.map((d, i) => {
    const x = paddingLeft + (i / Math.max(viewsTrend.length - 1, 1)) * chartW;
    const y = paddingTop + chartH - (d.views / maxVal) * chartH;
    return { x, y, ...d };
  });

  const pointsVisitors = viewsTrend.map((d, i) => {
    const x = paddingLeft + (i / Math.max(viewsTrend.length - 1, 1)) * chartW;
    const y = paddingTop + chartH - (d.visitors / maxVal) * chartH;
    return { x, y, ...d };
  });

  // Generate Smooth Bézier Curves
  const makeSmoothPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;

    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp1y = curr.y;
      const cp2x = curr.x + (next.x - curr.x) / 2;
      const cp2y = next.y;
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }
    return path;
  };

  const linePathViews = makeSmoothPath(pointsViews);
  const linePathVisitors = makeSmoothPath(pointsVisitors);

  const areaPathViews = `${linePathViews} L ${pointsViews[pointsViews.length - 1].x},${height - paddingBottom} L ${pointsViews[0].x},${height - paddingBottom} Z`;
  const areaPathVisitors = `${linePathVisitors} L ${pointsVisitors[pointsVisitors.length - 1].x},${height - paddingBottom} L ${pointsVisitors[0].x},${height - paddingBottom} Z`;

  // Grid Lines (3 levels)
  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  // X-Axis Step (Label Skip for 30d/all)
  const labelStep = viewsTrend.length > 20 ? 5 : viewsTrend.length > 10 ? 2 : 1;

  const activePoint = hoverIndex !== null ? pointsViews[hoverIndex] : null;

  return (
    <div className="relative w-full overflow-hidden select-none">
      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          {/* Page Views Area Gradient */}
          <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F26522" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#F26522" stopOpacity="0.0" />
          </linearGradient>

          {/* Visitors Area Gradient */}
          <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y-Axis Grid Lines & Ticks */}
        {yTicks.map((val, idx) => {
          const y = paddingTop + chartH - (val / maxVal) * chartH;
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-800"
                strokeDasharray={idx === 0 ? undefined : '3 3'}
                strokeWidth={idx === 0 ? 1.5 : 1}
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                fill="#94A3B8"
                fontSize="10"
                fontWeight="600"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Gradient Areas */}
        <path d={areaPathVisitors} fill="url(#visitorsGradient)" />
        <path d={areaPathViews} fill="url(#viewsGradient)" />

        {/* Smooth Trend Lines */}
        <path
          d={linePathVisitors}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={linePathViews}
          fill="none"
          stroke="#F26522"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-Axis Ticks & Dates */}
        {pointsViews.map((pt, i) => {
          const showLabel = i === 0 || i === pointsViews.length - 1 || i % labelStep === 0;
          return (
            <g key={i}>
              {showLabel && (
                <text
                  x={pt.x}
                  y={height - 10}
                  fill="#64748B"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {pt.date}
                </text>
              )}
            </g>
          );
        })}

        {/* Hover Highlight Vertical Line & Dots */}
        {hoverIndex !== null && (
          <g className="transition-all duration-150">
            {/* Vertical Guide Line */}
            <line
              x1={pointsViews[hoverIndex].x}
              y1={paddingTop}
              x2={pointsViews[hoverIndex].x}
              y2={height - paddingBottom}
              stroke="#F26522"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Dot Visitors */}
            <circle
              cx={pointsVisitors[hoverIndex].x}
              cy={pointsVisitors[hoverIndex].y}
              r="5"
              fill="#3B82F6"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="shadow-md"
            />

            {/* Dot Views */}
            <circle
              cx={pointsViews[hoverIndex].x}
              cy={pointsViews[hoverIndex].y}
              r="6"
              fill="#F26522"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              className="shadow-md"
            />
          </g>
        )}

        {/* Transparent Interactive Mouse Touch Overlay */}
        {pointsViews.map((pt, i) => {
          const colW = chartW / Math.max(pointsViews.length - 1, 1);
          const x = pt.x - colW / 2;
          return (
            <rect
              key={i}
              x={x}
              y={paddingTop}
              width={colW}
              height={chartH}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
              className="cursor-pointer"
            />
          );
        })}
      </svg>

      {/* Floating Hover Tooltip Card */}
      {hoverIndex !== null && activePoint && (
        <div
          style={{
            left: `${((activePoint.x) / width) * 100}%`,
            top: '15px',
          }}
          className="absolute -translate-x-1/2 pointer-events-none z-30 bg-slate-900/95 backdrop-blur-md text-white text-xs p-3 rounded-2xl shadow-2xl border border-slate-700 min-w-[150px] animate-in fade-in zoom-in-95 duration-150"
        >
          <p className="font-extrabold text-[11px] text-slate-300 border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between">
            <span>Tanggal</span>
            <span className="text-white font-mono">{activePoint.date}</span>
          </p>

          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#F26522]" />
                <span>Page Views</span>
              </span>
              <span className="font-black text-white">{pointsViews[hoverIndex].views}</span>
            </div>

            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Pengunjung Unik</span>
              </span>
              <span className="font-black text-white">{pointsVisitors[hoverIndex].visitors}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
