
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NewArrivalsCarouselProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
}

const NewArrivalsCarousel: React.FC<NewArrivalsCarouselProps> = ({ products, onAddToCart }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const itemsPerView = isMobile ? 8 : 4;
    const interval = isMobile ? 3000 : 5000;
    const totalPages = Math.ceil(products.length / itemsPerView);

    useEffect(() => {
        if (totalPages <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalPages);
        }, interval);
        return () => clearInterval(timer);
    }, [totalPages, interval]);

    const visibleProducts = useMemo(() => {
        const start = currentIndex * itemsPerView;
        return products.slice(start, start + itemsPerView);
    }, [products, currentIndex, itemsPerView]);

    if (products.length === 0) return null;

    return (
        <div className="relative">
            <div className="overflow-hidden min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className={`grid gap-4 sm:gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}
                    >
                        {visibleProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={() => onAddToCart(product)}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Indicators */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-border hover:bg-primary/50'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewArrivalsCarousel;
