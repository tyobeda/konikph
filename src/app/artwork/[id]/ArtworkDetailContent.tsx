'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Heart,
  Bookmark,
  Share2,
  CheckCircle,
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  Check,
  X,
  MoreVertical,
  Flag,
  Edit,
  Copy,
  ExternalLink,
  Calendar,
  Clock,
  AlertTriangle,
  Layers,
  ChevronDown,
  Loader2,
  Files,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Plus,
} from 'lucide-react';
import JSZip from 'jszip';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArtworkCard } from '@/components/ArtworkCard';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { ConfirmUnsavedModal } from '@/components/ConfirmUnsavedModal';
import { ShareModal } from '@/components/ShareModal';
import { useData } from '@/context/DataContext';
import { ARTWORK_CATEGORIES, REGIONS } from '@/lib/data';
import { getUserSlug } from '@/lib/slug';
import { CarouselViewer } from '@/components/CarouselViewer';

export default function ArtworkDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { currentUser, artworks, updateArtwork, toggleLikeArtwork, addCommentToArtwork, editCommentInArtwork, deleteCommentFromArtwork, addArtworkReport, incrementDownloadCount } = useData();

  const [isMounted, setIsMounted] = useState(false);

  const artwork = artworks.find((item) => item.id === id || item.slug === id);

  const [likesCount, setLikesCount] = useState(artwork?.likesCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState('');
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);
  const [editContent, setEditContent] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const [commentError, setCommentError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZipping, setIsZipping] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [showCarouselDownloadMenu, setShowCarouselDownloadMenu] = useState(false);
  const carouselDownloadRef = useRef<HTMLDivElement>(null);
  
  // Edit Artwork Modal States for owner
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [editDescInput, setEditDescInput] = useState('');
  const [editCategoryInput, setEditCategoryInput] = useState('');
  const [editRegionInput, setEditRegionInput] = useState('');
  const [editFormatInput, setEditFormatInput] = useState('');
  const [editDownloadUrlInput, setEditDownloadUrlInput] = useState('');
  const [editTagsInput, setEditTagsInput] = useState('');
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

  const optionsRef = useRef<HTMLDivElement>(null);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (artwork) {
      setLikesCount(artwork.likesCount || 0);
      if (currentUser && artwork.likedUserIds) {
        setIsLiked(artwork.likedUserIds.includes(currentUser.id));
      }
    }
  }, [artwork?.likesCount, artwork?.likedUserIds, currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
      if (carouselDownloadRef.current && !carouselDownloadRef.current.contains(event.target as Node)) {
        setShowCarouselDownloadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    const dropCard = targetEl?.closest('[data-edit-img-index]') as HTMLElement | null;

    if (dropCard) {
      const targetIndex = Number(dropCard.getAttribute('data-edit-img-index'));
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
      triggerToast('Minimal harus menyisakan 1 foto karya.');
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
      triggerToast(`${uploadedUrls.length} foto berhasil ditambahkan!`);
    } catch (err: any) {
      alert(err.message || 'Gagal upload file gambar.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  if (!isMounted || artworks.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col pt-[110px] items-center justify-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F26522] mb-4"></div>
        <p>Memuat karya...</p>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col pt-[110px] items-center justify-center text-gray-500">
        <p>Karya tidak ditemukan.</p>
        <button onClick={() => router.back()} className="mt-4 text-[#F26522] hover:underline">
          Kembali
        </button>
      </div>
    );
  }

  const currentComments = artwork.comments || [];

  const getCommentAuthor = (comment: any) => {
    if (comment && comment.author && typeof comment.author === 'object') {
      return comment.author;
    }
    return {
      name: comment?.name || 'Pengguna PKS',
      region: comment?.region || 'Nasional',
      avatar: comment?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      email: comment?.email || '',
      id: comment?.authorId || '',
    };
  };

  const getCommentContent = (comment: any) => {
    return comment?.content || comment?.text || '';
  };

  const getCommentTime = (comment: any) => {
    const raw = comment?.createdAt || comment?.time;
    if (!raw) return 'Baru saja';
    if (raw instanceof Date) {
      return raw.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    if (typeof raw === 'string') {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
      return raw;
    }
    return 'Baru saja';
  };

  const canEditComment = (comment: any) => {
    const author = getCommentAuthor(comment);
    const isOwner = currentUser && (
      (author.email && author.email === currentUser.email) ||
      (author.id && author.id === currentUser.id) ||
      (author.name && author.name === currentUser.name)
    );
    if (!isOwner) return false;
    if (comment.createdAt) {
      const createdTime = new Date(comment.createdAt).getTime();
      return Date.now() - createdTime <= 600000;
    }
    return true;
  };

  const canDeleteComment = (comment: any) => {
    const author = getCommentAuthor(comment);
    const isOwner = currentUser && (
      (author.email && author.email === currentUser.email) ||
      (author.id && author.id === currentUser.id) ||
      (author.name && author.name === currentUser.name)
    );
    const isSuperAdmin = currentUser?.role === 'Super Admin';
    return Boolean(isOwner || isSuperAdmin);
  };

  const handleStartEdit = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditContent(getCommentContent(comment));
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editContent.trim()) return;
    editCommentInArtwork(artwork.id, commentId, editContent);
    setEditingCommentId(null);
    setEditContent('');
    triggerToast('Komentar berhasil diperbarui!');
  };

  const confirmDeleteComment = () => {
    if (deletingCommentId) {
      deleteCommentFromArtwork(artwork.id, deletingCommentId);
      setDeletingCommentId(null);
      triggerToast('Komentar berhasil dihapus');
    }
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 3000);
  };

  const handleLikeToggle = () => {
    if (!artwork) return;
    toggleLikeArtwork(artwork.id);
    if (!isLiked) {
      triggerToast('Disukai!');
    }
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    triggerToast(isSaved ? 'Dihapus dari simpanan' : 'Karya berhasil disimpan');
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleDownloadTemplate = () => {
    if (artwork) {
      incrementDownloadCount(artwork.id);
    }
    if (artwork.downloadUrl && artwork.downloadUrl !== '#' && artwork.downloadUrl !== '') {
      let finalUrl = artwork.downloadUrl;
      const driveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)\/(?:view|edit)/;
      const driveMatch = artwork.downloadUrl.match(driveRegex);
      
      if (driveMatch && driveMatch[1]) {
        const fileId = driveMatch[1];
        finalUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        triggerToast(`Mengunduh file langsung dari Google Drive...`);
        
        const link = document.createElement('a');
        link.href = finalUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        triggerToast(`Membuka tautan unduhan file master...`);
        window.open(finalUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      handleDownloadCurrentImage();
    }
  };

  // Helper untuk mengunduh satu file gambar secara aman dengan blob trigger
  const downloadSingleFile = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
        const finalName = filename.includes('.') ? filename : `${filename}.${ext}`;
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = finalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        return true;
      }
    } catch (_) {}

    // Fallback direct link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  };

  const handleDownloadCurrentImage = async () => {
    if (!artwork) return;
    const isCarousel = artwork.imageUrls && artwork.imageUrls.length > 1;
    const activeUrl = isCarousel ? artwork.imageUrls![activeImageIndex] || artwork.imageUrl : artwork.imageUrl;
    const pageSuffix = isCarousel ? `_slide_${activeImageIndex + 1}` : '_preview';
    const cleanTitle = artwork.title.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_');
    
    incrementDownloadCount(artwork.id);
    triggerToast(isCarousel ? `Mengunduh slide ke-${activeImageIndex + 1}...` : `Mengunduh gambar...`);

    await downloadSingleFile(activeUrl, `${cleanTitle}${pageSuffix}`);
  };

  // Unduh SEMUA file langsung satu per satu (tanpa dikompres .ZIP)
  const handleDownloadAllImagesDirect = async () => {
    if (!artwork || !artwork.imageUrls || artwork.imageUrls.length === 0) return;
    if (isDownloadingAll || isZipping) return;

    setIsDownloadingAll(true);
    incrementDownloadCount(artwork.id);
    triggerToast(`Mengunduh ${artwork.imageUrls.length} gambar langsung...`);

    const cleanTitle = artwork.title.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_');

    try {
      for (let i = 0; i < artwork.imageUrls.length; i++) {
        const url = artwork.imageUrls[i];
        await downloadSingleFile(url, `${cleanTitle}_slide_${i + 1}`);
        // Jeda waktu antar unduhan agar browser tidak memblokir multiple downloads
        if (i < artwork.imageUrls.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 350));
        }
      }
      triggerToast(`Semua ${artwork.imageUrls.length} slide berhasil diunduh!`);
    } catch (err) {
      console.error('Error downloading all images directly:', err);
      triggerToast('Gagal mengunduh beberapa gambar.');
    } finally {
      setIsDownloadingAll(false);
      setShowCarouselDownloadMenu(false);
    }
  };

  const handleDownloadAllImagesZip = async () => {
    if (!artwork || !artwork.imageUrls || artwork.imageUrls.length === 0) return;
    if (isZipping || isDownloadingAll) return;

    setIsZipping(true);
    incrementDownloadCount(artwork.id);
    triggerToast(`Sedang menyiapkan ZIP (${artwork.imageUrls.length} gambar)...`);

    try {
      const zip = new JSZip();
      const cleanTitle = artwork.title.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_');
      const folder = zip.folder(cleanTitle) || zip;

      const fetchPromises = artwork.imageUrls.map(async (url, idx) => {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const blob = await res.blob();
            const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
            const fileName = `${cleanTitle}_slide_${idx + 1}.${ext}`;
            folder.file(fileName, blob);
          }
        } catch (err) {
          console.error(`Gagal fetch slide ${idx + 1}:`, err);
        }
      });

      await Promise.all(fetchPromises);

      const zipContent = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(zipContent);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${cleanTitle}_semua_slide.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      triggerToast(`Semua slide berhasil diunduh dalam file ZIP!`);
    } catch (err) {
      console.error('Error generating zip:', err);
      triggerToast('Gagal membuat ZIP, mengunduh slide saat ini...');
      handleDownloadCurrentImage();
    } finally {
      setIsZipping(false);
      setShowCarouselDownloadMenu(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentError('');
    const res = await addCommentToArtwork(artwork.id, newComment);
    if (res && res.success) {
      setNewComment('');
      setCommentError('');
      triggerToast('Komentar berhasil dikirim!');
    } else if (res && res.error) {
      setCommentError(res.error);
    }
  };

  const relatedArtworks = artworks.filter((item) => item.id !== artwork.id).slice(0, 4);

  const isOwner = Boolean(
    currentUser &&
    artwork &&
    (
      (artwork.author?.id && artwork.author.id === currentUser.id) ||
      (artwork.author?.email && artwork.author.email.toLowerCase() === currentUser.email?.toLowerCase()) ||
      (artwork.author?.name && artwork.author.name === currentUser.name)
    )
  );

  const canEditArtwork = Boolean(isOwner || currentUser?.role === 'Super Admin');



  const handleOpenEditModal = () => {
    if (!artwork) return;
    const titleVal = artwork.title;
    const descVal = artwork.description || '';
    const catVal = artwork.category;
    const formatVal = artwork.format || 'Hanya gambar';
    const dlVal = artwork.downloadUrl || '';

    // Parse date & time from artwork.createdAt
    const createdDateObj = new Date(artwork.createdAt || Date.now());
    const yyyy = createdDateObj.getFullYear();
    const mm = String(createdDateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(createdDateObj.getDate()).padStart(2, '0');
    const hh = String(createdDateObj.getHours()).padStart(2, '0');
    const min = String(createdDateObj.getMinutes()).padStart(2, '0');
    const dateVal = `${yyyy}-${mm}-${dd}`;
    const timeVal = `${hh}:${min}`;

    // Initialize editImages from artwork.imageUrls or artwork.imageUrl
    const initialImages = (Array.isArray(artwork.imageUrls) && artwork.imageUrls.length > 0)
      ? [...artwork.imageUrls]
      : (artwork.imageUrl ? [artwork.imageUrl] : []);
    setEditImages(initialImages);

    setEditTitleInput(titleVal);
    setEditDescInput(descVal);
    setEditCategoryInput(catVal);
    setEditFormatInput(formatVal);
    setEditDownloadUrlInput(dlVal);
    setEditTagsInput(artwork.tags ? artwork.tags.join(' ') : '');
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

  const handleSaveArtworkEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artwork) return;

    if (editImages.length === 0) {
      triggerToast('Silakan unggah minimal 1 foto karya.');
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

    await updateArtwork(artwork.id, {
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
    triggerToast('Karya berhasil diperbarui!');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6">
      {/* 🌟 Premium Top-Right Toast Alert */}
      {showToast && (
        <div className={`fixed top-20 right-6 z-[200] bg-white/95 backdrop-blur-md border ${
          showToast.toLowerCase().includes('disukai') ? 'border-rose-200' : 'border-emerald-200'
        } text-gray-900 text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300`}>
          <div className={`w-8 h-8 rounded-full ${
            showToast.toLowerCase().includes('disukai')
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
          } flex items-center justify-center shrink-0`}>
            {showToast.toLowerCase().includes('disukai') ? (
              <Heart size={18} className="fill-white stroke-white" />
            ) : (
              <CheckCircle size={18} className="stroke-[2.5]" />
            )}
          </div>
          <div>
            <p className="text-gray-800 font-bold">{showToast}</p>
          </div>
        </div>
      )}

      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Back button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#F26522] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Galeri</span>
          </button>
        </div>

        {artwork.status === 'Pending' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 shadow-xs">
            <AlertTriangle className="text-amber-600 shrink-0" size={22} />
            <div className="text-xs sm:text-sm leading-relaxed">
              <p className="font-bold text-amber-900">Karya Sedang Menunggu Peninjauan (Pending Review)</p>
              <p className="text-amber-700">Karya ini sedang dalam antrean moderasi oleh Administrator PKSart sebelum dapat diakses publik di galeri utama.</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7 relative p-2 sm:p-4 w-full flex items-center justify-center bg-gray-50/50">
            <div className="relative max-w-full w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
              {artwork.imageUrls && artwork.imageUrls.length > 1 ? (
                <CarouselViewer
                  images={artwork.imageUrls}
                  altTitle={artwork.title}
                  onIndexChange={setActiveImageIndex}
                />
              ) : (
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-auto max-h-[75vh] object-contain block rounded-2xl"
                />
              )}
              <div className="absolute top-3 left-3 z-20 bg-black/70 backdrop-blur-md text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider pointer-events-none">
                {artwork.category}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-4 sm:p-5 lg:p-6 flex flex-col justify-between bg-white self-stretch border-t lg:border-t-0 lg:border-l border-gray-100">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Link href={`/creators/${getUserSlug(artwork.author)}`}>
                    <img
                      src={artwork.author?.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200'}
                      alt={artwork.author?.name || 'Desainer PKS'}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-100 shadow-sm hover:ring-[#F26522] transition-all"
                    />
                  </Link>
                  <div>
                    <Link href={`/creators/${getUserSlug(artwork.author)}`}>
                      <h2 className="text-sm font-extrabold text-gray-900 leading-snug hover:text-[#F26522] transition-colors">
                        {artwork.author?.name || 'Desainer PKS'}
                      </h2>
                    </Link>
                    <p className="text-xs text-gray-500 font-medium">
                      {(artwork.author?.region || artwork.region || '').replace(/^DPW\s+/i, 'Wilayah ')}
                      {artwork.format && !['Hanya gambar', 'Hanya Gambar', 'HANYA_GAMBAR', 'Gambar'].includes(artwork.format.trim()) && (
                        ` • Format ${artwork.format}`
                      )}
                    </p>
                  </div>
                </div>

                <div className="relative" ref={optionsRef}>
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {showOptions && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-[100] text-sm animate-in fade-in zoom-in-95 origin-top-right">
                      <button
                        onClick={() => { setShowOptions(false); handleShare(); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 font-bold transition-colors"
                      >
                        <Share2 size={16} /> <span className="text-xs">Bagikan ke Sosial Media</span>
                      </button>

                      {canEditArtwork ? (
                        <button
                          onClick={() => {
                            setShowOptions(false);
                            handleOpenEditModal();
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-2.5 text-blue-600 font-bold transition-colors"
                        >
                          <Edit size={16} /> <span className="text-xs">Edit Artwork</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => { 
                            setShowOptions(false); 
                            const reason = prompt('Masukkan alasan pelaporan (misal: SARA, Spam, Hak Cipta):');
                            if (reason) {
                              addArtworkReport({
                                artworkId: artwork.id,
                                artworkTitle: artwork.title,
                                artworkImageUrl: artwork.imageUrl,
                                reason
                              });
                              triggerToast('Laporan berhasil dikirim ke Admin'); 
                            }
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2.5 text-red-600 font-bold transition-colors"
                        >
                          <Flag size={16} /> <span className="text-xs">Laporkan Postingan</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="py-4 border-b border-gray-100 space-y-2.5">
                <h1 className="text-lg font-black text-gray-900 leading-tight">
                  {artwork.title}
                </h1>
                {artwork.description && (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                    <p className="text-xs text-gray-600 leading-relaxed font-normal whitespace-pre-line">
                      {!isDescExpanded && artwork.description.length > 100
                        ? `${artwork.description.slice(0, 100)}...`
                        : artwork.description}
                    </p>
                    {artwork.description.length > 100 && (
                      <button
                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                        className="text-xs font-bold text-[#F26522] hover:underline cursor-pointer inline-block mt-0.5"
                      >
                        {isDescExpanded ? 'Sembunyikan' : 'Lihat selengkapnya'}
                      </button>
                    )}
                  </div>
                )}

                {/* Hashtags Section */}
                {artwork.tags && artwork.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs font-bold text-gray-400 mr-1">Hashtags:</span>
                    {artwork.tags.map((tag: string, idx: number) => (
                      <Link
                        key={idx}
                        href={`/explore?q=${encodeURIComponent(tag)}`}
                        className="text-xs font-bold text-[#F26522] bg-orange-50 border border-orange-100 hover:bg-[#F26522] hover:text-white px-2.5 py-1 rounded-full transition-all shadow-2xs"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div suppressHydrationWarning className="flex-1 py-4 overflow-y-auto max-h-[260px] lg:max-h-[320px] space-y-3 pr-1 my-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <MessageSquare size={14} className="text-[#F26522]" />
                <span>Komentar ({currentComments.length})</span>
              </h3>

              {currentComments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-4">
                  <MessageSquare size={22} className="text-gray-300 mb-1.5" />
                  <p className="text-xs font-bold text-gray-500 font-sans">Belum ada komentar</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Jadilah yang pertama menuliskan pendapat Anda!</p>
                </div>
              ) : (
                currentComments.slice(0, visibleCommentsCount).map((comment: any) => {
                  const author = getCommentAuthor(comment);
                  const content = getCommentContent(comment);
                  const time = getCommentTime(comment);
                  const isEditingThis = editingCommentId === comment.id;

                  return (
                    <div key={comment.id} className="flex gap-2.5 bg-gray-50/70 p-3 rounded-xl border border-gray-100 group">
                      <Link href={`/creators/${getUserSlug(author)}`}>
                        <img
                          src={author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                          alt={author.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 hover:ring-1 hover:ring-[#F26522] transition-all"
                        />
                      </Link>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link href={`/creators/${getUserSlug(author)}`}>
                              <span className="font-bold text-gray-900 hover:text-[#F26522] transition-colors">{author.name} - {(author.region || '').replace(/^DPW\s+/i, 'Wilayah ')}</span>
                            </Link>
                            {comment.isEdited && (
                              <span className="text-[10px] text-gray-400 font-normal italic">(disunting)</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">{time}</span>

                            <div className="flex items-center gap-1">
                              {canEditComment(comment) && !isEditingThis && (
                                <button
                                  onClick={() => handleStartEdit(comment)}
                                  className="text-gray-400 hover:text-[#F26522] transition-colors p-0.5"
                                  title="Edit Komentar"
                                >
                                  <Edit2 size={12} />
                                </button>
                              )}

                              {canDeleteComment(comment) && !isEditingThis && (
                                <button
                                  onClick={() => setDeletingCommentId(comment.id)}
                                  className="text-gray-400 hover:text-red-600 transition-colors p-0.5"
                                  title="Hapus Komentar"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {isEditingThis ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              value={editContent}
                              maxLength={1000}
                              onChange={(e) => setEditContent(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSaveEdit(comment.id);
                                }
                              }}
                              className="w-full bg-white border border-[#F26522] rounded-lg px-2.5 py-1.5 text-xs text-gray-900 font-semibold focus:outline-none resize-none min-h-[36px]"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex items-center gap-1.5 justify-end">
                              <button
                                onClick={() => setEditingCommentId(null)}
                                className="px-2 py-1 text-[11px] font-bold text-gray-600 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-0.5"
                              >
                                <X size={12} />
                                <span>Batal</span>
                              </button>
                              <button
                                onClick={() => handleSaveEdit(comment.id)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-[#F26522] text-white rounded-md hover:bg-[#d85417] transition-colors flex items-center gap-0.5 shadow-sm"
                              >
                                <Check size={12} />
                                <span>Simpan</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <p className="text-gray-700 leading-normal whitespace-pre-line break-words">
                              {!expandedComments[comment.id] && content.length > 100
                                ? `${content.slice(0, 100)}...`
                                : content}
                            </p>
                            {content.length > 100 && (
                              <button
                                onClick={() =>
                                  setExpandedComments((prev) => ({
                                    ...prev,
                                    [comment.id]: !prev[comment.id],
                                  }))
                                }
                                className="text-[11px] font-bold text-[#F26522] hover:underline cursor-pointer inline-block mt-0.5"
                              >
                                {expandedComments[comment.id] ? 'Sembunyikan' : 'Baca selengkapnya'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              {currentComments.length > visibleCommentsCount && (
                <button
                  onClick={() => setVisibleCommentsCount((prev) => prev + 10)}
                  className="w-full py-2 mt-2 text-xs font-bold text-[#F26522] bg-[#F26522]/10 rounded-xl hover:bg-[#F26522]/20 transition-colors"
                >
                  Tampilkan {Math.min(10, currentComments.length - visibleCommentsCount)} komentar lainnya
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-1.5">
              <form onSubmit={handleAddComment} className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <textarea
                    value={newComment}
                    maxLength={1000}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      if (commentError) setCommentError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment(e as unknown as React.FormEvent);
                      }
                    }}
                    placeholder="Tulis komentar (maks 1000 karakter)..."
                    className={`w-full bg-gray-50 border text-gray-900 placeholder:text-gray-400 font-semibold rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:bg-white transition-all resize-none min-h-[36px] overflow-hidden ${
                      commentError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#F26522]'
                    }`}
                    rows={2}
                  />
                  <div className="flex items-center justify-between px-1 mt-1">
                    {commentError ? (
                      <span className="text-[11px] font-normal text-red-500">
                        {commentError.replace(/\s*\("[^"]+"\)/g, '')}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className={`text-[10px] font-semibold ${newComment.length >= 1000 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                      {newComment.length}/1000
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-[#F26522] text-white rounded-xl font-bold text-xs hover:bg-[#d85417] transition-all flex items-center gap-1 shrink-0"
                >
                  <Send size={14} />
                  <span>Kirim</span>
                </button>
              </form>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleLikeToggle}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    isLiked
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Heart size={15} className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
                  <span>Sukai ({likesCount})</span>
                </button>

                <button
                  onClick={handleSaveToggle}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSaved
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Bookmark size={15} className={isSaved ? 'fill-amber-500 text-amber-500' : 'text-gray-500'} />
                  <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-all"
                >
                  <Share2 size={15} className="text-gray-500" />
                  <span>Bagikan</span>
                </button>
              </div>

              <div className="space-y-2">
                {/* 1. Unduh Gambar Preview Button (Carousel-aware with single slide & ZIP download options) */}
                {artwork.imageUrls && artwork.imageUrls.length > 1 ? (
                  <div className="relative" ref={carouselDownloadRef}>
                    <div className="flex rounded-xl shadow-sm overflow-hidden bg-gray-900 text-white">
                      {/* Main action: download slide currently in view */}
                      <button
                        type="button"
                        onClick={handleDownloadCurrentImage}
                        className="flex-1 py-3 px-4 hover:bg-black active:scale-[0.99] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2"
                        title={`Unduh Slide ${activeImageIndex + 1} (${activeImageIndex + 1} dari ${artwork.imageUrls.length})`}
                      >
                        <Download size={17} />
                        <span>Unduh Slide Ini ({activeImageIndex + 1}/{artwork.imageUrls.length})</span>
                      </button>

                      {/* Dropdown toggle for options */}
                      <button
                        type="button"
                        onClick={() => setShowCarouselDownloadMenu(!showCarouselDownloadMenu)}
                        className="px-3 border-l border-gray-700 hover:bg-black active:bg-gray-800 transition-colors flex items-center justify-center text-white"
                        title="Pilihan Download Slide"
                      >
                        <ChevronDown size={16} className={`transition-transform duration-200 ${showCarouselDownloadMenu ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Dropdown menu (membuka ke atas agar tidak terpotong container card) */}
                    {showCarouselDownloadMenu && (
                      <div className="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-2xl shadow-2xl border border-gray-200 py-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 divide-y divide-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCarouselDownloadMenu(false);
                            handleDownloadCurrentImage();
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Download size={15} className="text-gray-500 shrink-0" />
                          <span>Unduh <strong>Slide {activeImageIndex + 1}</strong> Saja</span>
                        </button>

                        <button
                          type="button"
                          disabled={isDownloadingAll || isZipping}
                          onClick={handleDownloadAllImagesDirect}
                          className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center gap-2.5 transition-colors disabled:opacity-60 cursor-pointer"
                        >
                          {isDownloadingAll ? (
                            <Loader2 size={15} className="animate-spin text-gray-700 shrink-0" />
                          ) : (
                            <Files size={15} className="text-gray-700 shrink-0" />
                          )}
                          <span>
                            {isDownloadingAll
                              ? 'Sedang Mengunduh...'
                              : `Unduh Semua (${artwork.imageUrls.length} File Gambar Langsung)`}
                          </span>
                        </button>

                        <button
                          type="button"
                          disabled={isZipping || isDownloadingAll}
                          onClick={handleDownloadAllImagesZip}
                          className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-[#F26522] hover:bg-orange-50/60 flex items-center gap-2.5 transition-colors disabled:opacity-60 cursor-pointer"
                        >
                          {isZipping ? (
                            <Loader2 size={15} className="animate-spin text-[#F26522] shrink-0" />
                          ) : (
                            <Layers size={15} className="text-[#F26522] shrink-0" />
                          )}
                          <span>
                            {isZipping
                              ? 'Mengompres Semua Slide...'
                              : `Unduh Paket ZIP (${artwork.imageUrls.length} Gambar)`}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleDownloadCurrentImage}
                    className="w-full py-3 px-5 bg-gray-900 hover:bg-black active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={17} />
                    <span>Unduh Gambar (JPG/PNG)</span>
                  </button>
                )}

                {/* 2. Buka / Unduh File Master Button (If master url is present) */}
                {artwork.downloadUrl && artwork.downloadUrl !== '#' && artwork.downloadUrl !== '' && (
                  <button
                    onClick={handleDownloadTemplate}
                    className="w-full py-3 px-5 bg-[#F26522] hover:bg-[#d95416] active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={17} />
                    <span>
                      {artwork.downloadUrl.toLowerCase().includes('canva.com')
                        ? 'Buka Template Canva'
                        : `Buka File Master (${artwork.format || 'PSD/AI'})`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Desain & Artwork Terkait</h3>
          <div className="columns-1 sm:columns-2 lg:columns-4 gap-4 space-y-4">
            {relatedArtworks.map((item: any) => (
              <ArtworkCard key={item.id} artwork={item} />
            ))}
          </div>
        </div>
      </main>

      <Footer />

      <ConfirmDeleteModal
        isOpen={Boolean(deletingCommentId)}
        title="Hapus Komentar?"
        message="Apakah Anda yakin ingin menghapus komentar ini? Komentar yang telah dihapus tidak dapat dikembalikan."
        confirmLabel="Ya, Hapus"
        onConfirm={confirmDeleteComment}
        onCancel={() => setDeletingCommentId(null)}
      />
      
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={shareUrl} 
        title={artwork.title} 
        description={artwork.description || ''}
      />

      {/* Edit Artwork Modal for Owner / Super Admin */}
      {isEditModalOpen && (
        <div
          onClick={handleAttemptCloseModal}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl sm:max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 cursor-default animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Edit className="text-[#F26522]" size={18} />
                <span>Edit Informasi Artwork</span>
              </h3>
              <button
                type="button"
                onClick={handleAttemptCloseModal}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                title="Tutup"
              >
                <X size={18} />
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
                          data-edit-img-index={idx}
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
                  value={editDescInput}
                  onChange={(e) => setEditDescInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                />
              </div>

              {/* Kategori & Tanggal/Jam */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Kategori
                </label>
                <select
                  value={editCategoryInput}
                  onChange={(e) => setEditCategoryInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                >
                  {ARTWORK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal & Jam Karya (2 Kolom 1 Baris) */}
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

              {editFormatInput !== 'Hanya gambar' && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex flex-col gap-0.5">
                    <span>Tautan File Master / Tautan Berbagi</span>
                    <span className="text-[10px] font-normal text-gray-500 lowercase">(Misal: Link Canva, Google Drive, dll.)</span>
                  </label>
                  <input
                    type="text"
                    value={editDownloadUrlInput}
                    onChange={(e) => setEditDownloadUrlInput(e.target.value)}
                    placeholder="Contoh: https://canva.com/... atau https://drive.google.com/..."
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
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
    </div>
  );
}
