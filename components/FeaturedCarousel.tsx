import React, { useRef, useState, useEffect } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedCarouselProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ products, onAddToCart }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const checkArrows = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(Math.ceil(scrollLeft) < scrollWidth - clientWidth);
    };

    useEffect(() => {
        checkArrows();
        // Give it a tiny delay on mount to ensure sizing is calculated
        setTimeout(checkArrows, 100);
        window.addEventListener('resize', checkArrows);
        return () => window.removeEventListener('resize', checkArrows);
    }, [products]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const itemWidth = container.querySelector('.snap-start')?.clientWidth || container.clientWidth;
        
        // Scroll one full visible area worth of items minus one item for context, or at least one item
        const scrollAmount = Math.max(container.clientWidth - itemWidth, itemWidth);
        
        container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    };

    if (products.length === 0) return null;

    return (
        <div className="relative group/carousel">
            <button
                onClick={() => scroll('left')}
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-5 z-10 bg-black/80 hover:bg-black text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-all shadow-xl hidden sm:flex items-center justify-center ${showLeftArrow ? 'opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100' : 'opacity-0 pointer-events-none'}`}
                aria-label="Scroll left"
            >
                <ChevronLeft size={24} />
            </button>
            
            <div 
                ref={scrollContainerRef}
                onScroll={checkArrows}
                className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
                {products.map(product => (
                    <div 
                        key={product.id} 
                        className="flex-none w-[80vw] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] snap-start"
                    >
                        <ProductCard
                            product={product}
                            onAddToCart={() => onAddToCart(product)}
                            showCategoryTag={true}
                        />
                    </div>
                ))}
            </div>

            <button
                onClick={() => scroll('right')}
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-5 z-10 bg-black/80 hover:bg-black text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-all shadow-xl hidden sm:flex items-center justify-center ${showRightArrow ? 'opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100' : 'opacity-0 pointer-events-none'}`}
                aria-label="Scroll right"
            >
                <ChevronRight size={24} />
            </button>
        </div>
    );
};

export default FeaturedCarousel;
