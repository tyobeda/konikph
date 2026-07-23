import React from 'react';
import Link from 'next/link';

interface PksLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PksLogo: React.FC<PksLogoProps> = ({ className = '', size = 'md' }) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-bold tracking-tight select-none ${className}`}>
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

      {/* Brand Text: PKSart */}
      <div className={`flex items-center font-extrabold ${textSize} font-sans leading-none`}>
        <span className="text-[#F26522]">PKS</span>
        <span className="text-[#E53935] font-medium ml-[1px]">art</span>
      </div>
    </Link>
  );
};
