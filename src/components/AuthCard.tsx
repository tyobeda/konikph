'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User as UserIcon,
  Mail,
  PhoneCall,
  MapPin,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Building,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
  AlertCircle,
  LogIn,
  UserPlus
} from 'lucide-react';
import { KoniLogo } from '@/components/KoniLogo';
import { useData } from '@/context/DataContext';
import { Footer } from '@/components/Footer';
import { formatPhoneNumber } from '@/lib/phone';
import { ThemeToggle } from '@/components/ThemeToggle';

interface AuthCardProps {
  defaultTab?: 'login' | 'register';
}

function AuthCardContent({ defaultTab = 'login' }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  // Determine initial active tab: query param overrides defaultTab
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(() => {
    if (tabParam === 'register') return 'register';
    if (tabParam === 'login') return 'login';
    return defaultTab;
  });

  // Sync tab if query param changes
  useEffect(() => {
    if (tabParam === 'register') {
      setActiveTab('register');
    } else if (tabParam === 'login') {
      setActiveTab('login');
    }
  }, [tabParam]);

  const {
    loginUser,
    registerUser,
    users,
    dpwList,
    currentUser,
    isMounted,
    isModuleUnderMaintenance,
    addResetRequest
  } = useData();

  // Redirect if user is already logged in or module under maintenance
  useEffect(() => {
    if (isMounted) {
      if (isModuleUnderMaintenance('auth') || (activeTab === 'register' && isModuleUnderMaintenance('register'))) {
        router.replace('/maintenance');
        return;
      }
      if (currentUser) {
        if (currentUser.status === 'Pending' || currentUser.status === 'Pending Approval') {
          router.replace('/pending-approval');
        } else if (currentUser.role === 'Super Admin' || currentUser.role?.includes('DPW')) {
          router.replace('/admin');
        } else {
          router.replace('/');
        }
      }
    }
  }, [currentUser, router, isMounted, isModuleUnderMaintenance, activeTab]);

  // ──────────────────────────────────────────
  // 🔑 LOGIN STATES & LOGIC
  // ──────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [loginAlert, setLoginAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Reset Password Request States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetName, setResetName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setIsLoginSubmitting(true);
    setLoginAlert(null);
    const result = await loginUser(loginEmail, loginPassword);
    setIsLoginSubmitting(false);

    if (result.success) {
      setLoginAlert({ type: 'success', message: result.message || 'Login berhasil!' });
      setTimeout(() => {
        if ((result as any).isPendingApproval || result.user?.status === 'Pending' || result.user?.status === 'Pending Approval') {
          router.push('/pending-approval');
        } else if (result.user?.role === 'Super Admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }, 500);
    } else {
      setLoginAlert({
        type: 'error',
        message: result.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.'
      });
    }
  };

  // ──────────────────────────────────────────
  // 📝 REGISTER STATES & LOGIC
  // ──────────────────────────────────────────
  const availableRegions = useMemo(() => {
    if (!dpwList || dpwList.length === 0) return [];
    return dpwList
      .filter((d) => d.isActive !== false && d.name?.trim())
      .map((d) => d.name.trim())
      .sort((a, b) => a.localeCompare('id'));
  }, [dpwList]);

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    region: '',
    gender: 'Laki-laki',
    password: '',
    confirmPassword: '',
  });

  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  const filteredRegions = useMemo(() => {
    if (!regionSearch.trim() || regionSearch === registerData.region) {
      return availableRegions;
    }
    return availableRegions.filter((r) =>
      r.toLowerCase().includes(regionSearch.toLowerCase())
    );
  }, [availableRegions, regionSearch, registerData.region]);

  const sanitize = (val: string): string => {
    if (!val) return '';
    let clean = val.replace(/<[^>]*>/g, '');
    clean = clean.replace(/['"\\;]/g, '');
    return clean.trim();
  };

  const handleRegisterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    const sanitizedName = sanitize(registerData.name);
    const sanitizedEmail = sanitize(registerData.email);
    const sanitizedPhone = formatPhoneNumber(sanitize(registerData.phone));
    const sanitizedAddress = sanitize(registerData.address);
    const sanitizedRegion = sanitize(regionSearch);
    const sanitizedGender = sanitize(registerData.gender);

    if (!sanitizedName) {
      setRegisterError('Nama lengkap wajib diisi.');
      return;
    }
    if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
      setRegisterError('Alamat email tidak valid.');
      return;
    }
    if (!sanitizedPhone) {
      setRegisterError('Nomor WhatsApp wajib diisi.');
      return;
    }
    if (!sanitizedRegion) {
      setRegisterError('Wilayah wajib dipilih.');
      return;
    }
    if (availableRegions.length > 0 && !availableRegions.includes(sanitizedRegion)) {
      setRegisterError('Silakan pilih salah satu wilayah resmi dari daftar yang tersedia.');
      return;
    }

    const emailExists = users.some((u) => u.email.toLowerCase() === sanitizedEmail.toLowerCase());
    if (emailExists) {
      setRegisterError('Alamat email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.');
      return;
    }

    const phoneExists = users.some((u) => u.phone === sanitizedPhone);
    if (phoneExists) {
      setRegisterError('Nomor WhatsApp sudah terdaftar. Silakan gunakan nomor lain.');
      return;
    }

    if (registerData.password.length < 6) {
      setRegisterError('Kata sandi minimal 6 karakter.');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsRegisterSubmitting(true);

    const res = await registerUser({
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      password: registerData.password,
      address: sanitizedAddress,
      region: sanitizedRegion,
      gender: sanitizedGender,
      avatar: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23E5E7EB%22/><path d=%22M50 50C41.7157 50 35 43.2843 35 35C35 26.7157 41.7157 20 50 20C58.2843 20 65 26.7157 65 35C65 43.2843 58.2843 50 50 50ZM50 55C66.5685 55 80 68.4315 80 85H20C20 68.4315 33.4315 55 50 55Z%22 fill=%22%239CA3AF%22/></svg>',
      role: 'Pengurus Cabor',
    } as any);

    setIsRegisterSubmitting(false);

    if (res?.success) {
      setIsRegisterSuccess(true);
      await loginUser(sanitizedEmail, registerData.password);
      setTimeout(() => {
        router.push('/pending-approval');
      }, 1200);
    } else {
      setRegisterError(res?.message || 'Gagal mendaftar ke server.');
    }
  };

  // If user is already loaded/logged in
  if (currentUser) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex items-center justify-center font-sans transition-colors duration-200">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-[#F26522] border-t-transparent animate-spin"></div>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Memeriksa sesi...</span>
        </div>
      </div>
    );
  }

  const containerMaxWidth = activeTab === 'login' ? 'max-w-md' : 'max-w-2xl';

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      
      {/* Top Header Link & Logo */}
      <div className={`${containerMaxWidth} w-full mx-auto mb-6 flex items-center justify-between transition-all duration-300`}>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-[#F26522] dark:hover:text-[#F26522] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </Link>

        <KoniLogo size="sm" />
      </div>

      {/* Main Auth Card with Tabs */}
      <div className={`${containerMaxWidth} w-full mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-md border border-gray-100 dark:border-gray-800 p-6 sm:p-8 transition-all duration-300`}>
        
        {/* 🔀 TAB SWITCHER */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl mb-6 border border-gray-200/50 dark:border-gray-700/50">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginAlert(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white dark:bg-gray-900 text-[#F26522] dark:text-[#F26522] shadow-sm font-black'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <LogIn size={15} />
            <span>Masuk</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setRegisterError('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white dark:bg-gray-900 text-[#F26522] dark:text-[#F26522] shadow-sm font-black'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <UserPlus size={15} />
            <span>Daftar Akun</span>
          </button>
        </div>

        {/* ────────────────────────────────────────── */}
        {/* 🟢 TAB 1: FORM MASUK / LOGIN              */}
        {/* ────────────────────────────────────────── */}
        {activeTab === 'login' && (
          <div className="animate-in fade-in duration-200">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Masuk ke Portal KONI Kepahiang
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Masukkan email dan kata sandi akun Anda.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => { setLoginEmail(e.target.value); setLoginAlert(null); }}
                    placeholder="Masukkan email Anda"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white dark:focus:bg-gray-800 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setLoginAlert(null); }}
                    placeholder="Masukkan kata sandi Anda"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white dark:focus:bg-gray-800 font-bold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-[#F26522] transition-colors cursor-pointer"
                    aria-label="Tampilkan atau sembunyikan kata sandi"
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(loginEmail || '');
                      setShowResetModal(true);
                      setResetSuccessMessage(false);
                    }}
                    className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#F26522] dark:hover:text-[#F26522] transition-colors cursor-pointer"
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoginSubmitting}
                className="w-full py-3.5 bg-[#F26522] hover:bg-[#d85417] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 text-sm mt-2 cursor-pointer"
              >
                {isLoginSubmitting ? 'Memproses Masuk...' : 'Masuk Sekarang'}
              </button>
            </form>

            {loginAlert && (
              <div
                className={`mt-4 p-3.5 rounded-2xl border text-xs font-bold flex items-start gap-2.5 transition-all animate-in fade-in slide-in-from-top-1 ${
                  loginAlert.type === 'error'
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {loginAlert.type === 'error' ? (
                  <AlertCircle size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="leading-snug">
                  <span>{loginAlert.message}</span>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400">
              Belum memiliki akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setRegisterError('');
                }}
                className="font-bold text-[#F26522] hover:underline cursor-pointer"
              >
                Daftar Akun Baru
              </button>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────── */}
        {/* 🟠 TAB 2: FORM DAFTAR / REGISTER          */}
        {/* ────────────────────────────────────────── */}
        {activeTab === 'register' && (
          <div className="animate-in fade-in duration-200">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Daftar Akun KONI Kepahiang
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Bergabung bersama pengurus cabor, pelatih, kontributor media, dan atlet binaan KONI Kepahiang.
              </p>
            </div>

            {registerError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 animate-in fade-in">
                ⚠️ {registerError}
              </div>
            )}

            {isRegisterSuccess ? (
              <div className="py-6 text-center animate-in zoom-in-95 space-y-4 max-w-md mx-auto">
                <CheckCircle2 size={56} className="text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Pendaftaran Berhasil!</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-semibold px-2">
                  Akun Anda telah diajukan ke sistem. Untuk alasan keamanan dan validitas data, akun baru akan diverifikasi oleh Administrator KONI Kepahiang terlebih dahulu sebelum dapat digunakan.
                </p>
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold py-2.5 px-4 rounded-xl max-w-xs mx-auto">
                  Status: Menunggu Persetujuan Admin
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all text-center cursor-pointer"
                  >
                    Masuk ke Halaman Login
                  </button>
                  <Link
                    href="/"
                    className="w-full py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:slate-700 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition-all text-center"
                  >
                    Jelajahi Beranda
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Nama Lengkap */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon size={18} className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500" />
                        <input
                          type="text"
                          name="name"
                          value={registerData.name}
                          onChange={handleRegisterChange}
                          placeholder="Nama Lengkap Anda"
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] text-gray-900 dark:text-white font-semibold placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-normal transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                        Alamat Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500" />
                        <input
                          type="email"
                          name="email"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          placeholder="contoh: pengurus@konikph.site"
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-red-600 text-gray-900 dark:text-white font-semibold placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-normal transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Nomor WhatsApp */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                        Nomor WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <PhoneCall size={18} className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500" />
                        <input
                          type="tel"
                          name="phone"
                          value={registerData.phone}
                          onChange={handleRegisterChange}
                          onBlur={(e) => {
                            if (e.target.value) {
                              setRegisterData(prev => ({ ...prev, phone: formatPhoneNumber(e.target.value) }));
                            }
                          }}
                          placeholder="contoh: 081234567890"
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] text-gray-900 dark:text-white font-semibold placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-normal transition-colors"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 leading-tight">
                        Digunakan untuk verifikasi & notifikasi unduhan karya.
                      </p>
                    </div>

                    {/* Jenis Kelamin */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                        Jenis Kelamin <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon size={18} className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500 z-10" />
                        <select
                          name="gender"
                          value={registerData.gender}
                          onChange={handleRegisterChange}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] text-gray-900 dark:text-white font-semibold transition-colors cursor-pointer"
                          required
                        >
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Cabang Olahraga / Afiliasi Search Combobox */}
                    <div className="relative">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                        Cabang Olahraga / Afiliasi <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building size={18} className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500 z-10 pointer-events-none" />
                        <input
                          type="text"
                          value={regionSearch}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRegionSearch(val);
                            setRegisterData((prev) => ({ ...prev, region: val }));
                            setShowRegionDropdown(true);
                          }}
                          onClick={() => setShowRegionDropdown(true)}
                          onFocus={() => setShowRegionDropdown(true)}
                          onBlur={() => {
                            setTimeout(() => setShowRegionDropdown(false), 250);
                          }}
                          placeholder="Pilih Cabor atau KONI (Umum)..."
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-red-600 text-gray-900 dark:text-white font-semibold placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-normal cursor-pointer transition-colors"
                          required
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setShowRegionDropdown((prev) => !prev);
                          }}
                          className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                        >
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${
                              showRegionDropdown ? 'rotate-180 text-[#F26522]' : ''
                            }`}
                          />
                        </button>
                      </div>
                      {showRegionDropdown && (
                        <div className="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl divide-y divide-gray-50 dark:divide-gray-800 animate-in fade-in zoom-in-95 duration-150">
                          {filteredRegions.length > 0 ? (
                            filteredRegions.map((r) => {
                              const isSelected = registerData.region === r;
                              return (
                                <button
                                  key={r}
                                  type="button"
                                  onMouseDown={() => {
                                    setRegionSearch(r);
                                    setRegisterData((prev) => ({ ...prev, region: r }));
                                    setShowRegionDropdown(false);
                                  }}
                                  className={`w-full flex items-center justify-between text-left px-4 py-2.5 text-xs transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-orange-50 dark:bg-orange-950/40 text-[#F26522] dark:text-[#ff7a38] font-bold'
                                      : 'font-semibold text-gray-700 dark:text-gray-300 hover:bg-orange-50/60 dark:hover:bg-slate-800 hover:text-[#F26522]'
                                  }`}
                                >
                                  <span>{r}</span>
                                  {isSelected && <Check size={14} className="text-[#F26522] shrink-0 ml-2" />}
                                </button>
                              );
                            })
                          ) : (
                            <div className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 italic text-center">
                              {!dpwList || dpwList.length === 0 ? 'Memuat daftar cabor...' : 'Cabang olahraga tidak ditemukan'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Alamat Lengkap */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                        Alamat Lengkap <span className="text-gray-400 dark:text-gray-500 font-normal">(Opsional)</span>
                      </label>
                      <div className="relative">
                        <MapPin size={18} className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500" />
                        <textarea
                          name="address"
                          rows={2}
                          value={registerData.address}
                          onChange={handleRegisterChange}
                          placeholder="Alamat domisili atau kantor DPC/DPD"
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] text-gray-900 dark:text-white font-semibold placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-normal transition-colors resize-none"
                        />
                      </div>
                    </div>

                    {/* Kata Sandi & Konfirmasi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                          Kata Sandi <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500" />
                          <input
                            type={showRegisterPassword ? 'text' : 'password'}
                            name="password"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            placeholder="Min. 6 digit"
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#F26522] text-gray-900 dark:text-white font-semibold placeholder:text-gray-400 transition-colors"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            className="absolute right-2.5 top-3 text-gray-400 hover:text-[#F26522] transition-colors cursor-pointer"
                          >
                            {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                          Ulangi Sandi <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500" />
                          <input
                            type={showRegisterPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={registerData.confirmPassword}
                            onChange={handleRegisterChange}
                            placeholder="Ketik ulang sandi"
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#F26522] text-gray-900 dark:text-white font-semibold placeholder:text-gray-400 transition-colors"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isRegisterSubmitting}
                    className="w-full py-3.5 bg-[#F26522] hover:bg-[#d85417] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 text-sm cursor-pointer"
                  >
                    {isRegisterSubmitting ? 'Memproses Pendaftaran...' : 'Daftar Sekarang'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400">
              Sudah memiliki akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setLoginAlert(null);
                }}
                className="font-bold text-[#F26522] hover:underline cursor-pointer"
              >
                Masuk ke Akun
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 3-State Theme Switch */}
      <div className="flex justify-center mt-6">
        <ThemeToggle variant="inline" order={['dark', 'system', 'light']} />
      </div>

      <Footer />

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 dark:border-gray-800 relative animate-in fade-in zoom-in-95">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Lock size={18} className="text-[#F26522]" />
              <span>Minta Reset Kata Sandi</span>
            </h3>
            
            {!resetSuccessMessage ? (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!resetEmail.trim() || !resetPhone.trim()) return;
                  setIsSubmittingReset(true);
                  const res = await addResetRequest({ name: resetName.trim() || 'Desainer', email: resetEmail.trim(), phone: resetPhone.trim() });
                  setIsSubmittingReset(false);
                  if (res && res.success === false) {
                    alert(res.error || 'Gagal mengirimkan permohonan reset.');
                    return;
                  }
                  setResetSuccessMessage(true);
                }}
                className="space-y-4 mt-4"
              >
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-orange-50/70 dark:bg-orange-950/20 p-3 rounded-xl border border-orange-100 dark:border-orange-900/40">
                  Tautan reset kata sandi (berlaku <strong>5 menit</strong>) akan dikirimkan secara otomatis ke Inbox/Spam email Anda.
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Nama Lengkap (Opsional)</label>
                  <input 
                    type="text" 
                    value={resetName} 
                    onChange={e => setResetName(e.target.value)} 
                    placeholder="Nama akun Anda" 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white font-semibold focus:outline-none focus:border-[#F26522]" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Email Akun Terdaftar *</label>
                  <input 
                    type="email" 
                    required 
                    value={resetEmail} 
                    onChange={e => setResetEmail(e.target.value)} 
                    placeholder="pengurus@konikph.site" 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white font-semibold focus:outline-none focus:border-red-600" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Nomor WhatsApp Terdaftar *</label>
                  <input 
                    type="tel" 
                    required 
                    value={resetPhone} 
                    onChange={e => setResetPhone(e.target.value)} 
                    onBlur={(e) => {
                      if (e.target.value) {
                        setResetPhone(formatPhoneNumber(e.target.value));
                      }
                    }}
                    placeholder="081234567890" 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white font-semibold focus:outline-none focus:border-[#F26522]" 
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowResetModal(false)} 
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmittingReset} 
                    className="px-4 py-2 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingReset ? 'Mengirim...' : 'Kirim Permohonan'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 mt-4 text-center">
                <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Tautan Reset Berhasil Dikirim!</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  Permohonan reset kata sandi telah diproses. Silakan periksa <strong>Inbox & Folder Spam email Anda</strong>.
                </p>
                <button 
                  type="button" 
                  onClick={() => setShowResetModal(false)} 
                  className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export function AuthCard(props: AuthCardProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex items-center justify-center font-sans">
        <div className="w-8 h-8 rounded-full border-4 border-[#F26522] border-t-transparent animate-spin"></div>
      </div>
    }>
      <AuthCardContent {...props} />
    </Suspense>
  );
}
