import React from 'react';
import { useShop } from '../context/ShopContext';
import { TESTIMONIALS, BLOG_POSTS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

const LifestyleSection: React.FC = () => {
  const { blogPosts, lifestyleConfig } = useShop();
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Combine constants if no dynamic posts, or just use dynamic
  const displayItems = React.useMemo(() => {
    return blogPosts.length > 0 ? blogPosts : [
      { type: 'testimonial', ...TESTIMONIALS[0], id: 't1' },
      { type: 'blog', ...BLOG_POSTS[0], id: 'b1' },
      { type: 'testimonial', ...TESTIMONIALS[1], id: 't2' },
      { type: 'blog', ...BLOG_POSTS[1], id: 'b2' },
      { type: 'testimonial', ...TESTIMONIALS[0], id: 't3' }, // Duplicate for slider demo
      { type: 'blog', ...BLOG_POSTS[0], id: 'b4' }
    ];
  }, [blogPosts]);

  // Responsive items to show
  const [itemsToShow, setItemsToShow] = React.useState(4);

  React.useEffect(() => {
    const handleResize = () => setItemsToShow(window.innerWidth < 1024 ? (window.innerWidth < 768 ? 1 : 2) : 4);
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto Slider Effect
  React.useEffect(() => {
    if (displayItems.length <= itemsToShow) return;

    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % displayItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [displayItems.length, itemsToShow]);

  // Adjust visibility
  const getWrappedItems = () => {
    let items = [];
    const maxItems = displayItems.length;
    for (let i = 0; i < itemsToShow; i++) {
      // If there's enough items, slide them. Else just show safe quantity.
      const safeItemsToShow = maxItems < itemsToShow ? maxItems : itemsToShow;
      if (i >= safeItemsToShow) break;

      const index = (activeIndex + i) % maxItems;
      items.push(displayItems[index]);
    }
    return items;
  };

  const finalVisibleItems = getWrappedItems();
  const maxItems = displayItems.length;
  const shouldSlide = maxItems > itemsToShow;

  return (
    <section className="py-20 bg-background border-t border-border overflow-hidden relative transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 text-center md:text-left pt-6">
          <div className="mx-auto md:mx-0">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-text">{lifestyleConfig.sectionTitle}</h2>
            <p className="text-text-muted mt-2 max-w-lg mx-auto md:mx-0">{lifestyleConfig.sectionSubtitle}</p>
          </div>
          <a href={lifestyleConfig.buttonLink} className="px-6 py-3 border border-border hover:border-text text-sm font-bold uppercase tracking-widest transition-colors rounded text-text block mx-auto md:mx-0">
            {lifestyleConfig.buttonText}
          </a>
        </div>

        <div className={`w-full flex justify-center items-stretch gap-6`}>
          <AnimatePresence mode="popLayout">
            {finalVisibleItems.map((item: any, index) => {
              // Determine style based on content or tag
              const isTestimonial = item.type === 'testimonial' || (item.tag && item.tag.toUpperCase() === 'CLIENTE');
              const hasImage = item.image && item.image.startsWith('http');
              const isBlogCard = hasImage && !isTestimonial;

              // Unique key is required for Framer Motion to properly exit/enter nodes.
              const uniqueKey = shouldSlide ? `${item.id}-${(activeIndex + index) % maxItems}` : item.id;

              const itemContent = !isBlogCard ? (
                // Testimonial / Text Card
                <div className="bg-surface p-6 rounded border border-border flex flex-col justify-between h-full min-h-[300px] transition-colors duration-300">
                  <div>
                    <div className="flex gap-1 mb-4">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-base text-[#FFE81F] drop-shadow-sm fill-current">star</span>
                      ))}
                    </div>
                    <p className="text-text-muted italic mb-6 line-clamp-6">"{item.content || item.text}"</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="size-10 rounded-full bg-border bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url('${item.avatar || item.image || 'https://via.placeholder.com/150'}')` }}
                    />
                    <div>
                      <p className="text-text font-bold text-sm truncate">{item.author || item.name || 'Anonymous'}</p>
                      <p className="text-xs text-text-muted truncate">{item.location || item.date || 'Cliente Verificado'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // Image / Blog Card
                <div className="group relative bg-gray-900 rounded overflow-hidden h-full min-h-[300px]">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${item.image}')` }}
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
                  <div className="absolute top-4 right-4 flex gap-1 z-10">
                    {item.rating && [...Array(item.rating)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-sm text-[#FFE81F] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] fill-current">star</span>
                    ))}
                  </div>
                  <div className="absolute bottom-0 p-6 z-20">
                    <span className="bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded mb-2 inline-block uppercase shadow-md">
                      {item.tag || item.tags?.[0] || 'LIFESTYLE'}
                    </span>
                    <h3 className="text-white font-bold text-xl leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2 drop-shadow-md">
                      {item.title}
                    </h3>
                    <p className="text-gray-200 text-xs line-clamp-2 font-medium drop-shadow-md">{item.content}</p>
                  </div>
                </div>
              );

              return (
                <motion.div
                  key={uniqueKey}
                  layout={shouldSlide}
                  initial={shouldSlide ? { opacity: 0, x: 50, scale: 0.95 } : undefined}
                  animate={shouldSlide ? { opacity: 1, x: 0, scale: 1 } : undefined}
                  exit={shouldSlide ? { opacity: 0, x: -50, scale: 0.95 } : undefined}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
                >
                  {itemContent}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default LifestyleSection;
