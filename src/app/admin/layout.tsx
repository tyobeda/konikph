'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Users,
  Building,
  Sparkles,
  Settings,
  ArrowUpRight,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer whenever page navigation changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Kelola Karya', href: '/admin/artworks', icon: ImageIcon },
    { label: 'Kelola Kreator', href: '/admin/creators', icon: Users },
    { label: 'Kelola DPW', href: '/admin/dpw', icon: Building },
    { label: 'Kelola Twibbon', href: '/admin/twibbon', icon: Sparkles },
    { label: 'Pengaturan Situs', href: '/admin/settings', icon: Settings },
  ];

  const currentPageLabel = navLinks.find((l) => l.href === pathname)?.label || 'Super Admin';

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row font-sans">
      
      {/* 📱 MOBILE STICKY HEADER WITH BURGER MENU */}
      <header className="md:hidden sticky top-0 z-50 bg-[#1E293B] text-white px-4 py-3 flex items-center justify-between shadow-md border-b border-slate-700/60">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#F26522] text-white font-black flex items-center justify-center text-[10px]">
            PKS
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm tracking-tight text-white">
              PKS<span className="text-[#F26522]">art</span>
            </span>
            <span className="text-[9px] uppercase font-bold bg-[#F26522] px-1.5 py-0.5 rounded text-white">
              Admin
            </span>
          </div>
        </Link>

        {/* Current Active Page Title Badge on Header */}
        <span className="hidden sm:inline-block text-xs font-semibold text-slate-300 truncate max-w-[140px]">
          {currentPageLabel}
        </span>

        {/* Burger Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* 📱 MOBILE DRAWER BACKDROP OVERLAY */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200 cursor-pointer"
        />
      )}

      {/* 📱 MOBILE SLIDE-OVER DRAWER MENU */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#1E293B] text-white flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-700/60 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#F26522] text-white font-bold flex items-center justify-center text-xs">
                PKS
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                PKS<span className="text-[#F26522]">art</span> Panel
              </span>
            </Link>
          </div>

          {/* Drawer Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#F26522] text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Link on Mobile Drawer */}
          <div className="p-4 border-t border-slate-700/60 mt-auto bg-[#1E293B]">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
            >
              <span>Lihat Website Utama</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </aside>

      {/* 🖥️ DESKTOP PERSISTENT STICKY SIDEBAR (Hidden on Mobile) */}
      <aside className="hidden md:flex w-64 h-screen sticky top-0 bg-[#1E293B] text-white flex-col shrink-0 justify-between z-40">
        <div className="flex flex-col min-h-0 flex-1">
          {/* Brand Area */}
          <div className="p-5 border-b border-slate-700/60 flex items-center justify-between shrink-0">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#F26522] text-white font-bold flex items-center justify-center text-xs">
                PKS
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white">
                  PKS<span className="text-[#F26522]">art</span>
                </span>
                <span className="ml-2 text-[10px] uppercase font-bold bg-[#F26522] px-1.5 py-0.5 rounded text-white">
                  Admin
                </span>
              </div>
            </Link>
          </div>

          {/* Admin Navigation */}
          <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#F26522] text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Back to Public Web Link (Pinned to bottom) */}
        <div className="p-4 border-t border-slate-700/60 shrink-0 mt-auto bg-[#1E293B]">
          <Link
            href="/"
            className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
          >
            <span>Lihat Website Utama</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </aside>

      {/* Dynamic Content View */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
