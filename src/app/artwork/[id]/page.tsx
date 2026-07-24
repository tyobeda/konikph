'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Header } from '@/components/Header';
import { USERS } from '@/lib/data';
import { ArtworkCard } from '@/components/ArtworkCard';
import { useData } from '@/context/DataContext';

export default function ArtworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { artworks } = useData();

  // Find artwork or default to first item
  const artwork =
    artworks.find((item) => item.id === id) || artworks[0] || {
      id: 'default',
      title: 'Poster PKS Official',
      description: 'Deskripsi poster pks',
      imageUrl: '/img/1315216787313421.jpg',
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        
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

        {/* 📷 INSTAGRAM DESKTOP-STYLE 2-COLUMN POST CARD */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* LEFT SIDE: 100% Uncropped Full Natural Height Image Display */}
          <div className="lg:col-span-7 bg-[#F1F3F5] flex items-center justify-center p-3 sm:p-6 relative overflow-hidden min-h-[400px] lg:min-h-[560px]">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-full h-auto max-h-[82vh] object-contain rounded-2xl shadow-md"
            />
            {/* Category Badge overlay */}
            <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
              {artwork.category}
            </div>
          </div>

          {/* RIGHT SIDE: Author Info, Description, Actions & Scrollable Comments */}
          <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between bg-white border-t lg:border-t-0 lg:border-l border-gray-100">
            
            {/* Header: Author Profile Info */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <img
                    src={artwork.author.avatar}
                    alt={artwork.author.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-100 shadow-sm"
                  />
                  <div>
                    <h2 className="text-sm font-extrabold text-gray-900 leading-snug">
                      {artwork.author.name}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                      {artwork.author.region} • Format {artwork.format || 'PSD/AI'}
                    </p>
                  </div>
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
            <div className="flex-1 py-4 overflow-y-auto max-h-[260px] lg:max-h-[320px] space-y-3 pr-1 my-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <MessageSquare size={14} className="text-[#F26522]" />
                <span>Komentar ({comments.length})</span>
              </h3>

              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                  <img
                    src={comment.avatar}
                    alt={comment.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{comment.name} - {comment.region}</span>
                      <span className="text-[10px] text-gray-400">{comment.time}</span>
                    </div>
                    <p className="text-gray-700 mt-1 leading-normal">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions & Input Form */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              
              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tulis komentar..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#F26522] focus:bg-white transition-all"
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
                <span>Unduh</span>
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
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-500 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} PKSart. Gallery Design & Photos PKS Official.</p>
        </div>
      </footer>
    </div>
  );
}
