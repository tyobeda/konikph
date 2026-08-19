'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useData } from '@/context/DataContext';
import { getUserSlug } from '@/lib/slug';
import {
  Users,
  Search,
  BadgeCheck,
  MapPin,
  ImageIcon,
  Download,
  PhoneCall,
  Sparkles,
  Trophy,
  Heart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function DesainerPage() {
  const router = useRouter();
  const { users, artworks, isModuleUnderMaintenance } = useData();

  React.useEffect(() => {
    if (isModuleUnderMaintenance('creators')) {
      router.replace('/maintenance');
    }
  }, [isModuleUnderMaintenance, router]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 17; // Listing 4 to 20 per page (17 items)

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate stats and sort designers by total downloads descending
  const sortedDesigners = users
    .map((user) => {
      const userArtworks = artworks.filter(
        (a) => a.author?.name === user.name || a.author?.email === user.email || a.author?.id === user.id
      );
      const artworksCount = userArtworks.length;
      const rawDownloads = userArtworks.reduce((acc, c) => acc + (c.downloadsCount || 0), 0);
      const rawLikes = userArtworks.reduce((acc, c) => acc + (c.likesCount || 0), 0);

      return {
        user,
        artworksCount,
        rawDownloads,
        rawLikes,
      };
    })
    .sort((a, b) => b.rawDownloads - a.rawDownloads || b.artworksCount - a.artworksCount || b.rawLikes - a.rawLikes);

  // Filtered by search
  const filteredDesigners = sortedDesigners.filter(
    (item) =>
      item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Top 3 Big Cards
  const top3Designers = filteredDesigners.slice(0, 3);
  
  // Remaining Designers (Rank 4 onwards)
  const remainingDesigners = filteredDesigners.slice(3);

  const totalPages = Math.max(1, Math.ceil(remainingDesigners.length / itemsPerPage));
  const paginatedRemaining = remainingDesigners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Title */}
        <div className="bg-gradient-to-r from-[#1E293B] via-[#0f172a] to-[#1E293B] rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F26522] text-white text-xs font-bold rounded-full mb-3">
              <Sparkles size={14} />
              <span>Peringkat Official</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Desainer Terpopuler PKSart
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Daftar perancang grafis dan kreator visual terbaik yang aktif berkontribusi menyediakan karya & template publikasi resmi.
            </p>
          </div>

          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-white pointer-events-none">
            <Trophy size={240} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" />
              <span>3 Besar Desainer Teratas</span>
            </h2>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama desainer atau wilayah..."
              className="w-full bg-white text-sm rounded-2xl pl-10 pr-4 py-2.5 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522] shadow-sm"
            />
          </div>
        </div>

        {/* TOP 3 BIG CARDS SECTION */}
        {top3Designers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {top3Designers.map((item, index) => {
              const rank = index + 1;
              return (
                <div
                  key={item.user.id}
                  className={`bg-white rounded-3xl border p-6 shadow-md hover:shadow-xl transition-all relative flex flex-col justify-between overflow-hidden ${
                    rank === 1
                      ? 'border-amber-300 ring-2 ring-amber-400/40 bg-gradient-to-b from-amber-50/40 via-white to-white'
                      : rank === 2
                      ? 'border-slate-200 ring-1 ring-slate-300/40'
                      : 'border-amber-700/20 ring-1 ring-amber-700/20'
                  }`}
                >
                  {/* Rank Crown/Badge Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black shadow-xs ${
                        rank === 1
                          ? 'bg-amber-400 text-white'
                          : rank === 2
                          ? 'bg-slate-300 text-gray-800'
                          : 'bg-amber-700 text-white'
                      }`}
                    >
                      <Trophy size={14} />
                      <span>Juara #{rank}</span>
                    </span>

                    <span className="text-[10px] font-extrabold uppercase bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                      {item.user.role || 'Desainer Official'}
                    </span>
                  </div>

                  <div>
                    {/* User Header Info */}
                    <div className="flex items-center gap-4 mb-4">
                      <Link href={`/creators/${getUserSlug(item.user)}`} className="shrink-0 relative">
                        <img
                          src={item.user.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200'}
                          alt={item.user.name}
                          className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md hover:ring-[#F26522] transition-all"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/creators/${getUserSlug(item.user)}`} className="hover:text-[#F26522] transition-colors truncate">
                            <h3 className="font-black text-lg text-gray-900 hover:text-[#F26522] transition-colors truncate">
                              {item.user.name}
                            </h3>
                          </Link>
                          {item.user.isVerified !== false && (
                            <BadgeCheck size={18} className="text-[#F26522] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-[#F26522] flex items-center gap-1 mt-0.5">
                          <MapPin size={13} />
                          <span>{item.user.region}</span>
                        </p>
                      </div>
                    </div>

                    {/* Stats Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 mb-5">
                      <div className="text-center">
                        <p className="text-[11px] text-gray-500 font-semibold flex items-center justify-center gap-1">
                          <Download size={12} className="text-emerald-600" />
                          <span>Unduhan</span>
                        </p>
                        <p className="text-sm font-black text-gray-900 mt-0.5">
                          {item.rawDownloads.toLocaleString()}
                        </p>
                      </div>

                      <div className="text-center border-x border-gray-200">
                        <p className="text-[11px] text-gray-500 font-semibold flex items-center justify-center gap-1">
                          <ImageIcon size={12} className="text-[#F26522]" />
                          <span>Karya</span>
                        </p>
                        <p className="text-sm font-black text-gray-900 mt-0.5">
                          {item.artworksCount}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-[11px] text-gray-500 font-semibold flex items-center justify-center gap-1">
                          <Heart size={12} className="fill-red-500 text-red-500" />
                          <span>Sukai</span>
                        </p>
                        <p className="text-sm font-black text-gray-900 mt-0.5">
                          {item.rawLikes}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    {item.user.phone && (
                      <a
                        href={`https://wa.me/${item.user.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
                      >
                        <PhoneCall size={14} />
                        <span>Kontak WA</span>
                      </a>
                    )}
                    <Link
                      href={`/creators/${getUserSlug(item.user)}`}
                      className="flex-1 py-2.5 px-3 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl text-center transition-colors shadow-sm"
                    >
                      Buka Profil
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs mb-8">
            <Users size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-base font-bold text-gray-700">Tidak ada desainer yang ditemukan</p>
            <p className="text-xs text-gray-400 mt-1">Coba kata kunci pencarian lainnya.</p>
          </div>
        )}

        {/* LISTING RANK 4 ONWARDS */}
        {remainingDesigners.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Users size={18} className="text-[#F26522]" />
                <span>Peringkat 4 hingga {sortedDesigners.length}</span>
              </h3>
              <span className="text-xs font-semibold text-gray-500">
                Menampilkan {paginatedRemaining.length} Desainer
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {paginatedRemaining.map((item, idx) => {
                const actualRank = 3 + (currentPage - 1) * itemsPerPage + idx + 1;
                return (
                  <div
                    key={item.user.id}
                    className="flex items-center justify-between py-3 px-2 hover:bg-gray-50/80 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center shrink-0">
                        #{actualRank}
                      </span>
                      <Link href={`/creators/${getUserSlug(item.user)}`} className="shrink-0">
                        <img
                          src={item.user.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200'}
                          alt={item.user.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-gray-200 hover:ring-[#F26522] transition-all"
                        />
                      </Link>
                      <div className="min-w-0 truncate">
                        <Link href={`/creators/${getUserSlug(item.user)}`} className="hover:text-[#F26522] transition-colors truncate">
                          <p className="text-sm font-bold text-gray-900 flex items-center gap-1 truncate">
                            <span className="truncate">{item.user.name}</span>
                            {item.user.isVerified !== false && (
                              <BadgeCheck size={14} className="text-[#F26522] shrink-0" />
                            )}
                          </p>
                        </Link>
                        <p className="text-xs text-gray-500 font-medium truncate flex items-center gap-1">
                          <MapPin size={12} className="text-gray-400 shrink-0" />
                          <span>{item.user.region}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 ml-3">
                      <div className="text-right text-xs">
                        <p className="font-bold text-gray-900">{item.rawDownloads.toLocaleString()} Unduhan</p>
                        <p className="text-[11px] text-gray-400 font-medium flex items-center justify-end gap-1">
                          <span>{item.artworksCount} Karya</span>
                          <span>•</span>
                          <Heart size={10} className="fill-red-500 text-red-500 shrink-0" />
                          <span>{item.rawLikes}</span>
                        </p>
                      </div>

                      <Link
                        href={`/creators/${getUserSlug(item.user)}`}
                        className="hidden sm:inline-flex px-3.5 py-1.5 bg-gray-100 hover:bg-[#F26522] text-gray-700 hover:text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        Profil
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between text-xs bg-white">
                <span className="text-gray-500 font-medium">
                  Halaman <span className="font-bold text-gray-900">{currentPage}</span> dari <span className="font-bold text-gray-900">{totalPages}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <ChevronLeft size={14} />
                    <span>Sebelumnya</span>
                  </button>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
