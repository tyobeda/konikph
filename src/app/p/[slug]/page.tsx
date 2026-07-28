'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Sparkles, AlertCircle, ChevronDown, HelpCircle, Layers } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useData } from '@/context/DataContext';

interface PageBlock {
  type: 'hero' | 'text' | 'cta' | 'faq';
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  content?: string;
  description?: string;
  faqs?: { question: string; answer: string }[];
}

export default function CustomPageRenderer() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const { customPages } = useData();
  const [isMounted, setIsMounted] = useState(false);
  
  // Accordion active state trackers
  const [activeFaq, setActiveFaq] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activePage = customPages.find(
    (page) => page.slug.toLowerCase() === slug?.toLowerCase() && page.published
  );

  const toggleFaq = (blockIdx: number, faqIdx: number) => {
    const key = `${blockIdx}-${faqIdx}`;
    setActiveFaq((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px]">
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-48 bg-white rounded-3xl" />
          <div className="h-64 bg-white rounded-3xl" />
        </main>
        <Footer />
      </div>
    );
  }

  // 404 - Not Found View
  if (!activePage) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px]">
        <Header />
        <main className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center my-16">
          <div className="w-16 h-16 bg-orange-50 text-[#F26522] rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Halaman Tidak Ditemukan</h3>
          <p className="text-xs text-gray-500 mt-1 mb-6 leading-relaxed">
            Halaman yang Anda cari tidak tersedia, belum dipublikasikan, atau tautan yang dimasukkan salah.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Kembali ke Beranda
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  let blocks: PageBlock[] = [];
  try {
    blocks = JSON.parse(activePage.content);
  } catch (e) {
    blocks = [];
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pt-[110px] md:pt-[70px]">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        
        {/* Page title container */}
        <div className="border-b border-gray-150 pb-4 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <span>{activePage.title}</span>
            <Sparkles size={20} className="text-[#F26522]" />
          </h1>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-950 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali</span>
          </button>
        </div>

        {/* Render Layout Blocks */}
        {blocks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-gray-400 text-sm font-semibold">
            Konten halaman kosong.
          </div>
        ) : (
          <div className="space-y-10">
            {blocks.map((block, blockIdx) => {
              
              // 1. HERO BLOCK
              if (block.type === 'hero') {
                return (
                  <div 
                    key={blockIdx}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E293B] via-slate-900 to-black text-white p-8 sm:p-12 shadow-xl border border-slate-800/80"
                  >
                    {/* Decorative abstract elements */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-[#F26522]/10 rounded-full blur-3xl" />
                    <div className="relative z-10 max-w-xl space-y-4">
                      <h2 className="text-2xl sm:text-4xl font-black leading-tight">
                        {block.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
                        {block.subtitle}
                      </p>
                      {block.ctaText && block.ctaLink && (
                        <div className="pt-2">
                          <a
                            href={block.ctaLink}
                            className="inline-block px-5 py-3 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.99]"
                          >
                            {block.ctaText}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // 2. TEXT BLOCK
              if (block.type === 'text') {
                return (
                  <div 
                    key={blockIdx}
                    className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm prose prose-slate max-w-none text-gray-700 leading-relaxed text-sm sm:text-base"
                    dangerouslySetInnerHTML={{ __html: block.content || '' }}
                  />
                );
              }

              // 3. CTA BANNER BLOCK
              if (block.type === 'cta') {
                return (
                  <div 
                    key={blockIdx}
                    className="bg-[#F26522]/5 border border-[#F26522]/20 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                  >
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-gray-900">
                        {block.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
                        {block.description}
                      </p>
                    </div>
                    {block.ctaText && block.ctaLink && (
                      <a
                        href={block.ctaLink}
                        className="inline-block px-5 py-3 bg-black hover:bg-gray-800 text-white text-center text-xs font-bold rounded-xl shadow-md transition-all shrink-0"
                      >
                        {block.ctaText}
                      </a>
                    )}
                  </div>
                );
              }

              // 4. FAQ ACCORDION BLOCK
              if (block.type === 'faq') {
                return (
                  <div key={blockIdx} className="space-y-4">
                    <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5 px-2">
                      <HelpCircle size={18} className="text-[#F26522]" />
                      <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
                    </h3>
                    
                    <div className="space-y-2.5">
                      {(block.faqs || []).map((faq, faqIdx) => {
                        const key = `${blockIdx}-${faqIdx}`;
                        const isOpen = !!activeFaq[key];
                        return (
                          <div 
                            key={faqIdx}
                            className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm transition-all"
                          >
                            <button
                              type="button"
                              onClick={() => toggleFaq(blockIdx, faqIdx)}
                              className="w-full text-left p-4 flex items-center justify-between gap-4 font-bold text-gray-800 text-sm hover:bg-gray-50/50 transition-colors"
                            >
                              <span>{faq.question}</span>
                              <ChevronDown 
                                size={16} 
                                className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                              />
                            </button>
                            {isOpen && (
                              <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-gray-500 leading-relaxed border-t border-gray-50/50 bg-gray-50/20">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
