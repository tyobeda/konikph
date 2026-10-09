import React from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useTheme } from '@/context/ThemeContext';

interface PksLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  forceWhite?: boolean;
}

export const PksLogo: React.FC<PksLogoProps> = ({ className = '', size = 'md', forceWhite = false }) => {
  const { siteSettings } = useData();
  const { isDark } = useTheme();
  const [imageFailed, setImageFailed] = React.useState(false);
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const logoHeight = size === 'sm' ? '28px' : size === 'lg' ? '48px' : '40px';

  // Official custom logos in public/uploads:
  const FALLBACK_NORMAL_LOGO = '/uploads/1785832971571.png';
  const FALLBACK_WHITE_LOGO = '/uploads/1785833539740.png';

  // White logo preferred in dark mode:
  // 1. logoFooterUrl is explicitly "Logo Putih (Footer)" in admin settings
  // 2. logoAdminUrl is white text variant
  // 3. logoUrl fallback
  const whiteLogoUrl =
    siteSettings?.logoFooterUrl?.trim() && siteSettings.logoFooterUrl !== '/favicon.ico'
      ? siteSettings.logoFooterUrl
      : siteSettings?.logoAdminUrl?.trim() && siteSettings.logoAdminUrl !== '/favicon.ico'
      ? siteSettings.logoAdminUrl
      : siteSettings?.logoUrl?.trim() && siteSettings.logoUrl !== '/favicon.ico'
      ? siteSettings.logoUrl
      : FALLBACK_WHITE_LOGO;

  const normalLogoUrl =
    siteSettings?.logoUrl?.trim() && siteSettings.logoUrl !== '/favicon.ico'
      ? siteSettings.logoUrl
      : FALLBACK_NORMAL_LOGO;

  const hasCustomLogo = !imageFailed;
  const hasDistinctWhiteLogo = Boolean(whiteLogoUrl && whiteLogoUrl !== normalLogoUrl && !imageFailed);

  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-bold tracking-tight select-none ${className}`}>
      {hasCustomLogo ? (
        forceWhite ? (
          <img
            src={whiteLogoUrl || normalLogoUrl}
            alt={siteSettings?.siteName || 'PKSart'}
            onError={() => setImageFailed(true)}
            fetchPriority="high"
            decoding="sync"
            className="object-contain h-auto"
            style={{ height: logoHeight, maxWidth: '180px' }}
          />
        ) : hasDistinctWhiteLogo ? (
          <>
            {/* Light Mode Logo (hidden when dark mode active) */}
            <img
              src={normalLogoUrl}
              alt={siteSettings?.siteName || 'PKSart'}
              onError={() => setImageFailed(true)}
              fetchPriority="high"
              decoding="sync"
              className="object-contain h-auto dark:hidden"
              style={{ height: logoHeight, maxWidth: '180px' }}
            />
            {/* Dark Mode White Logo (shown when dark mode active) */}
            <img
              src={whiteLogoUrl}
              alt={siteSettings?.siteName || 'PKSart'}
              onError={() => setImageFailed(true)}
              fetchPriority="high"
              decoding="sync"
              className="object-contain h-auto hidden dark:block"
              style={{ height: logoHeight, maxWidth: '180px' }}
            />
          </>
        ) : (
          <img
            src={isDark ? whiteLogoUrl : normalLogoUrl}
            alt={siteSettings?.siteName || 'PKSart'}
            onError={() => setImageFailed(true)}
            fetchPriority="high"
            decoding="sync"
            className="object-contain h-auto"
            style={{ height: logoHeight, maxWidth: '180px' }}
          />
        )
      ) : (
        <>
          {/* PKS Emblem Circle */}
          <div 
            className="relative flex items-center justify-center rounded-full bg-[#F26522] text-white shadow-sm transition-transform hover:scale-105"
            style={{ width: iconSize, height: iconSize }}
          >
            <svg 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-3/4 h-3/4"
            >
              {/* Outer circle accent */}
              <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="3" fill="none" opacity="0.3"/>
              {/* Stylized PKS Rice/Wheat symbol */}
              <path 
                d="M38 22C38 38 48 48 48 68C48 78 40 82 34 82C46 82 56 70 54 52C52 38 42 26 38 22Z" 
                fill="white" 
              />
              <path 
                d="M62 22C62 38 52 48 52 68C52 78 60 82 66 82C54 82 44 70 46 52C48 38 58 26 62 22Z" 
                fill="white" 
              />
              <circle cx="50" cy="32" r="4" fill="white" />
              <circle cx="50" cy="46" r="4" fill="white" />
              <circle cx="50" cy="60" r="4" fill="white" />
            </svg>
          </div>

          {/* Brand Text: PKSart (White in dark mode) */}
          <div className={`flex items-center font-extrabold ${textSize} font-sans leading-none`}>
            <span className="text-[#F26522] dark:text-white transition-colors">PKS</span>
            <span className="text-[#E53935] dark:text-[#F26522] font-medium ml-[1px] transition-colors">art</span>
          </div>
        </>
      )}
    </Link>
  );
};
