'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Eye,
  Star,
  Download,
  Share2,
  Layers,
  UploadCloud,
  ShieldCheck,
  Users,
  Maximize2,
  X,
} from 'lucide-react';
import { USERS } from '@/lib/data';
import { useData, TwibbonFrame } from '@/context/DataContext';
import { ConfirmSuspendModal as ConfirmModal } from '@/components/ConfirmSuspendModal';
import { 
  TwibbonAspectRatioSelector, 
  detectImageDimensions, 
  getAspectRatioMeta, 
  AspectRatioType 
} from '@/components/TwibbonAspectRatioSelector';

export default function AdminTwibbonPage() {
  const { twibbons, addTwibbon, updateTwibbon, deleteTwibbon, siteSettings, updateSiteSettings } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deletingTwibbon, setDeletingTwibbon] = useState<TwibbonFrame | null>(null);

  // Access Control State for Twibbon Template Creation
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);
  const [accessToast, setAccessToast] = useState<string | null>(null);

  const handleSetTwibbonAccess = async (restrictedToAdmin: boolean) => {
    if (isUpdatingAccess) return;
    setIsUpdatingAccess(true);
    
    // Optimistically update context
    updateSiteSettings({ onlyAdminCanCreateTwibbon: restrictedToAdmin });

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onlyAdminCanCreateTwibbon: restrictedToAdmin }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Gagal menyimpan perubahan');
      }
      setAccessToast(
        restrictedToAdmin
          ? 'Mode Aktif: Pembuatan Twibbon dibatasi HANYA untuk Super Admin (Umum dimatikan).'
          : 'Mode Aktif: Pembuatan Twibbon kini DIBUKA untuk SEMUA pengguna/kreator.'
      );
    } catch (err: any) {
      alert('Gagal update pengaturan: ' + err.message);
    } finally {
      setIsUpdatingAccess(false);
      setTimeout(() => setAccessToast(null), 3500);
    }
  };

  // Modal State for Adding/Editing Twibbon
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTwibbon, setEditingTwibbon] = useState<TwibbonFrame | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrls: [] as string[],
    aspectRatio: '1:1' as AspectRatioType,
    width: 1080,
    height: 1080,
  });
  const [autoDetectNotice, setAutoDetectNotice] = useState<string | null>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const handleApprove = (id: string) => {
    updateTwibbon(id, { status: 'Disetujui' });
  };

  const handleReject = (id: string) => {
    updateTwibbon(id, { status: 'Ditolak' });
  };

  const handleToggleFeatured = (id: string, current: boolean) => {
    updateTwibbon(id, { isFeatured: !current });
  };

  const handleDelete = (tw: TwibbonFrame) => {
    setDeletingTwibbon(tw);
  };

  const confirmDeleteTwibbon = () => {
    if (deletingTwibbon) {
      deleteTwibbon(deletingTwibbon.id);
      setDeletingTwibbon(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingFiles(true);

    // Auto-detect dimensions from first uploaded file
    try {
      const firstFile = files[0];
      const detected = await detectImageDimensions(firstFile);
      setFormData((prev) => ({
        ...prev,
        aspectRatio: detected.matchedPreset,
        width: detected.width,
        height: detected.height,
      }));

      const presetLabel = detected.matchedPreset === '1:1' ? '1:1 Persegi' :
                          detected.matchedPreset === '9:16' ? '9:16 Story' :
                          detected.matchedPreset === '4:5' ? '4:5 Portrait' :
                          detected.matchedPreset === '2:3' ? '2:3 Poster' :
                          detected.matchedPreset === '16:9' ? '16:9 Landscape' : 'Kustom';
      setAutoDetectNotice(`Ukuran PNG terdeteksi: ${detected.width} × ${detected.height} px (Format ${presetLabel} otomatis diterapkan)`);
    } catch (_) {}

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataPayload = new FormData();
        formDataPayload.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formDataPayload });
        const data = await res.json();
        if (data.success && data.url) {
          newUrls.push(data.url);
        }
      }
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...newUrls],
      }));
    } catch (err: any) {
      alert(err.message || 'Gagal upload gambar Twibbon.');
    } finally {
      setIsUploadingFiles(false);
      e.target.value = '';
    }
  };

  const handleRemoveFrame = (idxToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== idxToRemove),
    }));
  };

  const handleSetPrimaryFrame = (idx: number) => {
    setFormData((prev) => {
      const copy = [...prev.imageUrls];
      const [item] = copy.splice(idx, 1);
      return { ...prev, imageUrls: [item, ...copy] };
    });
  };

  const handleSaveTwibbon = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.imageUrls.length === 0) {
      alert('Mohon unggah minimal 1 berkas gambar frame PNG transparan!');
      return;
    }
    const primaryUrl = formData.imageUrls[0];
    if (editingTwibbon) {
      updateTwibbon(editingTwibbon.id, {
        title: formData.title,
        description: formData.description,
        imageUrl: primaryUrl,
        imageUrls: formData.imageUrls,
        aspectRatio: formData.aspectRatio,
        width: formData.width,
        height: formData.height,
      });
      setEditingTwibbon(null);
    } else {
      addTwibbon({
        title: formData.title,
        description: formData.description,
        imageUrl: primaryUrl,
        imageUrls: formData.imageUrls,
        aspectRatio: formData.aspectRatio,
        width: formData.width,
        height: formData.height,
        category: 'Nasional',
        region: 'Nasional',
        author: {
          name: 'Super Admin KONI',
          avatar: '/favicon.ico',
        },
        status: 'Disetujui',
        isFeatured: true,
      });
      setIsAddModalOpen(false);
    }
    setFormData({
      title: '',
      description: '',
      imageUrls: [],
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
    });
    setAutoDetectNotice(null);
  };

  const openEditModal = (tw: TwibbonFrame) => {
    setEditingTwibbon(tw);
    const existingFrames = (tw.imageUrls && tw.imageUrls.length > 0) ? tw.imageUrls : (tw.imageUrl ? [tw.imageUrl] : []);
    setFormData({
      title: tw.title,
      description: tw.description || '',
      imageUrls: existingFrames,
      aspectRatio: (tw.aspectRatio as AspectRatioType) || '1:1',
      width: tw.width || 1080,
      height: tw.height || 1080,
    });
    setAutoDetectNotice(null);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const filteredTwibbons = twibbons.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.region || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTwibbons.length / itemsPerPage));
  const paginatedTwibbons = filteredTwibbons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-purple-600 dark:text-purple-400" />
            <span>Kelola Frame Twibbon</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manajemen bingkai twibbon resmi, persetujuan uploader, serta pengaturan twibbon pilihan utama.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: '',
              description: '',
              imageUrls: [],
              aspectRatio: '1:1',
              width: 1080,
              height: 1080,
            });
            setAutoDetectNotice(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F26522] hover:bg-[#d85517] text-white text-sm font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus size={18} />
          <span>Tambah Twibbon Official</span>
        </button>
      </div>

      {/* Toast Feedback */}
      {accessToast && (
        <div className="mb-6 p-4 rounded-2xl bg-[#F26522] text-white text-xs sm:text-sm font-bold shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} />
            <span>{accessToast}</span>
          </div>
          <button onClick={() => setAccessToast(null)} className="text-white/80 hover:text-white">
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Switch Akses Pembuatan Template Twibbon */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6 mb-8 shadow-sm transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 transition-colors ${
              siteSettings?.onlyAdminCanCreateTwibbon
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
            }`}>
              {siteSettings?.onlyAdminCanCreateTwibbon ? <ShieldCheck size={26} /> : <Users size={26} />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Pengaturan Izin Pembuatan Template Twibbon
                </h3>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  siteSettings?.onlyAdminCanCreateTwibbon
                    ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {siteSettings?.onlyAdminCanCreateTwibbon ? '🔒 Khusus Super Admin' : '🌐 Terbuka untuk Umum'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
                {siteSettings?.onlyAdminCanCreateTwibbon
                  ? 'Saat ini pembuatan twibbon DIMATIKAN UNTUK UMUM. Tombol "+ Buat Template Twibbon" di galeri publik (/twibbon) hanya akan muncul dan dapat diakses oleh akun Super Admin.'
                  : 'Saat ini pembuatan twibbon DIBUKA UNTUK UMUM. Semua pengguna atau kreator yang login diizinkan mengunggah dan membuat template twibbon baru.'}
              </p>
            </div>
          </div>

          {/* Mode Switch & Segmented Options */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => handleSetTwibbonAccess(true)}
                disabled={isUpdatingAccess}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  siteSettings?.onlyAdminCanCreateTwibbon
                    ? 'bg-[#F26522] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck size={14} />
                <span>Khusus Admin (Matikan Umum)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetTwibbonAccess(false)}
                disabled={isUpdatingAccess}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  !siteSettings?.onlyAdminCanCreateTwibbon
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Users size={14} />
                <span>Buka untuk Semua</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        
        {/* Controls Bar */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Daftar Frame Twibbon
            </h2>
            <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-100 dark:border-purple-800/40">
              {filteredTwibbons.length} Bingkai
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul twibbon atau wilayah..."
                className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-xl pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#F26522]"
            >
              <option value="all">Semua Status</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Pending">Pending</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50/80 dark:bg-gray-800/60 text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="py-3.5 px-4 text-left">Frame Twibbon</th>
                <th className="py-3.5 px-4 text-center">Kategori & Wilayah</th>
                <th className="py-3.5 px-4 text-center">Uploader</th>
                <th className="py-3.5 px-4 text-center">Featured</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedTwibbons.map((tw) => (
                <tr key={tw.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                  {/* Frame Twibbon - Rata Kiri */}
                  <td className="py-3 px-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl border border-purple-200 dark:border-purple-800 shrink-0 p-1 bg-purple-50/50 dark:bg-purple-950/30 flex items-center justify-center overflow-hidden">
                        <img
                          src={tw.imageUrl}
                          alt={tw.title}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white max-w-xs truncate">
                          {tw.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                            digunakan {tw.usedCount.toLocaleString()} kali
                          </p>

                          {/* Aspect Ratio Badge */}
                          {(() => {
                            const ratioMeta = getAspectRatioMeta(tw.aspectRatio, tw.width, tw.height);
                            return (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 px-1.5 py-0.5 rounded-md">
                                <Maximize2 size={10} className="shrink-0" />
                                <span>{ratioMeta.badge}</span>
                              </span>
                            );
                          })()}

                          {tw.imageUrls && tw.imageUrls.length > 1 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-orange-50 dark:bg-orange-950/40 text-[#F26522] border border-orange-200/80 dark:border-orange-900/40 px-1.5 py-0.5 rounded-md">
                              <Layers size={10} /> {tw.imageUrls.length} Pilihan Bingkai
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Kategori & Wilayah - Rata Tengah */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-gray-800 dark:text-gray-200">{tw.category}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{tw.region}</span>
                    </div>
                  </td>

                  {/* Uploader - Rata Tengah */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <img
                        src={tw.author.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200'}
                        alt={tw.author.name}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                      <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">{tw.author.name}</span>
                    </div>
                  </td>

                  {/* Featured - Tanpa Container */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleFeatured(tw.id, tw.isFeatured)}
                      className={`p-1.5 transition-colors inline-flex items-center justify-center ${
                        tw.isFeatured
                          ? 'text-amber-500 hover:text-amber-600'
                          : 'text-gray-300 dark:text-gray-600 hover:text-amber-400'
                      }`}
                      title={tw.isFeatured ? 'Pilihan Utama (Featured)' : 'Sematkan Pilihan Utama'}
                    >
                      <Star size={18} className={tw.isFeatured ? 'fill-amber-400' : ''} />
                    </button>
                  </td>

                  {/* Status - Tanpa Container */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                        tw.status === 'Disetujui'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : tw.status === 'Pending'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          tw.status === 'Disetujui'
                            ? 'bg-emerald-500'
                            : tw.status === 'Pending'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                      />
                      {tw.status}
                    </span>
                  </td>

                  {/* Aksi - Rata Kanan */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href="/twibbon"
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg transition-colors"
                        title="Coba Twibbon Live"
                      >
                        <Eye size={16} />
                      </Link>

                      <button
                        onClick={() => openEditModal(tw)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[#F26522] dark:hover:text-[#ff7a38] hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg transition-colors"
                        title="Edit Metadata"
                      >
                        <Edit size={16} />
                      </button>

                      {tw.status !== 'Disetujui' && (
                        <button
                          onClick={() => handleApprove(tw.id)}
                          className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
                          title="Setujui Twibbon"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}

                      {tw.status !== 'Ditolak' && (
                        <button
                          onClick={() => handleReject(tw.id)}
                          className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors"
                          title="Tolak Twibbon"
                        >
                          <XCircle size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(tw)}
                        className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Hapus Permanent"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div>
              Halaman <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> dari <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm font-bold"
              >
                &larr; Prev
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm font-bold"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Add / Edit Twibbon Modal */}
      {(isAddModalOpen || editingTwibbon) && (
        <div
          onClick={() => {
            setIsAddModalOpen(false);
            setEditingTwibbon(null);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 dark:border-gray-800 cursor-default max-h-[92vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingTwibbon ? 'Edit Metadata Frame Twibbon' : 'Tambah Frame Twibbon Official Baru'}
            </h3>

            <form onSubmit={handleSaveTwibbon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Judul Frame Twibbon
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Twibbon Semangat Porprov Bengkulu 2026"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              {/* Multi-Format & Aspect Ratio Selector */}
              <TwibbonAspectRatioSelector
                aspectRatio={formData.aspectRatio}
                onChangeAspectRatio={(ratio, w, h) => {
                  setFormData((prev) => ({
                    ...prev,
                    aspectRatio: ratio,
                    width: w,
                    height: h,
                  }));
                }}
                width={formData.width}
                height={formData.height}
                onChangeWidth={(w) => setFormData((prev) => ({ ...prev, width: w }))}
                onChangeHeight={(h) => setFormData((prev) => ({ ...prev, height: h }))}
                autoDetectNotice={autoDetectNotice}
                onClearAutoDetectNotice={() => setAutoDetectNotice(null)}
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                    Berkas Gambar Frame PNG ({formData.imageUrls.length} Bingkai)
                  </label>
                  <span className="text-[11px] text-[#F26522] font-semibold">
                    Bisa lebih dari 1 bingkai
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                  Unggah berkas PNG transparan sesuai rasio ({formData.width} × {formData.height} px). Jika mengunggah lebih dari satu, pengunjung dapat memilih bingkai mana yang ingin digunakan.
                </p>

                {/* Previews of Uploaded Frames */}
                {formData.imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3 max-h-56 overflow-y-auto p-1">
                    {formData.imageUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-2xl border-2 p-1 transition-all overflow-hidden group ${
                          idx === 0
                            ? 'border-[#F26522] bg-orange-50/30 dark:bg-orange-950/20 shadow-xs'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:border-gray-300'
                        }`}
                      >
                        {/* Top-Left: Badge Utama / Tombol Jadikan Utama */}
                        {idx === 0 ? (
                          <span className="absolute top-2 left-2 z-20 bg-[#F26522] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-orange-400/40">
                            <CheckCircle size={10} />
                            <span>Utama</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryFrame(idx)}
                            className="absolute top-2 left-2 z-20 bg-white/95 dark:bg-gray-900/95 hover:bg-[#F26522] text-gray-700 hover:text-white dark:text-gray-300 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md border border-gray-200/90 dark:border-gray-700 transition-all cursor-pointer"
                            title="Klik untuk jadikan bingkai utama"
                          >
                            <span>#{idx + 1} Set Utama</span>
                          </button>
                        )}

                        {/* Top-Right: Tombol Hapus Bingkai */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFrame(idx)}
                          className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-white/95 dark:bg-gray-900/95 text-gray-400 hover:text-white hover:bg-red-500 shadow-md border border-gray-200/90 dark:border-gray-700 flex items-center justify-center transition-all cursor-pointer"
                          title="Hapus bingkai ini"
                        >
                          <X size={12} strokeWidth={2.5} />
                        </button>

                        {/* Canvas Thumbnail Image */}
                        <div className="w-full aspect-square rounded-xl overflow-hidden relative flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] bg-white dark:bg-gray-900">
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
                
                {/* File Upload Box */}
                <label className="border-2 border-dashed border-purple-200 dark:border-purple-800/60 hover:border-[#F26522] dark:hover:border-[#F26522] bg-purple-50/50 dark:bg-purple-950/20 hover:bg-orange-50/30 dark:hover:bg-orange-950/20 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
                  <input
                    type="file"
                    accept="image/png,image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploadingFiles}
                  />

                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <div className="p-2.5 bg-white dark:bg-gray-800 rounded-full text-purple-600 dark:text-purple-400 group-hover:text-[#F26522] shadow-sm transition-colors">
                      <UploadCloud size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-gray-900 dark:text-white">
                        {isUploadingFiles ? 'Sedang mengunggah berkas...' : formData.imageUrls.length > 0 ? '+ Tambah Desain Bingkai Lain (PNG)' : 'Klik untuk Unggah Berkas Bingkai PNG'}
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                        Bisa pilih banyak file sekaligus (PNG transparan)
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                    Keterangan
                  </label>
                  <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                    {formData.description.length}/1000 karakter
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tulis keterangan atau deskripsi template twibbon ini (opsional, maks 1000 karakter)..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#F26522] resize-none leading-relaxed transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTwibbon(null);
                    setFormData({
                      title: '',
                      description: '',
                      imageUrls: [],
                      aspectRatio: '1:1',
                      width: 1080,
                      height: 1080,
                    });
                    setAutoDetectNotice(null);
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Simpan Twibbon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Twibbon Frame Modal */}
      <ConfirmModal
        isOpen={!!deletingTwibbon}
        title={`Hapus Twibbon "${deletingTwibbon?.title}"?`}
        message={`Apakah Anda yakin ingin menghapus frame Twibbon "${deletingTwibbon?.title}" ini dari sistem secara permanen?`}
        confirmLabel="Ya, Hapus Twibbon"
        variant="danger"
        onConfirm={confirmDeleteTwibbon}
        onCancel={() => setDeletingTwibbon(null)}
      />
    </>
  );
}
