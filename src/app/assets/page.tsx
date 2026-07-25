'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  const { artworks } = useData();
  const [selectedFormat, setSelectedFormat] = useState('Semua Format');
  const [searchQuery, setSearchQuery] = useState('');

  const formats = ['Semua Format', 'PSD', 'AI', 'CDR', 'CANVA', 'SVG'];

  // Official Brand Kit Items
  const officialBrandKit = [
    {
      title: 'Logo Resmi PKS Vektor (Master Pack)',
      category: 'Logo Vektor',
      format: 'AI / SVG / EPS / PNG HD',
      size: '24.8 MB',
      icon: ImageIcon,
      color: 'bg-orange-50 text-[#F26522] border-orange-200',
    },
    {
      title: 'Pedoman Standar Identitas Visual (GSM)',
      category: 'Guideline PDF',
      format: 'PDF High-Res (48 Halaman)',
      size: '12.4 MB',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Palet Warna Resmi & Typography Brand',
      category: 'Color & Font',
      format: '#F26522 (Orange), #000000 (Black)',
      size: '3.2 MB',
      icon: Palette,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      title: 'Templat Presentasi Rapat & Sosialisasi',
      category: 'PowerPoint & Canva',
      format: 'PPTX / Canva Template',
      size: '18.6 MB',
      icon: Presentation,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
  ];

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
            {officialBrandKit.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${item.color}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <h3 className="font-extrabold text-sm text-gray-900 mt-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      {item.format}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-400">{item.size}</span>
                    <button
                      onClick={() => handleDownloadKit(item.title)}
                      className="px-3.5 py-1.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Download size={13} />
                      <span>Unduh Kit</span>
                    </button>
                  </div>
                </div>
              );
            })}
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
