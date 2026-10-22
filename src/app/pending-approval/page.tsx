'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, ShieldAlert, ArrowLeft, LogOut, MessageSquare, RefreshCw } from 'lucide-react';
import { KoniLogo } from '@/components/KoniLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useData } from '@/context/DataContext';

export default function PendingApprovalPage() {
  const router = useRouter();
  const { currentUser, logoutUser, isMounted, siteSettings } = useData();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const adminWa = (siteSettings?.adminWhatsapp || '6281199887766').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${adminWa}?text=Halo%20Admin%20KONI%20Kepahiang,%20saya%20sudah%20mendaftar%20akun%20baru%20(${encodeURIComponent(currentUser?.name || '')}%20-%20${encodeURIComponent(currentUser?.email || '')}).%20Mohon%20bantuannya%20untuk%20persetujuan%20(approval).`;

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
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-red-600 border-t-transparent animate-spin"></div>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Memeriksa status akun...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden transition-colors">
      
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-100 dark:bg-red-950/20 rounded-full blur-3xl opacity-60 dark:opacity-20 pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-100 dark:bg-amber-950/20 rounded-full blur-3xl opacity-60 dark:opacity-20 pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-md w-full mx-auto mb-6 flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle
            variant="dropdown"
            buttonClassName="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
          />
          <KoniLogo size="sm" />
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 relative z-10 text-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* Animated Clock Icon Header */}
        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-amber-500 to-red-600 rounded-3xl p-0.5 shadow-lg shadow-red-500/20 mb-6 flex items-center justify-center relative">
          <div className="w-full h-full bg-white dark:bg-gray-800 rounded-[22px] flex items-center justify-center">
            <Clock size={38} className="text-red-600 animate-bounce" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
          </span>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 text-xs font-black rounded-full uppercase tracking-wider mb-3">
          <ShieldAlert size={14} className="text-amber-600 dark:text-amber-400" />
          <span>Menunggu Persetujuan Admin</span>
        </div>

        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
          Akun Sedang Ditinjau
        </h1>

        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
          Terima kasih telah mendaftar di <strong className="text-gray-900 dark:text-gray-200">KONI Kabupaten Kepahiang</strong>. Akun Anda saat ini sedang dalam proses peninjauan oleh tim Admin Sekretariat KONI Kepahiang.
        </p>

        {/* Account Summary Box */}
        {currentUser && (
          <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-left mb-6 space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-700/60">
              <span className="text-gray-500 dark:text-gray-400 font-semibold">Nama Pendaftar:</span>
              <span className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{currentUser.name}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-700/60">
              <span className="text-gray-500 dark:text-gray-400 font-semibold">Email:</span>
              <span className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{currentUser.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 font-semibold">Cabor / Wilayah:</span>
              <span className="font-bold text-red-600">{currentUser.region || 'KONI Kepahiang'}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCheckStatus}
            disabled={isRefreshing}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Memeriksa...' : 'Cek Status Persetujuan'}</span>
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare size={16} />
            <span>Hubungi Admin via WhatsApp</span>
          </a>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Keluar Akun / Login Lain</span>
          </button>
        </div>

      </div>

      {/* Footer copyright note */}
      <div className="mt-8 text-center text-[11px] text-gray-400 dark:text-gray-500 font-semibold relative z-10">
        &copy; {new Date().getFullYear()} KONI Kabupaten Kepahiang.
      </div>
    </div>
  );
}
