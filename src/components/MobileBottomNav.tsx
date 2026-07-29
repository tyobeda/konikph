'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusCircle, Layers, Users, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Hide on full-screen page builder editor
  if (pathname?.startsWith('/admin/pages/')) return null;

  const navItems = [
    { label: 'Beranda', href: '/', icon: Home },
    { label: 'Eksplorasi', href: '/explore', icon: Compass },
    { label: 'Unggah', href: '/upload', icon: PlusCircle, isHighlight: true },
    { label: 'Aset', href: '/assets', icon: Layers },
    { label: 'Kreator', href: '/creators', icon: Users },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-2xl px-2 py-1 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href === '/' && pathname === '/');

        if (item.isHighlight) {
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center relative -top-3.5 group"
            >
              <div className="w-13 h-13 p-3 rounded-full bg-gradient-to-tr from-[#d85417] to-[#F26522] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all ring-4 ring-white">
                <PlusCircle size={26} />
              </div>
              <span className="text-[10px] font-extrabold text-[#F26522] mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1.5 px-2 min-w-[54px] rounded-xl transition-all ${
              isActive ? 'text-[#F26522] font-black scale-105' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Icon size={20} className={isActive ? 'stroke-[2.5px] text-[#F26522]' : 'stroke-2'} />
            <span className="text-[10px] mt-1 font-semibold tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
