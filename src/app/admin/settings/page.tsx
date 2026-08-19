'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Wrench,
  Eye,
  Layers,
  FileSpreadsheet,
  Filter,
} from 'lucide-react';
import { PksLogo } from '@/components/PksLogo';
import { DEFAULT_WELCOME_POPUP } from '@/components/WelcomePopup';
import { useData } from '@/context/DataContext';
import { compressImageFile } from '@/lib/imageCompressor';
import { getCustomPageBySlug, addCustomPage, updateCustomPage } from '@/actions/page';

export default function AdminSettingsPage() {
  const { siteSettings, updateSiteSettings, massDeletePosts, massDeleteUsers, massDeleteAll, customPages } = useData();
  const [activeTab, setActiveTab] = useState<'identity' | 'cta' | 'popup' | 'maintenance' | 'resource' | 'backup' | 'filter' | 'danger'>('identity');

  const [siteName, setSiteName] = useState(siteSettings.siteName || '');
  const [siteDescription, setSiteDescription] = useState(siteSettings.siteDescription || '');
  const [logoPreview, setLogoPreview] = useState(siteSettings.logoUrl || '');
  const [logoAdminPreview, setLogoAdminPreview] = useState(siteSettings.logoAdminUrl || '');
  const [logoFooterPreview, setLogoFooterPreview] = useState(siteSettings.logoFooterUrl || '');
  const [faviconPreview, setFaviconPreview] = useState(siteSettings.faviconUrl || '/favicon.ico');
  const [ogImagePreview, setOgImagePreview] = useState(siteSettings.ogImageUrl || '');
  const [forbiddenWords, setForbiddenWords] = useState(siteSettings.forbiddenWords || 'judi, slot, gacor, bokep, porno, sara, rasis, penipu');
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // Maintenance Mode States
  const [maintenanceState, setMaintenanceState] = useState(siteSettings.maintenanceConfig || {
    globalEnabled: false,
    modules: {
      explore: false,
      assets: false,
      creators: false,
      twibbon: false,
      upload: false,
      auth: false,
    },
    title: 'Mode Pemeliharaan Sistem',
    description: 'Kami sedang melakukan pemeliharaan & perawatan sistem rutin untuk meningkatkan kualitas layanan platform PKSart. Terima kasih atas kesabaran Anda.',
    estimatedTime: 'Estimasi Selesai: 1 - 2 Jam',
    allowAdminBypass: true,
  });

  // CTA States
  const [ctaTitle, setCtaTitle] = useState(siteSettings.ctaTitle || '');
  const [ctaDescription, setCtaDescription] = useState(siteSettings.ctaDescription || '');
  const [ctaButtonText, setCtaButtonText] = useState(siteSettings.ctaButtonText || '');
  const [ctaButtonLink, setCtaButtonLink] = useState(siteSettings.ctaButtonLink || '');
  const [ctaLogoPreview, setCtaLogoPreview] = useState(siteSettings.ctaLogoUrl || '');
  const [ctaImagePreview, setCtaImagePreview] = useState(siteSettings.ctaImageUrl || '');
  const [ctaBgPreview, setCtaBgPreview] = useState(siteSettings.ctaBgUrl || '');
  const [ctaEnabled, setCtaEnabled] = useState(siteSettings.ctaEnabled !== false);
  const [ctaLinks, setCtaLinks] = useState<{ label: string; url: string }[]>(siteSettings.ctaLinks || []);
  const [ctaSocialText, setCtaSocialText] = useState(siteSettings.ctaSocialText || '');
  const [ctaSocialUrl, setCtaSocialUrl] = useState(siteSettings.ctaSocialUrl || '');
  const [adminWhatsapp, setAdminWhatsapp] = useState(siteSettings.adminWhatsapp || '6281199887766');
  const [autoApproveArtworks, setAutoApproveArtworks] = useState(siteSettings.autoApproveArtworks !== false);
  const [allowCommentLinks, setAllowCommentLinks] = useState((siteSettings as any).allowCommentLinks !== false);

  useEffect(() => {
    if (siteSettings) {
      setSiteName(siteSettings.siteName || '');
      setSiteDescription(siteSettings.siteDescription || '');
      setLogoPreview(siteSettings.logoUrl || '');
      setLogoAdminPreview(siteSettings.logoAdminUrl || '');
      setLogoFooterPreview(siteSettings.logoFooterUrl || '');
      setFaviconPreview(siteSettings.faviconUrl || '/favicon.ico');
      setOgImagePreview(siteSettings.ogImageUrl || '');
      setCtaTitle(siteSettings.ctaTitle || '');
      setCtaDescription(siteSettings.ctaDescription || '');
      setCtaButtonText(siteSettings.ctaButtonText || '');
      setCtaButtonLink(siteSettings.ctaButtonLink || '');
      setCtaLogoPreview(siteSettings.ctaLogoUrl || '');
      setCtaImagePreview(siteSettings.ctaImageUrl || '');
      setCtaBgPreview(siteSettings.ctaBgUrl || '');
      setCtaEnabled(siteSettings.ctaEnabled !== false);
      setCtaLinks(siteSettings.ctaLinks || []);
      setCtaSocialText(siteSettings.ctaSocialText || '');
      setCtaSocialUrl(siteSettings.ctaSocialUrl || '');
      setAdminWhatsapp(siteSettings.adminWhatsapp || '6281199887766');
      setAutoApproveArtworks(siteSettings.autoApproveArtworks !== false);
      setAllowCommentLinks((siteSettings as any).allowCommentLinks !== false);
      if (siteSettings.maintenanceConfig) {
        setMaintenanceState(siteSettings.maintenanceConfig as any);
      }
    }
  }, [siteSettings]);
  // Welcome Popup Configuration State
  const [initialPopupConfig, setInitialPopupConfig] = useState(DEFAULT_WELCOME_POPUP);
  const [popupConfig, setPopupConfig] = useState(DEFAULT_WELCOME_POPUP);
  const [showUnsavedConfirmModal, setShowUnsavedConfirmModal] = useState(false);

  const [popupPageId, setPopupPageId] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      const res = await getCustomPageBySlug('system-welcome-popup');
      if (res.success && res.data) {
        setPopupPageId(res.data.id);
        if (res.data.content) {
          try {
            const parsed = JSON.parse(res.data.content);
            setInitialPopupConfig(parsed);
            setPopupConfig(parsed);
          } catch(e) {}
        }
      }
    };
    fetchConfig();
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

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Upload gagal');
    return data.url;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        setLogoPreview(url);
        triggerToast('Logo Utama berhasil diupload! Klik "Simpan" untuk menerapkan.');
      } catch (err: any) {
        alert(err.message || 'Gagal upload logo.');
      }
    }
  };

  const handleLogoAdminUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        setLogoAdminPreview(url);
        triggerToast('Logo Admin berhasil diupload! Klik "Simpan" untuk menerapkan.');
      } catch (err: any) {
        alert(err.message || 'Gagal upload logo.');
      }
    }
  };

  const handleLogoFooterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        setLogoFooterPreview(url);
        triggerToast('Logo Footer berhasil diupload! Klik "Simpan" untuk menerapkan.');
      } catch (err: any) {
        alert(err.message || 'Gagal upload logo.');
      }
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        setFaviconPreview(url);
        triggerToast('Favicon berhasil diupload! Klik "Simpan" untuk menerapkan.');
      } catch (err: any) {
        alert(err.message || 'Gagal upload favicon.');
      }
    }
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        triggerToast('Mengompres dan mengunggah gambar thumbnail...');
        const compressedResult = await compressImageFile(file, 2, 1200, 0.85);
        if (compressedResult && compressedResult.dataUrl) {
          const blob = await (await fetch(compressedResult.dataUrl)).blob();
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
          const url = await uploadFile(compressedFile);
          setOgImagePreview(url);
          triggerToast('Thumbnail Social Share berhasil diupload! Klik "Simpan Perubahan Identitas" untuk menerapkan.');
        } else {
          const url = await uploadFile(file);
          setOgImagePreview(url);
          triggerToast('Thumbnail Social Share berhasil diupload! Klik "Simpan Perubahan Identitas" untuk menerapkan.');
        }
      } catch (err: any) {
        try {
          const url = await uploadFile(file);
          setOgImagePreview(url);
          triggerToast('Thumbnail Social Share berhasil diupload! Klik "Simpan Perubahan Identitas" untuk menerapkan.');
        } catch (uploadErr: any) {
          alert(uploadErr.message || 'Gagal upload thumbnail.');
        }
      }
    }
  };

  const handleForbiddenWordsCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          // Parse lines and commas from CSV
          const rawWords = text
            .split(/[\r\n,]+/)
            .map((w) => w.trim().toLowerCase())
            .filter((w) => w.length > 0 && !w.startsWith('#'));
          
          if (rawWords.length === 0) {
            alert('File CSV kosong atau tidak memiliki kata terlarang yang valid.');
            return;
          }

          // Combine with existing forbidden words without duplicates
          const existingList = forbiddenWords
            .split(/[\r\n,]+/)
            .map((w) => w.trim().toLowerCase())
            .filter((w) => w.length > 0);

          const combinedSet = Array.from(new Set([...existingList, ...rawWords]));
          const formattedText = combinedSet.join(', ');
          
          setForbiddenWords(formattedText);
          triggerToast(`Berhasil mengimpor ${rawWords.length} kata terlarang baru dari CSV "${file.name}"!`);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSiteSettings({
        maintenanceConfig: maintenanceState,
      });
      triggerToast('Pengaturan Mode Pemeliharaan (Maintenance) berhasil disimpan!');
    } catch (err: any) {
      alert('Gagal menyimpan pengaturan maintenance: ' + err.message);
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    try {
      await updateSiteSettings({
        siteName,
        siteDescription,
        logoUrl: logoPreview,
        logoAdminUrl: logoAdminPreview,
        logoFooterUrl: logoFooterPreview,
        faviconUrl: faviconPreview,
        ogImageUrl: ogImagePreview,
        adminWhatsapp,
        autoApproveArtworks,
        allowCommentLinks,
        forbiddenWords,
      });
      setIsSaved(true);
      triggerToast('Pengaturan identitas situs berhasil disimpan permanen!');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      alert('Gagal menyimpan identitas situs: ' + (err?.message || 'Error'));
    } finally {
      setIsSavingGeneral(false);
    }
  };


  const handleCtaLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        setCtaLogoPreview(url);
        triggerToast('Logo Banner CTA berhasil diupload!');
      } catch (err: any) {
        alert(err.message || 'Gagal upload logo.');
      }
    }
  };

  const handleCtaImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        setCtaImagePreview(url);
        triggerToast('Gambar Banner CTA berhasil diupload!');
      } catch (err: any) {
        alert(err.message || 'Gagal upload gambar.');
      }
    }
  };

  const handleCtaBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        setCtaBgPreview(url);
        triggerToast('Background Banner CTA berhasil diupload!');
      } catch (err: any) {
        alert(err.message || 'Gagal upload background.');
      }
    }
  };
  const handleSaveCta = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      ctaTitle,
      ctaDescription,
      ctaButtonText,
      ctaButtonLink,
      ctaLogoUrl: ctaLogoPreview,
      ctaImageUrl: ctaImagePreview,
      ctaBgUrl: ctaBgPreview,
      ctaEnabled,
      ctaLinks,
      ctaSocialText,
      ctaSocialUrl,
    });
    setIsSaved(true);
    triggerToast('Pengaturan Banner CTA Beranda berhasil disimpan!');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const [isSavingPopup, setIsSavingPopup] = useState(false);

  const handleSavePopupConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPopup(true);
    
    try {
      const payload = {
        title: 'System Welcome Popup',
        slug: 'system-welcome-popup',
        content: JSON.stringify(popupConfig),
        published: true,
        useRootPath: false
      };
      
      let res;
      if (popupPageId) {
        res = await updateCustomPage(popupPageId, payload);
      } else {
        res = await addCustomPage(payload);
        if (res.success && res.data) {
          setPopupPageId(res.data.id);
        }
      }
      
      if (res && res.success) {
        setInitialPopupConfig(popupConfig);
        triggerToast('Pengaturan Welcome Pop-up berhasil disimpan permanen di database!');
      } else {
        alert(res?.error || 'Gagal menyimpan pengaturan.');
      }
    } catch (e: any) {
      console.error(e);
      alert('Terjadi kesalahan saat menyimpan pengaturan popup.');
    } finally {
      setIsSavingPopup(false);
    }
  };

  const handlePopupImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        setPopupConfig((prev) => ({
          ...prev,
          imageUrl: url,
        }));
        triggerToast('Gambar banner pop-up berhasil diupload!');
      } catch (err: any) {
        alert(err.message || 'Gagal upload gambar banner.');
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
        description: 'Tindakan ini akan menghapus SELURUH akun desainer dan member terdaftar (kecuali Super Admin).',
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
      <div 
        className={`fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transition-all duration-300 ${
          toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <CheckCircle size={18} className="text-emerald-400" />
        <span>{toastMessage || 'Berhasil disimpan'}</span>
      </div>

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

        {/* Tab Menu */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar gap-6 text-sm font-bold">
          <button onClick={() => setActiveTab('identity')} className={`pb-3 relative transition-all whitespace-nowrap ${activeTab === 'identity' ? 'text-[#F26522] border-b-2 border-[#F26522]' : 'text-gray-500 hover:text-gray-900'}`}>Identitas Web</button>
          <button onClick={() => setActiveTab('cta')} className={`pb-3 relative transition-all whitespace-nowrap ${activeTab === 'cta' ? 'text-[#F26522] border-b-2 border-[#F26522]' : 'text-gray-500 hover:text-gray-900'}`}>Banner CTA</button>
          <button onClick={() => setActiveTab('popup')} className={`pb-3 relative transition-all whitespace-nowrap ${activeTab === 'popup' ? 'text-[#F26522] border-b-2 border-[#F26522]' : 'text-gray-500 hover:text-gray-900'}`}>Pop-up Pengumuman</button>
          <button onClick={() => setActiveTab('maintenance')} className={`pb-3 relative transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'maintenance' ? 'text-amber-600 border-b-2 border-amber-600 font-bold' : 'text-gray-500 hover:text-amber-600'}`}>
            <span>Mode Pemeliharaan</span>
            {maintenanceState.globalEnabled && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
          <button onClick={() => setActiveTab('resource')} className={`pb-3 relative transition-all whitespace-nowrap ${activeTab === 'resource' ? 'text-[#F26522] border-b-2 border-[#F26522]' : 'text-gray-500 hover:text-gray-900'}`}>Storage & Server</button>
          <button onClick={() => setActiveTab('backup')} className={`pb-3 relative transition-all whitespace-nowrap ${activeTab === 'backup' ? 'text-[#F26522] border-b-2 border-[#F26522]' : 'text-gray-500 hover:text-gray-900'}`}>Backup Data</button>
          <button onClick={() => setActiveTab('filter')} className={`pb-3 relative transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'filter' ? 'text-[#F26522] border-b-2 border-[#F26522]' : 'text-gray-500 hover:text-gray-900'}`}><Filter size={14} /> Filter Komentar & Konten</button>
          <button onClick={() => setActiveTab('danger')} className={`pb-3 relative transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'danger' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-red-600'}`}><ShieldAlert size={14} /> Danger Zone</button>
        </div>

        <div className="space-y-8 max-w-5xl">
          
          {activeTab === 'identity' && (
            <>
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

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Nomor WhatsApp Admin Konfirmasi
                  </label>
                  <input
                    type="text"
                    value={adminWhatsapp}
                    onChange={(e) => setAdminWhatsapp(e.target.value)}
                    placeholder="6281199887766"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#F26522]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Nomor WhatsApp ini akan digunakan pada tombol "Hubungi Admin via WhatsApp" untuk pendaftar yang menunggu approval (Gunakan kode negara, contoh: 628123456789).
                  </p>
                </div>

                {/* Mode Moderasi Upload Karya Desainer */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Sistem Moderasi Unggah Karya Desainer
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      autoApproveArtworks ? 'bg-orange-50/80 border-[#F26522] ring-2 ring-orange-500/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100/70'
                    }`}>
                      <input
                        type="radio"
                        name="moderationMode"
                        checked={autoApproveArtworks === true}
                        onChange={() => setAutoApproveArtworks(true)}
                        className="mt-1 accent-[#F26522]"
                      />
                      <div>
                        <p className="text-xs font-extrabold text-gray-900">⚡ Otomatis Disetujui (Auto Approve)</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                          Karya baru yang diunggah desainer langsung terpublikasi secara otomatis ke publik.
                        </p>
                      </div>
                    </label>

                    <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      !autoApproveArtworks ? 'bg-[#1e293b]/5 border-[#1e293b] ring-2 ring-slate-500/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100/70'
                    }`}>
                      <input
                        type="radio"
                        name="moderationMode"
                        checked={autoApproveArtworks === false}
                        onChange={() => setAutoApproveArtworks(false)}
                        className="mt-1 accent-[#1e293b]"
                      />
                      <div>
                        <p className="text-xs font-extrabold text-gray-900">🛡️ Moderasi Admin (Menunggu Review)</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                          Karya berstatus `Pending`. Desainer melihat layar konfirmasi & menunggu persetujuan Admin di `/admin/artworks`.
                        </p>
                      </div>
                    </label>

                  </div>
                </div>
              </div>

              {/* Logo & Favicon Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                
                {/* Logo Web (Logo Utama) */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between gap-3.5">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Logo Utama Website</p>
                    <p className="text-[10px] text-gray-400">Homepage Header (Transparan)</p>
                  </div>
                  <div className="w-full h-28 bg-white rounded-lg border flex items-center justify-center p-2 shadow-inner overflow-hidden shrink-0">
                    {logoPreview && logoPreview !== '/favicon.ico' ? (
                      <img key={`logo-main-${logoPreview}`} src={logoPreview} alt="Logo Web" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <PksLogo key="logo-main-default" size="sm" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="w-full text-center py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition-colors block">
                      <span>{logoPreview && logoPreview !== '/favicon.ico' ? 'Ganti Logo' : 'Upload Logo'}</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    <button
                      type="button"
                      style={{ display: logoPreview && logoPreview !== '/favicon.ico' ? 'block' : 'none' }}
                      onClick={() => { setLogoPreview(''); triggerToast('Logo utama direset ke default.'); }}
                      className="w-full text-center py-1 text-[11px] text-red-500 hover:text-red-700 font-semibold"
                    >
                      Reset ke Default
                    </button>
                  </div>
                </div>

                {/* Logo Warna Terang (Admin) */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between gap-3.5">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Logo Warna Terang</p>
                    <p className="text-[10px] text-gray-400">Sidebar Admin Gelap (Transparan)</p>
                  </div>
                  <div className="w-full h-28 bg-gray-900 rounded-lg border border-gray-750 flex items-center justify-center p-2 shadow-inner overflow-hidden shrink-0">
                    {logoAdminPreview && logoAdminPreview !== '/favicon.ico' ? (
                      <img key={`logo-admin-${logoAdminPreview}`} src={logoAdminPreview} alt="Logo Admin" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div key="logo-admin-default" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#F26522] text-white font-black flex items-center justify-center text-[10px]">
                          PKS
                        </div>
                        <span className="text-xs text-white font-bold">Admin Standard</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="w-full text-center py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition-colors block">
                      <span>{logoAdminPreview && logoAdminPreview !== '/favicon.ico' ? 'Ganti Logo' : 'Upload Logo'}</span>
                      <input type="file" accept="image/*" onChange={handleLogoAdminUpload} className="hidden" />
                    </label>
                    <button
                      type="button"
                      style={{ display: logoAdminPreview && logoAdminPreview !== '/favicon.ico' ? 'block' : 'none' }}
                      onClick={() => { setLogoAdminPreview(''); triggerToast('Logo admin direset ke default.'); }}
                      className="w-full text-center py-1 text-[11px] text-red-500 hover:text-red-700 font-semibold"
                    >
                      Reset ke Default
                    </button>
                  </div>
                </div>

                {/* Logo Putih (Footer) */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between gap-3.5">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Logo Putih (Footer)</p>
                    <p className="text-[10px] text-gray-400">Footer Bawah (Transparan)</p>
                  </div>
                  <div className="w-full h-28 bg-gray-800 rounded-lg border border-gray-750 flex items-center justify-center p-2 shadow-inner overflow-hidden shrink-0">
                    {logoFooterPreview && logoFooterPreview !== '/favicon.ico' ? (
                      <img key={`logo-footer-${logoFooterPreview}`} src={logoFooterPreview} alt="Logo Footer" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span key="logo-footer-default" className="text-xs text-gray-400 font-bold">Logo Standar</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="w-full text-center py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition-colors block">
                      <span>{logoFooterPreview && logoFooterPreview !== '/favicon.ico' ? 'Ganti Logo' : 'Upload Logo'}</span>
                      <input type="file" accept="image/*" onChange={handleLogoFooterUpload} className="hidden" />
                    </label>
                    <button
                      type="button"
                      style={{ display: logoFooterPreview && logoFooterPreview !== '/favicon.ico' ? 'block' : 'none' }}
                      onClick={() => { setLogoFooterPreview(''); triggerToast('Logo footer direset ke default.'); }}
                      className="w-full text-center py-1 text-[11px] text-red-500 hover:text-red-700 font-semibold"
                    >
                      Reset ke Default
                    </button>
                  </div>
                </div>

                {/* Favicon Web */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between gap-3.5">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Favicon Browser</p>
                    <p className="text-[10px] text-gray-400">ICO / PNG (32x32)</p>
                  </div>
                  <div className="w-full h-28 bg-white rounded-lg border flex items-center justify-center p-2 shadow-inner overflow-hidden shrink-0">
                    {faviconPreview && faviconPreview !== '/favicon.ico' ? (
                      <img key={`favicon-${faviconPreview}`} src={faviconPreview} alt="Favicon" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div key="favicon-default" className="w-9 h-9 rounded-lg bg-orange-500/10 text-[#F26522] flex items-center justify-center font-bold text-xs">
                        ICO
                      </div>
                    )}
                  </div>
                  <label className="w-full text-center py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition-colors block">
                    <span>Ganti Favicon</span>
                    <input type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
                  </label>
                </div>

                {/* Thumbnail Social Share (WhatsApp / FB) */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between gap-3.5 sm:col-span-2 md:col-span-4">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Thumbnail Social Share (WhatsApp / FB / Twitter)</p>
                    <p className="text-[10px] text-gray-500">Gambar yang otomatis muncul saat link homepage atau link umum dibagikan (Rasio 1200x630)</p>
                  </div>
                  <div className="w-full h-40 bg-white rounded-lg border flex items-center justify-center p-2 shadow-inner overflow-hidden shrink-0">
                    {ogImagePreview ? (
                      <img
                        key={`og-${ogImagePreview}`}
                        src={ogImagePreview}
                        alt="Social Share Thumbnail"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          console.error("Error loading OG Image preview:", ogImagePreview);
                        }}
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon size={32} className="mx-auto text-gray-300 mb-1" />
                        <p className="text-xs font-semibold text-gray-500">Belum ada thumbnail khusus social share</p>
                        <p className="text-[10px] text-gray-400">Rekomendasi ukuran: 1200 x 630 px (.PNG / .JPG)</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 text-center py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition-colors block">
                      <span>{ogImagePreview ? 'Ganti Thumbnail Share' : 'Upload Thumbnail Share (1200x630)'}</span>
                      <input type="file" accept="image/*" onChange={handleOgImageUpload} className="hidden" />
                    </label>
                    {ogImagePreview && (
                      <button
                        type="button"
                        onClick={() => { setOgImagePreview(''); triggerToast('Thumbnail social share direset.'); }}
                        className="px-4 py-2 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-lg font-bold"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingGeneral}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  <Save size={16} />
                  <span className={isSavingGeneral ? 'hidden' : 'block'}>Simpan Perubahan Identitas</span>
                  <span className={isSavingGeneral ? 'block' : 'hidden'}>Menyimpan...</span>
                </button>
              </div>

            </form>
          </div>

          </>
          )}

          {activeTab === 'cta' && (
            <>
          {/* Section 2: Pengaturan Banner CTA Beranda */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 mb-6 gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <HardDrive size={20} className="text-[#F26522]" />
                  <span>2. Pengaturan Banner CTA Beranda (CTA Banner Homepage)</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Atur tampilan spanduk promosi/ajakan bertindak (Call-To-Action) dinamis yang terletak di atas footer beranda.
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-3 bg-gray-50 px-3.5 py-1.5 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-700">Tampilkan Banner:</span>
                <button
                  type="button"
                  onClick={() => setCtaEnabled(!ctaEnabled)}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                    ctaEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      ctaEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`text-xs font-bold ${ctaEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {ctaEnabled ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveCta} className="space-y-6">
              
              {/* Text Fields */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Paragraf Deskripsi Spanduk (CTA Description Text)
                  </label>
                  <textarea
                    rows={4}
                    value={ctaDescription}
                    onChange={(e) => setCtaDescription(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#F26522] leading-relaxed"
                    required
                    disabled={!ctaEnabled}
                    placeholder="Tulis deskripsi spanduk di sini..."
                  />
                </div>
              </div>

              {/* Big Upload Previews */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100 pt-5 mt-2">
                {/* Logo Banner */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Logo Spanduk (CTA Logo)</p>
                    <p className="text-[10px] text-gray-400">Dimensi Landscape (Transparan)</p>
                  </div>
                  <div className="w-full h-32 flex items-center justify-center bg-[#141517] rounded-xl border border-gray-800 p-3 shadow-inner overflow-hidden shrink-0">
                    {ctaLogoPreview ? (
                      <img src={ctaLogoPreview} alt="Logo Banner" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-xs text-gray-600 font-bold">N/A (Gelap)</span>
                    )}
                  </div>
                  <label className={`w-full text-center py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition-colors ${!ctaEnabled && 'opacity-50 pointer-events-none'}`}>
                    <span>Ganti Logo</span>
                    <input type="file" accept="image/*" onChange={handleCtaLogoUpload} className="hidden" disabled={!ctaEnabled} />
                  </label>
                </div>

                {/* Gambar Samping (Main Image / Mascot) */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Gambar Ilustrasi / Maskot</p>
                    <p className="text-[10px] text-gray-400">Grafis Bagian Kanan Spanduk</p>
                  </div>
                  <div className="w-full h-32 flex items-center justify-center bg-white rounded-xl border p-2 shadow-inner overflow-hidden shrink-0">
                    {ctaImagePreview ? (
                      <img src={ctaImagePreview} alt="Gambar Banner" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-xs text-gray-400 font-bold">N/A (Terang)</span>
                    )}
                  </div>
                  <label className={`w-full text-center py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition-colors ${!ctaEnabled && 'opacity-50 pointer-events-none'}`}>
                    <span>Ganti Ilustrasi</span>
                    <input type="file" accept="image/*" onChange={handleCtaImageUpload} className="hidden" disabled={!ctaEnabled} />
                  </label>
                </div>

                {/* Background Banner */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Latar Belakang Spanduk (Bg)</p>
                    <p className="text-[10px] text-gray-400">Gambar Background Banner</p>
                  </div>
                  <div className="w-full h-32 flex items-center justify-center bg-gray-950 rounded-xl border border-gray-850 p-1 shadow-inner overflow-hidden shrink-0">
                    {ctaBgPreview ? (
                      <img src={ctaBgPreview} alt="Background Banner" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-xs text-gray-700 font-bold">N/A (Default Gelap)</span>
                    )}
                  </div>
                  <label className={`w-full text-center py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition-colors ${!ctaEnabled && 'opacity-50 pointer-events-none'}`}>
                    <span>Ganti Background</span>
                    <input type="file" accept="image/*" onChange={handleCtaBgUpload} className="hidden" disabled={!ctaEnabled} />
                  </label>
                </div>
              </div>

              {/* Social Media Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-5 mt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Teks Tautan Sosial (Medsos)
                  </label>
                  <input
                    type="text"
                    value={ctaSocialText}
                    onChange={(e) => setCtaSocialText(e.target.value)}
                    placeholder="misal: Follow @pksart"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#F26522]"
                    disabled={!ctaEnabled}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Tautan Sosial URL
                  </label>
                  <input
                    type="text"
                    value={ctaSocialUrl}
                    onChange={(e) => setCtaSocialUrl(e.target.value)}
                    placeholder="misal: #"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#F26522]"
                    disabled={!ctaEnabled}
                  />
                </div>
              </div>

              {/* 🔗 Dynamic Links List Editor (Placed exactly above Save Button) */}
              <div className="border-t border-gray-100 pt-5 mt-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-3">
                  Daftar Tautan Spanduk (CTA Inline Links List)
                </label>
                <datalist id="pages-list">
                  {customPages.filter(p => p.published).map((page) => (
                    <option key={page.id} value={`/p/${page.slug}`}>
                      {page.title}
                    </option>
                  ))}
                </datalist>
                <div className="space-y-2 max-w-4xl">
                  {ctaLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2 py-1">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => {
                          const updated = [...ctaLinks];
                          updated[idx].label = e.target.value;
                          setCtaLinks(updated);
                        }}
                        placeholder="Label Tautan (misal: Beranda)"
                        className="w-1/3 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#F26522]"
                        required
                        disabled={!ctaEnabled}
                      />
                      <input
                        type="text"
                        list="pages-list"
                        value={link.url}
                        onChange={(e) => {
                          const updated = [...ctaLinks];
                          updated[idx].url = e.target.value;
                          setCtaLinks(updated);
                        }}
                        placeholder="URL (misal: /tentang atau #)"
                        className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                        required
                        disabled={!ctaEnabled}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = ctaLinks.filter((_, i) => i !== idx);
                          setCtaLinks(updated);
                        }}
                        className="p-1.5 text-red-500 hover:text-red-750 hover:bg-red-50 rounded-lg transition-all shrink-0"
                        title="Hapus Tautan"
                        disabled={!ctaEnabled}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => setCtaLinks([...ctaLinks, { label: '', url: '' }])}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-all mt-1"
                    disabled={!ctaEnabled}
                  >
                    <span>+ Tambah Tautan</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                  disabled={!ctaEnabled}
                >
                  <Save size={16} />
                  <span>Simpan Perubahan Banner CTA</span>
                </button>
              </div>
            </form>
          </div>

          </>
          )}

          {activeTab === 'popup' && (
            <>
          {/* Section 3: Welcome Pop-up Settings */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 mb-6 gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles size={20} className="text-[#F26522]" />
                  <span>3. Pengaturan Welcome Pop-up Homepage</span>
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
                    <span>{isSavingPopup ? 'Menyimpan...' : 'Simpan Pengaturan Pop-up'}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>

          </>
          )}

          {activeTab === 'maintenance' && (
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Wrench className="text-amber-500" size={20} />
                    <span>Pengaturan Mode Pemeliharaan Sistem (Maintenance)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Aktifkan mode pemeliharaan untuk seluruh website sekaligus atau pilih modul tertentu secara spesifik.
                  </p>
                </div>

                <a
                  href="/maintenance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Eye size={14} />
                  <span>Preview Halaman Maintenance</span>
                </a>
              </div>

              <form onSubmit={handleSaveMaintenance} className="space-y-6">
                
                {/* 1. Master Toggle (Global Maintenance) */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  maintenanceState.globalEnabled
                    ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        maintenanceState.globalEnabled ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900">Mode Pemeliharaan Global (Seluruh Situs)</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Aktifkan saklar ini untuk mengunci SELURUH halaman utama website secara bersamaan.
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={maintenanceState.globalEnabled}
                        onChange={(e) => setMaintenanceState({ ...maintenanceState, globalEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                    </label>
                  </div>
                </div>

                {/* 2. Per-Module Maintenance Toggles */}
                <div>
                  <h4 className="font-bold text-xs uppercase text-gray-700 tracking-wider mb-3 flex items-center gap-1.5">
                    <Layers size={14} className="text-[#F26522]" />
                    <span>Pemeliharaan Spesifik Per-Modul / Halaman</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    
                    {/* Module 1: Karya & Eksplorasi */}
                    <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      maintenanceState.modules?.explore ? 'bg-orange-50/80 border-[#F26522]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100/80'
                    }`}>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Karya & Eksplorasi</p>
                        <p className="text-[10px] text-gray-500">`/explore`, `/artwork/*`</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!maintenanceState.modules?.explore}
                        onChange={(e) => setMaintenanceState({
                          ...maintenanceState,
                          modules: { ...maintenanceState.modules, explore: e.target.checked }
                        })}
                        className="w-4 h-4 accent-[#F26522]"
                      />
                    </label>

                    {/* Module 2: Aset Desain */}
                    <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      maintenanceState.modules?.assets ? 'bg-orange-50/80 border-[#F26522]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100/80'
                    }`}>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Aset Desain</p>
                        <p className="text-[10px] text-gray-500">`/assets`</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!maintenanceState.modules?.assets}
                        onChange={(e) => setMaintenanceState({
                          ...maintenanceState,
                          modules: { ...maintenanceState.modules, assets: e.target.checked }
                        })}
                        className="w-4 h-4 accent-[#F26522]"
                      />
                    </label>

                    {/* Module 3: Direktori Desainer */}
                    <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      maintenanceState.modules?.creators ? 'bg-orange-50/80 border-[#F26522]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100/80'
                    }`}>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Direktori Desainer</p>
                        <p className="text-[10px] text-gray-500">`/creators`, `/creators/*`</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!maintenanceState.modules?.creators}
                        onChange={(e) => setMaintenanceState({
                          ...maintenanceState,
                          modules: { ...maintenanceState.modules, creators: e.target.checked }
                        })}
                        className="w-4 h-4 accent-[#F26522]"
                      />
                    </label>

                    {/* Module 4: Buat Twibbon */}
                    <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      maintenanceState.modules?.twibbon ? 'bg-orange-50/80 border-[#F26522]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100/80'
                    }`}>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Buat Twibbon</p>
                        <p className="text-[10px] text-gray-500">`/twibbon`, `/twibbon/*`</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!maintenanceState.modules?.twibbon}
                        onChange={(e) => setMaintenanceState({
                          ...maintenanceState,
                          modules: { ...maintenanceState.modules, twibbon: e.target.checked }
                        })}
                        className="w-4 h-4 accent-[#F26522]"
                      />
                    </label>

                    {/* Module 5: Unggah Karya */}
                    <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      maintenanceState.modules?.upload ? 'bg-orange-50/80 border-[#F26522]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100/80'
                    }`}>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Unggah Karya</p>
                        <p className="text-[10px] text-gray-500">`/upload`</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!maintenanceState.modules?.upload}
                        onChange={(e) => setMaintenanceState({
                          ...maintenanceState,
                          modules: { ...maintenanceState.modules, upload: e.target.checked }
                        })}
                        className="w-4 h-4 accent-[#F26522]"
                      />
                    </label>

                    {/* Module 6: Login & Registrasi */}
                    <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      maintenanceState.modules?.auth ? 'bg-orange-50/80 border-[#F26522]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100/80'
                    }`}>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Login & Registrasi</p>
                        <p className="text-[10px] text-gray-500">`/login`, `/register`</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!maintenanceState.modules?.auth}
                        onChange={(e) => setMaintenanceState({
                          ...maintenanceState,
                          modules: { ...maintenanceState.modules, auth: e.target.checked }
                        })}
                        className="w-4 h-4 accent-[#F26522]"
                      />
                    </label>

                  </div>
                </div>

                {/* 3. Custom Maintenance Message & Settings */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Judul Pesan Pemeliharaan
                    </label>
                    <input
                      type="text"
                      value={maintenanceState.title || ''}
                      onChange={(e) => setMaintenanceState({ ...maintenanceState, title: e.target.value })}
                      placeholder="Mode Pemeliharaan Sistem"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#F26522]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Deskripsi / Penjelasan Pemeliharaan
                    </label>
                    <textarea
                      rows={3}
                      value={maintenanceState.description || ''}
                      onChange={(e) => setMaintenanceState({ ...maintenanceState, description: e.target.value })}
                      placeholder="Tuliskan penjelasan pemeliharaan..."
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Estimasi Selesai (Teks Bebas)
                      </label>
                      <input
                        type="text"
                        value={maintenanceState.estimatedTime || ''}
                        onChange={(e) => setMaintenanceState({ ...maintenanceState, estimatedTime: e.target.value })}
                        placeholder="Contoh: Estimasi selesai: 1-2 Jam"
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3 cursor-pointer w-full mt-5">
                        <input
                          type="checkbox"
                          checked={maintenanceState.allowAdminBypass !== false}
                          onChange={(e) => setMaintenanceState({ ...maintenanceState, allowAdminBypass: e.target.checked })}
                          className="w-4 h-4 accent-[#F26522]"
                        />
                        <div>
                          <p className="text-xs font-extrabold text-gray-900">Bypass Akses Super Admin</p>
                          <p className="text-[10px] text-gray-500">Super Admin tetap bisa membuka web saat maintenance aktif.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Save size={16} />
                    <span>Simpan Pengaturan Maintenance</span>
                  </button>
                </div>

              </form>

            </div>
          )}

          {activeTab === 'resource' && (
            <>
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

          </>
          )}

          {activeTab === 'backup' && (
            <>
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

          </>
          )}

          {activeTab === 'filter' && (
            <>
            {/* Section: Filter Komentar & Konten Terlarang */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                    <Filter size={20} className="text-[#F26522]" />
                    <span>Filter Komentar & Konten Terlarang (Blacklist Words)</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Proteksi real-time otomatis untuk memblokir kata kasar, judi, SARA, dan spam pada judul karya, deskripsi, dan komentar pengguna.
                  </p>
                </div>

                {/* CSV Upload & Template Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <label className="px-3.5 py-2 bg-white border border-gray-300 hover:border-[#F26522] text-gray-700 hover:text-[#F26522] text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-2 shadow-xs">
                    <FileSpreadsheet size={15} className="text-emerald-600" />
                    <span>Upload File CSV Blacklist</span>
                    <input type="file" accept=".csv, .txt" onChange={handleForbiddenWordsCsvUpload} className="hidden" />
                  </label>

                  <a
                    href="/template_kata_terlarang.csv"
                    download="template_kata_terlarang.csv"
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 bg-gray-50 border border-gray-200 rounded-xl transition-colors text-xs font-semibold flex items-center justify-center"
                    title="Unduh Template CSV (Siap Edit di Excel)"
                  >
                    <Download size={15} />
                  </a>
                </div>
              </div>

              <div className="bg-orange-50/60 rounded-2xl p-5 border border-orange-100 space-y-4">
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  Anda dapat menelaah, menambah, atau mengedit daftar kata terlarang secara manual di bawah ini (dipisahkan koma atau baris baru), atau mengunggah berkas <strong>.CSV / .TXT</strong> berisi daftar <em>forbidden words</em>.
                </p>

                <form onSubmit={handleSaveGeneral} className="space-y-5">
                  
                  {/* Toggle Switch Filter Link / Hyperlink */}
                  <div className="bg-white p-4 rounded-xl border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <span>Izin Tautan / Link pada Komentar</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${allowCommentLinks ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {allowCommentLinks ? 'Diizinkan' : 'Dilarang (Blokir Link)'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Memblokir otomatis komentar yang mengandung hyperlink / URL (seperti <code>https://</code>, <code>www.</code>, atau domain <code>xxx.xxx</code> / <code>xxx.com</code>).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAllowCommentLinks(!allowCommentLinks)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        allowCommentLinks ? 'bg-[#F26522]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          allowCommentLinks ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-gray-800 uppercase">
                        Daftar Kata Terlarang Aktif
                      </label>
                      {forbiddenWords && (
                        <button
                          type="button"
                          onClick={() => setForbiddenWords('')}
                          className="text-[11px] font-bold text-red-600 hover:underline"
                        >
                          Kosongkan Semua
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={6}
                      value={forbiddenWords}
                      onChange={(e) => setForbiddenWords(e.target.value)}
                      placeholder="Contoh: judi, slot, gacor, bokep, porno, sara, rasis, penipu"
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#F26522] transition-all leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSavingGeneral}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      <Save size={16} />
                      <span>{isSavingGeneral ? 'Menyimpan...' : 'Simpan Daftar Kata Terlarang'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
            </>
          )}

          {activeTab === 'danger' && (
            <>
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
                    Menghapus seluruh akun desainer & member terdaftar (kecuali Super Admin).
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

            </>
          )}

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
