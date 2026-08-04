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
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { USERS } from '@/lib/data';
import { ArtworkCard } from '@/components/ArtworkCard';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { ShareModal } from '@/components/ShareModal';
import { useData } from '@/context/DataContext';

export default function ArtworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { currentUser, artworks, toggleLikeArtwork, addCommentToArtwork, editCommentInArtwork, deleteCommentFromArtwork, addArtworkReport } = useData();

  const [isMounted, setIsMounted] = useState(false);

  const artwork = artworks.find((item) => item.id === id);

  const [likesCount, setLikesCount] = useState(artwork?.likesCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showToast, setShowToast] = useState('');
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);
  const [editContent, setEditContent] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (artwork) {
      setLikesCount(artwork.likesCount || 0);
    }
  }, [artwork?.likesCount]);

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
    // Allow edit if created within 10 minutes (600,000 ms)
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
    toggleLikeArtwork(artwork.id);
    if (isLiked) {
      setLikesCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setIsLiked(true);
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
    if (artwork.downloadUrl && artwork.downloadUrl !== '#' && artwork.downloadUrl !== '') {
      let finalUrl = artwork.downloadUrl;

      // Google Drive Link Bypass Logic
      const driveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)\/(?:view|edit)/;
      const driveMatch = artwork.downloadUrl.match(driveRegex);
      
      if (driveMatch && driveMatch[1]) {
        const fileId = driveMatch[1];
        finalUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        triggerToast(`Mengunduh file langsung dari Google Drive...`);
        
        // Quietly trigger download in the same tab (no new window/tab)
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
      // Fallback direct download link for local image preview
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
    await addCommentToArtwork(artwork.id, newComment);
    setNewComment('');
    triggerToast('Komentar berhasil dikirim!');
  };

  const relatedArtworks = artworks.filter((item) => item.id !== artwork.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6">
      {/* Toast Banner */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Header */}
      <Header />

      {/* Main Container (Scaled ~10% smaller with max-w-5xl) */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-5">
        
        {/* Top Back Nav Button */}
        <div className="mb-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#F26522] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Galeri</span>
          </button>
        </div>

        {/* 📷 INSTAGRAM DESKTOP-STYLE 2-COLUMN POST CARD */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-start">
          
          {/* LEFT SIDE: 100% Full Natural Uncropped Image */}
          <div className="lg:col-span-7 bg-[#111827] relative p-0 w-full flex items-center justify-center">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-full h-auto block max-h-[75vh] object-contain"
            />
            {/* Category Badge Overlay */}
            <div className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded-lg tracking-wider">
              {artwork.category}
            </div>
          </div>

          {/* RIGHT SIDE: Author Info, Description, Actions & Scrollable Comments */}
          <div className="lg:col-span-5 p-4 sm:p-5 lg:p-6 flex flex-col justify-between bg-white self-stretch border-t lg:border-t-0 lg:border-l border-gray-100">
            
            {/* Header: Author Profile Info */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Link href={`/creators/${artwork.author.id || 'admin'}`}>
                    <img
                      src={artwork.author.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200'}
                      alt={artwork.author.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-100 shadow-sm hover:ring-[#F26522] transition-all"
                    />
                  </Link>
                  <div>
                    <Link href={`/creators/${artwork.author.id || 'admin'}`}>
                      <h2 className="text-sm font-extrabold text-gray-900 leading-snug hover:text-[#F26522] transition-colors">
                        {artwork.author.name}
                      </h2>
                    </Link>
                    <p className="text-xs text-gray-500 font-medium">
                      {artwork.author.region} • Format {artwork.format || 'PSD/AI'}
                    </p>
                  </div>
                </div>

                {/* More Options Dropdown */}
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
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="py-4 border-b border-gray-100">
                <h1 className="text-lg font-black text-gray-900 leading-tight mb-2">
                  {artwork.title}
                </h1>
                <p className="text-xs text-gray-600 leading-relaxed font-normal bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {artwork.description}
                </p>
              </div>
            </div>

            {/* Middle: Scrollable Comments Section */}
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
                      <Link href={`/creators/${author.id || 'admin'}`}>
                        <img
                          src={author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                          alt={author.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 hover:ring-1 hover:ring-[#F26522] transition-all"
                        />
                      </Link>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link href={`/creators/${author.id || 'admin'}`}>
                              <span className="font-bold text-gray-900 hover:text-[#F26522] transition-colors">{author.name} - {author.region}</span>
                            </Link>
                            {comment.isEdited && (
                              <span className="text-[10px] text-gray-400 font-normal italic">(disunting)</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">{time}</span>

                            {/* Comment Edit & Delete Controls */}
                            <div className="flex items-center gap-1">
                              {canEditComment(comment) && !isEditingThis && (
                                <button
                                  onClick={() => handleStartEdit(comment)}
                                  className="text-gray-400 hover:text-[#F26522] transition-colors p-0.5"
                                  title="Edit Komentar (Maks 1 Menit)"
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

                        {/* Comment Content or Edit Form */}
                        {isEditingThis ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              value={editContent}
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
                          <p className="text-gray-700 mt-1 leading-normal whitespace-pre-wrap break-words">{content}</p>
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

            {/* Bottom Actions & Input Form */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              
              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment(e as unknown as React.FormEvent);
                    }
                  }}
                  placeholder="Tulis komentar..."
                  className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 font-semibold rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#F26522] focus:bg-white transition-all resize-none min-h-[36px] overflow-hidden"
                  rows={2}
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-[#F26522] text-white rounded-xl font-bold text-xs hover:bg-[#d85417] transition-all flex items-center gap-1 shrink-0"
                >
                  <Send size={14} />
                  <span>Kirim</span>
                </button>
              </form>

              {/* Action Buttons Row: Sukai, Simpan, Bagikan */}
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

              {/* Primary Download CTA Button ("Unduh" saja) */}
              <button
                onClick={handleDownloadTemplate}
                className="w-full py-3 px-5 bg-[#F26522] hover:bg-[#d95416] active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} />
                <span>
                  {!artwork.format
                    ? 'Unduh Gambar (JPG)'
                    : artwork.downloadUrl && artwork.downloadUrl.toLowerCase().includes('canva.com')
                    ? 'Buka di Canva'
                    : artwork.downloadUrl && artwork.downloadUrl !== '#' && artwork.downloadUrl !== ''
                    ? `Unduh File Master (${artwork.format})`
                    : `Unduh Gambar (${artwork.format} Preview)`}
                </span>
              </button>
            </div>

          </div>
        </div>

        {/* Desain & Artwork Terkait (Masonry Natural Height) */}
        <div className="mt-10">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Desain & Artwork Terkait</h3>
          <div className="columns-1 sm:columns-2 lg:columns-4 gap-4 space-y-4">
            {relatedArtworks.map((item: any) => (
              <ArtworkCard key={item.id} artwork={item} />
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <Footer />

      {/* Custom Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingCommentId)}
        title="Hapus Komentar?"
        message="Apakah Anda yakin ingin menghapus komentar ini? Komentar yang telah dihapus tidak dapat dikembalikan."
        confirmLabel="Ya, Hapus"
        onConfirm={confirmDeleteComment}
        onCancel={() => setDeletingCommentId(null)}
      />
      {/* Share Modal */}
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={shareUrl} 
        title={artwork.title} 
      />
    </div>
  );
}
