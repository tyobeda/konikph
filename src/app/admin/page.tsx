'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Users,
  Building,
  Settings,
  Download,
  Heart,
  TrendingUp,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  ShieldCheck,
  Eye,
  Trash2,
  ArrowUpRight,
  Trophy,
  Award,
  Sparkles,
  BadgeCheck,
  Flame,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const IndonesiaMapSection = dynamic(() => import('@/components/IndonesiaMapSection'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] sm:h-[400px] bg-slate-950 rounded-3xl flex items-center justify-center text-slate-500 font-bold text-xs">
      Memuat Peta Persebaran Wilayah...
    </div>
  ),
});
import { PksLogo } from '@/components/PksLogo';
import { ConfirmSuspendModal as ConfirmModal } from '@/components/ConfirmSuspendModal';
import { useData } from '@/context/DataContext';
import { Artwork } from '@/lib/types';

const ITEMS_PER_PAGE = 8;

export default function AdminDashboardPage() {
  const { artworks, users, twibbons, updateArtwork, deleteArtwork } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingArtwork, setDeletingArtwork] = useState<Artwork | null>(null);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const handleApprove = (id: string) => {
    updateArtwork(id, { status: 'Disetujui' } as any);
  };

  const handleReject = (id: string) => {
    updateArtwork(id, { status: 'Ditolak' } as any);
  };

  const handleDelete = (art: Artwork) => {
    setDeletingArtwork(art);
  };

  const confirmDeleteArtwork = () => {
    if (deletingArtwork) {
      deleteArtwork(deletingArtwork.id);
      setDeletingArtwork(null);
    }
  };

  const totalDownloads = artworks.reduce((acc, curr) => acc + curr.downloadsCount, 0);

  const stats = [
    {
      title: 'Total Karya & Desain',
      value: artworks.length.toString(),
      change: '+14% bulan ini',
      icon: ImageIcon,
      color: 'bg-orange-50 text-[#F26522]',
    },
    {
      title: 'Total Unduhan Master',
      value: totalDownloads.toLocaleString(),
      change: '+22% bulan ini',
      icon: Download,
      color: 'bg-[#1e293b] text-white',
    },
    {
      title: 'Desainer Terdaftar',
      value: users.length.toString(),
      change: '+8 desainer baru',
      icon: Users,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Perlu Moderasi',
      value: artworks.filter((a) => (a as any).status === 'Pending').length.toString(),
      change: 'Perlu tindakan cepat',
      icon: ShieldCheck,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  // Leaderboard Data: Top Creators (calculated dynamically)
  const topCreators = users.map((user) => {
    const userArtworks = artworks.filter((a) => a.author?.name === user.name || a.author?.email === user.email || a.author?.id === user.id);
    const userArtworksCount = userArtworks.length;
    const userDownloads = userArtworks.reduce((acc, c) => acc + (c.downloadsCount || 0), 0);
    const userLikes = userArtworks.reduce((acc, c) => acc + (c.likesCount || 0), 0);
    return {
      user,
      totalArtworks: userArtworksCount,
      totalDownloads: userDownloads.toLocaleString(),
      rawDownloads: userDownloads,
      totalLikes: userLikes,
    };
  })
  .sort((a, b) => b.rawDownloads - a.rawDownloads || b.totalArtworks - a.totalArtworks || b.totalLikes - a.totalLikes)
  .slice(0, 10)
  .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // Leaderboard Data: Most Liked Artworks
  const mostLikedArtworks = [...artworks]
    .sort((a, b) => b.likesCount - a.likesCount || b.downloadsCount - a.downloadsCount)
    .slice(0, 10);

  // Leaderboard Data: Most Downloaded Artworks
  const mostDownloadedArtworks = [...artworks]
    .sort((a, b) => b.downloadsCount - a.downloadsCount || b.likesCount - a.likesCount)
    .slice(0, 10);

  // Leaderboard Data: Most Used Twibbon
  const mostUsedTwibbons = [...twibbons]
    .sort((a, b) => b.usedCount - a.usedCount)
    .slice(0, 10)
    .map((tw) => ({
      id: tw.id,
      title: tw.title,
      imageUrl: tw.imageUrl,
      region: tw.region,
      usedCount: tw.usedCount,
      format: 'PNG Frame',
    }));

  const filteredArtworks = artworks.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.region && art.region.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      filterStatus === 'all' || (art as any).status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredArtworks.length / ITEMS_PER_PAGE));
  const paginatedArtworks = filteredArtworks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Super Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pemantauan statistik platform, peringkat desainer terpopuler, karya paling banyak diunduh & twibbon terfavorit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            <TrendingUp size={16} className="text-[#F26522]" />
            <span>Analisis Trafik & Geo-IP</span>
          </Link>

          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F26522] hover:bg-[#d85517] text-white text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus size={16} />
            <span>Tambah Karya Official</span>
          </Link>
        </div>
      </div>


        {/* 🗺️ MINIMALIST INDONESIA MAP WITH DYNAMIC DPW PINPOINTS */}
        <div className="mb-8 w-full">
          <IndonesiaMapSection />
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {item.title}
                  </p>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">
                    {item.value}
                  </h3>
                  <p className="text-xs font-semibold text-gray-400 mt-1">
                    {item.change}
                  </p>
                </div>
                <div className={`p-3.5 rounded-2xl ${item.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            );
          })}
        </div>

        {/* 🏆 LEADERBOARD SECTIONS (2x2 Grid, Top 10 Lists) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* 1. Top Creator */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Trophy size={18} className="text-amber-500" />
                  <span>10 Desainer Terpopuler</span>
                </h3>
                <Link href="/admin/desainer" className="text-xs font-bold text-[#F26522] hover:underline">
                  Lihat Semua
                </Link>
              </div>

              <div className="space-y-1 divide-y divide-gray-50">
                {topCreators.map((creator) => (
                  <div
                    key={creator.user.id}
                    className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                        creator.rank === 1 ? 'bg-amber-400 text-white shadow-xs' :
                        creator.rank === 2 ? 'bg-slate-300 text-gray-800' :
                        creator.rank === 3 ? 'bg-amber-700 text-white' :
                        'text-gray-400 font-semibold'
                      }`}>
                        #{creator.rank}
                      </span>
                      <img
                        src={creator.user.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200'}
                        alt={creator.user.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-gray-200"
                      />
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-bold text-gray-900 flex items-center gap-1 truncate">
                          <span className="truncate">{creator.user.name}</span>
                          <BadgeCheck size={13} className="text-[#F26522] shrink-0" />
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium truncate">{(creator.user.region || '').replace(/^DPW\s+/i, '')}</p>
                      </div>
                    </div>

                    <div className="text-right text-xs shrink-0 ml-2">
                      <p className="font-semibold text-gray-900">{creator.totalDownloads} Unduhan</p>
                      <p className="text-[10px] text-gray-400 font-medium flex items-center justify-end gap-1">
                        <span>{creator.totalArtworks} Karya</span>
                        <span>•</span>
                        <Heart size={10} className="fill-red-500 text-red-500 shrink-0" />
                        <span>{creator.totalLikes}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Most Liked Artworks */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Flame size={18} className="text-red-500" />
                  <span>10 Karya terpopuler</span>
                </h3>
                <Link href="/admin/artworks" className="text-xs font-bold text-[#F26522] hover:underline">
                  Lihat Semua
                </Link>
              </div>

              <div className="space-y-1 divide-y divide-gray-50">
                {mostLikedArtworks.map((art, index) => (
                  <div
                    key={art.id}
                    className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                        index === 0 ? 'bg-amber-400 text-white' :
                        index === 1 ? 'bg-slate-300 text-gray-800' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'text-gray-400 font-semibold'
                      }`}>
                        #{index + 1}
                      </span>
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-7 h-7 rounded-md object-cover border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {art.title}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">{art.author.name} - {(art.region || '').replace(/^DPW\s+/i, 'Wilayah ')}</p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 shrink-0 ml-2">
                      <Heart size={12} className="fill-red-500 shrink-0" />
                      <span>{art.likesCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Most Downloaded Artworks */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Download size={18} className="text-[#F26522]" />
                  <span>10 Karya paling banyak diunduh</span>
                </h3>
                <Link href="/admin/unduh" className="text-xs font-bold text-[#F26522] hover:underline">
                  Lihat Semua
                </Link>
              </div>

              <div className="space-y-1 divide-y divide-gray-50">
                {mostDownloadedArtworks.map((art, index) => (
                  <div
                    key={art.id}
                    className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                        index === 0 ? 'bg-amber-400 text-white' :
                        index === 1 ? 'bg-slate-300 text-gray-800' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'text-gray-400 font-semibold'
                      }`}>
                        #{index + 1}
                      </span>
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-7 h-7 rounded-md object-cover border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {art.title}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">Format: {art.format || 'PSD/AI'}</p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#F26522] shrink-0 ml-2">
                      <Download size={12} className="shrink-0" />
                      <span>{art.downloadsCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Most Used Twibbon */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-600" />
                  <span>10 Twibbon paling banyak digunakan</span>
                </h3>
                <Link href="/admin/twibbon" className="text-xs font-bold text-[#F26522] hover:underline">
                  Lihat Semua
                </Link>
              </div>

              <div className="space-y-1 divide-y divide-gray-50">
                {mostUsedTwibbons.map((tw, index) => (
                  <div
                    key={tw.id}
                    className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                        index === 0 ? 'bg-amber-400 text-white' :
                        index === 1 ? 'bg-slate-300 text-gray-800' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'text-gray-400 font-semibold'
                      }`}>
                        #{index + 1}
                      </span>
                      {tw.imageUrl ? (
                        <img
                          src={tw.imageUrl}
                          alt={tw.title}
                          className="w-7 h-7 rounded-md object-cover border border-purple-100 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                          <ImageIcon size={14} className="text-purple-500" />
                        </div>
                      )}
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-bold text-gray-900 truncate">{tw.title}</p>
                        <p className="text-[10px] text-gray-500 font-medium truncate">Wilayah: {(tw.region || '').replace(/^DPW\s+/i, 'Wilayah ')} • {tw.format}</p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 shrink-0 ml-2">
                      <ImageIcon size={12} className="text-purple-600 shrink-0" />
                      <span>{tw.usedCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        {/* Confirm Delete Artwork Modal */}
        <ConfirmModal
          isOpen={!!deletingArtwork}
          title={`Hapus Karya "${deletingArtwork?.title}"?`}
          message={`Apakah Anda yakin ingin menghapus karya "${deletingArtwork?.title}" secara permanen dari sistem? Seluruh data terkait karya ini akan terhapus.`}
          confirmLabel="Ya, Hapus Permanen"
          variant="danger"
          onConfirm={confirmDeleteArtwork}
          onCancel={() => setDeletingArtwork(null)}
        />
      </div>
    </>
  );
}
