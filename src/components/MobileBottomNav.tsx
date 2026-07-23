'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusCircle, FolderHeart, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Beranda', href: '/', icon: Home },
    { label: 'Eksplorasi', href: '/#eksplorasi', icon: Compass },
    { label: 'Unggah', href: '/upload', icon: PlusCircle, isHighlight: true },
    { label: 'Aset', href: '/#aset-desain', icon: FolderHeart },
    { label: 'Profil', href: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg px-2 py-1.5 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href === '/' && pathname === '/');

        if (item.isHighlight) {
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center relative -top-3"
            >
              <div className="w-12 h-12 rounded-full bg-[#F26522] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                <PlusCircle size={26} />
              </div>
              <span className="text-[10px] font-bold text-[#F26522] mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-colors ${
              isActive ? 'text-[#F26522] font-bold' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
            <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
