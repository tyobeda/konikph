'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wrench, ShieldAlert, ArrowLeft, Clock, MessageSquare, RefreshCw, AlertTriangle, Hammer, CheckCircle2 } from 'lucide-react';
import { PksLogo } from '@/components/PksLogo';
import { useData } from '@/context/DataContext';

export default function MaintenancePage() {
  const router = useRouter();
  const { siteSettings, currentUser, isMounted } = useData();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (isMounted) {
      const isAnyMaintenance =
        siteSettings?.maintenanceConfig?.globalEnabled ||
        Object.values(siteSettings?.maintenanceConfig?.modules || {}).some(Boolean);

      const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role?.includes('DPW');

      // If site is NOT under maintenance (or admin is bypassing), redirect instantly to homepage
      if (!isAnyMaintenance || (isAdmin && siteSettings?.maintenanceConfig?.allowAdminBypass)) {
        router.replace('/');
      }
    }
  }, [isMounted, siteSettings, currentUser, router]);

  const maintenance = siteSettings?.maintenanceConfig || {
    globalEnabled: true,
    modules: {},
    title: 'Mode Pemeliharaan Sistem',
    description: 'Kami sedang melakukan pemeliharaan & perawatan sistem rutin untuk meningkatkan kualitas layanan platform PKSart. Terima kasih atas kesabaran Anda.',
    estimatedTime: 'Estimasi Selesai: 1 - 2 Jam',
    allowAdminBypass: true,
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 600);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center gap-3 text-gray-700">
          <div className="w-8 h-8 rounded-full border-4 border-[#F26522] border-t-transparent animate-spin"></div>
          <span className="text-sm font-semibold text-gray-500">Memuat status sistem...</span>
        </div>
      </div>
    );
  }

  const adminWa = (siteSettings?.adminWhatsapp || '6281199887766').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${adminWa}?text=Halo%20Admin%20PKSart,%20saya%20ingin%20menanyakan%20status%20pemeliharaan%20sistem.`;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-800 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Light Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-100/60 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-100/60 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-center relative z-10">
        <PksLogo size="md" />
      </div>

      {/* Main Content Box (Clean White Card) */}
      <div className="max-w-xl w-full mx-auto bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-10 text-center shadow-xl relative z-10 my-8">
        
        {/* Animated Wrench Icon in Orange/Amber Light Circle */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-orange-100 rounded-3xl animate-pulse" />
          <div className="w-full h-full bg-orange-50 border border-orange-200 rounded-3xl flex items-center justify-center relative shadow-sm">
            <Wrench size={42} className="text-[#F26522] animate-bounce" />
            <Hammer size={24} className="text-amber-500 absolute -top-2 -right-2 transform rotate-45" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 mb-3">
          {maintenance.title || 'Mode Pemeliharaan Sistem'}
        </h1>

        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
          {maintenance.description || 'Kami sedang melakukan peningkatan performa dan perawatan sistem rutin demi kenyamanan bersama. Mohon maaf atas ketidaknyamanannya.'}
        </p>

        {/* Estimated Time Badge */}
        {maintenance.estimatedTime && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs font-bold text-amber-800 shadow-xs">
            <Clock size={15} className="text-amber-600" />
            <span>{maintenance.estimatedTime}</span>
          </div>
        )}

        {/* Admin Bypass Notification for logged in Super Admin */}
        {currentUser?.role === 'Super Admin' && (
          <div className="mt-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Anda terdeteksi sebagai Super Admin (Dapat mengakses seluruh fitur).</span>
          </div>
        )}

        {currentUser?.role === 'Super Admin' && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href="/admin/settings"
              className="text-xs font-bold text-[#F26522] hover:underline"
            >
              &rarr; Masuk ke Pengaturan Maintenance Admin
            </Link>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="max-w-xl w-full mx-auto text-center text-gray-500 text-xs font-medium relative z-10">
        &copy; {new Date().getFullYear()} PKSart Designer Community. Official Creative Platform.
      </div>
    </div>
  );
}
