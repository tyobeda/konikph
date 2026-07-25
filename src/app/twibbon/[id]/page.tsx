'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, Download, Sparkles, Image as ImageIcon, Loader2, Share2, Heart, Layers } from 'lucide-react';
import { Header } from '@/components/Header';
import { useData } from '@/context/DataContext';

export default function TwibbonEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { twibbons, updateTwibbon } = useData();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Interaction State variables
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0); // in degrees
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState(false);

  // Share Notification Toast
  const [showShareToast, setShowShareToast] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pksart_favorite_twibbons');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeTwibbon = twibbons.find((t) => t.id === id);

  const toggleFavorite = () => {
    if (!activeTwibbon) return;
    setFavorites((prev) => {
      const next = prev.includes(activeTwibbon.id)
        ? prev.filter((item) => item !== activeTwibbon.id)
        : [...prev, activeTwibbon.id];
      localStorage.setItem('pksart_favorite_twibbons', JSON.stringify(next));
      return next;
    });
  };

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6">
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded-xl mb-6" />
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 h-[480px]" />
        </main>
      </div>
    );
  }

  if (!activeTwibbon) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px]">
        <Header />
        <main className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <ImageIcon size={30} />
          </div>
          <h3 className="text-base font-bold text-gray-900">Bingkai Tidak Ditemukan</h3>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            Bingkai twibbon yang Anda cari tidak tersedia atau telah dihapus oleh administrator.
          </p>
          <button
            onClick={() => router.push('/twibbon')}
            className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all"
          >
            Kembali ke Galeri Twibbon
          </button>
        </main>
      </div>
    );
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoUrl(URL.createObjectURL(file));
      setScale(1.0);
      setRotation(0);
      setOffsetX(0);
      setOffsetY(0);
    }
  };

  const handleDownloadTwibbon = async () => {
    if (!photoUrl) {
      alert('Harap unggah foto Anda terlebih dahulu untuk membuat Twibbon.');
      return;
    }

    setIsDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Gagal memproses kanvas gambar.');

      const userImg = new Image();
      userImg.crossOrigin = 'anonymous';
      userImg.src = photoUrl;
      await new Promise((resolve, reject) => {
        userImg.onload = resolve;
        userImg.onerror = reject;
      });

      const frameImg = new Image();
      frameImg.crossOrigin = 'anonymous';
      frameImg.src = activeTwibbon.imageUrl;
      await new Promise((resolve, reject) => {
        frameImg.onload = resolve;
        frameImg.onerror = reject;
      });

      const previewSize = 332;
      const scaleFactor = 1080 / previewSize;

      ctx.clearRect(0, 0, 1080, 1080);
      ctx.save();

      // Translate to scale location
      ctx.translate(540 + offsetX * scaleFactor, 540 + offsetY * scaleFactor);
      
      // Apply rotation transformation
      ctx.rotate((rotation * Math.PI) / 180);
      
      // Apply scaling transformation
      ctx.scale(scale, scale);

      const imgRatio = userImg.width / userImg.height;
      let drawW = 1080;
      let drawH = 1080;
      if (imgRatio > 1) {
        drawW = 1080 * imgRatio;
      } else {
        drawH = 1080 / imgRatio;
      }

      ctx.drawImage(userImg, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      ctx.drawImage(frameImg, 0, 0, 1080, 1080);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `twibbon-${activeTwibbon.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Increment dynamic usage count
      updateTwibbon(activeTwibbon.id, { usedCount: (activeTwibbon.usedCount || 0) + 1 });
    } catch (err: any) {
      alert('Gagal mengunduh twibbon. Pastikan koneksi internet stabil.');
    } finally {
      setIsDownloading(false);
    }
  };

  const isFavorited = favorites.includes(activeTwibbon.id);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6 relative">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/twibbon')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#F26522] transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Kembali ke Galeri Twibbon</span>
          </button>

          {/* Share & Favorite Buttons on Editor Page */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShareLink}
              className="p-2 bg-white border border-gray-200 rounded-xl hover:text-[#F26522] hover:border-orange-100 shadow-sm transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold text-gray-600"
              title="Bagikan Tautan Twibbon"
            >
              <Share2 size={15} />
              <span>Bagikan</span>
            </button>
            <button
              onClick={toggleFavorite}
              className={`p-2 bg-white border rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold ${
                isFavorited 
                  ? 'border-red-100 text-red-500 bg-red-50/10' 
                  : 'border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-100'
              }`}
              title={isFavorited ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
            >
              <Heart size={15} className={isFavorited ? 'fill-red-500 text-red-500' : ''} />
              <span>{isFavorited ? 'Favorit Saya' : 'Favorit'}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>{activeTwibbon.title}</span>
              <Sparkles size={22} className="text-orange-500" />
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kategori: {activeTwibbon.category} • Wilayah: {activeTwibbon.region}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-3.5 pt-3.5 border-t border-gray-100 text-xs font-medium text-gray-400">
              {/* Creator Info */}
              <div className="flex items-center gap-2">
                <img
                  src={activeTwibbon.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                  alt={activeTwibbon.author?.name}
                  className="w-6 h-6 rounded-full object-cover border border-gray-250"
                />
                <span className="text-gray-600 font-semibold">{activeTwibbon.author?.name || 'Kreator PKSart'}</span>
              </div>
              
              <span className="text-gray-300">•</span>
              
              {/* Used Count */}
              <div className="flex items-center gap-1">
                <Layers size={13} className="text-purple-400" />
                <span>Dipakai: <span className="text-gray-600 font-semibold">{(activeTwibbon.usedCount || 0) + (isDownloading ? 1 : 0)} kali</span></span>
              </div>
              
              <span className="text-gray-300">•</span>

              {/* Love Count */}
              <div className="flex items-center gap-1">
                <Heart size={13} className="text-red-400 fill-red-50" />
                <span>Disukai: <span className="text-gray-600 font-semibold">{42 + (isFavorited ? 1 : 0)} orang</span></span>
              </div>

              <span className="text-gray-300">•</span>

              {/* Share Count */}
              <div className="flex items-center gap-1">
                <Share2 size={13} className="text-blue-400" />
                <span>Dibagikan: <span className="text-gray-600 font-semibold">{15 + (showShareToast ? 1 : 0)} kali</span></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Canvas Preview Box */}
            <div className="flex flex-col items-center">
              <div 
                className="relative w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-gray-100 flex items-center justify-center cursor-move select-none"
                onMouseDown={(e) => {
                  if (photoUrl) {
                    e.preventDefault();
                    setIsDragging(true);
                    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
                  }
                }}
                onTouchStart={(e) => {
                  if (photoUrl && e.touches.length > 0) {
                    setIsDragging(true);
                    const touch = e.touches[0];
                    setDragStart({ x: touch.clientX - offsetX, y: touch.clientY - offsetY });
                  }
                }}
                onMouseMove={(e) => {
                  if (isDragging) {
                    setOffsetX(e.clientX - dragStart.x);
                    setOffsetY(e.clientY - dragStart.y);
                  }
                }}
                onTouchMove={(e) => {
                  if (isDragging && e.touches.length > 0) {
                    const touch = e.touches[0];
                    setOffsetX(touch.clientX - dragStart.x);
                    setOffsetY(touch.clientY - dragStart.y);
                  }
                }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onTouchEnd={() => setIsDragging(false)}
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Foto Profil User"
                    className="absolute pointer-events-none origin-center max-w-none transition-transform duration-75"
                    style={{
                      transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale}) rotate(${rotation}deg)`,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      cursor: 'move',
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400 text-center p-4">
                    <ImageIcon size={48} className="mb-2 stroke-1" />
                    <p className="text-xs font-semibold">Foto Anda akan muncul di sini</p>
                  </div>
                )}

                <img
                  src={activeTwibbon.imageUrl}
                  alt="Bingkai Twibbon"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                />
              </div>

              {photoUrl && (
                <div className="w-full max-w-[340px] mt-5 px-1 space-y-4">
                  {/* Zoom Controller */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-gray-700">Skala Perbesar/Perkecil Foto:</span>
                      <span className="text-xs font-extrabold text-[#F26522]">{Math.round(scale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.01"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full accent-[#F26522] bg-gray-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Rotation Controller */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-gray-700">Putar Sudut Foto:</span>
                      <span className="text-xs font-extrabold text-[#F26522]">{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full accent-[#F26522] bg-gray-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                    💡 Geser/drag gambar di atas untuk menyesuaikan posisinya.
                  </p>
                </div>
              )}
            </div>

            {/* Upload & Action Panel */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Langkah 1: Unggah Foto Anda
                </label>
                <label className="flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-50 hover:bg-orange-50/60 border-2 border-dashed border-gray-300 hover:border-[#F26522] rounded-xl cursor-pointer text-sm font-bold text-gray-700 hover:text-[#F26522] transition-all">
                  <Upload size={18} />
                  <span>{photoUrl ? 'Ganti Foto Saya' : 'Pilih Foto dari Galeri/HP'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                onClick={handleDownloadTwibbon}
                disabled={isDownloading}
                className="w-full py-4 px-6 bg-[#F26522] hover:bg-[#d85417] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Sedang Memproses...</span>
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    <span>Unduh Hasil Twibbon (PNG)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Copy Notification Toast */}
      {showShareToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-black/85 backdrop-blur-md text-white text-xs font-bold px-5 py-3 rounded-xl shadow-xl transition-all animate-bounce">
          ✓ Tautan twibbon berhasil disalin ke papan klip!
        </div>
      )}
    </div>
  );
}
