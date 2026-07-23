'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Users,
  Building,
  Settings,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Edit,
  Star,
  Download,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { PksLogo } from '@/components/PksLogo';
import { useData } from '@/context/DataContext';
import { Artwork } from '@/lib/types';

export default function AdminArtworksPage() {
  const { artworks, updateArtwork, deleteArtwork } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);

  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editRegion, setEditRegion] = useState('');

  const handleApprove = (id: string) => {
    updateArtwork(id, { status: 'Disetujui' } as any);
  };

  const handleReject = (id: string) => {
    updateArtwork(id, { status: 'Ditolak' } as any);
  };

  const handleToggleFeatured = (id: string, current?: boolean) => {
    updateArtwork(id, { isFeatured: !current });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus karya ini dari sistem?')) {
      deleteArtwork(id);
    }
  };

  const handleOpenEdit = (art: Artwork) => {
    setEditingArtwork(art);
    setEditTitle(art.title);
    setEditCategory(art.category);
    setEditRegion(art.region);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtwork) return;

    updateArtwork(editingArtwork.id, { title: editTitle, category: editCategory, region: editRegion });
    setEditingArtwork(null);
  };

  const filteredArtworks = artworks.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || art.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || (art as any).status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <ImageIcon className="text-[#F26522]" />
              <span>Kelola Seluruh Karya & Desain Poster</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Moderasi, edit metadata karya, jadikan pilihan utama (featured), atau hapus karya yang diunggah.
            </p>
          </div>

          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F26522] hover:bg-[#d85517] text-white text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus size={18} />
            <span>Tambah Karya Baru</span>
          </Link>
        </div>

        {/* Table Filter Container */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-extrabold text-gray-900">
                Daftar Postingan Karya
              </h2>
              <span className="bg-orange-50 text-[#F26522] text-xs font-bold px-2.5 py-1 rounded-full border border-orange-100">
                {filteredArtworks.length} Hasil
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul karya atau uploader..."
                  className="w-full bg-gray-50 text-sm rounded-xl pl-9 pr-4 py-2 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
                />
              </div>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#F26522]"
              >
                <option value="all">Semua Kategori</option>
                <option value="Poster">Poster</option>
                <option value="Spanduk">Spanduk</option>
                <option value="Social Media">Social Media</option>
                <option value="Infografis">Infografis</option>
                <option value="Templat">Templat</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#F26522]"
              >
                <option value="all">Semua Status</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Pending">Pending</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4">Artwork & Title</th>
                  <th className="py-3.5 px-4">Kategori & DPW</th>
                  <th className="py-3.5 px-4">Uploader / Kreator</th>
                  <th className="py-3.5 px-4">Format File</th>
                  <th className="py-3.5 px-4">Unduhan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredArtworks.map((art) => (
                  <tr key={art.id} className="hover:bg-gray-50/60 transition-colors">
                    
                    {/* Artwork & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={art.imageUrl}
                            alt={art.title}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                          />
                          {art.isFeatured && (
                            <span className="absolute -top-1 -right-1 bg-amber-400 text-white p-0.5 rounded-full shadow-sm" title="Karya Pilihan (Featured)">
                              <Star size={10} className="fill-white" />
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 max-w-xs truncate">
                            {art.title}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">ID: {art.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category & Region */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-800 block">{art.category}</span>
                      <span className="text-xs text-gray-500">{art.region}</span>
                    </td>

                    {/* Uploader */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={art.author.avatar}
                          alt={art.author.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <span className="font-semibold text-gray-800">{art.author.name}</span>
                      </div>
                    </td>

                    {/* Format File */}
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-gray-700">
                      {art.format || 'PSD/AI'}
                    </td>

                    {/* Downloads */}
                    <td className="py-3.5 px-4 font-semibold text-gray-700">
                      {art.downloadsCount}x
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          art.status === 'Disetujui'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : art.status === 'Pending'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            art.status === 'Disetujui'
                              ? 'bg-emerald-500'
                              : art.status === 'Pending'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        />
                        {art.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleFeatured(art.id, art.isFeatured)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            art.isFeatured
                              ? 'text-amber-500 bg-amber-50'
                              : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                          }`}
                          title={art.isFeatured ? 'Hapus dari Pilihan Utama' : 'Jadikan Pilihan Utama (Featured)'}
                        >
                          <Star size={16} className={art.isFeatured ? 'fill-amber-500' : ''} />
                        </button>

                        <Link
                          href={`/artwork/${art.id}`}
                          className="p-1.5 text-gray-500 hover:text-[#F26522] hover:bg-orange-50 rounded-lg transition-colors"
                          title="Lihat Detail Halaman"
                        >
                          <Eye size={16} />
                        </Link>

                        <button
                          onClick={() => handleOpenEdit(art)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Postingan"
                        >
                          <Edit size={16} />
                        </button>

                        {art.status !== 'Disetujui' && (
                          <button
                            onClick={() => handleApprove(art.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Setujui Karya"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {art.status !== 'Ditolak' && (
                          <button
                            onClick={() => handleReject(art.id)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Tolak Karya"
                          >
                            <XCircle size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(art.id)}
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

        {/* Edit Artwork Modal */}
        {editingArtwork && (
          <div
            onClick={() => setEditingArtwork(null)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 cursor-default"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Edit Metadata Karya (Admin)
              </h3>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Judul Karya
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#F26522]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Kategori
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#F26522]"
                  >
                    <option value="Poster">Poster</option>
                    <option value="Spanduk">Spanduk</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Infografis">Infografis</option>
                    <option value="Templat">Templat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Wilayah / Daerah DPW
                  </label>
                  <input
                    type="text"
                    value={editRegion}
                    onChange={(e) => setEditRegion(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#F26522]"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingArtwork(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

    </>
  );
}
