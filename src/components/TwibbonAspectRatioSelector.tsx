'use client';

import React from 'react';
import { 
  Square, 
  Smartphone, 
  RectangleVertical, 
  RectangleHorizontal, 
  Sliders, 
  Sparkles, 
  Check, 
  Info,
  Flame,
  Maximize2
} from 'lucide-react';

export type AspectRatioType = '1:1' | '9:16' | '4:5' | '2:3' | '16:9' | 'custom';

export interface AspectRatioOption {
  id: AspectRatioType;
  label: string;
  sublabel: string;
  dimensions: string;
  defaultW: number;
  defaultH: number;
  badge?: string;
  badgeIcon?: React.ComponentType<{ size?: number; className?: string }>;
  badgeColor?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  ratioVisual: React.ReactNode;
}

export const ASPECT_RATIO_PRESETS: AspectRatioOption[] = [
  {
    id: '1:1',
    label: '1:1 Persegi',
    sublabel: 'Avatar, Feed & WhatsApp',
    dimensions: '1080 × 1080 px',
    defaultW: 1080,
    defaultH: 1080,
    badge: 'Standar',
    badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    icon: Square,
    ratioVisual: (
      <div className="w-6 h-6 rounded-md border-2 border-current flex items-center justify-center">
        <div className="w-2.5 h-2.5 bg-current rounded-xs opacity-50" />
      </div>
    ),
  },
  {
    id: '9:16',
    label: '9:16 Story',
    sublabel: 'WA Status, IG Story, TikTok',
    dimensions: '1080 × 1920 px',
    defaultW: 1080,
    defaultH: 1920,
    badge: 'Populer',
    badgeIcon: Flame,
    badgeColor: 'bg-orange-50 text-[#F26522] dark:bg-orange-950/50 dark:text-orange-400 border-orange-200 dark:border-orange-900',
    icon: Smartphone,
    ratioVisual: (
      <div className="w-4 h-7 rounded-md border-2 border-current flex items-center justify-center">
        <div className="w-1.5 h-3 bg-current rounded-xs opacity-50" />
      </div>
    ),
  },
  {
    id: '4:5',
    label: '4:5 Portrait',
    sublabel: 'Feed Instagram Portrait',
    dimensions: '1080 × 1350 px',
    defaultW: 1080,
    defaultH: 1350,
    badge: 'Feed Pro',
    badgeColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    icon: RectangleVertical,
    ratioVisual: (
      <div className="w-5 h-6.5 rounded-md border-2 border-current flex items-center justify-center">
        <div className="w-2 h-2.5 bg-current rounded-xs opacity-50" />
      </div>
    ),
  },
  {
    id: '2:3',
    label: '2:3 Poster',
    sublabel: 'Cetak, Poster & Portrait',
    dimensions: '1080 × 1620 px',
    defaultW: 1080,
    defaultH: 1620,
    badge: 'Poster',
    badgeColor: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900',
    icon: RectangleVertical,
    ratioVisual: (
      <div className="w-4.5 h-6.5 rounded-md border-2 border-current flex items-center justify-center">
        <div className="w-2 h-3 bg-current rounded-xs opacity-50" />
      </div>
    ),
  },
  {
    id: '16:9',
    label: '16:9 Landscape',
    sublabel: 'Zoom BG, YouTube, Banner',
    dimensions: '1920 × 1080 px',
    defaultW: 1920,
    defaultH: 1080,
    badge: 'Landscape',
    badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    icon: RectangleHorizontal,
    ratioVisual: (
      <div className="w-7 h-4 rounded-md border-2 border-current flex items-center justify-center">
        <div className="w-3 h-1.5 bg-current rounded-xs opacity-50" />
      </div>
    ),
  },
  {
    id: 'custom',
    label: 'Ukuran Kustom',
    sublabel: 'Bebas pixel / Auto-detect',
    dimensions: 'Manual / PNG Asli',
    defaultW: 1080,
    defaultH: 1080,
    badge: 'Bebas',
    badgeColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    icon: Sliders,
    ratioVisual: (
      <div className="w-6 h-6 rounded-md border-2 border-dashed border-current flex items-center justify-center">
        <div className="text-[9px] font-black leading-none">Px</div>
      </div>
    ),
  },
];

