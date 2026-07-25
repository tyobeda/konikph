'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Image as ImageIcon, Search, LayoutGrid, Layers } from 'lucide-react';
import { Header } from '@/components/Header';
import { useData } from '@/context/DataContext';

export default function TwibbonGalleryPage() {
  const router = useRouter();
  const { twibbons } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const approvedTwibbons = twibbons.filter((t) => t.status === 'Disetujui');

  const filteredTwibbons = approvedTwibbons.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Top Title & Header */}
        <div className="border-b border-gray-200 pb-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <LayoutGrid size={24} className="text-[#F26522]" />
              <span>Galeri Bingkai Twibbon PKS</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Pilih bingkai twibbon resmi PKS dari berbagai wilayah untuk mempercantik foto profil media sosial Anda.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-xs shrink-0">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari bingkai twibbon..."
              className="w-full bg-white text-sm rounded-xl pl-10 pr-4 py-2.5 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Twibbons Grid list */}
        {filteredTwibbons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-150 shadow-sm p-6 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-purple-50 text-[#F26522] rounded-full flex items-center justify-center mb-4 shadow-sm">
              <ImageIcon size={30} />
            </div>
            <h3 className="text-base font-bold text-gray-900">Tidak Ada Bingkai Twibbon</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              Tidak ada bingkai twibbon yang cocok dengan kata kunci pencarian Anda saat ini.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTwibbons.map((tw) => (
              <div 
                key={tw.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col"
              >
                {/* Checkered pattern background for transparent twibbons */}
                <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center p-6 border-b border-gray-50/80 overflow-hidden">
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
                  <span className="absolute top-3 left-3 bg-black/65 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {tw.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-[#F26522] transition-colors leading-snug line-clamp-1">
                      {tw.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">
                      Wilayah: {tw.region}
                    </p>
                    
                    {/* Used count */}
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 mt-2">
                      <Layers size={10} />
                      <span>{tw.usedCount || 0}x digunakan</span>
                    </span>
                  </div>

                  <Link
                    href={`/twibbon/${tw.id}`}
                    className="w-full mt-4 py-2.5 bg-[#F26522] hover:bg-[#d85417] text-white text-center text-xs font-bold rounded-xl shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={13} />
                    <span>Gunakan Bingkai</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
