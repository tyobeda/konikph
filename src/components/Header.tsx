'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PksLogo } from './PksLogo';
import { Search, ChevronDown, Menu, X } from 'lucide-react';

interface HeaderProps {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export const Header: React.FC<HeaderProps> = ({ onSearchChange, searchQuery = '' }) => {
  const pathname = usePathname();
  const router = useRouter();
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
  }, []);

  // Calculate & animate indicator position safely after client mount
  useEffect(() => {
    if (!isMounted) return;

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
      // Check stored position if element not found yet
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
  }, [activeLinkId, pathname, currentHash, isMounted]);

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

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-1 p-1 pl-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="User Profile"
              >
                <div className="w-8 h-8 rounded-full bg-[#8D6E63] text-white font-bold flex items-center justify-center text-sm shadow-inner">
                  R
                </div>
                <ChevronDown size={16} className="text-gray-500" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 text-sm animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="font-bold text-gray-900">Roni - Sumut</p>
                    <p className="text-xs text-gray-500">roni@pks.art</p>
                  </div>
                  <Link href="/admin" className="flex items-center justify-between px-4 py-2 text-gray-800 font-bold hover:bg-orange-50 hover:text-[#F26522]">
                    <span>Admin Dashboard</span>
                    <span className="text-[10px] uppercase font-extrabold bg-[#F26522] text-white px-1.5 py-0.5 rounded">
                      Super
                    </span>
                  </Link>
                  <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                    Pengaturan Profil
                  </Link>
                  <Link href="/my-artworks" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                    Kelola Postingan Saya
                  </Link>
                  <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium">
                    Keluar
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
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
              className="w-full bg-[#F3F4F6] text-gray-800 placeholder-gray-400 text-sm rounded-full pl-9 pr-4 py-2 border border-transparent focus:border-[#F26522] focus:bg-white focus:outline-none"
            />
          </form>
        </div>

        {/* Mobile Navigation Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-gray-100 flex flex-col gap-2">
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
                  className={`px-3 py-2 font-semibold rounded-lg transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-orange-50 text-[#F26522] font-bold border-l-4 border-[#F26522]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
