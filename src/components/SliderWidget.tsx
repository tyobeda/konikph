'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, ExternalLink, Image as ImageIcon } from 'lucide-react';

export type SliderEffect =
  | 'fade'
  | 'blur-fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'push-left'
  | 'push-right'
  | 'push-up'
  | 'push-down'
  | 'ken-burns'
  | 'zoom-in'
  | 'flip-3d'
  | 'cube-3d'
  | 'glass-swipe';

export interface SlideItem {
  imageUrl: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  caption?: string;
}

export interface SliderWidgetProps {
  slides?: SlideItem[];
  sliderImages?: string[];
  sliderEffect?: SliderEffect;
  sliderAutoplay?: boolean;
  sliderInterval?: number; // in milliseconds (e.g. 5000)
  sliderAspectRatio?: '16:9' | '4:3' | '1:1' | '21:9' | '3:2' | 'auto';
  sliderHeight?: 'small' | 'medium' | 'large' | 'auto';
  sliderShowDots?: boolean;
  sliderShowArrows?: boolean;
  sliderBorderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  sliderOverlay?: 'none' | 'dark' | 'gradient' | 'light';
  isEditable?: boolean;
  onSelectImage?: () => void;
}

export const SLIDER_EFFECT_OPTIONS: { id: SliderEffect; label: string; group: string; desc: string }[] = [
  // Fades
  { id: 'fade', label: 'Fade (Pudar Halus)', group: 'Fade', desc: 'Pudar transisi halus antar slide' },
  { id: 'blur-fade', label: 'Blur Fade (Pudar Kabur)', group: 'Fade', desc: 'Efek blur sinematik sebelum fokus' },
  
  // Slides (Overlap)
  { id: 'slide-left', label: 'Slide Kiri (Slide Left)', group: 'Slide (Geser Menimpa)', desc: 'Slide baru masuk dari kanan ke kiri' },
  { id: 'slide-right', label: 'Slide Kanan (Slide Right)', group: 'Slide (Geser Menimpa)', desc: 'Slide baru masuk dari kiri ke kanan' },
  { id: 'slide-up', label: 'Slide Atas (Slide Up)', group: 'Slide (Geser Menimpa)', desc: 'Slide baru naik dari bawah ke atas' },
  { id: 'slide-down', label: 'Slide Bawah (Slide Down)', group: 'Slide (Geser Menimpa)', desc: 'Slide baru turun dari atas ke bawah' },
  
  // Pushes (Carousel push)
  { id: 'push-left', label: 'Push Kiri (Push Left)', group: 'Push (Dorong Carousel)', desc: 'Slide lama didorong ke kiri oleh slide baru' },
  { id: 'push-right', label: 'Push Kanan (Push Right)', group: 'Push (Dorong Carousel)', desc: 'Slide lama didorong ke kanan oleh slide baru' },
  { id: 'push-up', label: 'Push Atas (Push Up)', group: 'Push (Dorong Carousel)', desc: 'Slide lama didorong ke atas oleh slide baru' },
  { id: 'push-down', label: 'Push Bawah (Push Down)', group: 'Push (Dorong Carousel)', desc: 'Slide lama didorong ke bawah oleh slide baru' },
  
  // Creative Kreasi
  { id: 'ken-burns', label: 'Ken Burns (Sinematik Zoom & Pan)', group: 'Kreasi Eksklusif', desc: 'Efek kamera sinematik bergerak lambat' },
  { id: 'zoom-in', label: 'Zoom In (Pemberesan Skala)', group: 'Kreasi Eksklusif', desc: 'Gambar membesar lembut dari kejauhan' },
  { id: 'flip-3d', label: '3D Flip (Putar Kartu)', group: 'Kreasi Eksklusif', desc: 'Efek rotasi 3D membalik seperti kartu' },
  { id: 'cube-3d', label: '3D Cube (Kubus Putar)', group: 'Kreasi Eksklusif', desc: 'Rotasi perspektif 3D ruang kubus' },
  { id: 'glass-swipe', label: 'Glass Swipe (Kilau Kaca)', group: 'Kreasi Eksklusif', desc: 'Sapuan kilau efek kaca modern' },
];

