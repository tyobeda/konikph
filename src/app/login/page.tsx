'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { PksLogo } from '@/components/PksLogo';
import { useData } from '@/context/DataContext';

import { Footer } from '@/components/Footer';
import { formatPhoneNumber } from '@/lib/phone';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, currentUser, isMounted, isModuleUnderMaintenance, addResetRequest } = useData();

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

  // Reset Password Request States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetName, setResetName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState(false);

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

  const [forceShow, setForceShow] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setForceShow(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if ((!isMounted && !forceShow) || currentUser) {
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
            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email || '');
                  setShowResetModal(true);
                  setResetSuccessMessage(false);
                }}
                className="text-xs font-bold text-gray-500 hover:text-[#F26522] transition-colors"
              >
                Lupa Kata Sandi?
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

      {/* Password Reset Request Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 relative animate-in fade-in zoom-in-95">
            <h3 className="text-base font-extrabold text-gray-900 mb-2 flex items-center gap-2">
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
                <p className="text-xs text-gray-600 leading-relaxed bg-orange-50/70 p-3 rounded-xl border border-orange-100">
                  Tautan reset kata sandi (berlaku <strong>5 menit</strong>) akan <strong>dikirimkan secara otomatis ke Inbox/Spam email Anda via Resend</strong>. Jika email belum kunjung tiba, Anda juga dapat langsung menghubungi Admin via WhatsApp.
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Nama Lengkap (Opsional)</label>
                  <input
                    type="text"
                    value={resetName}
                    onChange={(e) => setResetName(e.target.value)}
                    placeholder="Nama akun Anda"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#F26522]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Alamat Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="contoh: nama@pks.art"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#F26522]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Nomor WhatsApp <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value) {
                        setResetPhone(formatPhoneNumber(e.target.value));
                      }
                    }}
                    placeholder="081299887766 atau +6281299887766"
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
                    disabled={isSubmittingReset}
                    className="px-4 py-2 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSubmittingReset ? 'Mengirim...' : 'Kirim Reset via Email'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 mt-4 text-center py-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="text-sm font-bold text-gray-900">Permintaan Berhasil Terkirim!</h4>
                <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                  Sistem telah mengirimkan tautan reset kata sandi ke email <strong>{resetEmail}</strong> (Silakan cek folder <strong>Inbox & Spam</strong>).
                </p>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-2 text-xs text-amber-900">
                  <p className="font-bold flex items-center gap-1.5 text-amber-900">
                    <span>📱 Email belum kunjung sampai?</span>
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Anda juga dapat langsung menghubungi Admin PKSart via WhatsApp untuk meminta verifikasi manual:
                  </p>
                  <a
                    href={`https://wa.me/${(useData().siteSettings?.adminWhatsapp || '6281199887766').replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Halo Admin PKSart, saya meminta permohonan reset password untuk akun:\nNama: ${resetName || 'Desainer'}\nEmail: ${resetEmail}\nNo. HP: ${resetPhone}\n\nMohon bantuannya untuk kirim link reset password. Terima kasih!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-1"
                  >
                    <span>Hubungi Admin via WhatsApp</span>
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors w-full"
                  >
                    Selesai & Tutup
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
