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
  Mail,
  Building,
  Sparkles,
} from 'lucide-react';

import { MaintenanceContent } from '@/app/maintenance/page';

export default function CreatorsPage() {
  const router = useRouter();
  const { users, artworks, dpwList, isModuleUnderMaintenance } = useData();

  if (isModuleUnderMaintenance('creators')) {
    return <MaintenanceContent />;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'creators' | 'dpw'>('creators');

  // Filter creators
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter DPW
  const filteredDpw = dpwList.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.coordinator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Title */}
        <div className="bg-gradient-to-r from-[#1E293B] via-[#0f172a] to-[#1E293B] rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F26522] text-white text-xs font-bold rounded-full mb-3">
              <Sparkles size={14} />
              <span>Komunitas & Struktur Official</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Direktori Desainer Grafis & Wilayah PKS
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Jelajahi para perancang grafis, desainer visual, serta koordinator sekretariat Wilayah PKS se-Indonesia yang aktif berkontribusi menyediakan aset publikasi resmi.
            </p>
          </div>

          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-white pointer-events-none">
            <Users size={240} />
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <button
              onClick={() => setActiveTab('creators')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'creators'
                  ? 'bg-[#F26522] text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Users size={16} />
              <span>Desainer Terdaftar ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('dpw')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'dpw'
                  ? 'bg-[#F26522] text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Building size={16} />
              <span>Wilayah / Chapter ({dpwList.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'creators'
                  ? 'Cari nama desainer atau wilayah...'
                  : 'Cari nama Wilayah atau koordinator...'
              }
              className="w-full bg-white dark:bg-gray-900 text-sm rounded-2xl pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#F26522] shadow-sm"
            />
          </div>
        </div>

        {/* CREATORS TAB */}
        {activeTab === 'creators' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => {
              const userArtworksCount = artworks.filter(
                (a) => a.author?.name === user.name || a.author?.email === user.email || a.author?.id === user.id
              ).length;

              const totalDownloads = artworks
                .filter((a) => a.author?.name === user.name || a.author?.email === user.email || a.author?.id === user.id)
                .reduce((acc, c) => acc + (c.downloadsCount || 0), 0).toLocaleString();

              return (
                <div
                  key={user.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* User Header Info */}
                    <div className="flex items-start gap-4 mb-4">
                      <Link href={`/creators/${getUserSlug(user)}`} className="shrink-0">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200'}
                          alt={user.name}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-100 dark:ring-orange-950/40 shadow-sm hover:ring-[#F26522] transition-all"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/creators/${getUserSlug(user)}`} className="hover:text-[#F26522] transition-colors truncate">
                            <h3 className="font-extrabold text-base text-gray-900 dark:text-white hover:text-[#F26522] transition-colors truncate">
                              {user.name}
                            </h3>
                          </Link>
                          {Boolean(user.isVerified || user.role === 'Super Admin') && (
                            <BadgeCheck size={18} className="text-[#F26522] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-[#F26522] flex items-center gap-1 mt-0.5">
                          <MapPin size={13} />
                          <span>{user.region}</span>
                        </p>
                        <span className="inline-block text-[10px] font-extrabold uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded mt-1.5">
                          {user.role === 'Kreator' || user.role === 'Kreator PKS' || !user.role ? 'Desainer PKS' : user.role}
                        </span>
                      </div>
                    </div>

                    {/* Stats Metrics */}
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-100 dark:border-gray-800 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold flex items-center justify-center gap-1">
                          <ImageIcon size={12} className="text-[#F26522]" />
                          <span>Karya</span>
                        </p>
                        <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                          {userArtworksCount} Post
                        </p>
                      </div>

                      <div className="text-center border-l border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold flex items-center justify-center gap-1">
                          <Download size={12} className="text-emerald-600 dark:text-emerald-400" />
                          <span>Unduhan</span>
                        </p>
                        <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                          {totalDownloads}x
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    {user.phone && (
                      <a
                        href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors border border-emerald-200 dark:border-emerald-800"
                      >
                        <PhoneCall size={14} />
                        <span>Kontak WA</span>
                      </a>
                    )}
                    <Link
                      href={`/creators/${getUserSlug(user)}`}
                      className="flex-1 py-2 px-3 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl text-center transition-colors shadow-sm"
                    >
                      Buka Profil
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DPW TAB */}
        {activeTab === 'dpw' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDpw.map((dpw) => (
              <div
                key={dpw.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div>
                      <h3 className="font-extrabold text-base text-gray-900 dark:text-white">{dpw.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{dpw.code}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <p className="font-bold text-gray-900 dark:text-gray-200 flex items-center gap-1.5">
                      <Users size={14} className="text-[#F26522]" />
                      <span>Koordinator: {dpw.coordinator}</span>
                    </p>
                    {dpw.phone && (
                      <p className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <PhoneCall size={13} className="text-gray-400 dark:text-gray-500" />
                        <span>{dpw.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  href={`/?search=${encodeURIComponent(dpw.name)}`}
                  className="w-full py-2.5 px-4 bg-[#1E293B] dark:bg-gray-800 hover:bg-slate-800 dark:hover:bg-gray-700 text-white text-xs font-bold rounded-xl text-center transition-colors block"
                >
                  Lihat Karya Wilayah {dpw.code}
                </Link>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
