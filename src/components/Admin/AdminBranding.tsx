import React, { useState } from 'react';
import { Save, CheckCircle, Sparkles, Globe, CreditCard, Type, Check, Wand2 } from 'lucide-react';
import { BrandingSettings } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ImageUploadDropzone } from '../ImageUploadDropzone';
import { BrandLogo } from '../BrandLogo';
import {
  AVAILABLE_HEADING_FONTS,
  AVAILABLE_BODY_FONTS,
  TYPOGRAPHY_PRESETS,
  applyStoreFonts,
} from '../../lib/fonts';

export const AdminBranding: React.FC = () => {
  const { branding, updateBranding } = useStore();
  const [formData, setFormData] = useState<BrandingSettings>({
    ...branding,
    fontFamily: branding.fontFamily || 'Cormorant Garamond',
    bodyFontFamily: branding.bodyFontFamily || 'Plus Jakarta Sans',
    bkashNumber: branding.bkashNumber || '01342826145',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live preview font changes immediately as the admin changes them in the form
  const handleHeadingFontChange = (fontId: string) => {
    const next = { ...formData, fontFamily: fontId };
    setFormData(next);
    applyStoreFonts(next.fontFamily, next.bodyFontFamily);
  };

  const handleBodyFontChange = (fontId: string) => {
    const next = { ...formData, bodyFontFamily: fontId };
    setFormData(next);
    applyStoreFonts(next.fontFamily, next.bodyFontFamily);
  };

  const handleApplyPreset = (preset: typeof TYPOGRAPHY_PRESETS[0]) => {
    const next = {
      ...formData,
      fontFamily: preset.headingFont,
      bodyFontFamily: preset.bodyFont,
    };
    setFormData(next);
    applyStoreFonts(next.fontFamily, next.bodyFontFamily);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateBranding(formData);
      applyStoreFonts(formData.fontFamily, formData.bodyFontFamily);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Update branding error:', err);
      alert('Could not update branding settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (images: string[]) => {
    setFormData({ ...formData, logoUrl: images[0] || '' });
  };

  const handleFaviconUpload = (images: string[]) => {
    setFormData({ ...formData, faviconUrl: images[0] || '' });
  };

  const selectedHeadingFont =
    AVAILABLE_HEADING_FONTS.find((f) => f.id === formData.fontFamily) || AVAILABLE_HEADING_FONTS[0];
  const selectedBodyFont =
    AVAILABLE_BODY_FONTS.find((f) => f.id === formData.bodyFontFamily) || AVAILABLE_BODY_FONTS[0];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
            <span>Store Identity, Typography & Payment</span>
          </div>
          <h2 className="text-xl font-bold font-serif text-gray-900">
            Appearance, Font & Branding Settings
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 font-light">
            Customize luxury fonts, brand identity, storefront logo, favicon, and bKash payment settings.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-semibold px-3.5 py-2 rounded-lg border border-emerald-200 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Settings and fonts saved live!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Settings Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6 text-xs">
          
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Type className="w-4 h-4 text-[#111111]" />
              <span>Typography & Store Identity</span>
            </h3>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#111111] font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

          {/* 1. Typography Preset Quick Pairs */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-xs uppercase tracking-wider">
                <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                <span>1-Click Luxury Typography Presets</span>
              </div>
              <span className="text-[10px] text-gray-400">Click to apply instantly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TYPOGRAPHY_PRESETS.map((preset) => {
                const isSelected =
                  formData.fontFamily === preset.headingFont &&
                  formData.bodyFontFamily === preset.bodyFont;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#111111] bg-white ring-2 ring-[#FACC15] shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-xs">{preset.name}</span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#111111] text-[#FACC15] flex items-center justify-center text-[10px]">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      <span className="font-semibold text-gray-700">{preset.headingFont}</span> + {preset.bodyFont}
                    </div>
                    <p className="text-[9px] text-gray-400 mt-0.5 truncate">{preset.tagline}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Heading / Brand Logo Font Selector */}
          <div className="space-y-2">
            <label className="block font-bold text-gray-900 uppercase text-[11px] flex items-center justify-between">
              <span>Primary Heading & Brand Font</span>
              <span className="text-gray-400 font-normal normal-case text-[10px]">
                Applied to headers, logo, and titles
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 border border-gray-100 p-2 rounded-xl bg-gray-50/50">
              {AVAILABLE_HEADING_FONTS.map((font) => {
                const isSelected = formData.fontFamily === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => handleHeadingFontChange(font.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#111111] bg-white ring-2 ring-[#FACC15] shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900">{font.name}</span>
                      {font.badge && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                          {font.badge}
                        </span>
                      )}
                    </div>
                    <div
                      style={{ fontFamily: font.cssFamily }}
                      className="text-sm text-gray-800 my-1 truncate font-medium"
                    >
                      {font.sampleText}
                    </div>
                    <p className="text-[9px] text-gray-400 truncate">{font.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Body & UI Font Selector */}
          <div className="space-y-2">
            <label className="block font-bold text-gray-900 uppercase text-[11px] flex items-center justify-between">
              <span>Body & UI Text Font</span>
              <span className="text-gray-400 font-normal normal-case text-[10px]">
                Applied to product descriptions, buttons & details
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_BODY_FONTS.map((font) => {
                const isSelected = formData.bodyFontFamily === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => handleBodyFontChange(font.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#111111] bg-white ring-2 ring-[#FACC15] shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900">{font.name}</span>
                      {font.badge && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {font.badge}
                        </span>
                      )}
                    </div>
                    <div
                      style={{ fontFamily: font.cssFamily }}
                      className="text-xs text-gray-700 my-1 truncate"
                    >
                      {font.sampleText}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Website Name & Currency */}
          <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                Website Brand Name *
              </label>
              <input
                type="text"
                required
                value={formData.websiteName}
                onChange={(e) => setFormData({ ...formData, websiteName: e.target.value })}
                placeholder="e.g. Outfit"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-black focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                Currency Symbol *
              </label>
              <input
                type="text"
                required
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="e.g. ৳, $, €, £"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-black focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* bKash Payment Number Setup */}
          <div className="p-4 bg-pink-50/70 border border-pink-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-pink-900 font-bold text-xs uppercase tracking-wide">
              <CreditCard className="w-4 h-4 text-pink-600" />
              <span>bKash Payment Gateway Account</span>
            </div>
            <label className="block font-bold text-gray-700 uppercase text-[11px]">
              bKash Personal Number (Displayed to Customers at Checkout) *
            </label>
            <input
              type="text"
              required
              value={formData.bkashNumber}
              onChange={(e) => setFormData({ ...formData, bkashNumber: e.target.value })}
              placeholder="e.g. 01342826145"
              className="w-full px-3.5 py-2 border border-pink-300 bg-white rounded-lg focus:border-pink-600 focus:outline-none font-mono font-bold text-pink-900 text-sm tracking-wider"
            />
            <p className="text-gray-500 text-[10px]">
              Customers will see this number during checkout and send the order total via bKash Personal Send Money.
            </p>
          </div>

          {/* Store Logo Upload Dropzone & Sizing Options */}
          <div className="pt-3 border-t border-gray-100 space-y-4">
            <ImageUploadDropzone
              label="Storefront Logo (Firebase Storage / URL)"
              description="Upload high-res PNG, WebP, or SVG logo. Leave empty to use the default 'Outfit' luxury typographic logo."
              images={formData.logoUrl ? [formData.logoUrl] : []}
              onChange={handleLogoUpload}
              multiple={false}
              aspectRatio="square"
            />

            {/* Logo Size & Height Adjustment Controls */}
            <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-xs uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Logo Dimensions & Scale (লোগো সাইজ অপশন)</span>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  {formData.logoHeight || 36}px height
                </span>
              </div>

              {/* Logo Height Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <label className="font-bold text-gray-700 uppercase">
                    Logo Image Height ({formData.logoHeight || 36}px)
                  </label>
                  <span className="text-gray-400 font-normal">Min: 20px • Max: 120px</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={20}
                    max={120}
                    step={2}
                    value={formData.logoHeight || 36}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        logoHeight: parseInt(e.target.value, 10) || 36,
                      })
                    }
                    className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <input
                    type="number"
                    min={20}
                    max={120}
                    value={formData.logoHeight || 36}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        logoHeight: Math.min(120, Math.max(20, parseInt(e.target.value, 10) || 36)),
                      })
                    }
                    className="w-16 px-2 py-1 border border-amber-300 bg-white rounded-md text-xs font-mono font-bold text-center focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Quick Size Presets */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase text-gray-500">
                  Quick Size Presets:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Compact', px: 28 },
                    { label: 'Default', px: 36 },
                    { label: 'Medium', px: 48 },
                    { label: 'Large', px: 64 },
                    { label: 'Extra Large', px: 80 },
                    { label: 'Heroic', px: 100 },
                  ].map((preset) => {
                    const active = (formData.logoHeight || 36) === preset.px;
                    return (
                      <button
                        key={preset.px}
                        type="button"
                        onClick={() => setFormData({ ...formData, logoHeight: preset.px })}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-[#111111] text-[#FACC15] shadow-xs ring-1 ring-[#111111]'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {preset.label} ({preset.px}px)
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand Typography Text Scale */}
              <div className="pt-3 border-t border-amber-200/60 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <label className="font-bold text-gray-700 uppercase">
                    Brand Name Typography Scale ({formData.logoTextScale || 100}%)
                  </label>
                  <span className="text-gray-400 font-normal">80% – 180%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={80}
                    max={180}
                    step={5}
                    value={formData.logoTextScale || 100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        logoTextScale: parseInt(e.target.value, 10) || 100,
                      })
                    }
                    className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <span className="w-14 text-center font-mono font-bold text-xs bg-white py-1 px-1.5 rounded border border-amber-300">
                    {formData.logoTextScale || 100}%
                  </span>
                </div>
              </div>

              {/* Show/Hide Text Toggle when Logo Image is uploaded */}
              {formData.logoUrl && (
                <div className="pt-2 flex items-center justify-between bg-white p-2.5 rounded-lg border border-amber-200">
                  <span className="text-[11px] font-semibold text-gray-800">
                    Show Brand Name text beside uploaded Logo image
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        showLogoText: formData.showLogoText === false ? true : false,
                      })
                    }
                    className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      formData.showLogoText !== false
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {formData.showLogoText !== false ? 'Shown (ON)' : 'Hidden (Logo Only)'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Favicon Upload Dropzone */}
          <div className="pt-3 border-t border-gray-100">
            <ImageUploadDropzone
              label="Browser Tab Favicon (Firebase Storage / URL)"
              description="Upload .ico, .png or .svg icon for browser tab presentation."
              images={formData.faviconUrl ? [formData.faviconUrl] : []}
              onChange={handleFaviconUpload}
              multiple={false}
              aspectRatio="square"
            />
          </div>

          {/* SEO & Browser Titles */}
          <div className="pt-3 border-t border-gray-100 space-y-4">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
              Browser & SEO Metadata
            </h4>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                Browser Tab Title *
              </label>
              <input
                type="text"
                required
                value={formData.websiteTitle}
                onChange={(e) => setFormData({ ...formData, websiteTitle: e.target.value })}
                placeholder="e.g. Outfit | Luxury Fashion & Modern Tailoring"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                Website Meta Description
              </label>
              <textarea
                rows={3}
                value={formData.websiteDescription}
                onChange={(e) => setFormData({ ...formData, websiteDescription: e.target.value })}
                placeholder="A brief summary for search engines and footer descriptions..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-black focus:outline-none"
              />
            </div>
          </div>

          {/* Delivery Fee, Threshold & Contact */}
          <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                Shipping / Delivery Fee ({formData.currency})
              </label>
              <input
                type="number"
                value={formData.deliveryFee ?? 150}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deliveryFee: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="150"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-black focus:outline-none font-semibold font-mono"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Standard: ৳150 (added to Products price)
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                Free Shipping Threshold ({formData.currency})
              </label>
              <input
                type="number"
                value={formData.freeShippingThreshold || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    freeShippingThreshold: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0 (Set 0 to disable)"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-black focus:outline-none font-semibold font-mono"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Set 0 to always charge standard delivery
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="e.g. +880 1342-826145"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-black focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Live Identity & Typography Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Live Typography & Brand Preview</span>
            <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-mono">
              Live Preview
            </span>
          </div>

          {/* Typography Specimen Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                Active Font Pairing
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#111111] text-[#FACC15] rounded text-xs font-bold font-mono">
                  {selectedHeadingFont.name}
                </span>
                <span className="text-gray-400">+</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs font-semibold font-mono">
                  {selectedBodyFont.name}
                </span>
              </div>
            </div>

            {/* Live Specimen Rendering */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
              <div
                style={{ fontFamily: selectedHeadingFont.cssFamily }}
                className="text-xl font-bold text-[#111111] leading-tight"
              >
                Outfit Luxury Capsule 2026
              </div>

              <div
                style={{ fontFamily: selectedBodyFont.cssFamily }}
                className="text-xs text-gray-600 leading-relaxed"
              >
                Handcrafted double-faced cashmere and architectural wool silhouettes designed for timeless modern living.
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  style={{ fontFamily: selectedBodyFont.cssFamily }}
                  className="px-3 py-1.5 bg-[#FACC15] text-[#111111] text-xs font-bold rounded-lg shadow-2xs"
                >
                  Explore Collection
                </button>
                <button
                  type="button"
                  style={{ fontFamily: selectedBodyFont.cssFamily }}
                  className="px-3 py-1.5 bg-[#111111] text-white text-xs font-semibold rounded-lg"
                >
                  View Lookbook
                </button>
              </div>
            </div>
          </div>

          {/* Browser Tab Simulation */}
          <div className="bg-gray-200 p-2.5 rounded-t-xl border border-gray-300">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-md flex items-center gap-2 text-[11px] font-medium text-gray-700 truncate shadow-2xs">
              {formData.faviconUrl ? (
                <img
                  src={formData.faviconUrl}
                  alt="Favicon"
                  referrerPolicy="no-referrer"
                  className="w-3.5 h-3.5 object-contain shrink-0"
                />
              ) : (
                <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              )}
              <span className="truncate">{formData.websiteTitle || 'Outfit Store'}</span>
            </div>
          </div>

          {/* Header Preview */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase text-gray-400">
                  Header Logo Live Preview
                </span>
                <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
                  {formData.logoHeight || 36}px
                </span>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-start min-h-[64px] overflow-hidden">
                <div className="flex items-center gap-3">
                  {formData.logoUrl && (
                    <img
                      src={formData.logoUrl}
                      alt="Logo"
                      referrerPolicy="no-referrer"
                      style={{
                        height: `${formData.logoHeight || 36}px`,
                        maxHeight: `${formData.logoHeight || 36}px`,
                        width: 'auto',
                      }}
                      className="object-contain shrink-0 transition-all"
                    />
                  )}
                  {!formData.logoUrl && (formData.websiteName?.toLowerCase() === 'outfit' || formData.websiteName?.toLowerCase() === 'outfit premium' || !formData.websiteName) ? (
                    <BrandLogo
                      customHeight={formData.logoHeight || 36}
                      size="md"
                    />
                  ) : (
                    (formData.showLogoText !== false || !formData.logoUrl) && (
                      <span
                        style={{
                          fontFamily: selectedHeadingFont.cssFamily,
                          fontSize: `calc(1.35rem * ${(formData.logoTextScale || 100) / 100})`,
                        }}
                        className="font-serif font-semibold select-none uppercase truncate tracking-[0.18em] text-[#111111] transition-all"
                      >
                        {formData.websiteName || 'Outfit'}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* bKash Checkout Preview */}
            <div className="pt-3 border-t border-gray-100">
              <span className="text-[10px] font-bold uppercase text-pink-700 block mb-1">
                Checkout bKash Badge:
              </span>
              <div className="bg-pink-50 p-3 rounded-lg border border-pink-200 text-xs">
                <span className="text-gray-600 block text-[10px]">Send Money to:</span>
                <span className="font-mono font-bold text-pink-700 text-sm">
                  {formData.bkashNumber || '01342826145'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
