'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Heart,
  Bookmark,
  Award,
  Share2,
  CheckCircle,
  MessageSquare,
  Send,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { USERS } from '@/lib/data';
import { ArtworkCard } from '@/components/ArtworkCard';
import { useData } from '@/context/DataContext';

export default function ArtworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { artworks, toggleLikeArtwork, incrementDownloadCount, addCommentToArtwork } = useData();

  // Find artwork or default to first item
  const artwork =
    artworks.find((item) => item.id === id) || artworks[0] || {
      id: 'default',
      title: 'Poster PKS Official',
      description: 'Deskripsi poster pks',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
      category: 'Poster',
      region: 'Nasional',
      likesCount: 120,
      commentsCount: 15,
      downloadsCount: 450,
      author: {
        id: 'u1',
        name: 'Kreator PKS',
        email: 'kreator@pks.id',
        phone: '081234567890',
        address: 'Jakarta',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        region: 'Nasional',
      },
      createdAt: '2026-07-20',
    };

  const [likesCount, setLikesCount] = useState(artwork.likesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [stampsCount, setStampsCount] = useState(artwork.stampsCount || 42);
  const [hasStamped, setHasStamped] = useState(false);
  const [showToast, setShowToast] = useState('');

  const [comments, setComments] = useState([
    {
      id: 'c1',
      name: 'Lita',
      region: 'DIY',
      text: 'Desainnya sangat menarik dan mudah diedit. Sukses selalu!',
      time: '2 jam lalu',
      avatar: USERS.lita_diy.avatar,
    },
    {
      id: 'c2',
      name: 'Roni',
      region: 'Sumut',
      text: 'Izin unduh untuk publikasi DPD daerah ya kang. Terima kasih!',
      time: '5 jam lalu',
      avatar: USERS.roni_sumut.avatar,
    },
  ]);
  const [newComment, setNewComment] = useState('');

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 3000);
  };

  const handleLikeToggle = () => {
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

  const handleStampToggle = () => {
    if (hasStamped) {
      setStampsCount((prev) => prev - 1);
      setHasStamped(false);
    } else {
      setStampsCount((prev) => prev + 1);
      setHasStamped(true);
      triggerToast('Stempel PKS Official diberikan!');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: artwork.title,
        text: `Lihat desain ${artwork.title} di PKSart`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      triggerToast('Tautan berhasil disalin ke clipboard!');
    }
  };

  const handleDownloadTemplate = () => {
    triggerToast(`Mengunduh file ${artwork.format || 'PSD/AI/CDR'}...`);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now().toString(),
        name: 'Roni',
        region: 'Sumut',
        text: newComment,
        time: 'Baru saja',
        avatar: USERS.roni_sumut.avatar,
      },
    ]);
    setNewComment('');
    triggerToast('Komentar ditambahkan!');
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

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8">
        
        {/* Top Back Nav Button */}
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#F26522] transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Kembali ke Galeri</span>
          </button>
        </div>

        {/* Main Card View matching mobile screenshot layout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Image Display Container with Watermarks */}
          <div className="relative w-full bg-gradient-to-b from-orange-500 to-orange-600 flex items-center justify-center min-h-[380px] sm:min-h-[480px]">
            
            {/* Stamp / Watermark Text Overlays */}
            <div className="absolute top-4 left-4 text-white/30 text-xs sm:text-sm font-black tracking-widest pointer-events-none select-none">
              Stamp<br />
              <span className="text-[10px]">PKSart Official</span>
            </div>
            <div className="absolute top-4 right-16 text-white/30 text-xs sm:text-sm font-black tracking-widest pointer-events-none select-none text-right">
              Stamp<br />
              <span className="text-[10px]">PKSart Official</span>
            </div>

            {/* PKS Official Logo Badge Top Right */}
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white p-1 shadow-md flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-[#F26522] flex items-center justify-center text-white font-bold text-xs">
                PKS
              </div>
            </div>

            {/* Main Poster / Image Artwork */}
            <div className="relative max-w-md w-full px-6 py-8 flex flex-col items-center">
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-2xl"
              />

              {/* Title Bar Banner underneath image */}
              <div className="w-full bg-[#1e293b]/90 backdrop-blur-md text-white text-center py-2.5 px-4 rounded-b-xl text-xs sm:text-sm font-bold uppercase tracking-wider mt-[-6px] shadow-lg">
                {artwork.title}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-5 sm:p-7 space-y-6">
            
            {/* Author Profile Info */}
            <div className="flex items-center gap-3.5">
              <img
                src={artwork.author.avatar}
                alt={artwork.author.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-100 shadow-sm"
              />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                  {artwork.author.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  {artwork.author.region}
                </p>
              </div>
            </div>

            {/* Description Text */}
            <div className="text-sm text-gray-700 leading-relaxed font-normal bg-gray-50/70 p-4 rounded-xl border border-gray-100">
              <p>{artwork.description}</p>
            </div>

            {/* Large Primary Download CTA Button */}
            <button
              onClick={handleDownloadTemplate}
              className="w-full py-3.5 px-6 bg-[#F26522] hover:bg-[#d95416] active:scale-[0.99] text-white text-sm sm:text-base font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Download size={20} />
              <span>Unduh Template (+{artwork.format || 'PSD/AI/CDR'})</span>
            </button>

            {/* Action Bar Buttons Row (Matching screenshot: Sukai, Simpan, Beri Stempel, Bagikan) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              
              {/* Sukai */}
              <button
                onClick={handleLikeToggle}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  isLiked
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Heart size={16} className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
                <span>Sukai ({likesCount})</span>
              </button>

              {/* Simpan */}
              <button
                onClick={handleSaveToggle}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  isSaved
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Bookmark size={16} className={isSaved ? 'fill-amber-500 text-amber-500' : 'text-gray-500'} />
                <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
              </button>

              {/* Beri Stempel */}
              <button
                onClick={handleStampToggle}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  hasStamped
                    ? 'bg-orange-50 text-[#F26522] border-orange-200'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Award size={16} className={hasStamped ? 'text-[#F26522]' : 'text-gray-500'} />
                <span>Beri Stempel ({stampsCount})</span>
              </button>

              {/* Bagikan */}
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-semibold transition-all"
              >
                <Share2 size={16} className="text-gray-500" />
                <span>Bagikan</span>
              </button>
            </div>

            {/* Comments Section */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                <MessageSquare size={18} className="text-[#F26522]" />
                <span>Komentar ({comments.length})</span>
              </h3>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tulis komentar atau apresiasi..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#F26522] text-white rounded-xl font-semibold text-sm hover:bg-[#d85417] transition-all flex items-center gap-1.5"
                >
                  <Send size={16} />
                  <span>Kirim</span>
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                    <img
                      src={comment.avatar}
                      alt={comment.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 text-xs sm:text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{comment.name} - {comment.region}</span>
                        <span className="text-[11px] text-gray-400">{comment.time}</span>
                      </div>
                      <p className="text-gray-700 mt-1">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Related Artworks */}
        <div className="mt-10">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Desain & Artwork Terkait</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedArtworks.map((item: any) => (
              <ArtworkCard key={item.id} artwork={item} />
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-500 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} PKSart. Gallery Design & Photos PKS Official.</p>
        </div>
      </footer>
    </div>
  );
}
