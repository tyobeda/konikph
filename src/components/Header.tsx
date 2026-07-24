'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PksLogo } from './PksLogo';
import { Search, ChevronDown, Menu, X } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface HeaderProps {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export const Header: React.FC<HeaderProps> = ({ onSearchChange, searchQuery = '' }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logoutUser } = useData();
  const [internalSearch, setInternalSearch] = useState(searchQuery);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState('');

  // Track window hash for #eksplorasi active tab safely without duplication
  useEffect(() => {
    const handleHashChange = () => {
      let rawHash = window.location.hash;
      if (rawHash.includes('#eksplorasi')) {
        // Sanitize to clean single #eksplorasi
        if (rawHash !== '#eksplorasi') {
          window.history.replaceState(null, '', '/#eksplorasi');
        }
        setCurrentHash('#eksplorasi');
      } else {
        setCurrentHash(rawHash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const navLinks = [
    { label: 'Beranda', href: '/', id: 'beranda' },
    { label: 'Eksplorasi', href: '/explore', id: 'explore' },
    { label: 'Aset Desain', href: '/assets', id: 'assets' },
    { label: 'Kreator', href: '/creators', id: 'creators' },
  ];

  // Helper to determine active link ID
  const getActiveLinkId = () => {
    if (pathname === '/explore') return 'explore';
    if (pathname === '/assets') return 'assets';
    if (pathname === '/creators') return 'creators';
    if (pathname === '/') return 'beranda';
    return '';
  };

  const activeLinkId = getActiveLinkId();
  const navItemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  // Deterministic state initialization for 100% hydration match
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Read last nav position from sessionStorage on mount to start animation from last active tab
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('pksart_last_nav_pos');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.left === 'number') {
            setIndicatorStyle(parsed);
          }
        } catch (e) {}
      }
    }
  }, []);

  // Calculate & animate indicator position seamlessly after client mount
  useEffect(() => {
    if (!isMounted) return;

    const timer = setTimeout(() => {
      const activeEl = navItemRefs.current[activeLinkId];
      if (activeEl) {
        const newPos = {
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1,
        };

        setIndicatorStyle(newPos);
        sessionStorage.setItem('pksart_last_nav_pos', JSON.stringify(newPos));
      } else {
        const saved = sessionStorage.getItem('pksart_last_nav_pos');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setIndicatorStyle(parsed);
          } catch (e) {}
        } else {
          setIndicatorStyle((prev: any) => ({ ...prev, opacity: 0 }));
        }
      }
    }, 20);

    return () => clearTimeout(timer);
  }, [activeLinkId, pathname, isMounted]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathname !== '/') {
      router.push(`/?search=${encodeURIComponent(internalSearch)}`);
    }
  };

  const handleNavClick = (e: React.MouseEvent, id: string, href: string) => {
    const clickedEl = navItemRefs.current[id];
    if (clickedEl && typeof window !== 'undefined') {
      const currentPos = {
        left: clickedEl.offsetLeft,
        width: clickedEl.offsetWidth,
        opacity: 1,
      };
      setIndicatorStyle(currentPos);
      sessionStorage.setItem('pksart_last_nav_pos', JSON.stringify(currentPos));
    }

    if (id === 'beranda') {
      if (pathname === '/') {
        e.preventDefault();
        window.history.replaceState(null, '', '/');
        setCurrentHash('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Search Bar */}
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <PksLogo size="md" />

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 relative items-center">
              <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={internalSearch}
                onChange={handleSearchInput}
                placeholder="Cari desain, kreator, atau daerah..."
                className="w-full bg-[#F3F4F6] text-gray-800 placeholder-gray-400 text-sm rounded-full pl-10 pr-4 py-2 border border-transparent focus:border-[#F26522] focus:bg-white focus:outline-none transition-all"
              />
            </form>
          </div>

          {/* Desktop Navigation Links with Seamless Cross-Page Sliding Indicator */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-gray-700 relative h-full">
            {navLinks.map((link) => {
              const isActive = activeLinkId === link.id;

              return (
                <Link
                  key={link.id}
                  href={link.href}
                  ref={(el) => {
                    navItemRefs.current[link.id] = el;
                  }}
                  onClick={(e) => handleNavClick(e, link.id, link.href)}
                  className={`relative py-5 transition-colors duration-200 flex items-center ${
                    isActive ? 'text-[#F26522] font-extrabold' : 'text-gray-700 hover:text-[#F26522]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* 🟠 Seamless Animated Orange Sliding Line (Cross-Page Persistent) */}
            <span
              className="absolute bottom-0 h-[3px] bg-[#F26522] rounded-t-full pointer-events-none transition-all duration-300 ease-out"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
            />
          </nav>

          {/* Action Buttons & Profile */}
          <div className="flex items-center gap-2.5">
            {/* Create Twibbon Button */}
            <Link
              href="/twibbon"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              <span>Buat Twibbon</span>
            </Link>

            {/* Upload Button */}
            <Link
              href="/upload"
              className="inline-flex items-center justify-center px-4 py-2 bg-[#F26522] hover:bg-[#d85517] text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              <span>Unggah Karya</span>
            </Link>

            {/* User Profile Dropdown or Auth Links */}
            {isMounted && currentUser ? (
              <div suppressHydrationWarning className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 pl-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="User Profile"
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-[#F26522]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#F26522] text-white font-bold flex items-center justify-center text-xs shadow-inner">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 text-sm animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p suppressHydrationWarning className="font-bold text-gray-900 truncate">{currentUser.name}</p>
                      <p suppressHydrationWarning className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                    </div>

                    {(currentUser.role === 'Super Admin' || currentUser.role?.includes('DPW')) && (
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2 text-gray-800 font-bold hover:bg-orange-50 hover:text-[#F26522]"
                      >
                        <span>Admin Dashboard</span>
                        <span className="text-[9px] uppercase font-extrabold bg-[#F26522] text-white px-1.5 py-0.5 rounded">
                          {currentUser.role === 'Super Admin' ? 'Super' : 'DPW'}
                        </span>
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs font-semibold"
                    >
                      Pengaturan Profil
                    </Link>

                    <Link
                      href="/my-artworks"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs font-semibold"
                    >
                      Kelola Postingan Saya
                    </Link>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        logoutUser();
                        router.push('/login');
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-bold text-xs border-t border-gray-100 transition-colors"
                    >
                      Keluar Akun
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-bold text-gray-700 hover:text-[#F26522] hover:bg-gray-100 rounded-xl transition-all"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 shrink-0"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Top Sticky Header) */}
        <div className="md:hidden pb-3 pt-1">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="absolute left-3 text-gray-400 pointer-events-none">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={internalSearch}
              onChange={handleSearchInput}
              placeholder="Cari desain, kreator, atau daerah..."
              className="w-full bg-[#F3F4F6] text-gray-800 placeholder-gray-400 text-xs rounded-full pl-9 pr-4 py-2 border border-transparent focus:border-[#F26522] focus:bg-white focus:outline-none"
            />
          </form>
        </div>
      </div>

      {/* 📱 MOBILE RESPONSIVE DRAWER BACKDROP */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200 cursor-pointer"
        />
      )}

      {/* 📱 MOBILE SLIDE-OVER NAVIGATION DRAWER */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white text-gray-900 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Drawer Top Brand Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
            <div className="flex items-center gap-2">
              <PksLogo size="sm" />
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Nav Links */}
          <div className="p-4 space-y-1 flex-1">
            <p className="text-[10px] font-extrabold uppercase text-gray-400 px-3 mb-2 tracking-wider">
              Navigasi Utama
            </p>

            {navLinks.map((link) => {
              const isActive = activeLinkId === link.id;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={(e) => {
                    handleNavClick(e, link.id, link.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-orange-50 text-[#F26522] border border-orange-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <div className="w-2 h-2 rounded-full bg-[#F26522]" />}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
              <p className="text-[10px] font-extrabold uppercase text-gray-400 px-3 mb-2 tracking-wider">
                Aksi Cepat
              </p>

              <Link
                href="/upload"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 px-3.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Unggah Karya Baru</span>
              </Link>

              <Link
                href="/twibbon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 px-3.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2"
              >
                <span>Buat Twibbon Resmi</span>
              </Link>

              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl text-center flex items-center justify-between"
              >
                <span>Super Admin Panel</span>
                <span className="text-[9px] uppercase font-extrabold bg-[#F26522] text-white px-1.5 py-0.5 rounded">
                  Admin
                </span>
              </Link>
            </div>
          </div>

          {/* Drawer Footer User Profile */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/80">
            <Link
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-200/60 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-[#8D6E63] text-white font-bold flex items-center justify-center text-xs shadow-sm">
                R
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate">Roni - Sumut</p>
                <p className="text-[10px] text-gray-500 truncate">Pengaturan Profil Saya</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
