'use client';

import React, { useState, useEffect } from 'react';
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
  BadgeCheck,
  Edit,
  Trash2,
  Ban,
  ArrowUpRight,
  Mail,
  PhoneCall,
  MapPin,
} from 'lucide-react';
import { PksLogo } from '@/components/PksLogo';
import { ConfirmSuspendModal } from '@/components/ConfirmSuspendModal';
import { useData } from '@/context/DataContext';
import { User } from '@/lib/types';

export default function AdminCreatorsPage() {
  const { 
    users, 
    toggleVerifyUser, 
    toggleSuspendUser, 
    deleteUser, 
    updateUser,
    resetRequests,
    completeResetRequest,
    deleteResetRequest
  } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'creators' | 'resets'>('creators');
  const [editingCreator, setEditingCreator] = useState<User | null>(null);
  const [suspendingUser, setSuspendingUser] = useState<User | null>(null);

  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    region: '',
    role: 'Kreator',
  });

  const handleToggleVerified = (id: string) => {
    toggleVerifyUser(id);
  };

  const handleToggleStatus = (creator: User) => {
    setSuspendingUser(creator);
  };

  const confirmSuspendUser = () => {
    if (suspendingUser) {
      toggleSuspendUser(suspendingUser.id);
      setSuspendingUser(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus akun kreator ini dari sistem?')) {
      deleteUser(id);
    }
  };

  const openEditModal = (creator: User) => {
    setEditingCreator(creator);
    setFormData({
      name: creator.name,
      email: creator.email,
      phone: creator.phone || '',
      region: creator.region,
      role: creator.role || 'Kreator',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCreator) return;

    updateUser(editingCreator.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      region: formData.region,
      role: formData.role,
    });
    setEditingCreator(null);
  };

  const formatPhoneForWA = (phone: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return clean;
  };

  const filteredCreators = users.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResets = resetRequests.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = activeTab === 'resets' ? filteredResets.length : filteredCreators.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedResets = filteredResets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const paginatedCreators = filteredCreators.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Users className="text-[#F26522]" />
              <span>Kelola Kreator & Member PKSart</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Verifikasi lencana Kreator PKS Official, kelola kontak WhatsApp/Email, dan kontrol status akun.
            </p>
          </div>
        </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200 mb-6 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('creators')}
          className={`pb-3 relative transition-all ${
            activeTab === 'creators'
              ? 'text-[#F26522] border-b-2 border-[#F26522]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Kreator Terdaftar ({filteredCreators.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('resets')}
          className={`pb-3 relative transition-all flex items-center gap-1.5 ${
            activeTab === 'resets'
              ? 'text-[#F26522] border-b-2 border-[#F26522]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Permintaan Reset ({resetRequests.filter((r) => r.status === 'Pending').length})</span>
          {resetRequests.filter((r) => r.status === 'Pending').length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
              {resetRequests.filter((r) => r.status === 'Pending').length}
            </span>
          )}
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-extrabold text-gray-900">
              {activeTab === 'resets' ? 'Permintaan Reset Kata Sandi' : 'Daftar Kreator Terdaftar'}
            </h2>
            <span className="bg-orange-50 text-[#F26522] text-xs font-bold px-2.5 py-1 rounded-full border border-orange-100">
              {activeTab === 'resets' ? filteredResets.length : filteredCreators.length} {activeTab === 'resets' ? 'Permintaan' : 'Akun'}
            </span>
          </div>

            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, email, atau DPW..."
                className="w-full bg-gray-50 text-sm rounded-xl pl-9 pr-4 py-2 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F26522]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                {activeTab === 'resets' ? (
                  <tr>
                    <th className="py-3.5 px-4">Nama Lengkap</th>
                    <th className="py-3.5 px-4">Alamat Email</th>
                    <th className="py-3.5 px-4">Nomor WhatsApp</th>
                    <th className="py-3.5 px-4">Tanggal Pengajuan</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi Admin</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="py-3.5 px-4">Kreator & Lencana</th>
                    <th className="py-3.5 px-4">Kontak WhatsApp & Email</th>
                    <th className="py-3.5 px-4">Wilayah DPW</th>
                    <th className="py-3.5 px-4">Total Karya</th>
                    <th className="py-3.5 px-4">Status Akun</th>
                    <th className="py-3.5 px-4 text-right">Aksi Admin</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeTab === 'resets' ? (
                  paginatedResets.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900">{req.name}</td>
                      <td className="py-3.5 px-4 font-medium text-gray-600">{req.email}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        <span className="flex items-center gap-1">
                          <PhoneCall size={12} className="text-emerald-600" />
                          <span>{req.phone}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 font-medium">{req.createdAt}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'Pending'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}>
                          {req.status === 'Pending' ? 'Menunggu' : 'Selesai'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === 'Pending' && (
                            <a
                              href={`https://api.whatsapp.com/send?phone=${formatPhoneForWA(req.phone)}&text=${encodeURIComponent(
                                `Halo ${req.name},\n\nBerikut adalah Kata Sandi PKSart baru Anda setelah direset oleh Admin:\n\n👉 Kata Sandi Baru: pksart123\n\nSilakan gunakan kata sandi ini untuk masuk ke akun Anda di http://localhost:3000/login dan segera ubah kata sandi lama Anda melalui menu profil.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => completeResetRequest(req.id)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                            >
                              <span>Kirim Sandi Baru ke WA</span>
                            </a>
                          )}
                          <button
                            onClick={() => deleteResetRequest(req.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Permintaan"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  paginatedCreators.map((creator) => (
                    <tr key={creator.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={creator.avatar}
                            alt={creator.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-900">{creator.name}</span>
                              {creator.isVerified && (
                                <span title="Verified Kreator PKS">
                                  <BadgeCheck size={16} className="text-[#F26522] fill-orange-50" />
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 font-medium">{creator.role || 'Kreator'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col text-xs font-medium space-y-0.5">
                          <span className="flex items-center gap-1 text-gray-800">
                            <PhoneCall size={12} className="text-emerald-600" />
                            <span>{creator.phone}</span>
                          </span>
                          <span className="flex items-center gap-1 text-gray-500">
                            <Mail size={12} className="text-gray-400" />
                            <span>{creator.email}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        {creator.region}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-700">
                        {creator.totalArtworks} Karya
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            creator.status === 'Suspended'
                              ? 'bg-red-50 text-red-650 border border-red-200'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          }`}
                        >
                          {creator.status === 'Suspended' ? 'Suspended' : 'Aktif'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleVerified(creator.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              creator.isVerified
                                ? 'text-[#F26522] bg-orange-50'
                                : 'text-gray-400 hover:text-[#F26522] hover:bg-orange-50'
                            }`}
                            title={creator.isVerified ? 'Cabut Verifikasi Lencana' : 'Beri Verifikasi Lencana Official'}
                          >
                            <BadgeCheck size={16} />
                          </button>
                          <button
                            onClick={() => openEditModal(creator)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Data Kreator"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(creator)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              creator.status === 'Suspended'
                                ? 'text-emerald-600 bg-emerald-50'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                            title={creator.status === 'Suspended' ? 'Aktifkan Kembali' : 'Suspend Akun'}
                          >
                            <Ban size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(creator.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Permanent Akun"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white sm:px-6 rounded-b-2xl">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Menampilkan <span className="font-bold text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> hingga <span className="font-bold text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> dari <span className="font-bold text-gray-900">{totalItems}</span> data
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-lg px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                          page === currentPage 
                            ? 'z-10 bg-[#F26522] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F26522]' 
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-lg px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Edit Creator Modal */}
        {editingCreator && (
          <div
            onClick={() => setEditingCreator(null)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 cursor-default"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Edit Data Kreator (Admin)
              </h3>

              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#F26522]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#F26522]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#F26522]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Wilayah DPW
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#F26522]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCreator(null)}
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

        <ConfirmSuspendModal
          isOpen={!!suspendingUser}
          title={suspendingUser?.status === 'Suspended' ? `Aktifkan ${suspendingUser?.name}?` : `Suspend ${suspendingUser?.name}?`}
          isSuspending={suspendingUser?.status !== 'Suspended'}
          onConfirm={confirmSuspendUser}
          onCancel={() => setSuspendingUser(null)}
        />
    </>
  );
}
