export interface FontOption {
  id: string;
  name: string;
  category: 'Serif / Luxury' | 'Sans-Serif / Modern';
  cssFamily: string;
  sampleText: string;
  badge?: string;
  description: string;
}

export const AVAILABLE_HEADING_FONTS: FontOption[] = [
  {
    id: 'Cormorant Garamond',
    name: 'Cormorant Garamond',
    category: 'Serif / Luxury',
    cssFamily: '"Cormorant Garamond", Georgia, Cambria, serif',
    sampleText: 'OutFit Luxury Atelier',
    badge: 'DEFAULT',
    description: 'Refined Parisian luxury with delicate strokes and high contrast.',
  },
  {
    id: 'Cinzel',
    name: 'Cinzel',
    category: 'Serif / Luxury',
    cssFamily: '"Cinzel", Georgia, serif',
    sampleText: 'OUTFIT TIMELESS COUTURE',
    badge: 'LUXURY',
    description: 'Roman classical stone-engraved proportions for high-end luxury brands.',
  },
  {
    id: 'Playfair Display',
    name: 'Playfair Display',
    category: 'Serif / Luxury',
    cssFamily: '"Playfair Display", Georgia, serif',
    sampleText: 'Outfit Modern Sartorial',
    description: 'High-contrast editorial serif inspired by 18th-century European luxury prints.',
  },
  {
    id: 'Bodoni Moda',
    name: 'Bodoni Moda',
    category: 'Serif / Luxury',
    cssFamily: '"Bodoni Moda", Didot, serif',
    sampleText: 'OUTFIT HIGH FASHION',
    badge: 'EDITORIAL',
    description: 'Dramatic vertical contrast reminiscent of Vogue and Harper’s Bazaar headlines.',
  },
  {
    id: 'Marcellus',
    name: 'Marcellus',
    category: 'Serif / Luxury',
    cssFamily: '"Marcellus", Georgia, serif',
    sampleText: 'Outfit Sculptural Essentials',
    description: 'Toned-down classical Roman lettering with flared terminals and serene presence.',
  },
  {
    id: 'Prata',
    name: 'Prata',
    category: 'Serif / Luxury',
    cssFamily: '"Prata", Georgia, serif',
    sampleText: 'Outfit Handcrafted Goods',
    description: 'Teardrop terminals and sharp contrast for artisanal craftsmanship.',
  },
  {
    id: 'Lora',
    name: 'Lora',
    category: 'Serif / Luxury',
    cssFamily: '"Lora", Georgia, serif',
    sampleText: 'Outfit Understated Elegance',
    description: 'Contemporary balanced serif with warm calligraphic curves.',
  },
  {
    id: 'Outfit',
    name: 'Outfit',
    category: 'Sans-Serif / Modern',
    cssFamily: '"Outfit", -apple-system, sans-serif',
    sampleText: 'OUTFIT MINIMAL LIVING',
    badge: 'BRAND MATCH',
    description: 'Geometric, impeccably balanced modern sans designed for digital luxury.',
  },
  {
    id: 'Plus Jakarta Sans',
    name: 'Plus Jakarta Sans',
    category: 'Sans-Serif / Modern',
    cssFamily: '"Plus Jakarta Sans", -apple-system, sans-serif',
    sampleText: 'Outfit Contemporary Studio',
    description: 'Modern neo-grotesque sans with crisp legibility and refined geometry.',
  },
  {
    id: 'Montserrat',
    name: 'Montserrat',
    category: 'Sans-Serif / Modern',
    cssFamily: '"Montserrat", -apple-system, sans-serif',
    sampleText: 'OUTFIT ARCHITECTURAL',
    description: 'Urban geometric sans with wide tracking and structured rhythm.',
  },
];

