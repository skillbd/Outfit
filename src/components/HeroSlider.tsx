import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroSlide } from '../types';
import { useStore } from '../context/StoreContext';
import { INITIAL_HERO_SLIDES } from '../lib/initialData';

interface HeroSliderProps {
  onCtaClick?: (category?: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = () => {
  const { heroSlides } = useStore();

  // Guarantee always exactly 3 valid slides
  const rawList = heroSlides && heroSlides.length > 0 ? heroSlides : INITIAL_HERO_SLIDES;
  const slides: HeroSlide[] = [
    rawList[0] || INITIAL_HERO_SLIDES[0],
    rawList[1] || INITIAL_HERO_SLIDES[1],
    rawList[2] || INITIAL_HERO_SLIDES[2],
  ].map((slide, idx) => ({
    ...INITIAL_HERO_SLIDES[idx],
    ...slide,
    imageUrl: slide?.imageUrl || INITIAL_HERO_SLIDES[idx].imageUrl,
  }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile Touch Swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Autoplay interval (3 seconds)
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
      <section
        id="hero-slider-section"
        className="relative w-full aspect-[1980/1080] rounded-xl sm:rounded-3xl overflow-hidden bg-stone-900 select-none shadow-md group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label="Store Hero Banner (1980x1080)"
      >
        {/* Full Image Display on Mobile and PC */}
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id || `slide-${idx}`}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Pristine Full 1980x1080 Image */}
              <div className="relative z-10 w-full h-full flex items-center justify-center p-0">
                <img
                  src={slide.imageUrl}
                  alt={`Hero Banner ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== INITIAL_HERO_SLIDES[idx]?.imageUrl) {
                      target.src = INITIAL_HERO_SLIDES[idx]?.imageUrl || '';
                    }
                  }}
                  className="w-full h-full object-cover object-center select-none"
                />
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows (Touch & Click responsive) */}
        <div className="absolute inset-y-0 left-2 sm:left-4 z-20 flex items-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            id="hero-prev-slide-btn"
            onClick={prevSlide}
            className="p-1.5 sm:p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-105"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        </div>

        <div className="absolute inset-y-0 right-2 sm:right-4 z-20 flex items-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            id="hero-next-slide-btn"
            onClick={nextSlide}
            className="p-1.5 sm:p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-105"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        </div>

        {/* Bottom Slide Indicators (Exactly 3) */}
        <div className="absolute bottom-3 sm:bottom-5 inset-x-0 z-20 flex items-center justify-center gap-2">
          {slides.map((_, barIdx) => (
            <button
              key={barIdx}
              id={`hero-dot-indicator-${barIdx}`}
              onClick={() => setCurrentIndex(barIdx)}
              aria-label={`Go to slide ${barIdx + 1}`}
              className="py-1 px-0.5 cursor-pointer"
            >
              <div
                className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                  barIdx === currentIndex
                    ? 'w-6 sm:w-10 bg-[#FACC15] shadow-md'
                    : 'w-2 sm:w-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
