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
import { PksLogo } from '@/components/PksLogo';
import { useData } from '@/context/DataContext';

const ITEMS_PER_PAGE = 8;

export default function AdminDashboardPage() {
  const { artworks, users, twibbons, updateArtwork, deleteArtwork } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const handleApprove = (id: string) => {
    updateArtwork(id, { status: 'Disetujui' } as any);
  };

  const handleReject = (id: string) => {
    updateArtwork(id, { status: 'Ditolak' } as any);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus karya ini dari sistem?')) {
      deleteArtwork(id);
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
      title: 'Kreator Terdaftar',
      value: users.length.toString(),
      change: '+8 kreator baru',
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
  .sort((a, b) => b.rawDownloads - a.rawDownloads || b.totalArtworks - a.totalArtworks)
  .slice(0, 4)
  .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // Leaderboard Data: Most Liked
  const mostLikedArtworks = [...artworks]
    .sort((a, b) => b.likesCount - a.likesCount)
    .slice(0, 4);

  // Leaderboard Data: Most Downloaded
  const mostDownloadedArtworks = [...artworks]
    .sort((a, b) => b.downloadsCount - a.downloadsCount)
    .slice(0, 4);

  // Leaderboard Data: Most Used Twibbon
  const mostUsedTwibbons = twibbons.slice(0, 4).map((tw) => ({
    id: tw.id,
    title: tw.title,
    region: tw.region,
    usedCount: `${tw.usedCount.toLocaleString()}x`,
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
            Pemantauan statistik platform, peringkat kreator terpopuler, karya paling banyak diunduh & twibbon terfavorit.
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

        {/* 🏆 LEADERBOARD SECTIONS (2x2 Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* 1. Top Creator */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Trophy size={18} className="text-amber-500" />
                  <span>Top Creators (Kreator Paling Populer)</span>
                </h3>
                <Link href="/admin/creators" className="text-xs font-bold text-[#F26522] hover:underline">
                  Lihat Semua
                </Link>
              </div>

              <div className="space-y-3">
                {topCreators.map((creator) => (
                  <div
                    key={creator.user.id}
                    className="flex items-center justify-between bg-gray-50/70 p-3 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#1E293B] text-white text-xs font-black flex items-center justify-center">
                        #{creator.rank}
                      </span>
                      <img
                        src={creator.user.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200'}
                        alt={creator.user.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-gray-200"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                          <span>{creator.user.name}</span>
                          <BadgeCheck size={14} className="text-[#F26522]" />
                        </p>
                        <p className="text-xs text-gray-500 font-medium">{creator.user.region}</p>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <p className="font-extrabold text-gray-900">{creator.totalDownloads} Unduhan</p>
                      <p className="text-gray-400 font-medium">{creator.totalArtworks} Karya • ❤️ {creator.totalLikes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Most Liked Artworks */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Flame size={18} className="text-red-500" />
                  <span>Most Liked (Karya Paling Disukai)</span>
                </h3>
                <Link href="/admin/artworks" className="text-xs font-bold text-[#F26522] hover:underline">
                  Lihat Semua
                </Link>
              </div>

              <div className="space-y-3">
                {mostLikedArtworks.map((art) => (
                  <div
                    key={art.id}
                    className="flex items-center justify-between bg-gray-50/70 p-2.5 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-900 max-w-[180px] sm:max-w-xs truncate">
                          {art.title}
                        </p>
                        <p className="text-[11px] text-gray-500">{art.author.name} - {art.region}</p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-black">
                      <Heart size={13} className="fill-red-500" />
                      <span>{art.likesCount} Sukai</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Most Downloaded Artworks */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Download size={18} className="text-[#F26522]" />
                  <span>Most Downloaded (Paling Banyak Diunduh)</span>
                </h3>
                <Link href="/admin/artworks" className="text-xs font-bold text-[#F26522] hover:underline">
                  Lihat Semua
                </Link>
              </div>

              <div className="space-y-3">
                {mostDownloadedArtworks.map((art) => (
                  <div
                    key={art.id}
                    className="flex items-center justify-between bg-gray-50/70 p-2.5 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-900 max-w-[180px] sm:max-w-xs truncate">
                          {art.title}
                        </p>
                        <p className="text-[11px] text-gray-500">Format: {art.format || 'PSD/AI'}</p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-[#F26522] border border-orange-200 rounded-full text-xs font-black">
                      <Download size={13} />
                      <span>{art.downloadsCount}x Unduhan</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Most Used Twibbon */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-600" />
                  <span>Most Used Twibbon (Bingkai Terfavorit)</span>
                </h3>
                <Link href="/twibbon" className="text-xs font-bold text-[#F26522] hover:underline">
                  Coba Twibbon
                </Link>
              </div>

              <div className="space-y-3">
                {mostUsedTwibbons.map((tw) => (
                  <div
                    key={tw.id}
                    className="flex items-center justify-between bg-gray-50/70 p-3 rounded-xl border border-gray-100"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{tw.title}</p>
                      <p className="text-[11px] text-gray-500 font-medium">Wilayah: {tw.region} • {tw.format}</p>
                    </div>

                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-black">
                      <span>{tw.usedCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
        {/* Artworks Management Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-extrabold text-gray-900">
                Manajemen Moderasi Karya
              </h2>
              <span className="bg-orange-50 text-[#F26522] text-xs font-bold px-2.5 py-1 rounded-full border border-orange-100">
                {filteredArtworks.length} Item
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul atau uploader..."
                  className="w-full bg-gray-50 text-sm rounded-xl pl-9 pr-4 py-2 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#F26522]"
              >
                <option value="all">Semua Status</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Pending">Pending</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4">Artwork / Title</th>
                  <th className="py-3.5 px-4">Kategori & DPW</th>
                  <th className="py-3.5 px-4">Uploader</th>
                  <th className="py-3.5 px-4">Unduhan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi Moderasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedArtworks.length > 0 ? (
                  paginatedArtworks.map((artwork) => (
                    <tr key={artwork.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            className="w-11 h-11 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-gray-900 max-w-xs truncate">
                              {artwork.title}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              ID: {artwork.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{artwork.category}</span>
                          <span className="text-xs text-gray-500">{artwork.region}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={artwork.author.avatar}
                            alt={artwork.author.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-semibold text-gray-800">
                            {artwork.author.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-gray-700">
                        {artwork.downloadsCount}x
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            (artwork as any).status === 'Disetujui'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : (artwork as any).status === 'Pending'
                              ? 'bg-amber-50 text-amber-600 border border-amber-200'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              (artwork as any).status === 'Disetujui'
                                ? 'bg-emerald-500'
                                : (artwork as any).status === 'Pending'
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                          />
                          {(artwork as any).status || 'Disetujui'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/artwork/${artwork.id}`}
                            className="p-1.5 text-gray-500 hover:text-[#F26522] hover:bg-orange-50 rounded-lg transition-colors"
                            title="Pratinjau"
                          >
                            <Eye size={16} />
                          </Link>

                          {(artwork as any).status !== 'Disetujui' && (
                            <button
                              onClick={() => handleApprove(artwork.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Setujui Karya"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}

                          {(artwork as any).status !== 'Ditolak' && (
                            <button
                              onClick={() => handleReject(artwork.id)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Tolak Karya"
                            >
                              <XCircle size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(artwork.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Permanent"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                      Tidak ada karya yang sesuai dengan kriteria pencarian / filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredArtworks.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-medium bg-gray-50/50">
              <div>
                Menampilkan <span className="font-bold text-gray-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-bold text-gray-800">{Math.min(currentPage * ITEMS_PER_PAGE, filteredArtworks.length)}</span> dari <span className="font-bold text-gray-800">{filteredArtworks.length}</span> karya
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-[#F26522] text-white shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
    </>
  );
}
