
import React from 'react';
import { useShop } from '../context/ShopContext';
import { TESTIMONIALS, BLOG_POSTS } from '../constants';

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

  // Auto Slider Effect
  React.useEffect(() => {
    if (displayItems.length <= 4) return; // No need to slide if few items

    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % (displayItems.length - 3));
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [displayItems.length]);

  // Adjust display window based on activeIndex
  const visibleItems = displayItems.length > 4
    ? displayItems.slice(activeIndex, activeIndex + 4)
    : displayItems.slice(0, 4);

  // Handle wrap-around for endless slider feel if needed, but simple slice is safer for now.
  // Actually, let's just slide 1 by 1.

  return (
    <section className="py-20 bg-surface-dark border-t border-gray-800 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">{lifestyleConfig.sectionTitle}</h2>
            <p className="text-accent-gray mt-2 max-w-lg">{lifestyleConfig.sectionSubtitle}</p>
          </div>
          <a href={lifestyleConfig.buttonLink} className="px-6 py-3 border border-gray-700 hover:border-white text-sm font-bold uppercase tracking-widest transition-colors rounded text-white block">
            {lifestyleConfig.buttonText}
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 ease-in-out">
          {visibleItems.map((item: any, index) => {
            // Determine style based on content
            const hasImage = item.image && item.image.startsWith('http');
            const isTestimonialStyle = !hasImage || item.type === 'testimonial';

            if (isTestimonialStyle) {
              // Testimonial / Text Card
              return (
                <div key={`${item.id}-${index}`} className="bg-background-dark p-6 rounded border border-gray-800 flex flex-col justify-between h-full min-h-[300px] animate-in fade-in zoom-in-95 duration-500">
                  <div>
                    <div className="flex text-yellow-500 mb-4">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-sm">star</span>
                      ))}
                    </div>
                    <p className="text-gray-300 italic mb-6 line-clamp-6">"{item.content || item.text}"</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="size-10 rounded-full bg-gray-700 bg-cover bg-center"
                      style={{ backgroundImage: `url('${item.avatar || 'https://via.placeholder.com/150'}')` }}
                    />
                    <div>
                      <p className="text-white font-bold text-sm">{item.author || item.name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">{item.location || item.date || 'Cliente Verificado'}</p>
                    </div>
                  </div>
                </div>
              );
            } else {
              // Image / Blog Card
              return (
                <div key={`${item.id}-${index}`} className="group relative bg-gray-900 rounded overflow-hidden h-[300px] md:h-auto min-h-[300px] animate-in fade-in zoom-in-95 duration-500">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${item.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute top-4 right-4 flex gap-1 z-10">
                    {/* Overlay Stars if rating exists on image card */}
                    {item.rating && [...Array(item.rating)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-xs text-yellow-500 drop-shadow-md">star</span>
                    ))}
                  </div>
                  <div className="absolute bottom-0 p-6">
                    <span className="bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded mb-2 inline-block uppercase">
                      {item.tag || item.tags?.[0] || 'LIFESTYLE'}
                    </span>
                    <h3 className="text-white font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-300 text-xs line-clamp-2 mb-2">{item.content}</p>
                    <button className="text-xs text-gray-300 border-b border-transparent group-hover:border-white transition-all uppercase font-bold">
                      LEER MÁS
                    </button>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    </section>
  );
};

export default LifestyleSection;
