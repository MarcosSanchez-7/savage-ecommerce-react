import React, { useEffect, useState, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryBento: React.FC = () => {
  const { bannerBento } = useShop();
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isMobile, setIsMobile] = useState(false); // Default to false, check on mount
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // initialize 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibleItemsCount = isMobile ? 1 : 5;
  const maxItems = bannerBento?.length || 0;

  const shouldSlide = isMobile ? maxItems > 1 : maxItems > 5;
  const slideInterval = isMobile ? 4000 : 5000;

  useEffect(() => {
    if (!bannerBento || !shouldSlide || maxItems === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % maxItems);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [bannerBento, maxItems, shouldSlide, slideInterval]);

  const scrollLeftBtn = () => {
    if (maxItems === 0) return;
    setCurrentIndex((prev) => (prev - 1 + maxItems) % maxItems);
  };

  const scrollRightBtn = () => {
    if (maxItems === 0) return;
    setCurrentIndex((prev) => (prev + 1) % maxItems);
  };

  if (!bannerBento || bannerBento.length === 0) return null;

  const getVisibleLinks = () => {
    // If we don't need to slide (e.g. PC and <= 5 items), show all of them exactly as they are.
    if (!shouldSlide) return bannerBento;

    const items = [];
    // On mobile we might show 2, but if we only have 1 item, we just show 1.
    const safeVisible = Math.min(visibleItemsCount, maxItems);
    for (let i = 0; i < safeVisible; i++) {
      const index = (currentIndex + i) % maxItems;
      items.push(bannerBento[index]);
    }
    return items;
  };

  const visibleLinks = getVisibleLinks();

  return (
    <section className="py-10 px-4 md:px-6 lg:px-12 max-w-[1400px] mx-auto overflow-hidden">
      <h2 className="text-xl font-black uppercase tracking-[0.2em] mb-6 text-text">
        Categorías
      </h2>

      <div className="relative group w-full">
        {shouldSlide && (
          <button
            onClick={scrollLeftBtn}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/80 hover:bg-black text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hidden sm:flex border border-white/10 shadow-lg"
            aria-label="Anterior"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div className={`w-full flex justify-center items-center min-h-[220px]`}>
          <AnimatePresence mode="popLayout">
            {visibleLinks.map((item, idx) => {
              const uniqueKey = shouldSlide ? `${item.id}-${(currentIndex + idx) % maxItems}` : item.id;
              return (
                <motion.div
                  key={uniqueKey}
                  layout={shouldSlide}
                  initial={shouldSlide ? { opacity: 0, x: 50, scale: 0.95 } : undefined}
                  animate={shouldSlide ? { opacity: 1, x: 0, scale: 1 } : undefined}
                  exit={shouldSlide ? { opacity: 0, x: -50, scale: 0.95 } : undefined}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className={`flex-shrink-0 px-2 ${isMobile ? 'w-full' : 'w-[220px] md:w-[250px] lg:w-[270px] xl:w-[290px]'}`}
                >
                  <Link
                    to={item.link}
                    className={`group/card relative overflow-hidden rounded-xl cursor-pointer block w-full
                                h-[220px] sm:h-[180px] md:h-[200px] lg:h-[220px]
                                `}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/card:scale-105"
                      style={{ backgroundImage: `url('${item.image}')` }}
                    />
                    {/* Bottom-heavy gradient for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className="absolute inset-0 flex flex-col justify-end items-start p-3 sm:p-4">
                      <div className="w-full">
                        <h3 className="text-white font-black uppercase leading-tight tracking-tight
                                            text-sm sm:text-xs md:text-sm lg:text-base
                                            drop-shadow-md max-w-full truncate w-full
                                        ">
                          {item.title}
                        </h3>

                        {item.subtitle && (
                          <p className="text-white/70 text-[10px] sm:text-[9px] font-medium uppercase tracking-widest mt-0.5 max-w-full truncate w-full leading-snug">
                            {item.subtitle}
                          </p>
                        )}
                      </div>

                      <span className="
                                        mt-1.5 sm:mt-2
                                        px-2.5 py-1 sm:px-3 sm:py-1.5
                                        bg-primary text-black
                                        text-[10px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest
                                        rounded-full
                                        group-hover/card:bg-white
                                        transition-colors duration-300
                                        whitespace-nowrap truncate max-w-full
                                        shadow-md
                                    ">
                        {item.buttonText || 'Ver más'}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {shouldSlide && (
          <button
            onClick={scrollRightBtn}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/80 hover:bg-black text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hidden sm:flex border border-white/10 shadow-lg"
            aria-label="Siguiente"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </section>
  );
};

export default CategoryBento;
