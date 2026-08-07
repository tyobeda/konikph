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
  const { currentUser, addArtworkReport, toggleLikeArtwork } = useData();
  const [likes, setLikes] = useState(artwork.likesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [imgSrc, setImgSrc] = useState(artwork.imageUrl);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    }
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
                <Link
                  href={artworkPath}
                  onClick={(e) => { e.stopPropagation(); setShowDropdown(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-2.5 text-blue-600 font-bold transition-colors"
                >
                  <Edit size={15} /> <span className="text-xs">Edit Artwork</span>
                </Link>
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
      />
    </div>
  );
};
