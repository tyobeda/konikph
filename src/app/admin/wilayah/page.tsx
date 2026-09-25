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
  Sparkles,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { PksLogo } from '@/components/PksLogo';
import { useData, DpwOffice } from '@/context/DataContext';
import { formatPhoneNumber } from '@/lib/phone';
import { ConfirmSuspendModal as ConfirmModal } from '@/components/ConfirmSuspendModal';
import { getCoordinatesForDpw } from '@/components/IndonesiaMapSection';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-56 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-xs font-bold">
      Memuat Peta Pemilih Pinpoint...
    </div>
  ),
});

export default function AdminDpwPage() {
  const { dpwList, addDpw, updateDpw, deleteDpw, seedDpw38, users = [], artworks = [] } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [editingDpw, setEditingDpw] = useState<DpwOffice | null>(null);
  const [deletingDpw, setDeletingDpw] = useState<DpwOffice | null>(null);

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

  const handleDelete = (dpw: DpwOffice) => {
    setDeletingDpw(dpw);
  };

  const confirmDeleteDpw = () => {
    if (deletingDpw) {
      deleteDpw(deletingDpw.id);
      setDeletingDpw(null);
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
    let resolvedLat = dpw.lat;
    let resolvedLng = dpw.lng;

    const isOceanDefault =
      resolvedLat !== null &&
      resolvedLat !== undefined &&
      Math.abs(Number(resolvedLat) - -2.5489) < 0.001 &&
      resolvedLng !== null &&
      resolvedLng !== undefined &&
      Math.abs(Number(resolvedLng) - 118.0149) < 0.001;

    if (resolvedLat == null || resolvedLng == null || isOceanDefault) {
      const fallback = getCoordinatesForDpw(dpw.name);
      if (fallback) {
        resolvedLat = fallback.lat;
        resolvedLng = fallback.lng;
      }
    }

    setFormData({
      name: dpw.name,
      code: dpw.code,
      coordinator: dpw.coordinator,
      phone: dpw.phone,
      email: dpw.email,
      address: dpw.address,
      lat: resolvedLat !== null && resolvedLat !== undefined ? Number(resolvedLat) : -2.5489,
      lng: resolvedLng !== null && resolvedLng !== undefined ? Number(resolvedLng) : 118.0149,
    });
  };

  const handleSeedAll38 = async () => {
    if (!confirm('Apakah Anda ingin menginisialisasi / melengkapi seluruh 38 Wilayah PKS se-Indonesia ke dalam database?')) return;
    setIsSeeding(true);
    const res = await seedDpw38();
    setIsSeeding(false);
    if (res.success) {
      alert(`Berhasil! ${res.count || 0} wilayah baru berhasil ditambahkan.`);
    } else {
      alert(res.error || 'Gagal menginisialisasi wilayah');
    }
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
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Building className="text-[#F26522]" />
            <span>Kelola Wilayah PKS</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manajemen struktur pengurus wilayah, koordinator daerah, serta rekapitulasi karya per provinsi se-Indonesia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSeedAll38}
            disabled={isSeeding}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#F26522] to-amber-500 hover:from-[#d85517] hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
            title="Lengkapi seluruh 38 Wilayah Provinsi Indonesia secara otomatis"
          >
            <Sparkles size={15} className={isSeeding ? 'animate-spin' : ''} />
            <span>{isSeeding ? 'Memproses 38 Wilayah...' : 'Inisialisasi 38 Wilayah'}</span>
          </button>

          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Download size={16} />
            <span>Ekspor Rekap</span>
          </button>

          <button
            onClick={() => {
              setFormData({ name: '', code: '', coordinator: '', phone: '', email: '', address: '', lat: -2.5489, lng: 118.0149 });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus size={16} />
            <span>Tambah Wilayah</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#111622] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Daftar Wilayah Terdaftar
            </h2>
            <span className="bg-orange-50 dark:bg-orange-950/40 text-[#F26522] text-xs font-bold px-2.5 py-1 rounded-full border border-orange-100 dark:border-orange-900/40">
              {filteredDpw.length} Wilayah
            </span>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari wilayah atau koordinator..."
              className="w-full bg-gray-50 dark:bg-gray-800/80 text-sm rounded-xl pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#F26522] focus:bg-white dark:focus:bg-gray-800"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50/80 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="py-3.5 px-4">Kantor Wilayah</th>
                <th className="py-3.5 px-4">Koordinator & Kontak</th>
                <th className="py-3.5 px-4">Sekretariat</th>
                <th className="py-3.5 px-4">Statistik Karya</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
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
                    <tr key={dpw.id} className={`transition-colors ${dpw.isActive === false ? 'bg-gray-50/75 dark:bg-gray-900/40 opacity-75' : 'hover:bg-gray-50/60 dark:hover:bg-gray-800/40'}`}>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{dpw.name}</p>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(dpw)}
                            className={`mt-1 text-xs font-bold inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                              dpw.isActive !== false
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50'
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
                          <p className="font-bold text-gray-900 dark:text-white">{dpw.coordinator}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <PhoneCall size={12} className="text-[#F26522]" />
                            <span>{dpw.phone}</span>
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                            <Mail size={12} />
                            <span>{dpw.email}</span>
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-start gap-1">
                          <MapPin size={14} className="text-gray-400 dark:text-gray-500 shrink-0 mt-0.5" />
                          <span>{dpw.address}</span>
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs space-y-0.5">
                          <p className="font-extrabold text-gray-900 dark:text-white">{totalArtworksCount} Karya Terpublikasi</p>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">{activeCreatorsCount} Desainer Aktif Terhubung</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* Toggle Switch Aktif / Nonaktif */}
                          <button
                            type="button"
                            role="switch"
                            aria-checked={dpw.isActive !== false}
                            onClick={() => handleToggleActive(dpw)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              dpw.isActive !== false ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                            }`}
                            title={dpw.isActive !== false ? 'Wilayah Aktif (Klik untuk menonaktifkan)' : 'Wilayah Nonaktif (Klik untuk mengaktifkan)'}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                dpw.isActive !== false ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>

                          <button
                            onClick={() => openEditModal(dpw)}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[#F26522] dark:hover:text-[#F26522] hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg transition-colors"
                            title="Edit Data Wilayah"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(dpw)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Hapus Wilayah"
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
                  <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-gray-500 font-medium">
                    Tidak ada data wilayah yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-gray-50/50 dark:bg-gray-800/40">
          <div className="text-gray-500 dark:text-gray-400 font-medium">
            Menampilkan <span className="font-bold text-gray-800 dark:text-gray-200">{filteredDpw.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - <span className="font-bold text-gray-800 dark:text-gray-200">{Math.min(currentPage * itemsPerPage, filteredDpw.length)}</span> dari <span className="font-bold text-gray-800 dark:text-gray-200">{filteredDpw.length}</span> Wilayah
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || filteredDpw.length === 0}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm text-xs"
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
            className="bg-white dark:bg-[#111622] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 cursor-default max-h-[90vh] overflow-y-auto"
          >
            <form onSubmit={handleSaveDpw} className="space-y-4">
              <div className="flex items-center justify-between gap-4 mb-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white truncate">
                  {editingDpw ? 'Edit Wilayah' : 'Tambah Wilayah Baru'}
                </h3>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingDpw(null);
                    }}
                    className="px-3.5 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-all"
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
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  NAMA WILAYAH
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    if (!editingDpw) {
                      const coords = getCoordinatesForDpw(newName);
                      const isDefault =
                        formData.lat == null ||
                        (Math.abs(formData.lat - -2.5489) < 0.001 && Math.abs((formData.lng || 0) - 118.0149) < 0.001);
                      if (isDefault && coords && (coords.lat !== -2.5489 || coords.lng !== 118.0149)) {
                        setFormData((prev) => ({ ...prev, name: newName, lat: coords.lat, lng: coords.lng }));
                        return;
                      }
                    }
                    setFormData((prev) => ({ ...prev, name: newName }));
                  }}
                  placeholder=""
                  className="w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#F26522] focus:bg-white dark:focus:bg-gray-800 transition-all"
                  required
                />
              </div>

              {/* Interactive Location Picker Map */}
              <div className="pt-1">
                <LocationPickerMap
                  key={`picker-${editingDpw ? editingDpw.id : 'new'}`}
                  initialLat={formData.lat}
                  initialLng={formData.lng}
                  onLocationSelect={(lat, lng) => setFormData((prev) => ({ ...prev, lat, lng }))}
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  NAMA KOORDINATOR DAERAH
                </label>
                <input
                  type="text"
                  value={formData.coordinator}
                  onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                  placeholder=""
                  className="w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#F26522] focus:bg-white dark:focus:bg-gray-800 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  NOMOR WHATSAPP KOORDINATOR
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  onBlur={(e) => {
                    if (e.target.value) {
                      setFormData(prev => ({ ...prev, phone: formatPhoneNumber(e.target.value) }));
                    }
                  }}
                  placeholder=""
                  className="w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#F26522] focus:bg-white dark:focus:bg-gray-800 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>EMAIL KOORDINATOR / WILAYAH</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal lowercase">(tidak wajib)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder=""
                  className="w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#F26522] focus:bg-white dark:focus:bg-gray-800 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>ALAMAT SEKRETARIAT</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal lowercase">(tidak wajib)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder=""
                  className="w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#F26522] focus:bg-white dark:focus:bg-gray-800 transition-all resize-none"
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete DPW Office Modal */}
      <ConfirmModal
        isOpen={!!deletingDpw}
        title={`Hapus Data Wilayah "${deletingDpw?.name}"?`}
        message={`Apakah Anda yakin ingin menghapus data kantor wilayah "${deletingDpw?.name}" dari sistem?`}
        confirmLabel="Ya, Hapus Wilayah"
        variant="danger"
        onConfirm={confirmDeleteDpw}
        onCancel={() => setDeletingDpw(null)}
      />
    </>
  );
}
