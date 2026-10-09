'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  UploadCloud,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useData } from '@/context/DataContext';
import { MaintenanceContent } from '@/app/maintenance/page';
import {
  TwibbonAspectRatioSelector,
  detectImageDimensions,
  AspectRatioType,
} from '@/components/TwibbonAspectRatioSelector';

export default function CreateTwibbonPage() {
  const router = useRouter();
  const { addTwibbon, currentUser, isModuleUnderMaintenance, siteSettings, isMounted } = useData();

  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFileUrls, setUploadFileUrls] = useState<string[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [createdSlugOrId, setCreatedSlugOrId] = useState<string | null>(null);

  // Multi-format / Aspect Ratio states
  const [uploadAspectRatio, setUploadAspectRatio] = useState<AspectRatioType>('1:1');
  const [uploadWidth, setUploadWidth] = useState<number>(1080);
  const [uploadHeight, setUploadHeight] = useState<number>(1080);
  const [autoDetectNotice, setAutoDetectNotice] = useState<string | null>(null);

  // Live admin mode check
  const [liveOnlyAdminMode, setLiveOnlyAdminMode] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setLiveOnlyAdminMode(Boolean(d.data.onlyAdminCanCreateTwibbon));
        }
      })
      .catch(() => {});
  }, []);

  const isOnlyAdminMode =
    liveOnlyAdminMode !== null
      ? liveOnlyAdminMode
      : Boolean(siteSettings?.onlyAdminCanCreateTwibbon);

  const isSuperAdmin = currentUser?.role === 'Super Admin';
  const canCreateTwibbon = !isOnlyAdminMode || isSuperAdmin;

  useEffect(() => {
    if (isMounted && !currentUser) {
      router.replace('/login?redirect=/twibbon/create');
    }
  }, [isMounted, currentUser, router]);

  if (isModuleUnderMaintenance('twibbon')) {
    return <MaintenanceContent />;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingFile(true);

    // Auto-detect dimensions from first uploaded file if list is empty
    if (uploadFileUrls.length === 0) {
      try {
        const firstFile = files[0];
        const detected = await detectImageDimensions(firstFile);
        setUploadAspectRatio(detected.matchedPreset);
        setUploadWidth(detected.width);
        setUploadHeight(detected.height);

        const presetLabel =
          detected.matchedPreset === '1:1'
            ? '1:1 Persegi'
            : detected.matchedPreset === '9:16'
            ? '9:16 Story'
            : detected.matchedPreset === '4:5'
            ? '4:5 Portrait'
            : detected.matchedPreset === '16:9'
            ? '16:9 Landscape'
            : 'Kustom';
        setAutoDetectNotice(
          `Ukuran PNG terdeteksi: ${detected.width} × ${detected.height} px (Format ${presetLabel} otomatis diterapkan)`
        );
      } catch (_) {}
    }

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success && data.url) {
          newUrls.push(data.url);
        }
      }
      setUploadFileUrls((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      alert(err.message || 'Gagal upload file PNG.');
    } finally {
      setIsUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleRemoveUploadFrame = (idxToRemove: number) => {
    setUploadFileUrls((prev) => prev.filter((_, i) => i !== idxToRemove));
  };

  const handleSetPrimaryUploadFrame = (idx: number) => {
    setUploadFileUrls((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      return [item, ...copy];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push('/login?redirect=/twibbon/create');
      return;
    }

    if (isOnlyAdminMode && !isSuperAdmin) {
      alert('Pembuatan template twibbon saat ini dibatasi hanya untuk Super Admin.');
      return;
    }

    if (uploadFileUrls.length === 0) {
      alert('Harap unggah minimal 1 berkas gambar bingkai PNG terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    const primaryUrl = uploadFileUrls[0];

    try {
      const res = await addTwibbon({
        title: uploadTitle,
        description: uploadDescription,
        category: 'Nasional',
        region: 'Nasional',
        imageUrl: primaryUrl,
        imageUrls: uploadFileUrls,
        aspectRatio: uploadAspectRatio,
        width: uploadWidth,
        height: uploadHeight,
        author: {
          name: currentUser.name || 'Desainer PKSart',
          avatar:
            currentUser.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        },
        status: isSuperAdmin ? 'Disetujui' : 'Pending',
        isFeatured: false,
      });

      if (res?.success === false) {
        alert(res.message || 'Terjadi kesalahan saat menambahkan Twibbon.');
        setIsSubmitting(false);
        return;
      }

      setUploadSuccess(true);
      setTimeout(() => {
        router.push('/twibbon');
      }, 1800);
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan template twibbon.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-12 transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Navigation Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            href="/twibbon"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-[#F26522] dark:hover:text-[#F26522] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Galeri Twibbon</span>
          </Link>
        </div>

        {/* Access Restriction Notice if user is non-admin and restricted mode is on */}
        {isMounted && !canCreateTwibbon && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-850 rounded-2xl flex items-start gap-3 text-xs text-red-800 dark:text-red-300">
            <ShieldAlert size={18} className="shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <p className="font-bold">Akses Dibatasi</p>
              <p className="mt-0.5 leading-relaxed">
                Pembuatan template twibbon saat ini dibatasi hanya untuk Super Admin PKSart. Jika Anda ingin mengajukan template twibbon resmi, silakan hubungi administrator.
              </p>
            </div>
          </div>
        )}

        {/* Super Admin Notice if restricted mode is active */}
        {isMounted && isOnlyAdminMode && isSuperAdmin && (
          <div className="mb-6 p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2.5">
              <ShieldAlert size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong>Mode Khusus Super Admin Aktif:</strong> Anda sedang membuat template dengan izin penuh Super Admin. Template yang Anda buat akan langsung berstatus <strong>Disetujui</strong> dan tampil di galeri.
              </span>
            </div>
          </div>
        )}

        {/* Main Form Container Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-150 dark:border-gray-800">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-5 mb-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
                <span className="p-2 bg-orange-50 dark:bg-orange-950/40 text-[#F26522] rounded-xl inline-flex items-center justify-center">
                  <Plus size={20} strokeWidth={2.5} />
                </span>
                <span>Buat Template Twibbon Baru</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                Buat dan publikasikan template bingkai PNG transparan agar kader, simpatisan, dan publik dapat memasang foto profil mereka.
              </p>
            </div>
          </div>

          {uploadSuccess ? (
            <div className="text-center py-12 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">
                Template Berhasil Dibuat!
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
                {isSuperAdmin
                  ? 'Template twibbon baru Anda berhasil dipublikasikan dan langsung tampil di galeri twibbon.'
                  : 'Template twibbon berhasil diajukan dan sedang menunggu moderasi Super Admin sebelum dipublikasikan.'}
              </p>
              <div className="pt-2">
                <span className="text-xs font-semibold text-[#F26522] animate-pulse">
                  Mengarahkan kembali ke galeri...
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Field 1: Judul Template */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Judul Template Twibbon <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Contoh: Twibbon Milad PKS ke-26, Spanduk Kemenangan Pilkada..."
                  className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30 transition-all"
                  required
                />
              </div>

              {/* Field 2: Multi-Format & Aspect Ratio Selector */}
              <div className="pt-2">
                <TwibbonAspectRatioSelector
                  aspectRatio={uploadAspectRatio}
                  onChangeAspectRatio={(ratio, w, h) => {
                    setUploadAspectRatio(ratio);
                    setUploadWidth(w);
                    setUploadHeight(h);
                  }}
                  width={uploadWidth}
                  height={uploadHeight}
                  onChangeWidth={setUploadWidth}
                  onChangeHeight={setUploadHeight}
                  autoDetectNotice={autoDetectNotice}
                  onClearAutoDetectNotice={() => setAutoDetectNotice(null)}
                />
              </div>

              {/* Field 3: Upload Bingkai PNG Transparan */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Unggah Bingkai PNG Transparan ({uploadFileUrls.length} Bingkai) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#F26522] font-extrabold flex items-center gap-1">
                    <Sparkles size={12} />
                    <span>Dapat memilih lebih dari 1 desain</span>
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                  Unggah gambar bingkai berformat PNG dengan area foto transparan sesuai kanvas target{' '}
                  <strong className="text-gray-800 dark:text-gray-200 font-bold">
                    {uploadWidth} × {uploadHeight} px ({uploadAspectRatio})
                  </strong>.
                </p>

                {/* Previews of Uploaded Frames */}
                {uploadFileUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4 max-h-72 overflow-y-auto p-1 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                    {uploadFileUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-2xl border-2 p-1.5 transition-all overflow-hidden group bg-white dark:bg-gray-900 ${
                          idx === 0
                            ? 'border-[#F26522] shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {/* Top-Left: Badge Utama / Tombol Set Utama */}
                        {idx === 0 ? (
                          <span className="absolute top-2.5 left-2.5 z-20 bg-[#F26522] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-orange-400/40">
                            <CheckCircle2 size={10} />
                            <span>Utama</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryUploadFrame(idx)}
                            className="absolute top-2.5 left-2.5 z-20 bg-white/95 dark:bg-gray-900/95 hover:bg-[#F26522] text-gray-700 hover:text-white dark:text-gray-300 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md border border-gray-200/90 dark:border-gray-700 transition-all cursor-pointer"
                            title="Klik untuk jadikan bingkai utama"
                          >
                            <span>#{idx + 1} Set Utama</span>
                          </button>
                        )}

                        {/* Top-Right: Tombol Hapus Bingkai */}
                        <button
                          type="button"
                          onClick={() => handleRemoveUploadFrame(idx)}
                          className="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-full bg-white/95 dark:bg-gray-900/95 text-gray-400 hover:text-white hover:bg-red-500 shadow-md border border-gray-200/90 dark:border-gray-700 flex items-center justify-center transition-all cursor-pointer"
                          title="Hapus bingkai ini"
                        >
                          <X size={12} strokeWidth={2.5} />
                        </button>

                        {/* Canvas Thumbnail Image */}
                        <div className="w-full aspect-square rounded-xl overflow-hidden relative flex items-center justify-center bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:6px_6px] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] bg-white dark:bg-gray-900">
                          <img
                            src={url}
                            alt={`Bingkai ${idx + 1}`}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Trigger Dropzone */}
                <label className="border-2 border-dashed border-purple-200 dark:border-purple-900/50 hover:border-[#F26522] bg-purple-50/40 dark:bg-purple-950/20 hover:bg-orange-50/10 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
                  <input
                    type="file"
                    accept="image/png"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploadingFile}
                  />

                  <div className="flex flex-col items-center gap-2 py-1">
                    <div className="p-3.5 bg-white dark:bg-gray-800 rounded-2xl text-purple-600 dark:text-purple-400 group-hover:text-[#F26522] group-hover:scale-105 shadow-sm transition-all">
                      <UploadCloud size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {isUploadingFile
                          ? 'Sedang memproses & mengunggah berkas...'
                          : uploadFileUrls.length > 0
                          ? '+ Tambah Desain Bingkai Lain (PNG)'
                          : 'Klik untuk Unggah Berkas Bingkai PNG'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Format PNG transparan • Bisa pilih banyak file sekaligus • Rekomendasi{' '}
                        {uploadWidth} × {uploadHeight} px
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Field 4: Deskripsi / Keterangan */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Keterangan / Informasi Template
                  </label>
                  <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                    {uploadDescription.length}/1000 karakter
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Tuliskan keterangan mengenai template twibbon ini, tagar pendukung, petunjuk penggunaan, atau pesan kampanye (opsional)..."
                  className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30 resize-none leading-relaxed transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-150 dark:border-gray-800 flex items-center justify-end gap-3">
                <Link
                  href="/twibbon"
                  className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold rounded-xl transition-all"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadFileUrls.length === 0}
                  className="px-6 py-2.5 bg-[#F26522] hover:bg-[#d85517] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan Template...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>{isSuperAdmin ? 'Publikasikan Template' : 'Ajukan Template Twibbon'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
