'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Header } from '@/components/Header';
import { REGIONS } from '@/lib/data';
import { useData } from '@/context/DataContext';
import { compressImageFile } from '@/lib/imageCompressor';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, updateUser } = useData();

  const [userData, setUserData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    address: currentUser.address,
    region: currentUser.region,
    avatar: currentUser.avatar,
    role: currentUser.role || 'Kreator',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaved, setIsSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(userData.avatar);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await compressImageFile(file, 2, 500, 0.85);
        setAvatarPreview(result.dataUrl);
        setUserData((prev) => ({ ...prev, avatar: result.dataUrl }));
      } catch (err: any) {
        alert(err.message || 'Gagal memproses gambar avatar.');
      }
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.id, userData);
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

        {/* Profile Edit Card */}
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
                  src={avatarPreview}
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
                    placeholder="081299887766"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-medium"
                    required
                  />
                </div>
              </div>

              {/* Wilayah DPW */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Wilayah DPW / Daerah
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
            </div>

            {/* Password Change Section */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Lock size={16} className="text-[#F26522]" />
                <span>Ubah Kata Sandi (Opsional)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="password"
                  placeholder="Kata Sandi Lama"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className="bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 placeholder:font-normal rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#F26522] focus:bg-white"
                />
                <input
                  type="password"
                  placeholder="Kata Sandi Baru"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 placeholder:font-normal rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#F26522] focus:bg-white"
                />
                <input
                  type="password"
                  placeholder="Konfirmasi Kata Sandi"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 placeholder:font-normal rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#F26522] focus:bg-white"
                />
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
      </main>
    </div>
  );
}
