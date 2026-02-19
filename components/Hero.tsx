
import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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

  // No slides state: Show a clean branded banner instead of a dev message
  if (heroSlides.length === 0 && !loading) {
    return (
      <header className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-black" />
        <div className="relative z-20 flex flex-col items-center text-center px-4 animate-fade-in">
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter text-white/10 mb-2">
            SAVAGE
          </h1>
          <div className="h-[2px] w-20 bg-primary/20 mb-8" />
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

      {/* Gradient Overlay for Better Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>

      {/* Content - Luxury Minimalist Design */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto w-full h-full">
        {loading ? (
          // SKELETON STATE
          <div className="flex flex-col items-center w-full gap-6 animate-pulse">
            <div className="h-20 md:h-32 w-3/4 bg-white/10 backdrop-blur-sm mb-4"></div>
            <div className="h-8 md:h-12 w-1/2 bg-white/5 backdrop-blur-sm mb-8"></div>
            <div className="h-12 md:h-14 w-48 bg-white/20 backdrop-blur-sm"></div>
          </div>
        ) : (
          // REAL CONTENT - Animated with Framer Motion
          <div className="w-full space-y-6 md:space-y-8">
            {/* Title - Bold & Elegant */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] tracking-tighter text-white max-w-3xl mx-auto"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                textShadow: '0 4px 24px rgba(0,0,0,0.5)'
              }}
            >
              {current?.title || "SAVAGE"}
            </motion.h1>

            {/* Subtitle - Light & Spaced */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm md:text-xl font-light tracking-[0.25em] text-white/90 uppercase max-w-2xl mx-auto"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                textShadow: '0 2px 12px rgba(0,0,0,0.4)'
              }}
            >
              {current?.subtitle}
            </motion.h2>

            {/* CTA Button - Clean & Minimal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="pt-4"
            >
              <Link
                to={current?.buttonLink || '/'}
                className="group relative inline-flex items-center justify-center px-8 md:px-12 py-3.5 md:py-4 bg-white text-black font-semibold text-xs md:text-sm tracking-[0.15em] uppercase overflow-hidden transition-all duration-500 hover:bg-black hover:text-white border-2 border-white"
              >
                <span className="relative z-10">{current?.buttonText || 'EXPLORAR AHORA'}</span>
                {/* Hover Effect Background */}
                <span className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
              </Link>
            </motion.div>
          </div>
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
