'use client';

import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  ArrowLeft,
  CheckCircle,
  FileText,
  Tag,
  MapPin,
  Sparkles,
  Layers,
  Calendar,
  Clock,
  HelpCircle,
  GripVertical,
  Move,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Info,
} from 'lucide-react';
import { compressImageFile, CompressionResult } from '@/lib/imageCompressor';
import { Header } from '@/components/Header';
import { GdriveTutorialModal } from '@/components/GdriveTutorialModal';
import { CATEGORIES, REGIONS, ARTWORK_CATEGORIES } from '@/lib/data';
import { useData } from '@/context/DataContext';

// Helper to get current date (YYYY-MM-DD)
const getCurrentDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get current time (HH:mm)
const getCurrentTimeString = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

import { MaintenanceContent } from '@/app/maintenance/page';

export default function UploadPage() {
  const router = useRouter();
  const { addArtwork, currentUser, siteSettings, isMounted, isModuleUnderMaintenance } = useData();

  const availableFormats = siteSettings?.masterFileFormats && siteSettings.masterFileFormats.length > 0
    ? siteSettings.masterFileFormats
    : [
        { id: 'PSD', label: 'PSD (Photoshop)' },
        { id: 'AI', label: 'AI (Illustrator)' },
        { id: 'CDR', label: 'CDR (CorelDraw)' },
        { id: 'CANVA', label: 'CANVA' },
        { id: 'FIGMA', label: 'FIGMA' },
        { id: 'PDF', label: 'PDF' },
      ];
  const standardFormatIds = useMemo(() => availableFormats.map(f => f.id), [availableFormats]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hikmah-Motivasi');
  const [region, setRegion] = useState(REGIONS[1] || 'Wilayah Jawa Barat');
  const [fileFormat, setFileFormat] = useState('Hanya gambar');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [publishDate, setPublishDate] = useState(getCurrentDateString());
  const [publishTime, setPublishTime] = useState(getCurrentTimeString());
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPendingModeration, setIsPendingModeration] = useState(false);
  const [isGdriveTutorialOpen, setIsGdriveTutorialOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // FLIP animation tracking for smooth shifting/pushed effects
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevPositionsRef = useRef<Map<string, DOMRect>>(new Map());
  const draggedIndexRef = useRef<number | null>(null);
  const lastSwapTimeRef = useRef<number>(0);

  React.useEffect(() => {
    if (isMounted) {
      if (!currentUser) {
        router.replace('/login');
      }
    }
  }, [isMounted, currentUser, router]);

  if (isModuleUnderMaintenance('upload')) {
    return <MaintenanceContent />;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsCompressing(true);
      try {
        const uploadedUrls: string[] = [];
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || 'Upload gagal');
          uploadedUrls.push(data.url);
        }
        setPreviewUrls(prev => [...prev, ...uploadedUrls]);
      } catch (err: any) {
        alert(err.message || 'Gagal upload file gambar.');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const snapshotPositions = () => {
    const map = new Map<string, DOMRect>();
    itemRefs.current.forEach((el, url) => {
      if (el) {
        map.set(url, el.getBoundingClientRect());
      }
    });
    prevPositionsRef.current = map;
  };

  useLayoutEffect(() => {
    if (prevPositionsRef.current.size === 0) return;

    itemRefs.current.forEach((el, url) => {
      if (!el) return;
      const prevRect = prevPositionsRef.current.get(url);
      if (!prevRect) return;

      const currentRect = el.getBoundingClientRect();
      const deltaX = prevRect.left - currentRect.left;
      const deltaY = prevRect.top - currentRect.top;

      if (deltaX !== 0 || deltaY !== 0) {
        // Invert: apply inverse transform immediately without transition
        el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
        el.style.transition = 'none';

        // Force reflow
        el.getBoundingClientRect();

        // Play: smoothly animate to new origin (0, 0, 0)
        requestAnimationFrame(() => {
          el.style.transition = 'transform 320ms cubic-bezier(0.2, 0, 0, 1)';
          el.style.transform = '';
        });
      }
    });

    prevPositionsRef.current.clear();
  }, [previewUrls]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    draggedIndexRef.current = index;
    e.dataTransfer.effectAllowed = 'move';

    // Hilangkan bayangan ghost duplicate bawaan browser
    // Dengan menyetel drag image transparan 1x1 pixel
    const blankImg = document.createElement('canvas');
    blankImg.width = 1;
    blankImg.height = 1;
    e.dataTransfer.setDragImage(blankImg, 0, 0);
  };

  const handleDragEnter = (index: number) => {
    const currentDragged = draggedIndexRef.current ?? draggedIndex;
    if (currentDragged !== null && currentDragged !== index) {
      const now = Date.now();
      if (now - lastSwapTimeRef.current < 200) return;
      lastSwapTimeRef.current = now;

      snapshotPositions();
      setPreviewUrls(prev => {
        const updated = [...prev];
        const [movedItem] = updated.splice(currentDragged, 1);
        updated.splice(index, 0, movedItem);
        return updated;
      });
      draggedIndexRef.current = index;
      setDraggedIndex(index);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    draggedIndexRef.current = null;
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedIndex(null);
    draggedIndexRef.current = null;
    setDragOverIndex(null);
  };

  // Mobile Touch Support for Drag and Drop
  const handleTouchStart = (index: number) => {
    setDraggedIndex(index);
    draggedIndexRef.current = index;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentDragged = draggedIndexRef.current ?? draggedIndex;
    if (currentDragged === null) return;

    // Debounce to prevent rapid flickers/loops
    const now = Date.now();
    if (now - lastSwapTimeRef.current < 220) return;

    const touch = e.touches[0];
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropCard = targetEl?.closest('[data-preview-index]') as HTMLElement | null;

    if (dropCard) {
      const targetIndex = Number(dropCard.getAttribute('data-preview-index'));
      if (!isNaN(targetIndex) && targetIndex !== currentDragged) {
        // Cek apakah jari benar-benar sudah masuk ke area inti (deadzone tolerance)
        // Hindari pemicu swap jika hanya menyentuh tepian/border (padding 20%)
        const rect = dropCard.getBoundingClientRect();
        const horizontalMargin = rect.width * 0.2;
        const verticalMargin = rect.height * 0.2;

        const isInsideCoreZone =
          touch.clientX >= rect.left + horizontalMargin &&
          touch.clientX <= rect.right - horizontalMargin &&
          touch.clientY >= rect.top + verticalMargin &&
          touch.clientY <= rect.bottom - verticalMargin;

        if (isInsideCoreZone) {
          lastSwapTimeRef.current = now;
          snapshotPositions();
          setPreviewUrls(prev => {
            const updated = [...prev];
            const [movedItem] = updated.splice(currentDragged, 1);
            updated.splice(targetIndex, 0, movedItem);
            return updated;
          });
          draggedIndexRef.current = targetIndex;
          setDraggedIndex(targetIndex);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    setDraggedIndex(null);
    draggedIndexRef.current = null;
    setDragOverIndex(null);
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= previewUrls.length) return;
    snapshotPositions();
    setPreviewUrls(prev => {
      const updated = [...prev];
      const [item] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, item);
      return updated;
    });
  };

  const removeImage = (indexToRemove: number) => {
    snapshotPositions();
    setPreviewUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDownloadUrl('');
    setPreviewUrls([]);
    setFileFormat('Hanya gambar');
    setPublishDate(getCurrentDateString());
    setPublishTime(getCurrentTimeString());
    setIsSuccess(false);
    setIsPendingModeration(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (previewUrls.length === 0) {
      alert('Silakan pilih minimal 1 foto/gambar pratinjau.');
      return;
    }
    setIsSubmitting(true);

    const isExemptFromModeration = currentUser?.role === 'Super Admin' || Boolean(currentUser?.isVerified);
    const requiresModeration = siteSettings?.autoApproveArtworks === false && !isExemptFromModeration;
    const status = requiresModeration ? 'Pending' : 'Disetujui';

    // Auto extract hashtags from description field (words starting with #)
    const hashtagsFromDesc = (description.match(/#[a-zA-Z0-9_-]+/g) || []).map((t) => t.trim());
    const parsedTags = Array.from(new Set(hashtagsFromDesc));

    // Combine separate date and time values into ISO string
    let combinedDateTime: Date;
    if (publishDate && publishTime) {
      combinedDateTime = new Date(`${publishDate}T${publishTime}`);
    } else if (publishDate) {
      combinedDateTime = new Date(publishDate);
    } else {
      combinedDateTime = new Date();
    }

    setTimeout(() => {
      addArtwork({
        title,
        description,
        imageUrl: previewUrls[0] || '/img/877859417715829.jpg',
        imageUrls: previewUrls,
        downloadUrl: downloadUrl || '#',
        category,
        region: currentUser?.region || region || 'DPP PKS Official',
        format: fileFormat,
        tags: parsedTags,
        author: currentUser!,
        status: status as any,
        createdAt: combinedDateTime.toISOString(),
      });

      setIsSubmitting(false);
      setIsPendingModeration(requiresModeration);
      setIsSuccess(true);

      if (!requiresModeration) {
        setTimeout(() => {
          router.push('/');
        }, 1200);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6 transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#F26522] transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Kembali</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              Unggah Karya & Desain Baru
            </h1>
            {currentUser?.isVerified && (
              <div className="mt-2.5 inline-flex items-center">
                <div 
                  className="group relative inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 shadow-xs cursor-pointer select-none"
                  title="Bebas moderasi — Karya otomatis langsung terpublikasi"
                >
                  <BadgeCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>Desainer Terverifikasi</span>
                  <div className="text-emerald-600/80 group-hover:text-emerald-700 transition-colors">
                    <Info size={13} className="shrink-0" />
                  </div>

                  {/* Tooltip on hover */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-150 transform group-hover:translate-y-0 translate-y-1 z-30">
                    <div className="relative bg-gray-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                      Bebas moderasi — Karya otomatis langsung terpublikasi
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isSuccess ? (
            <div className="py-10 flex flex-col items-center text-center animate-in zoom-in-95">
              <CheckCircle size={56} className="text-emerald-500 mb-3 animate-bounce" />
              
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">
                {isPendingModeration ? 'Karya Berhasil Diunggah & Menunggu Moderasi' : 'Karya Berhasil Diunggah!'}
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
                {isPendingModeration ? (
                  <span>
                    Karya Anda saat ini berstatus <strong className="text-amber-600">Pending</strong> dan sedang menunggu peninjauan serta persetujuan oleh Administrator PKSart sebelum dipublikasikan ke galeri umum.
                  </span>
                ) : (
                  <span>Karya Anda telah disetujui dan kini siap diakses publik di galeri utama PKSart. Mengalihkan kembali...</span>
                )}
              </p>

              {isPendingModeration ? (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
                  <button
                    onClick={() => router.push('/')}
                    className="w-full py-3 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all text-center"
                  >
                    Kembali ke Beranda
                  </button>
                  <button
                    onClick={resetForm}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all text-center"
                  >
                    Unggah Karya Lainnya
                  </button>
                </div>
              ) : (
                <span className="text-xs font-bold text-[#F26522] animate-pulse">Mengalihkan ke beranda...</span>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Image Upload Area */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center justify-between">
                  <span>File Pratinjau / Preview Artwork (Carousel) <span className="text-red-500">*</span></span>
                  <span className="text-xs font-normal text-gray-500">Pilih 1 atau lebih gambar untuk postingan carousel</span>
                </label>

                {previewUrls.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500 px-1">
                      <span>Urutan Foto ({previewUrls.length}):</span>
                      <span className="text-[11px] text-[#F26522] font-bold">💡 Tahan & geser foto atau tekan tombol ◀ ▶ untuk atur urutan</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {previewUrls.map((url, idx) => {
                        const isBeingDragged = draggedIndex === idx;

                        return (
                          <div
                            key={url}
                            data-preview-index={idx}
                            ref={(el) => {
                              if (el) {
                                itemRefs.current.set(url, el);
                              } else {
                                itemRefs.current.delete(url);
                              }
                            }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragEnter={() => handleDragEnter(idx)}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                            onDrop={handleDrop}
                            onTouchStart={() => handleTouchStart(idx)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            onTouchCancel={handleTouchEnd}
                            className={`relative group rounded-xl overflow-hidden border-2 cursor-grab active:cursor-grabbing aspect-square bg-gray-100 select-none will-change-transform touch-none transition-all duration-200 ease-out ${
                              isBeingDragged
                                ? 'scale-108 -translate-y-2.5 rotate-2 z-40 border-[#F26522] shadow-[0_20px_35px_-10px_rgba(242,101,34,0.35),0_12px_20px_-8px_rgba(0,0,0,0.25)] ring-4 ring-[#F26522]/50 opacity-95'
                                : 'border-gray-200 hover:border-[#F26522]/70 shadow-xs hover:shadow-md'
                            }`}
                          >
                            <img
                              src={url}
                              alt={`Preview ${idx + 1}`}
                              className={`w-full h-full object-cover pointer-events-none transition-all duration-200 ${
                                isBeingDragged ? 'brightness-105 contrast-105' : ''
                              }`}
                            />

                            {/* Drag handle icon indicator */}
                            <div className={`absolute top-1.5 left-1.5 flex items-center gap-1 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 pointer-events-none transition-colors duration-200 ${
                              isBeingDragged ? 'bg-[#F26522] shadow-md scale-105' : 'bg-black/65'
                            }`}>
                              <GripVertical size={11} className={isBeingDragged ? 'text-white' : 'text-gray-300'} />
                              <span>{idx + 1}</span>
                              {idx === 0 && (
                                <span className={`text-[9px] font-black ml-0.5 ${isBeingDragged ? 'text-white' : 'text-[#F26522]'}`}>★ Utama</span>
                              )}
                            </div>
                            
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(idx);
                              }}
                              className="absolute top-1.5 right-1.5 bg-red-600/90 text-white p-1 rounded-full opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-20"
                              title="Hapus Foto Ini"
                            >
                              ✕
                            </button>

                            {/* Mobile Quick-Shift Arrow Buttons (Sangat mudah ditekan di HP) */}
                            <div className="sm:hidden absolute inset-x-0 bottom-1 flex items-center justify-between px-1.5 z-20">
                              {idx > 0 ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveImage(idx, -1);
                                  }}
                                  className="w-6 h-6 rounded-full bg-black/75 backdrop-blur-xs text-white flex items-center justify-center shadow-md active:bg-[#F26522] active:scale-110 transition-transform"
                                  title="Geser ke kiri"
                                >
                                  <ChevronLeft size={14} />
                                </button>
                              ) : <div className="w-6" />}

                              {idx < previewUrls.length - 1 ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveImage(idx, 1);
                                  }}
                                  className="w-6 h-6 rounded-full bg-black/75 backdrop-blur-xs text-white flex items-center justify-center shadow-md active:bg-[#F26522] active:scale-110 transition-transform"
                                  title="Geser ke kanan"
                                >
                                  <ChevronRight size={14} />
                                </button>
                              ) : <div className="w-6" />}
                            </div>

                            {/* Desktop hover hint */}
                            <div className="hidden sm:block absolute inset-x-0 bottom-0 bg-black/50 text-white text-[9px] font-semibold text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              Tahan & Geser Urutan
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="relative border-2 border-dashed border-gray-300 hover:border-[#F26522] rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50/50 transition-all group cursor-pointer min-h-[160px]">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />

                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-orange-50 text-[#F26522] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-sm font-bold text-gray-800">
                      {isCompressing ? 'Mengompresi gambar...' : previewUrls.length > 0 ? '+ Tambah Foto Lainnya' : 'Klik atau seret file gambar ke sini'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Bisa memilih lebih dari satu foto untuk postingan carousel. Maksimal 2MB per gambar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Judul Karya / Desain <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: POSTER PKS MILENIAL JABAR"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 placeholder:font-normal rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white transition-all font-semibold"
                  required
                />
              </div>

              {/* Tanggal & Waktu Publis Karya (2 Kolom 1 Baris pada Mobile) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Tanggal Karya */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 sm:mb-2 truncate">
                    <span>Tanggal Karya</span>
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-8 sm:pl-10 pr-2 sm:pr-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:border-[#F26522] focus:bg-white transition-all font-semibold cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* Jam Karya */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 sm:mb-2 truncate">
                    <span>Jam Karya</span>
                  </label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
                    <input
                      type="time"
                      value={publishTime}
                      onChange={(e) => setPublishTime(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-8 sm:pl-10 pr-2 sm:pr-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:border-[#F26522] focus:bg-white transition-all font-semibold cursor-pointer"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Kategori Karya
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-medium"
                >
                  {ARTWORK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Format */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Format File Master
                </label>
                <div className="space-y-3">
                  <select
                    value={
                      fileFormat === 'Hanya gambar'
                        ? 'HANYA_GAMBAR'
                        : standardFormatIds.includes(fileFormat)
                        ? fileFormat
                        : 'CUSTOM'
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'CUSTOM') {
                        setFileFormat('CUSTOM_VAL');
                      } else if (val === 'HANYA_GAMBAR') {
                        setFileFormat('Hanya gambar');
                      } else {
                        setFileFormat(val);
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-medium"
                  >
                    <option value="HANYA_GAMBAR">Hanya gambar (Tanpa File Master)</option>
                    {availableFormats.map((fmt) => (
                      <option key={fmt.id} value={fmt.id}>
                        {fmt.label}
                      </option>
                    ))}
                    <option value="CUSTOM">Format Kustom / Lainnya...</option>
                  </select>

                  {!['Hanya gambar', ...standardFormatIds].includes(fileFormat) && (
                    <div className="flex gap-2 animate-fadeIn">
                      <input
                        type="text"
                        value={fileFormat === 'CUSTOM_VAL' ? '' : fileFormat}
                        onChange={(e) => setFileFormat(e.target.value.toUpperCase())}
                        placeholder="Masukkan format kustom, contoh: INDD, SVG, EPS"
                        className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 placeholder:font-normal rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white transition-all font-semibold"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setFileFormat('Hanya gambar')}
                        className="px-3 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Download URL Input (Link Download) */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 flex flex-col gap-0.5">
                  <span>Tautan File Master / Tautan Berbagi</span>
                  <span className="text-[11px] font-normal text-gray-500">(Misal: Link Canva, Google Drive, dll.)</span>
                </label>
                <input
                  type="text"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  placeholder="Contoh: https://canva.com/... atau https://drive.google.com/..."
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 placeholder:font-normal rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white transition-all font-medium"
                />

                {/* Google Drive Link Tutorial Hint */}
                <div className="mt-2 bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-start gap-2 text-blue-900">
                    <HelpCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      <strong className="font-bold">Cara Berbagi Google Drive:</strong> Upload file master ke Google Drive Anda &rarr; Ubah akses menjadi <span className="font-bold text-blue-700">"Siapa saja yang memiliki link" (Public)</span> &rarr; Salin dan tempel link-nya di sini.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGdriveTutorialOpen(true)}
                    className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors text-center shadow-xs"
                  >
                    Lihat Panduan Lengkap
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <span>Deskripsi Karya</span>
                  <span className="text-xs font-normal text-[#F26522]">Hashtag dapat diketik langsung di sini (contoh: #PKS #JawaBarat)</span>
                </label>
                <textarea
                  rows={4}
                  maxLength={2200}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white transition-all"
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-[11px] font-semibold ${description.length >= 2200 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {description.length}/2200 karakter
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#F26522] hover:bg-[#d95416] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 text-base"
              >
                {isSubmitting ? 'Mengunggah Karya...' : 'Publikasikan Karya Sekarang'}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Tutorial Modal */}
      <GdriveTutorialModal
        isOpen={isGdriveTutorialOpen}
        onClose={() => setIsGdriveTutorialOpen(false)}
      />
    </div>
  );
}
