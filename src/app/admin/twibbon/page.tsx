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

export default function AdminTwibbonPage() {
  const { twibbons, addTwibbon, updateTwibbon, deleteTwibbon } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus frame Twibbon ini dari sistem?')) {
      deleteTwibbon(id);
    }
  };

  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await compressImageFile(file, 2, 1920, 0.85);
        setFilePreview(result.dataUrl);
        setFormData((prev) => ({ ...prev, imageUrl: result.dataUrl }));
      } catch (err: any) {
        alert(err.message || 'Gagal memproses gambar Twibbon.');
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
        imageUrl: formData.imageUrl || filePreview || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
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

  const filteredTwibbons = twibbons.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-purple-600" />
            <span>Kelola Frame Twibbon</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Controls Bar */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-extrabold text-gray-900">
              Daftar Frame Twibbon
            </h2>
            <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-100">
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
                className="w-full bg-gray-50 text-sm rounded-xl pl-9 pr-4 py-2 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#F26522]"
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
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-xs text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">Frame Twibbon</th>
                <th className="py-3.5 px-4">Kategori & DPW</th>
                <th className="py-3.5 px-4">Uploader</th>
                <th className="py-3.5 px-4">Penggunaan</th>
                <th className="py-3.5 px-4">Featured</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTwibbons.map((tw) => (
                <tr key={tw.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={tw.imageUrl}
                        alt={tw.title}
                        className="w-12 h-12 rounded-xl object-cover border border-purple-200 shrink-0 p-0.5 bg-purple-50"
                      />
                      <div>
                        <p className="font-bold text-gray-900 max-w-xs truncate">
                          {tw.title}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          ID: {tw.id} • {tw.createdAt}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{tw.category}</span>
                      <span className="text-xs text-gray-500">{tw.region}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={tw.author.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200'}
                        alt={tw.author.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-semibold text-gray-800">{tw.author.name}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full text-xs border border-purple-200">
                      <Layers size={13} />
                      <span>{tw.usedCount.toLocaleString()}x</span>
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleFeatured(tw.id, tw.isFeatured)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        tw.isFeatured
                          ? 'bg-amber-50 text-amber-500 border-amber-200'
                          : 'bg-gray-50 text-gray-300 border-gray-200 hover:text-amber-400'
                      }`}
                      title={tw.isFeatured ? 'Pilihan Utama (Featured)' : 'Sematkan Pilihan Utama'}
                    >
                      <Star size={16} className={tw.isFeatured ? 'fill-amber-400' : ''} />
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        tw.status === 'Disetujui'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : tw.status === 'Pending'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
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

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href="/twibbon"
                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Coba Twibbon Live"
                      >
                        <Eye size={16} />
                      </Link>

                      <button
                        onClick={() => openEditModal(tw)}
                        className="p-1.5 text-gray-500 hover:text-[#F26522] hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit Metadata"
                      >
                        <Edit size={16} />
                      </button>

                      {tw.status !== 'Disetujui' && (
                        <button
                          onClick={() => handleApprove(tw.id)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Setujui Twibbon"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}

                      {tw.status !== 'Ditolak' && (
                        <button
                          onClick={() => handleReject(tw.id)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Tolak Twibbon"
                        >
                          <XCircle size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(tw.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

      </div>

      {/* Add / Edit Twibbon Modal */}
      {(isAddModalOpen || editingTwibbon) && (
        <div
          onClick={() => {
            setIsAddModalOpen(false);
            setEditingTwibbon(null);
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 cursor-default"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingTwibbon ? 'Edit Metadata Frame Twibbon' : 'Tambah Frame Twibbon Official Baru'}
            </h3>

            <form onSubmit={handleSaveTwibbon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Judul Frame Twibbon
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Twibbon Milenial PKS 2026"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Unggah Berkas Gambar Frame PNG (Transparan)
                </label>
                
                {/* File Upload Box */}
                <label className="border-2 border-dashed border-purple-200 hover:border-[#F26522] bg-purple-50/50 hover:bg-orange-50/30 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
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
                        className="w-full max-h-48 aspect-square rounded-xl object-contain border border-purple-200 bg-white p-2 shadow-sm"
                      />
                      <span className="text-xs font-bold text-[#F26522] group-hover:underline">
                        Ganti Berkas Gambar (PNG)
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="p-3 bg-white rounded-full text-purple-600 group-hover:text-[#F26522] shadow-sm transition-colors">
                        <UploadCloud size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-gray-900">
                          Klik di sini untuk mengunggah berkas PNG Twibbon
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                          Disarankan format PNG transparansi (1080x1080px)
                        </p>
                      </div>
                    </div>
                  )}
                </label>

                {/* Fallback URL Input */}
                <div className="mt-2.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Atau tautan URL gambar (opsional):</span>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://domain.com/frame-twibbon.png"
                    className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Kategori Twibbon
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#F26522]"
                  >
                    <option value="Nasional">Nasional</option>
                    <option value="Milenial">Milenial</option>
                    <option value="Pemuda">Pemuda</option>
                    <option value="Daerah">Daerah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Wilayah / DPW
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="DPP PKS / DPW Jabar"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
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
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl"
                >
                  Simpan Twibbon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
