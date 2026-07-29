'use client';

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Layout,
  PlusCircle,
  Plus,
  Heading,
  HelpCircle,
  Images,
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
  Type,
  Image as ImageIcon,
  Quote,
  Minus,
  List,
  ListOrdered,
  Upload,
  Folder,
  Check,
  Trash2,
  Link as LinkIcon,
  Unlink
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
  type: 'hero' | 'text' | 'cta' | 'faq' | 'image' | 'quote' | 'separator' | 'heading' | 'gallery';
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
}

const ContentEditableEditor = React.memo(({ id, value, onChange, className }: { id: string, value: string, onChange: (val: string) => void, className: string }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // We must track the latest onChange callback without causing re-renders
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChangeRef.current(e.currentTarget.innerHTML);
  };

  return (
    <div
      id={id}
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleInput}
      className={className}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}, (prevProps, nextProps) => {
  // shouldComponentUpdate equivalent
  const el = document.getElementById(nextProps.id);
  // If the DOM exists and the new value is the same as what's currently in the DOM,
  // we do NOT need to re-render. This prevents the cursor from jumping!
  if (el && nextProps.value === el.innerHTML) {
    return true; // Skip re-render
  }
  // Otherwise, if value changed externally or DOM doesn't match, we MUST re-render
  return prevProps.value === nextProps.value && prevProps.className === nextProps.className;
});

let blockIdCounter = 0;
const genBlockId = () => `blk_${Date.now()}_${++blockIdCounter}`;

