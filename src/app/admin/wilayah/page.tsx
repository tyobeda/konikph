'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Search,
  PhoneCall,
  Edit,
  Trash2,
  Download,
  Calendar,
  MapPin,
  Mail,
  Users,
  ImageIcon,
  Sparkles,
  CheckCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useData, DpwOffice } from '@/context/DataContext';
import { formatPhoneNumber } from '@/lib/phone';
import { ConfirmSuspendModal as ConfirmModal } from '@/components/ConfirmSuspendModal';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-52 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 text-xs font-bold">
      Memuat Peta Lokasi Latihan...
    </div>
  ),
});

const CABOR_CATEGORIES = [
  'Bela Diri',
  'Bola Besar',
  'Bola Kecil',
  'Raket',
  'Atletik',
  'Akuatik',
  'Akurasi',
  'Olahraga Otak',
  'Ketangkasan',
  'Daya Tahan',
  'Kebugaran',
  'E-Sport',
  'Induk Organisasi',
  'Lainnya',
];

export default function AdminCaborPage() {
  const { dpwList, addDpw, updateDpw, deleteDpw, users = [], artworks = [] } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCabor, setEditingCabor] = useState<DpwOffice | null>(null);
  const [deletingCabor, setDeletingCabor] = useState<DpwOffice | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    coordinator: '',
    phone: '',
    email: '',
    address: 'GOR Tebat Monok, Kepahiang',
    category: 'Bela Diri',
    schedule: '',
    description: '',
    orderIndex: 0,
    lat: -3.6496 as number | null,
    lng: 102.5768 as number | null,
  });

  const handleToggleActive = (cabor: DpwOffice) => {
    const nextState = cabor.isActive === false ? true : false;
    updateDpw(cabor.id, { isActive: nextState });
  };

  const handleDelete = (cabor: DpwOffice) => {
    setDeletingCabor(cabor);
  };

  const confirmDeleteCabor = () => {
    if (deletingCabor) {
      deleteDpw(deletingCabor.id);
      setDeletingCabor(null);
    }
  };

  const handleSaveCabor = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCabor) {
      updateDpw(editingCabor.id, formData);
      setEditingCabor(null);
    } else {
      addDpw(formData);
      setIsAddModalOpen(false);
    }
  };

  const openEditModal = (cabor: DpwOffice) => {
    setEditingCabor(cabor);
    setFormData({
      name: cabor.name,
      code: cabor.code,
      coordinator: cabor.coordinator,
      phone: cabor.phone,
      email: cabor.email || '',
      address: cabor.address || 'GOR Tebat Monok, Kepahiang',
      category: cabor.category || 'Bela Diri',
      schedule: cabor.schedule || '',
      description: cabor.description || '',
      orderIndex: cabor.orderIndex || 0,
      lat: cabor.lat !== null && cabor.lat !== undefined ? Number(cabor.lat) : -3.6496,
      lng: cabor.lng !== null && cabor.lng !== undefined ? Number(cabor.lng) : 102.5768,
    });
  };

  const handleExportReport = () => {
    const csvRows = [
      ['ID', 'Nama Cabang Olahraga', 'Singkatan', 'Kategori', 'Ketua Cabor', 'WhatsApp', 'Email', 'Sekretariat', 'Jadwal Latihan', 'Status'].join(','),
      ...dpwList.map((c) =>
        [
          `"${c.id}"`,
          `"${c.name}"`,
          `"${c.code}"`,
          `"${c.category || 'Umum'}"`,
          `"${c.coordinator}"`,
          `"${c.phone}"`,
          `"${c.email || ''}"`,
          `"${(c.address || '').replace(/"/g, '""')}"`,
          `"${(c.schedule || '').replace(/"/g, '""')}"`,
          `"${c.isActive !== false ? 'Aktif' : 'Nonaktif'}"`,
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_cabor_koni_kepahiang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const filteredCabor = dpwList.filter((cabor) => {
    const matchesSearch =
      cabor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cabor.coordinator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cabor.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cabor.category && cabor.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'Semua' || cabor.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCabor.length / itemsPerPage));
  const paginatedCabor = filteredCabor.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const activeCaborCount = dpwList.filter((c) => c.isActive !== false).length;

  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shadow-xs">
              <Trophy size={20} />
            </div>
            <span>Cabang Olahraga (Cabor)</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manajemen 23 Cabang Olahraga binaan KONI Kabupaten Kepahiang, pengurus cabor, jadwal latihan, dan lokasi latihan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download size={15} />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => {
              setFormData({
                name: '',
                code: '',
                coordinator: '',
                phone: '',
                email: '',
                address: 'GOR Tebat Monok, Kepahiang',
                category: 'Bela Diri',
                schedule: '',
                description: '',
                orderIndex: dpwList.length + 1,
                lat: -3.6496,
                lng: 102.5768,
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-red-600/20 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Tambah Cabor</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
          <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Cabor</div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{dpwList.length}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Terdaftar di Kepahiang</div>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Status Aktif</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCaborCount}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Cabor Beroperasi</div>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
          <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Pengurus / Atlet</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{users.length}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Akun Terdaftar</div>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
          <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Konten & Foto</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{artworks.length}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Dokumentasi Kegiatan</div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#111622] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-gray-900 dark:text-white">Daftar Cabor</span>
            <span className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-100 dark:border-red-900/40">
              {filteredCabor.length} Cabor
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 max-w-lg">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto bg-gray-50 dark:bg-gray-800/80 text-xs font-semibold rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-red-600 cursor-pointer"
            >
              <option value="Semua">Semua Kategori</option>
              {CABOR_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search size={15} className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari cabor, singkatan, ketua..."
                className="w-full bg-gray-50 dark:bg-gray-800/80 text-xs rounded-xl pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-red-600 focus:bg-white dark:focus:bg-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50/80 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="py-3.5 px-4">Cabang Olahraga</th>
                <th className="py-3.5 px-4">Ketua & WhatsApp</th>
                <th className="py-3.5 px-4">Sekretariat & Jadwal</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedCabor.length > 0 ? (
                paginatedCabor.map((cabor) => (
                  <tr
                    key={cabor.id}
                    className={`transition-colors ${
                      cabor.isActive === false
                        ? 'bg-gray-50/75 dark:bg-gray-900/40 opacity-75'
                        : 'hover:bg-gray-50/60 dark:hover:bg-gray-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm">
                            {cabor.name}
                          </span>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase">
                            {cabor.code}
                          </span>
                        </div>
                        {cabor.category && (
                          <span className="mt-1 inline-block text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900/40">
                            {cabor.category}
                          </span>
                        )}
                        {cabor.description && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-1 max-w-xs">
                            {cabor.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-900 dark:text-white text-xs">{cabor.coordinator}</p>
                        {cabor.phone ? (
                          <a
                            href={`https://wa.me/${cabor.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <PhoneCall size={12} />
                            <span>{cabor.phone}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-start gap-1.5 text-gray-600 dark:text-gray-300">
                          <MapPin size={13} className="text-red-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{cabor.address || 'GOR Tebat Monok'}</span>
                        </div>
                        {cabor.schedule && (
                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                            <Clock size={12} className="shrink-0 text-amber-500" />
                            <span className="line-clamp-1 text-[11px]">{cabor.schedule}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(cabor)}
                        className={`text-[11px] font-bold inline-flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          cabor.isActive !== false
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                        }`}
                        title={cabor.isActive !== false ? 'Klik untuk menonaktifkan cabor ini' : 'Klik untuk mengaktifkan cabor ini'}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${cabor.isActive !== false ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span>{cabor.isActive !== false ? 'Aktif' : 'Nonaktif'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(cabor)}
                          className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          title="Edit Cabor"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cabor)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Hapus Cabor"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-gray-500 font-medium">
                    Tidak ada data cabang olahraga yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-gray-50/50 dark:bg-gray-800/40">
          <div className="text-gray-500 dark:text-gray-400 font-medium">
            Menampilkan <span className="font-bold text-gray-800 dark:text-gray-200">{filteredCabor.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - <span className="font-bold text-gray-800 dark:text-gray-200">{Math.min(currentPage * itemsPerPage, filteredCabor.length)}</span> dari <span className="font-bold text-gray-800 dark:text-gray-200">{filteredCabor.length}</span> Cabang Olahraga
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-xs text-xs cursor-pointer"
            >
              &larr; Prev
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-red-600 text-white shadow-xs'
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
              disabled={currentPage === totalPages || filteredCabor.length === 0}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-xs text-xs cursor-pointer"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Cabor Modal */}
      {(isAddModalOpen || editingCabor) && (
        <div
          onClick={() => {
            setIsAddModalOpen(false);
            setEditingCabor(null);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#111622] rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 cursor-default max-h-[90vh] overflow-y-auto"
          >
            <form onSubmit={handleSaveCabor} className="space-y-4">
              <div className="flex items-center justify-between gap-4 mb-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-black text-gray-900 dark:text-white truncate flex items-center gap-2">
                  <Trophy size={18} className="text-red-600" />
                  <span>{editingCabor ? 'Edit Cabang Olahraga' : 'Tambah Cabang Olahraga Baru'}</span>
                </h3>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingCabor(null);
                    }}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Simpan Cabor
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Nama Cabor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Pencak Silat (IPSI)"
                    className="w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:bg-white dark:focus:bg-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Singkatan / Kode Cabor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Contoh: IPSI, FORKI, PSSI"
                    className="w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:bg-white dark:focus:bg-gray-800 uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Kategori Olahraga <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-red-600 cursor-pointer"
                  >
                    {CABOR_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Ketua Cabor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.coordinator}
                    onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                    placeholder="Nama Ketua Cabor"
                    className="w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:bg-white dark:focus:bg-gray-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    WhatsApp Ketua / Sekretaris <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    onBlur={(e) => {
                      if (e.target.value) {
                        setFormData((prev) => ({ ...prev, phone: formatPhoneNumber(e.target.value) }));
                      }
                    }}
                    placeholder="081234567890"
                    className="w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:bg-white dark:focus:bg-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Email Resmi Cabor
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="cabor@konikph.site"
                    className="w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:bg-white dark:focus:bg-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Alamat Sekretariat / Basecamp
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="GOR Tebat Monok, Kepahiang"
                  className="w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:bg-white dark:focus:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Jadwal Latihan Rutin
                </label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="Contoh: Selasa & Kamis 15:30 WIB di GOR Tebat Monok"
                  className="w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:bg-white dark:focus:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Deskripsi & Profil Singkat
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Profil singkat pembinaan cabang olahraga..."
                  className="w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:bg-white dark:focus:bg-gray-800"
                />
              </div>

              {/* Pinpoint Map */}
              <div className="pt-1">
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Titik Koordinat Lokasi Latihan
                </label>
                <LocationPickerMap
                  key={`picker-${editingCabor ? editingCabor.id : 'new'}`}
                  initialLat={formData.lat}
                  initialLng={formData.lng}
                  onLocationSelect={(lat, lng) => setFormData((prev) => ({ ...prev, lat, lng }))}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Cabor Modal */}
      <ConfirmModal
        isOpen={!!deletingCabor}
        title={`Hapus Cabor "${deletingCabor?.name}"?`}
        message={`Apakah Anda yakin ingin menghapus data cabang olahraga "${deletingCabor?.name}" dari sistem KONI Kepahiang?`}
        confirmLabel="Ya, Hapus Cabor"
        variant="danger"
        onConfirm={confirmDeleteCabor}
        onCancel={() => setDeletingCabor(null)}
      />
    </>
  );
}
