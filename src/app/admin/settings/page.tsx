'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Settings,
  HardDrive,
  Cpu,
  Database,
  Download,
  UploadCloud,
  AlertTriangle,
  CheckCircle,
  Image as ImageIcon,
  Users,
  Building,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  FileArchive,
  Save,
  Sparkles,
  RotateCcw,
  AlertCircle,
  X,
  Upload,
} from 'lucide-react';
import { PksLogo } from '@/components/PksLogo';
import { DEFAULT_WELCOME_POPUP } from '@/components/WelcomePopup';
import { useData } from '@/context/DataContext';
import { compressImageFile } from '@/lib/imageCompressor';

export default function AdminSettingsPage() {
  const { siteSettings, updateSiteSettings, massDeletePosts, massDeleteUsers, massDeleteAll } = useData();

  const [siteName, setSiteName] = useState(siteSettings.siteName);
  const [siteDescription, setSiteDescription] = useState(siteSettings.siteDescription);
  const [logoPreview, setLogoPreview] = useState(siteSettings.logoUrl);
  const [faviconPreview, setFaviconPreview] = useState(siteSettings.faviconUrl);

  // Welcome Popup Configuration State
  const [initialPopupConfig, setInitialPopupConfig] = useState(DEFAULT_WELCOME_POPUP);
  const [popupConfig, setPopupConfig] = useState(DEFAULT_WELCOME_POPUP);
  const [showUnsavedConfirmModal, setShowUnsavedConfirmModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pksart_welcome_popup');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setInitialPopupConfig(parsed);
          setPopupConfig(parsed);
        } catch (e) {}
      }
    }
  }, []);

  const isPopupDirty = JSON.stringify(popupConfig) !== JSON.stringify(initialPopupConfig);

  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Mass Delete Modal States
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'posts' | 'users' | 'all' | null;
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: null,
    title: '',
    description: '',
  });

  const [confirmInputText, setConfirmInputText] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({ siteName, siteDescription });
    setIsSaved(true);
    triggerToast('Pengaturan identitas situs berhasil disimpan!');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSavePopupConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('pksart_welcome_popup', JSON.stringify(popupConfig));
    sessionStorage.removeItem('pksart_popup_dismissed');
    setInitialPopupConfig(popupConfig);
    triggerToast('Pengaturan Welcome Pop-up berhasil disimpan & diperbarui!');
  };

  const handlePopupImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await compressImageFile(file, 2, 1920, 0.85);
        setPopupConfig((prev) => ({
          ...prev,
          imageUrl: result.dataUrl,
        }));
        triggerToast(`Gambar banner dioptimalkan (${result.compressedSizeMb}MB).`);
      } catch (err: any) {
        alert(err.message || 'Gagal memproses gambar banner.');
      }
    }
  };

  const handleResetPopupConfig = () => {
    setPopupConfig(initialPopupConfig);
    setShowUnsavedConfirmModal(false);
    triggerToast('Perubahan pengaturan Pop-up berhasil dibatalkan.');
  };

  const handleCreateBackup = () => {
    triggerToast('Mengunduh paket cadangan (backup_pksart_db.sql.gz)...');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerToast(`Memulihkan data dari file "${file.name}"... Selesai!`);
    }
  };

  const openMassDeleteModal = (type: 'posts' | 'users' | 'all') => {
    setConfirmInputText('');
    if (type === 'posts') {
      setConfirmModal({
        isOpen: true,
        type: 'posts',
        title: 'Hapus Massal Semua Postingan Karya',
        description: 'Tindakan ini akan menghapus SELURUH gambar poster, spanduk, dan master file karya di database secara permanen.',
      });
    } else if (type === 'users') {
      setConfirmModal({
        isOpen: true,
        type: 'users',
        title: 'Hapus Massal Semua Pengguna / Member',
        description: 'Tindakan ini akan menghapus SELURUH akun kreator dan member terdaftar (kecuali Super Admin).',
      });
    } else if (type === 'all') {
      setConfirmModal({
        isOpen: true,
        type: 'all',
        title: 'RESET TOTAL SYSTEM (Factory Reset All Data)',
        description: 'PERINGATAN TINGKAT TINGGI! Seluruh karya, pengguna, komentar, riwayat unduhan, dan cache akan DIHAPUS PERMANEN.',
      });
    }
  };

  const executeMassDelete = () => {
    if (confirmInputText !== 'DELETE') {
      alert('Harap ketik kata "DELETE" untuk mengonfirmasi tindakan ini.');
      return;
    }

    if (confirmModal.type === 'posts') {
      massDeletePosts();
      triggerToast('Semua postingan karya berhasil dihapus massal.');
    } else if (confirmModal.type === 'users') {
      massDeleteUsers();
      triggerToast('Semua member & pengguna berhasil dihapus massal.');
    } else if (confirmModal.type === 'all') {
      massDeleteAll();
      triggerToast('Reset total platform selesai! Seluruh data telah dibersihkan.');
    }

    setConfirmModal({ isOpen: false, type: null, title: '', description: '' });
  };

  return (
    <>
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Settings className="text-[#F26522]" />
            <span>Pengaturan Sistem & Situs (Super Admin Site Settings)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Konfigurasi identitas situs, pemantauan kapasitas server/storage, backup & restore, serta aksi hapus massal.
          </p>
        </div>

        <div className="space-y-8 max-w-5xl">
          
          {/* Section 1: Identitas Situs & Logo/Favicon */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">
              1. Identitas Situs (Web Identity & Assets)
            </h2>

            <form onSubmit={handleSaveGeneral} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Nama Website (Title Header)
                  </label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#F26522]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Deskripsi / Meta Tagline
                  </label>
                  <input
                    type="text"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#F26522]"
                    required
                  />
                </div>
              </div>

              {/* Logo & Favicon Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                
                {/* Logo Web */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <PksLogo size="sm" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Logo Utama Website</p>
                      <p className="text-[11px] text-gray-400">PNG / SVG / WebP (512x512)</p>
                    </div>
                  </div>
                  <label className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                    <span>Ganti Logo</span>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>

                {/* Favicon Web */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/10 text-[#F26522] flex items-center justify-center font-bold text-xs">
                      ICO
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Favicon Browser</p>
                      <p className="text-[11px] text-gray-400">ICO / PNG (32x32)</p>
                    </div>
                  </div>
                  <label className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                    <span>Ganti Favicon</span>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>

              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  <Save size={16} />
                  <span>Simpan Perubahan Identitas</span>
                </button>
              </div>

            </form>
          </div>

          {/* Section 2: Welcome Pop-up Settings */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 mb-6 gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles size={20} className="text-[#F26522]" />
                  <span>2. Pengaturan Welcome Pop-up Homepage</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Atur dialog pengumuman/pop-up promosi yang akan otomatis tampil saat pengunjung membuka beranda.
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-3 bg-gray-50 px-3.5 py-1.5 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-700">Status Pop-up:</span>
                <button
                  type="button"
                  onClick={() => setPopupConfig({ ...popupConfig, isEnabled: !popupConfig.isEnabled })}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                    popupConfig.isEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      popupConfig.isEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`text-xs font-bold ${popupConfig.isEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {popupConfig.isEnabled ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>

            {/* Inactive Banner Alert */}
            {!popupConfig.isEnabled && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle size={18} className="shrink-0 text-red-500" />
                <span>
                  <strong>Pop-up Saat Ini Nonaktif.</strong> Pengaturan di bawah ini dinonaktifkan dan tidak bisa diedit. Aktifkan switch di atas untuk mengaktifkan pop-up di beranda.
                </span>
              </div>
            )}

            {/* Unsaved Changes Banner Alert */}
            {isPopupDirty && popupConfig.isEnabled && (
              <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="shrink-0 text-amber-600" />
                  <span>
                    <strong>Ada Perubahan Belum Disimpan!</strong> Tekan tombol Simpan di bawah untuk menerapkan perubahan pada Pop-up.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUnsavedConfirmModal(true)}
                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold rounded-lg transition-colors border border-amber-300 shrink-0"
                >
                  Batalkan Perubahan
                </button>
              </div>
            )}

            <form
              onSubmit={handleSavePopupConfig}
              className={`space-y-5 transition-all duration-300 ${
                !popupConfig.isEnabled ? 'opacity-50 pointer-events-none select-none filter grayscale-[15%]' : ''
              }`}
            >
              
              {/* Display Frequency Option */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Frekuensi Kemunculan Pop-up di Beranda
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      popupConfig.displayFrequency === 'once' || !popupConfig.displayFrequency
                        ? 'bg-orange-50/80 border-[#F26522] text-[#F26522] shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="displayFrequency"
                      disabled={!popupConfig.isEnabled}
                      checked={popupConfig.displayFrequency === 'once' || !popupConfig.displayFrequency}
                      onChange={() => setPopupConfig({ ...popupConfig, displayFrequency: 'once' })}
                      className="mt-0.5 accent-[#F26522]"
                    />
                    <div>
                      <p className="text-xs font-extrabold text-gray-900">1. Sekali Tampil per Device/IP (Default)</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                        Pop-up hanya muncul 1x saja seumur hidup per pengunjung/IP. Setelah ditutup, tidak akan pernah muncul lagi di perangkat tersebut.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      popupConfig.displayFrequency === 'session'
                        ? 'bg-orange-50/80 border-[#F26522] text-[#F26522] shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="displayFrequency"
                      disabled={!popupConfig.isEnabled}
                      checked={popupConfig.displayFrequency === 'session'}
                      onChange={() => setPopupConfig({ ...popupConfig, displayFrequency: 'session' })}
                      className="mt-0.5 accent-[#F26522]"
                    />
                    <div>
                      <p className="text-xs font-extrabold text-gray-900">2. Sekali per Sesi Browser</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                        Pop-up muncul 1x setiap kali browser baru dibuka. Jika ditutup, akan muncul lagi ketika browser dibuka kembali di lain waktu.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      popupConfig.displayFrequency === 'always'
                        ? 'bg-orange-50/80 border-[#F26522] text-[#F26522] shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="displayFrequency"
                      disabled={!popupConfig.isEnabled}
                      checked={popupConfig.displayFrequency === 'always'}
                      onChange={() => setPopupConfig({ ...popupConfig, displayFrequency: 'always' })}
                      className="mt-0.5 accent-[#F26522]"
                    />
                    <div>
                      <p className="text-xs font-extrabold text-gray-900">3. Selalu Tampil (Setiap Buka Web)</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                        Pop-up akan selalu otomatis muncul setiap kali pengunjung membuka atau merefresh halaman utama beranda.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Judul Utama Pop-up <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!popupConfig.isEnabled}
                    value={popupConfig.title}
                    onChange={(e) => setPopupConfig({ ...popupConfig, title: e.target.value })}
                    placeholder="Judul Pop-up Pengumuman"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#F26522] disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Banner Pop-up (Upload Device / Input URL)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      disabled={!popupConfig.isEnabled}
                      value={popupConfig.imageUrl}
                      onChange={(e) => setPopupConfig({ ...popupConfig, imageUrl: e.target.value })}
                      placeholder="https://... atau unggah dari device"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522] disabled:cursor-not-allowed"
                      required
                    />

                    <label
                      className={`px-3 py-2.5 bg-orange-50 hover:bg-orange-100 text-[#F26522] border border-orange-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
                        !popupConfig.isEnabled ? 'cursor-not-allowed opacity-60' : ''
                      }`}
                    >
                      <Upload size={14} />
                      <span>Unggah Device</span>
                      <input
                        type="file"
                        disabled={!popupConfig.isEnabled}
                        accept="image/*"
                        onChange={handlePopupImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Banner Image Live Preview */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Pratinjau Banner Pop-up
                </label>
                <div className="relative w-full max-h-[180px] h-[140px] rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 flex items-center justify-center">
                  {popupConfig.imageUrl ? (
                    <img
                      src={popupConfig.imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover opacity-90"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon size={32} className="mx-auto mb-1 opacity-50" />
                      <p className="text-xs font-semibold">Belum ada gambar banner</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                    Live Banner Preview
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Subjudul / Pesan Pengumuman <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  disabled={!popupConfig.isEnabled}
                  value={popupConfig.subtitle}
                  onChange={(e) => setPopupConfig({ ...popupConfig, subtitle: e.target.value })}
                  placeholder="Teks penjelasan pengumuman atau promosi..."
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#F26522] disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Teks Tombol Aksi (CTA Button) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!popupConfig.isEnabled}
                    value={popupConfig.ctaText}
                    onChange={(e) => setPopupConfig({ ...popupConfig, ctaText: e.target.value })}
                    placeholder="Contoh: Jelajahi Karya Populer"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#F26522] disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Tautan Target Tombol (CTA Link) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!popupConfig.isEnabled}
                    value={popupConfig.ctaLink}
                    onChange={(e) => setPopupConfig({ ...popupConfig, ctaLink: e.target.value })}
                    placeholder="Contoh: /#eksplorasi atau /twibbon"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#F26522] disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-xs text-gray-400">
                  Perubahan akan langsung berdampak pada dialog pengumuman Homepage.
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {isPopupDirty && (
                    <button
                      type="button"
                      disabled={!popupConfig.isEnabled}
                      onClick={() => setShowUnsavedConfirmModal(true)}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw size={15} />
                      <span>Batalkan</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={!popupConfig.isEnabled}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    <span>Simpan Pengaturan Pop-up</span>
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* Section 3: Storage Usage & Server Resource Usage */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">
              3. Kapasitas Penyimpanan & Sumber Daya Server (Storage & Resource Usage)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Storage Usage Bar */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <HardDrive size={16} className="text-[#F26522]" />
                    <span>Media Storage (File master/poster)</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-900">42.8 GB / 100 GB</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-[#F26522] h-full rounded-full w-[42.8%]" />
                </div>
                <p className="text-[11px] text-gray-400">Terpakai 42.8% dari total kapasitas disk SSD</p>
              </div>

              {/* Database Storage Bar */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Database size={16} className="text-emerald-600" />
                    <span>PostgreSQL Database</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-900">128.4 MB</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[15.2%]" />
                </div>
                <p className="text-[11px] text-gray-400">1,482 karya & 384 user terindeks</p>
              </div>

              {/* CPU & RAM Usage Bar */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Cpu size={16} className="text-blue-600" />
                    <span>CPU & RAM Server</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-900">18% CPU • 2.4 GB RAM</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full w-[28%]" />
                </div>
                <p className="text-[11px] text-gray-400">Node.js Next.js Runtime Normal</p>
              </div>

            </div>
          </div>

          {/* Section 4: Backup & Restore Data */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">
              4. Pembuatan Cadangan & Pemulihan (Backup & Restore System)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Backup Trigger */}
              <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1">
                    <FileArchive size={18} className="text-[#F26522]" />
                    <span>Unduh Cadangan Lengkap (Backup SQL & Asset)</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mt-1">
                    Buat dan unduh berkas arsip terkompresi berisi seluruh tabel PostgreSQL (User, Artwork, Like, Comment) dan media postingan.
                  </p>
                </div>

                <button
                  onClick={handleCreateBackup}
                  className="mt-4 w-full py-2.5 px-4 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  <span>Buat & Unduh Backup Now (.gz)</span>
                </button>
              </div>

              {/* Restore Trigger */}
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1">
                    <RefreshCw size={18} className="text-blue-600" />
                    <span>Pulihkan Database dari File (Restore Database)</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mt-1">
                    Unggah file cadangan (.sql / .json) untuk memulihkan seluruh struktur data dan arsip postingan karya.
                  </p>
                </div>

                <label className="mt-4 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <UploadCloud size={16} />
                  <span>Pilih File Backup untuk Restore</span>
                  <input
                    type="file"
                    accept=".sql,.json,.gz"
                    onChange={handleRestoreFile}
                    className="hidden"
                  />
                </label>
              </div>

            </div>
          </div>

          {/* Section 4: Danger Zone / Mass Delete Operations */}
          <div className="bg-red-50/40 rounded-2xl p-6 border border-red-200 shadow-sm">
            <div className="flex items-center gap-2 border-b border-red-200 pb-3 mb-6">
              <ShieldAlert size={22} className="text-red-600" />
              <h2 className="text-lg font-black text-red-900">
                4. ZONA BAHAYA: Tindakan Hapus Massal (Danger Zone / Mass Delete)
              </h2>
            </div>

            <p className="text-xs text-red-700 font-medium mb-6">
              Tindakan di bawah ini bersifat permanen dan tidak dapat dibatalkan. Harap pastikan Anda telah mengunduh backup sebelum melakukan operasi ini.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Mass Delete Posts */}
              <div className="bg-white p-4 rounded-xl border border-red-200 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <ImageIcon size={16} className="text-red-500" />
                    <span>Hapus Semua Postingan</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Menghapus seluruh postingan karya poster dan spanduk di database.
                  </p>
                </div>
                <button
                  onClick={() => openMassDeleteModal('posts')}
                  className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Mass Delete Posts
                </button>
              </div>

              {/* Mass Delete Users */}
              <div className="bg-white p-4 rounded-xl border border-red-200 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <Users size={16} className="text-red-500" />
                    <span>Hapus Semua User / Member</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Menghapus seluruh akun kreator & member terdaftar (kecuali Super Admin).
                  </p>
                </div>
                <button
                  onClick={() => openMassDeleteModal('users')}
                  className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Mass Delete Users
                </button>
              </div>

              {/* Mass Delete All (Factory Reset) */}
              <div className="bg-white p-4 rounded-xl border-2 border-red-500 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs font-black text-red-600 flex items-center gap-1.5">
                    <AlertTriangle size={16} />
                    <span>MASS DELETE ALL (RESET TOTAL)</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Mengosongkan seluruh database (Karya, User, Komentar, Cache).
                  </p>
                </div>
                <button
                  onClick={() => openMassDeleteModal('all')}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-lg transition-colors shadow-sm"
                >
                  RESET TOTAL SYSTEM
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Mass Delete Confirmation Modal */}
        {confirmModal.isOpen && (
          <div
            onClick={() => setConfirmModal({ isOpen: false, type: null, title: '', description: '' })}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 animate-in zoom-in-95 cursor-default"
            >
              <div className="flex items-center gap-3 text-red-600 mb-3">
                <AlertTriangle size={28} />
                <h3 className="text-lg font-black text-gray-900">
                  {confirmModal.title}
                </h3>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                {confirmModal.description}
              </p>

              <div className="bg-red-50 p-3 rounded-xl border border-red-200 mb-4">
                <p className="text-xs font-bold text-red-800 mb-1">
                  Ketik kata "DELETE" di bawah ini untuk mengonfirmasi:
                </p>
                <input
                  type="text"
                  value={confirmInputText}
                  onChange={(e) => setConfirmInputText(e.target.value)}
                  placeholder="Ketik DELETE"
                  className="w-full bg-white border border-red-300 rounded-lg px-3 py-2 text-xs font-bold text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal({ isOpen: false, type: null, title: '', description: '' })}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeMassDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md"
                >
                  Ya, Lakukan Hapus Massal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unsaved Changes Confirmation Modal */}
        {showUnsavedConfirmModal && (
          <div
            onClick={() => setShowUnsavedConfirmModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-200 animate-in zoom-in-95 cursor-default relative"
            >
              <button
                onClick={() => setShowUnsavedConfirmModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 text-amber-600 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-200">
                  <AlertTriangle size={22} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">
                    Perubahan Belum Disimpan!
                  </h3>
                  <p className="text-xs text-gray-500">Konfirmasi pembatalan pengaturan</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-5 bg-amber-50/60 p-3.5 rounded-xl border border-amber-100">
                Anda telah mengubah beberapa field pada <strong>Pengaturan Welcome Pop-up</strong>. Apakah Anda yakin ingin membatalkan dan mengembalikan ke data awal?
              </p>

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowUnsavedConfirmModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
                >
                  Kembali Edit
                </button>
                <button
                  type="button"
                  onClick={handleResetPopupConfig}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Ya, Batalkan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}

    </>
  );
}
