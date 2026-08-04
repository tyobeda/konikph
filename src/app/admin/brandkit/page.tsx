'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Plus, Search, Edit2, Trash2, Folder, Image as ImageIcon, FileText, Palette, Presentation } from 'lucide-react';
import { BrandKit } from '@/lib/types';

export default function AdminBrandKit() {
  const { brandKits, addBrandKit, updateBrandKit, deleteBrandKit } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<BrandKit | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    format: '',
    size: '',
    iconType: 'image',
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    fileUrl: '',
  });

  const filteredKits = brandKits.filter(kit =>
    kit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kit.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (kit?: BrandKit) => {
    if (kit) {
      setEditingKit(kit);
      setFormData({
        title: kit.title,
        category: kit.category,
        format: kit.format,
        size: kit.size,
        iconType: kit.iconType,
        color: kit.color,
        fileUrl: kit.fileUrl,
      });
    } else {
      setEditingKit(null);
      setFormData({
        title: '',
        category: '',
        format: '',
        size: '',
        iconType: 'image',
        color: 'bg-orange-50 text-[#F26522] border-orange-200',
        fileUrl: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingKit) {
      updateBrandKit(editingKit.id, formData);
    } else {
      addBrandKit(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus aset brand kit ini?')) {
      deleteBrandKit(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brand Kit & Aset</h1>
          <p className="text-sm text-gray-500">Kelola aset publikasi dan pedoman visual PKS</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-[#F26522] text-white rounded-lg hover:bg-[#d85417] transition flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Tambah Aset</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari aset..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26522] focus:border-transparent"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-sm text-gray-500">
                <th className="pb-3 font-medium">Informasi Aset</th>
                <th className="pb-3 font-medium">Kategori</th>
                <th className="pb-3 font-medium">Format</th>
                <th className="pb-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredKits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    Tidak ada data aset.
                  </td>
                </tr>
              ) : (
                filteredKits.map((kit) => (
                  <tr key={kit.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${kit.color}`}>
                          {kit.iconType === 'image' && <ImageIcon size={20} />}
                          {kit.iconType === 'file-text' && <FileText size={20} />}
                          {kit.iconType === 'palette' && <Palette size={20} />}
                          {kit.iconType === 'presentation' && <Presentation size={20} />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{kit.title}</p>
                          <p className="text-xs text-gray-500">{kit.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                        {kit.category}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-medium text-gray-600">
                      {kit.format}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(kit)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(kit.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingKit ? 'Edit Aset' : 'Tambah Aset Baru'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Aset</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                  placeholder="Misal: Logo Resmi PKS Vektor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                    placeholder="Misal: Logo Vektor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                  <input
                    type="text"
                    value={formData.format}
                    onChange={e => setFormData({ ...formData, format: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                    placeholder="Misal: AI / SVG / PNG"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ukuran File</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={e => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                    placeholder="Misal: 24.8 MB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL File</label>
                  <input
                    type="text"
                    value={formData.fileUrl}
                    onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                    placeholder="Tautan Google Drive / Canva"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ikon</label>
                  <select
                    value={formData.iconType}
                    onChange={e => setFormData({ ...formData, iconType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                  >
                    <option value="image">Gambar / Logo</option>
                    <option value="file-text">Dokumen / PDF</option>
                    <option value="palette">Palet Warna</option>
                    <option value="presentation">Presentasi / PPT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warna Ikon (Tailwind)</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="bg-orange-50 text-[#F26522] border-orange-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#F26522] text-white rounded-lg hover:bg-[#d85417] transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
