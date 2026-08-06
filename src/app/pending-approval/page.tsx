'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, ShieldAlert, ArrowLeft, LogOut, MessageSquare, RefreshCw } from 'lucide-react';
import { PksLogo } from '@/components/PksLogo';
import { useData } from '@/context/DataContext';

export default function PendingApprovalPage() {
  const router = useRouter();
  const { currentUser, logoutUser, isMounted, siteSettings } = useData();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const adminWa = (siteSettings?.adminWhatsapp || '6281199887766').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${adminWa}?text=Halo%20Admin%20PKSart,%20saya%20sudah%20mendaftar%20akun%20baru%20(${encodeURIComponent(currentUser?.name || '')}%20-%20${encodeURIComponent(currentUser?.email || '')}).%20Mohon%20bantuannya%20untuk%20persetujuan%20(approval).`;

  const handleCheckStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.authenticated && data.user) {
        if (data.user.status === 'Active' || data.user.status === 'Aktif') {
          router.replace(data.user.role === 'Super Admin' ? '/admin' : '/');
          return;
        }
      }
    } catch (e) {}
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-[#F26522] border-t-transparent animate-spin"></div>
          <span className="text-sm font-semibold text-gray-500">Memeriksa status akun...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-md w-full mx-auto mb-6 flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#F26522] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Ke Beranda</span>
        </Link>
        <PksLogo size="sm" />
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 relative z-10 text-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* Animated Clock Icon Header */}
        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-amber-500 to-orange-500 rounded-3xl p-0.5 shadow-lg shadow-orange-500/20 mb-6 flex items-center justify-center relative">
          <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
            <Clock size={38} className="text-[#F26522] animate-bounce" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#F26522]"></span>
          </span>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black rounded-full uppercase tracking-wider mb-3">
          <ShieldAlert size={14} className="text-amber-600" />
          <span>Menunggu Persetujuan Admin</span>
        </div>

        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
          Akun Sedang Ditinjau
        </h1>

        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
          Terima kasih telah mendaftar di <strong className="text-gray-900">PKSart</strong>. Demi menjaga kualitas & keamanan karya resmi, akun Anda saat ini sedang dalam proses peninjauan oleh tim Admin PKSart.
        </p>

        {/* Account Summary Box */}
        {currentUser && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left mb-6 space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
              <span className="text-gray-500 font-semibold">Nama Pendaftar:</span>
              <span className="font-bold text-gray-900 truncate max-w-[200px]">{currentUser.name}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
              <span className="text-gray-500 font-semibold">Email:</span>
              <span className="font-bold text-gray-900 truncate max-w-[200px]">{currentUser.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-semibold">Wilayah / DPW:</span>
              <span className="font-bold text-[#F26522]">{currentUser.region || 'PKS Official'}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCheckStatus}
            disabled={isRefreshing}
            className="w-full py-3 bg-[#F26522] hover:bg-[#d85417] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Memeriksa...' : 'Cek Status Persetujuan'}</span>
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare size={16} />
            <span>Hubungi Admin via WhatsApp</span>
          </a>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 text-gray-500 hover:text-gray-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut size={14} />
            <span>Keluar Akun / Login Lain</span>
          </button>
        </div>

      </div>

      {/* Footer copyright note */}
      <div className="mt-8 text-center text-[11px] text-gray-400 font-semibold relative z-10">
        &copy; {new Date().getFullYear()} PKSart Designer Community. Official PKS Creative Platform.
      </div>
    </div>
  );
}
