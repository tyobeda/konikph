'use client';

import React from 'react';
import { Home, Compass, Sparkles, Image, Palette, Search } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-20 relative overflow-hidden bg-gradient-to-b from-gray-50/50 via-white to-orange-50/30">
        {/* Ambient background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full text-center space-y-7 relative z-10">
          {/* Animated / Glowing 404 Badge */}
          <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#F26522] to-amber-400 rounded-3xl opacity-15 blur-xl" />
            <div className="relative w-28 h-28 rounded-3xl bg-white border border-orange-200/60 shadow-xl shadow-orange-500/10 flex flex-col items-center justify-center gap-1">
              <span className="text-4xl font-black bg-gradient-to-r from-[#F26522] to-amber-600 bg-clip-text text-transparent tracking-tight">
                404
              </span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                <Sparkles size={10} />
                <span>Ups! Hilang</span>
              </div>
            </div>
          </div>

          {/* Text Details */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
              Karya, twibbon, atau halaman yang Anda cari mungkin sudah dipindahkan, dihapus, atau tautan yang dimasukkan keliru.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <a
              href="/"
              className="w-full sm:w-auto px-6 py-3 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <Home size={16} />
              <span>Kembali ke Beranda</span>
            </a>
            <a
              href="/explore"
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-xs transition-all hover:border-[#F26522]/40 flex items-center justify-center gap-2"
            >
              <Compass size={16} className="text-[#F26522]" />
              <span>Jelajahi Karya</span>
            </a>
          </div>

          {/* Quick Shortcut Pills */}
          <div className="pt-4 border-t border-gray-100/80 space-y-2.5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Atau akses menu populer berikut:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-gray-600">
              <a
                href="/twibbon"
                className="px-3 py-1.5 bg-gray-100/80 hover:bg-orange-50 hover:text-[#F26522] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Image size={13} className="text-[#F26522]" />
                <span>Twibbon</span>
              </a>
              <a
                href="/assets"
                className="px-3 py-1.5 bg-gray-100/80 hover:bg-orange-50 hover:text-[#F26522] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Palette size={13} className="text-[#F26522]" />
                <span>Brand Kit</span>
              </a>
              <a
                href="/creators"
                className="px-3 py-1.5 bg-gray-100/80 hover:bg-orange-50 hover:text-[#F26522] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Search size={13} className="text-[#F26522]" />
                <span>Desainer DPW</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
