'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  ArrowLeft,
  Download,
  Heart,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  FolderPlus,
  Calendar,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { ArtworkCard } from '@/components/ArtworkCard';
import { useData } from '@/context/DataContext';
import { Artwork } from '@/lib/types';
import { ARTWORK_CATEGORIES } from '@/lib/data';
import { ConfirmUnsavedModal } from '@/components/ConfirmUnsavedModal';
import { ConfirmSuspendModal as ConfirmModal } from '@/components/ConfirmSuspendModal';

export default function MyArtworksPage() {
  const router = useRouter();
  const { artworks, currentUser, siteSettings, updateArtwork, deleteArtwork } = useData();

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

  // Filter artworks created by current logged user
  const myArtworks = artworks.filter(
    (art) => currentUser && (art.author.email === currentUser.email || art.author.name === currentUser.name)
  );

  const [filterTab, setFilterTab] = useState<'all' | 'Disetujui' | 'Pending' | 'Ditolak' | 'Dihapus'>('all');
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [deletingArtwork, setDeletingArtwork] = useState<Artwork | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editFormat, setEditFormat] = useState('Hanya gambar');
  const [editDownloadUrl, setEditDownloadUrl] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDelete = (art: Artwork) => {
    setDeletingArtwork(art);
  };

  const confirmDeleteArtwork = () => {
    if (deletingArtwork) {
      deleteArtwork(deletingArtwork.id);
      setDeletingArtwork(null);
    }
  };

  const [initialEditSnapshot, setInitialEditSnapshot] = useState<string>('');

  // Image & Carousel Management States for Edit Modal
  const [editImages, setEditImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [draggedImgIndex, setDraggedImgIndex] = useState<number | null>(null);

  // FLIP animation tracking for smooth image reordering
  const editImgRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevImgPositionsRef = useRef<Map<string, DOMRect>>(new Map());
  const draggedImgIndexRef = useRef<number | null>(null);
  const lastImgSwapTimeRef = useRef<number>(0);

  const snapshotImgPositions = () => {
    const map = new Map<string, DOMRect>();
    editImgRefs.current.forEach((el, url) => {
      if (el) {
        map.set(url, el.getBoundingClientRect());
      }
    });
    prevImgPositionsRef.current = map;
  };

  useEffect(() => {
    if (prevImgPositionsRef.current.size === 0) return;

    editImgRefs.current.forEach((el, url) => {
      if (!el) return;
      const prevRect = prevImgPositionsRef.current.get(url);
      if (!prevRect) return;

      const currentRect = el.getBoundingClientRect();
      const deltaX = prevRect.left - currentRect.left;
      const deltaY = prevRect.top - currentRect.top;

      if (deltaX !== 0 || deltaY !== 0) {
        el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
        el.style.transition = 'none';

        el.getBoundingClientRect();

        requestAnimationFrame(() => {
          el.style.transition = 'transform 320ms cubic-bezier(0.2, 0, 0, 1)';
          el.style.transform = '';
        });
      }
    });

    prevImgPositionsRef.current.clear();
  }, [editImages]);

  const handleImgDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImgIndex(index);
    draggedImgIndexRef.current = index;
    e.dataTransfer.effectAllowed = 'move';

    const blankImg = document.createElement('canvas');
    blankImg.width = 1;
    blankImg.height = 1;
    e.dataTransfer.setDragImage(blankImg, 0, 0);
  };

  const handleImgDragEnter = (index: number) => {
    const currentDragged = draggedImgIndexRef.current ?? draggedImgIndex;
    if (currentDragged !== null && currentDragged !== index) {
      const now = Date.now();
      if (now - lastImgSwapTimeRef.current < 200) return;
      lastImgSwapTimeRef.current = now;

      snapshotImgPositions();
      setEditImages((prev) => {
        const updated = [...prev];
        const [movedItem] = updated.splice(currentDragged, 1);
        updated.splice(index, 0, movedItem);
        return updated;
      });
      draggedImgIndexRef.current = index;
      setDraggedImgIndex(index);
    }
  };

  const handleImgDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleImgDragEnd = () => {
    setDraggedImgIndex(null);
    draggedImgIndexRef.current = null;
  };

  const handleImgDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedImgIndex(null);
    draggedImgIndexRef.current = null;
  };

  // Mobile Touch Drag Support
  const handleImgTouchStart = (index: number) => {
    setDraggedImgIndex(index);
    draggedImgIndexRef.current = index;
  };

  const handleImgTouchMove = (e: React.TouchEvent) => {
    const currentDragged = draggedImgIndexRef.current ?? draggedImgIndex;
    if (currentDragged === null) return;

    const now = Date.now();
    if (now - lastImgSwapTimeRef.current < 220) return;

    const touch = e.touches[0];
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropCard = targetEl?.closest('[data-myart-img-index]') as HTMLElement | null;

    if (dropCard) {
      const targetIndex = Number(dropCard.getAttribute('data-myart-img-index'));
      if (!isNaN(targetIndex) && targetIndex !== currentDragged) {
        const rect = dropCard.getBoundingClientRect();
        const horizontalMargin = rect.width * 0.2;
        const verticalMargin = rect.height * 0.2;

        const isInsideCoreZone =
          touch.clientX >= rect.left + horizontalMargin &&
          touch.clientX <= rect.right - horizontalMargin &&
          touch.clientY >= rect.top + verticalMargin &&
          touch.clientY <= rect.bottom - verticalMargin;

        if (isInsideCoreZone) {
          lastImgSwapTimeRef.current = now;
          snapshotImgPositions();
          setEditImages((prev) => {
            const updated = [...prev];
            const [movedItem] = updated.splice(currentDragged, 1);
            updated.splice(targetIndex, 0, movedItem);
            return updated;
          });
          draggedImgIndexRef.current = targetIndex;
          setDraggedImgIndex(targetIndex);
        }
      }
    }
  };

  const handleImgTouchEnd = () => {
    setDraggedImgIndex(null);
    draggedImgIndexRef.current = null;
  };

  const moveEditImage = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= editImages.length) return;
    snapshotImgPositions();
    setEditImages((prev) => {
      const updated = [...prev];
      const [item] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, item);
      return updated;
    });
  };

  const handleRemoveEditImage = (indexToRemove: number) => {
    if (editImages.length <= 1) {
      alert('Minimal harus menyisakan 1 foto karya.');
      return;
    }
    snapshotImgPositions();
    setEditImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingImage(true);
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
      snapshotImgPositions();
      setEditImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      alert(err.message || 'Gagal upload file gambar.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleOpenEdit = (art: Artwork) => {
    setEditingArtwork(art);
    const titleVal = art.title;
    const descVal = art.description || '';
    const catVal = art.category;
    const formatVal = art.format || 'Hanya gambar';
    const dlVal = art.downloadUrl || '';

    // Parse date & time from art.createdAt
    const createdDateObj = new Date(art.createdAt || Date.now());
    const yyyy = createdDateObj.getFullYear();
    const mm = String(createdDateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(createdDateObj.getDate()).padStart(2, '0');
    const hh = String(createdDateObj.getHours()).padStart(2, '0');
    const min = String(createdDateObj.getMinutes()).padStart(2, '0');
    const dateVal = `${yyyy}-${mm}-${dd}`;
    const timeVal = `${hh}:${min}`;

    const initialImages = (Array.isArray(art.imageUrls) && art.imageUrls.length > 0)
      ? [...art.imageUrls]
      : (art.imageUrl ? [art.imageUrl] : []);
    setEditImages(initialImages);

    setEditTitle(titleVal);
    setEditDescription(descVal);
    setEditCategory(catVal);
    setEditFormat(formatVal);
    setEditDownloadUrl(dlVal);
    setEditDate(dateVal);
    setEditTime(timeVal);

    setInitialEditSnapshot(JSON.stringify({
      title: titleVal,
      desc: descVal,
      cat: catVal,
      fmt: formatVal,
      dl: dlVal,
      date: dateVal,
      time: timeVal,
      images: initialImages,
    }));
  };

  const isFormDirty = () => {
    const currentSnapshot = JSON.stringify({
      title: editTitle,
      desc: editDescription,
      cat: editCategory,
      fmt: editFormat,
      dl: editDownloadUrl,
      date: editDate,
      time: editTime,
      images: editImages,
    });
    return currentSnapshot !== initialEditSnapshot;
  };

  const handleAttemptCloseModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isFormDirty()) {
      setShowUnsavedModal(true);
      return;
    }
    setEditingArtwork(null);
  };

  const handleDiscardChanges = () => {
    setShowUnsavedModal(false);
    setEditingArtwork(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtwork) return;

    if (editImages.length === 0) {
      alert('Silakan pilih minimal 1 foto karya.');
      return;
    }

    // Auto extract hashtags from description field (words starting with #)
    const hashtagsFromDesc = (editDescription.match(/#[a-zA-Z0-9_-]+/g) || []).map((t) => t.trim());
    const parsedTags = Array.from(new Set(hashtagsFromDesc));

    let updatedCreatedAt: string | undefined = undefined;
    if (editDate && editTime) {
      updatedCreatedAt = new Date(`${editDate}T${editTime}`).toISOString();
    } else if (editDate) {
      updatedCreatedAt = new Date(editDate).toISOString();
    }

    updateArtwork(editingArtwork.id, {
      title: editTitle,
      description: editDescription,
      category: editCategory,
      format: editFormat,
      downloadUrl: editFormat === 'Hanya gambar' ? '' : editDownloadUrl,
      tags: parsedTags,
      imageUrl: editImages[0],
      imageUrls: editImages,
      ...(updatedCreatedAt ? { createdAt: updatedCreatedAt as any } : {}),
    });
    setEditingArtwork(null);
  };

  const filteredItems = myArtworks.filter((art) => {
    if (filterTab === 'all') return true;
    return art.status === filterTab;
  });

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6 transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#F26522] mb-1 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Kembali</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              Kelola Postingan Karya Saya
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Daftar dokumentasi, poster, dan infografis cabang olahraga yang Anda unggah ke portal KONI Kepahiang.
            </p>
          </div>

          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Unggah Karya Baru</span>
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase">Total Karya</p>
            <p className="text-xl font-black text-gray-900 mt-1">{myArtworks.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-emerald-600 uppercase">Disetujui</p>
            <p className="text-xl font-black text-emerald-600 mt-1">
              {myArtworks.filter((a) => a.status === 'Disetujui').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-amber-600 uppercase">Pending</p>
            <p className="text-xl font-black text-amber-600 mt-1">
              {myArtworks.filter((a) => a.status === 'Pending').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-[#F26522] uppercase">Total Unduhan</p>
            <p className="text-xl font-black text-[#F26522] mt-1">
              {myArtworks.reduce((acc, curr) => acc + curr.downloadsCount, 0)}x
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3 overflow-x-auto">
          {(['all', 'Disetujui', 'Pending', 'Ditolak', 'Dihapus'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
                filterTab === tab
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab === 'all' ? 'Semua Karya' : tab}
            </button>
          ))}
        </div>

        {/* Artworks Feed Grid Container */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((artwork) => (
              <div key={artwork.id} className="relative group">
                {/* Status Badge Overlay (Bottom Left of Thumbnail) */}
                <div className="absolute bottom-16 left-3 z-30 pointer-events-none">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-md ${
                      artwork.status === 'Disetujui'
                        ? 'bg-emerald-500/95 text-white'
                        : artwork.status === 'Pending'
                        ? 'bg-amber-500/95 text-white'
                        : 'bg-red-500/95 text-white'
                    }`}
                  >
                    {artwork.status === 'Disetujui' && <CheckCircle2 size={11} />}
                    {artwork.status === 'Pending' && <Clock size={11} />}
                    {artwork.status === 'Ditolak' && <XCircle size={11} />}
                    <span>{artwork.status}</span>
                  </span>
                </div>

                {/* Edit & Delete Quick Action Floating Overlay */}
                <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenEdit(artwork);
                    }}
                    className="p-2 bg-white/90 hover:bg-white text-blue-600 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95"
                    title="Edit Postingan Karya"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(artwork);
                    }}
                    className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95"
                    title="Hapus Postingan Karya"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Standard Feed Artwork Card */}
                <ArtworkCard artwork={artwork} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <FolderPlus size={48} className="mx-auto text-gray-300 mb-3 stroke-1" />
            <h3 className="text-base font-bold text-gray-800">
              {filterTab === 'Pending' ? 'Tidak ada karya yang pending' :
               filterTab === 'Ditolak' ? 'Tidak ada karya yang ditolak' :
               filterTab === 'Dihapus' ? 'Tidak ada karya yang dihapus' :
               'Belum Ada Karya'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {filterTab === 'all' || filterTab === 'Disetujui' ? 'Unggah karya dokumentasi atau poster baru Anda untuk mulai membagikannya kepada masyarakat dan pegiat olahraga.' : 'Tidak ada data untuk kategori ini saat ini.'}
            </p>
            {(filterTab === 'all' || filterTab === 'Disetujui') && (
              <Link
                href="/upload"
                className="inline-block mt-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Unggah Karya Sekarang
              </Link>
            )}
          </div>
        )}

        {/* Edit Artwork Modal */}
        {editingArtwork && (
          <div
            onClick={handleAttemptCloseModal}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-xl sm:max-w-2xl w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 cursor-default max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h3 className="text-xl font-extrabold text-gray-900">
                  Edit Postingan Karya
                </h3>
                <button
                  type="button"
                  onClick={handleAttemptCloseModal}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors font-bold text-base"
                  title="Tutup Modal"
                >
                  ✕
                </button>
              </div>

              {/* 🖼️ KELOLA FOTO / PRATINJAU CAROUSEL ARTWORK */}
              <div className="mb-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase flex items-center gap-2">
                      <span>Foto / Pratinjau Artwork</span>
                      {editImages.length > 1 && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-[#F26522]">
                          Carousel ({editImages.length} Slide)
                        </span>
                      )}
                    </label>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {editImages.length > 1
                        ? 'Tahan & seret foto atau gunakan tombol ◀ ▶ untuk atur urutan slide. Foto pertama adalah sampul utama.'
                        : 'Foto karya Anda. Anda dapat menambahkan foto tambahan untuk membuat carousel.'}
                    </p>
                  </div>
                </div>

                {editImages.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {editImages.map((url, idx) => {
                        const isBeingDragged = draggedImgIndex === idx;

                        return (
                          <div
                            key={`${url}-${idx}`}
                            data-myart-img-index={idx}
                            ref={(el) => {
                              if (el) {
                                editImgRefs.current.set(url, el);
                              } else {
                                editImgRefs.current.delete(url);
                              }
                            }}
                            draggable
                            onDragStart={(e) => handleImgDragStart(e, idx)}
                            onDragEnter={() => handleImgDragEnter(idx)}
                            onDragOver={handleImgDragOver}
                            onDragEnd={handleImgDragEnd}
                            onDrop={handleImgDrop}
                            onTouchStart={() => handleImgTouchStart(idx)}
                            onTouchMove={handleImgTouchMove}
                            onTouchEnd={handleImgTouchEnd}
                            onTouchCancel={handleImgTouchEnd}
                            className={`relative group rounded-2xl overflow-hidden border-2 cursor-grab active:cursor-grabbing aspect-square bg-gray-100 select-none will-change-transform touch-none transition-all duration-200 ease-out ${
                              isBeingDragged
                                ? 'scale-105 -translate-y-2 rotate-2 z-40 border-[#F26522] shadow-2xl ring-4 ring-[#F26522]/40 opacity-95'
                                : 'border-gray-200 hover:border-[#F26522]/60 shadow-xs hover:shadow-md'
                            }`}
                          >
                            <img
                              src={url}
                              alt={`Foto ${idx + 1}`}
                              className="w-full h-full object-cover pointer-events-none"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />

                            {/* Order Badge (1 Utama / 2 / 3...) */}
                            <div className={`absolute top-2 left-2 flex items-center gap-1 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 pointer-events-none transition-all ${
                              idx === 0 ? 'bg-[#F26522] shadow-md' : 'bg-black/65'
                            }`}>
                              <GripVertical size={11} className="text-white/80" />
                              <span>{idx + 1}</span>
                              {idx === 0 && (
                                <span className="text-[9px] font-black ml-0.5">★ Utama</span>
                              )}
                            </div>

                            {/* Delete Photo Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveEditImage(idx);
                              }}
                              className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all shadow-md z-20"
                              title="Hapus foto ini"
                            >
                              <X size={13} />
                            </button>

                            {/* Quick Shift Arrow Buttons (Mobile & Desktop) */}
                            <div className="absolute inset-x-0 bottom-2 flex items-center justify-between px-2 z-20 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              {idx > 0 ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveEditImage(idx, -1);
                                  }}
                                  className="w-6 h-6 rounded-full bg-black/75 hover:bg-[#F26522] text-white flex items-center justify-center shadow-md active:scale-110 transition-all"
                                  title="Geser ke kiri / urutan sebelumnya"
                                >
                                  <ChevronLeft size={14} />
                                </button>
                              ) : <div className="w-6" />}

                              {idx < editImages.length - 1 ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveEditImage(idx, 1);
                                  }}
                                  className="w-6 h-6 rounded-full bg-black/75 hover:bg-[#F26522] text-white flex items-center justify-center shadow-md active:scale-110 transition-all"
                                  title="Geser ke kanan / urutan berikutnya"
                                >
                                  <ChevronRight size={14} />
                                </button>
                              ) : <div className="w-6" />}
                            </div>

                            {/* Desktop hover hint */}
                            <div className="hidden sm:block absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] font-semibold text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              Tahan & Geser Urutan
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                    <AlertTriangle size={16} className="shrink-0 text-amber-600" />
                    <span>Belum ada foto yang dipilih. Silakan unggah minimal 1 foto karya.</span>
                  </div>
                )}

                {/* Upload / Add more photos button */}
                <div className="relative border-2 border-dashed border-gray-200 hover:border-[#F26522] rounded-2xl p-4 flex flex-col items-center justify-center bg-gray-50/70 hover:bg-orange-50/20 transition-all cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditFileChange}
                    disabled={isUploadingImage}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center gap-2.5 text-gray-700 group-hover:text-[#F26522] transition-colors">
                    {isUploadingImage ? (
                      <>
                        <Loader2 size={18} className="animate-spin text-[#F26522]" />
                        <span className="text-xs font-bold text-[#F26522]">Mengunggah foto...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-7 h-7 rounded-full bg-orange-100 text-[#F26522] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus size={16} className="stroke-[3]" />
                        </div>
                        <span className="text-xs font-bold">
                          {editImages.length > 0 ? '+ Tambah Foto ke Carousel' : 'Unggah Foto Karya'}
                        </span>
                        <span className="text-[11px] text-gray-400 font-normal">
                          (Maks. 5MB per file)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Judul Karya
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#F26522]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <span>Deskripsi Karya</span>
                    <span className="text-[11px] font-normal text-red-600 lowercase">Hashtag dapat diketik langsung di sini (contoh: #Porprov2026 #KepahiangJuara)</span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={2200}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                  />
                  <div className="flex justify-end mt-1">
                    <span className={`text-[11px] font-semibold ${editDescription.length >= 2200 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                      {editDescription.length}/2200 karakter
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Kategori
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                  >
                    {ARTWORK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Tanggal & Jam Karya (2 Kolom 1 Baris pada Mobile) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Tanggal Karya
                    </label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-8 pr-2 py-2 text-xs font-semibold focus:outline-none focus:border-[#F26522] cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Jam Karya
                    </label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                      <input
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-8 pr-2 py-2 text-xs font-semibold focus:outline-none focus:border-[#F26522] cursor-pointer"
                        required
                      />
                    </div>
                  </div>
                </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Format File Master
                    </label>
                    <select
                      value={editFormat}
                      onChange={(e) => setEditFormat(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                    >
                      <option value="Hanya gambar">Hanya gambar (Tanpa File Master)</option>
                      {availableFormats.map((fmt) => (
                        <option key={fmt.id} value={fmt.id}>
                          {fmt.label}
                        </option>
                      ))}
                      {editFormat &&
                        editFormat !== 'Hanya gambar' &&
                        !availableFormats.some(
                          (f) => f.id.toUpperCase() === editFormat.toUpperCase()
                        ) && (
                          <option value={editFormat}>{editFormat}</option>
                        )}
                    </select>
                  </div>

                {editFormat !== 'Hanya gambar' && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex flex-col gap-0.5">
                      <span>Tautan File Master / Tautan Berbagi</span>
                      <span className="text-[11px] font-normal text-gray-500 lowercase">(Misal: Link Canva, Google Drive, dll.)</span>
                    </label>
                    <input
                      type="text"
                      value={editDownloadUrl}
                      onChange={(e) => setEditDownloadUrl(e.target.value)}
                      placeholder="Contoh: https://canva.com/... atau https://drive.google.com/..."
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={handleAttemptCloseModal}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}

        {/* Confirm Unsaved Changes Modal */}
        <ConfirmUnsavedModal
          isOpen={showUnsavedModal}
          onDiscard={handleDiscardChanges}
          onKeepEditing={() => setShowUnsavedModal(false)}
        />

        {/* Confirm Delete Artwork Modal */}
        <ConfirmModal
          isOpen={!!deletingArtwork}
          title={`Hapus Karya "${deletingArtwork?.title}"?`}
          message={`Apakah Anda yakin ingin menghapus karya "${deletingArtwork?.title}" ini? Postingan akan dihapus secara permanen.`}
          confirmLabel="Ya, Hapus Karya"
          variant="danger"
          onConfirm={confirmDeleteArtwork}
          onCancel={() => setDeletingArtwork(null)}
        />

      </main>
    </div>
  );
}
