import React from 'react';
import { useStore } from '../context/StoreContext';
import { AVAILABLE_HEADING_FONTS } from '../lib/fonts';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dark?: boolean;
  showText?: boolean;
  customHeight?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  dark = false,
  showText = true,
  customHeight,
}) => {
  const { branding } = useStore();

  const defaultImageHeights = {
    sm: 26,
    md: 36,
    lg: 46,
    xl: 58,
  };

  const textSizes = {
    sm: 'text-lg sm:text-xl tracking-[0.16em]',
    md: 'text-xl sm:text-2xl tracking-[0.18em]',
    lg: 'text-2xl sm:text-3xl tracking-[0.2em]',
    xl: 'text-3xl sm:text-4xl tracking-[0.22em]',
  };

  const outColor = dark ? 'text-white' : 'text-[#111111]';
  const outFill = dark ? '#FFFFFF' : '#111111';
  const dotStroke = dark ? '#9CA3AF' : '#111111';
  const premiumFill = dark ? '#E5E7EB' : '#111111';
  const fitColor = 'text-[#FACC15]';

  const headingFont = AVAILABLE_HEADING_FONTS.find((f) => f.id === branding.fontFamily);
  const activeFontFamily = headingFont?.cssFamily || '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const customFontStyle = { fontFamily: activeFontFamily };

  const websiteName = (branding.websiteName || 'Outfit').trim();
  const isDefaultOutfit = websiteName.toLowerCase() === 'outfit' || websiteName.toLowerCase() === 'outfit premium';

  const [imgError, setImgError] = React.useState(false);

  // Reset error when logoUrl changes
  React.useEffect(() => {
    setImgError(false);
  }, [branding.logoUrl]);

  // Determine logo image height
  const configuredHeight = customHeight ?? branding.logoHeight ?? defaultImageHeights[size];
  const textScale = (branding.logoTextScale ?? 100) / 100;

  // If a custom logo image URL is uploaded by user in Admin Branding
  if (branding.logoUrl && !imgError) {
    return (
      <div className={`inline-flex items-center gap-2 sm:gap-3 ${className}`}>
        <img
          src={branding.logoUrl}
          alt={websiteName}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          style={{
            height: `${configuredHeight}px`,
            maxHeight: `${configuredHeight}px`,
            width: 'auto',
          }}
          className="object-contain shrink-0 transition-all"
        />
        {branding.showLogoText !== false && showText && (
          <span
            style={customFontStyle}
            className={`font-serif font-semibold select-none uppercase truncate ${textSizes[size]} ${outColor}`}
          >
            {websiteName}
          </span>
        )}
      </div>
    );
  }

  // If default brand is Outfit, render the high-fidelity Outfit Premium brand image vector logo
  if (isDefaultOutfit) {
    const scaleFactor = (configuredHeight / 36) * textScale;
    const svgWidth = 195 * scaleFactor;
    const svgHeight = 65 * scaleFactor;

    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <svg
          viewBox="0 0 600 200"
          style={{ width: `${svgWidth}px`, height: `${svgHeight}px` }}
          className="shrink-0 transition-all overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left Emblem: Yellow Circle + Hanger + Shirt + Swoosh */}
          <g transform="translate(10, 5)">
            {/* Hanger Hook */}
            <path
              d="M 98 46 C 98 28, 116 18, 126 30 C 135 39, 126 52, 124 60 L 124 72"
              stroke="#FACC15"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Circular Frame */}
            <path
              d="M 62 158 C 36 132, 34 88, 58 58 C 86 24, 140 22, 172 50 C 200 74, 204 118, 182 148"
              stroke="#FACC15"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
            />
            {/* Hanger Triangle */}
            <path
              d="M 70 104 L 124 68 L 178 104"
              stroke="#FACC15"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Minimalist Shirt Silhouette */}
            <path
              d="M 88 112 L 76 124 L 92 140 L 100 132 L 100 156 L 148 156 L 148 132 L 156 140 L 172 124 L 160 112 C 148 122, 100 122, 88 112 Z"
              stroke="#FACC15"
              strokeWidth="7"
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
            {/* Dynamic Swirling Swoosh */}
            <path
              d="M 42 178 C 80 154, 130 140, 195 114 C 162 180, 95 190, 42 178 Z"
              fill="#FACC15"
            />
            <path
              d="M 42 178 C 98 154, 145 134, 204 110"
              stroke="#FACC15"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Right Typography */}
          {/* "Out" */}
          <text
            x="240"
            y="126"
            fontFamily={activeFontFamily}
            fontWeight="800"
            fontSize="84"
            fill={outFill}
            letterSpacing="-0.5"
          >
            Out
          </text>

          {/* "fit" */}
          <text
            x="400"
            y="126"
            fontFamily={activeFontFamily}
            fontWeight="800"
            fontSize="84"
            fill="#FACC15"
            letterSpacing="-0.5"
          >
            fit
          </text>

          {/* Dotted underline under "Out" */}
          <line
            x1="244"
            y1="152"
            x2="382"
            y2="152"
            stroke={dotStroke}
            strokeWidth="3.5"
            strokeDasharray="2 7"
            strokeLinecap="round"
          />

          {/* "Premium" subtitle under "fit" */}
          <text
            x="392"
            y="158"
            fontFamily={activeFontFamily}
            fontWeight="600"
            fontSize="28"
            fill={premiumFill}
            letterSpacing="2"
          >
            Premium
          </text>
        </svg>
      </div>
    );
  }

  // Fallback for custom text store name
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span
        style={customFontStyle}
        className={`font-serif font-semibold select-none uppercase truncate ${textSizes[size]} ${outColor}`}
      >
        {websiteName}
      </span>
    </div>
  );
};

