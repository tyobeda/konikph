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
  Lock,
  Globe,
  Share2,
  Check,
} from 'lucide-react';

import { MaintenanceContent } from '@/app/maintenance/page';

export default function AssetsPage() {
  const router = useRouter();
  const { artworks, brandKits, isBrandKitsLoaded, currentUser, isModuleUnderMaintenance } = useData();

  if (isModuleUnderMaintenance('assets')) {
    return <MaintenanceContent />;
  }

  const [selectedFormat, setSelectedFormat] = useState('Semua Format');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [copiedSlugOrId, setCopiedSlugOrId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleShareCopy = async (item: any) => {
    const slug = item.slug || item.id;
    const url = `${window.location.origin}/assets/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlugOrId(item.id);
      setTimeout(() => {
        setCopiedSlugOrId((prev) => (prev === item.id ? null : prev));
      }, 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedSlugOrId(item.id);
      setTimeout(() => {
        setCopiedSlugOrId((prev) => (prev === item.id ? null : prev));
      }, 2500);
    }
  };

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

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFormat, searchQuery]);

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

  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6 transition-colors duration-200">
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
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Palette className="text-red-600" />
                <span>Pusat Unduhan Resmi Brand Kit & Dokumen</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Aset identitas resmi dan dokumen pendukung untuk menjaga keselarasan standar publikasi KONI Kabupaten Kepahiang.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {!isMounted || (!isBrandKitsLoaded && brandKits.length === 0) ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 py-8 text-center text-gray-400 dark:text-gray-500 font-medium animate-pulse">
                Memuat aset brand kit...
              </div>
            ) : brandKits.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 py-8 text-center text-gray-500 dark:text-gray-400">
                Belum ada aset Brand Kit yang ditambahkan.
              </div>
            ) : (
              brandKits.map((item, idx) => {
                const Icon = item.iconType === 'image' ? ImageIcon : item.iconType === 'file-text' ? FileText : item.iconType === 'palette' ? Palette : Presentation;
                const displayImage = item.previewUrl || (item.fileUrl && /\.(jpg|jpeg|png|webp|svg|gif)($|\?)/i.test(item.fileUrl) ? item.fileUrl : null);
                const isItemPublic = item.isPublic !== false;
                const detailHref = `/assets/${item.slug || item.id}`;

                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <Link href={detailHref} className="block cursor-pointer">
                        {displayImage ? (
                          <div className="w-full h-36 mb-3 flex items-center justify-center overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800/50">
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
                      </Link>

                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                          {item.category}
                        </span>

                        {isItemPublic ? (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-200 dark:border-emerald-900/40">
                            <Globe size={10} /> Publik
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded flex items-center gap-1 border border-amber-200 dark:border-amber-900/40">
                            <Lock size={10} /> Privat
                          </span>
                        )}
                      </div>

                      <Link href={detailHref} className="block group-hover:text-[#F26522] transition-colors">
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 lowercase">
                        {item.format}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleShareCopy(item);
                        }}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold transition-all px-2.5 py-1.5 rounded-xl cursor-pointer ${
                          copiedSlugOrId === item.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'text-gray-600 dark:text-gray-400 hover:text-[#F26522] dark:hover:text-[#F26522] hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        title="Salin tautan ke clipboard"
                      >
                        {copiedSlugOrId === item.id ? (
                          <>
                            <Check size={14} className="text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Share2 size={14} />
                            <span>Share</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (!isItemPublic && !currentUser) {
                            router.push(`/login?redirect=${detailHref}`);
                            return;
                          }
                          item.fileUrl ? triggerDirectDownload(item.fileUrl, item.title) : handleDownloadKit(item.title);
                        }}
                        className="px-3 py-1.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download size={13} />
                        <span>Unduh</span>
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
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Katalog File Master Postingan ({filteredAssets.length})
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {totalPages > 1
                ? `Menampilkan hal. ${currentPage} dari ${totalPages} (20 aset per halaman)`
                : 'Filter berdasarkan format file karya pengembang'}
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {formats.map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedFormat === fmt
                    ? 'bg-[#F26522] text-white border-[#F26522] shadow-sm'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {fmt === 'Semua Format' ? 'Semua Format' : `Format ${fmt}`}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aset PSD, AI, Canva..."
              className="w-full bg-white dark:bg-gray-900 text-sm rounded-2xl pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#F26522] shadow-sm"
            />
          </div>
        </div>

        {/* Assets Grid */}
        {paginatedAssets.length > 0 ? (
          <>
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {paginatedAssets.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 400, behavior: 'smooth' });
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
                      window.scrollTo({ top: 400, behavior: 'smooth' });
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
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                >
                  Lanjut &raquo;
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center my-8">
            <FileCode size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
              Tidak ada aset master ditemukan
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
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

        {/* Floating Toast Notification when Link Copied */}
        {copiedSlugOrId && (
          <div className="fixed bottom-6 right-6 z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle size={15} className="text-emerald-400 dark:text-emerald-600" />
            <span>Tautan aset berhasil disalin ke clipboard!</span>
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
