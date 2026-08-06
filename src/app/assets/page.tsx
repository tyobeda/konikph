'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useData } from '@/context/DataContext';
import { ArtworkCard } from '@/components/ArtworkCard';
import {
  Layers,
  Search,
  Filter,
  Download,
  Sparkles,
  FileCode,
  Image as ImageIcon,
  Palette,
  FileText,
  Presentation,
  CheckCircle,
} from 'lucide-react';

export default function AssetsPage() {
  const router = useRouter();
  const { artworks, brandKits, isBrandKitsLoaded, currentUser } = useData();
  const [selectedFormat, setSelectedFormat] = useState('Semua Format');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !currentUser) {
      router.replace('/login');
    }
  }, [isMounted, currentUser, router]);

  const formats = ['Semua Format', 'PSD', 'AI', 'CDR', 'CANVA', 'SVG'];

  const triggerDirectDownload = async (fileUrl: string, fileName?: string) => {
    if (!fileUrl) return;

    let finalUrl = fileUrl;
    const driveMatch = fileUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      finalUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
    }

    if (finalUrl.startsWith('/uploads/') || (typeof window !== 'undefined' && finalUrl.startsWith(window.location.origin))) {
      try {
        const response = await fetch(finalUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName || finalUrl.split('/').pop() || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        return;
      } catch {
        // Fallback
      }
    }

    const link = document.createElement('a');
    link.href = finalUrl;
    link.setAttribute('download', fileName || 'download');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  

  const handleDownloadKit = (title: string) => {
    alert(`Mengunduh paket "${title}"... Terima kasih!`);
  };

  // Filter artworks by master design formats
  const filteredAssets = artworks.filter((art) => {
    const matchesFormat =
      selectedFormat === 'Semua Format' ||
      (art.format && art.format.toUpperCase().includes(selectedFormat.toUpperCase()));
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFormat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Title */}
        <div className="bg-gradient-to-r from-[#F26522] via-[#d85417] to-red-600 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full mb-3 border border-white/20">
              <Sparkles size={14} className="text-amber-300" />
              <span>Master Design & Source Files</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Pusat Unduhan Aset Desain Resmi & Templat Mentahan
            </h1>
            <p className="text-xs sm:text-sm text-orange-100 mt-2 leading-relaxed">
              Unduh berkas mentahan resmi format Photoshop (.PSD), Illustrator (.AI), CorelDraw (.CDR), Vektor SVG, pedoman warna, serta tautan Canva untuk kebutuhan publikasi daerah Anda.
            </p>
          </div>

          <div className="absolute right-[-20px] bottom-[-20px] opacity-15 text-white pointer-events-none">
            <Layers size={240} />
          </div>
        </div>

        {/* 🎨 PUSAT UNDUHAN RESMI BRAND KIT & GUIDELINES */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <Palette className="text-[#F26522]" />
                <span>Pusat Unduhan Resmi Brand Kit & Pedoman Visual</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Aset identitas resmi untuk menjaga keselarasan standar publikasi PKS se-Indonesia.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {!isMounted || (!isBrandKitsLoaded && brandKits.length === 0) ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 py-8 text-center text-gray-400 font-medium animate-pulse">
                Memuat aset brand kit...
              </div>
            ) : brandKits.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 py-8 text-center text-gray-500">
                Belum ada aset Brand Kit yang ditambahkan.
              </div>
            ) : (
              brandKits.map((item, idx) => {
                const Icon = item.iconType === 'image' ? ImageIcon : item.iconType === 'file-text' ? FileText : item.iconType === 'palette' ? Palette : Presentation;
                const displayImage = item.previewUrl || (item.fileUrl && /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(item.fileUrl) ? item.fileUrl : null);
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {displayImage ? (
                        <div className="w-full h-36 mb-3 flex items-center justify-center group overflow-hidden rounded-xl">
                          <img
                            src={displayImage}
                            alt={item.title}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 border ${item.color}`}>
                          <Icon size={20} />
                        </div>
                      )}
                    <span className="text-[10px] font-extrabold uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <h3 className="font-extrabold text-sm text-gray-900 mt-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-1 lowercase">
                      {item.format}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-end">
                    <button
                      onClick={() => item.fileUrl ? triggerDirectDownload(item.fileUrl, item.title) : handleDownloadKit(item.title)}
                      className="px-3.5 py-1.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Unduh Kit</span>
                    </button>
                  </div>
                </div>
              );
            }))}
          </div>
        </section>

        {/* Format Selector Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">
              Katalog File Master Postingan ({filteredAssets.length})
            </h2>
            <p className="text-xs text-gray-500">Filter berdasarkan format file karya pengembang</p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {formats.map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedFormat === fmt
                    ? 'bg-[#F26522] text-white border-[#F26522] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {fmt === 'Semua Format' ? 'Semua Format' : `Format ${fmt}`}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aset PSD, AI, Canva..."
              className="w-full bg-white text-sm rounded-2xl pl-9 pr-4 py-2 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522] shadow-sm"
            />
          </div>
        </div>

        {/* Assets Grid */}
        {filteredAssets.length > 0 ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filteredAssets.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center my-8">
            <FileCode size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">
              Tidak ada aset master ditemukan
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Tidak ada file mentahan yang cocok dengan format "{selectedFormat}" atau kata kunci pencarian Anda.
            </p>
            <button
              onClick={() => {
                setSelectedFormat('Semua Format');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-[#F26522] text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Reset Filter Aset
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
