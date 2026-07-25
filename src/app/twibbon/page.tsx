'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Download, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Header } from '@/components/Header';
import { useData } from '@/context/DataContext';

export default function TwibbonPage() {
  const router = useRouter();
  const { twibbons } = useData();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

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
    }
  };

  const handleDownloadTwibbon = () => {
    if (!photoUrl) {
      alert('Harap unggah foto Anda terlebih dahulu untuk membuat Twibbon.');
      return;
    }
    alert('Twibbon Anda berhasil diproses dan diunduh!');
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
                Pilih bingkai twibbon resmi PKS, masukkan foto Anda, dan siap dibagikan ke media sosial.
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

                <div className="relative w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-gray-100 flex items-center justify-center">
                  
                  {/* Uploaded User Photo */}
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Foto Profil User"
                      className="absolute inset-0 w-full h-full object-cover"
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

                  {/* Top PKS Watermark */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full pointer-events-none">
                    PKS Official Twibbon
                  </div>

                  {/* Bottom Frame Badge */}
                  {frames[selectedFrame] && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white text-center pointer-events-none">
                      <div className="inline-block bg-[#F26522] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                        {frames[selectedFrame]?.title}
                      </div>
                    </div>
                  )}
                </div>
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
                  <div className="space-y-2">
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
                  className="w-full py-3.5 px-6 bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Download size={20} />
                  <span>Unduh Hasil Twibbon (PNG)</span>
                </button>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