export default function AdminPageWorkspace() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { customPages, addCustomPage, updateCustomPage, artworks } = useData();

  // Editor states
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pagePublished, setPagePublished] = useState(true);
  const [pageUseRootPath, setPageUseRootPath] = useState(false);
  const [pageWidth, setPageWidth] = useState<'70' | 'full'>('70');
  const [containerStyle, setContainerStyle] = useState<'boxed' | 'clean'>('boxed');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);

  // Link Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  // Media Explorer Modal State
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'mainImage' | 'gallery'>('mainImage');
  const [mediaTab, setMediaTab] = useState<'library' | 'upload'>('library');
  const [searchMedia, setSearchMedia] = useState('');
  const [customMediaList, setCustomMediaList] = useState<string[]>([
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550684848-bac1c5b4e853?w=800&auto=format&fit=crop&q=80',
  ]);

  // Drag states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
  const [draggingNewWidget, setDraggingNewWidget] = useState<string | null>(null);
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
  const [textEditorTab, setTextEditorTab] = useState<'visual' | 'code'>('visual');

  // Load target page data or new template
  useEffect(() => {
    if (!id) return;
    
    if (id === 'new') {
      setPageTitle('Halaman Baru');
      setPageSlug('halaman-baru');
      setPagePublished(true);
      setPageUseRootPath(false);
      setPageWidth('70');
      setContainerStyle('boxed');
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
          const parsed = JSON.parse(page.content);
          if (Array.isArray(parsed)) {
            setBlocks(parsed.map(b => ({ ...b, id: b.id || genBlockId() })));
            setPageWidth('70');
            setContainerStyle('boxed');
          } else if (parsed && typeof parsed === 'object') {
            const bList = parsed.blocks || [];
            setBlocks(bList.map((b: any) => ({ ...b, id: b.id || genBlockId() })));
            setPageWidth(parsed.pageWidth || '70');
            setContainerStyle(parsed.containerStyle || 'boxed');
          }
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
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const textarea = document.getElementById(isMobile ? 'markdown-editor-mobile' : 'markdown-editor') as HTMLTextAreaElement;
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
        insertUnorderedList: ['- ', ''],
        insertOrderedList: ['1. ', ''],
        justifyLeft: ['[align=left]', '[/align]'],
        justifyCenter: ['[align=center]', '[/align]'],
        justifyRight: ['[align=right]', '[/align]'],
        fontSizeXS: ['[size=xs]', '[/size]'],
        fontSizeSM: ['[size=sm]', '[/size]'],
        fontSizeLG: ['[size=lg]', '[/size]'],
        fontSizeXL: ['[size=xl]', '[/size]'],
        fontSize2XL: ['[size=2xl]', '[/size]'],
      };
      if (command === 'createLink') {
        const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
        if (!textarea) return;
        setSavedRange(null);
        setLinkUrl('https://');
        setShowLinkModal(true);
        return;
      }
      if (command === 'unlink') return; // unlink in code mode is done manually
      
      const format = formats[command] || ['', ''];
      insertFormatting(format[0], format[1]);
    } else {
      if (command === 'createLink') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          setSavedRange(selection.getRangeAt(0));
        }
        setLinkUrl('https://');
        setShowLinkModal(true);
        return;
      } else if (command === 'unlink') {
        document.execCommand(command, false, '');
      } else {
        document.execCommand(command, false, value);
      }
      
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const visualEditor = document.getElementById(isMobile ? 'visual-editor-mobile' : 'visual-editor');
      if (visualEditor) {
        updateBlockField(selectedBlockIndex, 'content', visualEditor.innerHTML);
      }
    }
  };

  const confirmLink = () => {
    if (!linkUrl) {
      setShowLinkModal(false);
      return;
    }
    
    if (textEditorTab === 'code') {
      insertFormatting(`<a href="${linkUrl}" class="text-[#F26522] underline hover:text-orange-700">`, '</a>');
    } else {
      const selection = window.getSelection();
      if (selection && savedRange) {
        selection.removeAllRanges();
        selection.addRange(savedRange);
      }
      document.execCommand('createLink', false, linkUrl);
      
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const visualEditor = document.getElementById(isMobile ? 'visual-editor-mobile' : 'visual-editor');
      if (visualEditor && selectedBlockIndex !== null) {
        updateBlockField(selectedBlockIndex, 'content', visualEditor.innerHTML);
      }
    }
    
    setShowLinkModal(false);
    setLinkUrl('');
    setSavedRange(null);
  };

  const [isNavMinimized, setIsNavMinimized] = useState(false);

  // Mobile bottom sheet state
  const [mobileSheet, setMobileSheet] = useState<'closed' | 'widgets' | 'settings' | 'blockEdit'>('closed');

  const addBlock = (
    type: 'hero' | 'text' | 'cta' | 'faq' | 'image' | 'quote' | 'separator' | 'heading' | 'gallery',
    atIndex?: number
  ) => {
    const id = genBlockId();
    let newBlock: Block;
    if (type === 'heading') {
      newBlock = { 
        id, 
        type, 
        title: 'Judul Section / Halaman Baru', 
        subtitle: 'Sub-judul pendukung (opsional)', 
        titleSize: 'h2', 
        titleAlign: 'left' 
      };
    } else if (type === 'hero') {
      newBlock = { id, type, title: 'Judul Hero Baru', subtitle: 'Deskripsi singkat hero block.', ctaText: 'Klik Di Sini', ctaLink: '#', fullWidth: false };
    } else if (type === 'text') {
      newBlock = { id, type, content: '<h3 class="text-lg font-bold mb-2">Subjudul Teks</h3><p>Tulis konten teks kustom Anda di sini menggunakan format HTML standar...</p>' };
    } else if (type === 'cta') {
      newBlock = { id, type, title: 'Banner Aksi Kustom', description: 'Deskripsi singkat untuk mengajak pembaca melakukan aksi tertentu.', ctaText: 'Klik Aksi', ctaLink: '#' };
    } else if (type === 'faq') {
      newBlock = { id, type, faqs: [{ question: 'Pertanyaan FAQ Baru?', answer: 'Tulis jawaban detail di sini.' }] };
    } else if (type === 'gallery') {
      newBlock = { id, type, galleryImages: [], galleryCols: 3 };
    } else if (type === 'image') {
      newBlock = { 
        id, 
        type, 
        imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80', 
        imageAlt: 'Deskripsi Gambar',
        imageSize: 'full',
        imageAlign: 'center',
        imageLink: '' 
      };
    } else if (type === 'quote') {
      newBlock = { id, type, quoteText: 'Kreativitas adalah kecerdasan yang bersenang-senang.', quoteAuthor: 'Albert Einstein' };
    } else {
      newBlock = { id, type };
    }
    
    if (typeof atIndex === 'number' && atIndex >= 0 && atIndex <= blocks.length) {
      const newBlocks = [...blocks];
      newBlocks.splice(atIndex, 0, newBlock);
      setBlocks(newBlocks);
      setSelectedBlockIndex(atIndex);
    } else {
      setBlocks([...blocks, newBlock]);
      setSelectedBlockIndex(blocks.length);
    }
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
      content: JSON.stringify({
        blocks: blocks.map(b => ({ ...b, id: b.id || genBlockId() })),
        pageWidth: pageWidth,
        containerStyle: containerStyle,
      }),
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

      {/* ================= MOBILE STICKY TOP BAR (md:hidden) ================= */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 py-2.5 flex items-center justify-between shadow-sm">
        <button
          type="button"
          onClick={() => router.push('/admin/pages')}
          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h4 className="text-xs font-bold text-gray-800 truncate max-w-[45%]">
          {pageTitle || 'Halaman Baru'}
        </h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMobileSheet(mobileSheet === 'settings' ? 'closed' : 'settings')}
            className={`p-2 rounded-lg transition-colors ${
              mobileSheet === 'settings'
                ? 'bg-[#F26522]/10 text-[#F26522]'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <Settings size={18} />
          </button>
          <button
            type="button"
            onClick={handleSavePage}
            className="px-3 py-1.5 bg-[#F26522] hover:bg-[#d85417] text-white text-[11px] font-bold rounded-lg shadow-sm transition-all flex items-center gap-1"
          >
            <Save size={13} />
            <span>Simpan</span>
          </button>
        </div>
      </div>

      {/* ================= LEFT SIDEBAR (ELEMENTOR PANEL) — Desktop Only ================= */}
      <div className="hidden md:flex w-96 bg-white text-slate-700 flex-col border-r border-gray-200/65 shrink-0 h-full shadow-2xl z-30">
        
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
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Slug URL ({pageUseRootPath ? `pks.art/${pageSlug || 'your-slug'}` : `pks.art/p/${pageSlug || 'your-slug'}`})
                </label>
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

              {/* Lebar Tampilan Halaman */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Lebar Tampilan Halaman (Page Width)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPageWidth('70')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      pageWidth === '70'
                        ? 'bg-orange-50 border-[#F26522] text-[#F26522] font-semibold shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Standar (70%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageWidth('full')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      pageWidth === 'full'
                        ? 'bg-orange-50 border-[#F26522] text-[#F26522] font-semibold shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Full Width (100%)
                  </button>
                </div>
              </div>

              {/* Gaya Kontainer Blok (Disable Background) */}
              <div className="pt-1">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Gaya Kontainer Blok</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="radio"
                      name="containerStyle"
                      checked={containerStyle === 'boxed'}
                      onChange={() => setContainerStyle('boxed')}
                      className="text-[#F26522] focus:ring-[#F26522] accent-[#F26522]"
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Boxed Container</p>
                      <p className="text-[10px] text-gray-500">Blok dalam kartu berbingkai rounded & shadow</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-2.5 p-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="radio"
                      name="containerStyle"
                      checked={containerStyle === 'clean'}
                      onChange={() => setContainerStyle('clean')}
                      className="text-[#F26522] focus:ring-[#F26522] accent-[#F26522]"
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Transparan / Clean (Tanpa Kontainer)</p>
                      <p className="text-[10px] text-gray-500">Nonaktifkan background kartu rounded pada semua blok</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-orange-50/40 p-3 rounded-xl border border-orange-100/60 text-[11px] text-gray-500 space-y-1 mt-2">
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
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-500 italic">Klik (+), klik kartu, atau tarik (drag) widget langsung ke posisi canvas:</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { type: 'heading', title: 'Judul (Title)', desc: 'Section Heading', icon: Heading, color: 'text-orange-500' },
                        { type: 'hero', title: 'Hero Header', desc: 'Headline & CTA', icon: Sparkles, color: 'text-purple-500' },
                        { type: 'text', title: 'Teks HTML', desc: 'Konten paragraf', icon: AlignLeft, color: 'text-sky-500' },
                        { type: 'cta', title: 'CTA Banner', desc: 'Tombol aksi', icon: Megaphone, color: 'text-amber-500' },
                        { type: 'faq', title: 'Accordion (FAQ)', desc: 'Tanya-Jawab', icon: HelpCircle, color: 'text-emerald-500' },
                        { type: 'gallery', title: 'Galeri', desc: 'Grid Gambar', icon: Images, color: 'text-fuchsia-500' },
                        { type: 'image', title: 'Gambar', desc: 'Media foto', icon: ImageIcon, color: 'text-emerald-600' },
                        { type: 'quote', title: 'Kutipan', desc: 'Quote & Sumber', icon: Quote, color: 'text-indigo-500' },
                        { type: 'separator', title: 'Pemisah', desc: 'Garis pembatas', icon: Minus, color: 'text-gray-500', full: true },
                      ].map((w) => {
                        const Icon = w.icon;
                        return (
                          <div
                            key={w.type}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('newWidgetType', w.type);
                              e.dataTransfer.effectAllowed = 'copy';
                              setDraggingNewWidget(w.type);
                            }}
                            onDragEnd={() => {
                              setDraggingNewWidget(null);
                              setDropIndicatorIndex(null);
                            }}
                            onClick={() => addBlock(w.type as any)}
                            className={`relative group flex flex-col items-center justify-center p-3.5 bg-gray-50 hover:bg-orange-50/30 border border-gray-200 hover:border-[#F26522] rounded-2xl cursor-grab active:cursor-grabbing transition-all text-center select-none shadow-2xs hover:shadow-sm ${
                              w.full ? 'col-span-2' : ''
                            }`}
                          >
                            {/* Plus (+) badge button in top-right corner */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addBlock(w.type as any);
                              }}
                              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white group-hover:bg-[#F26522] group-hover:text-white border border-gray-200 group-hover:border-[#F26522] text-gray-500 flex items-center justify-center transition-all shadow-2xs hover:scale-110 active:scale-95"
                              title={`Tambah widget ${w.title}`}
                            >
                              <Plus size={12} />
                            </button>

                            <Icon className={`${w.color} group-hover:scale-110 transition-transform mb-1.5`} size={22} />
                            <span className="text-xs font-semibold block text-gray-700">{w.title}</span>
                            <span className="text-[9px] text-gray-400 mt-0.5">{w.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                // SHOW ACTIVE BLOCK EDITOR PANEL (SETTINGS FOR SELECTED BLOCK)
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setSelectedBlockIndex(null)}
                    className="inline-flex items-center gap-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-all border border-gray-200"
                  >
                    <ChevronLeft size={14} />
                    <span>Kembali ke Widget</span>
                  </button>

                  <div className="border-t border-gray-100 pt-3">
                    <h5 className="text-xs font-semibold text-gray-600 mb-3 flex items-center justify-between">
                      <span>Konfigurasi: {blocks[selectedBlockIndex].type === 'cta' ? 'CTA' : blocks[selectedBlockIndex].type === 'faq' ? 'FAQ' : blocks[selectedBlockIndex].type.charAt(0).toUpperCase() + blocks[selectedBlockIndex].type.slice(1)}</span>
                      <span className="text-[10px] bg-[#F26522] text-white px-2 py-0.5 rounded font-medium">
                        Blok {selectedBlockIndex + 1}
                      </span>
                    </h5>

                    {/* RENDER FORM FIELDS DEPENDING ON SELECTED BLOCK */}
                    {blocks[selectedBlockIndex].type === 'heading' && (
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Teks Judul Utama</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].title || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'title', e.target.value)}
                            placeholder="Judul Section / Halaman..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Sub-judul Pendukung (Opsional)</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].subtitle || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'subtitle', e.target.value)}
                            placeholder="Deskripsi singkat di bawah judul..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Ukuran Font Judul</label>
                            <select
                              value={blocks[selectedBlockIndex].titleSize || 'h2'}
                              onChange={(e) => updateBlockField(selectedBlockIndex, 'titleSize', e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30 cursor-pointer"
                            >
                              <option value="h1">H1 (Sangat Besar - 36px)</option>
                              <option value="h2">H2 (Besar - 28px)</option>
                              <option value="h3">H3 (Sedang - 22px)</option>
                              <option value="h4">H4 (Kecil - 18px)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Posisi (Alignment)</label>
                            <select
                              value={blocks[selectedBlockIndex].titleAlign || 'left'}
                              onChange={(e) => updateBlockField(selectedBlockIndex, 'titleAlign', e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30 cursor-pointer"
                            >
                              <option value="left">Rata Kiri</option>
                              <option value="center">Rata Tengah</option>
                              <option value="right">Rata Kanan</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {blocks[selectedBlockIndex].type === 'hero' && (
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Headline Utama</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].title || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'title', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Sub-headline</label>
                          <textarea
                            value={blocks[selectedBlockIndex].subtitle || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'subtitle', e.target.value)}
                            rows={3}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Teks Tombol CTA</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].ctaText || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'ctaText', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Link Tombol CTA</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].ctaLink || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'ctaLink', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                        <div className="pt-1">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={blocks[selectedBlockIndex].fullWidth || false}
                              onChange={(e) => updateBlockField(selectedBlockIndex, 'fullWidth', e.target.checked)}
                              className="w-4 h-4 text-[#F26522] focus:ring-[#F26522] border-gray-300 rounded accent-[#F26522]"
                            />
                            <span className="text-xs font-medium text-gray-700">Tampilan Full Width (Lebar Penuh Canvas)</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {blocks[selectedBlockIndex].type === 'text' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-medium text-gray-600">Konten Teks</label>
                          
                          {/* Visual vs Code Tab Selector */}
                          <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 select-none">
                            <button
                              type="button"
                              onClick={() => setTextEditorTab('visual')}
                              className={`px-2.5 py-1 text-[10px] font-medium rounded transition-all ${
                                textEditorTab === 'visual'
                                  ? 'bg-white text-slate-800 shadow-sm font-semibold'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              Visual
                            </button>
                            <button
                              type="button"
                              onClick={() => setTextEditorTab('code')}
                              className={`px-2.5 py-1 text-[10px] font-medium rounded transition-all ${
                                textEditorTab === 'code'
                                  ? 'bg-white text-slate-800 shadow-sm font-semibold'
                                  : 'text-slate-500 hover:text-slate-800'
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
                            onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('bold')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                            title="Tebal (Bold)"
                          >
                            <Bold size={14} />
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('italic')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                            title="Miring (Italic)"
                          >
                            <Italic size={14} />
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('underline')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                            title="Garis Bawah (Underline)"
                          >
                            <Underline size={14} />
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('strikeThrough')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                            title="Coret (Strikethrough)"
                          >
                            <Strikethrough size={14} />
                          </button>

                          <div className="w-px h-4 bg-gray-300 mx-1" />

                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('insertUnorderedList')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                            title="Bullet List"
                          >
                            <List size={14} />
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('insertOrderedList')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                            title="Numbered List"
                          >
                            <ListOrdered size={14} />
                          </button>

                          <div className="w-px h-4 bg-gray-300 mx-1" />

                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('justifyLeft')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                            title="Rata Kiri"
                          >
                            <AlignLeft size={14} />
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('justifyCenter')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                            title="Rata Tengah"
                          >
                            <AlignCenter size={14} />
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('justifyRight')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                            title="Rata Kanan"
                          >
                            <AlignRight size={14} />
                          </button>

                          <div className="w-px h-4 bg-gray-300 mx-1" />

                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleFormat('createLink')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-blue-600 transition-colors"
                            title="Tambah Link"
                          >
                            <LinkIcon size={14} />
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleFormat('unlink')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-red-500 transition-colors"
                            title="Hapus Link"
                          >
                            <Unlink size={14} />
                          </button>

                          <div className="w-px h-4 bg-gray-300 mx-1" />

                          {/* Font Size Select Dropdown */}
                          <div className="relative group/size">
                            <button
                              type="button"
                              className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors flex items-center gap-1 text-[10px] font-medium"
                              title="Ukuran Font"
                            >
                              <Type size={14} />
                              <span>Ukuran</span>
                            </button>
                            <div className="absolute left-0 top-full hidden group-hover/size:block bg-white border border-gray-200 rounded-xl shadow-lg p-1 z-40 w-28 space-y-0.5 animate-fadeIn">
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat(textEditorTab === 'code' ? 'fontSizeXS' : 'fontSize', '1')}
                                className="w-full text-left px-2 py-1 hover:bg-gray-50 text-[10px] rounded text-gray-700 font-semibold"
                              >
                                Sangat Kecil
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat(textEditorTab === 'code' ? 'fontSizeSM' : 'fontSize', '2')}
                                className="w-full text-left px-2 py-1 hover:bg-gray-50 text-[11px] rounded text-gray-700 font-semibold"
                              >
                                Kecil
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat(textEditorTab === 'code' ? 'fontSizeLG' : 'fontSize', '4')}
                                className="w-full text-left px-2 py-1 hover:bg-gray-50 text-sm rounded text-gray-700 font-semibold"
                              >
                                Besar
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat(textEditorTab === 'code' ? 'fontSizeXL' : 'fontSize', '5')}
                                className="w-full text-left px-2 py-1 hover:bg-gray-50 text-base rounded text-gray-700 font-bold"
                              >
                                Ekstra Besar
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
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
                            <ContentEditableEditor
                              id="visual-editor"
                              value={blocks[selectedBlockIndex].content || ''}
                              onChange={(val) => updateBlockField(selectedBlockIndex, 'content', val)}
                              className="bg-white border border-gray-200 border-t-0 rounded-b-2xl p-4 min-h-[300px] max-h-[360px] overflow-y-auto shadow-inner prose prose-slate max-w-none text-xs text-slate-800 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
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
                              className="w-full bg-gray-50 border border-gray-200 border-t-0 rounded-b-2xl p-3 text-xs text-gray-800 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                            />
                            <p className="text-[9px] text-gray-400">Tulis HTML kustom atau format markdown sederhana di atas.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {blocks[selectedBlockIndex].type === 'cta' && (
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Judul Banner CTA</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].title || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'title', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Pesan Deskripsi</label>
                          <textarea
                            value={blocks[selectedBlockIndex].description || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'description', e.target.value)}
                            rows={3}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Teks Tombol CTA</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].ctaText || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'ctaText', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Link Tombol CTA</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].ctaLink || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'ctaLink', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                      </div>
                    )}

                    {blocks[selectedBlockIndex].type === 'faq' && (
                      <div className="space-y-4">
                        <label className="block text-xs font-medium text-gray-600">Daftar Tanya Jawab (FAQ)</label>
                        
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {(blocks[selectedBlockIndex].faqs || []).map((faq, fIdx) => (
                            <div key={fIdx} className="bg-gray-50 p-2.5 rounded-xl border border-gray-150 flex items-start justify-between gap-3 text-xs">
                              <div>
                                <p className="font-semibold text-gray-800">Q: {faq.question}</p>
                                <p className="text-gray-500 mt-0.5">A: {faq.answer}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFaqItem(selectedBlockIndex, fIdx)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="border border-gray-200 p-3 rounded-xl bg-gray-50 space-y-2">
                          <p className="text-xs font-semibold text-[#F26522]">Tambah FAQ Baru:</p>
                          <input
                            type="text"
                            value={tempFaqQ}
                            onChange={(e) => setTempFaqQ(e.target.value)}
                            placeholder="Pertanyaan?"
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 font-normal"
                          />
                          <input
                            type="text"
                            value={tempFaqA}
                            onChange={(e) => setTempFaqA(e.target.value)}
                            placeholder="Jawaban..."
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 font-normal"
                          />
                          <button
                            type="button"
                            onClick={() => addFaqItem(selectedBlockIndex)}
                            className="w-full py-1.5 bg-[#F26522] text-white text-xs font-medium rounded-lg"
                          >
                            + Tambah Item FAQ
                          </button>
                        </div>
                      </div>
                    )}

                    {blocks[selectedBlockIndex].type === 'image' && (
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Pilih / Upload Media Gambar</label>
                          
                          {blocks[selectedBlockIndex].imageUrl ? (
                            <div className="space-y-2">
                              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video group shadow-sm">
                                <img
                                  src={blocks[selectedBlockIndex].imageUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setShowMediaModal(true)}
                                    className="px-3 py-1.5 bg-white text-gray-900 text-xs font-semibold rounded-lg shadow hover:bg-gray-100 transition-colors flex items-center gap-1"
                                  >
                                    <Folder size={14} />
                                    <span>Ganti</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateBlockField(selectedBlockIndex, 'imageUrl', '')}
                                    className="p-1.5 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-colors"
                                    title="Hapus Gambar"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowMediaModal(true)}
                                className="w-full py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                              >
                                <Folder size={14} className="text-[#F26522]" />
                                <span>Buka Media Explorer / Upload File</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowMediaModal(true)}
                              className="w-full py-8 bg-gray-50 hover:bg-orange-50/20 border-2 border-dashed border-gray-300 hover:border-[#F26522] rounded-2xl text-center transition-all group flex flex-col items-center justify-center gap-2"
                            >
                              <div className="w-10 h-10 rounded-full bg-orange-100 text-[#F26522] flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ImageIcon size={20} />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-700">Pilih dari Media atau Upload File</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Klik untuk membuka Media Explorer & Upload</p>
                              </div>
                            </button>
                          )}
                        </div>

                        {/* Ukuran Gambar & Alignment Dropdowns */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Ukuran Tampilan</label>
                            <select
                              value={blocks[selectedBlockIndex].imageSize || 'full'}
                              onChange={(e) => updateBlockField(selectedBlockIndex, 'imageSize', e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30 cursor-pointer"
                            >
                              <option value="full">Penuh (100%)</option>
                              <option value="large">Besar (75%)</option>
                              <option value="medium">Sedang (50%)</option>
                              <option value="small">Kecil (25%)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Posisi (Alignment)</label>
                            <select
                              value={blocks[selectedBlockIndex].imageAlign || 'center'}
                              onChange={(e) => updateBlockField(selectedBlockIndex, 'imageAlign', e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30 cursor-pointer"
                            >
                              <option value="center">Rata Tengah</option>
                              <option value="left">Rata Kiri</option>
                              <option value="right">Rata Kanan</option>
                            </select>
                          </div>
                        </div>

                        {/* Tautan Link Gambar (Opsional) */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Tautan Link Gambar (Opsional)</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].imageLink || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'imageLink', e.target.value)}
                            placeholder="Contoh: https://pks.art atau /p/kontak"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Alt Teks / Deskripsi Gambar</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].imageAlt || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'imageAlt', e.target.value)}
                            placeholder="Deskripsi singkat gambar..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                      </div>
                    )}

                    {blocks[selectedBlockIndex].type === 'gallery' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah Kolom Tampilan</label>
                          <select
                            value={blocks[selectedBlockIndex].galleryCols || 3}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'galleryCols', parseInt(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30 cursor-pointer"
                          >
                            <option value={1}>1 Kolom</option>
                            <option value={2}>2 Kolom</option>
                            <option value={3}>3 Kolom</option>
                            <option value={4}>4 Kolom</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Gambar Galeri</label>
                          <div className="space-y-2">
                            {(blocks[selectedBlockIndex].galleryImages || []).map((imgUrl, imgIdx) => (
                              <div key={imgIdx} className="flex items-center gap-2 bg-gray-50 border border-gray-150 p-2 rounded-xl shadow-sm">
                                <img src={imgUrl} alt={`Gallery ${imgIdx}`} className="w-12 h-12 object-cover rounded-lg flex-shrink-0 border border-gray-200" />
                                <input 
                                  type="text" 
                                  value={imgUrl} 
                                  readOnly 
                                  className="w-full bg-transparent text-[10px] text-gray-500 outline-none truncate" 
                                />
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    const imgs = [...(blocks[selectedBlockIndex].galleryImages || [])];
                                    imgs.splice(imgIdx, 1);
                                    updateBlockField(selectedBlockIndex, 'galleryImages', imgs);
                                  }}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0 transition-colors"
                                  title="Hapus Gambar"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                            
                            <button
                              type="button"
                              onClick={() => {
                                setMediaTarget('gallery');
                                setShowMediaModal(true);
                              }}
                              className="w-full py-2.5 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-[#F26522]/30 text-gray-700 hover:text-[#F26522] text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
                            >
                              <Plus size={14} /> 
                              <span>Tambah dari Media Explorer</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {blocks[selectedBlockIndex].type === 'quote' && (
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Teks Kutipan (Quote)</label>
                          <textarea
                            value={blocks[selectedBlockIndex].quoteText || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'quoteText', e.target.value)}
                            rows={3}
                            placeholder="Tulis perkataan atau kutipan..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Penulis / Sumber Kutipan</label>
                          <input
                            type="text"
                            value={blocks[selectedBlockIndex].quoteAuthor || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'quoteAuthor', e.target.value)}
                            placeholder="Contoh: Albert Einstein"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                      </div>
                    )}

                    {blocks[selectedBlockIndex].type === 'separator' && (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-500 leading-relaxed text-center">
                        Pemisah horizontal bersih untuk memberi pembatas antar-blok di halaman.
                      </div>
                    )}

                    {/* Selected Block Action Controls */}
                    <div className="border-t border-gray-100 mt-4 pt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => deleteBlock(selectedBlockIndex, e)}
                        className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-medium rounded-xl text-center transition-colors"
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

        {/* Sidebar Bottom Action Buttons — Desktop Only */}
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

      {/* ================= CANVAS PREVIEW (LIVE PREVIEW AREA) ================= */}
      <div className="flex-1 bg-gray-100 overflow-y-auto p-4 sm:p-8 pt-16 md:pt-4 flex justify-center items-start h-full">
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
          <div 
            onDragOver={(e) => {
              e.preventDefault();
              if (draggingNewWidget) {
                e.dataTransfer.dropEffect = 'copy';
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              const newWidgetType = e.dataTransfer.getData('newWidgetType') || draggingNewWidget;
              if (newWidgetType) {
                const targetIdx = dropIndicatorIndex !== null ? dropIndicatorIndex : blocks.length;
                addBlock(newWidgetType as any, targetIdx);
                setDropIndicatorIndex(null);
                setDraggingNewWidget(null);
              }
            }}
            className="flex-1 p-6 space-y-8 select-none transition-all"
          >
            
            {blocks.length === 0 ? (
              <div 
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggingNewWidget) setDropIndicatorIndex(0);
                }}
                className={`flex flex-col items-center justify-center py-20 text-center text-slate-400 border-2 border-dashed rounded-3xl transition-colors ${
                  draggingNewWidget ? 'border-[#F26522] bg-orange-50/40 text-[#F26522]' : 'border-transparent'
                }`}
              >
                <Layout size={40} className="mb-2 stroke-1" />
                <p className="text-xs font-bold">Canvas Halaman Kosong</p>
                <p className="text-[10px] mt-0.5">Tarik (drag) widget di sini atau klik (+) untuk mulai membuat halaman.</p>
              </div>
            ) : (
              blocks.map((block, idx) => {
                const isSelected = selectedBlockIndex === idx;

                return (
                  <React.Fragment key={block.id}>
                    {/* Animated Drop Indicator Target Line */}
                    {dropIndicatorIndex === idx && draggingNewWidget && (
                      <div className="my-2 border-2 border-dashed border-[#F26522] bg-orange-50/80 rounded-2xl p-4 text-center text-xs font-bold text-[#F26522] animate-pulse flex items-center justify-center gap-2 shadow-xs">
                        <Plus size={16} />
                        <span>Lepas widget ({draggingNewWidget.toUpperCase()}) di sini</span>
                      </div>
                    )}

                    <div
                      ref={(el) => { canvasBlockRefs.current[idx] = el; }}
                      onClick={() => {
                        setSelectedBlockIndex(idx);
                        if (window.innerWidth < 768) {
                          setMobileSheet('blockEdit');
                        }
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => {
                        if (draggingNewWidget) {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'copy';
                          setDropIndicatorIndex(idx);
                        } else {
                          handleDragOver(e, idx);
                        }
                      }}
                      onDragEnd={() => {
                        handleDragEnd();
                        setDraggingNewWidget(null);
                        setDropIndicatorIndex(null);
                      }}
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
                      
                      {/* 0. HEADING BLOCK */}
                      {block.type === 'heading' && (
                        <div className={`p-4 text-${block.titleAlign || 'left'}`}>
                          {block.titleSize === 'h1' ? (
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                              {block.title || 'Judul Utama'}
                            </h1>
                          ) : block.titleSize === 'h3' ? (
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                              {block.title || 'Judul Section'}
                            </h3>
                          ) : block.titleSize === 'h4' ? (
                            <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                              {block.title || 'Judul Kecil'}
                            </h4>
                          ) : (
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                              {block.title || 'Judul Utama'}
                            </h2>
                          )}
                          {block.subtitle && (
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {block.subtitle}
                            </p>
                          )}
                        </div>
                      )}

                      {/* 1. HERO BLOCK */}
                      {block.type === 'hero' && (
                        <div className={`bg-gradient-to-br from-[#1E293B] via-slate-900 to-black text-white p-6 sm:p-10 shadow-md relative overflow-hidden transition-all ${block.fullWidth ? '-mx-6 -mt-6 -mb-2 rounded-none' : 'rounded-2xl'}`}>
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

                    {/* 5. IMAGE BLOCK */}
                    {block.type === 'image' && (
                      <div className={`py-1 flex ${
                        block.imageAlign === 'left' ? 'justify-start' : block.imageAlign === 'right' ? 'justify-end' : 'justify-center'
                      }`}>
                        <div className={`overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center transition-all ${
                          block.imageSize === 'small'
                            ? 'w-1/4 min-h-[100px]'
                            : block.imageSize === 'medium'
                            ? 'w-1/2 min-h-[140px]'
                            : block.imageSize === 'large'
                            ? 'w-3/4 min-h-[180px]'
                            : 'w-full min-h-[160px]'
                        }`}>
                          {block.imageUrl ? (
                            block.imageLink ? (
                              <div className="w-full relative group/imglink">
                                <img
                                  src={block.imageUrl}
                                  alt={block.imageAlt || 'Gambar'}
                                  className="w-full h-auto object-cover max-h-[480px] rounded-2xl"
                                />
                                <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[9px] px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1 opacity-80 group-hover/imglink:opacity-100 transition-opacity">
                                  <span>🔗 {block.imageLink}</span>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={block.imageUrl}
                                alt={block.imageAlt || 'Gambar'}
                                className="w-full h-auto object-cover max-h-[480px] rounded-2xl"
                              />
                            )
                          ) : (
                            <div className="p-8 text-center text-gray-400 text-xs">
                              <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                              <span>Belum ada gambar yang dipilih.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 5.5 GALLERY BLOCK */}
                    {block.type === 'gallery' && (
                      <div className="w-full">
                        {(() => {
                          const cols = block.galleryCols || 3;
                          const gridClass = cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4';
                          const images = block.galleryImages || [];
                          
                          if (images.length === 0) {
                            return (
                              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center text-gray-400 text-xs">
                                <Images size={24} className="mx-auto mb-2 opacity-50" />
                                <span>Galeri kosong. Tambahkan gambar lewat panel pengaturan.</span>
                              </div>
                            );
                          }

                          return (
                            <div className={`grid ${gridClass} gap-2 sm:gap-3`}>
                              {images.map((imgUrl, imgIdx) => (
                                <div key={imgIdx} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                  <img
                                    src={imgUrl}
                                    alt={`Gallery Preview ${imgIdx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* 6. QUOTE BLOCK */}
                    {block.type === 'quote' && (
                      <div className="bg-gradient-to-r from-orange-50/60 to-amber-50/30 border-l-4 border-[#F26522] rounded-r-2xl p-6 shadow-sm relative overflow-hidden">
                        <Quote size={40} className="absolute right-4 top-4 text-[#F26522]/10" />
                        <blockquote className="relative z-10 text-slate-800 text-xs sm:text-sm font-medium italic leading-relaxed">
                          "{block.quoteText || 'Tulis kalimat kutipan di sini...'}"
                        </blockquote>
                        {block.quoteAuthor && (
                          <p className="relative z-10 text-[11px] font-semibold text-[#F26522] mt-3 flex items-center gap-1.5">
                            <span>— {block.quoteAuthor}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* 7. SEPARATOR BLOCK */}
                    {block.type === 'separator' && (
                      <div className="py-4 flex items-center justify-center">
                        <div className="w-full border-t border-gray-200/80" />
                      </div>
                    )}

                  </div>
                </React.Fragment>
              );
            })
            )}

          </div>
          
        </div>
      </div>

      {/* ================= RIGHT SIDEBAR (ELEMENTOR NAVIGATOR) — Desktop Only ================= */}
      <div className={`hidden md:flex bg-white border-l border-gray-200 shrink-0 flex-col h-full shadow-2xl z-30 select-none transition-all duration-300 ${isNavMinimized ? 'w-14' : 'w-72'}`}>
        {/* Navigator Header */}
        <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          {!isNavMinimized && (
            <div className="flex items-center gap-1.5 pl-1">
              <Layout size={16} className="text-gray-400" />
              <h5 className="text-xs font-semibold text-gray-600">Navigator Struktur</h5>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsNavMinimized(!isNavMinimized)}
            className="p-1.5 hover:bg-gray-200/80 rounded-lg text-gray-500 hover:text-gray-900 transition-colors mx-auto"
            title={isNavMinimized ? 'Perluas Navigator' : 'Kecilkan Navigator'}
          >
            {isNavMinimized ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Draggable Navigator List */}
        {!isNavMinimized ? (
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
                        <span className="capitalize">
                          {b.type === 'hero' ? 'Hero Header' : b.type === 'text' ? 'Teks HTML' : b.type === 'cta' ? 'CTA Banner' : b.type === 'faq' ? 'FAQ Accordion' : b.type === 'image' ? 'Gambar' : b.type === 'gallery' ? 'Galeri' : b.type === 'quote' ? 'Kutipan' : 'Pemisah'}
                        </span>
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
        ) : (
          /* Minimized Compact Strip */
          <div className="flex-1 overflow-y-auto p-2 space-y-2 flex flex-col items-center">
            {blocks.map((b, idx) => {
              const isSelected = selectedBlockIndex === idx;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBlockIndex(idx)}
                  className={`w-9 h-9 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-[#F26522] text-white border-[#F26522] shadow-sm' 
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                  title={`Blok #${idx + 1}: ${b.type}`}
                >
                  <span className="text-[10px] font-bold">#{idx + 1}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= MOBILE FAB (+) BUTTON (md:hidden) ================= */}
      <button
        type="button"
        onClick={() => setMobileSheet(mobileSheet === 'widgets' ? 'closed' : 'widgets')}
        className={`md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all active:scale-90 ${
          mobileSheet === 'widgets'
            ? 'bg-gray-800 text-white rotate-45'
            : 'bg-[#F26522] text-white hover:bg-[#d85417]'
        }`}
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* ================= MOBILE BOTTOM SHEET (md:hidden) ================= */}
      {mobileSheet !== 'closed' && (
        <div className="md:hidden fixed inset-0 z-45 flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setMobileSheet('closed')}
          />
          
          {/* Sheet Container */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col animate-slideUp overflow-hidden border-t border-gray-200">
            
            {/* Drag Handle + Header */}
            <div className="pt-3 pb-2 px-4 border-b border-gray-100 shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  {mobileSheet === 'widgets' && (
                    <><PlusCircle size={16} className="text-[#F26522]" /> Tambah Widget</>
                  )}
                  {mobileSheet === 'settings' && (
                    <><Settings size={16} className="text-[#F26522]" /> Pengaturan Halaman</>
                  )}
                  {mobileSheet === 'blockEdit' && selectedBlockIndex !== null && (
                    <><Layout size={16} className="text-[#F26522]" /> Edit: {blocks[selectedBlockIndex]?.type}</>
                  )}
                </h5>
                <button
                  type="button"
                  onClick={() => setMobileSheet('closed')}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Sheet Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* ---- WIDGETS GRID ---- */}
              {mobileSheet === 'widgets' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-gray-500">Ketuk widget untuk menambahkannya ke canvas:</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { type: 'heading', title: 'Judul', icon: Heading, color: 'text-orange-500' },
                      { type: 'hero', title: 'Hero', icon: Sparkles, color: 'text-purple-500' },
                      { type: 'text', title: 'Teks', icon: AlignLeft, color: 'text-sky-500' },
                      { type: 'cta', title: 'CTA', icon: Megaphone, color: 'text-amber-500' },
                      { type: 'faq', title: 'Accordion', icon: HelpCircle, color: 'text-emerald-500' },
                      { type: 'gallery', title: 'Galeri', icon: Images, color: 'text-fuchsia-500' },
                      { type: 'image', title: 'Gambar', icon: ImageIcon, color: 'text-emerald-600' },
                      { type: 'quote', title: 'Kutipan', icon: Quote, color: 'text-indigo-500' },
                      { type: 'separator', title: 'Pemisah', icon: Minus, color: 'text-gray-500' },
                    ].map((w) => {
                      const Icon = w.icon;
                      return (
                        <button
                          key={w.type}
                          type="button"
                          onClick={() => {
                            addBlock(w.type as any);
                            setMobileSheet('closed');
                          }}
                          className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-orange-50/50 border border-gray-200 hover:border-[#F26522] rounded-2xl transition-all text-center gap-1.5 active:scale-95"
                        >
                          <Icon size={20} className={w.color} />
                          <span className="text-[10px] font-semibold text-gray-700">{w.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ---- SETTINGS FORM ---- */}
              {mobileSheet === 'settings' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Judul Halaman</label>
                    <input
                      type="text"
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      placeholder="Contoh: Panduan Kreator"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Slug URL ({pageUseRootPath ? `pks.art/${pageSlug || 'your-slug'}` : `pks.art/p/${pageSlug || 'your-slug'}`})
                    </label>
                    <input
                      type="text"
                      value={pageSlug}
                      onChange={(e) => setPageSlug(e.target.value)}
                      placeholder="contoh: panduan-kreator"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-normal text-gray-900 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="mobile-published"
                      checked={pagePublished}
                      onChange={(e) => setPagePublished(e.target.checked)}
                      className="w-5 h-5 text-[#F26522] focus:ring-[#F26522] border-gray-300 rounded cursor-pointer accent-[#F26522]"
                    />
                    <label htmlFor="mobile-published" className="text-xs font-medium text-gray-700 cursor-pointer select-none">
                      Terbitkan Halaman (Public)
                    </label>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="mobile-rootpath"
                      checked={pageUseRootPath}
                      onChange={(e) => setPageUseRootPath(e.target.checked)}
                      className="w-5 h-5 text-[#F26522] focus:ring-[#F26522] border-gray-300 rounded cursor-pointer accent-[#F26522]"
                    />
                    <label htmlFor="mobile-rootpath" className="text-xs font-medium text-gray-700 cursor-pointer select-none">
                      Gunakan Root Link (pks.art/slug)
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Lebar Tampilan Halaman</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPageWidth('70')}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                          pageWidth === '70'
                            ? 'bg-orange-50 border-[#F26522] text-[#F26522] font-semibold shadow-xs'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        Standar (70%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPageWidth('full')}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                          pageWidth === 'full'
                            ? 'bg-orange-50 border-[#F26522] text-[#F26522] font-semibold shadow-xs'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        Full Width (100%)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Gaya Kontainer Blok</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                        <input
                          type="radio"
                          name="mobileContainerStyle"
                          checked={containerStyle === 'boxed'}
                          onChange={() => setContainerStyle('boxed')}
                          className="text-[#F26522] focus:ring-[#F26522] accent-[#F26522]"
                        />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">Boxed Container</p>
                          <p className="text-[10px] text-gray-500">Blok dalam kartu berbingkai rounded</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                        <input
                          type="radio"
                          name="mobileContainerStyle"
                          checked={containerStyle === 'clean'}
                          onChange={() => setContainerStyle('clean')}
                          className="text-[#F26522] focus:ring-[#F26522] accent-[#F26522]"
                        />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">Transparan / Clean</p>
                          <p className="text-[10px] text-gray-500">Nonaktifkan background kartu pada semua blok</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ---- BLOCK EDIT FORM ---- */}
              {mobileSheet === 'blockEdit' && selectedBlockIndex !== null && blocks[selectedBlockIndex] && (
                <div className="space-y-4">
                  {/* Reorder + Delete Toolbar */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={selectedBlockIndex === 0}
                      onClick={() => {
                        const newBlocks = [...blocks];
                        const temp = newBlocks[selectedBlockIndex];
                        newBlocks[selectedBlockIndex] = newBlocks[selectedBlockIndex - 1];
                        newBlocks[selectedBlockIndex - 1] = temp;
                        setBlocks(newBlocks);
                        setSelectedBlockIndex(selectedBlockIndex - 1);
                      }}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 disabled:opacity-40"
                    >
                      <ArrowUp size={14} /> Naik
                    </button>
                    <button
                      type="button"
                      disabled={selectedBlockIndex === blocks.length - 1}
                      onClick={() => {
                        const newBlocks = [...blocks];
                        const temp = newBlocks[selectedBlockIndex];
                        newBlocks[selectedBlockIndex] = newBlocks[selectedBlockIndex + 1];
                        newBlocks[selectedBlockIndex + 1] = temp;
                        setBlocks(newBlocks);
                        setSelectedBlockIndex(selectedBlockIndex + 1);
                      }}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 disabled:opacity-40"
                    >
                      <ArrowDown size={14} /> Turun
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBlocks(blocks.filter((_, i) => i !== selectedBlockIndex));
                        setSelectedBlockIndex(null);
                        setMobileSheet('closed');
                      }}
                      className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition-all flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>

                  {/* Block Type-Specific Forms */}
                  {blocks[selectedBlockIndex].type === 'heading' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Teks Judul</label>
                        <input type="text" value={blocks[selectedBlockIndex].title || ''} onChange={(e) => updateBlockField(selectedBlockIndex, 'title', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#F26522]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Sub-judul</label>
                        <input type="text" value={blocks[selectedBlockIndex].subtitle || ''} onChange={(e) => updateBlockField(selectedBlockIndex, 'subtitle', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#F26522]" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Ukuran</label>
                          <select value={blocks[selectedBlockIndex].titleSize || 'h2'} onChange={(e) => updateBlockField(selectedBlockIndex, 'titleSize', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#F26522] cursor-pointer">
                            <option value="h1">H1 (36px)</option>
                            <option value="h2">H2 (28px)</option>
                            <option value="h3">H3 (22px)</option>
                            <option value="h4">H4 (18px)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Posisi</label>
                          <select value={blocks[selectedBlockIndex].titleAlign || 'left'} onChange={(e) => updateBlockField(selectedBlockIndex, 'titleAlign', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#F26522] cursor-pointer">
                            <option value="left">Kiri</option>
                            <option value="center">Tengah</option>
                            <option value="right">Kanan</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {blocks[selectedBlockIndex].type === 'hero' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Judul Hero</label>
                        <input type="text" value={blocks[selectedBlockIndex].title || ''} onChange={(e) => updateBlockField(selectedBlockIndex, 'title', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#F26522]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Sub-headline</label>
                        <input type="text" value={blocks[selectedBlockIndex].subtitle || ''} onChange={(e) => updateBlockField(selectedBlockIndex, 'subtitle', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#F26522]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Teks Tombol CTA</label>
                        <input type="text" value={blocks[selectedBlockIndex].ctaText || ''} onChange={(e) => updateBlockField(selectedBlockIndex, 'ctaText', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#F26522]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Link CTA</label>
                        <input type="text" value={blocks[selectedBlockIndex].ctaLink || ''} onChange={(e) => updateBlockField(selectedBlockIndex, 'ctaLink', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#F26522]" />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={blocks[selectedBlockIndex].fullWidth || false} onChange={(e) => updateBlockField(selectedBlockIndex, 'fullWidth', e.target.checked)} className="w-5 h-5 accent-[#F26522]" />
                        <span className="text-xs font-medium text-gray-700">Full Width</span>
                      </label>
                    </div>
                  )}

                  {blocks[selectedBlockIndex].type === 'text' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-medium text-gray-600">Konten Teks</label>
                        
                        {/* Visual vs Code Tab Selector */}
                        <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 select-none">
                          <button
                            type="button"
                            onClick={() => setTextEditorTab('visual')}
                            className={`px-2.5 py-1 text-[10px] font-medium rounded transition-all ${
                              textEditorTab === 'visual'
                                ? 'bg-white text-slate-800 shadow-sm font-semibold'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Visual
                          </button>
                          <button
                            type="button"
                            onClick={() => setTextEditorTab('code')}
                            className={`px-2.5 py-1 text-[10px] font-medium rounded transition-all ${
                              textEditorTab === 'code'
                                ? 'bg-white text-slate-800 shadow-sm font-semibold'
                                : 'text-slate-500 hover:text-slate-800'
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
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('bold')}
                          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                          title="Tebal (Bold)"
                        >
                          <Bold size={14} />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('italic')}
                          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                          title="Miring (Italic)"
                        >
                          <Italic size={14} />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('underline')}
                          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                          title="Garis Bawah (Underline)"
                        >
                          <Underline size={14} />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('strikeThrough')}
                          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                          title="Coret (Strikethrough)"
                        >
                          <Strikethrough size={14} />
                        </button>

                        <div className="w-px h-4 bg-gray-300 mx-1" />

                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('insertUnorderedList')}
                          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                          title="Bullet List"
                        >
                          <List size={14} />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('insertOrderedList')}
                          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                          title="Numbered List"
                        >
                          <ListOrdered size={14} />
                        </button>

                        <div className="w-px h-4 bg-gray-300 mx-1" />

                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('justifyLeft')}
                          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                          title="Rata Kiri"
                        >
                          <AlignLeft size={14} />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('justifyCenter')}
                          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                          title="Rata Tengah"
                        >
                          <AlignCenter size={14} />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('justifyRight')}
                          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                          title="Rata Kanan"
                        >
                          <AlignRight size={14} />
                        </button>

                        <div className="w-px h-4 bg-gray-300 mx-1" />

                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('createLink')}
                          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-blue-600 transition-colors"
                          title="Tambah Link"
                        >
                          <LinkIcon size={14} />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat('unlink')}
                          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-red-500 transition-colors"
                          title="Hapus Link"
                        >
                          <Unlink size={14} />
                        </button>

                        <div className="w-px h-4 bg-gray-300 mx-1" />

                        {/* Font Size Select Dropdown */}
                        <div className="relative group/size">
                          <button
                            type="button"
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors flex items-center gap-1 text-[10px] font-medium"
                            title="Ukuran Font"
                          >
                            <Type size={14} />
                            <span>Ukuran</span>
                          </button>
                          <div className="absolute left-0 top-full hidden group-hover/size:block bg-white border border-gray-200 rounded-xl shadow-lg p-1 z-40 w-28 space-y-0.5 animate-fadeIn">
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat(textEditorTab === 'code' ? 'fontSizeXS' : 'fontSize', '1')}
                              className="w-full text-left px-2 py-1 hover:bg-gray-50 text-[10px] rounded text-gray-700 font-semibold"
                            >
                              Sangat Kecil
                            </button>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat(textEditorTab === 'code' ? 'fontSizeSM' : 'fontSize', '2')}
                              className="w-full text-left px-2 py-1 hover:bg-gray-50 text-[11px] rounded text-gray-700 font-semibold"
                            >
                              Kecil
                            </button>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat(textEditorTab === 'code' ? 'fontSizeLG' : 'fontSize', '4')}
                              className="w-full text-left px-2 py-1 hover:bg-gray-50 text-sm rounded text-gray-700 font-semibold"
                            >
                              Besar
                            </button>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormat(textEditorTab === 'code' ? 'fontSizeXL' : 'fontSize', '5')}
                              className="w-full text-left px-2 py-1 hover:bg-gray-50 text-base rounded text-gray-700 font-bold"
                            >
                              Ekstra Besar
                            </button>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
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
                          <ContentEditableEditor
                            id="visual-editor-mobile"
                            value={blocks[selectedBlockIndex].content || ''}
                            onChange={(val) => updateBlockField(selectedBlockIndex, 'content', val)}
                            className="bg-white border border-gray-200 border-t-0 rounded-b-2xl p-4 min-h-[150px] max-h-[300px] overflow-y-auto shadow-inner prose prose-slate max-w-none text-xs text-slate-800 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                      ) : (
                        /* 📝 HTML & CODE EDITOR WORKSPACE MODE */
                        <div className="space-y-2">
                          <textarea
                            id="markdown-editor-mobile"
                            value={blocks[selectedBlockIndex].content || ''}
                            onChange={(e) => updateBlockField(selectedBlockIndex, 'content', e.target.value)}
                            rows={8}
                            placeholder="# Judul Utama&#10;## Subjudul Halaman&#10;&#10;Tulis paragraf teks di sini. Pisahkan paragraf dengan menekan tombol Enter dua kali.&#10;&#10;Gunakan toolbar di atas atau **tebal** untuk teks tebal, [u]garis bawah[/u], [s]coret[/s], [align=center]tengah[/align], atau [size=lg]ukuran besar[/size]."
                            className="w-full bg-gray-50 border border-gray-200 border-t-0 rounded-b-2xl p-3 text-xs text-gray-800 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/30"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {blocks[selectedBlockIndex].type === 'cta' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Judul CTA</label>
                        <input type="text" value={blocks[selectedBlockIndex].title || ''} onChange={(e) => updateBlockField(selectedBlockIndex, 'title', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#F26522]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi</label>
                        <input type="text" value={blocks[selectedBlockIndex].description || ''} onChange={(e) => updateBlockField(selectedBlockIndex, 'description', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#F26522]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Teks Tombol</label>
                        <input type="text" value={blocks[selectedBlockIndex].ctaText || ''} onChange={(e) => updateBlockField(selectedBlockIndex, 'ctaText', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#F26522]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Link Tombol</label>
                        <input type="text" value={blocks[selectedBlockIndex].ctaLink || ''} onChange={(e) => updateBlockField(selectedBlockIndex, 'ctaLink', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#F26522]" />
                      </div>
                    </div>
                  )}

                  {blocks[selectedBlockIndex].type === 'image' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Gambar</label>
                        <button
                          type="button"
                          onClick={() => {
                            setMediaTarget('mainImage');
                            setShowMediaModal(true);
                          }}
                          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-gray-200"
                        >
                          <Folder size={14} /> Pilih dari Media Explorer
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Alt Text</label>
                        <input type="text" value={blocks[selectedBlockIndex].imageAlt || ''} onChange={(e) => updateBlockField(selectedBlockIndex, 'imageAlt', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#F26522]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Link Gambar</label>
                        <input type="text" value={blocks[selectedBlockIndex].imageLink || ''} onChange={(e) => updateBlockField(selectedBlockIndex, 'imageLink', e.target.value)} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#F26522]" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Ukuran</label>
                          <select value={blocks[selectedBlockIndex].imageSize || 'full'} onChange={(e) => updateBlockField(selectedBlockIndex, 'imageSize', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#F26522] cursor-pointer">
                            <option value="small">Kecil</option>
                            <option value="medium">Sedang</option>
                            <option value="large">Besar</option>
                            <option value="full">Penuh</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Posisi</label>
                          <select value={blocks[selectedBlockIndex].imageAlign || 'center'} onChange={(e) => updateBlockField(selectedBlockIndex, 'imageAlign', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#F26522] cursor-pointer">
                            <option value="left">Kiri</option>
                            <option value="center">Tengah</option>
                            <option value="right">Kanan</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {blocks[selectedBlockIndex].type === 'quote' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Kutipan</label>
                        <textarea value={blocks[selectedBlockIndex].quoteText || ''} onChange={(e) => updateBlockField(selectedBlockIndex, 'quoteText', e.target.value)} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#F26522] resize-y" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Penulis</label>
                        <input type="text" value={blocks[selectedBlockIndex].quoteAuthor || ''} onChange={(e) => updateBlockField(selectedBlockIndex, 'quoteAuthor', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#F26522]" />
                      </div>
                    </div>
                  )}

                  {blocks[selectedBlockIndex].type === 'faq' && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-gray-600">Daftar FAQ:</p>
                      {(blocks[selectedBlockIndex].faqs || []).map((faq, fIdx) => (
                        <div key={fIdx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                          <input type="text" value={faq.question} onChange={(e) => { const faqs = [...(blocks[selectedBlockIndex].faqs || [])]; faqs[fIdx] = { ...faqs[fIdx], question: e.target.value }; updateBlockField(selectedBlockIndex, 'faqs', faqs); }} placeholder="Pertanyaan..." className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#F26522]" />
                          <textarea value={faq.answer} onChange={(e) => { const faqs = [...(blocks[selectedBlockIndex].faqs || [])]; faqs[fIdx] = { ...faqs[fIdx], answer: e.target.value }; updateBlockField(selectedBlockIndex, 'faqs', faqs); }} rows={2} placeholder="Jawaban..." className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#F26522] resize-y" />
                          <button type="button" onClick={() => { const faqs = (blocks[selectedBlockIndex].faqs || []).filter((_, i) => i !== fIdx); updateBlockField(selectedBlockIndex, 'faqs', faqs); }} className="text-[10px] text-red-500 font-semibold">Hapus FAQ ini</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => { const faqs = [...(blocks[selectedBlockIndex].faqs || []), { question: '', answer: '' }]; updateBlockField(selectedBlockIndex, 'faqs', faqs); }} className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-[#F26522] text-xs font-semibold rounded-xl border border-orange-200 transition-all flex items-center justify-center gap-1">
                        <Plus size={14} /> Tambah FAQ
                      </button>
                    </div>
                  )}

                  {blocks[selectedBlockIndex].type === 'gallery' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah Kolom</label>
                        <select
                          value={blocks[selectedBlockIndex].galleryCols || 3}
                          onChange={(e) => updateBlockField(selectedBlockIndex, 'galleryCols', parseInt(e.target.value))}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#F26522] cursor-pointer"
                        >
                          <option value={1}>1 Kolom</option>
                          <option value={2}>2 Kolom</option>
                          <option value={3}>3 Kolom</option>
                          <option value={4}>4 Kolom</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Gambar Galeri</label>
                        <div className="space-y-2">
                          {(blocks[selectedBlockIndex].galleryImages || []).map((imgUrl, imgIdx) => (
                            <div key={imgIdx} className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-2 rounded-xl">
                              <img src={imgUrl} alt={`Gallery ${imgIdx}`} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                              <input 
                                type="text" 
                                value={imgUrl} 
                                readOnly 
                                className="w-full bg-transparent text-[10px] text-gray-500 outline-none" 
                              />
                              <button 
                                type="button" 
                                onClick={() => {
                                  const imgs = [...(blocks[selectedBlockIndex].galleryImages || [])];
                                  imgs.splice(imgIdx, 1);
                                  updateBlockField(selectedBlockIndex, 'galleryImages', imgs);
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setMediaTarget('gallery');
                              setShowMediaModal(true);
                            }}
                            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-1"
                          >
                            <Plus size={14} /> Tambah via Media Explorer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {blocks[selectedBlockIndex].type === 'separator' && (
                    <p className="text-xs text-gray-500 text-center py-4">Widget pemisah tidak memiliki pengaturan tambahan.</p>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 🔗 LINK MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col border border-gray-100 animate-slideUp">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <LinkIcon size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Tambah Tautan (Link)</h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl('');
                  setSavedRange(null);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">URL Tautan</label>
                <input
                  type="text"
                  autoFocus
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmLink();
                  }}
                  placeholder="https://contoh.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-normal text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>
              <button
                type="button"
                onClick={confirmLink}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95"
              >
                Terapkan Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🖼️ MEDIA EXPLORER & FILE UPLOADER MODAL */}
      {showMediaModal && (
        <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fadeIn border border-gray-100">
            
            {/* Modal Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F26522]/10 text-[#F26522] flex items-center justify-center">
                  <Folder size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Media Explorer & Upload</h4>
                  <p className="text-[10px] text-gray-500">Pilih dari pustaka media atau upload file gambar dari komputer Anda</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tab Buttons */}
            <div className="px-5 pt-3 bg-gray-50/50 border-b border-gray-200 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMediaTab('library')}
                className={`pb-2 text-xs font-semibold transition-all border-b-2 ${
                  mediaTab === 'library'
                    ? 'border-[#F26522] text-[#F26522]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Pustaka Media (Library)
              </button>
              <button
                type="button"
                onClick={() => setMediaTab('upload')}
                className={`pb-2 text-xs font-semibold transition-all border-b-2 ${
                  mediaTab === 'upload'
                    ? 'border-[#F26522] text-[#F26522]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Upload File Baru
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 flex-1 overflow-y-auto">
              {mediaTab === 'library' ? (
                <div className="space-y-4">
                  {/* Search Box */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={searchMedia}
                      onChange={(e) => setSearchMedia(e.target.value)}
                      placeholder="Cari gambar di media library..."
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#F26522]"
                    />
                  </div>

                  {/* Combined Media List */}
                  {(() => {
                    const allMedia = [
                      ...customMediaList,
                      ...artworks.map((a) => a.imageUrl),
                    ].filter((url, index, self) => self.indexOf(url) === index); // unique

                    const filtered = searchMedia
                      ? allMedia.filter((url) => url.toLowerCase().includes(searchMedia.toLowerCase()))
                      : allMedia;

                    return filtered.length === 0 ? (
                      <div className="text-center py-12 text-gray-400 text-xs">
                        Tidak ada gambar ditemukan di Pustaka Media.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                        {filtered.map((url, idx) => {
                          const isSelected = selectedBlockIndex !== null && blocks[selectedBlockIndex]?.imageUrl === url;
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                if (selectedBlockIndex !== null) {
                                  if (mediaTarget === 'mainImage') {
                                    updateBlockField(selectedBlockIndex, 'imageUrl', url);
                                  } else if (mediaTarget === 'gallery') {
                                    const currentImgs = blocks[selectedBlockIndex].galleryImages || [];
                                    updateBlockField(selectedBlockIndex, 'galleryImages', [...currentImgs, url]);
                                  }
                                }
                                setShowMediaModal(false);
                              }}
                              className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer aspect-square bg-gray-50 transition-all ${
                                isSelected
                                  ? 'border-[#F26522] ring-2 ring-[#F26522]/30 shadow-md'
                                  : 'border-gray-200 hover:border-[#F26522]'
                              }`}
                            >
                              <img
                                src={url}
                                alt={`Media ${idx}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              {isSelected && (
                                <div className="absolute top-2 right-2 bg-[#F26522] text-white p-1 rounded-full shadow">
                                  <Check size={12} />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                                Pilih Gambar
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Upload Tab */
                <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50 text-center relative hover:border-[#F26522] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const dataUrl = event.target?.result as string;
                          if (dataUrl) {
                            setCustomMediaList((prev) => [dataUrl, ...prev]);
                            if (selectedBlockIndex !== null) {
                              updateBlockField(selectedBlockIndex, 'imageUrl', dataUrl);
                            }
                            setShowMediaModal(false);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="w-14 h-14 rounded-full bg-orange-100 text-[#F26522] flex items-center justify-center mb-3">
                    <Upload size={24} />
                  </div>
                  <h5 className="text-sm font-semibold text-gray-800">Klik atau Tarik File Gambar Ke Sini</h5>
                  <p className="text-xs text-gray-400 mt-1">Mendukung format PNG, JPG, JPEG, WEBP, SVG</p>
                  <span className="mt-4 px-4 py-2 bg-[#F26522] text-white text-xs font-semibold rounded-xl shadow">
                    Pilih File Dari Komputer
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
