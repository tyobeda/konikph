'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Folder,
  Image as ImageIcon,
  FileText,
  Palette,
  Presentation,
  Upload,
  ExternalLink,
  X,
  Link2,
} from 'lucide-react';
import { BrandKit } from '@/lib/types';
import { ConfirmSuspendModal as ConfirmModal } from '@/components/ConfirmSuspendModal';

export default function AdminBrandKit() {
  const { brandKits, addBrandKit, updateBrandKit, deleteBrandKit, isBrandKitsLoaded } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<BrandKit | null>(null);
  const [deletingKit, setDeletingKit] = useState<BrandKit | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Logo',
    format: '.ai / .svg / .png',
    iconType: 'image',
    color: 'bg-orange-50 text-[#F26522] border-orange-200',
    fileUrl: '',
    previewUrl: '',
  });

  const triggerDirectDownload = async (fileUrl: string, fileName?: string) => {
    if (!fileUrl) return;

    let finalUrl = fileUrl;
    const driveMatch = fileUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      finalUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
    }

    if (finalUrl.startsWith('/uploads/') || (typeof window !== 'undefined' && finalUrl.startsWith(window.location.origin))) {
      try {
        const response = await fetch(finalUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName || finalUrl.split('/').pop() || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        return;
      } catch {
        // Fallback
      }
    }

    const link = document.createElement('a');
    link.href = finalUrl;
    link.setAttribute('download', fileName || 'download');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDisplayImage = (kit: { previewUrl?: string | null; fileUrl?: string; iconType?: string }) => {
    if (kit.previewUrl && kit.previewUrl.trim() !== '') return kit.previewUrl;
    if (kit.fileUrl && (/\.(jpg|jpeg|png|webp|svg|gif)($|\?)/i.test(kit.fileUrl) || kit.fileUrl.startsWith('/uploads/'))) {
      return kit.fileUrl;
    }
    return null;
  };

  const filteredKits = brandKits.filter(
    (kit) =>
      kit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kit.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kit.format.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredKits.length / ITEMS_PER_PAGE));
  const paginatedKits = filteredKits.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenModal = (kit?: BrandKit) => {
    if (kit) {
      setEditingKit(kit);
      setFormData({
        title: kit.title,
        category: kit.category,
        format: kit.format,
        iconType: kit.iconType,
        color: kit.color,
        fileUrl: kit.fileUrl,
        previewUrl: kit.previewUrl || '',
      });
    } else {
      setEditingKit(null);
      setFormData({
        title: '',
        category: 'Logo',
        format: '.ai / .svg / .png',
        iconType: 'image',
        color: 'bg-orange-50 text-[#F26522] border-orange-200',
        fileUrl: '',
        previewUrl: '',
      });
    }
    setIsModalOpen(true);
  };

  const handlePreviewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const formDataPayload = new FormData();
        formDataPayload.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formDataPayload });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Upload gambar preview gagal');

        setFormData((prev) => ({
          ...prev,
          previewUrl: data.url,
          fileUrl: prev.fileUrl || data.url,
          title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
        }));
      } catch (err: any) {
        alert(err.message || 'Gagal mengunggah gambar pratinjau.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.title) {
      alert('Harap isi judul aset terlebih dahulu.');
      return;
    }

    const isFileUrlImage = /\.(jpg|jpeg|png|webp|svg|gif)($|\?)/i.test(formData.fileUrl) || formData.fileUrl.startsWith('/uploads/');
    const finalPayload = {
      ...formData,
      previewUrl: formData.previewUrl || (isFileUrlImage ? formData.fileUrl : ''),
    };

    try {
      if (editingKit) {
        await updateBrandKit(editingKit.id, finalPayload);
      } else {
        await addBrandKit(finalPayload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Gagal menyimpan aset: ' + (err.message || 'Terjadi kesalahan'));
    }
  };

  const handleDelete = (kit: BrandKit) => {
    setDeletingKit(kit);
  };

  const confirmDeleteKit = () => {
    if (deletingKit) {
      deleteBrandKit(deletingKit.id);
      setDeletingKit(null);
    }
  };

  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Folder className="text-[#F26522]" />
            <span>Brand Kit & Pedoman Visual PKS</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manajemen aset publikasi resmi, berkas logo vektor, palet warna, dan templat presentasi.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F26522] hover:bg-[#d85517] text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={18} />
          <span>Tambah Aset Baru</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Daftar Berkas & Aset Brand Kit
            </h2>
            <span className="bg-orange-50 dark:bg-orange-950/40 text-[#F26522] dark:text-[#ff7a38] text-xs font-bold px-2.5 py-1 rounded-full border border-orange-100 dark:border-orange-900/40">
              {filteredKits.length} Aset
            </span>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aset, format, atau kategori..."
              className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-xl pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50/80 dark:bg-gray-800/60 text-xs text-gray-500 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="py-3.5 px-4">Informasi Aset & Pratinjau</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Format File</th>
                <th className="py-3.5 px-4 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {!isMounted || (!isBrandKitsLoaded && brandKits.length === 0) ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 dark:text-gray-500 font-medium animate-pulse">
                    Memuat berkas aset brand kit...
                  </td>
                </tr>
              ) : paginatedKits.length > 0 ? (
                paginatedKits.map((kit) => {
                  const displayImg = getDisplayImage(kit);
                  return (
                    <tr key={kit.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {displayImg ? (
                            <div
                              onClick={() => setPreviewImage(displayImg)}
                              className="w-11 h-11 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-0.5 shadow-sm group cursor-pointer relative"
                              title="Klik untuk memperbesar pratinjau"
                            >
                              <img
                                src={displayImg}
                                alt={kit.title}
                                className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-200"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${kit.color}`}
                            >
                              {kit.iconType === 'image' && <ImageIcon size={18} />}
                              {kit.iconType === 'file-text' && <FileText size={18} />}
                              {kit.iconType === 'palette' && <Palette size={18} />}
                              {kit.iconType === 'presentation' && <Presentation size={18} />}
                            </div>
                          )}

                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{kit.title}</p>
                            {kit.fileUrl && kit.fileUrl !== '#' ? (
                              <button
                                type="button"
                                onClick={() => triggerDirectDownload(kit.fileUrl, kit.title)}
                                className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#F26522] dark:hover:text-[#ff7a38] flex items-center gap-1 font-mono mt-0.5 cursor-pointer group"
                                title={kit.fileUrl}
                              >
                                <ExternalLink size={11} className="text-[#F26522] dark:text-[#ff7a38] shrink-0" />
                                <span className="truncate max-w-[260px] group-hover:underline">{kit.fileUrl}</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono mt-0.5 block italic">
                                Belum ada tautan download
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-950/40 text-[#F26522] dark:text-[#ff7a38] border border-orange-100 dark:border-orange-900/40 rounded-lg text-xs font-bold">
                          {kit.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-gray-200 lowercase">
                        {kit.format}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenModal(kit)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                            title="Edit Aset"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(kit)}
                            className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Hapus Aset"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 dark:text-gray-500 font-medium">
                    Tidak ada berkas aset brand kit yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-gray-50/50 dark:bg-gray-800/40">
          <div className="text-gray-500 dark:text-gray-400 font-medium">
            Menampilkan{' '}
            <span className="font-bold text-gray-800 dark:text-white">
              {filteredKits.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}
            </span>{' '}
            -{' '}
            <span className="font-bold text-gray-800 dark:text-white">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredKits.length)}
            </span>{' '}
            dari <span className="font-bold text-gray-800 dark:text-white">{filteredKits.length}</span> Berkas Aset
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm text-xs"
            >
              &larr; Prev
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentPage === page
                      ? 'bg-[#F26522] text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || filteredKits.length === 0}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm text-xs"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Asset Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 dark:border-gray-800 cursor-default animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span>{editingKit ? 'Edit Aset Brand Kit' : 'Tambah Aset Baru'}</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Judul Aset
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-[#F26522] text-sm font-semibold"
                  placeholder="Misal: Logo Resmi PKS Vektor"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-[#F26522] text-sm font-semibold"
                    placeholder="Misal: Logo Vektor"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Format File
                  </label>
                  <input
                    type="text"
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-[#F26522] text-sm font-semibold lowercase"
                    placeholder="Misal: .ai / .svg / .png"
                  />
                </div>
              </div>

              {/* Download File Link Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                  <span>Tautan Download Berkas Utama (Drive / Canva / Dropbox)</span>
                  <Link2 size={12} className="text-[#F26522]" />
                </label>
                <input
                  type="text"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-[#F26522] text-sm font-semibold"
                  placeholder="Paste tautan Google Drive / Canva / Dropbox / URL berkas"
                />
              </div>

              {/* Upload Image Preview Option */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Unggah Gambar Pratinjau (Thumbnail)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer bg-orange-50/40 dark:bg-orange-950/20 hover:bg-orange-50 dark:hover:bg-orange-950/30 border border-dashed border-[#F26522]/40 dark:border-[#F26522]/50 rounded-xl py-3 px-3 flex items-center justify-center gap-2 text-xs font-bold text-[#F26522] dark:text-[#ff7a38] transition-colors">
                    <Upload size={16} className="text-[#F26522] dark:text-[#ff7a38]" />
                    <span>{isUploading ? 'Mengunggah Gambar Preview...' : 'Pilih Foto / Gambar Preview Komputer'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePreviewImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              {/* Live Preview Box in Modal */}
              {(formData.previewUrl || getDisplayImage({ fileUrl: formData.fileUrl })) && (
                <div className="p-3 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.previewUrl || getDisplayImage({ fileUrl: formData.fileUrl }) || ''}
                      alt="Pratinjau Aset"
                      className="w-16 h-16 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm shrink-0 bg-gray-50 dark:bg-gray-800"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">Gambar Pratinjau Siap Tampil</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-emerald-200 dark:border-emerald-800">
                        ✓ File gambar berhasil diunggah
                      </span>
                    </div>
                  </div>

                  {formData.previewUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, previewUrl: '' })}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Hapus gambar preview"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Tipe Ikon Aset
                  </label>
                  <div className="flex items-center gap-2 py-1">
                    {[
                      { type: 'image', icon: <ImageIcon size={16} />, label: 'Gambar / Logo' },
                      { type: 'file-text', icon: <FileText size={16} />, label: 'Dokumen / PDF' },
                      { type: 'palette', icon: <Palette size={16} />, label: 'Palet Warna' },
                      { type: 'presentation', icon: <Presentation size={16} />, label: 'Presentasi' },
                    ].map((iconOpt) => (
                      <button
                        key={iconOpt.type}
                        type="button"
                        onClick={() => setFormData({ ...formData, iconType: iconOpt.type })}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                          formData.iconType === iconOpt.type
                            ? 'bg-[#F26522] border-[#F26522] text-white shadow-sm'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={iconOpt.label}
                      >
                        {iconOpt.icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Warna Tema Aset
                  </label>
                  <div className="flex items-center gap-2 py-1">
                    {[
                      { key: 'bg-orange-50 text-orange-600 border-orange-200', bgClass: 'bg-orange-500' },
                      { key: 'bg-blue-50 text-blue-600 border-blue-200', bgClass: 'bg-blue-500' },
                      { key: 'bg-green-50 text-green-600 border-green-200', bgClass: 'bg-green-500' },
                      { key: 'bg-purple-50 text-purple-600 border-purple-200', bgClass: 'bg-purple-500' },
                      { key: 'bg-amber-50 text-amber-600 border-amber-200', bgClass: 'bg-amber-500' },
                      { key: 'bg-red-50 text-red-600 border-red-200', bgClass: 'bg-red-500' },
                    ].map((colorOpt) => (
                      <button
                        key={colorOpt.key}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: colorOpt.key })}
                        className={`w-6 h-6 rounded-full ${colorOpt.bgClass} transition-all cursor-pointer ${
                          formData.color === colorOpt.key
                            ? 'ring-2 ring-offset-2 ring-[#F26522] scale-110'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-5 mt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Simpan Aset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[85vh] p-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors z-10"
              title="Tutup"
            >
              <X size={18} />
            </button>
            <img
              src={previewImage}
              alt="Pratinjau Penuh Aset"
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Confirm Delete BrandKit Asset Modal */}
      <ConfirmModal
        isOpen={!!deletingKit}
        title={`Hapus Aset "${deletingKit?.title}"?`}
        message={`Apakah Anda yakin ingin menghapus aset brand kit "${deletingKit?.title}" ini dari sistem?`}
        confirmLabel="Ya, Hapus Aset"
        variant="danger"
        onConfirm={confirmDeleteKit}
        onCancel={() => setDeletingKit(null)}
      />
    </>
  );
}
