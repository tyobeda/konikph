'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { getClientCookie, setClientCookie } from '@/lib/cookies';
import { getCustomPageBySlug } from '@/actions/page';

export interface WelcomePopupConfig {
  isEnabled: boolean;
  displayFrequency: 'once' | 'session' | 'always';
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
}

export const DEFAULT_WELCOME_POPUP: WelcomePopupConfig = {
  isEnabled: false, // Default: non-aktif agar tidak mengganggu, bisa diaktifkan admin jika ada pengumuman Porprov/event
  displayFrequency: 'once',
  title: 'Selamat Datang di Portal Resmi KONI Kabupaten Kepahiang!',
  subtitle: 'Pusat publikasi olahraga, warta kejuaraan daerah, direktori 23 Cabang Olahraga, dan bingkai twibbon resmi atlet Bumi Sehasen.',
  imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200',
  ctaText: 'Jelajahi Berita & Cabor',
  ctaLink: '/berita',
};

export const WelcomePopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [popupData, setPopupData] = useState<WelcomePopupConfig>(DEFAULT_WELCOME_POPUP);

  useEffect(() => {
    setIsMounted(true);
    
    const fetchConfig = async () => {
      let config = DEFAULT_WELCOME_POPUP;
      try {
        const res = await getCustomPageBySlug('system-welcome-popup');
        if (res.success && res.data && res.data.content) {
          config = { ...DEFAULT_WELCOME_POPUP, ...JSON.parse(res.data.content) };
          setPopupData(config);
        }
      } catch(e) {}

      if (config.isEnabled) {
        if (config.displayFrequency === 'always') {
          setIsOpen(true);
        } else if (config.displayFrequency === 'session') {
          const dismissed = getClientCookie('koni_popup_dismissed');
          if (!dismissed) {
            setIsOpen(true);
          }
        } else {
          const shownOnce = getClientCookie('koni_popup_shown_once_device');
          if (!shownOnce) {
            setIsOpen(true);
          }
        }
      }
    };
    
    fetchConfig();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setClientCookie('koni_popup_dismissed', 'true');
    setClientCookie('koni_popup_shown_once_device', 'true', 365);
  };

  if (!isMounted || !isOpen || !popupData.isEnabled) return null;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-[#1E293B] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 cursor-default"
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
        <div className="relative w-full max-h-[320px] bg-slate-900 flex items-center justify-center overflow-hidden">
          <img
            src={popupData.imageUrl}
            alt={popupData.title}
            className="w-full h-auto max-h-[300px] object-cover opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20">
            <Sparkles size={14} className="text-amber-400" />
            <span>Pengumuman Resmi KONI Kepahiang</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-7 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {popupData.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2.5">
            {popupData.subtitle}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href={popupData.ctaLink}
              onClick={handleClose}
              className="w-full sm:flex-1 py-3 px-5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>{popupData.ctaText}</span>
              <ArrowRight size={16} />
            </Link>

            <button
              onClick={handleClose}
              className="w-full sm:w-auto py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
