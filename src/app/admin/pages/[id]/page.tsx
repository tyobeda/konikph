'use client';

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  FileText,
  Search,
  ChevronLeft,
  X,
  Sparkles,
  Layout,
  PlusCircle,
  HelpCircle,
  Megaphone,
  AlignLeft,
  Settings,
  Eye,
  Save,
  ArrowUp,
  ArrowDown,
  Info,
  CheckCircle,
  Loader2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignCenter,
  AlignRight,
  Type
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { CustomPage } from '@/lib/types';

const parseMarkdownToHtml = (text: string) => {
  if (!text) return '';
  
  let html = text;
    
  // Markdown processing
  html = html.replace(/^### (.*$)/gim, '<h4 class="text-base font-bold text-slate-800 mt-4 mb-2">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-lg font-bold text-slate-900 mt-5 mb-2">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-xl font-bold text-slate-900 mt-6 mb-3 border-b pb-1">$1</h2>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="list-disc ml-5 mb-1 text-slate-600">$1</li>');

  // BBCode tags
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
  
  // Wrap paragraphs
  const paragraphs = html.split(/\n{2,}/);
  return paragraphs.map(p => {
    const trimmed = p.trim();
    if (trimmed.startsWith('<h') || trimmed.startsWith('<li') || trimmed.startsWith('<ul') || trimmed.startsWith('<div') || trimmed.startsWith('<p') || trimmed.startsWith('<span')) {
      return trimmed;
    }
    return `<p class="mb-4 leading-relaxed text-slate-655 text-xs sm:text-sm">${trimmed.replace(/\n/g, '<br />')}</p>`;
  }).join('\n');
};

interface Block {
  id: string;
  type: 'hero' | 'text' | 'cta' | 'faq';
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  content?: string;
  description?: string;
  faqs?: { question: string; answer: string }[];
}

let blockIdCounter = 0;
const genBlockId = () => `blk_${Date.now()}_${++blockIdCounter}`;

export default function AdminPageWorkspace() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { customPages, addCustomPage, updateCustomPage } = useData();

  // Editor states
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pagePublished, setPagePublished] = useState(true);
  const [pageUseRootPath, setPageUseRootPath] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);

  // Drag states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragImageRef = useRef<HTMLDivElement | null>(null);
  const canvasBlockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navBlockRefs = useRef<(HTMLDivElement | null)[]>([]);
  // FLIP animation: store old positions before swap
  const flipRectsCanvas = useRef<Map<string, DOMRect>>(new Map());
  const flipRectsNav = useRef<Map<string, DOMRect>>(new Map());
  const flipTrigger = useRef(0);
  const [flipVersion, setFlipVersion] = useState(0);
  const lastSwapTime = useRef(0);

  // Success Toast state
  const [showToast, setShowToast] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Temp faq state
  const [tempFaqQ, setTempFaqQ] = useState('');
  const [tempFaqA, setTempFaqA] = useState('');

  // active editor tab inside sidebar
  const [sidebarTab, setSidebarTab] = useState<'content' | 'settings'>('content');
  const [textEditorTab, setTextEditorTab] = useState<'visual' | 'code'>('code');

  // Load target page data or new template
  useEffect(() => {
    if (!id) return;
    
    if (id === 'new') {
      setPageTitle('Halaman Baru');
      setPageSlug('halaman-baru');
      setPagePublished(true);
      setPageUseRootPath(false);
      setBlocks([
        {
          id: genBlockId(),
          type: 'hero',
          title: 'Judul Utama Halaman',
          subtitle: 'Sub-judul pendukung atau deskripsi singkat.',
          ctaText: 'Pelajari Selengkapnya',
          ctaLink: '#'
        }
      ]);
      setSelectedBlockIndex(0);
      setIsLoaded(true);
    } else {
      // Find existing page
      const page = customPages.find((p) => p.id === id);
      if (page) {
        setPageTitle(page.title);
        setPageSlug(page.slug);
        setPagePublished(page.published);
        setPageUseRootPath(page.useRootPath || false);
        try {
          const parsed = JSON.parse(page.content) as Block[];
          // Ensure all loaded blocks have IDs
          setBlocks(parsed.map(b => ({ ...b, id: b.id || genBlockId() })));
        } catch (e) {
          setBlocks([]);
        }
        setSelectedBlockIndex(0);
        setIsLoaded(true);
      }
    }
  }, [id, customPages]);

  // ── FLIP-based animated drag helpers ──
  const ensureDragImage = useCallback(() => {
    if (!dragImageRef.current) {
      const el = document.createElement('div');
      el.style.width = '1px';
      el.style.height = '1px';
      el.style.opacity = '0.01';
      el.style.position = 'fixed';
      el.style.top = '-9999px';
      document.body.appendChild(el);
      dragImageRef.current = el;
    }
    return dragImageRef.current;
  }, []);

  /** Capture current positions of all blocks (FLIP: "First") */
  const capturePositions = useCallback(() => {
    const cMap = new Map<string, DOMRect>();
    const nMap = new Map<string, DOMRect>();
    blocks.forEach((block, idx) => {
      const cEl = canvasBlockRefs.current[idx];
      if (cEl) cMap.set(block.id, cEl.getBoundingClientRect());
      const nEl = navBlockRefs.current[idx];
      if (nEl) nMap.set(block.id, nEl.getBoundingClientRect());
    });
    flipRectsCanvas.current = cMap;
    flipRectsNav.current = nMap;
  }, [blocks]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Hide native browser drag ghost
    const img = ensureDragImage();
    e.dataTransfer.setDragImage(img, 0, 0);
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Throttle: only allow swap once every 300ms to prevent looping
    const now = Date.now();
    if (now - lastSwapTime.current < 300) return;
    lastSwapTime.current = now;

    // FLIP: capture "First" positions before swap
    capturePositions();

    const newBlocks = [...blocks];
    const draggedBlock = newBlocks[draggedIndex];
    newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(index, 0, draggedBlock);

    setBlocks(newBlocks);
    setDraggedIndex(index);
    setSelectedBlockIndex(index);
    // trigger FLIP animation
    flipTrigger.current++;
    setFlipVersion(flipTrigger.current);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // FLIP animation: after React re-renders with new order, animate from old to new position
  useLayoutEffect(() => {
    if (flipRectsCanvas.current.size === 0 && flipRectsNav.current.size === 0) return;

    const animateRefs = (
      refsArray: React.MutableRefObject<(HTMLDivElement | null)[]>,
      prevRects: Map<string, DOMRect>
    ) => {
      blocks.forEach((block, idx) => {
        const el = refsArray.current[idx];
        if (!el) return;
        const prevRect = prevRects.get(block.id);
        if (!prevRect) return;
        const newRect = el.getBoundingClientRect();
        const deltaY = prevRect.top - newRect.top;
        const deltaX = prevRect.left - newRect.left;
        if (Math.abs(deltaY) < 1 && Math.abs(deltaX) < 1) return;

        // FLIP: "Invert" – place element at its old position
        el.style.transition = 'none';
        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // FLIP: "Play" – animate to new position
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = 'transform 280ms cubic-bezier(.2,.8,.3,1)';
            el.style.transform = '';
          });
        });
      });
    };

    animateRefs(canvasBlockRefs, flipRectsCanvas.current);
    animateRefs(navBlockRefs, flipRectsNav.current);

    // Clear stored positions
    flipRectsCanvas.current = new Map();
    flipRectsNav.current = new Map();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipVersion]);

  const insertFormatting = (prefix: string, suffix: string) => {
    if (selectedBlockIndex === null) return;
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const selectedText = text.substring(start, end);
    const replacement = prefix + selectedText + suffix;
    
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    updateBlockField(selectedBlockIndex, 'content', newContent);
    
    // Restore selection focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  const handleFormat = (command: string, value: string = '') => {
    if (selectedBlockIndex === null) return;
    
    if (textEditorTab === 'code') {
      const formats: { [key: string]: [string, string] } = {
        bold: ['**', '**'],
        italic: ['*', '*'],
        underline: ['[u]', '[/u]'],
        strikeThrough: ['[s]', '[/s]'],
        justifyLeft: ['[align=left]', '[/align]'],
        justifyCenter: ['[align=center]', '[/align]'],
        justifyRight: ['[align=right]', '[/align]'],
        fontSizeXS: ['[size=xs]', '[/size]'],
        fontSizeSM: ['[size=sm]', '[/size]'],
        fontSizeLG: ['[size=lg]', '[/size]'],
        fontSizeXL: ['[size=xl]', '[/size]'],
        fontSize2XL: ['[size=2xl]', '[/size]'],
      };
      const format = formats[command] || ['', ''];
      insertFormatting(format[0], format[1]);
    } else {
      document.execCommand(command, false, value);
      const visualEditor = document.getElementById('visual-editor');
      if (visualEditor) {
        updateBlockField(selectedBlockIndex, 'content', visualEditor.innerHTML);
      }
    }
  };

  const addBlock = (type: 'hero' | 'text' | 'cta' | 'faq') => {
    const id = genBlockId();
    const newBlock: Block = type === 'hero' 
      ? { id, type, title: 'Judul Hero Baru', subtitle: 'Deskripsi singkat hero block.', ctaText: 'Klik Di Sini', ctaLink: '#' }
      : type === 'text' 
      ? { id, type, content: '<h3 class="text-lg font-bold mb-2">Subjudul Teks</h3><p>Tulis konten teks kustom Anda di sini menggunakan format HTML standar...</p>' }
      : type === 'cta'
      ? { id, type, title: 'Banner Aksi Kustom', description: 'Deskripsi singkat untuk mengajak pembaca melakukan aksi tertentu.', ctaText: 'Klik Aksi', ctaLink: '#' }
      : { id, type, faqs: [{ question: 'Pertanyaan FAQ Baru?', answer: 'Tulis jawaban detail di sini.' }] };
    
    setBlocks([...blocks, newBlock]);
    setSelectedBlockIndex(blocks.length);
  };

  const deleteBlock = (index: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setBlocks(blocks.filter((_, idx) => idx !== index));
    setSelectedBlockIndex(null);
  };

  const moveBlock = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;
    setBlocks(newBlocks);
    setSelectedBlockIndex(targetIdx);
  };

  const updateBlockField = (index: number, field: keyof Block, value: any) => {
    setBlocks(
      blocks.map((block, idx) => 
        idx === index ? { ...block, [field]: value } : block
      )
    );
  };

  const addFaqItem = (blockIdx: number) => {
    if (!tempFaqQ || !tempFaqA) return;
    const currentFaqs = blocks[blockIdx].faqs || [];
    updateBlockField(blockIdx, 'faqs', [...currentFaqs, { question: tempFaqQ, answer: tempFaqA }]);
    setTempFaqQ('');
    setTempFaqA('');
  };

  const removeFaqItem = (blockIdx: number, faqIdx: number) => {
    const currentFaqs = blocks[blockIdx].faqs || [];
    updateBlockField(
      blockIdx, 
      'faqs', 
      currentFaqs.filter((_, idx) => idx !== faqIdx)
    );
  };

  const handleSavePage = () => {
    if (!pageTitle || !pageSlug) {
      alert('Judul dan Slug wajib diisi.');
      return;
    }

    const cleanSlug = pageSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    const pageData = {
      title: pageTitle,
      slug: cleanSlug,
      published: pagePublished,
      useRootPath: pageUseRootPath,
      content: JSON.stringify(blocks),
    };

    if (id === 'new') {
      addCustomPage(pageData);
    } else {
      updateCustomPage(id, pageData);
    }

    // Show beautiful success Toast and redirect
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      router.push('/admin/pages');
    }, 2000);
  };

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-3xl shadow-xl flex items-center gap-3 text-gray-700">
          <Loader2 className="animate-spin text-[#F26522]" />
          <span className="text-sm font-bold">Memuat Workspace Builder...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F1F5F9] flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* 🔔 BEAUTIFUL SUCCESS TOAST ALERT OVERLAY */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-55 bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3.5 transition-all animate-bounce">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="font-bold text-sm text-emerald-950">Penyimpanan Berhasil!</p>
            <p className="text-[10px] text-emerald-600/80 mt-0.5">Semua data halaman kustom telah berhasil disimpan.</p>
          </div>
        </div>
      )}

      {/* ================= LEFT SIDEBAR (ELEMENTOR PANEL) ================= */}
      <div className="w-full md:w-96 bg-white text-slate-700 flex flex-col border-r border-gray-200/65 shrink-0 h-1/2 md:h-full shadow-2xl z-30">
        
        {/* Top Toolbar Info */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F26522] flex items-center justify-center font-black text-white text-xs">
              P
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500">Visual Page Builder</h4>
              <p className="text-xs text-slate-800 truncate max-w-[180px] font-semibold">{pageTitle || 'Halaman Baru'}</p>
            </div>
          </div>

          {/* Top Navigation tabs (Switch Style) */}
          <div className="bg-gray-200/70 p-1 rounded-xl flex items-center gap-0.5 select-none">
            <button
              type="button"
              onClick={() => setSidebarTab('content')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                sidebarTab === 'content' 
                  ? 'bg-white text-slate-800 shadow-sm font-semibold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Layout
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab('settings')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                sidebarTab === 'settings' 
                  ? 'bg-white text-slate-800 shadow-sm font-semibold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Setelan
            </button>
          </div>
        </div>

        {/* Sidebar Scrollable Editor Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          
          {/* TAB 1: SETTINGS TAB */}
          {sidebarTab === 'settings' && (
            <div className="space-y-4">
              <h5 className="text-xs font-semibold text-gray-600 pb-2 border-b border-gray-200 flex items-center gap-1.5">
                <Settings size={14} />
                <span>Pengaturan Halaman</span>
              </h5>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Judul Halaman</label>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="Contoh: Panduan Kreator"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug URL (/p/your-slug)</label>
                <input
                  type="text"
                  value={pageSlug}
                  onChange={(e) => setPageSlug(e.target.value)}
                  placeholder="contoh: panduan-kreator"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="sidebar-published"
                  checked={pagePublished}
                  onChange={(e) => setPagePublished(e.target.checked)}
                  className="w-4.5 h-4.5 text-[#F26522] focus:ring-[#F26522] border-gray-300 rounded cursor-pointer accent-[#F26522]"
                />
                <label htmlFor="sidebar-published" className="text-xs font-medium text-gray-700 cursor-pointer select-none">
                  Terbitkan Halaman (Public)
                </label>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="sidebar-userootpath"
                  checked={pageUseRootPath}
                  onChange={(e) => setPageUseRootPath(e.target.checked)}
                  className="w-4.5 h-4.5 text-[#F26522] focus:ring-[#F26522] border-gray-300 rounded cursor-pointer accent-[#F26522]"
                />
                <label htmlFor="sidebar-userootpath" className="text-xs font-medium text-gray-700 cursor-pointer select-none">
                  Gunakan Root Link (pks.art/slug)
                </label>
              </div>

              <div className="bg-orange-50/40 p-3 rounded-xl border border-orange-100/60 text-[11px] text-gray-500 space-y-1">
                <div className="flex items-center gap-1 text-gray-700 font-medium mb-1">
                  <Info size={12} className="text-[#F26522]" />
                  <span>Aturan Slug Halaman:</span>
                </div>
                <p>Slug hanya menggunakan huruf kecil, angka, dan tanda hubung (-).</p>
                <p>Contoh: <strong className="font-semibold">tentang-pksart</strong></p>
              </div>
            </div>
          )}

          {/* TAB 2: CONTENT & WIDGET BUILDER TAB */}
          {sidebarTab === 'content' && (
            <>
              {selectedBlockIndex === null ? (
                // SHOW WIDGET DRAWER PANEL
                <div className="space-y-5">
                  <h5 className="text-xs font-semibold text-gray-600 pb-2 border-b border-gray-200 flex items-center gap-1.5">
                    <PlusCircle size={14} />
                    <span>Widget Elemen (Elementor)</span>
                  </h5>

                  {/* Elements toolbox grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => addBlock('hero')}
                      className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-orange-50/20 border border-gray-200 hover:border-[#F26522] rounded-2xl transition-all group text-center"
                    >
                      <Sparkles className="text-purple-500 group-hover:scale-110 transition-transform mb-2" size={24} />
                      <span className="text-xs font-extrabold block text-gray-700">Hero Header</span>
                      <span className="text-[9px] text-gray-450 mt-0.5">Headline & CTA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => addBlock('text')}
                      className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-orange-50/20 border border-gray-200 hover:border-[#F26522] rounded-2xl transition-all group text-center"
                    >
                      <AlignLeft className="text-sky-500 group-hover:scale-110 transition-transform mb-2" size={24} />
                      <span className="text-xs font-extrabold block text-gray-700">Teks HTML</span>
                      <span className="text-[9px] text-gray-450 mt-0.5">Konten paragraf</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => addBlock('cta')}
                      className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-orange-50/20 border border-gray-200 hover:border-[#F26522] rounded-2xl transition-all group text-center"
                    >
                      <Megaphone className="text-amber-500 group-hover:scale-110 transition-transform mb-2" size={24} />
                      <span className="text-xs font-extrabold block text-gray-700">CTA Banner</span>
                      <span className="text-[9px] text-gray-450 mt-0.5">Tombol aksi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => addBlock('faq')}
                      className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-orange-50/20 border border-gray-200 hover:border-[#F26522] rounded-2xl transition-all group text-center"
                    >
                      <HelpCircle className="text-emerald-500 group-hover:scale-110 transition-transform mb-2" size={24} />
                      <span className="text-xs font-extrabold block text-gray-700">FAQ List</span>
                      <span className="text-[9px] text-gray-450 mt-0.5">Tanya-Jawab</span>
                    </button>
                  </div>
                </div>
              ) : (
                // SHOW ACTIVE BLOCK EDITOR PANEL (SETTINGS FOR SELECTED BLOCK)
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setSelectedBlockIndex(null)}
                    className="inline-flex items-center gap-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-all border border-gray-150"
                  >
                    <ChevronLeft size={14} />
                    <span>Kembali ke Widget</span>
                  </button>

                  <div className="border-t border-gray-100 pt-3">
                    <h5 className="text-xs font-black uppercase text-gray-455 tracking-wider mb-3 flex items-center justify-between">
                      <span>Konfigurasi: {blocks[selectedBlockIndex].type}</span>
                      <span className="text-[10px] bg-[#F26522] text-white px-2 py-0.5 rounded">
                        Blok {selectedBlockIndex + 1}
                      </span>
                    </h5>

                    {/* RENDER FORM FIELDS DEPENDING ON SELECTED BLOCK */}
                    {blocks[selectedBlockIndex].type === 'hero' && (
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] font-black text-gray-455 uppercase mb-1">Headline Utama</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].title || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'title', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-455 uppercase mb-1">Sub-Headline</label>
                          <textarea
                            value={blocks[selectedBlockIndex].subtitle || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'subtitle', e.target.value)}
                            rows={3}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-455 uppercase mb-1">Teks Tombol CTA</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].ctaText || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'ctaText', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-455 uppercase mb-1">Link Tombol CTA</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].ctaLink || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'ctaLink', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                      </div>
                    )}

                    {blocks[selectedBlockIndex].type === 'text' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-black text-gray-455 uppercase">Konten Teks</label>
                          
                          {/* Visual vs Code Tab Selector */}
                          <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 select-none">
                            <button
                              type="button"
                              onClick={() => setTextEditorTab('visual')}
                              className={`px-2.5 py-1 text-[9px] font-extrabold rounded transition-all ${
                                textEditorTab === 'visual'
                                  ? 'bg-white text-slate-800 shadow-sm'
                                  : 'text-slate-500 hover:text-slate-850'
                              }`}
                            >
                              Visual
                            </button>
                            <button
                              type="button"
                              onClick={() => setTextEditorTab('code')}
                              className={`px-2.5 py-1 text-[9px] font-extrabold rounded transition-all ${
                                textEditorTab === 'code'
                                  ? 'bg-white text-slate-800 shadow-sm'
                                  : 'text-slate-500 hover:text-slate-850'
                              }`}
                            >
                              HTML / Code
                            </button>
                          </div>
                        </div>

                        {/* Shared Editor Formatting Toolbar */}
                        <div className="bg-gray-100 border border-gray-200 p-1.5 rounded-t-2xl flex flex-wrap gap-1 items-center select-none">
                          <button
                            type="button"
                            onClick={() => handleFormat('bold')}
                            className="p-1.5 hover:bg-gray-250 rounded text-gray-700 hover:text-black transition-colors"
                            title="Tebal (Bold)"
                          >
                            <Bold size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFormat('italic')}
                            className="p-1.5 hover:bg-gray-250 rounded text-gray-700 hover:text-black transition-colors"
                            title="Miring (Italic)"
                          >
                            <Italic size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFormat('underline')}
                            className="p-1.5 hover:bg-gray-250 rounded text-gray-700 hover:text-black transition-colors"
                            title="Garis Bawah (Underline)"
                          >
                            <Underline size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFormat('strikeThrough')}
                            className="p-1.5 hover:bg-gray-250 rounded text-gray-700 hover:text-black transition-colors"
                            title="Coret (Strikethrough)"
                          >
                            <Strikethrough size={14} />
                          </button>

                          <div className="w-px h-4 bg-gray-300 mx-1" />

                          <button
                            type="button"
                            onClick={() => handleFormat('justifyLeft')}
                            className="p-1.5 hover:bg-gray-255 rounded text-gray-700 hover:text-black transition-colors"
                            title="Rata Kiri"
                          >
                            <AlignLeft size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFormat('justifyCenter')}
                            className="p-1.5 hover:bg-gray-255 rounded text-gray-700 hover:text-black transition-colors"
                            title="Rata Tengah"
                          >
                            <AlignCenter size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFormat('justifyRight')}
                            className="p-1.5 hover:bg-gray-255 rounded text-gray-700 hover:text-black transition-colors"
                            title="Rata Kanan"
                          >
                            <AlignRight size={14} />
                          </button>

                          <div className="w-px h-4 bg-gray-300 mx-1" />

                          {/* Font Size Select Dropdown */}
                          <div className="relative group/size">
                            <button
                              type="button"
                              className="p-1.5 hover:bg-gray-255 rounded text-gray-700 hover:text-black transition-colors flex items-center gap-1 text-[10px] font-bold"
                              title="Ukuran Font"
                            >
                              <Type size={14} />
                              <span>Ukuran</span>
                            </button>
                            <div className="absolute left-0 top-full hidden group-hover/size:block bg-white border border-gray-200 rounded-xl shadow-lg p-1 z-40 w-28 space-y-0.5 animate-fadeIn">
                              <button
                                type="button"
                                onClick={() => handleFormat(textEditorTab === 'code' ? 'fontSizeXS' : 'fontSize', '1')}
                                className="w-full text-left px-2 py-1 hover:bg-gray-50 text-[10px] rounded text-gray-700 font-semibold"
                              >
                                Sangat Kecil
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFormat(textEditorTab === 'code' ? 'fontSizeSM' : 'fontSize', '2')}
                                className="w-full text-left px-2 py-1 hover:bg-gray-50 text-[11px] rounded text-gray-700 font-semibold"
                              >
                                Kecil
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFormat(textEditorTab === 'code' ? 'fontSizeLG' : 'fontSize', '4')}
                                className="w-full text-left px-2 py-1 hover:bg-gray-50 text-sm rounded text-gray-700 font-semibold"
                              >
                                Besar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFormat(textEditorTab === 'code' ? 'fontSizeXL' : 'fontSize', '5')}
                                className="w-full text-left px-2 py-1 hover:bg-gray-50 text-base rounded text-gray-700 font-bold"
                              >
                                Ekstra Besar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFormat(textEditorTab === 'code' ? 'fontSize2XL' : 'fontSize', '6')}
                                className="w-full text-left px-2 py-1 hover:bg-gray-50 text-lg rounded text-gray-700 font-extrabold"
                              >
                                Super Besar
                              </button>
                            </div>
                          </div>
                        </div>

                        {textEditorTab === 'visual' ? (
                          /* 🖥️ VISUAL / EDITABLE WYSIWYG LIVE PREVIEW MODE */
                          <div className="space-y-2">
                            <div
                              id="visual-editor"
                              contentEditable
                              suppressContentEditableWarning
                              onInput={(e) => {
                                updateBlockField(selectedBlockIndex, 'content', e.currentTarget.innerHTML);
                              }}
                              onBlur={(e) => {
                                updateBlockField(selectedBlockIndex, 'content', e.currentTarget.innerHTML);
                              }}
                              dangerouslySetInnerHTML={{ __html: blocks[selectedBlockIndex].content || '' }}
                              className="bg-white border border-gray-200 border-t-0 rounded-b-2xl p-4 min-h-[300px] max-h-[360px] overflow-y-auto shadow-inner prose prose-slate max-w-none text-xs text-slate-805 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                            />
                            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[10px] text-slate-550 flex items-start gap-1.5 leading-relaxed">
                              <Info size={12} className="text-blue-500 mt-0.5 shrink-0" />
                              <span>Tab **Visual** ini adalah WYSIWYG editor langsung. Anda bisa mengetik dan memformat secara instan tanpa tag HTML sama sekali!</span>
                            </div>
                          </div>
                        ) : (
                          /* 📝 HTML & CODE EDITOR WORKSPACE MODE */
                          <div className="space-y-2">
                            <textarea
                              id="markdown-editor"
                              value={blocks[selectedBlockIndex].content || ''}
                              onChange={(e) => updateBlockField(selectedBlockIndex, 'content', e.target.value)}
                              rows={12}
                              placeholder="# Judul Utama&#10;## Subjudul Halaman&#10;&#10;Tulis paragraf teks di sini. Pisahkan paragraf dengan menekan tombol Enter dua kali.&#10;&#10;Gunakan toolbar di atas atau **tebal** untuk teks tebal, [u]garis bawah[/u], [s]coret[/s], [align=center]tengah[/align], atau [size=lg]ukuran besar[/size]."
                              className="w-full bg-gray-50 border border-gray-200 border-t-0 rounded-b-2xl p-3 text-xs text-gray-805 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                            />
                            <p className="text-[9px] text-gray-400">Tulis HTML kustom atau format markdown sederhana di atas.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {blocks[selectedBlockIndex].type === 'cta' && (
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] font-black text-gray-455 uppercase mb-1">Judul Banner</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].title || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'title', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-455 uppercase mb-1">Pesan Deskripsi</label>
                          <textarea
                            value={blocks[selectedBlockIndex].description || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'description', e.target.value)}
                            rows={3}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-455 uppercase mb-1">Teks Tombol</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].ctaText || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'ctaText', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-455 uppercase mb-1">Link Tombol</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].ctaLink || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'ctaLink', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                      </div>
                    )}

                    {blocks[selectedBlockIndex].type === 'faq' && (
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-gray-455 uppercase">Daftar Tanya Jawab FAQ</label>
                        
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {(blocks[selectedBlockIndex].faqs || []).map((faq, fIdx) => (
                            <div key={fIdx} className="bg-gray-50 p-2.5 rounded-xl border border-gray-150 flex items-start justify-between gap-3 text-xs">
                              <div>
                                <p className="font-bold text-gray-800">Q: {faq.question}</p>
                                <p className="text-gray-500 mt-0.5">A: {faq.answer}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFaqItem(selectedBlockIndex, fIdx)}
                                className="text-red-500 hover:text-red-655"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="border border-gray-200 p-3 rounded-xl bg-gray-50 space-y-2">
                          <p className="text-[9px] font-black uppercase text-[#F26522]">Tambah FAQ Baru:</p>
                          <input
                            type="text"
                            value={tempFaqQ}
                            onChange={(e) => setTempFaqQ(e.target.value)}
                            placeholder="Pertanyaan?"
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900"
                          />
                          <input
                            type="text"
                            value={tempFaqA}
                            onChange={(e) => setTempFaqA(e.target.value)}
                            placeholder="Jawaban..."
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900"
                          />
                          <button
                            type="button"
                            onClick={() => addFaqItem(selectedBlockIndex)}
                            className="w-full py-1.5 bg-[#F26522] text-white text-[10px] font-bold rounded-lg"
                          >
                            + Tambah Item
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Selected Block Action Controls */}
                    <div className="border-t border-gray-100 mt-4 pt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => deleteBlock(selectedBlockIndex, e)}
                        className="flex-1 py-2 bg-red-55 hover:bg-red-100 text-red-650 border border-red-200 text-xs font-bold rounded-xl text-center transition-colors"
                      >
                        Hapus Blok
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Sidebar Bottom Action Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
          <button
            type="button"
            onClick={() => router.push('/admin/pages')}
            className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-750 text-xs font-bold rounded-xl transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSavePage}
            className="flex-1 py-2.5 bg-[#F26522] hover:bg-[#d85417] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Save size={14} />
            <span>Simpan Halaman</span>
          </button>
        </div>
      </div>

      {/* ================= RIGHT CANVAS PREVIEW (LIVE PREVIEW AREA) ================= */}
      <div className="flex-1 bg-gray-100 overflow-y-auto p-4 sm:p-8 flex justify-center items-start h-1/2 md:h-full">
        <div className="w-full max-w-3xl bg-white min-h-full rounded-2xl shadow-2xl overflow-hidden flex flex-col relative border border-slate-600/40">
          
          {/* Simulated Browser Address Bar */}
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-3 select-none text-slate-400">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="bg-white rounded-lg px-3 py-1 flex-1 text-[11px] font-semibold flex items-center justify-between border border-gray-200 shadow-inner">
              <span className="text-slate-500 truncate">localhost:3000{pageUseRootPath ? '' : '/p'}/{pageSlug || 'your-slug'}</span>
              <Eye size={12} className="text-slate-400" />
            </div>
            <span className="text-[10px] font-extrabold uppercase text-[#F26522] bg-orange-50 border border-orange-100 px-2 py-0.5 rounded shadow-sm">
              LIVE PREVIEW
            </span>
          </div>

          {/* LIVE BUILDER CANVAS */}
          <div className="flex-1 p-6 space-y-8 select-none">
            
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                <Layout size={40} className="mb-2 stroke-1" />
                <p className="text-xs font-bold">Canvas Halaman Kosong</p>
                <p className="text-[10px] mt-0.5">Pilih widget di panel kiri untuk mulai membangun layout halaman.</p>
              </div>
            ) : (
              blocks.map((block, idx) => {
                const isSelected = selectedBlockIndex === idx;

                return (
                  <div
                    key={block.id}
                    ref={(el) => { canvasBlockRefs.current[idx] = el; }}
                    onClick={() => setSelectedBlockIndex(idx)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`group relative rounded-2xl cursor-grab active:cursor-grabbing select-none ${
                      isSelected 
                        ? 'ring-2 ring-blue-500 ring-offset-4 shadow-md' 
                        : 'hover:ring-2 hover:ring-blue-400 hover:ring-offset-4'
                    } ${draggedIndex === idx ? 'opacity-40 scale-[0.97]' : ''}`}
                  >
                    {/* Hover/Selection Floating Label */}
                    <div className="absolute -top-3 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded shadow flex items-center gap-1.5">
                      <span>Blok {idx + 1}: {block.type}</span>
                    </div>

                    {/* RENDER CONTENT BLOCKS */}
                    
                    {/* 1. HERO BLOCK */}
                    {block.type === 'hero' && (
                      <div className="bg-gradient-to-br from-[#1E293B] via-slate-900 to-black text-white p-6 sm:p-10 rounded-2xl shadow-md relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-[#F26522]/10 rounded-full blur-2xl" />
                        <div className="relative z-10 space-y-2">
                          <h3 className="text-xl sm:text-2xl font-black leading-tight">{block.title || 'Judul Hero'}</h3>
                          <p className="text-xs text-slate-350 leading-relaxed">{block.subtitle || 'Sub-headline deskripsi.'}</p>
                          {block.ctaText && (
                            <span className="inline-block mt-2 px-4 py-2 bg-[#F26522] text-white text-[10px] font-bold rounded-lg shadow-sm">
                              {block.ctaText}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 2. TEXT BLOCK */}
                    {block.type === 'text' && (
                      <div 
                        className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 text-gray-700 leading-relaxed text-xs sm:text-sm prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(block.content || '') }}
                      />
                    )}

                    {/* 3. CTA BANNER */}
                    {block.type === 'cta' && (
                      <div className="bg-[#F26522]/5 border border-[#F26522]/20 rounded-2xl p-5 sm:p-6 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-extrabold text-gray-900">{block.title || 'Banner CTA'}</h4>
                          <p className="text-[10px] text-gray-500 leading-relaxed">{block.description || 'Pesan ajakan aksi.'}</p>
                        </div>
                        {block.ctaText && (
                          <span className="px-4 py-2 bg-black text-white text-[10px] font-bold rounded-lg shrink-0">
                            {block.ctaText}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 4. FAQ ACCORDION */}
                    {block.type === 'faq' && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-extrabold text-gray-900 flex items-center gap-1 px-1">
                          <HelpCircle size={14} className="text-[#F26522]" />
                          <span>Tanya Jawab (FAQ)</span>
                        </h4>
                        <div className="space-y-1.5">
                          {(block.faqs || []).map((faq, fIdx) => (
                            <div key={fIdx} className="bg-white border border-gray-100 rounded-xl p-3 text-xs space-y-1">
                              <p className="font-bold text-gray-800">Q: {faq.question}</p>
                              <p className="text-gray-500">A: {faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })
            )}

          </div>
          
        </div>
      </div>

      {/* ================= RIGHT SIDEBAR (ELEMENTOR NAVIGATOR) ================= */}
      <div className="w-72 bg-white border-l border-gray-200 shrink-0 flex flex-col h-1/2 md:h-full shadow-2xl z-30 select-none">
        {/* Navigator Header */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layout size={16} className="text-gray-400" />
            <h5 className="text-xs font-semibold text-gray-600">Navigator Struktur</h5>
          </div>
        </div>

        {/* Draggable Navigator List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {blocks.length === 0 ? (
            <p className="text-xs text-gray-500 italic text-center py-10">Struktur halaman kosong.</p>
          ) : (
            <div className="space-y-2">
              {blocks.map((b, idx) => {
                const isSelected = selectedBlockIndex === idx;
                return (
                  <div
                    key={b.id}
                    ref={(el) => { navBlockRefs.current[idx] = el; }}
                    onClick={() => setSelectedBlockIndex(idx)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`p-3 rounded-xl border cursor-grab active:cursor-grabbing flex items-center justify-between text-xs font-medium select-none ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-300 text-blue-700 shadow-sm font-semibold'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                    } ${draggedIndex === idx ? 'opacity-40 scale-[0.97]' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-gray-400">#{idx + 1}</span>
                      <span className="capitalize">{b.type === 'hero' ? 'Hero Header' : b.type === 'text' ? 'Teks HTML' : b.type === 'cta' ? 'CTA Banner' : 'FAQ Accordion'}</span>
                    </div>
                    <span className="text-[10px] font-medium text-gray-500 bg-gray-200/50 px-1.5 py-0.5 rounded capitalize">
                      {b.type}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
