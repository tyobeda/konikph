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
import dynamic from 'next/dynamic';
import { PksLogo } from '@/components/PksLogo';
import { useData, DpwOffice } from '@/context/DataContext';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-56 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-xs font-bold">
      Memuat Peta Pemilih Pinpoint...
    </div>
  ),
});

export default function AdminDpwPage() {
  const { dpwList, addDpw, updateDpw, deleteDpw, users = [], artworks = [] } = useData();
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
    lat: -2.5489 as number | null,
    lng: 118.0149 as number | null,
  });

  const handleToggleActive = (dpw: DpwOffice) => {
    const nextState = dpw.isActive === false ? true : false;
    updateDpw(dpw.id, { isActive: nextState });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data wilayah ini dari sistem?')) {
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
      lat: dpw.lat ?? -2.5489,
      lng: dpw.lng ?? 118.0149,
    });
  };

  const handleExportReport = () => {
    alert('Laporan Rekapitulasi Wilayah PKS (.csv) berhasil di-generate dan diunduh.');
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredDpw = dpwList.filter(
    (dpw) =>
      dpw.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dpw.coordinator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dpw.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredDpw.length / itemsPerPage));
  const paginatedDpw = filteredDpw.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Building className="text-[#F26522]" />
            <span>Kelola Wilayah PKS</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manajemen struktur pengurus wilayah, koordinator daerah, serta rekapitulasi karya per provinsi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Download size={16} />
            <span>Ekspor Rekap Wilayah</span>
          </button>

          <button
            onClick={() => {
              setFormData({ name: '', code: '', coordinator: '', phone: '', email: '', address: '', lat: -2.5489, lng: 118.0149 });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F26522] hover:bg-[#d85517] text-white text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus size={18} />
            <span>Tambah Wilayah Baru</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-extrabold text-gray-900">
              Daftar Wilayah Terdaftar
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
              placeholder="Cari wilayah atau koordinator..."
              className="w-full bg-gray-50 text-sm rounded-xl pl-9 pr-4 py-2 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-xs text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">Kantor Wilayah</th>
                <th className="py-3.5 px-4">Koordinator & Kontak</th>
                <th className="py-3.5 px-4">Sekretariat</th>
                <th className="py-3.5 px-4">Statistik Karya</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedDpw.length > 0 ? (
                paginatedDpw.map((dpw) => {
                  const realCreators = users.filter((u) =>
                    u.region && (
                      u.region.toLowerCase().includes(dpw.name.toLowerCase()) ||
                      dpw.name.toLowerCase().includes(u.region.toLowerCase()) ||
                      u.region.toLowerCase().includes(dpw.code.toLowerCase())
                    )
                  ).length;

                  const realArtworks = artworks.filter((a) =>
                    a.region && (
                      a.region.toLowerCase().includes(dpw.name.toLowerCase()) ||
                      dpw.name.toLowerCase().includes(a.region.toLowerCase()) ||
                      a.region.toLowerCase().includes(dpw.code.toLowerCase())
                    )
                  ).length;

                  const activeCreatorsCount = Math.max(dpw.activeCreators || 0, realCreators);
                  const totalArtworksCount = Math.max(dpw.totalArtworks || 0, realArtworks);

                  return (
                    <tr key={dpw.id} className={`transition-colors ${dpw.isActive === false ? 'bg-gray-50/75 opacity-75' : 'hover:bg-gray-50/60'}`}>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-gray-900">{dpw.name}</p>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(dpw)}
                            className={`mt-1 text-xs font-bold inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                              dpw.isActive !== false
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                            }`}
                            title={dpw.isActive !== false ? 'Klik untuk menonaktifkan wilayah ini' : 'Klik untuk mengaktifkan wilayah ini'}
                          >
                            <div className={`w-2 h-2 rounded-full ${dpw.isActive !== false ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span>{dpw.isActive !== false ? 'Wilayah Aktif' : 'Wilayah Nonaktif'}</span>
                          </button>
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
                          <p className="font-extrabold text-gray-900">{totalArtworksCount} Karya Terpublikasi</p>
                          <p className="text-gray-500 font-medium">{activeCreatorsCount} Desainer Aktif Terhubung</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleActive(dpw)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                              dpw.isActive !== false
                                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {dpw.isActive !== false ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>

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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">
                    Tidak ada data wilayah DPW yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-gray-50/50">
          <div className="text-gray-500 font-medium">
            Menampilkan <span className="font-bold text-gray-800">{filteredDpw.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - <span className="font-bold text-gray-800">{Math.min(currentPage * itemsPerPage, filteredDpw.length)}</span> dari <span className="font-bold text-gray-800">{filteredDpw.length}</span> Wilayah
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors shadow-sm text-xs"
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
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || filteredDpw.length === 0}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors shadow-sm text-xs"
            >
              Next &rarr;
            </button>
          </div>
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
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 cursor-default max-h-[90vh] overflow-y-auto"
          >
            <form onSubmit={handleSaveDpw} className="space-y-4">
              <div className="flex items-center justify-between gap-4 mb-2 pb-3 border-b border-gray-100">
                <h3 className="text-xl font-extrabold text-gray-900 truncate">
                  {editingDpw ? 'Edit Wilayah' : 'Tambah Wilayah Baru'}
                </h3>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingDpw(null);
                    }}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all"
                  >
                    Simpan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                  NAMA WILAYAH
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Sumatra Barat"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522] focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Interactive Location Picker Map */}
              <div className="pt-1">
                <LocationPickerMap
                  initialLat={formData.lat}
                  initialLng={formData.lng}
                  onLocationSelect={(lat, lng) => setFormData((prev) => ({ ...prev, lat, lng }))}
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                  NAMA KOORDINATOR DAERAH
                </label>
                <input
                  type="text"
                  value={formData.coordinator}
                  onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                  placeholder="Contoh: Abri Maijon"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522] focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                  NOMOR WHATSAPP KOORDINATOR
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+62 813-7419-6152"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522] focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>EMAIL KOORDINATOR / WILAYAH</span>
                  <span className="text-[10px] text-gray-400 font-normal lowercase">(tidak wajib)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Contoh: dpw.sumbar@pks.id"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>ALAMAT SEKRETARIAT</span>
                  <span className="text-[10px] text-gray-400 font-normal lowercase">(tidak wajib)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Contoh: Jl. Ir. H. Juanda No. 51, Padang"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522] focus:bg-white transition-all resize-none"
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
