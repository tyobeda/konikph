'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { PksLogo } from '@/components/PksLogo';
import { useData } from '@/context/DataContext';

import { Footer } from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, currentUser, isMounted, isModuleUnderMaintenance } = useData();

  React.useEffect(() => {
    if (isMounted) {
      if (isModuleUnderMaintenance('auth')) {
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
  }, [currentUser, router, isMounted, isModuleUnderMaintenance]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setAlertInfo(null);
    const result = await loginUser(email, password);
    setIsSubmitting(false);

    if (result.success) {
      setAlertInfo({ type: 'success', message: result.message || 'Login berhasil!' });
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
      setAlertInfo({ type: 'error', message: result.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.' });
    }
  };

  if (!isMounted || currentUser) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-[#F26522] border-t-transparent animate-spin"></div>
          <span className="text-sm font-semibold text-gray-500">Memeriksa sesi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
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

      <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-md border border-gray-100 p-6 sm:p-8">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Masuk ke PKSart
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Masukkan email dan kata sandi akun Anda.
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setAlertInfo(null); }}
                placeholder="Masukkan email Anda"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAlertInfo(null); }}
                placeholder="Masukkan kata sandi Anda"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-bold"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-[#F26522] transition-colors"
                aria-label="Tampilkan atau sembunyikan kata sandi"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#F26522] hover:bg-[#d85417] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 text-sm mt-2"
          >
            {isSubmitting ? 'Memproses Masuk...' : 'Masuk Sekarang'}
          </button>
        </form>

        {/* 🔴 Inline Permanent Alert Box Below Login Button */}
        {alertInfo && (
          <div
            className={`mt-4 p-3.5 rounded-2xl border text-xs font-bold flex items-start gap-2.5 transition-all animate-in fade-in slide-in-from-top-1 ${
              alertInfo.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {alertInfo.type === 'error' ? (
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="leading-snug">
              <span>{alertInfo.message}</span>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
          Belum memiliki akun?{' '}
          <Link href="/register" className="font-bold text-[#F26522] hover:underline">
            Daftar Akun Baru
          </Link>
        </div>

      </div>

      <Footer />
    </div>
  );
}
