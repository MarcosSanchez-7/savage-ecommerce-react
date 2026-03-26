import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, ArrowRight, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const Hero: React.FC = () => {
  const { heroSlides, heroCarouselConfig, loading, categories, bannerBento } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  // Responsive Position Logic
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Touch handlers refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev === heroSlides?.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? heroSlides?.length - 1 : prev - 1));
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
  }, [currentSlide, heroSlides?.length, heroCarouselConfig]);

  // Safety check
  useEffect(() => {
    if (heroSlides && currentSlide >= heroSlides.length) {
      setCurrentSlide(0);
    }
  }, [heroSlides?.length]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fall-from-above entrance on every Hero mount.
  // No sessionStorage guard: in React 18 Strict Mode useLayoutEffect runs twice
  // (both pre-paint), so any "ran once" flag set in the first run would block the
  // second run — the one that actually shows. Without the guard, GSAP correctly
  // sets the from-state before the browser paints and the animation plays.
  useGSAP(() => {
    gsap.from('.hero-anim', {
      y: -70,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.14,
      clearProps: 'all',
    });
  }, { scope: heroRef });

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

  // Filter root categories for the sidebar
  const rootCategories = categories?.filter(c => !c.parent_id && !['HUÉRFANOS', 'HUERFANOS'].includes(c.name.toUpperCase())) || [];

  if (loading) {
    return (
      <header className="w-full max-w-[1400px] mx-auto px-4 lg:px-6 py-6 animate-pulse hidden md:flex gap-4">
        <div className="w-[280px] h-[500px] bg-zinc-900 rounded-lg"></div>
        <div className="flex-1 grid grid-cols-4 gap-4 auto-rows-[250px]">
          <div className="col-span-4 lg:col-span-2 row-span-2 bg-zinc-800 rounded-lg"></div>
          <div className="col-span-2 lg:col-span-1 bg-zinc-800 rounded-lg"></div>
          <div className="col-span-2 lg:col-span-1 bg-zinc-800 rounded-lg"></div>
        </div>
      </header>
    );
  }

  const current = heroSlides?.[currentSlide];

  return (
    <header ref={heroRef} className="w-full max-w-[1400px] mx-auto px-4 lg:px-6 py-6 pb-12">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Sidebar - Categories Menu (Always visible) */}
        <aside className="hero-anim hidden lg:flex w-full lg:w-[280px] shrink-0 bg-background-dark border border-gray-800 rounded-lg flex-col shadow-xl z-50 relative">
          <div className="bg-primary text-black font-black uppercase tracking-wider px-4 py-3 flex items-center gap-2 rounded-t-lg">
            <span>CATEGORÍAS</span>
          </div>
          <nav className="flex-col py-2 relative">
            {rootCategories.map(category => {
              const subcategories = categories?.filter(c => c.parent_id === category.id) || [];
              const hasSubcategories = subcategories.length > 0;
              
              return (
                <div key={category.id} className="group/menu relative">
                  <Link
                    to={`/category/${category.id}`}
                    className="flex flex-1 items-center justify-between px-5 py-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800/30 last:border-0"
                  >
                    <span className="text-xs font-black uppercase text-gray-300 group-hover/menu:text-white transition-colors tracking-widest">{category.name}</span>
                    <ChevronRight size={16} className={`text-gray-600 transition-colors ${hasSubcategories ? 'group-hover/menu:text-primary' : 'group-hover/menu:text-white'}`} />
                  </Link>

                  {/* Flyout Submenu */}
                  {hasSubcategories && (
                    <div className="absolute left-0 lg:left-full top-0 w-full lg:w-[500px] min-h-[400px] bg-[#050505] border border-gray-800 shadow-[20px_0_40px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-50 rounded-lg lg:rounded-l-none lg:rounded-r-lg p-6 flex flex-col lg:-mt-2">
                       <div className="w-full flex justify-between items-center mb-4 pb-2 border-b border-gray-800">
                           <h3 className="text-primary font-black uppercase tracking-widest text-sm">{category.name}</h3>
                           <Link to={`/category/${category.id}`} className="text-gray-500 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors">Ver todo</Link>
                       </div>
                       
                       <div className="flex flex-col gap-2">
                          {subcategories.map(sub => {
                            // Fetch sub-subcategories (Level 3 if needed, though likely 2 levels)
                            const subSubCategories = categories?.filter(c => c.parent_id === sub.id) || [];
                            return (
                              <div key={sub.id} className="group/sub relative border-b border-gray-800/30 last:border-0 pb-2">
                                <div className="flex items-center justify-between cursor-pointer">
                                  <Link 
                                    to={`/category/${sub.id}`} 
                                    className="text-gray-200 group-hover/sub:text-white uppercase font-bold text-xs tracking-wider transition-colors flex-1 py-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {sub.name}
                                  </Link>
                                  {subSubCategories.length > 0 && (
                                    <span className="p-1 px-2 text-gray-500 group-hover/sub:text-primary transition-colors">
                                      <ChevronRight size={14} className="transition-transform duration-200 group-hover/sub:rotate-90" />
                                    </span>
                                  )}
                                </div>
                                {subSubCategories.length > 0 && (
                                  <div className="hidden group-hover/sub:flex flex-row flex-wrap gap-x-4 gap-y-2 mt-2 pl-2 border-l border-gray-800/50 animate-in slide-in-from-left-2 duration-300">
                                    {subSubCategories.map(ss => (
                                      <Link key={ss.id} to={`/category/${ss.id}`} className="text-gray-500 hover:text-white uppercase text-[10px] font-bold tracking-wider transition-colors block py-0.5">
                                        {ss.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                       </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Right Content - Bento Grid for Banners */}
        {/* Desktop: 4 columns, Tablet: 2 columns, Mobile: 1 column */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 auto-rows-[200px] lg:auto-rows-[240px]">
          
          {/* Main Hero Carousel - Takes top left large area */}
          <div
            className="hero-anim col-span-2 lg:col-span-2 row-span-2 relative rounded-lg overflow-hidden group/mainslider shadow-2xl"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
             {heroSlides?.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out overflow-hidden ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title || 'Savage Banner'}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/mainslider:scale-105"
                    style={{
                      objectPosition: isMobile
                        ? (slide.mobilePosition || 'center')
                        : (slide.desktopPosition || 'center')
                    }}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                  />
                  {/* Subtle overlay for text legibility if needed, keeping it lighter than before */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Text Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-center md:justify-end items-center md:items-start text-center md:text-left p-6 md:p-10 pointer-events-none z-20">
                     <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={`title-${slide.id}`}
                        className="text-3xl md:text-5xl font-black leading-tight tracking-tighter text-white mb-6 drop-shadow-lg opacity-60 md:opacity-100"
                      >
                        {slide.title}
                      </motion.h1>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        key={`btn-${slide.id}`}
                        className="opacity-60 md:opacity-100"
                      >
                        <Link
                          to={slide.buttonLink || '/'}
                          className="pointer-events-auto inline-flex items-center justify-center px-6 py-2.5 bg-primary text-black font-black text-xs tracking-widest uppercase hover:bg-white transition-colors rounded-none shadow-xl skew-x-[-10deg] hover:skew-x-0"
                        >
                          <span className="skew-x-[10deg] block hover:skew-x-0 transition-transform">{slide.buttonText || 'COMPRAR'}</span>
                        </Link>
                      </motion.div>
                  </div>
                </div>
              ))}

              {/* Slider Controls */}
              {heroSlides && heroSlides.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.preventDefault(); prevSlide(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black transition-all z-30 opacity-0 group-hover/mainslider:opacity-100"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); nextSlide(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black transition-all z-30 opacity-0 group-hover/mainslider:opacity-100"
                  >
                    <ArrowRight size={20} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                    {heroSlides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => { e.preventDefault(); setCurrentSlide(idx); }}
                        className={`h-1.5 rounded-full transition-all ${idx === currentSlide ? 'bg-primary w-6' : 'bg-white/50 hover:bg-white w-2'}`}
                      />
                    ))}
                  </div>
                </>
              )}
          </div>

          {/* Small Banners mapped from bannerBento */}
          {bannerBento?.slice(0, 4).map((banner, idx) => {
            // Give specific layouts based on index for variety
            // idx 0, 1: normal tight squares
            // idx 2, 3: could be wider if we wanted, but we keep them 1x1 to fit the 4-col 2-row layout alongside
            return (
                <Link
                  key={banner.id}
                  to={banner.link}
                  className="hero-anim col-span-1 row-span-1 relative rounded-lg overflow-hidden group/bento block"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/bento:scale-110"
                    style={{ backgroundImage: `url('${banner.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover/bento:opacity-100 transition-opacity" />
                  
                  <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5 flex flex-col justify-end">
                    <h3 className="text-white font-black uppercase text-sm lg:text-base leading-tight drop-shadow-md">
                      {banner.title}
                    </h3>
                    {banner.subtitle && (
                      <p className="text-gray-300 text-[10px] uppercase font-bold tracking-widest mt-1">
                        {banner.subtitle}
                      </p>
                    )}
                  </div>
                </Link>
            );
          })}
          
        </div>
      </div>
    </header>
  );
};

export default Hero;
