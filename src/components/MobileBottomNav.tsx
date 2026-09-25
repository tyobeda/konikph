'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusCircle, Layers, Users, User } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { getUserSlug } from '@/lib/slug';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useData();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  // Close menu when route changes
  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  if (!mounted) return null;

  // Hide bottom navbar if user is NOT logged in
  if (!currentUser) return null;

  // Hide on full-screen page builder editor
  if (pathname?.startsWith('/admin/pages/')) return null;

  const profileHref = `/creators/${getUserSlug(currentUser)}`;

  const navItems = [
    { label: 'Beranda', href: '/', icon: Home },
    { label: 'Eksplorasi', href: '/explore', icon: Compass },
    { label: 'Unggah', href: '#', icon: PlusCircle, isHighlight: true },
    { label: 'Aset', href: '/assets', icon: Layers },
    { label: 'Profil', href: profileHref, icon: User },
  ];

  return (
    <>
      {/* Backdrop for closing menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 md:hidden backdrop-blur-[1px]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800/80 shadow-2xl px-2 py-1 flex items-center justify-around transition-colors duration-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/' && pathname === '/');

          if (item.isHighlight) {
            return (
              <div key={item.label} className="relative flex flex-col items-center justify-center">
                {/* Popup Menu */}
                <div 
                  className={`absolute bottom-[70px] bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-2 flex flex-col gap-2 min-w-[160px] transition-all duration-200 origin-bottom ${isMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4 pointer-events-none'}`}
                >
                  <Link 
                    href="/upload"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/20 active:bg-orange-100 dark:active:bg-orange-950/40 transition-colors"
                  >
                    <div className="bg-[#F26522] text-white p-1.5 rounded-lg">
                      <PlusCircle size={18} />
                    </div>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">Tambah Karya</span>
                  </Link>
                  <Link 
                    href="/twibbon"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/20 active:bg-orange-100 dark:active:bg-orange-950/40 transition-colors"
                  >
                    <div className="bg-[#F26522] text-white p-1.5 rounded-lg">
                      <Layers size={18} />
                    </div>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">Tambah Twibbon</span>
                  </Link>
                </div>

                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex flex-col items-center justify-center relative -top-3.5 group outline-none"
                >
                  <div className={`w-13 h-13 p-3 rounded-full bg-gradient-to-tr from-[#d85417] to-[#F26522] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all ring-4 ring-white dark:ring-[#0B0F17] ${isMenuOpen ? 'rotate-45 shadow-[#F26522]/40' : ''}`}>
                    <PlusCircle size={26} />
                  </div>
                  <span className="text-[10px] font-extrabold text-[#F26522] mt-0.5">
                    {item.label}
                  </span>
                </button>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-2 min-w-[54px] rounded-xl transition-all ${
                isActive ? 'text-[#F26522] font-black scale-105' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={20} className={isActive ? 'stroke-[2.5px] text-[#F26522]' : 'stroke-2'} />
              <span className="text-[10px] mt-1 font-semibold tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
