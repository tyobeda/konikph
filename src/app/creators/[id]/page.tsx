'use client';

import React, { useState, useEffect } from 'react';
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

export default function CreatorPublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { users, artworks } = useData();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Find creator in the users list
  // Fallback support for Super Admin
  let creator = users.find((u) => u.id === id);

  if (!creator && (id === 'super-admin' || id === 'admin' || id === 'u-admin')) {
    creator = {
      id: 'admin',
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

  // Calculate stats
  const totalDownloads = creatorArtworks.reduce((acc, curr) => acc + (curr.downloadsCount || 0), 0);
  const totalLikes = creatorArtworks.reduce((acc, curr) => acc + (curr.likesCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px]">
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
                  {creator.isVerified && (
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
                    <span>{creator.region}</span>
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

        {/* Gallery / Artworks Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <Layers size={18} className="text-[#F26522]" />
            <span>Koleksi Karya Desainer ({creatorArtworks.length})</span>
          </h2>

          {creatorArtworks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="w-14 h-14 bg-orange-50 text-[#F26522] rounded-full flex items-center justify-center mb-4">
                <ImageIcon size={26} />
              </div>
              <h3 className="text-base font-bold text-gray-900">Belum Ada Karya</h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                Desainer ini belum mengunggah karya poster atau desain apa pun ke galeri PKSart.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {creatorArtworks.map((art) => (
                <ArtworkCard key={art.id} artwork={art} />
              ))}
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
