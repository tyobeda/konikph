'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageSquare, Download, MoreVertical, Share2, Flag, Edit } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Artwork } from '@/lib/types';
import { ShareModal } from './ShareModal';

interface ArtworkCardProps {
  artwork: Artwork;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork }) => {
  const { currentUser, addArtworkReport, toggleLikeArtwork, updateArtwork } = useData();
  const userLiked = Boolean(
    currentUser && artwork.likedUserIds && artwork.likedUserIds.includes(currentUser.id)
  );

  const [likes, setLikes] = useState(artwork.likesCount);
  const [isLiked, setIsLiked] = useState(userLiked);
  const [imgSrc, setImgSrc] = useState(artwork.imageUrl);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitleInput, setEditTitleInput] = useState(artwork.title);
  const [editDescInput, setEditDescInput] = useState(artwork.description || '');
  const [editCategoryInput, setEditCategoryInput] = useState(artwork.category);
  const [editFormatInput, setEditFormatInput] = useState(artwork.format || 'Hanya gambar');
  const [editDownloadUrlInput, setEditDownloadUrlInput] = useState(artwork.downloadUrl || '');

  const handleOpenEditModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(false);
    setEditTitleInput(artwork.title);
    setEditDescInput(artwork.description || '');
    setEditCategoryInput(artwork.category);
    setEditFormatInput(artwork.format || 'Hanya gambar');
    setEditDownloadUrlInput(artwork.downloadUrl || '');
    setIsEditModalOpen(true);
  };

  const handleSaveArtworkEdit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const hashtagsFromDesc = (editDescInput.match(/#[a-zA-Z0-9_-]+/g) || []).map((t) => t.trim());
    const parsedTags = Array.from(new Set(hashtagsFromDesc));

    updateArtwork(artwork.id, {
      title: editTitleInput,
      description: editDescInput,
      category: editCategoryInput,
      format: editFormatInput,
      downloadUrl: editDownloadUrlInput,
      tags: parsedTags,
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
      (artwork.author?.name && artwork.author.name === currentUser.name) ||
      currentUser.role === 'Super Admin'
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
    alert(`Mengunduh karya "${artwork.title}" format (${artwork.format || 'PSD/AI'})...`);
  };

  const [isImgLoaded, setIsImgLoaded] = useState(false);

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200 flex flex-col mb-4 break-inside-avoid">
      {/* Thumbnail Area - 100% Natural Original Ratio (0% Cropping) */}
      <Link href={artworkPath} className="relative block w-full overflow-hidden rounded-t-xl bg-gray-50">
        <div className="relative w-full overflow-hidden">
          {/* Subtle loading placeholder background that matches masonry height */}
          {!isImgLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}
          <img
            src={imgSrc}
            alt={artwork.title}
            onLoad={() => setIsImgLoaded(true)}
            onError={() => {
              setImgSrc(fallbackImage);
              setIsImgLoaded(true);
            }}
            className={`w-full h-auto object-contain block group-hover:scale-[1.02] transition-all duration-300 ${
              isImgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            loading="lazy"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Category & Tags Badge overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[85%] z-10">
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
      </Link>

      {/* Card Footer Info */}
      <div className="p-3.5 flex items-center justify-between gap-2 bg-white">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Creator Avatar Link */}
          <Link href={`/creators/${artwork.author.id || 'admin'}`}>
            <img
              src={artwork.author.avatar}
              alt={artwork.author.name}
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-gray-200 hover:ring-[#F26522] transition-all"
            />
          </Link>

          <div className="min-w-0 flex flex-col">
            {/* Creator Name & Province Link to Creator Profile */}
            <Link 
              href={`/creators/${artwork.author.id || 'admin'}`}
              className="text-xs font-bold text-gray-900 truncate hover:text-[#F26522] transition-colors"
            >
              {artwork.author.name} - {artwork.author.region}
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
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditModalOpen(false); }}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 cursor-default max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-extrabold text-gray-900 mb-5">
              Edit Postingan Karya
            </h3>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  </select>
                </div>
              </div>

              <div>
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
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditModalOpen(false); }}
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
  );
};
