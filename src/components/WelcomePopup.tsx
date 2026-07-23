'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export interface WelcomePopupConfig {
  isEnabled: boolean;
  displayFrequency: 'once' | 'always';
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
}

export const DEFAULT_WELCOME_POPUP: WelcomePopupConfig = {
  isEnabled: true,
  displayFrequency: 'once',
  title: 'Selamat Datang di PKSart Official!',
  subtitle: 'Temukan dan unduh ribuan aset desain resmi poster, spanduk, feeds instagram, dan templat twibbon untuk publikasi daerah Anda.',
  imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
  ctaText: 'Jelajahi Karya Populer',
  ctaLink: '/#eksplorasi',
};

export const WelcomePopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupData, setPopupData] = useState<WelcomePopupConfig>(DEFAULT_WELCOME_POPUP);

  useEffect(() => {
    // Read popup configuration from localStorage if updated by Admin
    const storedConfig = localStorage.getItem('pksart_welcome_popup');
    if (storedConfig) {
      try {
        const parsed: WelcomePopupConfig = JSON.parse(storedConfig);
        setPopupData(parsed);
        if (parsed.isEnabled) {
          if (parsed.displayFrequency === 'always') {
            setIsOpen(true);
          } else {
            // Check if user dismissed popup in current session
            const dismissed = sessionStorage.getItem('pksart_popup_dismissed');
            if (!dismissed) {
              setIsOpen(true);
            }
          }
        }
      } catch (e) {
        setIsOpen(true);
      }
    } else {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('pksart_popup_dismissed', 'true');
  };

  if (!isOpen || !popupData.isEnabled) return null;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300 cursor-default"
      >
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors backdrop-blur-md"
          aria-label="Tutup Pop-up"
        >
          <X size={18} />
        </button>

        {/* Banner Image */}
        <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-[#F26522] to-red-600 flex items-center justify-center overflow-hidden">
          <img
            src={popupData.imageUrl}
            alt={popupData.title}
            className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20">
            <Sparkles size={14} className="text-amber-400" />
            <span>Pengumuman Resmi PKSart</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-7 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
            {popupData.title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2.5">
            {popupData.subtitle}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href={popupData.ctaLink}
              onClick={handleClose}
              className="w-full sm:flex-1 py-3 px-5 bg-[#F26522] hover:bg-[#d85417] text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>{popupData.ctaText}</span>
              <ArrowRight size={16} />
            </Link>

            <button
              onClick={handleClose}
              className="w-full sm:w-auto py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
