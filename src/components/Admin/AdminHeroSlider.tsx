import React, { useState } from 'react';
import { Image as ImageIcon, Save, CheckCircle, Sparkles } from 'lucide-react';
import { HeroSlide } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ImageUploadDropzone } from '../ImageUploadDropzone';

const PRESET_HERO_IMAGES = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2070&auto=format&fit=crop',
];

export const AdminHeroSlider: React.FC = () => {
  const { heroSlides, saveHeroSlide } = useStore();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [savingSlideId, setSavingSlideId] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Ensure 3 slides
  const slides: HeroSlide[] = [
    heroSlides[0] || {
      id: 'slide_1',
      index: 0,
      title: '',
      subtitle: '',
      imageUrl: PRESET_HERO_IMAGES[0],
      align: 'center',
    },
    heroSlides[1] || {
      id: 'slide_2',
      index: 1,
      title: '',
      subtitle: '',
      imageUrl: PRESET_HERO_IMAGES[1],
      align: 'center',
    },
    heroSlides[2] || {
      id: 'slide_3',
      index: 2,
      title: '',
      subtitle: '',
      imageUrl: PRESET_HERO_IMAGES[2],
      align: 'center',
    },
  ];

  const currentEditingSlide = slides[activeSlideIndex] || slides[0];

  const handleImageUploadChange = (newImages: string[]) => {
    if (newImages.length > 0) {
      const updated = { ...currentEditingSlide, imageUrl: newImages[0] };
      saveHeroSlide(updated);
    }
  };

  const handleSaveCurrentSlide = async () => {
    setSavingSlideId(currentEditingSlide.id);
    try {
      await saveHeroSlide(currentEditingSlide);
      setSaveSuccessMessage(`Hero banner ${activeSlideIndex + 1} updated and saved live!`);
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Slide save error:', err);
    } finally {
      setSavingSlideId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Storefront Visual Showcase</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Hero Slider Images (1980px × 1080px)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Recommended Resolution: <span className="font-bold text-gray-800">1980 × 1080 px</span> (16:9 Full HD / Wide aspect ratio). Clean, edge-to-edge luxury banners.
          </p>
        </div>

        {saveSuccessMessage && (
          <div className="flex items-center gap-2 bg-green-50 text-green-800 text-xs font-medium px-3.5 py-2 rounded-lg border border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* 3 Slides Tab Selector */}
      <div className="grid grid-cols-3 gap-3">
        {slides.map((slide, idx) => (
          <button
            key={slide.id || idx}
            onClick={() => setActiveSlideIndex(idx)}
            className={`p-3.5 sm:p-4 text-left rounded-xl border transition-all cursor-pointer ${
              activeSlideIndex === idx
                ? 'bg-blue-50 text-blue-900 border-blue-300 shadow-xs ring-1 ring-blue-400'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider mb-1.5">
              <span className={activeSlideIndex === idx ? 'text-blue-700' : 'text-gray-400'}>
                Banner 0{idx + 1}
              </span>
              {activeSlideIndex === idx && (
                <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">
                  Active
                </span>
              )}
            </div>
            <div className="w-full h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
              <img
                src={slide.imageUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Slide Editor & Live Visual Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Editor Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Hero Image #{activeSlideIndex + 1}
              </h3>
              <p className="text-[11px] text-gray-400">Upload a custom image file, paste a link, or pick from presets.</p>
            </div>
            <button
              onClick={handleSaveCurrentSlide}
              disabled={savingSlideId === currentEditingSlide.id}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSlideId === currentEditingSlide.id ? 'Saving...' : 'Save Banner'}</span>
            </button>
          </div>

          {/* Image Upload Dropzone Component */}
          <div>
            <ImageUploadDropzone
              label={`Banner #${activeSlideIndex + 1} Photo (1980 × 1080 px)`}
              description="Ideal Size: 1980px × 1080px (PNG, JPG, WebP). Drag and drop high-res banner or pick from presets."
              images={currentEditingSlide.imageUrl ? [currentEditingSlide.imageUrl] : []}
              onChange={handleImageUploadChange}
              multiple={false}
              presets={PRESET_HERO_IMAGES}
              aspectRatio="wide"
            />
          </div>
        </div>

        {/* Live Preview Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
            <span>Storefront Hero Preview</span>
            <span>0{activeSlideIndex + 1} / 03</span>
          </div>

          <div className="relative aspect-[16/9] w-full bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 shadow-md">
            <img
              src={currentEditingSlide.imageUrl}
              alt="Hero Preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[11px] text-gray-400">
            Clean, textless image banner synced in real time with the storefront slider.
          </span>
        </div>
      </div>
    </div>
  );
};
