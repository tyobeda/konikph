import React from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useTheme } from '@/context/ThemeContext';

export interface KoniLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  forceWhite?: boolean;
  showText?: boolean;
}

export const KoniLogo: React.FC<KoniLogoProps> = ({
  className = '',
  size = 'md',
  forceWhite = false,
  showText = true,
}) => {
  const { siteSettings } = useData();
  const { isDark } = useTheme();
  const [imageFailed, setImageFailed] = React.useState(false);
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl sm:text-2xl' : 'text-sm sm:text-base';
  const logoHeight = size === 'sm' ? '28px' : size === 'lg' ? '44px' : '36px';

  // White logo preferred in dark mode:
  const whiteLogoUrl =
    siteSettings?.logoFooterUrl?.trim() && siteSettings.logoFooterUrl !== '/favicon.ico'
      ? siteSettings.logoFooterUrl
      : siteSettings?.logoAdminUrl?.trim() && siteSettings.logoAdminUrl !== '/favicon.ico'
      ? siteSettings.logoAdminUrl
      : siteSettings?.logoUrl?.trim() && siteSettings.logoUrl !== '/favicon.ico'
      ? siteSettings.logoUrl
      : '';

  const normalLogoUrl =
    siteSettings?.logoUrl?.trim() && siteSettings.logoUrl !== '/favicon.ico'
      ? siteSettings.logoUrl
      : '';

  const hasCustomLogo = Boolean((normalLogoUrl || whiteLogoUrl) && !imageFailed);
  const hasDistinctWhiteLogo = Boolean(whiteLogoUrl && whiteLogoUrl !== normalLogoUrl && !imageFailed);

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 font-bold tracking-tight select-none shrink-0 ${className}`}>
      {/* 1. Emblem / Icon (Custom Logo or Fallback SVG) */}
      {hasCustomLogo ? (
        forceWhite ? (
          <img
            src={whiteLogoUrl || normalLogoUrl}
            alt={siteSettings?.siteName || 'KONI Kabupaten Kepahiang'}
            onError={() => setImageFailed(true)}
            fetchPriority="high"
            decoding="sync"
            className="object-contain w-auto shrink-0"
            style={{ height: logoHeight, maxHeight: logoHeight }}
          />
        ) : hasDistinctWhiteLogo ? (
          <>
            {/* Light Mode Logo */}
            <img
              src={normalLogoUrl}
              alt={siteSettings?.siteName || 'KONI Kabupaten Kepahiang'}
              onError={() => setImageFailed(true)}
              fetchPriority="high"
              decoding="sync"
              className="object-contain w-auto shrink-0 dark:hidden"
              style={{ height: logoHeight, maxHeight: logoHeight }}
            />
            {/* Dark Mode White Logo */}
            <img
              src={whiteLogoUrl}
              alt={siteSettings?.siteName || 'KONI Kabupaten Kepahiang'}
              onError={() => setImageFailed(true)}
              fetchPriority="high"
              decoding="sync"
              className="object-contain w-auto shrink-0 hidden dark:block"
              style={{ height: logoHeight, maxHeight: logoHeight }}
            />
          </>
        ) : (
          <img
            src={isDark ? (whiteLogoUrl || normalLogoUrl) : (normalLogoUrl || whiteLogoUrl)}
            alt={siteSettings?.siteName || 'KONI Kabupaten Kepahiang'}
            onError={() => setImageFailed(true)}
            fetchPriority="high"
            decoding="sync"
            className="object-contain w-auto shrink-0"
            style={{ height: logoHeight, maxHeight: logoHeight }}
          />
        )
      ) : (
        /* Fallback KONI Emblem SVG */
        <div 
          className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-red-700 via-red-600 to-amber-500 text-white shadow-sm shrink-0"
          style={{ width: iconSize, height: iconSize }}
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-3/5 h-3/5 text-white"
          >
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="white" stroke="none" />
          </svg>
        </div>
      )}

      {/* 2. Brand Text: KONI KEPAHIANG */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className={`flex items-center font-black ${textSize} tracking-tight font-sans whitespace-nowrap`}>
            <span className={forceWhite ? "text-white" : "text-red-600 dark:text-red-500 transition-colors"}>
              KONI
            </span>
            <span className={forceWhite ? "text-white ml-1.5 font-black" : "text-gray-900 dark:text-white font-black ml-1.5 transition-colors"}>
              KEPAHIANG
            </span>
          </div>
          <span className={forceWhite ? "text-[8.5px] font-bold text-white/70 tracking-wider uppercase mt-0.5 whitespace-nowrap" : "text-[8.5px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase mt-0.5 whitespace-nowrap"}>
            Kab. Kepahiang
          </span>
        </div>
      )}
    </Link>
  );
};
