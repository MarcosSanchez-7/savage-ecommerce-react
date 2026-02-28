
import React from 'react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryBento: React.FC = () => {
  const { bannerBento } = useShop();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll logic for mobile carousel
  React.useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const interval = setInterval(() => {
      // Only scroll if content overflows (mobile/slider view)
      if (scrollContainer.scrollWidth <= scrollContainer.clientWidth) return;

      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      const currentScroll = scrollContainer.scrollLeft;

      // Check if we reached the end (with small tolerance)
      if (currentScroll >= maxScroll - 10) {
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll by roughly one item width (using container width as proxy for visible item or simply scrollBy)
        // Since we use snap-x, a push is enough.
        const scrollAmount = scrollContainer.clientWidth * 0.8;
        scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Fallback defaults in case context is empty (shouldn't happen with default state)
  // Fallback defaults or use array indices
  const large = bannerBento[0];
  const topRight = bannerBento[1];
  const bottomRight = bannerBento[2];

  const scrollLeftBtn = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRightBtn = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 px-6 lg:px-12 max-w-[1400px] mx-auto">
      <h2 className="text-3xl font-bold uppercase tracking-tight mb-8">Categorías</h2>

      <div className="relative group">
        {/* Left Arrow Button */}
        <button
          onClick={scrollLeftBtn}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 sm:-ml-4 z-10 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-sm transition-all md:opacity-0 md:group-hover:opacity-100 disabled:opacity-0 hidden sm:flex"
          aria-label="Previous Category"
        >
          <ChevronLeft size={24} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-2"
        >
          {bannerBento.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="relative group flex-shrink-0 w-[85vw] sm:w-[350px] md:w-[400px] lg:w-[calc(33.333%-1rem)] h-[350px] md:h-[300px] rounded overflow-hidden cursor-pointer block snap-center"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${item.image}')` }}
              />
              {/* Dark overlay for contrast */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

              <div className="absolute bottom-0 left-0 p-6 md:p-8">
                <h3 className="text-3xl md:text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter mb-1 drop-shadow-md">
                  {item.title}
                </h3>
                <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest group-hover:text-primary transition-colors text-gray-200 drop-shadow-md">
                  {item.buttonText || item.subtitle || 'Ver Más'}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={scrollRightBtn}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 sm:-mr-4 z-10 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-sm transition-all md:opacity-0 md:group-hover:opacity-100 hidden sm:flex"
          aria-label="Next Category"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

export default CategoryBento;
