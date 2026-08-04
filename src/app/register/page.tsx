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
  Eye,
  EyeOff,
} from 'lucide-react';
import { PksLogo } from '@/components/PksLogo';
import { REGIONS } from '@/lib/data';
import { useData } from '@/context/DataContext';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser, users, currentUser, isMounted } = useData();

  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'Super Admin' || currentUser.role?.includes('DPW')) {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    }
  }, [currentUser, router]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    region: 'DPW Jawa Barat',
    gender: 'Laki-laki',
    password: '',
    confirmPassword: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [regionSearch, setRegionSearch] = useState('DPW Jawa Barat');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  // XSS & SQLi Protection Sanitizer
  const sanitize = (val: string): string => {
    if (!val) return '';
    // Strip HTML/Script tags to prevent XSS
    let clean = val.replace(/<[^>]*>/g, '');
    // Strip potential SQLi injection syntax patterns or characters
    clean = clean.replace(/['"\\;]/g, '');
    return clean.trim();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Sanitize user inputs first
    const sanitizedName = sanitize(formData.name);
    const sanitizedEmail = sanitize(formData.email);
    const sanitizedPhone = sanitize(formData.phone);
    const sanitizedAddress = sanitize(formData.address);
    const sanitizedRegion = sanitize(regionSearch);
    const sanitizedGender = sanitize(formData.gender);

    // Validations
    if (!sanitizedName) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }
    if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
      setErrorMessage('Alamat email tidak valid.');
      return;
    }
    if (!sanitizedPhone) {
      setErrorMessage('Nomor WhatsApp wajib diisi.');
      return;
    }
    if (!sanitizedRegion) {
      setErrorMessage('Wilayah DPW / Daerah wajib dipilih.');
      return;
    }

    // Uniqueness Checks
    const emailExists = users.some((u) => u.email.toLowerCase() === sanitizedEmail.toLowerCase());
    if (emailExists) {
      setErrorMessage('Alamat email sudah terdaftar. Silakan gunakan email lain.');
      return;
    }

    const phoneExists = users.some((u) => u.phone === sanitizedPhone);
    if (phoneExists) {
      setErrorMessage('Nomor WhatsApp sudah terdaftar. Silakan gunakan nomor lain.');
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

    const res = await registerUser({
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      address: sanitizedAddress,
      region: sanitizedRegion,
      gender: sanitizedGender,
      avatar: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23E5E7EB%22/><path d=%22M50 50C41.7157 50 35 43.2843 35 35C35 26.7157 41.7157 20 50 20C58.2843 20 65 26.7157 65 35C65 43.2843 58.2843 50 50 50ZM50 55C66.5685 55 80 68.4315 80 85H20C20 68.4315 33.4315 55 50 55Z%22 fill=%22%239CA3AF%22/></svg>',
      role: 'Kreator PKS',
    });

    setIsSubmitting(false);
    
    if (res?.success) {
      setIsSuccess(true);
    } else {
      setErrorMessage(res?.message || 'Gagal mendaftar ke server.');
    }
  };

  if (!isMounted || currentUser) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-[#F26522] border-t-transparent animate-spin"></div>
          <span className="text-sm font-semibold text-gray-500">Memeriksa sesi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Top Header Link */}
      <div className="max-w-2xl w-full mx-auto mb-6 flex items-center justify-between">
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
      <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        
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
          <div className="py-6 text-center animate-in zoom-in-95 space-y-4 max-w-md mx-auto">
            <CheckCircle2 size={56} className="text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-lg font-black text-gray-900">Pendaftaran Berhasil!</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-semibold px-2">
              Akun Anda telah diajukan ke sistem. Untuk alasan keamanan, akun kreator baru harus disetujui oleh Administrator PKSart terlebih dahulu sebelum dapat digunakan untuk masuk.
            </p>
            <div className="bg-orange-50 border border-orange-100 text-[#F26522] text-xs font-bold py-2.5 px-4 rounded-xl max-w-xs mx-auto">
              Status: Menunggu Persetujuan Admin
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full py-2.5 bg-[#F26522] hover:bg-[#d85417] text-white font-bold text-xs rounded-xl shadow-md transition-all text-center"
              >
                Masuk ke Halaman Login
              </Link>
              <Link
                href="/"
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all text-center"
              >
                Jelajahi Beranda
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              
              {/* Left Column */}
              <div className="space-y-4">
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
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-normal"
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
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contoh: email@pks.art"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-normal"
                      required
                    />
                  </div>
                </div>

                {/* Nomor WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Nomor WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <PhoneCall size={18} className="absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="081234567890"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-normal"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                    Digunakan untuk verifikasi & notifikasi unduhan karya.
                  </p>
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-3.5 top-3 text-gray-400 z-10" />
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white text-gray-900 font-semibold"
                      required
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>

                 {/* Wilayah DPW Search Combobox */}
                 <div className="relative">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Wilayah DPW / Daerah <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building size={18} className="absolute left-3.5 top-3 text-gray-400 z-10" />
                    <input
                      type="text"
                      value={regionSearch}
                      onChange={(e) => {
                        setRegionSearch(e.target.value);
                        setShowRegionDropdown(true);
                      }}
                      onFocus={() => setShowRegionDropdown(true)}
                      onBlur={() => {
                        setTimeout(() => setShowRegionDropdown(false), 200);
                      }}
                      placeholder="Cari Wilayah DPW..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-normal"
                      required
                    />
                  </div>
                  {showRegionDropdown && (
                    <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg divide-y divide-gray-50">
                      {REGIONS.filter((r) => r !== 'Semua Daerah')
                        .filter((r) => r.toLowerCase().includes(regionSearch.toLowerCase()))
                        .length > 0 ? (
                          REGIONS.filter((r) => r !== 'Semua Daerah')
                            .filter((r) => r.toLowerCase().includes(regionSearch.toLowerCase()))
                            .map((r) => (
                              <button
                                key={r}
                                type="button"
                                onMouseDown={() => {
                                  setRegionSearch(r);
                                  setShowRegionDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#F26522] transition-colors"
                              >
                                {r}
                              </button>
                            ))
                        ) : (
                          <div className="px-4 py-2 text-xs text-gray-400 italic">Wilayah tidak ditemukan</div>
                        )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Alamat Lengkap */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Alamat Lengkap <span className="text-gray-400 font-normal">(Opsional)</span>
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3.5 top-3 text-gray-400" />
                    <textarea
                      name="address"
                      rows={2}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Jalan, RT/RW, Kecamatan, Kota/Kabupaten"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-normal resize-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimal 6 karakter"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-normal"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-gray-400 hover:text-[#F26522] transition-colors animate-in fade-in"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Ketik ulang kata sandi"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-normal"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-gray-400 hover:text-[#F26522] transition-colors animate-in fade-in"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#F26522] hover:bg-[#d85417] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 text-sm mt-3"
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
