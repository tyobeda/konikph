'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, Clock, ShieldCheck } from 'lucide-react';
import { PksLogo } from '@/components/PksLogo';
import { Footer } from '@/components/Footer';
import { verifyResetTokenAction, executePasswordResetAction } from '@/actions/resetRequest';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [tokenStatus, setTokenStatus] = useState<'VALID' | 'EXPIRED' | 'USED' | 'INVALID'>('INVALID');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setTokenStatus('INVALID');
        setErrorMessage('Tautan reset kata sandi tidak ditemukan.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const res = await verifyResetTokenAction(token);
      setIsLoading(false);

      if (res.status === 'VALID' && res.data) {
        setTokenStatus('VALID');
        setUserEmail(res.data.email || '');
        setUserName(res.data.name || '');
      } else if (res.status === 'EXPIRED') {
        setTokenStatus('EXPIRED');
        setErrorMessage('Tautan reset kata sandi ini telah kadaluarsa (berlaku lebih dari 5 menit).');
      } else if (res.status === 'USED') {
        setTokenStatus('USED');
        setErrorMessage('Tautan reset kata sandi ini sudah pernah digunakan sebelumnya.');
      } else {
        setTokenStatus('INVALID');
        setErrorMessage(res.error || 'Tautan reset kata sandi tidak valid.');
      }
    }

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 6) {
      setErrorMessage('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok dengan kata sandi baru.');
      return;
    }

    setIsSubmitting(true);
    const res = await executePasswordResetAction(token, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      setErrorMessage(res.error || 'Gagal mereset kata sandi.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-[#F26522] border-t-transparent animate-spin" />
        <span className="text-xs font-bold text-gray-500">Memeriksa keabsahan tautan reset (Masa berlaku 5 menit)...</span>
      </div>
    );
  }

  // Handle Expired / Invalid / Used Token Screens
  if (tokenStatus !== 'VALID') {
    return (
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
          <Clock size={32} className="animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-gray-900">
            {tokenStatus === 'EXPIRED' ? 'Tautan Telah Kadaluarsa' : 'Tautan Tidak Valid'}
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed px-2">
            {errorMessage || 'Tautan reset kata sandi ini tidak dapat digunakan lagi.'}
          </p>
        </div>

        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-800 text-left font-medium space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-900">
            <ShieldCheck size={14} />
            <span>Mengapa tautan ini kadaluarsa?</span>
          </p>
          <p className="leading-snug text-gray-600">
            Demi keamanan akun desainer PKSart Anda, tautan reset kata sandi secara ketat dibatasi dan **hanya berlaku selama 5 menit** setelah dibuat oleh Admin.
          </p>
        </div>

        <div className="pt-2 space-y-2">
          <Link
            href="/login"
            className="w-full py-3 bg-[#F26522] hover:bg-[#d85417] text-white font-bold text-xs rounded-xl shadow-sm transition-all block"
          >
            Minta Reset Kata Sandi Baru di Halaman Login
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all block"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // Handle Reset Form Success Screen
  if (isSuccess) {
    return (
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 size={36} className="animate-bounce" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-gray-900">
            Kata Sandi Berhasil Diubah!
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Kata sandi baru Anda telah tersimpan dengan aman di database. Mengalihkan Anda ke halaman login...
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="w-full py-3 bg-[#F26522] hover:bg-[#d85417] text-white font-bold text-xs rounded-xl shadow-md transition-all block"
          >
            Masuk Sekarang
          </Link>
        </div>
      </div>
    );
  }

  // Main Valid Form Screen
  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-md border border-gray-100 p-6 sm:p-8 animate-in fade-in">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-orange-50 rounded-2xl border border-orange-200 flex items-center justify-center mx-auto text-[#F26522] mb-3">
          <Lock size={24} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          Buat Kata Sandi Baru
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Pengaturan ulang kata sandi untuk akun <strong className="text-gray-800">{userName || userEmail}</strong>.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-start gap-2 animate-in fade-in">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Form 1: Password Baru */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
            Kata Sandi Baru <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setErrorMessage(''); }}
              placeholder="Minimal 6 karakter"
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-bold"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-[#F26522] transition-colors"
              aria-label="Tampilkan atau sembunyikan kata sandi"
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Form 2: Konfirmasi Password Baru */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
            Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrorMessage(''); }}
              placeholder="Ketik ulang kata sandi baru"
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#F26522] focus:bg-white font-bold"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-[#F26522] transition-colors"
              aria-label="Tampilkan atau sembunyikan kata sandi"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-[#F26522] hover:bg-[#d85417] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 text-sm mt-3"
        >
          {isSubmitting ? 'Menyimpan Kata Sandi...' : 'Simpan Kata Sandi Baru'}
        </button>

      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      
      {/* Top Header Link */}
      <div className="max-w-md w-full mx-auto mb-6 flex items-center justify-between">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#F26522] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Halaman Login</span>
        </Link>

        <PksLogo size="sm" />
      </div>

      <Suspense fallback={
        <div className="py-12 text-center text-xs font-bold text-gray-500">
          Memuat formulir...
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>

      <Footer />
    </div>
  );
}
