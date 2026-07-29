'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Heart, MessageCircle, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function NotificationPage() {
  const { currentUser } = useData();

  const notifications = [
    {
      id: 1,
      type: 'like',
      title: 'Karya Anda disukai',
      description: 'Ahmad Sinan menyukai karya "Poster Pelantikan Pengurus Jabar".',
      time: '2 jam yang lalu',
      isRead: false,
      icon: Heart,
      iconColor: 'text-pink-500',
      bgColor: 'bg-pink-50',
    },
    {
      id: 2,
      type: 'comment',
      title: 'Komentar baru pada karya Anda',
      description: 'Lita Haryati mengomentari: "Masya Allah keren banget desainnya akhi!"',
      time: '5 jam yang lalu',
      isRead: false,
      icon: MessageCircle,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      id: 3,
      type: 'system',
      title: 'Karya berhasil dipublikasikan',
      description: 'Karya "Spanduk Kemerdekaan RI Ke-81" telah disetujui oleh admin dan kini tayang publik.',
      time: '1 hari yang lalu',
      isRead: true,
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      id: 4,
      type: 'warning',
      title: 'Peringatan Moderasi',
      description: 'Laporan terhadap karya "Desain Logo Milad PKS" sedang ditinjau oleh tim admin.',
      time: '2 hari yang lalu',
      isRead: true,
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      id: 5,
      type: 'admin',
      title: 'Pembaruan Sistem PKSart',
      description: 'Sistem telah diupdate ke versi 2.0 dengan berbagai fitur baru. Cek sekarang!',
      time: '1 minggu yang lalu',
      isRead: true,
      icon: ShieldCheck,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-2.5 bg-white text-gray-600 hover:text-gray-900 rounded-full shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <Bell className="text-[#F26522]" size={24} />
                Notifikasi
              </h1>
              <p className="text-sm text-gray-500 mt-1">Pembaruan aktivitas dan informasi sistem</p>
            </div>
          </div>
          
          <button className="text-sm font-bold text-[#F26522] hover:text-[#d85517] bg-orange-50 px-4 py-2 rounded-xl transition-colors">
            Tandai semua dibaca
          </button>
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
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => {
                const Icon = notif.icon;
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
                          {notif.time}
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

      </div>
    </div>
  );
}