export function getAspectRatioMeta(aspectRatio?: string | null, width?: number | null, height?: number | null) {
  const w = width || 1080;
  const h = height || 1080;

  switch (aspectRatio) {
    case '9:16':
      return {
        id: '9:16',
        label: '9:16 Story / Status',
        badge: '9:16 Story',
        dimensions: `${w} × ${h} px`,
        cssAspect: '9/16',
        isPortrait: true,
      };
    case '4:5':
      return {
        id: '4:5',
        label: '4:5 Feed Portrait',
        badge: '4:5 Portrait',
        dimensions: `${w} × ${h} px`,
        cssAspect: '4/5',
        isPortrait: true,
      };
    case '2:3':
      return {
        id: '2:3',
        label: '2:3 Poster / Portrait',
        badge: '2:3 Poster',
        dimensions: `${w} × ${h} px`,
        cssAspect: '2/3',
        isPortrait: true,
      };
    case '16:9':
      return {
        id: '16:9',
        label: '16:9 Landscape',
        badge: '16:9 Wide',
        dimensions: `${w} × ${h} px`,
        cssAspect: '16/9',
        isLandscape: true,
      };
    case 'custom':
      return {
        id: 'custom',
        label: `Kustom (${w} × ${h} px)`,
        badge: `${w}×${h}`,
        dimensions: `${w} × ${h} px`,
        cssAspect: `${w}/${h}`,
        isCustom: true,
      };
    case '1:1':
    default:
      return {
        id: '1:1',
        label: '1:1 Persegi',
        badge: '1:1 Persegi',
        dimensions: `${w} × ${h} px`,
        cssAspect: '1/1',
        isSquare: true,
      };
  }
}

export function detectImageDimensions(file: File): Promise<{ width: number; height: number; matchedPreset: AspectRatioType }> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const width = img.naturalWidth || img.width || 1080;
      const height = img.naturalHeight || img.height || 1080;
      URL.revokeObjectURL(objectUrl);

      const ratio = width / height;
      let matchedPreset: AspectRatioType = 'custom';

      // 1:1 tolerance (e.g. 0.96 - 1.04)
      if (Math.abs(ratio - 1) < 0.04) {
        matchedPreset = '1:1';
      } 
      // 9:16 = 0.5625
      else if (Math.abs(ratio - (9 / 16)) < 0.04) {
        matchedPreset = '9:16';
      } 
      // 4:5 = 0.8
      else if (Math.abs(ratio - (4 / 5)) < 0.04) {
        matchedPreset = '4:5';
      }
      // 2:3 = 0.6666...
      else if (Math.abs(ratio - (2 / 3)) < 0.04) {
        matchedPreset = '2:3';
      }
      // 16:9 = 1.777
      else if (Math.abs(ratio - (16 / 9)) < 0.04) {
        matchedPreset = '16:9';
      }

      resolve({ width, height, matchedPreset });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: 1080, height: 1080, matchedPreset: '1:1' });
    };
    img.src = objectUrl;
  });
}

interface TwibbonAspectRatioSelectorProps {
  aspectRatio: AspectRatioType;
  onChangeAspectRatio: (ratio: AspectRatioType, defaultW: number, defaultH: number) => void;
  width: number;
  height: number;
  onChangeWidth: (w: number) => void;
  onChangeHeight: (h: number) => void;
  autoDetectNotice?: string | null;
  onClearAutoDetectNotice?: () => void;
}

