'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  Mail, 
  PhoneCall, 
  BadgeCheck, 
  Layers, 
  Download, 
  MessageSquare,
  Sparkles,
  LayoutGrid,
  Image as ImageIcon
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArtworkCard } from '@/components/ArtworkCard';
import { useData } from '@/context/DataContext';
import { getUserSlug, slugify } from '@/lib/slug';
import { getUserUsedTwibbons } from '@/actions/twibbon';

export default function CreatorPublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { users, artworks, twibbons, currentUser } = useData();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'karya' | 'sukai' | 'template-twibbon' | 'twibbon-saya'>('karya');
  const [usedTwibbonsList, setUsedTwibbonsList] = useState<any[]>([]);
  const [isLoadingUsedTwibbons, setIsLoadingUsedTwibbons] = useState(true);

  // Read initial cached used twibbons from sessionStorage to prevent UI flash on refresh
  useEffect(() => {
    try {
      const cacheKey = `twibbon_user_used_${id}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUsedTwibbonsList(parsed);
          setIsLoadingUsedTwibbons(false);
        }
      }
    } catch (_) {}
  }, [id]);

  // Find creator by ID or Slug
  const decodedId = decodeURIComponent(id || '').toLowerCase();
  let creator = users.find((u) => {
    if (u.id?.toLowerCase() === decodedId) return true;
    const userSlug = getUserSlug(u).toLowerCase();
    if (userSlug === decodedId) return true;
    const nameSlug = slugify(u.name || '').toLowerCase();
    if (nameSlug && nameSlug === decodedId) return true;
    return false;
  });

  if (!creator && (decodedId === 'super-admin' || decodedId === 'admin' || decodedId === 'u-admin' || decodedId === 'super-admin-pksart')) {
    creator = {
      id: 'superadmin_1',
      name: 'Super Admin PKSart',
      email: 'admin@pks.art',
      phone: '081234567890',
      address: 'DPP PKS, Jakarta',
      region: 'Nasional',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      role: 'Super Admin',
      status: 'Active',
      isVerified: true,
    } as any;
  }

  const creatorId = creator?.id;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-fetch twibbon usages on mount and tab switch
  useEffect(() => {
    const targetQuery = creatorId || creator?.email || id;
    if (targetQuery) {
      getUserUsedTwibbons(targetQuery).then((res) => {
        if (res.success && res.data) {
          setUsedTwibbonsList(res.data);
          try {
            sessionStorage.setItem(`twibbon_user_used_${id}`, JSON.stringify(res.data));
          } catch (_) {}
        }
        setIsLoadingUsedTwibbons(false);
      });
    }
  }, [creatorId, creator?.email, id]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px]">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded-xl mb-8" />
          <div className="h-48 bg-white rounded-3xl border border-gray-100 mb-8" />
          <div className="h-64 bg-white rounded-3xl border border-gray-100" />
        </main>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px]">
        <Header />
        <main className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-orange-50 text-[#F26522] rounded-full flex items-center justify-center mb-4">
            <LayoutGrid size={30} />
          </div>
          <h3 className="text-base font-bold text-gray-900">Desainer Tidak Ditemukan</h3>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            Profil desainer yang Anda tuju tidak terdaftar atau telah dinonaktifkan dari sistem PKSart.
          </p>
          <button
            onClick={() => router.push('/creators')}
            className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all"
          >
            Lihat Semua Desainer
          </button>
        </main>
      </div>
    );
  }

  // Filter artworks created by this user
  const creatorArtworks = artworks.filter(
    (art) =>
      art.author?.id === creator.id ||
      art.author?.email?.toLowerCase() === creator.email?.toLowerCase() ||
      art.author?.name === creator.name
  );

  // Filter artworks liked by this user
  const likedArtworks = artworks.filter(
    (art) => art.likedUserIds && art.likedUserIds.includes(creator.id)
  );

  // Filter twibbon frames created by this user (Template Twibbon)
  const creatorTwibbonTemplates = twibbons.filter(
    (tw) =>
      tw.author?.name === creator.name
  );

  const isOwnProfile = Boolean(currentUser && (currentUser.id === creator.id || currentUser.email === creator.email));

  // Calculate stats
  const totalDownloads = creatorArtworks.reduce((acc, curr) => acc + (curr.downloadsCount || 0), 0);
  const totalLikes = creatorArtworks.reduce((acc, curr) => acc + (curr.likesCount || 0), 0);

  const displayedArtworks = activeTab === 'karya' ? creatorArtworks : likedArtworks;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#F26522] transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Kembali</span>
          </button>
        </div>

        {/* Creator Hero Header Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <img
                src={creator.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                alt={creator.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-orange-50 shrink-0 shadow-sm"
              />
              
              <div className="space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">{creator.name}</h1>
                  {(creator.isVerified || creator.role === 'Super Admin') && (
                    <span title="Verified Desainer PKS">
                      <BadgeCheck size={20} className="text-[#F26522] fill-orange-50" />
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {creator.role || 'Desainer PKSart'}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 text-xs text-gray-500 font-semibold pt-1">
                  <span className="flex items-center gap-1 text-gray-700">
                    <MapPin size={13} className="text-[#F26522]" />
                    <span>{(creator.region || '').replace(/^DPW\s+/i, 'Wilayah ')}</span>
                  </span>
                  
                  {creator.email && (
                    <a href={`mailto:${creator.email}`} className="flex items-center gap-1 hover:text-[#F26522] transition-colors">
                      <Mail size={13} className="text-gray-400" />
                      <span>{creator.email}</span>
                    </a>
                  )}

                  {creator.phone && (
                    <a 
                      href={`https://api.whatsapp.com/send?phone=${creator.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                    >
                      <PhoneCall size={13} className="text-emerald-500" />
                      <span>{creator.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Creator Statistics Card */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 text-center border-t sm:border-t-0 sm:border-l border-gray-100 pt-5 sm:pt-0 sm:pl-8 shrink-0 w-full md:w-auto">
              <div className="px-2">
                <p className="text-lg sm:text-xl font-extrabold text-gray-900">{creatorArtworks.length}</p>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mt-0.5">Karya</p>
              </div>
              <div className="px-2 border-x border-gray-100">
                <p className="text-lg sm:text-xl font-extrabold text-gray-900">{totalDownloads}</p>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mt-0.5">Unduhan</p>
              </div>
              <div className="px-2">
                <p className="text-lg sm:text-xl font-extrabold text-gray-900">{totalLikes}</p>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mt-0.5">Suka</p>
              </div>
            </div>

          </div>
        </div>

        {/* Gallery / Artworks / Twibbon 4 Tabs Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('karya')}
              className={`px-4 py-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'karya'
                  ? 'border-[#F26522] text-[#F26522]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>Koleksi Karya Desainer</span>
              <span
                className={`px-2 py-0.5 text-[11px] font-black rounded-full transition-colors ${
                  activeTab === 'karya'
                    ? 'bg-orange-100 text-[#F26522]'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {creatorArtworks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sukai')}
              className={`px-4 py-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'sukai'
                  ? 'border-[#F26522] text-[#F26522]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>{isOwnProfile ? 'Yang Saya Sukai' : 'Disukai Desainer'}</span>
              <span
                className={`px-2 py-0.5 text-[11px] font-black rounded-full transition-colors ${
                  activeTab === 'sukai'
                    ? 'bg-orange-100 text-[#F26522]'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {likedArtworks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('template-twibbon')}
              className={`px-4 py-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'template-twibbon'
                  ? 'border-[#F26522] text-[#F26522]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>Template Twibbon</span>
              <span
                className={`px-2 py-0.5 text-[11px] font-black rounded-full transition-colors ${
                  activeTab === 'template-twibbon'
                    ? 'bg-orange-100 text-[#F26522]'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {creatorTwibbonTemplates.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('twibbon-saya')}
              className={`px-4 py-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'twibbon-saya'
                  ? 'border-[#F26522] text-[#F26522]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>Twibbon Saya</span>
              <span
                className={`px-2 py-0.5 text-[11px] font-black rounded-full transition-colors ${
                  activeTab === 'twibbon-saya'
                    ? 'bg-orange-100 text-[#F26522]'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isLoadingUsedTwibbons && usedTwibbonsList.length === 0 ? (
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse mx-1" />
                ) : (
                  usedTwibbonsList.length
                )}
              </span>
            </button>
          </div>

          {activeTab === 'karya' || activeTab === 'sukai' ? (
            displayedArtworks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="w-14 h-14 bg-orange-50 text-[#F26522] rounded-full flex items-center justify-center mb-4">
                  <ImageIcon size={26} />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  {activeTab === 'karya' ? 'Belum Ada Karya' : 'Belum Ada Karya yang Disukai'}
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  {activeTab === 'karya'
                    ? 'Desainer ini belum mengunggah karya poster atau desain apa pun ke galeri PKSart.'
                    : 'Belum ada karya yang ditandai sebagai favorit.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayedArtworks.map((art) => (
                  <ArtworkCard key={art.id} artwork={art} />
                ))}
              </div>
            )
          ) : activeTab === 'template-twibbon' ? (
            creatorTwibbonTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Sparkles size={26} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Belum Ada Template Twibbon</h3>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  Desainer ini belum mengunggah template bingkai twibbon resmi.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {creatorTwibbonTemplates.map((tw) => (
                  <Link
                    key={tw.id}
                    href={`/twibbon/${tw.slug || tw.id}`}
                    className="group bg-white rounded-2xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2 relative">
                      <img
                        src={tw.imageUrl}
                        alt={tw.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h4 className="font-bold text-xs text-gray-900 line-clamp-1 group-hover:text-[#F26522] transition-colors">
                      {tw.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{tw.usedCount || 0}x digunakan</p>
                  </Link>
                ))}
              </div>
            )
          ) : (
            /* activeTab === 'twibbon-saya' */
            isLoadingUsedTwibbons ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#F26522] mb-3"></div>
                <p className="text-xs font-semibold">Memuat riwayat twibbon...</p>
              </div>
            ) : usedTwibbonsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="w-14 h-14 bg-orange-50 text-[#F26522] rounded-full flex items-center justify-center mb-4">
                  <Layers size={26} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Belum Ada Twibbon Yang Digenerate</h3>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  Kreator ini belum pernah men-generate twibbon.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {usedTwibbonsList.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-100 p-3.5 flex flex-col justify-between hover:shadow-md transition-all group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-200 relative mb-3">
                      <img
                        src={item.resultImageUrl || item.twibbon?.imageUrl || '/img/logo.png'}
                        alt={item.twibbon?.title || 'Hasil Twibbon'}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (item.twibbon?.imageUrl && target.src !== item.twibbon.imageUrl) {
                            target.src = item.twibbon.imageUrl;
                          }
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 line-clamp-1 group-hover:text-[#F26522] transition-colors">
                        {item.twibbon?.title || 'Frame Twibbon PKS'}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                        Kategori: {item.twibbon?.category || 'Nasional'} • {item.twibbon?.region || 'Official'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">
                        Dibuat pada: {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>

                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <Link
                          href={`/twibbon/${item.twibbon?.slug || item.twibbon?.id}`}
                          className="text-xs font-bold text-[#F26522] hover:underline flex items-center gap-1"
                        >
                          <Sparkles size={12} />
                          <span>Buat Lagi</span>
                        </Link>

                        {item.resultImageUrl && (
                          <a
                            href={item.resultImageUrl}
                            download={`Twibbon_${item.twibbon?.title || 'PKS'}.png`}
                            className="p-1.5 bg-white border border-gray-200 text-gray-700 hover:text-[#F26522] hover:border-orange-200 rounded-lg shadow-sm transition-all"
                            title="Unduh Lagi"
                          >
                            <Download size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
