'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Award,
  Target,
  Building,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Save,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Upload,
  Sparkles,
  Trophy,
  MapPin,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import {
  getBoardMembers,
  createBoardMember,
  updateBoardMember,
  deleteBoardMember,
  reorderBoardMembers,
  getProfileConfig,
  updateProfileConfig,
} from '@/actions/board';
import { ConfirmSuspendModal as ConfirmModal } from '@/components/ConfirmSuspendModal';

export default function AdminProfilPage() {
  const [activeTab, setActiveTab] = useState<'board' | 'visimisi' | 'hero' | 'facilities'>('board');
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [profileConfig, setProfileConfig] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter for Board Members
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHierarchy, setFilterHierarchy] = useState<string>('all');

  // Modal State for Board Member (Add / Edit)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    role: '',
    hierarchy: 3,
    department: 'Pembinaan Prestasi',
    orderIndex: 0,
    photo: '',
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [deletingMember, setDeletingMember] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resBoard, resConfig] = await Promise.all([
        getBoardMembers(),
        getProfileConfig(),
      ]);
      if (resBoard.success && resBoard.data) {
        setBoardMembers(resBoard.data);
      }
      if (resConfig.success && resConfig.data) {
        setProfileConfig(resConfig.data);
      }
    } catch (err) {
      console.error('Error loading profil admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Add Member Modal
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemberFormData({
      name: '',
      role: '',
      hierarchy: 3,
      department: 'Pembinaan Prestasi',
      orderIndex: boardMembers.length + 1,
      photo: '',
    });
    setIsMemberModalOpen(true);
  };

  // Open Edit Member Modal
  const handleOpenEditMember = (member: any) => {
    setEditingMember(member);
    setMemberFormData({
      name: member.name,
      role: member.role,
      hierarchy: member.hierarchy || 3,
      department: member.department || '',
      orderIndex: member.orderIndex || 0,
      photo: member.photo || '',
    });
    setIsMemberModalOpen(true);
  };

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setMemberFormData((prev) => ({ ...prev, photo: data.url }));
      } else {
        alert(data.error || 'Gagal mengunggah foto');
      }
    } catch (err: any) {
      alert('Error saat mengunggah foto: ' + err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Save Member (Create or Update)
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFormData.name.trim() || !memberFormData.role.trim()) {
      alert('Nama dan Jabatan wajib diisi!');
      return;
    }

    setIsSaving(true);
    try {
      if (editingMember) {
        const res = await updateBoardMember(editingMember.id, memberFormData);
        if (res.success) {
          showToast(`Pengurus "${memberFormData.name}" berhasil diperbarui.`);
          setIsMemberModalOpen(false);
          await loadData();
        } else {
          alert('Gagal memperbarui: ' + res.error);
        }
      } else {
        const res = await createBoardMember(memberFormData);
        if (res.success) {
          showToast(`Pengurus baru "${memberFormData.name}" berhasil ditambahkan.`);
          setIsMemberModalOpen(false);
          await loadData();
        } else {
          alert('Gagal menambahkan: ' + res.error);
        }
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm Delete Member
  const handleConfirmDeleteMember = async () => {
    if (!deletingMember) return;
    try {
      const res = await deleteBoardMember(deletingMember.id);
      if (res.success) {
        showToast(`Pengurus "${deletingMember.name}" berhasil dihapus.`);
        setDeletingMember(null);
        await loadData();
      } else {
        alert('Gagal menghapus: ' + res.error);
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    }
  };

  // Quick Move Order Index
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredMembers.length) return;

    const currentList = [...filteredMembers];
    const [moved] = currentList.splice(index, 1);
    currentList.splice(targetIndex, 0, moved);

    // Reassign orderIndex
    const reorderedPayload = currentList.map((item, idx) => ({
      id: item.id,
      orderIndex: idx + 1,
      hierarchy: item.hierarchy,
    }));

    // Optimistic UI
    setBoardMembers((prev) =>
      prev.map((m) => {
        const found = reorderedPayload.find((p) => p.id === m.id);
        return found ? { ...m, orderIndex: found.orderIndex } : m;
      })
    );

    await reorderBoardMembers(reorderedPayload);
    showToast('Urutan posisi pengurus berhasil diperbarui.');
  };

  // Save Dynamic Profile Config (Visi, Misi, Hero, Facilities)
  const handleSaveProfileConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateProfileConfig(profileConfig);
      if (res.success) {
        showToast('Pengaturan halaman profil publik berhasil disimpan!');
      } else {
        alert('Gagal menyimpan: ' + res.error);
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered members
  const filteredMembers = boardMembers.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.department || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchHierarchy =
      filterHierarchy === 'all' || String(m.hierarchy) === filterHierarchy;

    return matchSearch && matchHierarchy;
  });

  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="text-[#F26522]" />
            <span>Kelola Profil & Struktur Pengurus</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manajemen Dewan Pengurus KONI Kepahiang, Visi & Misi, dan Fasilitas Olahraga di halaman publik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/profil"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs transition-all"
          >
            <span>Lihat Halaman Publik</span>
            <ExternalLink size={14} />
          </Link>

          {activeTab === 'board' && (
            <button
              onClick={handleOpenAddMember}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus size={16} />
              <span>Tambah Pengurus</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 mb-6 no-scrollbar">
        <button
          onClick={() => setActiveTab('board')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'board'
              ? 'bg-[#F26522] text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Users size={16} />
          <span>Struktur Pengurus ({boardMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('visimisi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'visimisi'
              ? 'bg-[#F26522] text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Target size={16} />
          <span>Visi & 5 Pilar Misi</span>
        </button>

        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-[#F26522] text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Award size={16} />
          <span>Hero & Informasi Umum</span>
        </button>

        <button
          onClick={() => setActiveTab('facilities')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'facilities'
              ? 'bg-[#F26522] text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Building size={16} />
          <span>Fasilitas Olahraga</span>
        </button>
      </div>

      {/* TAB 1: STRUKTUR PENGURUS */}
      {activeTab === 'board' && (
        <div className="space-y-6">
          {/* Controls: Search & Hierarchy Filter */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Cari nama, jabatan, atau bidang pengurus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-semibold shrink-0">Tingkat:</span>
              <select
                value={filterHierarchy}
                onChange={(e) => setFilterHierarchy(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
              >
                <option value="all">Semua Hierarki</option>
                <option value="1">Hierarki 1 (Ketua Umum)</option>
                <option value="2">Hierarki 2 (Wakil Ketua / Sekum / Bendum)</option>
                <option value="3">Hierarki 3 (Ketua Bidang Fungsional)</option>
              </select>
            </div>
          </div>

          {/* Board Members Table / Cards */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-2xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-gray-400">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F26522] mb-3" />
                <p className="text-xs font-semibold">Memuat susunan pengurus...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Users size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Belum ada data pengurus</p>
                <p className="text-xs text-gray-400 mt-1">Silakan tambahkan anggota pengurus KONI Kepahiang pertama Anda.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredMembers.map((member, index) => {
                  const hierarchyBadge =
                    member.hierarchy === 1
                      ? { label: 'Pimpinan Utama', color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900' }
                      : member.hierarchy === 2
                      ? { label: 'Pengurus Inti', color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900' }
                      : { label: 'Ketua Bidang', color: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900' };

                  return (
                    <div
                      key={member.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Avatar */}
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-red-500/20 shadow-xs shrink-0">
                          <img
                            src={member.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${hierarchyBadge.color}`}>
                              {hierarchyBadge.label}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-400">
                              Urutan: #{member.orderIndex || index + 1}
                            </span>
                          </div>
                          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white mt-1 truncate">
                            {member.name}
                          </h3>
                          <p className="text-xs font-bold text-[#F26522] mt-0.5">
                            {member.role}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            Bidang / Departemen: {member.department || '-'}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {/* Move Up */}
                        <button
                          onClick={() => handleMoveOrder(index, 'up')}
                          disabled={index === 0}
                          title="Naikkan Urutan"
                          className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <ArrowUp size={15} />
                        </button>
                        {/* Move Down */}
                        <button
                          onClick={() => handleMoveOrder(index, 'down')}
                          disabled={index === filteredMembers.length - 1}
                          title="Turunkan Urutan"
                          className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <ArrowDown size={15} />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEditMember(member)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                          title="Edit Pengurus"
                        >
                          <Edit size={16} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeletingMember(member)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                          title="Hapus Pengurus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VISI & 5 PILAR MISI */}
      {activeTab === 'visimisi' && (
        <form onSubmit={handleSaveProfileConfig} className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-150 dark:border-gray-800 shadow-2xs space-y-6">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="text-[#F26522]" size={18} />
                <span>Pengaturan Visi Utama KONI</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Tentukan rumusan visi jangka panjang dan target strategis Kabupaten Kepahiang.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Judul Bagian Visi
                </label>
                <input
                  type="text"
                  value={profileConfig.visiTitle || ''}
                  onChange={(e) => setProfileConfig({ ...profileConfig, visiTitle: e.target.value })}
                  placeholder="Visi Utama"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Rumusan Teks Visi
                </label>
                <textarea
                  rows={3}
                  value={profileConfig.visiText || ''}
                  onChange={(e) => setProfileConfig({ ...profileConfig, visiText: e.target.value })}
                  placeholder="Mewujudkan Kabupaten Kepahiang sebagai lumbung atlet berprestasi tinggi..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Badge Target Strategis (Highlight Banner)
                </label>
                <input
                  type="text"
                  value={profileConfig.targetText || ''}
                  onChange={(e) => setProfileConfig({ ...profileConfig, targetText: e.target.value })}
                  placeholder="Target: Tembus Peringkat 3 Besar Porprov Bengkulu 2026"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                />
              </div>
            </div>
          </div>

          {/* Misi Section */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-150 dark:border-gray-800 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="text-[#F26522]" size={18} />
                  <span>Daftar Pilar Misi KONI</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Butir-butir program kerja dan strategi utama pembinaan olahraga.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const currentMisi = profileConfig.misiList || [];
                  setProfileConfig({
                    ...profileConfig,
                    misiList: [
                      ...currentMisi,
                      { title: 'Pilar Misi Baru', desc: 'Deskripsi rencana kegiatan atau strategi.' },
                    ],
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 text-[#F26522] border border-orange-200 dark:border-orange-900 text-xs font-bold rounded-xl hover:bg-orange-100 transition-all"
              >
                <Plus size={14} />
                <span>Tambah Pilar Misi</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Judul Bagian Misi
              </label>
              <input
                type="text"
                value={profileConfig.misiTitle || ''}
                onChange={(e) => setProfileConfig({ ...profileConfig, misiTitle: e.target.value })}
                placeholder="5 Pilar Misi KONI Kepahiang"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
              />
            </div>

            <div className="space-y-4">
              {(profileConfig.misiList || []).map((misi: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-[#F26522] text-white flex items-center justify-center font-black text-xs">
                      {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const copy = [...profileConfig.misiList];
                        copy.splice(idx, 1);
                        setProfileConfig({ ...profileConfig, misiList: copy });
                      }}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg"
                      title="Hapus Misi"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="text"
                      value={misi.title || ''}
                      onChange={(e) => {
                        const copy = [...profileConfig.misiList];
                        copy[idx] = { ...copy[idx], title: e.target.value };
                        setProfileConfig({ ...profileConfig, misiList: copy });
                      }}
                      placeholder="Judul Pilar Misi"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 text-xs font-bold text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                    />
                    <textarea
                      rows={2}
                      value={misi.desc || ''}
                      onChange={(e) => {
                        const copy = [...profileConfig.misiList];
                        copy[idx] = { ...copy[idx], desc: e.target.value };
                        setProfileConfig({ ...profileConfig, misiList: copy });
                      }}
                      placeholder="Penjelasan strategi misi..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Save size={16} />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Visi & Misi'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: HERO & INFORMASI UMUM */}
      {activeTab === 'hero' && (
        <form onSubmit={handleSaveProfileConfig} className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-150 dark:border-gray-800 shadow-2xs space-y-6">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="text-[#F26522]" size={18} />
                <span>Banner Hero Halaman Profil</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Atur teks sambutan, judul besar, dan alamat sekretariat di bagian atas halaman profil.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Badge Tag Atas
                </label>
                <input
                  type="text"
                  value={profileConfig.heroBadge || ''}
                  onChange={(e) => setProfileConfig({ ...profileConfig, heroBadge: e.target.value })}
                  placeholder="Komite Olahraga Nasional Indonesia"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Alamat Sekretariat Utama
                </label>
                <input
                  type="text"
                  value={profileConfig.secretariatAddress || ''}
                  onChange={(e) => setProfileConfig({ ...profileConfig, secretariatAddress: e.target.value })}
                  placeholder="Sekretariat GOR Tebat Monok"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Judul Utama Hero
                </label>
                <input
                  type="text"
                  value={profileConfig.heroTitle || ''}
                  onChange={(e) => setProfileConfig({ ...profileConfig, heroTitle: e.target.value })}
                  placeholder="KONI Kabupaten Kepahiang"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-extrabold text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Sub-judul / Deskripsi Ringkas
                </label>
                <textarea
                  rows={3}
                  value={profileConfig.heroSubtitle || ''}
                  onChange={(e) => setProfileConfig({ ...profileConfig, heroSubtitle: e.target.value })}
                  placeholder="Wadah pembinaan prestasi keolahragaan resmi di Bumi Sehasen..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522] leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Save size={16} />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Informasi Hero'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: FASILITAS OLAHRAGA */}
      {activeTab === 'facilities' && (
        <form onSubmit={handleSaveProfileConfig} className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-150 dark:border-gray-800 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building className="text-[#F26522]" size={18} />
                  <span>Daftar Fasilitas Olahraga Daerah</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Kelola sarana dan prasarana venue olahraga yang ditampilkan di halaman profil.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const currentFac = profileConfig.facilitiesList || [];
                  setProfileConfig({
                    ...profileConfig,
                    facilitiesList: [
                      ...currentFac,
                      {
                        name: 'Nama Fasilitas / Lapangan',
                        type: 'Kategori Fasilitas',
                        desc: 'Penjelasan fungsi dan cabang olahraga yang didukung.',
                        icon: 'Building',
                      },
                    ],
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 text-[#F26522] border border-orange-200 dark:border-orange-900 text-xs font-bold rounded-xl hover:bg-orange-100 transition-all"
              >
                <Plus size={14} />
                <span>Tambah Fasilitas</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Judul Bagian Fasilitas
                </label>
                <input
                  type="text"
                  value={profileConfig.facilitiesTitle || ''}
                  onChange={(e) => setProfileConfig({ ...profileConfig, facilitiesTitle: e.target.value })}
                  placeholder="Fasilitas Olahraga Kabupaten Kepahiang"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Sub-judul Fasilitas
                </label>
                <input
                  type="text"
                  value={profileConfig.facilitiesSubtitle || ''}
                  onChange={(e) => setProfileConfig({ ...profileConfig, facilitiesSubtitle: e.target.value })}
                  placeholder="Pusat latihan dan penyelenggaraan event olahraga resmi di Kabupaten Kepahiang"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(profileConfig.facilitiesList || []).map((fac: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-500">#{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const copy = [...profileConfig.facilitiesList];
                        copy.splice(idx, 1);
                        setProfileConfig({ ...profileConfig, facilitiesList: copy });
                      }}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg"
                      title="Hapus Fasilitas"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                        Nama Fasilitas
                      </label>
                      <input
                        type="text"
                        value={fac.name || ''}
                        onChange={(e) => {
                          const copy = [...profileConfig.facilitiesList];
                          copy[idx] = { ...copy[idx], name: e.target.value };
                          setProfileConfig({ ...profileConfig, facilitiesList: copy });
                        }}
                        placeholder="e.g. GOR Tebat Monok"
                        className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 text-xs font-bold text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                        Kategori / Jenis
                      </label>
                      <input
                        type="text"
                        value={fac.type || ''}
                        onChange={(e) => {
                          const copy = [...profileConfig.facilitiesList];
                          copy[idx] = { ...copy[idx], type: e.target.value };
                          setProfileConfig({ ...profileConfig, facilitiesList: copy });
                        }}
                        placeholder="e.g. Indoor & Sekretariat"
                        className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-800 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                        Ikon
                      </label>
                      <select
                        value={fac.icon || 'Building'}
                        onChange={(e) => {
                          const copy = [...profileConfig.facilitiesList];
                          copy[idx] = { ...copy[idx], icon: e.target.value };
                          setProfileConfig({ ...profileConfig, facilitiesList: copy });
                        }}
                        className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-800 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                      >
                        <option value="Building">Building (Gedung / GOR)</option>
                        <option value="Trophy">Trophy (Stadion / Arena)</option>
                        <option value="Sparkles">Sparkles (Kawasan Khusus / Alam)</option>
                        <option value="MapPin">MapPin (Lokasi / Lapangan)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                        Deskripsi
                      </label>
                      <textarea
                        rows={2}
                        value={fac.desc || ''}
                        onChange={(e) => {
                          const copy = [...profileConfig.facilitiesList];
                          copy[idx] = { ...copy[idx], desc: e.target.value };
                          setProfileConfig({ ...profileConfig, facilitiesList: copy });
                        }}
                        placeholder="Deskripsi fasilitas..."
                        className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 text-xs text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Save size={16} />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Fasilitas Olahraga'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* MODAL: TAMBAH / EDIT PENGURUS */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="text-[#F26522]" size={20} />
                <span>{editingMember ? 'Edit Anggota Pengurus' : 'Tambah Pengurus Baru'}</span>
              </h2>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 mt-4">
              {/* Photo Preview & Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Foto Resmi Pengurus
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-red-500/20 shrink-0 shadow-2xs">
                    <img
                      src={memberFormData.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-orange-50 dark:bg-orange-950/40 text-[#F26522] border border-orange-200 dark:border-orange-900 rounded-xl text-xs font-bold cursor-pointer hover:bg-orange-100 transition-all">
                      <Upload size={14} />
                      <span>{isUploadingPhoto ? 'Mengunggah...' : 'Pilih Foto Dari Perangkat'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={isUploadingPhoto}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Atau tempel URL gambar langsung..."
                      value={memberFormData.photo}
                      onChange={(e) => setMemberFormData({ ...memberFormData, photo: e.target.value })}
                      className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-[11px] text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Lengkap & Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={memberFormData.name}
                  onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                  placeholder="e.g. Erwin Agustinus, ST"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                />
              </div>

              {/* Jabatan / Role */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Jabatan / Posisi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={memberFormData.role}
                  onChange={(e) => setMemberFormData({ ...memberFormData, role: e.target.value })}
                  placeholder="e.g. Ketua Umum / Sekretaris Umum / Ketua Bidang Binpres"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                />
              </div>

              {/* Tingkat Hierarki & No Urut */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Tingkat Hierarki
                  </label>
                  <select
                    value={memberFormData.hierarchy}
                    onChange={(e) => setMemberFormData({ ...memberFormData, hierarchy: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                  >
                    <option value={1}>Hierarki 1 (Ketua Umum)</option>
                    <option value={2}>Hierarki 2 (Pimpinan Inti / Sekum / Bendum)</option>
                    <option value={3}>Hierarki 3 (Ketua Bidang Fungsional)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    No Urut Tampil
                  </label>
                  <input
                    type="number"
                    value={memberFormData.orderIndex}
                    onChange={(e) => setMemberFormData({ ...memberFormData, orderIndex: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                  />
                </div>
              </div>

              {/* Bidang / Departemen */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Bidang / Departemen
                </label>
                <input
                  type="text"
                  value={memberFormData.department}
                  onChange={(e) => setMemberFormData({ ...memberFormData, department: e.target.value })}
                  placeholder="e.g. Pimpinan Utama / Pembinaan Prestasi / Kesekretariatan"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26522]"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-extrabold rounded-xl shadow-sm transition-all"
                >
                  {isSaving ? 'Menyimpan...' : editingMember ? 'Perbarui Pengurus' : 'Simpan Pengurus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS PENGURUS */}
      {deletingMember && (
        <ConfirmModal
          isOpen={Boolean(deletingMember)}
          title="Hapus Anggota Pengurus"
          message={`Apakah Anda yakin ingin menghapus "${deletingMember.name}" (${deletingMember.role}) dari struktur pengurus KONI Kepahiang?`}
          onConfirm={handleConfirmDeleteMember}
          onCancel={() => setDeletingMember(null)}
          confirmLabel="Ya, Hapus Pengurus"
          cancelLabel="Batal"
          variant="danger"
        />
      )}
    </>
  );
}
