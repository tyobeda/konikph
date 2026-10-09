'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Sparkles, 
  Image as ImageIcon, 
  Search, 
  LayoutGrid, 
  Layers, 
  Heart, 
  Plus, 
  ShieldAlert
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useData } from '@/context/DataContext';
import { MaintenanceContent } from '@/app/maintenance/page';

import { getUserTwibbonFavorites, toggleTwibbonFavorite } from '@/actions/twibbon';
import { getAspectRatioMeta } from '@/components/TwibbonAspectRatioSelector';

export default function TwibbonGalleryPage() {
  const { twibbons, currentUser, isTwibbonsLoaded, isModuleUnderMaintenance, siteSettings } = useData();
  const router = useRouter();

  const [liveOnlyAdminMode, setLiveOnlyAdminMode] = useState<boolean | null>(null);

  React.useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setLiveOnlyAdminMode(Boolean(d.data.onlyAdminCanCreateTwibbon));
        }
      })
      .catch(() => {});
  }, []);

  const isOnlyAdminMode = liveOnlyAdminMode !== null 
    ? liveOnlyAdminMode 
    : Boolean(siteSettings?.onlyAdminCanCreateTwibbon);

  const isSuperAdmin = currentUser?.role === 'Super Admin';
  const canCreateTwibbon = !isOnlyAdminMode || isSuperAdmin;

  if (isModuleUnderMaintenance('twibbon')) {
    return <MaintenanceContent />;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (currentUser?.id) {
      getUserTwibbonFavorites(currentUser.id).then(res => {
        if (res.success && res.data) setFavorites(res.data);
      });
    } else {
      setFavorites([]);
    }
  }, [currentUser?.id]);

  const approvedTwibbons = twibbons.filter((t) => t.status === 'Disetujui');

  const [isTogglingFavorite, setIsTogglingFavorite] = useState<string | null>(null);

  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      alert('Silakan login untuk menyimpan Twibbon favorit Anda!');
      return;
    }

    if (isTogglingFavorite) return;
    setIsTogglingFavorite(id);

    // Optimistic UI Update
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

    const res = await toggleTwibbonFavorite(id, currentUser.id);
    if (!res.success) {
      // Revert if failed
      alert('Gagal memperbarui status favorit.');
      setFavorites((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
    
    setIsTogglingFavorite(null);
  };

  const filteredTwibbons = approvedTwibbons.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.region || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeFilter === 'all' || favorites.includes(t.id);
    return matchesSearch && matchesTab;
  });

  const totalPages = Math.ceil(filteredTwibbons.length / ITEMS_PER_PAGE);
  const paginatedTwibbons = filteredTwibbons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6 transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Top Title & Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <LayoutGrid size={24} className="text-[#F26522]" />
              <span>Galeri Bingkai Twibbon PKS</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Pilih bingkai twibbon resmi PKS dari berbagai wilayah untuk mempercantik foto profil media sosial Anda.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 flex-wrap">
            {/* Create Template Button (Super Admin / Open) */}
            {isMounted && canCreateTwibbon && (
              <Link
                href="/twibbon/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F26522] hover:bg-[#d85517] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <Plus size={16} />
                <span>Buat Template Twibbon</span>
                {isOnlyAdminMode && isSuperAdmin && (
                  <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-black/30 text-white rounded">
                    Admin
                  </span>
                )}
              </Link>
            )}

            {/* Search bar */}
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari bingkai twibbon..."
                className="w-full bg-white dark:bg-gray-900 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30 shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Pemberitahuan khusus Super Admin saat mode pembatasan aktif */}
        {isMounted && isOnlyAdminMode && isSuperAdmin && (
          <div className="mb-6 p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2.5">
              <ShieldAlert size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong>Mode Khusus Super Admin Aktif:</strong> Tombol <em>"Buat Template Twibbon"</em> di atas saat ini <u>hanya terlihat oleh Anda karena sedang login sebagai Super Admin</u>. Pengguna umum, kreator biasa, dan pengunjung publik tidak melihat tombol tersebut.
              </span>
            </div>
          </div>
        )}

        {/* Tab Filters */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveFilter('all')}
            className={`pb-3 relative transition-all ${
              activeFilter === 'all'
                ? 'text-[#F26522] border-b-2 border-[#F26522]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              Semua Bingkai
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeFilter === 'all' ? 'bg-orange-100 dark:bg-orange-950/60 text-[#F26522]' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                {approvedTwibbons.length}
              </span>
            </span>
          </button>
          <button
            onClick={() => setActiveFilter('favorites')}
            className={`pb-3 relative transition-all flex items-center gap-1.5 ${
              activeFilter === 'favorites'
                ? 'text-[#F26522] border-b-2 border-[#F26522]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Heart size={14} className={activeFilter === 'favorites' ? 'fill-[#F26522]' : ''} />
            <span className="flex items-center gap-1.5">
              Favorit Saya
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeFilter === 'favorites' ? 'bg-orange-100 dark:bg-orange-950/60 text-[#F26522]' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                {isMounted ? approvedTwibbons.filter(t => favorites.includes(t.id)).length : 0}
              </span>
            </span>
          </button>
        </div>

        {/* Twibbons Grid list */}
        {!isMounted || (!isTwibbonsLoaded && twibbons.length === 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm h-[320px] animate-pulse flex flex-col"
              >
                <div className="bg-gray-100 dark:bg-gray-800 aspect-square w-full" />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                  <div className="h-8 bg-gray-150 dark:bg-gray-800 rounded-xl w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedTwibbons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm p-6 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/40 text-[#F26522] rounded-full flex items-center justify-center mb-4 shadow-sm">
              <ImageIcon size={30} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {activeFilter === 'favorites' ? 'Belum Ada Twibbon Favorit' : 'Tidak Ada Bingkai Twibbon'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-6">
              {activeFilter === 'favorites' 
                ? 'Klik ikon hati pada bingkai twibbon di galeri untuk menambahkannya ke favorit Anda.'
                : 'Tidak ada bingkai twibbon yang cocok dengan kata kunci pencarian Anda saat ini.'}
            </p>
            {activeFilter === 'favorites' ? (
              <button
                onClick={() => setActiveFilter('all')}
                className="px-5 py-2.5 bg-black dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Lihat Semua Bingkai
              </button>
            ) : (
              <button
                onClick={() => setSearchQuery('')}
                className="px-5 py-2.5 bg-black dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedTwibbons.map((tw) => (
                <div 
                  key={tw.id} 
                  className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group flex flex-col relative"
                >
                  {/* Favorite Heart Toggle Button Overlay */}
                  <button
                    onClick={(e) => toggleFavorite(tw.id, e)}
                    className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center shadow-md text-gray-400 hover:text-red-500 transition-all active:scale-90"
                    title={favorites.includes(tw.id) ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                  >
                    <Heart 
                      size={16} 
                      className={favorites.includes(tw.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} 
                    />
                  </button>

                  {/* Checkered pattern background for transparent twibbons (Clickable to use twibbon) */}
                  <Link 
                    href={`/twibbon/${tw.slug || tw.id}`}
                    className="relative aspect-square w-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center p-6 border-b border-gray-50/80 dark:border-gray-800/80 overflow-hidden cursor-pointer"
                  >
                    <div 
                      className="absolute inset-0 opacity-5 pointer-events-none" 
                      style={{
                        backgroundImage: 'radial-gradient(#000 15%, transparent 16%), radial-gradient(#000 15%, transparent 16%)',
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 8px 8px'
                      }}
                    />
                    <img
                      src={tw.imageUrl}
                      alt={tw.title}
                      className="w-full h-full object-contain drop-shadow-md group-hover:scale-[1.03] transition-transform duration-300"
                    />

                    {/* Aspect Ratio Badge */}
                    {(() => {
                      const ratioMeta = getAspectRatioMeta(tw.aspectRatio, tw.width, tw.height);
                      return (
                        <span className="absolute top-3 left-3 bg-black/65 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs border border-white/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F26522]" />
                          <span>{ratioMeta.badge}</span>
                        </span>
                      );
                    })()}

                    <span className="absolute bottom-3 left-3 bg-black/65 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {tw.category}
                    </span>
                    {tw.imageUrls && tw.imageUrls.length > 1 && (
                      <span className="absolute bottom-3 right-3 bg-[#F26522]/90 backdrop-blur-md text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Layers size={10} />
                        <span>{tw.imageUrls.length} Desain</span>
                      </span>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/twibbon/${tw.slug || tw.id}`}>
                        <h3 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-[#F26522] dark:group-hover:text-[#F26522] transition-colors leading-snug line-clamp-1 cursor-pointer">
                          {tw.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-medium">
                        Wilayah: {tw.region}
                      </p>
                      
                      {/* Used count */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-100 dark:border-purple-900/40 mt-2">
                        <Layers size={10} />
                        <span>{tw.usedCount || 0}x digunakan</span>
                      </span>
                    </div>

                    <Link
                      href={`/twibbon/${tw.slug || tw.id}`}
                      className="mt-3 w-full py-2 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={13} />
                      <span>Gunakan Bingkai</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                >
                  &laquo; Sebelum
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 150, behavior: 'smooth' });
                    }}
                    className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all border ${
                      currentPage === page
                        ? 'bg-[#F26522] text-white border-[#F26522] shadow-sm scale-105'
                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                >
                  Lanjut &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
