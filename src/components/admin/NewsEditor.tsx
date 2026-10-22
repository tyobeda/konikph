'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  ImageIcon,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Code,
  Sparkles,
  Trophy,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Upload,
  MoveVertical,
  Smartphone,
  Monitor,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Rss,
  ArrowRight,
} from 'lucide-react';
import { createNews, updateNews } from '@/actions/news';
import { getAllDpwOffices } from '@/actions/dpw';
import { MediaGalleryModal } from './MediaGalleryModal';
import {
  parseResponsiveImageTransform,
  stringifyResponsiveImageTransform,
  getImageTransformStyle,
  ImageTransformData,
  ResponsiveImageTransform,
} from '@/lib/imageTransform';

const CATEGORIES = ['Kegiatan', 'Prestasi', 'Pengumuman', 'Hasil Pertandingan', 'Opini'];

interface NewsEditorProps {
  mode: 'create' | 'edit';
  initialData?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    imageUrl: string | null;
    category: string;
    caborCode: string | null;
    authorName: string;
    status: string;
    isFeatured: boolean;
    imagePosition?: string | null;
  };
}

export function NewsEditor({ mode, initialData }: NewsEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form states
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [category, setCategory] = useState(initialData?.category || 'Kegiatan');
  const [caborCode, setCaborCode] = useState(initialData?.caborCode || 'KONI');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [contentHtml, setContentHtml] = useState(initialData?.content || '');
  const [status, setStatus] = useState(initialData?.status || 'Published');
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.isFeatured));
  const [authorName, setAuthorName] = useState(initialData?.authorName || 'Humas KONI Kepahiang');
  const [transforms, setTransforms] = useState<ResponsiveImageTransform>(() =>
    parseResponsiveImageTransform(initialData?.imagePosition)
  );
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  // Currently active device transform
  const currentTransform = transforms[previewDevice];

  const updateCurrentTransform = (updater: (prev: ImageTransformData) => ImageTransformData) => {
    setTransforms((prev) => ({
      ...prev,
      [previewDevice]: updater(prev[previewDevice]),
    }));
  };

  // Interactive 2D drag-to-pan & zoom states
  const [isDraggingPosition, setIsDraggingPosition] = useState(false);
  const dragStart = useRef({ clientX: 0, clientY: 0, x: 50, y: 50 });
  const dragBoxRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
    setIsDraggingPosition(true);
    dragStart.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      x: transforms[previewDevice].x,
      y: transforms[previewDevice].y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingPosition || !dragBoxRef.current) return;
    const deltaX = e.clientX - dragStart.current.clientX;
    const deltaY = e.clientY - dragStart.current.clientY;
    const rect = dragBoxRef.current.getBoundingClientRect();
    const boxWidth = rect.width || 320;
    const boxHeight = rect.height || 470;

    // Direct pan: dragging mouse up (deltaY < 0) moves photo up (y decreases)
    const deltaPercentX = (deltaX / boxWidth) * 100;
    const deltaPercentY = (deltaY / boxHeight) * 100;

    const newX = Math.max(-50, Math.min(150, Math.round(dragStart.current.x + deltaPercentX)));
    const newY = Math.max(-75, Math.min(125, Math.round(dragStart.current.y + deltaPercentY)));

    updateCurrentTransform((prev) => ({ ...prev, x: newX, y: newY }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingPosition) {
      setIsDraggingPosition(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const handleZoomChange = (newScale: number) => {
    const clamped = Math.max(1, Math.min(3, parseFloat(newScale.toFixed(2))));
    updateCurrentTransform((prev) => ({ ...prev, scale: clamped }));
  };

  const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    updateCurrentTransform((prev) => ({
      ...prev,
      scale: Math.max(1, Math.min(3, parseFloat((prev.scale + delta).toFixed(2)))),
    }));
  };

  const handleResetTransform = () => {
    updateCurrentTransform(() => ({ x: 50, y: 50, scale: 1 }));
  };

  // Editor states
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [caborList, setCaborList] = useState<any[]>([]);

  // Media Modal state
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaModalMode, setMediaModalMode] = useState<'thumbnail' | 'insert'>('thumbnail');

  // Load Cabor list
  useEffect(() => {
    getAllDpwOffices().then((res) => {
      if (res.success && res.data) {
        setCaborList(res.data);
      }
    });
  }, []);

  // Sync initial content to visual editor
  useEffect(() => {
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== contentHtml) {
        editorRef.current.innerHTML = contentHtml;
      }
    }
  }, [isSourceMode]);

  // Auto-generate slug on title change in create mode
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (mode === 'create') {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Sync content from contenteditable
  const handleContentInput = () => {
    if (editorRef.current) {
      setContentHtml(editorRef.current.innerHTML);
    }
  };

  // WYSIWYG ExecCommand helper
  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    handleContentInput();
  };

  // Insert Custom HTML into Editor (for Figures & Captions)
  const insertHtmlToEditor = (html: string) => {
    if (isSourceMode) {
      setContentHtml((prev) => prev + '\n' + html);
      return;
    }

    if (editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const el = document.createElement('div');
        el.innerHTML = html;
        const frag = document.createDocumentFragment();
        let node;
        let lastNode;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } else {
        editorRef.current.innerHTML += html;
      }
      handleContentInput();
    }
  };

  // Handle Media Selection
  const handleMediaSelect = (result: { url: string; caption?: string; align?: 'center' | 'left' | 'right' }) => {
    if (mediaModalMode === 'thumbnail') {
      setImageUrl(result.url);
    } else {
      // Insert Photo with Caption inside article
      const alignClass =
        result.align === 'left'
          ? 'float-left mr-6 mb-4 max-w-sm'
          : result.align === 'right'
          ? 'float-right ml-6 mb-4 max-w-sm'
          : 'my-6 mx-auto text-center';

      const figureHtml = `
        <figure class="${alignClass}">
          <img src="${result.url}" alt="${result.caption || 'Foto Kegiatan'}" class="rounded-2xl max-h-[480px] w-full object-cover shadow-md mx-auto" />
          ${result.caption ? `<figcaption class="text-xs text-slate-500 dark:text-slate-400 mt-2 italic font-semibold text-center">${result.caption}</figcaption>` : ''}
        </figure>
        <p><br></p>
      `;
      insertHtmlToEditor(figureHtml);
    }
  };

  // Open Media Modal for Article Photo
  const openInsertPhotoModal = () => {
    setMediaModalMode('insert');
    setMediaModalOpen(true);
  };

  // Open Media Modal for Thumbnail
  const openThumbnailModal = () => {
    setMediaModalMode('thumbnail');
    setMediaModalOpen(true);
  };

  // Prompt for Link
  const handleInsertLink = () => {
    const url = prompt('Masukkan tautan URL (contoh: https://...):');
    if (url) {
      execCmd('createLink', url);
    }
  };

  // Save handler
  const handleSave = async (targetStatus?: string) => {
    setFormError(null);

    const finalTitle = title.trim();
    if (!finalTitle) {
      setFormError('Judul berita wajib diisi.');
      return;
    }

    const finalContent = isSourceMode
      ? contentHtml
      : editorRef.current?.innerHTML || contentHtml;

    if (!finalContent || finalContent === '<p><br></p>' || finalContent.trim() === '') {
      setFormError('Konten artikel berita wajib diisi.');
      return;
    }

    const finalStatus = targetStatus || status;

    startTransition(async () => {
      try {
        if (mode === 'create') {
          const res = await createNews({
            title: finalTitle,
            slug: slug.trim() || undefined,
            category,
            caborCode,
            imageUrl: imageUrl.trim() || undefined,
            excerpt: excerpt.trim() || undefined,
            content: finalContent,
            status: finalStatus,
            isFeatured,
            authorName: authorName.trim() || 'Humas KONI Kepahiang',
            imagePosition: stringifyResponsiveImageTransform(transforms),
          });

          if (res.success) {
            router.push('/admin/berita');
          } else {
            setFormError(res.error || 'Gagal menyimpan berita.');
          }
        } else if (initialData?.id) {
          const res = await updateNews(initialData.id, {
            title: finalTitle,
            slug: slug.trim() || undefined,
            category,
            caborCode,
            imageUrl: imageUrl.trim(),
            imagePosition: stringifyResponsiveImageTransform(transforms),
            excerpt: excerpt.trim(),
            content: finalContent,
            status: finalStatus,
            isFeatured,
            authorName: authorName.trim(),
          });

          if (res.success) {
            router.push('/admin/berita');
          } else {
            setFormError(res.error || 'Gagal memperbarui berita.');
          }
        }
      } catch (err: any) {
        setFormError(err?.message || 'Terjadi kesalahan sistem.');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* ── Top Bar (Blogger Action Header) ── */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-16 md:top-4 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/berita"
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Kembali ke Daftar Berita"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {mode === 'create' ? 'Tulis Berita Baru' : 'Edit Artikel Berita'}
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  status === 'Published'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                }`}
              >
                {status === 'Published' ? 'Siap Terbit' : 'Draf'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate max-w-sm sm:max-w-md">
              {title.trim() || 'Tanpa Judul'}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => handleSave('Draft')}
            disabled={isPending}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5"
          >
            <Save size={14} />
            <span>Simpan Draf</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('Published')}
            disabled={isPending}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            <span>{mode === 'create' ? 'Publikasikan Berita' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* ── Main Layout: Editor on Left, Settings Sidebar on Right ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── Column 1: Writing Canvas (Blogger Style) ── */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Post Title Input (Large borderless input) */}
          <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-5">
            <input
              type="text"
              placeholder="Ketik judul berita di sini..."
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-2xl sm:text-3xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 bg-transparent border-0 focus:outline-hidden"
            />
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>Slug URL:</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="slug-otomatis"
                className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 focus:outline-hidden"
              />
            </div>
          </div>

          {/* WYSIWYG Toolbar */}
          <div className="sticky top-32 md:top-24 z-20 bg-slate-50 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-1">
            <div className="flex flex-wrap items-center gap-1">
              {/* Headings */}
              <button
                type="button"
                onClick={() => execCmd('formatBlock', '<h2>')}
                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Heading 2 (Judul Bagian)"
              >
                <Heading2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('formatBlock', '<h3>')}
                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Heading 3 (Sub-Judul)"
              >
                <Heading3 size={16} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('formatBlock', '<p>')}
                className="px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Paragraf Normal"
              >
                P
              </button>

              <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

              {/* Text Styles */}
              <button
                type="button"
                onClick={() => execCmd('bold')}
                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors font-bold"
                title="Tebal (Ctrl+B)"
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('italic')}
                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors italic"
                title="Miring (Ctrl+I)"
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('underline')}
                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors underline"
                title="Garis Bawah (Ctrl+U)"
              >
                <Underline size={16} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('strikeThrough')}
                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Coret"
              >
                <Strikethrough size={16} />
              </button>

              <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

              {/* Lists & Blockquote */}
              <button
                type="button"
                onClick={() => execCmd('insertUnorderedList')}
                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Daftar Poin"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('insertOrderedList')}
                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Daftar Nomor"
              >
                <ListOrdered size={16} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('formatBlock', '<blockquote>')}
                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Kutipan (Blockquote)"
              >
                <Quote size={16} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('insertHorizontalRule')}
                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Garis Pembatas (HR)"
              >
                <Minus size={16} />
              </button>

              <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

              {/* Link */}
              <button
                type="button"
                onClick={handleInsertLink}
                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Sisipkan Tautan"
              >
                <LinkIcon size={16} />
              </button>

              {/* 🌟 INSERT PHOTO IN MIDDLE OF ARTICLE BUTTON */}
              <button
                type="button"
                onClick={openInsertPhotoModal}
                className="px-2.5 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                title="Sisipkan Foto & Keterangan di Tengah Artikel"
              >
                <ImageIcon size={15} />
                <span>+ Sisipkan Foto</span>
              </button>
            </div>

            {/* Toggle HTML Source Code Mode */}
            <button
              type="button"
              onClick={() => {
                if (!isSourceMode && editorRef.current) {
                  setContentHtml(editorRef.current.innerHTML);
                }
                setIsSourceMode(!isSourceMode);
              }}
              className={`p-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                isSourceMode
                  ? 'bg-red-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
              title="Toggle Mode Tampilan HTML / Visual"
            >
              <Code size={16} />
              <span className="hidden sm:inline">{isSourceMode ? 'Visual' : 'HTML'}</span>
            </button>
          </div>

          {/* Writing Canvas / Editor Area */}
          <div className="min-h-[500px]">
            {isSourceMode ? (
              <textarea
                value={contentHtml}
                onChange={(e) => setContentHtml(e.target.value)}
                placeholder="Tulis kode HTML artikel di sini..."
                className="w-full h-[500px] p-4 text-xs font-mono rounded-2xl bg-slate-900 text-emerald-400 border border-slate-700 focus:outline-hidden"
              />
            ) : (
              <div
                ref={editorRef}
                contentEditable
                onInput={handleContentInput}
                className="w-full min-h-[500px] p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 focus:outline-hidden prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed"
                data-placeholder="Tuliskan isi berita olahraga Anda di sini..."
              />
            )}
          </div>
        </div>

        {/* ── Column 2: Article Settings Sidebar (Ala Blogger) ── */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* 1. Thumbnail & Hero Preview Card (Desktop & Mobile with 2D Pan & Zoom) */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
            <div className="flex flex-col gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-red-600" />
                  <span>Preview Hero & Posisi Foto</span>
                </h4>
                {imageUrl && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={openThumbnailModal}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                    >
                      Ganti Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                      title="Hapus Foto"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Device Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    previewDevice === 'mobile'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone size={14} />
                  <span>Hero Mobile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    previewDevice === 'desktop'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Monitor size={14} />
                  <span>Hero Desktop</span>
                </button>
              </div>
            </div>

            {imageUrl ? (
              <div className="space-y-3.5">
                {/* Active Mode Notice */}
                <div className="flex items-center justify-between px-2 py-1.5 bg-slate-100/70 dark:bg-slate-900/60 rounded-xl text-[11px] font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Pengaturan Aktif:</span>
                  <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                    {previewDevice === 'mobile' ? (
                      <>
                        <Smartphone size={13} />
                        <span>Khusus Layar HP (Mobile)</span>
                      </>
                    ) : (
                      <>
                        <Monitor size={13} />
                        <span>Khusus Monitor (Desktop)</span>
                      </>
                    )}
                  </span>
                </div>

                {/* 🔍 Zoom & Reset Controls Bar */}
                <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleZoomChange(currentTransform.scale - 0.1)}
                      disabled={currentTransform.scale <= 1}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-all cursor-pointer"
                      title="Perkecil (Zoom Out)"
                    >
                      <ZoomOut size={14} />
                    </button>

                    <input
                      type="range"
                      min="1"
                      max="2.5"
                      step="0.05"
                      value={currentTransform.scale}
                      onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                      className="w-20 sm:w-28 accent-red-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                      title="Zoom Foto"
                    />

                    <button
                      type="button"
                      onClick={() => handleZoomChange(currentTransform.scale + 0.1)}
                      disabled={currentTransform.scale >= 2.5}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-all cursor-pointer"
                      title="Perbesar (Zoom In)"
                    >
                      <ZoomIn size={14} />
                    </button>

                    <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 min-w-9">
                      {currentTransform.scale.toFixed(1)}x
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetTransform}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-1 transition-all cursor-pointer"
                    title={`Kembalikan posisi & zoom ${previewDevice} ke default`}
                  >
                    <RotateCcw size={12} />
                    <span>Reset {previewDevice === 'mobile' ? 'HP' : 'PC'}</span>
                  </button>
                </div>

                {/* 📱 / 💻 Interactive Preview Frame */}
                {previewDevice === 'mobile' ? (
                  /* Mobile Preview: Mock phone with headline overlay */
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-semibold px-1">
                      <span>⚠️ Geser foto agar wajah atlet/tokoh di atas teks!</span>
                    </div>

                    <div
                      ref={dragBoxRef}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      onWheel={handleWheelZoom}
                      className={`relative w-full h-[470px] rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl select-none transition-shadow ${
                        isDraggingPosition
                          ? 'ring-4 ring-red-500/30 cursor-grabbing'
                          : 'cursor-grab hover:border-slate-700'
                      } bg-black group`}
                    >
                      {/* Phone Top Notch Simulation */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-black/80 rounded-full z-20 pointer-events-none flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-800/80 mr-3" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800/80" />
                      </div>

                      {/* Transformable Image (Uses mobile-only transform) */}
                      <img
                        src={imageUrl}
                        alt="Preview Hero Mobile"
                        draggable={false}
                        className="w-full h-full object-cover pointer-events-none select-none transition-none"
                        style={getImageTransformStyle(stringifyResponsiveImageTransform(transforms), 'mobile')}
                      />

                      {/* Realistic Homepage Mobile Gradient Overlay (covers bottom ~45-50%) */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black from-[45%] via-black/75 via-[55%] to-transparent pointer-events-none" />

                      {/* Top Floating Instruction Badge */}
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white text-[10px] font-bold flex items-center gap-1 pointer-events-none shadow-md whitespace-nowrap">
                        <Move size={12} className="text-red-400 animate-pulse" />
                        <span>{isDraggingPosition ? 'Menggeser foto HP...' : 'Tahan & Geser Foto HP'}</span>
                      </div>

                      {/* Top-right Status Pill */}
                      <div className="absolute top-8 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-white text-[9px] font-mono pointer-events-none">
                        {currentTransform.y < 50 ? `Naik ${50 - currentTransform.y}%` : currentTransform.y > 50 ? `Turun ${currentTransform.y - 50}%` : 'Tengah'}
                      </div>

                      {/* Live Realistic Mobile Hero Overlaid Content (Bottom) */}
                      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 flex flex-col gap-2 pointer-events-none">
                        {/* Category & Cabor Badge */}
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-white/20 text-white text-[9px] font-extrabold rounded-md backdrop-blur-xs">
                            {caborCode}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-500/80 text-black text-[9px] font-black rounded-md">
                            {category}
                          </span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-sm font-black text-white leading-snug line-clamp-2 drop-shadow-sm">
                          {title.trim() || 'Judul Berita Akan Muncul Di Sini'}
                        </h1>

                        {/* Excerpt */}
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                          {excerpt.trim() || 'Ringkasan berita akan tampil di bagian bawah foto ini. Geser foto agar wajah atlet atau tokoh tetap terlihat bebas di area atas.'}
                        </p>

                        {/* Author & Button Mockup */}
                        <div className="flex items-center justify-between pt-1 border-t border-white/10">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[9px]">
                              <Rss size={10} />
                            </div>
                            <span className="text-[10px] text-slate-200 font-bold truncate max-w-[130px]">
                              {authorName.trim() || 'Humas KONI'}
                            </span>
                          </div>
                          <div className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg shadow-xs flex items-center gap-1">
                            <span>Baca</span>
                            <ArrowRight size={10} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Desktop Preview: Mock Split Hero Banner */
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold px-1">
                      <span>Tampilan Hero di Monitor Desktop (Wide)</span>
                    </div>

                    <div
                      ref={dragBoxRef}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      onWheel={handleWheelZoom}
                      className={`relative w-full h-[260px] rounded-2xl overflow-hidden border-2 select-none transition-shadow ${
                        isDraggingPosition
                          ? 'border-red-500 ring-4 ring-red-500/30 cursor-grabbing'
                          : 'border-slate-300 dark:border-slate-700 cursor-grab hover:border-red-400'
                      } bg-slate-950 group`}
                    >
                      {/* Split Preview Grid */}
                      <div className="grid grid-cols-12 h-full">
                        {/* Left text column mockup */}
                        <div className="col-span-5 p-3.5 bg-gradient-to-r from-gray-950 via-slate-900 to-transparent text-white z-10 flex flex-col justify-between pointer-events-none">
                          <div>
                            <span className="text-[9px] font-bold text-amber-400 uppercase">
                              {caborCode} • {category}
                            </span>
                            <h3 className="text-xs font-black line-clamp-3 leading-snug mt-1">
                              {title.trim() || 'Judul Berita'}
                            </h3>
                          </div>
                          <div className="text-[9px] text-slate-400 truncate">
                            {authorName.trim() || 'Humas KONI'}
                          </div>
                        </div>

                        {/* Right image column (Uses desktop-only transform) */}
                        <div className="col-span-7 relative h-full overflow-hidden">
                          <img
                            src={imageUrl}
                            alt="Preview Hero Desktop"
                            draggable={false}
                            className="w-full h-full object-cover pointer-events-none select-none transition-none"
                            style={getImageTransformStyle(stringifyResponsiveImageTransform(transforms), 'desktop')}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-transparent to-transparent pointer-events-none" />
                        </div>
                      </div>

                      {/* Top Instruction Pill */}
                      <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white text-[10px] font-bold flex items-center gap-1 pointer-events-none shadow-md">
                        <Move size={11} className="text-red-400" />
                        <span>{isDraggingPosition ? 'Menggeser foto Desktop...' : 'Geser Foto Desktop'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🧭 Fine-Tuning Slider & Presets for active device */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  {/* Vertical Position Slider */}
                  <div className="space-y-1.5 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Posisi Vertikal ({previewDevice === 'mobile' ? 'HP' : 'Desktop'}):
                      </span>
                      <span className="font-mono font-bold text-red-600 dark:text-red-400 text-xs">
                        {currentTransform.y < 50 ? `Naik ${50 - currentTransform.y}%` : currentTransform.y > 50 ? `Turun ${currentTransform.y - 50}%` : 'Normal (Tengah)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-bold shrink-0">⬆ Naik</span>
                      <input
                        type="range"
                        min="-50"
                        max="100"
                        value={currentTransform.y}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          updateCurrentTransform((prev) => ({ ...prev, y: val }));
                        }}
                        className="w-full accent-red-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-500 font-bold shrink-0">⬇ Turun</span>
                    </div>
                  </div>

                  {/* Preset Buttons for active device */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                      Preset Posisi ({previewDevice === 'mobile' ? 'HP' : 'Desktop'}):
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {previewDevice === 'mobile' && (
                        <button
                          type="button"
                          onClick={() => updateCurrentTransform((prev) => ({ ...prev, y: -15, x: 50 }))}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                            currentTransform.y <= 0
                              ? 'bg-red-50 text-red-600 border-red-300 dark:bg-red-950/50 dark:border-red-800'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                          title="Geser foto naik tinggi ke atas khusus tampilan HP"
                        >
                          🚀 Naik Tinggi (HP)
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => updateCurrentTransform((prev) => ({ ...prev, y: 20, x: 50 }))}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                          currentTransform.y > 0 && currentTransform.y <= 35
                            ? 'bg-red-50 text-red-600 border-red-300 dark:bg-red-950/50 dark:border-red-800'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Fokus Atas
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCurrentTransform((prev) => ({ ...prev, y: 50, x: 50 }))}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                          currentTransform.y > 35 && currentTransform.y < 65 && currentTransform.x > 35 && currentTransform.x < 65
                            ? 'bg-red-50 text-red-600 border-red-300 dark:bg-red-950/50 dark:border-red-800'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Normal (Tengah)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCurrentTransform((prev) => ({ ...prev, y: 75, x: 50 }))}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                          currentTransform.y >= 65
                            ? 'bg-red-50 text-red-600 border-red-300 dark:bg-red-950/50 dark:border-red-800'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Fokus Bawah
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    💡 <strong>Tips:</strong> Pengaturan posisi dan zoom untuk <strong>Hero Mobile</strong> dan <strong>Hero Desktop</strong> sekarang <strong>sepenuhnya terpisah</strong>. Menggeser foto di HP tidak akan mengubah tampilan di Desktop.
                  </p>
                </div>
              </div>
            ) : (
              <div
                onClick={openThumbnailModal}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-red-500/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/30 group"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <ImageIcon size={22} />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Pilih Foto Thumbnail
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dari Galeri Media atau Unggah Baru
                </p>
              </div>
            )}
          </div>

          {/* 2. Categorization & Cabor Card */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-500" />
              <span>Kategori & Cabor Binaan</span>
            </h4>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Kategori Berita:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Cabor Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Cabang Olahraga Terkait:
              </label>
              <select
                value={caborCode}
                onChange={(e) => setCaborCode(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                <option value="KONI">KONI Kabupaten Kepahiang (Umum)</option>
                {caborList.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Author & Excerpt Card */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Metadata & Ringkasan
            </h4>

            {/* Author input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Penulis / Pewarta:
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Humas KONI Kepahiang"
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Ringkasan Singkat (Excerpt):
              </label>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Tulis ringkasan 1-2 kalimat untuk preview di kartu berita & media sosial..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Bila dikosongkan, ringkasan akan otomatis diambil dari kalimat pertama isi artikel.
              </p>
            </div>
          </div>

          {/* 4. Publication Settings Card */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Status Publikasi
            </h4>

            {/* Status Selector */}
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-2 ${
                  status === 'Published'
                    ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="Published"
                  checked={status === 'Published'}
                  onChange={() => setStatus('Published')}
                  className="hidden"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold">Terbitkan</span>
              </label>

              <label
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-2 ${
                  status === 'Draft'
                    ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="Draft"
                  checked={status === 'Draft'}
                  onChange={() => setStatus('Draft')}
                  className="hidden"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-bold">Simpan Draf</span>
              </label>
            </div>

            {/* Featured Checkbox */}
            <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="mt-0.5 rounded text-red-600 focus:ring-red-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <Sparkles size={13} className="text-amber-500" />
                  Jadikan Berita Unggulan (Sorotan Utama)
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Artikel ini akan tampil besar sebagai banner utama di halaman Warta Berita.
                </span>
              </div>
            </label>
          </div>

        </aside>

      </div>

      {/* Media Gallery Selector Modal */}
      <MediaGalleryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        mode={mediaModalMode}
        onSelect={handleMediaSelect}
      />

    </div>
  );
}