export const AVAILABLE_BODY_FONTS: FontOption[] = [
  {
    id: 'Plus Jakarta Sans',
    name: 'Plus Jakarta Sans',
    category: 'Sans-Serif / Modern',
    cssFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    sampleText: 'Virgin wool and organic double-faced cashmere tailored with precision.',
    badge: 'RECOMMENDED',
    description: 'Exceptional readability on mobile and high-density screens.',
  },
  {
    id: 'Outfit',
    name: 'Outfit',
    category: 'Sans-Serif / Modern',
    cssFamily: '"Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
    sampleText: 'Sculptural silhouettes engineered for modern nomads.',
    description: 'Sleek, geometric letterforms that complement luxury serif headings.',
  },
  {
    id: 'Montserrat',
    name: 'Montserrat',
    category: 'Sans-Serif / Modern',
    cssFamily: '"Montserrat", -apple-system, sans-serif',
    sampleText: 'Timeless luxury essentials designed with organic cotton and Italian leather.',
    description: 'Clean architectural proportions for modern lifestyle and product descriptions.',
  },
  {
    id: 'Lora',
    name: 'Lora',
    category: 'Serif / Luxury',
    cssFamily: '"Lora", Georgia, Cambria, serif',
    sampleText: 'Masterfully crafted in northern Italy with fine artisanal leather.',
    description: 'Literary serif body text for high-end bespoke atelier storytelling.',
  },
  {
    id: 'Cormorant Garamond',
    name: 'Cormorant Garamond',
    category: 'Serif / Luxury',
    cssFamily: '"Cormorant Garamond", Georgia, serif',
    sampleText: 'A curated capsule collection of architectural garments and leather goods.',
    description: 'All-serif aesthetic for an ultra-exclusive vintage haute couture feel.',
  },
];

export interface TypographyPreset {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
  tagline: string;
}

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  {
    id: 'preset_haute_couture',
    name: 'Haute Couture',
    headingFont: 'Cormorant Garamond',
    bodyFont: 'Plus Jakarta Sans',
    tagline: 'Parisian delicate serif with ultra-clean modern UI',
  },
  {
    id: 'preset_imperial_luxury',
    name: 'Imperial Luxury',
    headingFont: 'Cinzel',
    bodyFont: 'Plus Jakarta Sans',
    tagline: 'Roman stone-engraved uppercase with crisp sans body',
  },
  {
    id: 'preset_vogue_editorial',
    name: 'Vogue Editorial',
    headingFont: 'Bodoni Moda',
    bodyFont: 'Montserrat',
    tagline: 'High-contrast fashion magazine typography',
  },
  {
    id: 'preset_modern_atelier',
    name: 'Modern Atelier',
    headingFont: 'Outfit',
    bodyFont: 'Plus Jakarta Sans',
    tagline: 'Pure contemporary geometric minimalism',
  },
  {
    id: 'preset_classic_romance',
    name: 'Classic Romance',
    headingFont: 'Playfair Display',
    bodyFont: 'Lora',
    tagline: 'Warm editorial serif pairing for bespoke artisan stores',
  },
  {
    id: 'preset_sculptural_studio',
    name: 'Sculptural Studio',
    headingFont: 'Marcellus',
    bodyFont: 'Outfit',
    tagline: 'Flared classical Roman title with contemporary sans body',
  },
];

/**
 * Apply selected fonts dynamically to the document root and CSS variables
 */
export function applyStoreFonts(headingFontId?: string, bodyFontId?: string) {
  if (typeof document === 'undefined') return;

  const headingFont = AVAILABLE_HEADING_FONTS.find((f) => f.id === headingFontId) || AVAILABLE_HEADING_FONTS[0];
  const bodyFont = AVAILABLE_BODY_FONTS.find((f) => f.id === bodyFontId) || AVAILABLE_BODY_FONTS[0];

  const root = document.documentElement;
  
  // Set CSS variables
  root.style.setProperty('--font-serif', headingFont.cssFamily);
  root.style.setProperty('--font-luxury', headingFont.cssFamily);
  root.style.setProperty('--font-sans', bodyFont.cssFamily);
  
  // Set direct body font family
  document.body.style.fontFamily = bodyFont.cssFamily;
}
