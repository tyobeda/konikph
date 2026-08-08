'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  ArrowLeft,
  CheckCircle,
  FileText,
  Tag,
  MapPin,
  Sparkles,
  Layers,
} from 'lucide-react';
import { compressImageFile, CompressionResult } from '@/lib/imageCompressor';
import { Header } from '@/components/Header';
import { CATEGORIES, REGIONS, ARTWORK_CATEGORIES } from '@/lib/data';
import { useData, SUPER_ADMIN_USER } from '@/context/DataContext';

export default function UploadPage() {
  const router = useRouter();
  const { addArtwork, currentUser, siteSettings, isMounted, isModuleUnderMaintenance } = useData();

  React.useEffect(() => {
    if (isMounted) {
      if (isModuleUnderMaintenance('upload')) {
        router.replace('/maintenance');
        return;
      }
      if (!currentUser) {
        router.replace('/login');
      }
    }
  }, [isMounted, currentUser, router, isModuleUnderMaintenance]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hikmah-Motivasi');
  const [region, setRegion] = useState(REGIONS[1] || 'DPW Jawa Barat');
  const [fileFormat, setFileFormat] = useState('Hanya gambar');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPendingModeration, setIsPendingModeration] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Upload gagal');
        setPreviewUrl(data.url);
      } catch (err: any) {
        alert(err.message || 'Gagal upload file gambar.');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDownloadUrl('');
    setPreviewUrl(null);
    setFileFormat('Hanya gambar');
    setIsSuccess(false);
    setIsPendingModeration(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const requiresModeration = siteSettings?.autoApproveArtworks === false && currentUser?.role !== 'Super Admin';
    const status = requiresModeration ? 'Pending' : 'Disetujui';

    // Auto extract hashtags from description field (words starting with #)
    const hashtagsFromDesc = (description.match(/#[a-zA-Z0-9_-]+/g) || []).map((t) => t.trim());
    const parsedTags = Array.from(new Set(hashtagsFromDesc));

    setTimeout(() => {
      addArtwork({
        title,
        description,
        imageUrl: previewUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
        downloadUrl: downloadUrl || '#',
        category,
        region: currentUser?.region || region || 'DPP PKS Official',
        format: fileFormat,
        tags: parsedTags,
        author: currentUser || SUPER_ADMIN_USER,
        status: status as any,
      });

      setIsSubmitting(false);
      setIsPendingModeration(requiresModeration);
      setIsSuccess(true);

      if (!requiresModeration) {
        setTimeout(() => {
          router.push('/');
        }, 1200);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Back button */}
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
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              Unggah Karya & Desain Baru
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Bagikan hasil karya poster, spanduk, atau aset desain PKS untuk digunakan pengurus dan kader di seluruh daerah.
            </p>
          </div>

          {isSuccess ? (
            <div className="py-10 flex flex-col items-center text-center animate-in zoom-in-95">
              <CheckCircle size={56} className="text-emerald-500 mb-3 animate-bounce" />
              
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">
                {isPendingModeration ? 'Karya Berhasil Diunggah & Menunggu Moderasi' : 'Karya Berhasil Diunggah!'}
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
                {isPendingModeration ? (
                  <span>
                    Karya Anda saat ini berstatus <strong className="text-amber-600">Pending</strong> dan sedang menunggu peninjauan serta persetujuan oleh Administrator PKSart sebelum dipublikasikan ke galeri umum.
                  </span>
                ) : (
                  <span>Karya Anda telah disetujui dan kini siap diakses publik di galeri utama PKSart. Mengalihkan kembali...</span>
                )}
              </p>

              {isPendingModeration ? (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
                  <button
                    onClick={() => router.push('/')}
                    className="w-full py-3 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all text-center"
                  >
                    Kembali ke Beranda
                  </button>
                  <button
                    onClick={resetForm}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all text-center"
                  >
                    Unggah Karya Lainnya
                  </button>
                </div>
              ) : (
                <span className="text-xs font-bold text-[#F26522] animate-pulse">Mengalihkan ke beranda...</span>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Image Upload Area */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  File Pratinjau / Preview Artwork <span className="text-red-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-gray-300 hover:border-[#F26522] rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50/50 transition-all group cursor-pointer min-h-[220px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />

                  {previewUrl ? (
                    <div className="relative w-full flex flex-col items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Preview Upload"
                        className="max-h-[280px] rounded-xl object-contain shadow-md mb-2"
                      />
                      {compressionInfo && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                          {compressionInfo.isCompressed ? (
                            <span>Kompresi Sukses: {Math.round(compressionInfo.originalSizeMb * 1024)}kb → {Math.round(compressionInfo.compressedSizeMb * 1024)}kb (Maks 2048kb)</span>
                          ) : (
                            <span>{Math.round(compressionInfo.compressedSizeMb * 1024)}kb (Maks 2048kb)</span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-full bg-orange-50 text-[#F26522] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud size={28} />
                      </div>
                      <p className="text-sm font-bold text-gray-800">
                        {isCompressing ? 'Mengompresi gambar (Max 2MB)...' : 'Klik untuk unggah atau seret file gambar ke sini'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Batas file: Maksimal 2MB (Otomatis dikompresi kualitas tinggi agar web super cepat)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Judul Karya / Desain <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: POSTER PKS MILENIAL JABAR"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 placeholder:font-normal rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white transition-all font-semibold"
                  required
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Kategori Karya
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-medium"
                >
                  {ARTWORK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Format */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Format File Master
                </label>
                <div className="space-y-3">
                  <select
                    value={fileFormat === 'Hanya gambar' ? 'HANYA_GAMBAR' : ['PSD', 'AI', 'CDR'].includes(fileFormat) ? fileFormat : 'CUSTOM'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'CUSTOM') {
                        setFileFormat('CUSTOM_VAL');
                      } else if (val === 'HANYA_GAMBAR') {
                        setFileFormat('Hanya gambar');
                      } else {
                        setFileFormat(val);
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-medium"
                  >
                    <option value="HANYA_GAMBAR">Hanya gambar (Tanpa File Master)</option>
                    <option value="PSD">PSD (Photoshop)</option>
                    <option value="AI">AI (Illustrator)</option>
                    <option value="CDR">CDR (CorelDraw)</option>
                    <option value="CUSTOM">Format Kustom / Lainnya...</option>
                  </select>

                  {!['Hanya gambar', 'PSD', 'AI', 'CDR'].includes(fileFormat) && (
                    <div className="flex gap-2 animate-fadeIn">
                      <input
                        type="text"
                        value={fileFormat === 'CUSTOM_VAL' ? '' : fileFormat}
                        onChange={(e) => setFileFormat(e.target.value.toUpperCase())}
                        placeholder="Masukkan format kustom, contoh: CANVA, FIGMA, INDD"
                        className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 placeholder:font-normal rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white transition-all font-semibold"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setFileFormat('Hanya gambar')}
                        className="px-3 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Download URL Input (Link Download) */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 flex flex-col gap-0.5">
                  <span>Tautan File Master / Tautan Berbagi</span>
                  <span className="text-[11px] font-normal text-gray-500">(Misal: Link Canva, Google Drive, dll.)</span>
                </label>
                <input
                  type="text"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  placeholder="Contoh: https://canva.com/... atau https://drive.google.com/..."
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 placeholder:font-normal rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white transition-all font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <span>Deskripsi Karya</span>
                  <span className="text-xs font-normal text-[#F26522]">Hashtag dapat diketik langsung di sini (contoh: #PKS #JawaBarat)</span>
                </label>
                <textarea
                  rows={4}
                  maxLength={1500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white transition-all"
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-[11px] font-semibold ${description.length >= 1500 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {description.length}/1500 karakter
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#F26522] hover:bg-[#d95416] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 text-base"
              >
                {isSubmitting ? 'Mengunggah Karya...' : 'Publikasikan Karya Sekarang'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
