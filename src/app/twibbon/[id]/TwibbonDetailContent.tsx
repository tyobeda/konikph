'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, Download, Sparkles, Image as ImageIcon, Loader2, Share2, Heart, Layers, Maximize2, CheckCircle, Link as LinkIcon } from 'lucide-react';
import { Header } from '@/components/Header';
import { ShareModal } from '@/components/ShareModal';
import { useData } from '@/context/DataContext';
import { getUserTwibbonFavorites, toggleTwibbonFavorite, getRecentTwibbonUsages, getTwibbonBySlugOrId } from '@/actions/twibbon';
import { getAspectRatioMeta } from '@/components/TwibbonAspectRatioSelector';

interface TwibbonDetailContentProps {
  initialTwibbon?: any | null;
}

export default function TwibbonDetailContent({ initialTwibbon }: TwibbonDetailContentProps = {}) {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { twibbons, updateTwibbon, currentUser, isTwibbonsLoaded } = useData();

  const [fetchedTwibbon, setFetchedTwibbon] = useState<any | null>(initialTwibbon || null);

  useEffect(() => {
    if (!initialTwibbon && id) {
      getTwibbonBySlugOrId(id).then((res) => {
        if (res && res.success && res.data) {
          setFetchedTwibbon(res.data);
        }
      });
    }
  }, [id, initialTwibbon]);

  const activeTwibbon = initialTwibbon || fetchedTwibbon || twibbons.find((t) => t.id === id || t.slug === id);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchPinchStart, setTouchPinchStart] = useState<{
    dist: number;
    angle: number;
    initialScale: number;
    initialRotation: number;
  } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [showShareToast, setShowShareToast] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentThumbnails, setRecentThumbnails] = useState<string[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const handleCanvasClick = () => {
    if (!photoUrl && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const userId = currentUser?.id || 'superadmin_1';

  // Extract all frame variants from this twibbon post
  const frames = React.useMemo(() => {
    if (activeTwibbon?.imageUrls && activeTwibbon.imageUrls.length > 0) {
      return activeTwibbon.imageUrls;
    }
    if (activeTwibbon?.imageUrl) {
      return [activeTwibbon.imageUrl];
    }
    return [];
  }, [activeTwibbon]);

  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [framesDimensions, setFramesDimensions] = useState<{
    [url: string]: { width: number; height: number; ratio: string };
  }>({});

  useEffect(() => {
    setSelectedFrameIndex(0);
  }, [activeTwibbon?.id]);

  const currentFrameUrl = frames[selectedFrameIndex] || activeTwibbon?.imageUrl || '';

  // Auto detect dimensions & aspect ratio for every frame variant in this twibbon
  useEffect(() => {
    if (!frames || frames.length === 0) return;
    frames.forEach((url: string) => {
      if (!url) return;
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || img.width || 1080;
        const h = img.naturalHeight || img.height || 1080;
        const ratioVal = w / h;
        let detectedPreset = 'custom';
        if (Math.abs(ratioVal - 1) < 0.04) detectedPreset = '1:1';
        else if (Math.abs(ratioVal - (9 / 16)) < 0.04) detectedPreset = '9:16';
        else if (Math.abs(ratioVal - (4 / 5)) < 0.04) detectedPreset = '4:5';
        else if (Math.abs(ratioVal - (2 / 3)) < 0.04) detectedPreset = '2:3';
        else if (Math.abs(ratioVal - (16 / 9)) < 0.04) detectedPreset = '16:9';

        setFramesDimensions((prev) => ({
          ...prev,
          [url]: { width: w, height: h, ratio: detectedPreset },
        }));
      };
      img.src = url;
    });
  }, [frames]);

  useEffect(() => {
    setIsMounted(true);
    if (userId) {
      getUserTwibbonFavorites(userId).then(res => {
        if (res.success && res.data) setFavorites(res.data);
      });
    }
  }, [userId]);

  // Load real recent generated thumbnails from database for this twibbon frame + fallback to localStorage
  useEffect(() => {
    if (activeTwibbon?.id) {
      getRecentTwibbonUsages(activeTwibbon.id).then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setRecentThumbnails(res.data);
        } else {
          // Fallback to local storage for guest session
          try {
            const saved = localStorage.getItem(`twibbon_recent_${activeTwibbon.id}`);
            if (saved) setRecentThumbnails(JSON.parse(saved));
          } catch (e) {}
        }
      });
    }
  }, [activeTwibbon?.id]);

  const [isTogglingFavorite, setIsTogglingFavorite] = useState<string | null>(null);

  const toggleFavorite = async () => {
    if (!activeTwibbon) return;

    if (isTogglingFavorite) return;
    setIsTogglingFavorite(activeTwibbon.id);

    try {
      const res: any = await toggleTwibbonFavorite(activeTwibbon.id, userId);
      if (res && res.success) {
        if (res.favorited) {
          setFavorites(prev => [...prev, activeTwibbon.id]);
        } else {
          setFavorites(prev => prev.filter(favId => favId !== activeTwibbon.id));
        }
      } else {
        // Fallback local toggle
        setFavorites(prev => 
          prev.includes(activeTwibbon.id)
            ? prev.filter(favId => favId !== activeTwibbon.id)
            : [...prev, activeTwibbon.id]
        );
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setIsTogglingFavorite(null);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      setScale(1.0);
      setRotation(0);
      setOffsetX(0);
      setOffsetY(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!photoUrl) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Helper distance & angle math for multi-touch pinch-to-zoom & pinch-to-rotate
  const getTouchDistance = (t1: React.Touch, t2: React.Touch) => {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.hypot(dx, dy);
  };

  const getTouchAngle = (t1: React.Touch, t2: React.Touch) => {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  // Touch Handlers for Smartphone (iOS & Android) with Multi-Touch Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!photoUrl || e.touches.length === 0) return;

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - offsetX, y: touch.clientY - offsetY });
      setTouchPinchStart(null);
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      const angle = getTouchAngle(e.touches[0], e.touches[1]);
      setTouchPinchStart({
        dist,
        angle,
        initialScale: scale,
        initialRotation: rotation,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!photoUrl || e.touches.length === 0) return;

    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setOffsetX(touch.clientX - dragStart.x);
      setOffsetY(touch.clientY - dragStart.y);
    } else if (e.touches.length === 2 && touchPinchStart) {
      const newDist = getTouchDistance(e.touches[0], e.touches[1]);
      const newAngle = getTouchAngle(e.touches[0], e.touches[1]);

      if (touchPinchStart.dist > 0) {
        const scaleRatio = newDist / touchPinchStart.dist;
        const targetScale = Math.min(Math.max(touchPinchStart.initialScale * scaleRatio, 0.5), 2.5);
        setScale(targetScale);
      }

      const angleDiff = newAngle - touchPinchStart.angle;
      let targetRotation = Math.round(touchPinchStart.initialRotation + angleDiff);
      if (targetRotation > 180) targetRotation -= 360;
      if (targetRotation < -180) targetRotation += 360;
      setRotation(targetRotation);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setTouchPinchStart(null);
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
  };

  const handleDownload = async () => {
    if (!photoUrl || !activeTwibbon) return;

    setIsDownloading(true);

    try {
      const currentDim = framesDimensions[currentFrameUrl];
      const targetW = currentDim?.width || activeTwibbon.width || 1080;
      const targetH = currentDim?.height || activeTwibbon.height || 1080;

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      const userImg = new Image();
      userImg.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        userImg.onload = resolve;
        userImg.onerror = reject;
        userImg.src = photoUrl;
      });

      const frameImg = new Image();
      frameImg.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        frameImg.onload = resolve;
        frameImg.onerror = reject;
        frameImg.src = currentFrameUrl;
      });

      const previewW = containerRef.current?.clientWidth || 340;
      const previewH = containerRef.current?.clientHeight || 340;
      const scaleX = targetW / previewW;
      const scaleY = targetH / previewH;

      ctx.save();
      ctx.translate((targetW / 2) + (offsetX * scaleX), (targetH / 2) + (offsetY * scaleY));
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);

      const boxAspect = targetW / targetH;
      const userAspect = userImg.width / userImg.height;
      let drawW = targetW;
      let drawH = targetH;

      if (userAspect > boxAspect) {
        drawH = targetH;
        drawW = targetH * userAspect;
      } else {
        drawW = targetW;
        drawH = targetW / userAspect;
      }

      ctx.drawImage(userImg, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      ctx.drawImage(frameImg, 0, 0, targetW, targetH);

      const generatedDataUrl = canvas.toDataURL('image/jpeg', 0.90);

      const link = document.createElement('a');
      link.download = `Twibbon_${activeTwibbon.title.replace(/\s+/g, '_')}.jpg`;
      link.href = generatedDataUrl;
      link.click();

      // Persist usage record via API route (bypasses server action payload limits)
      const targetUserId = currentUser?.id || currentUser?.email || 'superadmin_1';
      let res: any = { success: false };
      try {
        const apiRes = await fetch('/api/twibbon-usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            twibbonId: activeTwibbon.id,
            userId: targetUserId,
            resultImageBase64: generatedDataUrl,
          }),
        });
        res = await apiRes.json();
      } catch (apiErr) {
        console.error('API twibbon-usage error:', apiErr);
      }

      if (!res.success && res.rateLimited) {
        alert(res.error);
        return;
      }

      const finalSavedUrl = res?.resultImageUrl || generatedDataUrl;

      // Add generated thumbnail to history list (Strict FIFO Queue: Max 5 items)
      setRecentThumbnails((prev) => {
        const next = [finalSavedUrl, ...prev.slice(0, 4)];
        try {
          localStorage.setItem(`twibbon_recent_${activeTwibbon.id}`, JSON.stringify(next));
        } catch (e) {}
        return next;
      });

      const newCount = (res && res.success && typeof res.usedCount === 'number') ? res.usedCount : (activeTwibbon.usedCount || 0) + 1;

      updateTwibbon(activeTwibbon.id, {
        usedCount: newCount,
      });

    } catch (err) {
      console.error('Download twibbon error:', err);
      alert('Gagal mengunduh twibbon. Silakan coba lagi.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    } catch (err) {
      console.error('Copy link error:', err);
    }
  };

  const handleShare = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share && activeTwibbon) {
      try {
        await navigator.share({
          title: activeTwibbon.title,
          text: `Dukung dan pasang bingkai foto twibbon "${activeTwibbon.title}" resmi KONI Kabupaten Kepahiang:\n`,
          url: currentUrl,
        });
        return;
      } catch (err: any) {
        if (err && err.name === 'AbortError') return;
      }
    }
    setIsShareModalOpen(true);
  };

  if (!activeTwibbon) {
    if (!isMounted || !isTwibbonsLoaded) {
      return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col pt-[110px] items-center justify-center text-gray-500 dark:text-gray-400 font-sans">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F26522] mb-4"></div>
          <p className="text-sm font-semibold">Memuat bingkai twibbon...</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col pt-[110px] items-center justify-center text-gray-500 dark:text-gray-400 font-sans">
        <p className="font-bold text-lg text-gray-900 dark:text-white mb-2">Bingkai Twibbon Tidak Ditemukan</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Twibbon yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
        <Link href="/twibbon" className="px-5 py-2.5 bg-[#F26522] text-white font-bold text-xs rounded-xl hover:bg-[#d85417] transition-all">
          Lihat Semua Twibbon
        </Link>
      </div>
    );
  }

  const otherTwibbons = twibbons.filter((t) => t.id !== activeTwibbon.id).slice(0, 4);

  const currentDim = framesDimensions[currentFrameUrl];
  const targetW = currentDim?.width || activeTwibbon.width || 1080;
  const targetH = currentDim?.height || activeTwibbon.height || 1080;
  const targetRatio = currentDim?.ratio || activeTwibbon.aspectRatio || '1:1';
  const ratioMeta = getAspectRatioMeta(targetRatio, targetW, targetH);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6 transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="mb-4">
          <Link
            href="/twibbon"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-[#F26522] dark:hover:text-[#F26522] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Galeri Twibbon</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Canvas Box (Putih Tulang / Off-White Ivory Background) */}
          <div className="lg:col-span-6 bg-[#FAF7F2] dark:bg-gray-950/60 p-4 sm:p-7 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[480px] relative select-none overflow-hidden border-r border-amber-100/60 dark:border-gray-800">
            {/* Format Tag Header */}
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-amber-200/80 dark:border-gray-800 text-[11px] font-black text-gray-800 dark:text-gray-200 shadow-2xs">
                <Maximize2 size={12} className="text-[#F26522] shrink-0" />
                <span>{ratioMeta.label}</span>
                <span className="text-[#F26522] font-black">({targetW} × {targetH} px)</span>
              </span>
            </div>

            <div
              ref={containerRef}
              onClick={handleCanvasClick}
              style={{
                aspectRatio: `${targetW} / ${targetH}`,
                maxWidth: targetW >= targetH ? 'min(100%, 420px)' : 'min(100%, 300px)',
                maxHeight: '480px',
                width: '100%',
              }}
              className={`relative mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 bg-amber-50/50 dark:bg-gray-900/50 flex items-center justify-center transition-all ${
                photoUrl ? 'cursor-move touch-none' : 'cursor-pointer hover:border-[#F26522] transition-colors group'
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              {photoUrl ? (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale}) rotate(${rotation}deg)`,
                  }}
                >
                  <img
                    src={photoUrl}
                    alt="Foto Pengguna"
                    className="min-w-full min-h-full max-w-none max-h-none object-cover"
                  />
                </div>
              ) : (
                <div className="text-center p-6 text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center">
                  <Upload size={44} className="mb-2 text-[#F26522] animate-bounce group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-extrabold text-gray-800 dark:text-gray-200 group-hover:text-[#F26522] transition-colors">
                    Unggah Foto Anda Di Sini
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1">
                    Klik di dalam bingkai ({ratioMeta.badge}) untuk memilih foto
                  </p>
                </div>
              )}

              <img
                src={currentFrameUrl}
                alt={activeTwibbon.title}
                onLoad={(e) => {
                  const nw = e.currentTarget.naturalWidth;
                  const nh = e.currentTarget.naturalHeight;
                  if (nw && nh) {
                    setFramesDimensions((prev) => {
                      if (prev[currentFrameUrl]?.width === nw && prev[currentFrameUrl]?.height === nh) return prev;
                      const rVal = nw / nh;
                      let dPreset = 'custom';
                      if (Math.abs(rVal - 1) < 0.04) dPreset = '1:1';
                      else if (Math.abs(rVal - (9 / 16)) < 0.04) dPreset = '9:16';
                      else if (Math.abs(rVal - (4 / 5)) < 0.04) dPreset = '4:5';
                      else if (Math.abs(rVal - (2 / 3)) < 0.04) dPreset = '2:3';
                      else if (Math.abs(rVal - (16 / 9)) < 0.04) dPreset = '16:9';
                      return {
                        ...prev,
                        [currentFrameUrl]: { width: nw, height: nh, ratio: dPreset },
                      };
                    });
                  }
                }}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 transition-all duration-300"
              />
            </div>

            {photoUrl && (
              <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-2.5 flex items-center gap-1 font-medium text-center">
                <Sparkles size={12} className="text-[#F26522] shrink-0" />
                <span>Geser 1 jari untuk posisi, 2 jari untuk zoom & rotasi foto</span>
              </p>
            )}

            {/* 🎨 Pilihan Desain Bingkai (Multi-Frame Selector) */}
            {frames.length > 1 && (
              <div className="w-full max-w-[340px] mt-3.5 p-3.5 bg-white dark:bg-gray-900 rounded-2xl border border-amber-200/80 dark:border-gray-800 shadow-sm animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-gray-900 dark:text-white">
                    <Layers size={14} className="text-[#F26522]" />
                    <span>Pilih Template Bingkai</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-[#F26522] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-200/60 dark:border-orange-900/40">
                    Bingkai {selectedFrameIndex + 1} dari {frames.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {frames.map((frameUrl: string, idx: number) => {
                    const isSelected = idx === selectedFrameIndex;
                    const fDim = framesDimensions[frameUrl];
                    const fMeta = fDim ? getAspectRatioMeta(fDim.ratio, fDim.width, fDim.height) : null;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedFrameIndex(idx);
                          setOffsetX(0);
                          setOffsetY(0);
                          setScale(1.0);
                          setRotation(0);
                        }}
                        className={`relative group p-1.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1 shrink-0 cursor-pointer ${
                          isSelected
                            ? 'border-[#F26522] bg-orange-50/70 dark:bg-orange-950/50 shadow-sm scale-[1.03]'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        title={fMeta ? `${fMeta.label} (${fMeta.dimensions})` : `Pilih Bingkai ${idx + 1}`}
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden relative flex items-center justify-center bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:6px_6px] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] bg-white dark:bg-gray-900 shadow-2xs">
                          <img
                            src={frameUrl}
                            alt={`Bingkai ${idx + 1}`}
                            onLoad={(e) => {
                              const nw = e.currentTarget.naturalWidth;
                              const nh = e.currentTarget.naturalHeight;
                              if (nw && nh && !framesDimensions[frameUrl]) {
                                const rVal = nw / nh;
                                let dPreset = 'custom';
                                if (Math.abs(rVal - 1) < 0.04) dPreset = '1:1';
                                else if (Math.abs(rVal - (9 / 16)) < 0.04) dPreset = '9:16';
                                else if (Math.abs(rVal - (4 / 5)) < 0.04) dPreset = '4:5';
                                else if (Math.abs(rVal - (2 / 3)) < 0.04) dPreset = '2:3';
                                else if (Math.abs(rVal - (16 / 9)) < 0.04) dPreset = '16:9';
                                setFramesDimensions((prev) => ({
                                  ...prev,
                                  [frameUrl]: { width: nw, height: nh, ratio: dPreset },
                                }));
                              }
                            }}
                            className="w-full h-full object-contain p-0.5"
                          />
                        </div>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded leading-none ${
                          isSelected
                            ? 'bg-[#F26522] text-white shadow-2xs'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {fMeta ? fMeta.badge : `Desain ${idx + 1}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 📱 UNGGAH FOTO & SLIDER (Tampilan Mobile: Di bawah canvas, di atas garis) */}
            <div className="w-full max-w-[340px] mt-4 space-y-3 lg:hidden">
              <div>
                <label className="w-full py-3 px-4 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-[#F26522] border border-orange-200/80 dark:border-orange-900/50 rounded-2xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition-all shadow-2xs">
                  <Upload size={16} />
                  <span>{photoUrl ? 'Ganti Foto Lain' : 'Pilih Foto Dari Perangkat'}</span>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>

              {photoUrl && (
                <div className="space-y-3 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-amber-200/60 dark:border-gray-800 shadow-xs animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span>Atur Ukuran</span>
                    <span className="text-[#F26522]">{Math.round(scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#F26522]"
                  />

                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300 pt-1">
                    <span>Putar</span>
                    <span className="text-[#F26522]">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#F26522]"
                  />
                </div>
              )}
            </div>

            {/* Thumbnails Hasil Generate Terakhir (Garis Pembatas) */}
            <div className="mt-5 w-full max-w-[340px] pt-4 border-t border-amber-200/60 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Hasil Generate Terbaru
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold">
                  {(activeTwibbon.usedCount || 0) > 0 ? `${activeTwibbon.usedCount}x Dibuat` : 'Belum Ada'}
                </span>
              </div>

              {recentThumbnails.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {recentThumbnails.slice(0, 5).map((thumbUrl, idx) => (
                    <div
                      key={idx}
                      className="w-[50px] h-[50px] min-w-[50px] min-h-[50px] rounded-xl overflow-hidden border-2 border-white dark:border-gray-800 shadow-md bg-white dark:bg-gray-800 relative group shrink-0"
                    >
                      <img
                        src={thumbUrl}
                        alt={`Hasil Twibbon ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <img
                        src={activeTwibbon.imageUrl}
                        alt="Overlay Frame"
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-80"
                      />
                    </div>
                  ))}

                  {/* Tampilkan badge +X Lainnya HANYA jika usedCount lebih banyak dari thumbnail yang tampil */}
                  {(activeTwibbon.usedCount || 0) > recentThumbnails.length && (
                    <div className="w-[50px] h-[50px] min-w-[50px] min-h-[50px] rounded-xl bg-orange-100/70 dark:bg-orange-950/50 border-2 border-orange-200/80 dark:border-orange-900/50 text-[#F26522] flex flex-col items-center justify-center shrink-0 cursor-default shadow-sm hover:bg-orange-100 dark:hover:bg-orange-900/70 transition-colors">
                      <span className="text-[11px] font-black leading-none">
                        +{(activeTwibbon.usedCount || 0) - recentThumbnails.length}
                      </span>
                      <span className="text-[8px] font-bold text-orange-600 dark:text-orange-400 mt-0.5 leading-none">
                        Lainnya
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-gray-900/40 border border-amber-200/50 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400 font-medium text-center">
                  Belum ada yang membuat twibbon ini. Yuk pasang fotomu sekarang!
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/40 text-[#F26522] border border-orange-100 dark:border-orange-900/40 text-xs font-bold rounded-full">
                  <Sparkles size={12} />
                  <span>
                    {activeTwibbon.category && activeTwibbon.category !== 'Nasional'
                      ? activeTwibbon.category
                      : 'Twibbon Official'}
                  </span>
                  <span className="text-orange-300 dark:text-orange-700">•</span>
                  <span>{ratioMeta.badge}</span>
                </span>

                <button
                  onClick={toggleFavorite}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors inline-flex items-center justify-center cursor-pointer"
                  title="Simpan Favorit"
                >
                  <Heart size={20} className={favorites.includes(activeTwibbon.id) ? 'fill-red-500 text-red-500' : ''} />
                </button>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                {activeTwibbon.title}
              </h1>

              {/* Rapi, modern chips / pills tanpa patah kata atau dot melayang */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pb-4 border-b border-gray-100 dark:border-gray-800 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium">
                  <span className="text-gray-400 dark:text-gray-500 font-normal">Oleh:</span>
                  <strong className="text-gray-900 dark:text-white font-bold">{activeTwibbon.author?.name || 'KONI Kepahiang'}</strong>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/40 text-[#F26522] border border-orange-100 dark:border-orange-900/40 rounded-full font-semibold">
                  <span>Telah Digunakan:</span>
                  <strong className="font-extrabold">{activeTwibbon.usedCount || 0}x</strong>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 rounded-full font-bold">
                  <Maximize2 size={11} className="shrink-0" />
                  <span>{ratioMeta.label} ({ratioMeta.dimensions})</span>
                </span>

                {frames.length > 1 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 rounded-full font-bold">
                    <Layers size={13} />
                    <span>{frames.length} Desain Tersedia</span>
                  </span>
                )}
              </div>

              {activeTwibbon.description && (
                <div className="mt-3.5 p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    Keterangan
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {activeTwibbon.description}
                  </p>
                </div>
              )}
            </div>

            {/* 🖥️ UNGGAH FOTO & SLIDER (Tampilan Desktop Web: Di bawah info Oleh/Telah Digunakan) */}
            <div className="hidden lg:block space-y-3">
              <div>
                <label className="w-full py-3 px-4 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-[#F26522] border border-orange-200/80 dark:border-orange-900/50 rounded-2xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition-all shadow-2xs">
                  <Upload size={16} />
                  <span>{photoUrl ? 'Ganti Foto Lain' : 'Pilih Foto Dari Perangkat'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>

              {photoUrl && (
                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span>Atur Ukuran</span>
                    <span className="text-[#F26522]">{Math.round(scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#F26522]"
                  />

                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300 pt-1">
                    <span>Putar</span>
                    <span className="text-[#F26522]">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#F26522]"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <button
                onClick={handleDownload}
                disabled={!photoUrl || isDownloading}
                className="w-full py-3.5 px-6 bg-[#F26522] hover:bg-[#d85417] active:scale-[0.99] text-white text-sm font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Memproses Gambar...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Unduh Hasil Twibbon</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full py-2.5 px-3 bg-[#F26522]/10 hover:bg-[#F26522]/20 dark:bg-[#F26522]/20 dark:hover:bg-[#F26522]/30 text-[#F26522] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Share2 size={15} />
                  <span>Bagikan</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-2.5 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <LinkIcon size={15} />
                  <span>Salin Tautan</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Top Alert Toast - Guaranteed visible on Mobile */}
        {showShareToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900/95 dark:bg-black/90 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-emerald-500/40 text-center animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none ring-4 ring-emerald-500/10">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle size={14} />
            </div>
            <span>Tautan Twibbon berhasil disalin!</span>
          </div>
        )}

        {activeTwibbon && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            url={typeof window !== 'undefined' ? window.location.href : `https://koni-kph.site/twibbon/${activeTwibbon.slug || activeTwibbon.id}`}
            title={activeTwibbon.title}
            description={activeTwibbon.description || `Pasang foto Anda pada bingkai twibbon ${activeTwibbon.title} resmi KONI Kabupaten Kepahiang.`}
          />
        )}

        {otherTwibbons.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers size={20} className="text-[#F26522]" />
              <span>Twibbon Lainnya yang Populer</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {otherTwibbons.map((tw) => (
                <Link
                  key={tw.id}
                  href={`/twibbon/${tw.slug || tw.id}`}
                  className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2 relative">
                    <img
                      src={tw.imageUrl}
                      alt={tw.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#F26522] dark:group-hover:text-[#F26522] transition-colors">
                    {tw.title}
                  </h4>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{tw.usedCount || 0}x digunakan</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
