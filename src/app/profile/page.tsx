'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Mail,
  PhoneCall,
  MapPin,
  Building,
  Lock,
  Camera,
  CheckCircle,
  ArrowLeft,
  Grid,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Download,
  Heart,
  Image as ImageIcon,
  LayoutGrid,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
} from 'lucide-react';
import { Footer } from '@/components/Footer';
import { formatPhoneNumber } from '@/lib/phone';
import { Header } from '@/components/Header';
import { REGIONS } from '@/lib/data';
import { useData } from '@/context/DataContext';
import { compressImageFile } from '@/lib/imageCompressor';
import { ArtworkCard } from '@/components/ArtworkCard';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, updateUser, addResetRequest, artworks, twibbons, deleteArtwork } = useData();

  const [userData, setUserData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    region: currentUser?.region || '',
    avatar: currentUser?.avatar || '',
    role: currentUser?.role || 'Desainer',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset password request states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetName, setResetName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(userData.avatar);
  const [isMounted, setIsMounted] = useState(false);

  const [activeTab, setActiveTab] = useState<'profile' | 'used-twibbon'>('profile');
  const [usedTwibbonsList, setUsedTwibbonsList] = useState<any[]>([]);
  const [isLoadingUsedTwibbons, setIsLoadingUsedTwibbons] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch used twibbons when tab changes to used-twibbon
  useEffect(() => {
    if (activeTab === 'used-twibbon' && currentUser?.id) {
      setIsLoadingUsedTwibbons(true);
      import('@/actions/twibbon').then(({ getUserUsedTwibbons }) => {
        getUserUsedTwibbons(currentUser.id).then((res) => {
          if (res.success && res.data) {
            setUsedTwibbonsList(res.data);
          }
          setIsLoadingUsedTwibbons(false);
        });
      });
    }
  }, [activeTab, currentUser?.id]);

  // Sync state when currentUser is loaded or updated
  useEffect(() => {
    if (currentUser) {
      setUserData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        region: currentUser.region || '',
        avatar: currentUser.avatar || '',
        role: currentUser.role || 'Desainer',
      });
      setAvatarPreview(currentUser.avatar || '');
    }
  }, [currentUser]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6">
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-100 rounded-xl w-1/3"></div>
              <div className="h-4 bg-gray-100 rounded-xl w-1/2"></div>
              <div className="flex items-center gap-5 pt-4">
                <div className="w-20 h-20 rounded-full bg-gray-100"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-24"></div>
                  <div className="h-3 bg-gray-100 rounded w-36"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="h-12 bg-gray-50 rounded-xl"></div>
                <div className="h-12 bg-gray-50 rounded-xl"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formDataPayload = new FormData();
        formDataPayload.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formDataPayload });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Upload gagal');
        setAvatarPreview(data.url);
        setUserData((prev) => {
          const next = { ...prev, avatar: data.url };
          if (currentUser?.id) {
            updateUser(currentUser.id, next);
          }
          return next;
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } catch (err: any) {
        alert(err.message || 'Gagal upload foto profil.');
      }
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.id) {
      const finalData = { ...userData, avatar: avatarPreview || userData.avatar };
      updateUser(currentUser.id, finalData);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px] pb-20 md:pb-6">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Back and Navigation Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#F26522] transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Kembali</span>
          </button>

          <Link
            href="/my-artworks"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            <Grid size={16} />
            <span>Kelola Postingan Karya Saya</span>
          </Link>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="mb-6 flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-[#F26522] text-[#F26522]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <UserIcon size={16} />
            <span>Edit Profil Saya</span>
          </button>

          <button
            onClick={() => setActiveTab('used-twibbon')}
            className={`px-5 py-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'used-twibbon'
                ? 'border-[#F26522] text-[#F26522]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Layers size={16} />
            <span>Twibbon Yang Dipakai</span>
            {usedTwibbonsList.length > 0 && (
              <span className="bg-orange-100 text-[#F26522] text-[10px] font-black px-2 py-0.5 rounded-full">
                {usedTwibbonsList.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'profile' ? (
          /* Profile Edit Card */
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="border-b border-gray-100 pb-5 mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                  Pengaturan Profil Saya
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Perbarui informasi akun, foto profil, dan kontak WhatsApp Anda.
                </p>
              </div>

              {isSaved && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold rounded-full animate-in fade-in">
                  <CheckCircle size={16} />
                  <span>Berhasil Disimpan!</span>
                </span>
              )}
            </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            
            {/* Avatar Upload Section */}
            <div className="flex items-center gap-5">
              <div className="relative group">
                <img
                  src={avatarPreview || userData.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200'}
                  alt={userData.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-orange-100 shadow-md"
                />
                <label className="absolute bottom-0 right-0 p-2 bg-[#F26522] text-white rounded-full cursor-pointer shadow-md hover:scale-110 transition-transform">
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900">{userData.name}</h3>
                <p className="text-xs text-gray-500 font-medium">{userData.region} • {userData.role}</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Format gambar: JPG, PNG (Maks 5MB)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon size={18} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    placeholder="Nama Lengkap Anda"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    placeholder="contoh: roni@pks.art"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-medium"
                    required
                  />
                </div>
              </div>

              {/* Nomor WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Nomor WhatsApp <span className="text-red-500">* (Wajib)</span>
                </label>
                <div className="relative">
                  <PhoneCall size={18} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    onBlur={(e) => {
                      if (e.target.value) {
                        setUserData(prev => ({ ...prev, phone: formatPhoneNumber(e.target.value) }));
                      }
                    }}
                    placeholder="081299887766 atau +6281299887766"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-medium"
                    required
                  />
                </div>
              </div>

              {/* Wilayah */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Wilayah
                </label>
                <div className="relative">
                  <Building size={18} className="absolute left-3.5 top-3 text-gray-400" />
                  <select
                    value={userData.region}
                    onChange={(e) => setUserData({ ...userData, region: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-medium"
                  >
                    {REGIONS.filter((r) => r !== 'Semua Daerah').map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Alamat Lengkap */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Alamat Lengkap <span className="text-red-500">* (Wajib)</span>
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3.5 top-3 text-gray-400" />
                <textarea
                  rows={3}
                  value={userData.address}
                  onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                  placeholder="Isi alamat lengkap tempat tinggal Anda..."
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-medium"
                  required
                />
              </div>
            </div>            {/* Password Change Section */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Lock size={16} className="text-[#F26522]" />
                <span>Ubah Kata Sandi (Opsional)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Kata Sandi Lama */}
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    placeholder="Kata Sandi Lama"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 placeholder:font-normal rounded-xl pl-3.5 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#F26522] focus:bg-white font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Kata Sandi Baru */}
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Kata Sandi Baru"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 placeholder:font-normal rounded-xl pl-3.5 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#F26522] focus:bg-white font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Konfirmasi Kata Sandi */}
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Konfirmasi Kata Sandi"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 placeholder:font-normal rounded-xl pl-3.5 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#F26522] focus:bg-white font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setResetName(currentUser?.name || '');
                    setResetEmail(currentUser?.email || '');
                    setResetPhone(currentUser?.phone || '');
                    setShowResetModal(true);
                    setResetSuccessMessage(false);
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-[#F26522] transition-colors"
                >
                  Lupa Kata Sandi? Kirim Permintaan Reset ke Admin
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#F26522] hover:bg-[#d85417] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.99] text-sm"
            >
              Simpan Perubahan Profil
            </button>

          </form>
        </div>
        ) : (
          /* Twibbon Yang Dipakai Tab View */
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="border-b border-gray-100 pb-5 mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Layers className="text-[#F26522]" />
                  <span>Twibbon Yang Pernah Anda Buat</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Daftar riwayat bingkai twibbon yang pernah Anda gunakan dan unduh.
                </p>
              </div>
            </div>

            {isLoadingUsedTwibbons ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#F26522] mb-3"></div>
                <p className="text-xs font-semibold">Memuat riwayat twibbon...</p>
              </div>
            ) : usedTwibbonsList.length === 0 ? (
              <div className="py-12 text-center text-gray-400 flex flex-col items-center">
                <Layers size={40} className="text-gray-300 mb-3" />
                <p className="font-bold text-sm text-gray-700">Belum Ada Twibbon Yang Digunakan</p>
                <p className="text-xs text-gray-400 max-w-sm mt-1 mb-4">
                  Anda belum pernah membuat twibbon. Cari bingkai menarik dan buat twibbon pertama Anda!
                </p>
                <Link
                  href="/twibbon"
                  className="px-4 py-2 bg-[#F26522] hover:bg-[#d85417] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Jelajahi Galeri Twibbon
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {usedTwibbonsList.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50/80 rounded-2xl border border-gray-200/80 p-3.5 flex flex-col justify-between hover:shadow-md transition-all group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-white border border-gray-200 relative mb-3">
                      {item.resultImageUrl ? (
                        <img
                          src={item.resultImageUrl}
                          alt={item.twibbon?.title || 'Hasil Twibbon'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <img
                          src={item.twibbon?.imageUrl}
                          alt={item.twibbon?.title || 'Frame Twibbon'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 line-clamp-1 group-hover:text-[#F26522] transition-colors">
                        {item.twibbon?.title || 'Frame Twibbon PKS'}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                        Kategori: {item.twibbon?.category || 'Nasional'} • {item.twibbon?.region || 'Official'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">
                        Dibuat pada: {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>

                      <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-between">
                        <Link
                          href={`/twibbon/${item.twibbon?.slug || item.twibbon?.id}`}
                          className="text-xs font-bold text-[#F26522] hover:underline flex items-center gap-1"
                        >
                          <Sparkles size={12} />
                          <span>Buat Lagi</span>
                        </Link>

                        {item.resultImageUrl && (
                          <a
                            href={item.resultImageUrl}
                            download={`Twibbon_${item.twibbon?.title || 'PKS'}.png`}
                            className="p-1.5 bg-white border border-gray-200 text-gray-700 hover:text-[#F26522] hover:border-orange-200 rounded-lg shadow-sm transition-all"
                            title="Unduh Lagi"
                          >
                            <Download size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Password Reset Request Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 relative">
            <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Lock size={18} className="text-[#F26522]" />
              <span>Minta Reset Kata Sandi</span>
            </h3>
            
            {!resetSuccessMessage ? (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await addResetRequest({ name: resetName, email: resetEmail, phone: resetPhone });
                  if (res && res.success === false) {
                    alert(res.error || 'Gagal mengirimkan permohonan reset.');
                    return;
                  }
                  setResetSuccessMessage(true);
                }}
                className="space-y-4 mt-4"
              >
                <p className="text-xs text-gray-500 leading-relaxed">
                  Permintaan reset kata sandi Anda akan dikirim ke Super Admin. Setelah disetujui, admin akan mengirimkan **tautan reset kata sandi (berlaku 5 menit)** langsung via WhatsApp.
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={resetName}
                    onChange={(e) => setResetName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#F26522]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Alamat Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value) {
                        setResetPhone(formatPhoneNumber(e.target.value));
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Kirim Permintaan
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 mt-4 text-center py-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h4 className="text-sm font-bold text-gray-900">Permintaan Dikirim!</h4>
                <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                  Permintaan Anda berhasil diajukan ke admin. Silakan tunggu pemberitahuan pembaruan kata sandi baru dari admin yang akan dikirim langsung ke nomor WhatsApp <strong>{resetPhone}</strong> Anda.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-colors w-full"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
