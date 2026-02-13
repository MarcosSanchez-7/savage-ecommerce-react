
import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight
} from 'lucide-react';

const Hero: React.FC = () => {
  const { heroSlides, heroCarouselConfig, loading } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  // Responsive Position Logic
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Touch handlers refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  // Auto-advance
  useEffect(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      nextSlide();
    }, heroCarouselConfig?.interval || 5000);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [currentSlide, heroSlides.length, heroCarouselConfig]);

  // Safety check
  useEffect(() => {
    if (currentSlide >= heroSlides.length) {
      setCurrentSlide(0);
    }
  }, [heroSlides.length]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (loading) {
    // Return just the Skeleton structure immediately if loading, avoiding the "No Slides" check below
    return (
      <header className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black animate-pulse">
        <div className="absolute inset-0 bg-zinc-900 w-full h-full" />
        <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl mx-auto w-full gap-4">
          {/* Title Skeleton */}
          <div className="h-16 md:h-24 w-3/4 bg-zinc-800/50 rounded-lg backdrop-blur-sm mb-4"></div>
          {/* Subtitle Skeleton */}
          <div className="h-6 md:h-8 w-1/2 bg-zinc-800/30 rounded backdrop-blur-sm mb-8"></div>
          {/* Button Skeleton */}
          <div className="h-10 md:h-12 w-40 bg-zinc-800/80 rounded shadow-xl"></div>
        </div>
      </header>
    );
  }



  const current = heroSlides[currentSlide];

  // if (!current) return null; // Removed to allow Skeleton rendering while loading

  return (
    <header
      className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image with Overlay */}
      {/* If loading, show a dark placeholder background */}
      {(!heroSlides || heroSlides.length === 0) && (
        <div className="absolute inset-0 bg-zinc-900 w-full h-full" />
      )}

      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-1000 ease-in-out ${index === currentSlide && !loading ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
          style={{
            backgroundImage: `url('${slide.image}')`,
            backgroundPosition: isMobile
              ? (slide.mobilePosition || 'center')
              : (slide.desktopPosition || 'center')
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/30 to-transparent"></div>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl mx-auto animate-fade-in-up w-full">
        {loading ? (
          // SKELETON STATE
          <div className="flex flex-col items-center w-full gap-4 animate-pulse">
            {/* Title Skeleton */}
            <div className="h-16 md:h-24 w-3/4 bg-zinc-800/50 rounded-lg backdrop-blur-sm mb-4"></div>
            {/* Subtitle Skeleton */}
            <div className="h-6 md:h-8 w-1/2 bg-zinc-800/30 rounded backdrop-blur-sm mb-8"></div>
            {/* Button Skeleton */}
            <div className="h-10 md:h-12 w-40 bg-zinc-800/80 rounded shadow-xl"></div>
          </div>
        ) : (
          // REAL CONTENT
          <>
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black leading-none tracking-tighter mb-2 md:mb-4 uppercase z-10 transition-all duration-300">
              {current ? (
                <>
                  {current.title?.split(' ').slice(0, 1)} <span className="text-stroke text-transparent" style={{ WebkitTextStroke: '1px white' }}>{current.title?.split(' ').slice(1).join(' ')}</span>
                </>
              ) : (
                "SAVAGE"
              )}
            </h1>
            <h2 className="text-gray-300 text-sm md:text-xl font-light tracking-widest mb-6 md:mb-8 uppercase z-10 transition-all duration-300">
              {current?.subtitle}
            </h2>
            <div className="flex flex-wrap justify-center gap-4 z-20">
              <Link
                to={current?.buttonLink || '/'}
                className="bg-primary hover:opacity-90 text-white h-10 md:h-12 px-6 md:px-8 rounded font-bold text-xs md:text-sm tracking-[0.1em] uppercase transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-yellow-900/20 flex items-center justify-center"
              >
                {current?.buttonText || 'EXPLORAR AHORA'}
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      {heroSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/10 bg-black/20 text-white hover:bg-white/20 transition-all z-30"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/10 bg-black/20 text-white hover:bg-white/20 transition-all z-30"
          >
            <ArrowRight size={24} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-10 flex gap-2 z-30">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white'}`}
              />
            ))}
          </div>
        </>
      )}
    </header>
  );
};

export default Hero;
