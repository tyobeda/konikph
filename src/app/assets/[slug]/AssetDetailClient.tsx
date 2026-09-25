'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Share2,
  Copy,
  CheckCircle,
  ExternalLink,
  Lock,
  Globe,
  Layers,
  Image as ImageIcon,
  FileText,
  Palette,
  Presentation,
  ShieldCheck,
  Calendar,
  Sparkles,
  Info,
  Maximize2,
  Grid,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ShareModal } from '@/components/ShareModal';
import { useData } from '@/context/DataContext';
import { incrementBrandKitDownload } from '@/actions/brandkit';

interface AssetDetailClientProps {
  brandKit: any;
  relatedKits?: any[];
}

export default function AssetDetailClient({ brandKit, relatedKits = [] }: AssetDetailClientProps) {
  const router = useRouter();
  const { currentUser } = useData();

  const [downloads, setDownloads] = useState<number>(brandKit.downloadsCount || 0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [showCheckerboard, setShowCheckerboard] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const isPublic = brandKit.isPublic !== false;
  const isAccessible = isPublic || !!currentUser;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://art.pks.id/assets/${brandKit.slug || brandKit.id}`;

  const triggerDirectDownload = async (fileUrl: string, fileName?: string) => {
    if (!fileUrl) return;

    // Track download count in background
    try {
      incrementBrandKitDownload(brandKit.id);
      setDownloads((prev) => prev + 1);
    } catch {}

    let finalUrl = fileUrl;
    const driveMatch = fileUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      finalUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
    }

    // Direct browser fetch if local upload
    if (finalUrl.startsWith('/uploads/') || (typeof window !== 'undefined' && finalUrl.startsWith(window.location.origin))) {
      try {
        const response = await fetch(finalUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName || finalUrl.split('/').pop() || 'aset-desain';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        return;
      } catch {}
    }

    const link = document.createElement('a');
    link.href = finalUrl;
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.setAttribute('download', fileName || 'aset-desain');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadClick = () => {
    if (!isAccessible) {
      router.push(`/login?redirect=/assets/${brandKit.slug || brandKit.id}`);
      return;
    }

    if (!brandKit.fileUrl || brandKit.fileUrl === '#') {
      alert('Tautan berkas utama belum disematkan pada aset ini.');
      return;
    }

    setIsDownloading(true);
    triggerDirectDownload(brandKit.fileUrl, `${brandKit.title} - PKSart`);
    setTimeout(() => setIsDownloading(false), 2000);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 3000);
    } catch {}
  };

  const Icon = brandKit.iconType === 'image' 
    ? ImageIcon 
    : brandKit.iconType === 'file-text' 
    ? FileText 
    : brandKit.iconType === 'palette' 
    ? Palette 
    : Presentation;

  const displayImage = brandKit.previewUrl || (brandKit.fileUrl && /\.(jpg|jpeg|png|webp|svg|gif)($|\?)/i.test(brandKit.fileUrl) ? brandKit.fileUrl : null);

  const formattedDate = brandKit.createdAt
    ? new Date(brandKit.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6 transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/assets"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-gray-500 dark:text-gray-400 hover:text-[#F26522] dark:hover:text-[#F26522] transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Pusat Aset Desain</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:text-[#F26522] dark:hover:text-[#F26522] text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
              title="Salin Tautan"
            >
              <Copy size={13} />
              <span className="hidden sm:inline">Salin Link</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Share2 size={13} />
              <span>Bagikan</span>
            </button>
          </div>
        </div>

        {/* Main Asset Detail Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Visual Preview Left Panel (7 cols) */}
            <div className="lg:col-span-7 bg-gray-50/60 dark:bg-gray-950/60 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 relative">
              
              {/* Top Preview Controls */}
              <div className="flex items-center justify-between gap-2 mb-4 z-10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[11px] font-extrabold uppercase rounded-lg shadow-2xs">
                    {brandKit.category}
                  </span>
                  <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 text-[#F26522] dark:text-[#ff7a38] text-[11px] font-mono font-bold rounded-lg shadow-2xs">
                    {brandKit.format}
                  </span>
                </div>

                {displayImage && (
                  <button
                    onClick={() => setShowCheckerboard(!showCheckerboard)}
                    className="p-1.5 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg text-xs transition-colors"
                    title="Ganti Latar Transparansi"
                  >
                    <Grid size={15} />
                  </button>
                )}
              </div>

              {/* Main Visual Display */}
              <div className="flex-1 min-h-[320px] sm:min-h-[420px] flex items-center justify-center relative rounded-2xl overflow-hidden my-2">
                {displayImage ? (
                  <div
                    className={`w-full h-full min-h-[320px] sm:min-h-[420px] flex items-center justify-center p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/80 transition-all ${
                      showCheckerboard
                        ? 'bg-[linear-gradient(45deg,#0000000a_25%,transparent_25%),linear-gradient(-45deg,#0000000a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#0000000a_75%),linear-gradient(-45deg,transparent_75%,#0000000a_75%)] dark:bg-[linear-gradient(45deg,#ffffff08_25%,transparent_25%),linear-gradient(-45deg,#ffffff08_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ffffff08_75%),linear-gradient(-45deg,transparent_75%,#ffffff08_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]'
                        : 'bg-white dark:bg-gray-900'
                    }`}
                  >
                    <img
                      src={displayImage}
                      alt={brandKit.title}
                      className="max-h-[380px] max-w-full object-contain drop-shadow-md select-none transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full min-h-[320px] sm:min-h-[420px] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800/80 shadow-inner">
                    <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-4 border-2 shadow-lg ${brandKit.color || 'bg-orange-50 text-[#F26522] border-orange-200'}`}>
                      <Icon size={48} />
                    </div>
                    <span className="text-sm font-extrabold text-gray-800 dark:text-gray-200 font-mono uppercase tracking-wide">
                      Berkas Format {brandKit.format}
                    </span>
                    <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mt-1">
                      Aset vektor / templat master resmi untuk aplikasi desain grafis.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Notice / Specs */}
              <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 pt-3 border-t border-gray-200/60 dark:border-gray-800/80">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Aset Resmi PKS</span>
                </span>
                {downloads > 0 && (
                  <span className="font-mono font-bold text-gray-600 dark:text-gray-400">
                    {downloads.toLocaleString('id-ID')} Kali Diunduh
                  </span>
                )}
              </div>
            </div>

            {/* Information & Action Right Panel (5 cols) */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-gray-900">
              <div className="space-y-6">
                
                {/* Status Accessibility Badge */}
                <div className="flex items-center gap-2">
                  {isPublic ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 rounded-full text-xs font-bold">
                      <Globe size={13} className="text-emerald-500" />
                      <span>Publik (Dapat diakses siapa saja)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 rounded-full text-xs font-bold">
                      <Lock size={13} className="text-amber-500" />
                      <span>Privat (Wajib Login Anggota)</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                    {brandKit.title}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                    URL Slug: <span className="text-[#F26522]">/assets/{brandKit.slug || brandKit.id}</span>
                  </p>
                </div>

                {/* Description or Usage Guide */}
                <div className="bg-gray-50/80 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <h3 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info size={14} className="text-[#F26522]" />
                    <span>Petunjuk & Panduan Aset</span>
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {brandKit.description ||
                      'Gunakan aset identitas visual resmi ini sesuai pedoman standar komunikasi PKS. Pastikan menjaga proporsi rasio logo, kesesuaian palet warna, dan keterbacaan tipografi pada media publikasi Anda.'}
                  </p>
                </div>

                {/* Specifications List */}
                <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Format File</span>
                    <span className="font-bold text-gray-900 dark:text-white uppercase font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {brandKit.format}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Kategori</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {brandKit.category}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Akses Lisensi</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {isPublic ? 'Terbuka Umum' : 'Eksklusif Anggota'}
                    </span>
                  </div>
                  {formattedDate && (
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Diperbarui</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {formattedDate}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action / Download Box */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
                {isAccessible ? (
                  <>
                    <button
                      onClick={handleDownloadClick}
                      disabled={isDownloading}
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-[#F26522] to-amber-500 hover:from-[#d85417] hover:to-amber-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Download size={18} />
                      <span>{isDownloading ? 'Menyiapkan Berkas...' : 'Unduh Berkas Mentahan'}</span>
                    </button>

                    {brandKit.fileUrl && (brandKit.fileUrl.includes('canva.com') || brandKit.fileUrl.includes('drive.google.com')) && (
                      <a
                        href={brandKit.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink size={14} />
                        <span>Buka di Tautan Asli ({brandKit.fileUrl.includes('canva.com') ? 'Canva' : 'Google Drive'})</span>
                      </a>
                    )}
                  </>
                ) : (
                  <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                      <Lock size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                        Aset Ini Bersifat Privat
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                        Silakan masuk dengan akun Anda untuk mengakses detail dan mengunduh berkas aset desain ini.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      <Link
                        href={`/login?redirect=/assets/${brandKit.slug || brandKit.id}`}
                        className="w-full py-2.5 px-4 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                      >
                        Masuk ke Akun
                      </Link>
                      <Link
                        href="/register"
                        className="w-full py-2 px-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                      >
                        Daftar Akun Baru
                      </Link>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Related Assets Section */}
        {relatedKits.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="text-[#F26522]" size={20} />
                  <span>Aset Brand Kit Lainnya</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Telusuri materi visual dan templat grafis resmi lainnya dari PKS.
                </p>
              </div>

              <Link
                href="/assets"
                className="text-xs font-bold text-[#F26522] hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedKits.map((item: any) => {
                const RelatedIcon = item.iconType === 'image' ? ImageIcon : item.iconType === 'file-text' ? FileText : item.iconType === 'palette' ? Palette : Presentation;
                const relatedImg = item.previewUrl || (item.fileUrl && /\.(jpg|jpeg|png|webp|svg|gif)($|\?)/i.test(item.fileUrl) ? item.fileUrl : null);
                const relatedIsPublic = item.isPublic !== false;

                return (
                  <Link
                    key={item.id}
                    href={`/assets/${item.slug || item.id}`}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {relatedImg ? (
                        <div className="w-full h-32 mb-3 flex items-center justify-center overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800/50">
                          <img
                            src={relatedImg}
                            alt={item.title}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 border ${item.color || 'bg-orange-50 text-[#F26522] border-orange-200'}`}>
                          <RelatedIcon size={20} />
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-extrabold uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        {!relatedIsPublic && (
                          <span className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded flex items-center gap-1 border border-amber-200 dark:border-amber-900/40">
                            <Lock size={10} /> Privat
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mt-1 group-hover:text-[#F26522] transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 lowercase">
                        {item.format}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] font-bold text-[#F26522]">
                      <span>Lihat Detail</span>
                      <span>&rarr;</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={currentUrl}
        title={brandKit.title}
        description={brandKit.description || `Unduh aset resmi ${brandKit.title} di PKSart.`}
      />

      {/* Copied Toast Alert */}
      {showCopiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle size={15} className="text-emerald-400 dark:text-emerald-600" />
          <span>Tautan berhasil disalin ke clipboard!</span>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
