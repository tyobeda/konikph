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
} from 'lucide-react';
import { USERS } from '@/lib/data';
import { useData, TwibbonFrame } from '@/context/DataContext';
import { compressImageFile } from '@/lib/imageCompressor';
import { ConfirmSuspendModal as ConfirmModal } from '@/components/ConfirmSuspendModal';

export default function AdminTwibbonPage() {
  const { twibbons, addTwibbon, updateTwibbon, deleteTwibbon } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deletingTwibbon, setDeletingTwibbon] = useState<TwibbonFrame | null>(null);

  // Modal State for Adding/Editing Twibbon
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTwibbon, setEditingTwibbon] = useState<TwibbonFrame | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Nasional',
    region: 'DPP PKS',
    imageUrl: '',
  });

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

  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formDataPayload = new FormData();
        formDataPayload.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formDataPayload });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Upload gagal');
        setFilePreview(data.url);
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      } catch (err: any) {
        alert(err.message || 'Gagal upload gambar Twibbon.');
      }
    }
  };

  const handleSaveTwibbon = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTwibbon) {
      updateTwibbon(editingTwibbon.id, {
        title: formData.title,
        category: formData.category,
        region: formData.region,
        imageUrl: formData.imageUrl || editingTwibbon.imageUrl,
      });
      setEditingTwibbon(null);
    } else {
      addTwibbon({
        title: formData.title,
        imageUrl: formData.imageUrl || filePreview || '/img/877859417715829.jpg',
        category: formData.category,
        region: formData.region,
        author: {
          name: 'Super Admin PKS',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        },
        status: 'Disetujui',
        isFeatured: true,
      });
      setIsAddModalOpen(false);
    }
    setFilePreview(null);
  };

  const openEditModal = (tw: TwibbonFrame) => {
    setEditingTwibbon(tw);
    setFilePreview(null);
    setFormData({
      title: tw.title,
      category: tw.category,
      region: tw.region,
      imageUrl: tw.imageUrl,
    });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const filteredTwibbons = twibbons.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.region.toLowerCase().includes(searchQuery.toLowerCase());
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
            setFormData({ title: '', category: 'Nasional', region: 'DPP PKS', imageUrl: '' });
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F26522] hover:bg-[#d85517] text-white text-sm font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus size={18} />
          <span>Tambah Twibbon Official</span>
        </button>
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
                      <img
                        src={tw.imageUrl}
                        alt={tw.title}
                        className="w-12 h-12 rounded-xl object-cover border border-purple-200 dark:border-purple-800 shrink-0 p-0.5 bg-purple-50 dark:bg-purple-950/40"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white max-w-xs truncate">
                          {tw.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                          digunakan {tw.usedCount.toLocaleString()} kali
                        </p>
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
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 cursor-default"
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
                  placeholder="Contoh: Twibbon Milenial PKS 2026"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                  Unggah Berkas Gambar Frame PNG (Transparan)
                </label>
                
                {/* File Upload Box */}
                <label className="border-2 border-dashed border-purple-200 dark:border-purple-800/60 hover:border-[#F26522] dark:hover:border-[#F26522] bg-purple-50/50 dark:bg-purple-950/20 hover:bg-orange-50/30 dark:hover:bg-orange-950/20 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
                  <input
                    type="file"
                    accept="image/png,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {filePreview || formData.imageUrl ? (
                    <div className="w-full flex flex-col items-center gap-2">
                      <img
                        src={filePreview || formData.imageUrl}
                        alt="Preview Twibbon"
                        className="w-full max-h-48 aspect-square rounded-xl object-contain border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-800 p-2 shadow-sm"
                      />
                      <span className="text-xs font-bold text-[#F26522] dark:text-[#ff7a38] group-hover:underline">
                        Ganti Berkas Gambar (PNG)
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-full text-purple-600 dark:text-purple-400 group-hover:text-[#F26522] shadow-sm transition-colors">
                        <UploadCloud size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-gray-900 dark:text-white">
                          Klik di sini untuk mengunggah berkas PNG Twibbon
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                          Disarankan format PNG transparansi (1080x1080px)
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Kategori Twibbon
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#F26522]"
                  >
                    <option value="Nasional">Nasional</option>
                    <option value="Milenial">Milenial</option>
                    <option value="Pemuda">Pemuda</option>
                    <option value="Daerah">Daerah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Wilayah
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="DPP PKS / Jawa Barat"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTwibbon(null);
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
