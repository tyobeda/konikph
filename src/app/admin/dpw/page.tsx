'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building,
  Plus,
  Search,
  PhoneCall,
  Mail,
  Edit,
  Trash2,
  Download,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { PksLogo } from '@/components/PksLogo';
import { useData, DpwOffice } from '@/context/DataContext';

export default function AdminDpwPage() {
  const { dpwList, addDpw, updateDpw, deleteDpw } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDpw, setEditingDpw] = useState<DpwOffice | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    coordinator: '',
    phone: '',
    email: '',
    address: '',
  });

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data wilayah DPW ini dari sistem?')) {
      deleteDpw(id);
    }
  };

  const handleSaveDpw = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDpw) {
      updateDpw(editingDpw.id, formData);
      setEditingDpw(null);
    } else {
      addDpw(formData);
      setIsAddModalOpen(false);
    }
  };

  const openEditModal = (dpw: DpwOffice) => {
    setEditingDpw(dpw);
    setFormData({
      name: dpw.name,
      code: dpw.code,
      coordinator: dpw.coordinator,
      phone: dpw.phone,
      email: dpw.email,
      address: dpw.address,
    });
  };

  const handleExportReport = () => {
    alert('Laporan Rekapitulasi DPW PKS (.csv) berhasil di-generate dan diunduh.');
  };

  const filteredDpw = dpwList.filter(
    (dpw) =>
      dpw.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dpw.coordinator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dpw.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Building className="text-[#F26522]" />
            <span>Kelola Wilayah DPW PKS</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manajemen struktur pengurus wilayah DPW, koordinator daerah, serta rekapitulasi karya per provinsi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Download size={16} />
            <span>Ekspor Rekap DPW</span>
          </button>

          <button
            onClick={() => {
              setFormData({ name: '', code: '', coordinator: '', phone: '', email: '', address: '' });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F26522] hover:bg-[#d85517] text-white text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus size={18} />
            <span>Tambah DPW Baru</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-extrabold text-gray-900">
              Daftar Wilayah DPW Terdaftar
            </h2>
            <span className="bg-orange-50 text-[#F26522] text-xs font-bold px-2.5 py-1 rounded-full border border-orange-100">
              {filteredDpw.length} Wilayah
            </span>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari wilayah DPW atau koordinator..."
              className="w-full bg-gray-50 text-sm rounded-xl pl-9 pr-4 py-2 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-xs text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">Kantor DPW</th>
                <th className="py-3.5 px-4">Koordinator & Kontak</th>
                <th className="py-3.5 px-4">Sekretariat</th>
                <th className="py-3.5 px-4">Statistik Karya</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDpw.map((dpw) => (
                <tr key={dpw.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F26522] font-black flex items-center justify-center text-xs shrink-0 border border-orange-100">
                        {dpw.code.split('-')[1] || 'DPW'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{dpw.name}</p>
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle size={12} />
                          <span>DPW Aktif</span>
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <p className="font-bold text-gray-900">{dpw.coordinator}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <PhoneCall size={12} className="text-[#F26522]" />
                        <span>{dpw.phone}</span>
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Mail size={12} />
                        <span>{dpw.email}</span>
                      </p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-xs text-gray-600 truncate flex items-start gap-1">
                      <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                      <span>{dpw.address}</span>
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-xs space-y-0.5">
                      <p className="font-extrabold text-gray-900">{dpw.totalArtworks} Karya Terpublikasi</p>
                      <p className="text-gray-500 font-medium">{dpw.activeCreators} Kreator Aktif</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(dpw)}
                        className="p-1.5 text-gray-500 hover:text-[#F26522] hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit Data DPW"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(dpw.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus DPW"
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

      {/* Add/Edit DPW Modal */}
      {(isAddModalOpen || editingDpw) && (
        <div
          onClick={() => {
            setIsAddModalOpen(false);
            setEditingDpw(null);
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 cursor-default"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingDpw ? 'Edit Data DPW' : 'Tambah Wilayah DPW Baru'}
            </h3>

            <form onSubmit={handleSaveDpw} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nama Wilayah DPW
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: DPW PKS Jawa Barat"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Kode Wilayah
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Contoh: DPW-JABAR"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nama Koordinator Daerah
                </label>
                <input
                  type="text"
                  value={formData.coordinator}
                  onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                  placeholder="Nama Penanggung Jawab DPW"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nomor WhatsApp Koordinator
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="081234567890"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Email Sekretariat DPW
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sekretariat@dpw.pks.id"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Alamat Sekretariat DPW
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Alamat Kantor DPW"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingDpw(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl"
                >
                  Simpan DPW
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
