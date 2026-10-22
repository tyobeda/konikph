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
import { KoniLogo } from '@/components/KoniLogo';
import { ConfirmSuspendModal } from '@/components/ConfirmSuspendModal';
import { useData } from '@/context/DataContext';
import { User } from '@/lib/types';
import { getUserSlug } from '@/lib/slug';
import { generateResetLinkAction } from '@/actions/resetRequest';
import { formatPhoneNumber } from '@/lib/phone';

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    return dateStr;
  }
};

export default function AdminCreatorsPage() {
  const { 
    users, 
    artworks,
    dpwList,
    toggleVerifyUser, 
    toggleSuspendUser, 
    deleteUser, 
    updateUser,
    resetRequests,
    refreshResetRequests,
    completeResetRequest,
    deleteResetRequest
  } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'creators' | 'resets'>('creators');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
  const [editingCreator, setEditingCreator] = useState<User | null>(null);
  const [suspendingUser, setSuspendingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    if (activeTab === 'resets') {
      refreshResetRequests();
    }
  }, [searchQuery, activeTab, statusFilter]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    region: '',
    role: 'Desainer',
  });

  const handleApproveUser = (id: string) => {
    updateUser(id, { status: 'Active' });
  };

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

  const handleDelete = (creator: User) => {
    setDeletingUser(creator);
  };

  const confirmDeleteUser = () => {
    if (deletingUser) {
      deleteUser(deletingUser.id);
      setDeletingUser(null);
    }
  };

  const openEditModal = (creator: User) => {
    setEditingCreator(creator);
    setFormData({
      name: creator.name,
      email: creator.email,
      phone: creator.phone || '',
      region: creator.region,
      role: creator.role || 'Desainer',
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
    const formatted = formatPhoneNumber(phone);
    return formatted.replace(/[^0-9]/g, '');
  };

  const pendingCreatorsCount = users.filter(u => u.status === 'Pending' || u.status === 'Pending Approval').length;
  const pendingResetsCount = resetRequests.filter(r => (r.status || '').toLowerCase() === 'pending').length;

  const filteredCreators = users.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (statusFilter === 'pending') return c.status === 'Pending' || c.status === 'Pending Approval';
    if (statusFilter === 'active') return c.status === 'Active' || !c.status || c.status === 'Aktif';
    if (statusFilter === 'suspended') return c.status === 'Suspended';
    return true;
  });

  const filteredResets = resetRequests.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = activeTab === 'resets' ? filteredResets.length : filteredCreators.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const paginatedResets = filteredResets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const paginatedCreators = filteredCreators.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSendResetLink = async (req: any) => {
    try {
      const res = await generateResetLinkAction(req.id);
      let targetUrl = res?.resetUrl;
      
      if (!targetUrl && req.token) {
        const origin = window.location.origin;
        targetUrl = `${origin}/reset-password?token=${req.token}`;
      }

      if (targetUrl) {
        const waPhone = formatPhoneForWA(req.phone);
        const text = `Halo ${req.name},\n\nPermintaan reset kata sandi Anda di KONI Kepahiang telah disetujui. Silakan klik tautan di bawah ini untuk membuat kata sandi baru Anda:\n\n👉 Tautan Reset Kata Sandi:\n${targetUrl}\n\n⚠️ Catatan: Tautan ini HANYA BERLAKU SELAMA 5 MENIT demi keamanan akun Anda.`;
        const waUrl = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');
        completeResetRequest(req.id);
      } else {
        alert(res?.error || 'Gagal membuat link reset kata sandi.');
      }
    } catch (err: any) {
      alert('Gagal membuat link reset: ' + err.message);
    }
  };

  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="text-red-600" />
            <span>Kelola Pengurus & Anggota Cabor</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Verifikasi akun pengurus Cabor, kelola kontak WhatsApp/Email, dan kontrol status hak akses.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6 gap-6 text-sm">
        <button
          onClick={() => setActiveTab('creators')}
          className={`pb-3 relative transition-all flex items-center gap-2 ${
            activeTab === 'creators'
              ? 'text-[#F26522] border-b-2 border-[#F26522] font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
          }`}
        >
          <span>Desainer Terdaftar</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            activeTab === 'creators'
              ? 'bg-orange-50 dark:bg-orange-950/40 text-[#F26522] border-orange-200 dark:border-orange-900/50'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
          }`}>
            {users.length}
          </span>
          {pendingCreatorsCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
              {pendingCreatorsCount} Pendaftar Baru
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('resets')}
          className={`pb-3 relative transition-all flex items-center gap-2 ${
            activeTab === 'resets'
              ? 'text-[#F26522] border-b-2 border-[#F26522] font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
          }`}
        >
          <span>Permintaan Reset</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            activeTab === 'resets'
              ? 'bg-orange-50 dark:bg-orange-950/40 text-[#F26522] border-orange-200 dark:border-orange-900/50'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
          }`}>
            {resetRequests.length}
          </span>
          {pendingResetsCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 animate-pulse">
              {pendingResetsCount} Permintaan Baru
            </span>
          )}
        </button>
      </div>

      {/* Creator Status Filters (If on Creators tab) */}
      {activeTab === 'creators' && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
              statusFilter === 'all'
                ? 'bg-[#F26522] text-white shadow-sm font-bold'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium'
            }`}
          >
            Semua ({users.length})
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-sm font-bold'
                : 'bg-white dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-medium'
            }`}
          >
            <span>Menunggu Approval</span>
            {pendingCreatorsCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${statusFilter === 'pending' ? 'bg-white text-amber-600' : 'bg-amber-500 text-white'}`}>
                {pendingCreatorsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'bg-white dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-medium'
            }`}
          >
            Disutujui / Aktif
          </button>

          <button
            onClick={() => setStatusFilter('suspended')}
            className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
              statusFilter === 'suspended'
                ? 'bg-red-600 text-white shadow-sm font-bold'
                : 'bg-white dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium'
            }`}
          >
            Ditangguhkan
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white dark:bg-[#111622] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              {activeTab === 'resets' ? 'Permintaan Reset Kata Sandi' : 'Daftar Desainer Terdaftar'}
            </h2>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, atau Wilayah..."
              className="w-full bg-gray-50 dark:bg-gray-800/80 text-sm rounded-xl pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#F26522]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50/80 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
              {activeTab === 'resets' ? (
                <tr>
                  <th className="py-3.5 px-4">Nama Lengkap</th>
                  <th className="py-3.5 px-4">Alamat Email</th>
                  <th className="py-3.5 px-4">Nomor WhatsApp</th>
                  <th className="py-3.5 px-4">Waktu Pengajuan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi Admin</th>
                </tr>
              ) : (
                <tr>
                  <th className="py-3.5 px-4">Desainer & Lencana</th>
                  <th className="py-3.5 px-4">Kontak WhatsApp & Email</th>
                  <th className="py-3.5 px-4">Daerah / Wilayah</th>
                  <th className="py-3.5 px-4">Total Karya</th>
                  <th className="py-3.5 px-4">Status Akun</th>
                  <th className="py-3.5 px-4 text-right">Aksi Admin</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {activeTab === 'resets' ? (
                paginatedResets.length > 0 ? (
                  paginatedResets.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">{req.name}</td>
                      <td className="py-3.5 px-4 font-medium text-gray-600 dark:text-gray-300">{req.email}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-gray-200">
                        <span className="flex items-center gap-1">
                          <PhoneCall size={12} className="text-emerald-600 dark:text-emerald-400" />
                          <span>{req.phone}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 dark:text-gray-400 font-mono text-xs">{formatDateTime(req.createdAt)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'Pending'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 animate-pulse'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                        }`}>
                          {req.status === 'Pending' ? 'Menunggu' : 'Selesai'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => handleSendResetLink(req)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                            >
                              <span>Kirim Link Reset 5-Menit ke WA</span>
                            </button>
                          )}
                          <button
                            onClick={() => deleteResetRequest(req.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                            title="Hapus Permintaan"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 dark:text-gray-500 font-medium">
                      Tidak ada permintaan reset kata sandi.
                    </td>
                  </tr>
                )
              ) : (
                paginatedCreators.length > 0 ? (
                  paginatedCreators.map((creator) => (
                    <tr key={creator.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Link href={`/creators/${getUserSlug(creator)}`} target="_blank" className="shrink-0">
                            <img
                              src={creator.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200'}
                              alt={creator.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-[#F26522] transition-all"
                            />
                          </Link>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Link href={`/creators/${getUserSlug(creator)}`} target="_blank" className="font-bold text-gray-900 dark:text-white hover:text-[#F26522] dark:hover:text-[#F26522] transition-colors">
                                {creator.name}
                              </Link>
                              {creator.isVerified && (
                                <span title="Verified Pengurus KONI">
                                  <BadgeCheck size={16} className="text-red-600 fill-red-50 dark:fill-red-950/40" />
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{creator.role || 'Desainer'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col text-xs font-medium space-y-0.5">
                          <span className="flex items-center gap-1 text-gray-800 dark:text-gray-200">
                            <PhoneCall size={12} className="text-emerald-600 dark:text-emerald-400" />
                            <span>{creator.phone}</span>
                          </span>
                          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <Mail size={12} className="text-gray-400 dark:text-gray-500" />
                            <span>{creator.email}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-gray-200">
                        {(creator.region || '').replace(/^DPW\s+/i, '')}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        {artworks.filter(a => a.author?.name === creator.name || a.author?.email === creator.email || a.author?.id === creator.id).length} Karya
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            creator.status === 'Suspended'
                              ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                              : (creator.status === 'Pending' || creator.status === 'Pending Approval')
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 animate-pulse'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                          }`}
                        >
                          {creator.status === 'Suspended' 
                            ? 'Suspended' 
                            : (creator.status === 'Pending' || creator.status === 'Pending Approval')
                            ? 'Menunggu Approval'
                            : 'Aktif'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(creator.status === 'Pending' || creator.status === 'Pending Approval') && (
                            <button
                              onClick={() => handleApproveUser(creator.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1"
                              title="Setujui Pendaftaran Akun"
                            >
                              <CheckCircle size={14} />
                              <span>Setujui</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleVerified(creator.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              creator.isVerified
                                ? 'text-[#F26522] bg-orange-50 dark:bg-orange-950/40'
                                : 'text-gray-400 dark:text-gray-500 hover:text-[#F26522] hover:bg-orange-50 dark:hover:bg-orange-950/30'
                            }`}
                            title={creator.isVerified ? 'Cabut Verifikasi Lencana' : 'Beri Verifikasi Lencana Official'}
                          >
                            <BadgeCheck size={16} />
                          </button>
                          <button
                            onClick={() => openEditModal(creator)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                            title="Edit Data Desainer"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(creator)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              creator.status === 'Suspended'
                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                            }`}
                            title={creator.status === 'Suspended' ? 'Aktifkan Kembali' : 'Suspend Akun'}
                          >
                            <Ban size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(creator)}
                            className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                            title="Hapus Permanent Akun"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 dark:text-gray-500 font-medium">
                      Tidak ada data akun desainer yang sesuai dengan pencarian.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-gray-50/50 dark:bg-[#111622]">
          <div className="text-gray-500 dark:text-gray-400 font-medium">
            Menampilkan <span className="font-bold text-gray-800 dark:text-gray-200">{totalItems > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> - <span className="font-bold text-gray-800 dark:text-gray-200">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> dari <span className="font-bold text-gray-800 dark:text-gray-200">{totalItems}</span> data {activeTab === 'resets' ? 'pengajuan reset' : 'desainer'}
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm text-xs"
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
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalItems === 0}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm text-xs"
            >
              Next &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* Edit Creator Modal */}
      {editingCreator && (
        <div
          onClick={() => setEditingCreator(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 cursor-default"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Edit Data Desainer (Admin)
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#F26522]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#F26522]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Nomor WhatsApp
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
                  placeholder="contoh: 081234567890 atau +6281234567890"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#F26522]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Wilayah
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#F26522]"
                >
                  <option value="">-- Pilih Wilayah --</option>
                  {formData.region && !dpwList.some(d => d.name.toLowerCase() === formData.region.toLowerCase()) && (
                    <option value={formData.region}>{formData.region.replace(/^DPW\s+/i, '')}</option>
                  )}
                  {dpwList
                    .filter(d => d.isActive !== false || d.name === formData.region)
                    .sort((a, b) => a.name.localeCompare(b.name, 'id'))
                    .map((dpw) => (
                      <option key={dpw.id} value={dpw.name}>
                        {dpw.name.replace(/^DPW\s+/i, '')}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCreator(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl"
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

      <ConfirmSuspendModal
        isOpen={!!deletingUser}
        title={`Hapus Akun ${deletingUser?.name}?`}
        message={`Apakah Anda yakin ingin menghapus akun desainer "${deletingUser?.name}" secara permanen dari sistem? Seluruh data yang terkait akan terhapus.`}
        confirmLabel="Ya, Hapus Permanen"
        variant="danger"
        onConfirm={confirmDeleteUser}
        onCancel={() => setDeletingUser(null)}
      />
    </>
  );
}
