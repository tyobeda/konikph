'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  MessageSquare,
  Download,
  MoreVertical,
  Share2,
  Flag,
  Edit,
  Calendar,
  Clock,
  HelpCircle,
  Layers,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Artwork } from '@/lib/types';
import { getUserSlug } from '@/lib/slug';
import { ShareModal } from './ShareModal';

import { ConfirmUnsavedModal } from './ConfirmUnsavedModal';
import { GdriveTutorialModal } from './GdriveTutorialModal';
import { CarouselViewer } from './CarouselViewer';

interface ArtworkCardProps {
  artwork: Artwork;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork }) => {
  const { currentUser, addArtworkReport, toggleLikeArtwork, updateArtwork, incrementDownloadCount } = useData();
  const userLiked = Boolean(
    currentUser && artwork.likedUserIds && artwork.likedUserIds.includes(currentUser.id)
  );

  const [likes, setLikes] = useState(artwork.likesCount);
  const [isLiked, setIsLiked] = useState(userLiked);
  const [imgSrc, setImgSrc] = useState(artwork.imageUrl);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [isGdriveTutorialOpen, setIsGdriveTutorialOpen] = useState(false);

  const [editTitleInput, setEditTitleInput] = useState(artwork.title);
  const [editDescInput, setEditDescInput] = useState(artwork.description || '');
  const [editCategoryInput, setEditCategoryInput] = useState(artwork.category);
  const [editFormatInput, setEditFormatInput] = useState(artwork.format || 'Hanya gambar');
  const [editDownloadUrlInput, setEditDownloadUrlInput] = useState(artwork.downloadUrl || '');
  const [editDateInput, setEditDateInput] = useState('');
  const [editTimeInput, setEditTimeInput] = useState('');
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
    const dropCard = targetEl?.closest('[data-card-img-index]') as HTMLElement | null;

    if (dropCard) {
      const targetIndex = Number(dropCard.getAttribute('data-card-img-index'));
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

  const handleOpenEditModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(false);
    
    const titleVal = artwork.title;
    const descVal = artwork.description || '';
    const catVal = artwork.category;
    const formatVal = artwork.format || 'Hanya gambar';
    const dlVal = artwork.downloadUrl || '';

    const createdDateObj = new Date(artwork.createdAt || Date.now());
    const yyyy = createdDateObj.getFullYear();
    const mm = String(createdDateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(createdDateObj.getDate()).padStart(2, '0');
    const hh = String(createdDateObj.getHours()).padStart(2, '0');
    const min = String(createdDateObj.getMinutes()).padStart(2, '0');
    const dateVal = `${yyyy}-${mm}-${dd}`;
    const timeVal = `${hh}:${min}`;

    const initialImages = (Array.isArray(artwork.imageUrls) && artwork.imageUrls.length > 0)
      ? [...artwork.imageUrls]
      : (artwork.imageUrl ? [artwork.imageUrl] : []);
    setEditImages(initialImages);

    setEditTitleInput(titleVal);
    setEditDescInput(descVal);
    setEditCategoryInput(catVal);
    setEditFormatInput(formatVal);
    setEditDownloadUrlInput(dlVal);
    setEditDateInput(dateVal);
    setEditTimeInput(timeVal);

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

    setIsEditModalOpen(true);
  };

  const isFormDirty = () => {
    const currentSnapshot = JSON.stringify({
      title: editTitleInput,
      desc: editDescInput,
      cat: editCategoryInput,
      fmt: editFormatInput,
      dl: editDownloadUrlInput,
      date: editDateInput,
      time: editTimeInput,
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
    setIsEditModalOpen(false);
  };

  const handleDiscardChanges = () => {
    setShowUnsavedModal(false);
    setIsEditModalOpen(false);
  };

  const handleSaveArtworkEdit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (editImages.length === 0) {
      alert('Silakan pilih minimal 1 foto karya.');
      return;
    }

    const hashtagsFromDesc = (editDescInput.match(/#[a-zA-Z0-9_-]+/g) || []).map((t) => t.trim());
    const parsedTags = Array.from(new Set(hashtagsFromDesc));

    let updatedCreatedAt: string | undefined = undefined;
    if (editDateInput && editTimeInput) {
      updatedCreatedAt = new Date(`${editDateInput}T${editTimeInput}`).toISOString();
    } else if (editDateInput) {
      updatedCreatedAt = new Date(editDateInput).toISOString();
    }

    updateArtwork(artwork.id, {
      title: editTitleInput,
      description: editDescInput,
      category: editCategoryInput,
      format: editFormatInput,
      downloadUrl: editFormatInput === 'Hanya gambar' ? '' : editDownloadUrlInput,
      tags: parsedTags,
      imageUrl: editImages[0],
      imageUrls: editImages,
      ...(updatedCreatedAt ? { createdAt: updatedCreatedAt as any } : {}),
    });

    setIsEditModalOpen(false);
  };
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLikes(artwork.likesCount);
    if (currentUser && artwork.likedUserIds) {
      setIsLiked(artwork.likedUserIds.includes(currentUser.id));
    }
  }, [artwork.likesCount, artwork.likedUserIds, currentUser]);

  const isOwner = Boolean(
    currentUser &&
    (
      (artwork.author?.id && artwork.author.id === currentUser.id) ||
      (artwork.author?.email && artwork.author.email.toLowerCase() === currentUser.email?.toLowerCase()) ||
      (artwork.author?.name && artwork.author.name === currentUser.name)
    )
  );

  const artworkPath = `/artwork/${artwork.slug || artwork.id}`;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${artworkPath}` : '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fallbackImage = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="100%" height="100%" fill="%23F26522"/><circle cx="300" cy="350" r="120" fill="white" opacity="0.2"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="sans-serif" font-size="36" font-weight="bold">PKSart Official</text><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="sans-serif" font-size="20" opacity="0.9">${encodeURIComponent(artwork.title)}</text></svg>`;

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLikeArtwork(artwork.id);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    incrementDownloadCount(artwork.id);
    alert(`Mengunduh karya "${artwork.title}" format (${artwork.format || 'PSD/AI'})...`);
  };

  const [isImgLoaded, setIsImgLoaded] = useState(false);

  return (
    <>
      <div className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200 flex flex-col mb-4 break-inside-avoid">
      {/* Thumbnail Area - 100% Natural Original Ratio (0% Cropping) */}
      <div className="relative block w-full overflow-hidden rounded-t-xl bg-gray-50">
        <div className="relative w-full overflow-hidden">
          {artwork.imageUrls && artwork.imageUrls.length > 1 ? (
            <CarouselViewer
              images={artwork.imageUrls}
              altTitle={artwork.title}
              autoSlide={true}
              autoSlideInterval={3200}
              linkHref={artworkPath}
            />
          ) : (
            <Link href={artworkPath} className="block relative w-full overflow-hidden">
              {/* Subtle loading placeholder background that matches masonry height */}
              {!isImgLoaded && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse" />
              )}
              <Image
                src={imgSrc}
                alt={artwork.title}
                width={600}
                height={800}
                onLoad={() => setIsImgLoaded(true)}
                onError={() => {
                  setImgSrc(fallbackImage);
                  setIsImgLoaded(true);
                }}
                unoptimized={imgSrc.startsWith('data:')}
                className={`w-full h-auto object-contain block group-hover:scale-[1.02] transition-all duration-300 ${
                  isImgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          )}
          
          {/* Category & Tags Badge overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[85%] z-10 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
              {artwork.category}
            </div>
            {artwork.tags && artwork.tags.length > 0 && (
              <span className="bg-[#F26522]/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full">
                {artwork.tags[0]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Info */}
      <div className="p-3.5 flex items-center justify-between gap-2 bg-white">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Creator Avatar Link */}
          <Link 
            href={`/creators/${getUserSlug(artwork.author)}`}
            className="shrink-0 w-8 h-8 rounded-full overflow-hidden block aspect-square ring-1 ring-gray-200 hover:ring-[#F26522] transition-all"
          >
            <Image
              src={artwork.author.avatar || 'https://ui-avatars.com/api/?name=User'}
              alt={artwork.author.name}
              width={32}
              height={32}
              unoptimized={Boolean(artwork.author.avatar?.startsWith('data:'))}
              className="w-full h-full object-cover aspect-square rounded-full block"
            />
          </Link>

          <div className="min-w-0 flex flex-col">
            {/* Creator Name Link to Creator Profile */}
            <Link 
              href={`/creators/${getUserSlug(artwork.author)}`}
              className="text-xs font-bold text-gray-900 truncate hover:text-[#F26522] transition-colors"
            >
              {artwork.author.name}
            </Link>

            {/* Hashtags list */}
            {artwork.tags && artwork.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {artwork.tags.slice(0, 3).map((tag, idx) => (
                  <Link
                    key={idx}
                    href={`/explore?q=${encodeURIComponent(tag)}`}
                    className="text-[10px] font-bold text-[#F26522] hover:underline bg-orange-50 px-1.5 py-0.5 rounded"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Like & Comment Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-0.5">
              <button
                onClick={handleLike}
                className="flex items-center gap-1 hover:text-red-500 transition-colors"
                title="Sukai Karya"
              >
                <Heart
                  size={13}
                  className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                />
                <span>{likes}</span>
              </button>

              <div className="flex items-center gap-1" title="Komentar">
                <MessageSquare size={13} className="text-gray-400" />
                <span>{artwork.commentsCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Download & More Icon Button */}
        <div className="flex items-center gap-1 relative" ref={dropdownRef}>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-600 hover:text-[#F26522] hover:bg-orange-50 rounded-lg transition-colors shrink-0"
            title="Unduh Design Template"
          >
            <Download size={18} />
          </button>
          
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDropdown(!showDropdown); }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors shrink-0"
            title="Opsi Lainnya"
          >
            <MoreVertical size={18} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-[100] text-sm animate-in fade-in zoom-in-95 origin-bottom-right">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDropdown(false); setIsShareModalOpen(true); }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 font-bold transition-colors"
              >
                <Share2 size={15} /> <span className="text-xs">Bagikan ke Sosial Media</span>
              </button>
              {isOwner ? (
                <button
                  onClick={handleOpenEditModal}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-2.5 text-blue-600 font-bold transition-colors"
                >
                  <Edit size={15} /> <span className="text-xs">Edit Artwork</span>
                </button>
              ) : (
                <button
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    setShowDropdown(false); 
                    const reason = prompt('Masukkan alasan pelaporan (misal: SARA, Spam, Hak Cipta):');
                    if (reason) {
                      addArtworkReport({
                        artworkId: artwork.id,
                        artworkTitle: artwork.title,
                        artworkImageUrl: artwork.imageUrl,
                        reason
                      });
                      alert('Terima kasih. Laporan Anda berhasil dikirim dan akan segera ditinjau oleh Admin.');
                    }
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2.5 text-red-600 font-bold transition-colors"
                >
                  <Flag size={15} /> <span className="text-xs">Laporkan Postingan</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={shareUrl} 
        title={artwork.title} 
        description={artwork.description || ''}
      />

      {/* Edit Artwork Modal */}
      {isEditModalOpen && (
        <div
          onClick={handleAttemptCloseModal}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
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
                          data-card-img-index={idx}
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

            <form onSubmit={handleSaveArtworkEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Judul Karya
                </label>
                <input
                  type="text"
                  value={editTitleInput}
                  onChange={(e) => setEditTitleInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#F26522]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <span>Deskripsi Karya</span>
                  <span className="text-[11px] font-normal text-[#F26522] lowercase">Hashtag dapat diketik langsung di sini (contoh: #PKS #JawaBarat)</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={1500}
                  value={editDescInput}
                  onChange={(e) => setEditDescInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-[11px] font-semibold ${editDescInput.length >= 1500 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {editDescInput.length}/1500 karakter
                  </span>
                </div>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Kategori
                </label>
                <select
                  value={editCategoryInput}
                  onChange={(e) => setEditCategoryInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                >
                  {[
                    'Hikmah-Motivasi',
                    'Logo',
                    'Mereka Bicara PKS',
                    'Kegiatan-Event PKS',
                    'Pemilu-Pemilukada',
                    'Tokoh PKS Bicara',
                    'Freehand-Komik-Karikatur',
                    'Kaligrafi-Kufi Design',
                    'Infografis-InfoPKS',
                    'Ucapan Selamat-Selebrasi-Duka Cita',
                    'Ragam Indonesia',
                    'Serba Serbi',
                  ].map((cat) => (
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
                      value={editDateInput}
                      onChange={(e) => setEditDateInput(e.target.value)}
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
                      value={editTimeInput}
                      onChange={(e) => setEditTimeInput(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-8 pr-2 py-2 text-xs font-semibold focus:outline-none focus:border-[#F26522] cursor-pointer"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Format File Master */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Format File Master
                </label>
                <select
                  value={editFormatInput}
                  onChange={(e) => setEditFormatInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                >
                  <option value="Hanya gambar">Hanya gambar (Tanpa File Master)</option>
                  <option value="PSD">PSD (Photoshop)</option>
                  <option value="AI">AI (Illustrator)</option>
                  <option value="CDR">CDR (CorelDraw)</option>
                  <option value="CANVA">CANVA</option>
                  <option value="FIGMA">FIGMA</option>
                </select>
              </div>

              {/* Conditional Tautan File Master */}
              {editFormatInput !== 'Hanya gambar' && (
                <div className="animate-in fade-in duration-200 space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex flex-col gap-0.5">
                    <span>Tautan File Master / Tautan Berbagi</span>
                    <span className="text-[11px] font-normal text-gray-500 lowercase">(Misal: Link Canva, Google Drive, dll.)</span>
                  </label>
                  <input
                    type="text"
                    value={editDownloadUrlInput}
                    onChange={(e) => setEditDownloadUrlInput(e.target.value)}
                    placeholder="Contoh: https://canva.com/... atau https://drive.google.com/..."
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                  />

                  {/* Google Drive Link Tutorial Hint */}
                  <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-start gap-1.5 text-blue-900">
                      <HelpCircle size={15} className="text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed">
                        <strong className="font-bold">Google Drive:</strong> Upload ke Drive &rarr; Ubah akses ke <span className="font-bold text-blue-700">"Public / Anyone with the link"</span> &rarr; Paste link di sini.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsGdriveTutorialOpen(true)}
                      className="shrink-0 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-colors text-center"
                    >
                      Panduan Drive
                    </button>
                  </div>
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

      </div>

      {/* Unsaved Changes Confirmation Modal */}
      <ConfirmUnsavedModal
        isOpen={showUnsavedModal}
        onKeepEditing={() => setShowUnsavedModal(false)}
        onDiscard={handleDiscardChanges}
      />

      {/* Google Drive Tutorial Modal */}
      <GdriveTutorialModal
        isOpen={isGdriveTutorialOpen}
        onClose={() => setIsGdriveTutorialOpen(false)}
      />
    </>
  );
};