export default function SliderWidget({
  slides: rawSlides,
  sliderImages,
  sliderEffect = 'fade',
  sliderAutoplay = true,
  sliderInterval = 5000,
  sliderAspectRatio = '16:9',
  sliderHeight = 'medium',
  sliderShowDots = true,
  sliderShowArrows = true,
  sliderBorderRadius = '2xl',
  sliderOverlay = 'gradient',
  isEditable = false,
  onSelectImage,
}: SliderWidgetProps) {
  // Normalize items to SlideItem array
  const items: SlideItem[] = React.useMemo(() => {
    if (rawSlides && rawSlides.length > 0) return rawSlides;
    if (sliderImages && sliderImages.length > 0) {
      return sliderImages.map((img) => ({ imageUrl: img }));
    }
    return [];
  }, [rawSlides, sliderImages]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = items.length;

  // Auto-clamp currentIndex when items change (e.g. after slide deletion)
  useEffect(() => {
    if (total === 0) {
      setCurrentIndex(0);
      setPrevIndex(null);
    } else if (currentIndex >= total) {
      setCurrentIndex(total - 1);
      setPrevIndex(null);
    }
  }, [total, currentIndex]);

  // Wrap around index safely
  const goToSlide = useCallback((targetIndex: number, forcedDirection?: 'next' | 'prev') => {
    if (total <= 1 || isTransitioning) return;
    const nextIdx = (targetIndex + total) % total;
    if (nextIdx === currentIndex) return;

    const dir = forcedDirection || (nextIdx > currentIndex ? 'next' : 'prev');
    setDirection(dir);
    setPrevIndex(currentIndex);
    setCurrentIndex(nextIdx);
    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
      setPrevIndex(null);
    }, 700);

    return () => clearTimeout(timer);
  }, [currentIndex, total, isTransitioning]);

  const handleNext = useCallback(() => {
    goToSlide(currentIndex + 1, 'next');
  }, [currentIndex, goToSlide]);

  const handlePrev = useCallback(() => {
    goToSlide(currentIndex - 1, 'prev');
  }, [currentIndex, goToSlide]);

  // Autoplay loop
  useEffect(() => {
    if (!sliderAutoplay || isPaused || total <= 1) return;
    const intervalTime = Math.max(2000, sliderInterval || 5000);
    const timer = setInterval(() => {
      handleNext();
    }, intervalTime);
    return () => clearInterval(timer);
  }, [sliderAutoplay, isPaused, total, sliderInterval, handleNext]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Border radius map
  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    '2xl': 'rounded-3xl',
    '3xl': 'rounded-[2rem]',
  }[sliderBorderRadius || '2xl'] || 'rounded-3xl';

  // Height / Aspect ratio styles
  const aspectClass = {
    '16:9': 'aspect-16/9',
    '4:3': 'aspect-4/3',
    '1:1': 'aspect-square',
    '21:9': 'aspect-21/9',
    '3:2': 'aspect-3/2',
    auto: '',
  }[sliderAspectRatio || '16:9'];

  const heightClass = sliderAspectRatio === 'auto'
    ? {
        small: 'h-64 sm:h-80',
        medium: 'h-80 sm:h-[420px]',
        large: 'h-[400px] sm:h-[560px]',
        auto: 'min-h-[300px]',
      }[sliderHeight || 'medium']
    : '';

  // Empty state fallback
  if (total === 0) {
    return (
      <div
        className={`w-full border-2 border-dashed border-gray-200 bg-linear-to-b from-gray-50/80 to-gray-100/60 p-10 flex flex-col items-center justify-center text-center gap-3 shadow-xs ${roundedClass}`}
      >
        <div className="w-14 h-14 rounded-2xl bg-orange-100/70 text-[#F26522] flex items-center justify-center shadow-inner">
          <ImageIcon size={28} />
        </div>
        <div className="max-w-md space-y-1">
          <h4 className="text-sm font-bold text-gray-800">Slider Gambar Kosong</h4>
          <p className="text-xs text-gray-500">
            Tambahkan minimal 1 gambar atau slide melalui panel konfigurasi di sebelah kiri.
          </p>
        </div>
        {isEditable && onSelectImage && (
          <button
            type="button"
            onClick={onSelectImage}
            className="mt-2 px-4 py-2 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <ImageIcon size={14} />
            <span>Pilih Gambar Slider</span>
          </button>
        )}
      </div>
    );
  }

  // Animation calculation for a given slide
  const getSlideStyle = (index: number): React.CSSProperties => {
    const isCurrent = index === currentIndex;
    const isPrevious = index === prevIndex;
    const isVisible = isCurrent || isPrevious;

    if (!isVisible) {
      return { display: 'none' };
    }

    const duration = '650ms';
    const ease = 'cubic-bezier(0.25, 1, 0.5, 1)';

    const base: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      willChange: 'transform, opacity, filter',
      transition: `transform ${duration} ${ease}, opacity ${duration} ${ease}, filter ${duration} ${ease}`,
      zIndex: isCurrent ? 20 : 10,
    };

    switch (sliderEffect) {
      // 1. FADE
      case 'fade':
        return {
          ...base,
          opacity: isCurrent ? 1 : 0,
          pointerEvents: isCurrent ? 'auto' : 'none',
        };

      // 2. BLUR FADE
      case 'blur-fade':
        return {
          ...base,
          opacity: isCurrent ? 1 : 0,
          filter: isCurrent ? 'blur(0px)' : 'blur(20px)',
          transform: isCurrent ? 'scale(1)' : 'scale(1.04)',
          pointerEvents: isCurrent ? 'auto' : 'none',
        };

      // 3. SLIDE OVERLAP (LEFT)
      case 'slide-left':
        return {
          ...base,
          transform: isCurrent
            ? 'translateX(0%)'
            : isPrevious
            ? 'translateX(0%)'
            : 'translateX(100%)',
          zIndex: isCurrent ? 25 : 10,
          opacity: 1,
        };

      // 4. SLIDE OVERLAP (RIGHT)
      case 'slide-right':
        return {
          ...base,
          transform: isCurrent
            ? 'translateX(0%)'
            : isPrevious
            ? 'translateX(0%)'
            : 'translateX(-100%)',
          zIndex: isCurrent ? 25 : 10,
          opacity: 1,
        };

      // 5. SLIDE OVERLAP (UP)
      case 'slide-up':
        return {
          ...base,
          transform: isCurrent
            ? 'translateY(0%)'
            : isPrevious
            ? 'translateY(0%)'
            : 'translateY(100%)',
          zIndex: isCurrent ? 25 : 10,
          opacity: 1,
        };

      // 6. SLIDE OVERLAP (DOWN)
      case 'slide-down':
        return {
          ...base,
          transform: isCurrent
            ? 'translateY(0%)'
            : isPrevious
            ? 'translateY(0%)'
            : 'translateY(-100%)',
          zIndex: isCurrent ? 25 : 10,
          opacity: 1,
        };

      // 7. PUSH LEFT
      case 'push-left':
        return {
          ...base,
          transform: isCurrent
            ? 'translateX(0%)'
            : isPrevious
            ? 'translateX(-100%)'
            : 'translateX(100%)',
          opacity: 1,
        };

      // 8. PUSH RIGHT
      case 'push-right':
        return {
          ...base,
          transform: isCurrent
            ? 'translateX(0%)'
            : isPrevious
            ? 'translateX(100%)'
            : 'translateX(-100%)',
          opacity: 1,
        };

      // 9. PUSH UP
      case 'push-up':
        return {
          ...base,
          transform: isCurrent
            ? 'translateY(0%)'
            : isPrevious
            ? 'translateY(-100%)'
            : 'translateY(100%)',
          opacity: 1,
        };

      // 10. PUSH DOWN
      case 'push-down':
        return {
          ...base,
          transform: isCurrent
            ? 'translateY(0%)'
            : isPrevious
            ? 'translateY(100%)'
            : 'translateY(-100%)',
          opacity: 1,
        };

      // 11. KEN BURNS (CINEMATIC)
      case 'ken-burns':
        return {
          ...base,
          opacity: isCurrent ? 1 : 0,
          transform: isCurrent ? 'scale(1.12) translate(-1%, -1%)' : 'scale(1)',
          transition: `transform 7000ms ease-out, opacity 1000ms ease-in-out`,
        };

      // 12. ZOOM IN
      case 'zoom-in':
        return {
          ...base,
          opacity: isCurrent ? 1 : 0,
          transform: isCurrent ? 'scale(1)' : 'scale(0.85)',
        };

      // 13. 3D FLIP
      case 'flip-3d':
        return {
          ...base,
          transform: isCurrent ? 'rotateY(0deg)' : 'rotateY(90deg)',
          opacity: isCurrent ? 1 : 0,
          transformOrigin: direction === 'next' ? 'left center' : 'right center',
          backfaceVisibility: 'hidden',
        };

      // 14. 3D CUBE
      case 'cube-3d':
        return {
          ...base,
          transform: isCurrent
            ? 'rotateY(0deg) translateZ(0px)'
            : direction === 'next'
            ? 'rotateY(-90deg) translateZ(300px)'
            : 'rotateY(90deg) translateZ(300px)',
          opacity: isCurrent ? 1 : 0,
          transformOrigin: '50% 50% -250px',
        };

      // 15. GLASS SWIPE
      case 'glass-swipe':
        return {
          ...base,
          opacity: isCurrent ? 1 : 0,
          filter: isCurrent ? 'contrast(100%)' : 'contrast(120%) brightness(1.2)',
          transform: isCurrent ? 'translateX(0) scale(1)' : 'translateX(30px) scale(0.97)',
        };

      default:
        return {
          ...base,
          opacity: isCurrent ? 1 : 0,
        };
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden select-none bg-slate-900 group shadow-md ${roundedClass} ${aspectClass} ${heightClass}`}
      style={{ perspective: sliderEffect.includes('3d') || sliderEffect === 'cube-3d' ? '1200px' : undefined }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Viewport */}
      <div className="relative w-full h-full overflow-hidden">
        {items.map((slide, index) => {
          const isCurrent = index === currentIndex;
          const slideStyle = getSlideStyle(index);

          return (
            <div
              key={index}
              style={slideStyle}
              className="absolute inset-0 w-full h-full overflow-hidden"
            >
              {/* Slide Background Image */}
              <img
                src={slide.imageUrl}
                alt={slide.title || slide.caption || `Slide ${index + 1}`}
                className={`w-full h-full object-cover transition-all ${
                  sliderEffect === 'ken-burns' && isCurrent
                    ? 'scale-110 duration-7000 ease-out'
                    : ''
                }`}
                loading={index === 0 ? 'eager' : 'lazy'}
              />

              {/* Shimmer / Glass Refraction overlay for glass-swipe */}
              {sliderEffect === 'glass-swipe' && isCurrent && (
                <div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.2s_ease-in-out]"
                  style={{ pointerEvents: 'none' }}
                />
              )}

              {/* Overlay Gradients */}
              {sliderOverlay === 'gradient' && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              )}
              {sliderOverlay === 'dark' && (
                <div className="absolute inset-0 bg-black/50" />
              )}
              {sliderOverlay === 'light' && (
                <div className="absolute inset-0 bg-white/20" />
              )}

              {/* Slide Caption / Text Content */}
              {(slide.title || slide.subtitle || slide.ctaText || slide.caption) && (
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 text-white z-20 flex flex-col items-start gap-2 max-w-2xl">
                  {slide.title && (
                    <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md leading-snug">
                      {slide.title}
                    </h3>
                  )}
                  {slide.subtitle && (
                    <p className="text-xs sm:text-base text-gray-200 line-clamp-2 drop-shadow-sm font-medium">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.caption && !slide.subtitle && (
                    <p className="text-xs sm:text-sm text-gray-300 italic drop-shadow-xs">
                      {slide.caption}
                    </p>
                  )}
                  {slide.ctaText && (
                    <a
                      href={slide.ctaLink || '#'}
                      target={slide.ctaLink?.startsWith('http') ? '_blank' : '_self'}
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#F26522] hover:bg-[#d85417] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95"
                    >
                      <span>{slide.ctaText}</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Top Bar: Slide counter & Autoplay indicator */}
      {total > 1 && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white/90 border border-white/10 shadow-xs">
          <span>{currentIndex + 1}</span>
          <span className="text-white/40">/</span>
          <span>{total}</span>
          {sliderAutoplay && (
            <span className="ml-1 flex items-center">
              {isPaused ? (
                <Pause size={10} className="text-amber-400" />
              ) : (
                <Play size={10} className="text-emerald-400 animate-pulse" />
              )}
            </span>
          )}
        </div>
      )}

      {/* Navigation Arrows */}
      {sliderShowArrows && total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Slide Sebelumnya"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/35 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={20} className="stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Slide Selanjutnya"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/35 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight size={20} className="stroke-[2.5]" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {sliderShowDots && total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xs">
          {items.map((_, dotIdx) => {
            const isActive = dotIdx === currentIndex;
            return (
              <button
                key={dotIdx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(dotIdx);
                }}
                aria-label={`Ke slide ${dotIdx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? 'w-6 h-2 bg-white ring-2 ring-white/30'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
