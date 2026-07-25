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
import { CATEGORIES, REGIONS } from '@/lib/data';
import { useData, SUPER_ADMIN_USER } from '@/context/DataContext';

export default function UploadPage() {
  const router = useRouter();
  const { addArtwork, currentUser } = useData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0] || 'Poster');
  const [region, setRegion] = useState(REGIONS[1] || 'DPW Jawa Barat');
  const [fileFormat, setFileFormat] = useState('PSD');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const result = await compressImageFile(file, 2, 1920, 0.85);
        setPreviewUrl(result.dataUrl);
        setCompressionInfo(result);
      } catch (err: any) {
        alert(err.message || 'Gagal memproses file gambar.');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      addArtwork({
        title,
        description,
        imageUrl: previewUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
        downloadUrl: '#',
        category,
        region,
        format: fileFormat,
        author: currentUser || SUPER_ADMIN_USER,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1200);
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
            <div className="py-12 flex flex-col items-center text-center">
              <CheckCircle size={56} className="text-emerald-500 mb-3 animate-bounce" />
              <h3 className="text-xl font-bold text-gray-900">Karya Berhasil Diunggah!</h3>
              <p className="text-sm text-gray-500 mt-1">
                Mengalihkan kembali ke galeri utama...
              </p>
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
                            <span>⚡ Kompresi Sukses: {compressionInfo.originalSizeMb}MB → {compressionInfo.compressedSizeMb}MB (Maks 2MB)</span>
                          ) : (
                            <span>✨ Ukuran Optimal: {compressionInfo.originalSizeMb}MB (Maks 2MB)</span>
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

              {/* Category & Region Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Kategori Karya
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-medium"
                  >
                    {CATEGORIES.filter((c) => c !== 'Semua Karya').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Wilayah / Daerah DPW
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-medium"
                  >
                    {REGIONS.filter((r) => r !== 'Semua Daerah').map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Source Format */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Format File Master (Yang disertakan untuk diunduh)
                </label>
                <input
                  type="text"
                  value={fileFormat}
                  onChange={(e) => setFileFormat(e.target.value)}
                  placeholder="Contoh: PSD / AI / CDR / CANVA"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 placeholder:font-normal rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white transition-all font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Deskripsi Karya
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan mengenai tema desain, peruntukan publikasi, atau instruksi pengeditan..."
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 placeholder:font-normal rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white transition-all"
                />
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
