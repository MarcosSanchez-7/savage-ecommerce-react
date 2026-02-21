
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const NewArrivalsPage: React.FC = () => {
    const { products, cart, loading } = useShop();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Filter products marked as "New"
    const newArrivals = useMemo(() => {
        return (products || []).filter(p => p.isNew && p.isActive !== false);
    }, [products]);

    // Update screen size state
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Carousel settings
    const itemsPerView = isMobile ? 8 : 4;
    const interval = isMobile ? 3000 : 5000;
    const totalPages = Math.ceil(newArrivals.length / itemsPerView);

    // Auto-play timer
    useEffect(() => {
        if (totalPages <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalPages);
        }, interval);

        return () => clearInterval(timer);
    }, [totalPages, interval]);

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const nextPage = () => setCurrentIndex((prev) => (prev + 1) % totalPages);
    const prevPage = () => setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);

    const visibleProducts = useMemo(() => {
        const start = currentIndex * itemsPerView;
        return newArrivals.slice(start, start + itemsPerView);
    }, [newArrivals, currentIndex, itemsPerView]);

    return (
        <div className={`min-h-screen flex flex-col ${theme === 'light' ? 'bg-white' : 'bg-black'} transition-colors duration-300`}>
            <Navbar cartCount={cartCount} />

            <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-primary font-black tracking-widest text-xs uppercase mb-4 hover:translate-x-[-4px] transition-transform"
                        >
                            <ArrowLeft size={16} /> VOLVER A INICIO
                        </button>
                        <h1 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                            RECIÉN <span className="text-primary">LLEGADOS</span>
                        </h1>
                        <p className="text-text-muted mt-2 font-medium tracking-wide">ARTÍCULOS LIMITADOS</p>
                    </div>

                    {/* Pagination Indicators */}
                    {totalPages > 1 && (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={prevPage}
                                className={`p-3 rounded-full border border-border hover:bg-primary hover:text-white transition-all ${theme === 'light' ? 'bg-zinc-100' : 'bg-zinc-900'}`}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 transition-all duration-300 rounded-full ${i === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-border'}`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={nextPage}
                                className={`p-3 rounded-full border border-border hover:bg-primary hover:text-white transition-all ${theme === 'light' ? 'bg-zinc-100' : 'bg-zinc-900'}`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Carousel / Grid Area */}
                <div className="relative overflow-hidden min-h-[600px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -100, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className={`grid gap-6 ${isMobile ? 'grid-cols-2 grid-rows-4' : 'grid-cols-4'}`}
                        >
                            {visibleProducts.length > 0 ? (
                                visibleProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center">
                                    <p className="text-text-muted text-lg">No hay productos nuevos en este momento.</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Link / VER MAS */}
                <div className="mt-16 flex justify-center">
                    <button
                        onClick={() => navigate('/category/all')} // Or any general category
                        className="group relative px-10 py-4 bg-primary text-white font-black tracking-[0.3em] uppercase overflow-hidden transition-all hover:pr-14"
                    >
                        <span className="relative z-10 text-sm">VER TODO EL CATÁLOGO</span>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all" size={20} />
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default NewArrivalsPage;
