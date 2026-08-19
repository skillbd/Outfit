import React from 'react';
import { useStore } from '../context/StoreContext';
import { AVAILABLE_HEADING_FONTS } from '../lib/fonts';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dark?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  dark = false,
}) => {
  const { branding } = useStore();

  // If user uploaded a custom image logo in admin, use it
  if (branding.logoUrl) {
    return (
      <img
        src={branding.logoUrl}
        alt={branding.websiteName || 'Outfit'}
        referrerPolicy="no-referrer"
        className={`object-contain max-h-8 ${className}`}
      />
    );
  }

  // Size mapping
  const sizeClasses = {
    sm: 'text-lg tracking-[0.18em]',
    md: 'text-xl sm:text-2xl tracking-[0.2em]',
    lg: 'text-2xl sm:text-3xl tracking-[0.22em]',
    xl: 'text-3xl sm:text-4xl tracking-[0.25em]',
  };

  const outColor = dark ? 'text-white' : 'text-[#111111]';
  const fitColor = 'text-[#FACC15]';

  const headingFont = AVAILABLE_HEADING_FONTS.find((f) => f.id === branding.fontFamily);
  const customFontStyle = headingFont ? { fontFamily: headingFont.cssFamily } : undefined;

  return (
    <div
      style={customFontStyle}
      className={`inline-flex items-baseline font-serif font-medium select-none uppercase ${sizeClasses[size]} ${className}`}
    >
      <span className={outColor}>Out</span>
      <span className={fitColor}>Fit</span>
    </div>
  );
};
