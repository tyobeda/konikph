'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Mail,
  PhoneCall,
  MapPin,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Building,
} from 'lucide-react';
import { PksLogo } from '@/components/PksLogo';
import { REGIONS } from '@/lib/data';
import { useData } from '@/context/DataContext';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useData();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    region: 'DPW Jawa Barat',
    password: '',
    confirmPassword: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!formData.name.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Alamat email tidak valid.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Nomor WhatsApp wajib diisi.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage('Alamat lengkap wajib diisi.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      registerUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        region: formData.region,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        role: 'Kreator PKS',
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 1200);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Top Header Link */}
      <div className="max-w-md w-full mx-auto mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#F26522] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </Link>

        <PksLogo size="sm" />
      </div>

      {/* Main Registration Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Daftar Akun PKSart
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Bergabunglah bersama komunitas kreator & pengurus daerah PKS seluruh Indonesia.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 animate-in fade-in">
            ⚠️ {errorMessage}
          </div>
        )}

        {isSuccess ? (
          <div className="py-8 text-center animate-in zoom-in-95">
            <CheckCircle2 size={56} className="text-emerald-500 mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-gray-900">Pendaftaran Berhasil!</h3>
            <p className="text-xs text-gray-500 mt-1">
              Akun Anda telah terdaftar. Mengalihkan ke halaman masuk...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserIcon size={18} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama Lengkap Anda"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-semibold"
                  required
                />
              </div>
            </div>

            {/* Email (Wajib) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Alamat Email <span className="text-red-500">* (Wajib)</span>
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contoh: email@pks.art"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-medium"
                  required
                />
              </div>
            </div>

            {/* Nomor WhatsApp (Wajib) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Nomor WhatsApp <span className="text-red-500">* (Wajib)</span>
              </label>
              <div className="relative">
                <PhoneCall size={18} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="081234567890"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-medium"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Digunakan untuk verifikasi & notifikasi unduhan karya.
              </p>
            </div>

            {/* Alamat Lengkap (Wajib) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Alamat Lengkap <span className="text-red-500">* (Wajib)</span>
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3.5 top-3 text-gray-400" />
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-medium"
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
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-medium"
                >
                  {REGIONS.filter((r) => r !== 'Semua Daerah').map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Konfirmasi Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ketik ulang kata sandi"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 bg-[#F26522] hover:bg-[#d85417] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 text-sm"
            >
              {isSubmitting ? 'Memproses Pendaftaran...' : 'Daftar Akun Sekarang'}
            </button>
          </form>
        )}

        {/* Footer login link */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="font-bold text-[#F26522] hover:underline">
            Masuk ke Akun
          </Link>
        </div>

      </div>
    </div>
  );
}
