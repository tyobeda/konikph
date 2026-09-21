'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselViewerProps {
  images: string[];
  altTitle: string;
  aspectRatioClassName?: string;
  autoSlide?: boolean;
  autoSlideInterval?: number;
  linkHref?: string;
  onIndexChange?: (index: number) => void;
}

export const CarouselViewer: React.FC<CarouselViewerProps> = ({
  images,
  altTitle,
  aspectRatioClassName = '',
  autoSlide = false,
  autoSlideInterval = 3500,
  linkHref,
  onIndexChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    onIndexChange?.(currentIndex);
  }, [currentIndex, onIndexChange]);

  useEffect(() => {
    if (images && images.length > 0 && currentIndex >= images.length) {
      setCurrentIndex(Math.max(0, images.length - 1));
    }
  }, [images, currentIndex]);

  // Mouse and Touch Pointer Drag Support (Only active if autoSlide is false / in detail view)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto slide interval timer for preview / homepage cards
  useEffect(() => {
    if (!autoSlide || !images || images.length <= 1) return;
    if (isHovered) return; // Pause auto slide on hover

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [autoSlide, autoSlideInterval, images, isHovered]);

  // Minimum swipe distance threshold in px
  const minSwipeDistance = 45;

  if (!images || images.length === 0) {
    return null;
  }

  const isSingle = images.length === 1;

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSingle || autoSlide) return;
    // Abaikan jika pointer mendarat di tombol navigasi atau dot
    if ((e.target as HTMLElement)?.closest('button')) {
      return;
    }
    // Hanya tanggapi primary pointer (left click mouse atau touch primer)
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    isHorizontalSwipeRef.current = null;
    setIsDragging(true);
    setDragOffset(0);

    // Tangkap pointer agar tetap terpantau meskipun mouse keluar jendela/container
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !pointerStartRef.current) return;

    const diffX = e.clientX - pointerStartRef.current.x;
    const diffY = e.clientY - pointerStartRef.current.y;

    // Deteksi arah geser pertama kali untuk membedakan scroll halaman vs swipe carousel
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        isHorizontalSwipeRef.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalSwipeRef.current === true) {
      // Tahan resistansi jika di batas awal / akhir
      let currentOffset = diffX;
      if (
        (currentIndex === 0 && diffX > 0) ||
        (currentIndex === images.length - 1 && diffX < 0)
      ) {
        currentOffset = diffX * 0.35; // Resistansi karet
      }
      setDragOffset(currentOffset);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}

    if (isHorizontalSwipeRef.current === true) {
      if (dragOffset < -minSwipeDistance) {
        handleNext();
      } else if (dragOffset > minSwipeDistance) {
        handlePrev();
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    pointerStartRef.current = null;
    isHorizontalSwipeRef.current = null;
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}
    setIsDragging(false);
    setDragOffset(0);
    pointerStartRef.current = null;
    isHorizontalSwipeRef.current = null;
  };

  // Easing rule:
  // - Dragging: 'none' (mengikuti mouse/jari secara instan)
  // - AutoSlide (homepage/card): 'transform 750ms cubic-bezier(0.76, 0, 0.24, 1)' (easeInOutQuart mewah)
  // - Manual / Swipe (detail artwork): 'transform 300ms ease-out' (responsif & natural, tanpa easeInOutQuart)
  const transitionStyle = isDragging
    ? 'none'
    : autoSlide
    ? 'transform 750ms cubic-bezier(0.76, 0, 0.24, 1)'
    : 'transform 300ms ease-out';

  const imageSlider = (
    <div
      className="flex w-full will-change-transform"
      style={{
        transition: transitionStyle,
        transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
      }}
    >
      {images.map((url, idx) => (
        <div key={idx} className="w-full shrink-0 relative bg-gray-50 flex items-center justify-center pointer-events-none">
          <img
            src={url}
            alt={`${altTitle} - Halaman ${idx + 1}`}
            draggable={false}
            className={`w-full h-auto object-contain block max-h-[85vh] select-none pointer-events-none transition-transform duration-300 ${
              autoSlide ? 'group-hover:scale-[1.02]' : ''
            } ${aspectRatioClassName}`}
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden group select-none ${
        autoSlide
          ? ''
          : isSingle
          ? ''
          : isDragging
          ? 'cursor-grabbing touch-none'
          : 'cursor-grab touch-pan-y'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* If linkHref is provided, only wrap image slider so controls remain clickable */}
      {linkHref ? (
        <Link href={linkHref} className="block w-full h-full cursor-pointer">
          {imageSlider}
        </Link>
      ) : (
        imageSlider
      )}

      {/* Multi-image Badge overlay top-right */}
      {!isSingle && (
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center z-10 shadow-sm pointer-events-none">
          <span>{currentIndex + 1} / {images.length}</span>
        </div>
      )}

      {/* Left/Right Navigation Arrows for Manual / Detail View Users */}
      {!isSingle && !autoSlide && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/65 hover:bg-black/85 text-white flex items-center justify-center transition-all z-30 shadow-md active:scale-90 cursor-pointer backdrop-blur-xs select-none pointer-events-auto"
            title="Slide Sebelumnya"
            aria-label="Slide Sebelumnya"
          >
            <ChevronLeft size={22} className="stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/65 hover:bg-black/85 text-white flex items-center justify-center transition-all z-30 shadow-md active:scale-90 cursor-pointer backdrop-blur-xs select-none pointer-events-auto"
            title="Slide Selanjutnya"
            aria-label="Slide Selanjutnya"
          >
            <ChevronRight size={22} className="stroke-[2.5]" />
          </button>
        </>
      )}

      {/* Mini hover navigation arrows for Home & Explore cards */}
      {!isSingle && autoSlide && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePrev();
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all z-30 shadow-md active:scale-90 cursor-pointer backdrop-blur-xs opacity-0 group-hover:opacity-100 pointer-events-auto"
            title="Slide Sebelumnya"
            aria-label="Slide Sebelumnya"
          >
            <ChevronLeft size={16} className="stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext();
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all z-30 shadow-md active:scale-90 cursor-pointer backdrop-blur-xs opacity-0 group-hover:opacity-100 pointer-events-auto"
            title="Slide Selanjutnya"
            aria-label="Slide Selanjutnya"
          >
            <ChevronRight size={16} className="stroke-[2.5]" />
          </button>
        </>
      )}

      {/* Round Dot Page Indicators Bottom */}
      {!isSingle && (
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full pointer-events-auto shadow-sm"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`transition-all cursor-pointer p-0.5 pointer-events-auto ${
                currentIndex === idx
                  ? 'w-4 h-2 bg-[#F26522] rounded-full scale-105'
                  : 'w-2 h-2 bg-white/60 hover:bg-white rounded-full hover:scale-125'
              }`}
              title={`Buka Halaman ${idx + 1}`}
              aria-label={`Buka Halaman ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
