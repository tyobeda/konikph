'use client';

import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArtworkCard } from '@/components/ArtworkCard';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { ConfirmUnsavedModal } from '@/components/ConfirmUnsavedModal';
import { ShareModal } from '@/components/ShareModal';
import { useData } from '@/context/DataContext';
import { ARTWORK_CATEGORIES, REGIONS } from '@/lib/data';
import { getUserSlug } from '@/lib/slug';

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      triggerToast(`Mengunduh pratinjau gambar JPG/PNG...`);
      const link = document.createElement('a');
      link.href = artwork.imageUrl;
      link.download = `${artwork.title.replace(/\s+/g, '_')}_preview.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

        <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7 relative p-2 sm:p-4 w-full flex items-center justify-center bg-gray-50/50">
            <div className="relative max-w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="w-full h-auto max-h-[75vh] object-contain block rounded-2xl"
              />
              <div className="absolute top-3 left-3 z-20 bg-black/70 backdrop-blur-md text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider">
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

                      {isOwner ? (
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
                {/* 1. Unduh Gambar Preview Button (Always available) */}
                <button
                  onClick={() => {
                    incrementDownloadCount(artwork.id);
                    triggerToast(`Mengunduh pratinjau gambar JPG/PNG...`);
                    const link = document.createElement('a');
                    link.href = artwork.imageUrl;
                    link.download = `${artwork.title.replace(/\s+/g, '_')}_preview.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="w-full py-3 px-5 bg-gray-900 hover:bg-black active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Download size={17} />
                  <span>Unduh Gambar (JPG/PNG)</span>
                </button>

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
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 cursor-default animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Edit className="text-[#F26522]" size={18} />
                <span>Edit Informasi Artwork</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* 🖼️ PRATINJAU KARYA (FULL WIDTH & NATURAL HEIGHT IMAGE PREVIEW) */}
            <div className="mb-5 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="w-full h-auto block rounded-2xl"
              />
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