export function TwibbonAspectRatioSelector({
  aspectRatio,
  onChangeAspectRatio,
  width,
  height,
  onChangeWidth,
  onChangeHeight,
  autoDetectNotice,
  onClearAutoDetectNotice,
}: TwibbonAspectRatioSelectorProps) {
  const currentRatioNum = width > 0 && height > 0 ? (width / height).toFixed(2) : '1.00';

  return (
    <div className="space-y-3">
      {/* Label and Hint */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
          Format & Rasio Ukuran Bingkai
        </label>
        <span className="text-[11px] font-bold text-[#F26522] flex items-center gap-1">
          <Sparkles size={12} />
          <span>Multi-Format Siap Pakai</span>
        </span>
      </div>

      {/* Auto-detect notification pill if user uploaded PNG */}
      {autoDetectNotice && (
        <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 flex items-center justify-between gap-2 text-xs text-orange-900 dark:text-orange-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-[#F26522] text-white rounded-md shrink-0">
              <Sparkles size={12} />
            </span>
            <span className="font-semibold">{autoDetectNotice}</span>
          </div>
          {onClearAutoDetectNotice && (
            <button
              type="button"
              onClick={onClearAutoDetectNotice}
              className="text-orange-400 hover:text-orange-600 font-bold text-sm px-1"
            >
              &times;
            </button>
          )}
        </div>
      )}

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {ASPECT_RATIO_PRESETS.map((preset) => {
          const isSelected = aspectRatio === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChangeAspectRatio(preset.id, preset.defaultW, preset.defaultH)}
              className={`relative p-3 rounded-2xl border text-left flex flex-col justify-between transition-all group cursor-pointer ${
                isSelected
                  ? 'border-[#F26522] bg-orange-50/70 dark:bg-orange-950/40 ring-2 ring-[#F26522]/30 shadow-xs scale-[1.02]'
                  : 'border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-800'
              }`}
            >
              {/* Top row: Visual Silhouette + Badge */}
              <div className="flex items-start justify-between mb-2.5 w-full">
                <div
                  className={`transition-colors ${
                    isSelected ? 'text-[#F26522]' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }`}
                >
                  {preset.ratioVisual}
                </div>

                {isSelected ? (
                  <span className="w-5 h-5 bg-[#F26522] text-white rounded-full flex items-center justify-center shrink-0 shadow-2xs">
                    <Check size={11} strokeWidth={3} />
                  </span>
                ) : preset.badge ? (
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border leading-none flex items-center gap-1 ${preset.badgeColor}`}
                  >
                    {preset.badgeIcon && <preset.badgeIcon size={10} className="shrink-0" />}
                    <span>{preset.badge}</span>
                  </span>
                ) : null}
              </div>

              {/* Title & Dimension Subtext */}
              <div>
                <p
                  className={`text-xs font-black leading-tight ${
                    isSelected ? 'text-[#F26522]' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {preset.label}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug line-clamp-1">
                  {preset.sublabel}
                </p>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1">
                  {preset.id === 'custom' && aspectRatio === 'custom'
                    ? `${width} × ${height} px`
                    : preset.dimensions}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Size Form Drawer (Active if 'custom' is selected) */}
      {aspectRatio === 'custom' && (
        <div className="p-4 bg-orange-50/30 dark:bg-gray-800/80 rounded-2xl border border-orange-200/80 dark:border-gray-700/80 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Sliders size={14} className="text-[#F26522]" />
              <span>Pengaturan Ukuran Kustom (Pixel)</span>
            </span>
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700">
              Rasio Saat Ini: <strong className="text-[#F26522] font-black">{currentRatioNum} : 1</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                Lebar (Width px)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={300}
                  max={4000}
                  value={width}
                  onChange={(e) => onChangeWidth(Math.max(100, parseInt(e.target.value) || 1080))}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#F26522]"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-gray-400">px</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                Tinggi (Height px)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={300}
                  max={4000}
                  value={height}
                  onChange={(e) => onChangeHeight(Math.max(100, parseInt(e.target.value) || 1080))}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#F26522]"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-gray-400">px</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
