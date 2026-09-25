'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Bell, Heart, MessageCircle, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { getNotifications, markAllAsRead } from '@/actions/notification';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';

function NotificationContent() {
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from');
  const backHref = fromParam === 'admin' ? '/admin' : '/';

  const { currentUser, refreshUnreadNotifications } = useData();
  const [dbNotifications, setDbNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      getNotifications(currentUser.id).then(res => {
        if (res.success && res.data) {
          setDbNotifications(res.data);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);

  const handleMarkAllAsRead = async () => {
    if (currentUser?.id) {
      const res = await markAllAsRead(currentUser.id);
      if (res.success) {
        setDbNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        refreshUnreadNotifications();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] flex flex-col font-sans pt-[80px] pb-24 md:pb-8 transition-colors duration-200">
      {fromParam !== 'admin' && <Header />}

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 pt-2">
          <div className="flex items-center gap-3">
            <Link 
              href={backHref} 
              className="p-2.5 bg-white text-gray-600 hover:text-gray-900 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-200 shrink-0"
              title="Kembali"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <Bell className="text-[#F26522]" size={22} />
                <span>Notifikasi</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">Pembaruan aktivitas dan informasi sistem</p>
            </div>
          </div>
          
          {currentUser && (
            <button 
              onClick={handleMarkAllAsRead} 
              className="text-xs sm:text-sm font-bold text-[#F26522] hover:text-[#d85517] bg-orange-50/80 border border-orange-100 hover:bg-orange-100/80 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl transition-all whitespace-nowrap shadow-2xs shrink-0"
            >
              Tandai semua dibaca
            </button>
          )}
        </div>

        {/* Notifications List */}
        {!currentUser ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Silakan Login Terlebih Dahulu</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm leading-relaxed">
              Anda harus masuk ke akun Anda untuk dapat melihat riwayat notifikasi, suka, dan komentar pada karya Anda.
            </p>
            <Link 
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#F26522] hover:bg-[#d85517] text-white font-bold rounded-xl shadow-md transition-all"
            >
              Masuk / Daftar
            </Link>
          </div>
        ) : isLoading ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#F26522] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-gray-500">Memuat notifikasi...</p>
          </div>
        ) : dbNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
              <Bell size={32} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Belum ada notifikasi</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
              Pemberitahuan aktivitas, likes, dan komentar pada karya Anda akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {dbNotifications.map((notif) => {
                let Icon = Bell;
                if (notif.type === 'like') Icon = Heart;
                else if (notif.type === 'comment') Icon = MessageCircle;
                else if (notif.type === 'system') Icon = CheckCircle2;
                else if (notif.type === 'warning') Icon = AlertTriangle;
                else if (notif.type === 'admin') Icon = ShieldCheck;
                
                return (
                  <div 
                    key={notif.id} 
                    className={`p-5 flex gap-4 transition-colors hover:bg-gray-50 ${!notif.isRead ? 'bg-orange-50/30' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notif.bgColor}`}>
                      <Icon size={20} className={notif.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`text-sm font-bold ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </h3>
                        <span className="text-[11px] font-semibold text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
                          {notif.time || new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${!notif.isRead ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                        {notif.description}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="flex items-center shrink-0 ml-2">
                        <div className="w-2.5 h-2.5 bg-[#F26522] rounded-full shadow-sm" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400">Tidak ada notifikasi lainnya</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default function NotificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#F26522] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <NotificationContent />
    </Suspense>
  );
}
