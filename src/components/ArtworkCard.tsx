'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageSquare, Download } from 'lucide-react';
import { Artwork } from '@/lib/types';

interface ArtworkCardProps {
  artwork: Artwork;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork }) => {
  const [likes, setLikes] = useState(artwork.likesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [imgSrc, setImgSrc] = useState(artwork.imageUrl);

  const fallbackImage = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="100%" height="100%" fill="%23F26522"/><circle cx="300" cy="350" r="120" fill="white" opacity="0.2"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="sans-serif" font-size="36" font-weight="bold">PKSart Official</text><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="sans-serif" font-size="20" opacity="0.9">${encodeURIComponent(artwork.title)}</text></svg>`;

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200 flex flex-col mb-4 break-inside-avoid">
      {/* Thumbnail Area - 100% Natural Original Ratio (0% Cropping) */}
      <Link href={`/artwork/${artwork.id}`} className="relative block w-full overflow-hidden bg-gray-50">
        <div className="relative w-full overflow-hidden">
          <img
            src={imgSrc}
            alt={artwork.title}
            onError={() => setImgSrc(fallbackImage)}
            className="w-full h-auto object-contain block group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Category Badge overlay */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
            {artwork.category}
          </div>
        </div>
      </Link>

      {/* Card Footer Info */}
      <div className="p-3.5 flex items-center justify-between gap-2 bg-white">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Creator Avatar */}
          <img
            src={artwork.author.avatar}
            alt={artwork.author.name}
            className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-gray-200"
          />

          <div className="min-w-0 flex flex-col">
            {/* Creator Name & Province */}
            <Link 
              href={`/artwork/${artwork.id}`}
              className="text-xs font-bold text-gray-900 truncate hover:text-[#F26522] transition-colors"
            >
              {artwork.author.name} - {artwork.author.region}
            </Link>

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

        {/* Download Icon Button */}
        <button
          onClick={handleDownload}
          className="p-2 text-gray-600 hover:text-[#F26522] hover:bg-orange-50 rounded-lg transition-colors shrink-0"
          title="Unduh Design Template"
        >
          <Download size={18} />
        </button>
      </div>
    </div>
  );
};
