'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, AlertCircle, ChevronDown, HelpCircle, Quote, X, Edit3 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import SliderWidget, { SlideItem, SliderEffect } from '@/components/SliderWidget';

const parseMarkdownToHtml = (text: string) => {
  if (!text) return '';
  
  let html = text;
    
  html = html.replace(/^### (.*$)/gim, '<h4 class="text-base font-bold text-slate-800 mt-4 mb-2">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-lg font-bold text-slate-900 mt-5 mb-2">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-xl font-bold text-slate-900 mt-6 mb-3 border-b pb-1">$1</h2>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="list-disc ml-5 mb-1 text-slate-600">$1</li>');

  html = html.replace(/\[u\](.*?)\[\/u\]/g, '<span class="underline">$1</span>');
  html = html.replace(/\[s\](.*?)\[\/s\]/g, '<del class="line-through text-gray-400">$1</del>');
  html = html.replace(/\[align=(left|center|right)\](.*?)\[\/align\]/g, '<div class="text-$1">$2</div>');
  html = html.replace(/\[size=(xs|sm|lg|xl|2xl)\](.*?)\[\/size\]/g, (match, size, content) => {
    const sizeClasses: { [key: string]: string } = {
      xs: 'text-xs',
      sm: 'text-sm',
      lg: 'text-lg',
      xl: 'text-xl font-bold',
      '2xl': 'text-2xl font-bold'
    };
    return `<span class="${sizeClasses[size] || 'text-base'}">${content}</span>`;
  });
  
  const paragraphs = html.split(/\n{2,}/);
  return paragraphs.map(p => {
    const trimmed = p.trim();
    if (trimmed.startsWith('<h') || trimmed.startsWith('<li') || trimmed.startsWith('<ul') || trimmed.startsWith('<div') || trimmed.startsWith('<p') || trimmed.startsWith('<span')) {
      return trimmed;
    }
    return `<p class="mb-4 leading-relaxed text-slate-650 text-sm sm:text-base">${trimmed.replace(/\n/g, '<br />')}</p>`;
  }).join('\n');
};

interface PageBlock {
  type: 'hero' | 'text' | 'cta' | 'faq' | 'image' | 'quote' | 'separator' | 'heading' | 'gallery' | 'slider';
  title?: string;
  subtitle?: string;
  titleSize?: 'h1' | 'h2' | 'h3' | 'h4';
  titleAlign?: 'left' | 'center' | 'right';
  ctaText?: string;
  ctaLink?: string;
  content?: string;
  description?: string;
  faqs?: { question: string; answer: string }[];
  fullWidth?: boolean;
  imageUrl?: string;
  imageAlt?: string;
  imageLink?: string;
  imageSize?: 'small' | 'medium' | 'large' | 'full';
  imageAlign?: 'left' | 'center' | 'right';
  quoteText?: string;
  quoteAuthor?: string;
  galleryImages?: string[];
  galleryCols?: number;
  bgPosition?: string;
  // Slider properties
  sliderImages?: string[];
  slides?: SlideItem[];
  sliderEffect?: SliderEffect;
  sliderAutoplay?: boolean;
  sliderInterval?: number;
  sliderAspectRatio?: '16:9' | '4:3' | '1:1' | '21:9' | '3:2' | 'auto';
  sliderHeight?: 'small' | 'medium' | 'large' | 'auto';
  sliderShowDots?: boolean;
  sliderShowArrows?: boolean;
  sliderBorderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  sliderOverlay?: 'none' | 'dark' | 'gradient' | 'light';
}

interface RootPageContentProps {
  page: {
    id?: string;
    title: string;
    content: string;
  };
}

export default function RootPageContent({ page }: RootPageContentProps) {
  const router = useRouter();
  const { currentUser } = useData();
  const [activeFaq, setActiveFaq] = useState<{ [key: string]: boolean }>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const canEdit = !!(
    currentUser &&
    (currentUser.role === 'Super Admin' ||
      currentUser.role?.toLowerCase().includes('admin') ||
      currentUser.role?.toLowerCase().includes('dpw'))
  );

  const toggleFaq = (blockIdx: number, faqIdx: number) => {
    const key = `${blockIdx}-${faqIdx}`;
    setActiveFaq((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  let blocks: PageBlock[] = [];
  let pageWidth: '70' | 'full' = '70';
  let containerStyle: 'boxed' | 'clean' = 'boxed';
  let hideTitle = false;
  let hideTitleBorder = false;

  try {
    const parsed = JSON.parse(page.content);
    if (Array.isArray(parsed)) {
      blocks = parsed;
    } else if (parsed && typeof parsed === 'object') {
      blocks = parsed.blocks || [];
      pageWidth = parsed.pageWidth || '70';
      containerStyle = parsed.containerStyle || 'boxed';
      hideTitle = parsed.hideTitle || false;
      hideTitleBorder = parsed.hideTitleBorder || false;
    }
  } catch (e) {
    blocks = [];
  }

  return (
    <>
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 transition-all ${
        pageWidth === 'full' ? 'max-w-7xl' : 'max-w-4xl'
      }`}>
        
        {/* Page title container & Admin Edit Action */}
        {!hideTitle ? (
          <div className={`flex flex-wrap items-center justify-between gap-3 ${hideTitleBorder ? 'pb-4' : 'border-b border-gray-150 pb-4'}`}>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {page.title}
            </h1>
            {canEdit && page.id && (
              <Link
                href={`/admin/pages/${page.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#F26522] border border-orange-200/80 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 active:scale-95"
              >
                <Edit3 size={13} />
                <span>Edit Halaman Ini</span>
              </Link>
            )}
          </div>
        ) : (
          canEdit && page.id && (
            <div className="flex justify-end -mb-4">
              <Link
                href={`/admin/pages/${page.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#F26522] border border-orange-200/80 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 active:scale-95"
              >
                <Edit3 size={13} />
                <span>Edit Halaman Ini</span>
              </Link>
            </div>
          )
        )}

        {blocks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-gray-400 text-sm font-semibold">
            Konten halaman kosong.
          </div>
        ) : (
          <div className="space-y-10">
            {blocks.map((block, blockIdx) => {
              
              if (block.type === 'heading') {
                return (
                  <div key={blockIdx} className={`py-2 text-${block.titleAlign || 'left'}`}>
                    {block.titleSize === 'h1' ? (
                      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">{block.title || 'Judul Utama'}</h1>
                    ) : block.titleSize === 'h3' ? (
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">{block.title || 'Judul Section'}</h3>
                    ) : block.titleSize === 'h4' ? (
                      <h4 className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug">{block.title || 'Judul Kecil'}</h4>
                    ) : (
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">{block.title || 'Judul Utama'}</h2>
                    )}
                    {block.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">{block.subtitle}</p>
                    )}
                  </div>
                );
              }

              if (block.type === 'hero') {
                return (
                  <div 
                    key={blockIdx}
                    className={`relative overflow-hidden text-white p-8 sm:p-12 shadow-xl border border-slate-800/80 transition-all bg-cover ${
                      block.fullWidth || pageWidth === 'full' ? '-mx-4 sm:-mx-6 rounded-none sm:rounded-none' : 'rounded-3xl'
                    }`}
                    style={block.imageUrl ? { backgroundImage: `url(${block.imageUrl})`, backgroundPosition: block.bgPosition || 'center' } : { backgroundColor: '#1E293B' }}
                  >
                    {block.imageUrl ? (
                      <div className="absolute inset-0 bg-black/60 z-0" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] via-slate-900 to-black z-0" />
                    )}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-[#F26522]/10 rounded-full blur-3xl z-0" />
                    <div className="relative z-10 max-w-xl space-y-4">
                      <h2 className="text-2xl sm:text-4xl font-black leading-tight">{block.title}</h2>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{block.subtitle}</p>
                      {block.ctaText && block.ctaLink && (
                        <div className="pt-2">
                          <a href={block.ctaLink} className="inline-block px-5 py-3 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.99]">{block.ctaText}</a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              if (block.type === 'text') {
                return (
                  <div 
                    key={blockIdx}
                    className={`rounded-3xl p-6 sm:p-8 text-gray-700 leading-relaxed text-sm sm:text-base prose prose-slate max-w-none transition-all ${
                      containerStyle === 'clean' ? 'bg-transparent border-0 shadow-none px-0' : 'bg-white border border-gray-100 shadow-sm'
                    }`}
                    dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(block.content || '') }}
                  />
                );
              }

              if (block.type === 'cta') {
                return (
                  <div 
                    key={blockIdx}
                    className={`rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all ${
                      containerStyle === 'clean' ? 'bg-gradient-to-r from-orange-50 to-amber-50/40 border border-orange-100' : 'bg-[#F26522]/5 border border-[#F26522]/20'
                    }`}
                  >
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-gray-900">{block.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-xl">{block.description}</p>
                    </div>
                    {block.ctaText && block.ctaLink && (
                      <a href={block.ctaLink} className="inline-block px-5 py-3 bg-black hover:bg-gray-800 text-white text-center text-xs font-bold rounded-xl shadow-md transition-all shrink-0">{block.ctaText}</a>
                    )}
                  </div>
                );
              }

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
                          <div key={faqIdx} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm transition-all">
                            <button type="button" onClick={() => toggleFaq(blockIdx, faqIdx)} className="w-full text-left p-4 flex items-center justify-between gap-4 font-bold text-gray-800 text-sm hover:bg-gray-50/50 transition-colors">
                              <span>{faq.question}</span>
                              <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isOpen && (
                              <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-gray-500 leading-relaxed border-t border-gray-50/50 bg-gray-50/20">{faq.answer}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              if (block.type === 'image') {
                return (
                  <div key={blockIdx} className={`py-1 flex ${block.imageAlign === 'left' ? 'justify-start' : block.imageAlign === 'right' ? 'justify-end' : 'justify-center'}`}>
                    <div className={`overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all ${
                      block.imageSize === 'small' ? 'w-1/4' : block.imageSize === 'medium' ? 'w-1/2' : block.imageSize === 'large' ? 'w-3/4' : 'w-full'
                    }`}>
                      {block.imageUrl && (
                        block.imageLink ? (
                          <a href={block.imageLink} target={block.imageLink.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
                            <img src={block.imageUrl} alt={block.imageAlt || 'Gambar Halaman'} className="w-full h-auto object-cover rounded-3xl" />
                          </a>
                        ) : (
                          <img src={block.imageUrl} alt={block.imageAlt || 'Gambar Halaman'} className="w-full h-auto object-cover rounded-3xl" />
                        )
                      )}
                    </div>
                  </div>
                );
              }

              if (block.type === 'quote') {
                return (
                  <div key={blockIdx} className="bg-gradient-to-r from-orange-50/70 to-amber-50/30 border-l-4 border-[#F26522] rounded-r-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                    <Quote size={48} className="absolute right-6 top-6 text-[#F26522]/10" />
                    <blockquote className="relative z-10 text-slate-800 text-base sm:text-lg font-medium italic leading-relaxed">&quot;{block.quoteText}&quot;</blockquote>
                    {block.quoteAuthor && (
                      <p className="relative z-10 text-xs sm:text-sm font-bold text-[#F26522] mt-4">— {block.quoteAuthor}</p>
                    )}
                  </div>
                );
              }

              if (block.type === 'separator') {
                return (
                  <div key={blockIdx} className="py-6 flex items-center justify-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                );
              }

              if (block.type === 'gallery') {
                const cols = block.galleryCols || 3;
                const gridClass = cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4';
                return (
                  <div key={blockIdx} className="w-full">
                    <div className={`grid ${gridClass} gap-4 sm:gap-6`}>
                      {(block.galleryImages || []).map((imgUrl, imgIdx) => (
                        <div key={imgIdx} onClick={() => setPreviewImage(imgUrl)} className="aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-gray-100 border border-gray-200 shadow-sm">
                          <img src={imgUrl} alt={`Gallery Image ${imgIdx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (block.type === 'slider') {
                return (
                  <div key={blockIdx} className="w-full">
                    <SliderWidget
                      slides={block.slides}
                      sliderImages={block.sliderImages}
                      sliderEffect={block.sliderEffect}
                      sliderAutoplay={block.sliderAutoplay}
                      sliderInterval={block.sliderInterval}
                      sliderAspectRatio={block.sliderAspectRatio}
                      sliderHeight={block.sliderHeight}
                      sliderShowDots={block.sliderShowDots}
                      sliderShowArrows={block.sliderShowArrows}
                      sliderBorderRadius={block.sliderBorderRadius}
                      sliderOverlay={block.sliderOverlay}
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </main>

      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setPreviewImage(null)}>
          <button onClick={() => setPreviewImage(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md">
            <X size={24} />
          </button>
          <img src={previewImage} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
