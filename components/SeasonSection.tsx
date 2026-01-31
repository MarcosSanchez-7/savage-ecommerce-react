
import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronRight, Plus } from 'lucide-react';
import ProductCard from './ProductCard';

const SeasonSection: React.FC = () => {
    const { seasonConfig, products, addToCart } = useShop();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // Filter active season products
    const seasonProducts = products.filter(p =>
        seasonConfig.productIds.includes(p.id) && p.isActive !== false
    );

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!seasonConfig.isEnabled || seasonProducts.length === 0) return null;

    return (
        <section className="relative w-full py-24 overflow-hidden bg-black border-y border-white/5">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
                <img
                    src={seasonConfig.backgroundImage || 'https://images.unsplash.com/photo-1523398002811-999ca8dec234'}
                    alt="Season Background"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80"></div>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 h-full flex flex-col justify-center">

                {/* Header */}
                <div className="mb-12 text-center lg:text-left pb-6 border-b border-white/10 flex flex-col items-center lg:items-start">
                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
                        {seasonConfig.title}
                    </h2>
                    <p className="text-gray-300 font-black tracking-[0.3em] uppercase mt-2 text-xs md:text-sm bg-white/10 px-4 py-1 rounded">
                        {seasonConfig.subtitle}
                    </p>

                    <Link to="/season" className="mt-8 bg-white hover:bg-gray-200 text-black px-8 py-3 rounded-none skew-x-[-12deg] hover:skew-x-0 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 transition-all group">
                        <span className="skew-x-[12deg] group-hover:skew-x-0 block">VER MÁS OPCIONES</span>
                        <ChevronRight size={16} className="skew-x-[12deg] group-hover:skew-x-0" />
                    </Link>
                </div>

                {/* Carousel */}
                <SeasonCarousel
                    products={seasonProducts}
                    addToCart={addToCart}
                    isMobile={isMobile}
                />
            </div>
        </section>
    );
};

const SeasonCarousel = ({ products, addToCart, isMobile }: { products: any[], addToCart: any, isMobile: boolean }) => {
    const [startIndex, setStartIndex] = useState(0);
    const visibleCount = isMobile ? 2 : 4;

    // Auto-slide
    useEffect(() => {
        if (products.length <= visibleCount) return;

        const interval = setInterval(() => {
            setStartIndex(prev => (prev + visibleCount) % products.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [products.length, visibleCount]);

    const getVisibleProducts = () => {
        if (products.length <= visibleCount) return products;

        const items = [];
        for (let i = 0; i < visibleCount; i++) {
            items.push(products[(startIndex + i) % products.length]);
        }
        return items;
    };

    const displayProducts = getVisibleProducts();

    const nextSlide = () => setStartIndex(prev => (prev + visibleCount) % products.length);
    const prevSlide = () => setStartIndex(prev => (prev - visibleCount + products.length) % products.length);

    return (
        <div className="relative group/carousel">
            {products.length > visibleCount && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute -left-4 lg:-left-16 top-1/2 -translate-y-1/2 z-30 bg-black/80 hover:bg-primary text-white hover:text-black p-3 rounded-full transition-all opacity-0 group-hover/carousel:opacity-100 backdrop-blur-md border border-white/10 hover:scale-110"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute -right-4 lg:-right-16 top-1/2 -translate-y-1/2 z-30 bg-black/80 hover:bg-primary text-white hover:text-black p-3 rounded-full transition-all opacity-0 group-hover/carousel:opacity-100 backdrop-blur-md border border-white/10 hover:scale-110"
                    >
                        <ArrowRight size={24} />
                    </button>
                </>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
                {displayProducts.map((product, idx) => (
                    <div key={`${product.id}-${startIndex}-${idx}`} className="transform transition-all duration-500 hover:scale-[1.02]">
                        <ProductCard
                            product={product}
                            onAddToCart={() => addToCart(product)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SeasonSection;
