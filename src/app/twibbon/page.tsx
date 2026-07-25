'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Download, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { useData } from '@/context/DataContext';

export default function TwibbonPage() {
  const router = useRouter();
  const { twibbons } = useData();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Interaction State variables
  const [scale, setScale] = useState(1.0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const approvedTwibbons = twibbons.filter((t) => t.status === 'Disetujui');
  const frames = approvedTwibbons;

  if (!isMounted) {
    return null;
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoUrl(URL.createObjectURL(file));
      // Reset position offsets and scale when uploading new photo
      setScale(1.0);
      setOffsetX(0);
      setOffsetY(0);
    }
  };

  const handleDownloadTwibbon = async () => {
    if (!photoUrl || frames.length === 0) {
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

      // Load user photo
      const userImg = new Image();
      userImg.crossOrigin = 'anonymous';
      userImg.src = photoUrl;
      await new Promise((resolve, reject) => {
        userImg.onload = resolve;
        userImg.onerror = reject;
      });

      // Load twibbon frame
      const frameImg = new Image();
      frameImg.crossOrigin = 'anonymous';
      frameImg.src = frames[selectedFrame].imageUrl;
      await new Promise((resolve, reject) => {
        frameImg.onload = resolve;
        frameImg.onerror = reject;
      });

      // 1. Draw user image with zoom and offset translated
      // Preview container size maps to 1080x1080 canvas
      const previewSize = 332; // inside size of max-w-[340px] minus borders
      const scaleFactor = 1080 / previewSize;

      ctx.clearRect(0, 0, 1080, 1080);
      ctx.save();

      // Translate context to center plus the offsets scaled to 1080px
      ctx.translate(540 + offsetX * scaleFactor, 540 + offsetY * scaleFactor);
      ctx.scale(scale, scale);

      // Draw the user image centered
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

      // 2. Draw twibbon frame overlay
      ctx.drawImage(frameImg, 0, 0, 1080, 1080);

      // 3. Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `twibbon-${frames[selectedFrame].title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert('Gagal mengunduh twibbon. Pastikan koneksi internet stabil.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#F26522] transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Kembali</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          
          {/* Header title */}
          <div className="border-b border-gray-100 pb-4 mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <span>+ Buat Twibbon PKS Official</span>
                <Sparkles size={22} className="text-orange-500" />
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Pilih bingkai twibbon resmi PKS, masukkan foto Anda, geser & perbesar foto, lalu unduh hasilnya.
              </p>
            </div>
          </div>

          {frames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-purple-50 text-[#F26522] rounded-full flex items-center justify-center mb-4">
                <ImageIcon size={30} />
              </div>
              <h3 className="text-base font-bold text-gray-900">Belum Ada Bingkai Twibbon Resmi</h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1 mb-6">
                Belum ada bingkai twibbon resmi yang disetujui oleh admin saat ini. Silakan hubungi admin atau kembali beberapa saat lagi.
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all"
              >
                Kembali ke Beranda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Interactive Preview Canvas Box */}
              <div className="flex flex-col items-center">
                <p className="text-sm font-bold text-gray-700 mb-3 self-start">
                  Pratinjau Hasil Twibbon:
                </p>

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
                  
                  {/* Uploaded User Photo */}
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Foto Profil User"
                      className="absolute pointer-events-none origin-center max-w-none transition-transform duration-75"
                      style={{
                        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 text-center p-4">
                      <ImageIcon size={48} className="mb-2 stroke-1" />
                      <p className="text-xs font-semibold">Foto Anda akan muncul di sini</p>
                    </div>
                  )}

                  {/* Twibbon Overlay Frame Graphics */}
                  {frames[selectedFrame]?.imageUrl && (
                    <img
                      src={frames[selectedFrame].imageUrl}
                      alt="Bingkai Twibbon"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                    />
                  )}

                </div>

                {/* Interaction Sliders */}
                {photoUrl && (
                  <div className="w-full max-w-[340px] mt-5 px-1 space-y-3.5">
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
                    <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                      💡 Sentuh/klik & seret gambar di atas untuk menyesuaikan posisinya.
                    </p>
                  </div>
                )}
              </div>

              {/* Controls & Options */}
              <div className="space-y-6">
                
                {/* Step 1: Upload Photo */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    1. Unggah Foto Anda
                  </label>
                  <label className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-orange-50/60 border-2 border-dashed border-gray-300 hover:border-[#F26522] rounded-xl cursor-pointer text-sm font-semibold text-gray-700 hover:text-[#F26522] transition-all">
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

                {/* Step 2: Choose Frame */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    2. Pilih Desain Bingkai Twibbon
                  </label>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {frames.map((frame, index) => (
                      <button
                        key={frame.id}
                        onClick={() => setSelectedFrame(index)}
                        className={`w-full text-left p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                          selectedFrame === index
                            ? 'bg-orange-50/80 border-[#F26522] text-[#F26522] shadow-sm'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span>{frame.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                          {(frame as any).category || (frame as any).region || 'Official'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Download Action */}
                <button
                  onClick={handleDownloadTwibbon}
                  disabled={isDownloading}
                  className="w-full py-3.5 px-6 bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Sedang Memproses Gambar...</span>
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
          )}

        </div>
      </main>
    </div>
  );
}
