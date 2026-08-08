'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PksLogo } from './PksLogo';
import { Search, ChevronDown, Bell } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface HeaderProps {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export const Header: React.FC<HeaderProps> = ({ onSearchChange, searchQuery = '' }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logoutUser, unreadNotificationCount } = useData();
  const [internalSearch, setInternalSearch] = useState(searchQuery);
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
    { label: 'Desainer', href: '/creators', id: 'creators' },
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
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [isTransitionActive, setIsTransitionActive] = useState(false);

  const updateIndicatorPos = (enableTransition = true) => {
    const activeEl = navItemRefs.current[activeLinkId];
    if (activeEl && activeEl.offsetWidth > 0) {
      const newPos = {
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1,
      };
      setIndicatorStyle((prev) => {
        if (prev.left === newPos.left && prev.width === newPos.width && prev.opacity === newPos.opacity) {
          return prev;
        }
        return newPos;
      });
      if (enableTransition) {
        setIsTransitionActive(true);
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pksart_last_nav_pos', JSON.stringify(newPos));
      }
    }
  };

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('pksart_last_nav_pos');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.left === 'number' && parsed.width > 0) {
            setIndicatorStyle(parsed);
          }
        } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Snap to correct position instantly on page render
    updateIndicatorPos(false);

    // Enable transition shortly after page loads to ensure smooth glide afterwards
    const timer = setTimeout(() => {
      setIsTransitionActive(true);
    }, 150);

    const handleResize = () => updateIndicatorPos(false);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
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
    <>
      <header className="fixed top-0 left-0 right-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
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
                placeholder="Cari karya, desainer, atau daerah..."
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
              suppressHydrationWarning
              className={`absolute bottom-0 h-[3px] bg-[#F26522] rounded-t-full pointer-events-none ${
                isTransitionActive ? 'transition-all duration-300 ease-out' : ''
              }`}
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

            {/* Upload Button - Logged in users only */}
            {isMounted && currentUser && (
              <Link
                href="/upload"
                className="inline-flex items-center justify-center px-4 py-2 bg-[#F26522] hover:bg-[#d85517] text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
              >
                <span>Unggah Karya</span>
              </Link>
            )}

            {/* Notification Icon */}
            {isMounted && currentUser && (
              <Link href="/notifikasi" className="relative p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors mx-1" aria-label="Notifications">
                <Bell size={20} />
                {unreadNotificationCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />}
              </Link>
            )}
            
            {isMounted && currentUser ? (
              <div suppressHydrationWarning ref={profileDropdownRef} className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 pl-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="User Profile"
                >
                  {!isMounted ? (
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
                  ) : currentUser.avatar ? (
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200'}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-[#F26522]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#F26522] text-white font-bold flex items-center justify-center text-xs shadow-inner">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
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
                      href={`/creators/${currentUser.id}`}
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs font-semibold"
                    >
                      Profil Saya
                    </Link>

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
              placeholder="Cari karya, desainer, atau daerah..."
              className="w-full bg-[#F3F4F6] text-gray-800 placeholder-gray-400 text-xs rounded-full pl-9 pr-4 py-2 border border-transparent focus:border-[#F26522] focus:bg-white focus:outline-none"
            />
          </form>
        </div>
      </div>

      </header>

    </>
  );
};
