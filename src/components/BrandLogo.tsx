import React from 'react';
import { useStore } from '../context/StoreContext';
import { AVAILABLE_HEADING_FONTS } from '../lib/fonts';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dark?: boolean;
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  dark = false,
  showText = true,
}) => {
  const { branding } = useStore();

  // Size mappings
  const textSizes = {
    sm: 'text-lg sm:text-xl tracking-[0.16em]',
    md: 'text-xl sm:text-2xl tracking-[0.18em]',
    lg: 'text-2xl sm:text-3xl tracking-[0.2em]',
    xl: 'text-3xl sm:text-4xl tracking-[0.22em]',
  };

  const imageSizes = {
    sm: 'h-6 w-auto max-w-[28px]',
    md: 'h-7 sm:h-8 w-auto max-w-[36px]',
    lg: 'h-8 sm:h-9 w-auto max-w-[44px]',
    xl: 'h-10 sm:h-11 w-auto max-w-[52px]',
  };

  const outColor = dark ? 'text-white' : 'text-[#111111]';
  const fitColor = 'text-[#FACC15]';

  const headingFont = AVAILABLE_HEADING_FONTS.find((f) => f.id === branding.fontFamily);
  const customFontStyle = headingFont ? { fontFamily: headingFont.cssFamily } : undefined;

  const websiteName = (branding.websiteName || 'Outfit').trim();
  const isDefaultOutfit = websiteName.toLowerCase() === 'outfit';

  // Render the brand text segment
  const renderBrandText = () => {
    if (!showText) return null;

    if (isDefaultOutfit) {
      return (
        <span
          style={customFontStyle}
          className={`font-serif font-semibold select-none uppercase inline-flex items-baseline ${textSizes[size]}`}
        >
          <span className={outColor}>Out</span>
          <span className={fitColor}>Fit</span>
        </span>
      );
    }

    // Custom website brand name
    return (
      <span
        style={customFontStyle}
        className={`font-serif font-semibold select-none uppercase truncate ${textSizes[size]} ${outColor}`}
      >
        {websiteName}
      </span>
    );
  };

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 ${className}`}>
      {/* Uploaded custom image logo */}
      {branding.logoUrl && (
        <img
          src={branding.logoUrl}
          alt={websiteName}
          referrerPolicy="no-referrer"
          className={`object-contain shrink-0 ${imageSizes[size]}`}
        />
      )}

      {/* Brand Name Text (rendered beside the logo image or standalone) */}
      {renderBrandText()}
    </div>
  );
};
