import React, { useEffect, useState, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const QuickLinks: React.FC = () => {
    const { quickLinks, loading } = useShop();
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Responsive logic
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const visibleItemsCount = isMobile ? 3 : 5;
    const maxItems = quickLinks?.length || 0;

    useEffect(() => {
        if (!quickLinks || quickLinks.length <= visibleItemsCount) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % maxItems);
        }, 3000);

        return () => clearInterval(interval);
    }, [quickLinks, maxItems, visibleItemsCount]);

    if (loading) {
        return (
            <div className="w-full py-8 border-b border-gray-900 bg-background overflow-hidden flex justify-center gap-4 sm:gap-8 px-4 animate-pulse">
                {[...Array(isMobile ? 3 : 5)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 w-20 sm:w-28 flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-800"></div>
                        <div className="w-12 h-3 bg-gray-800 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!quickLinks || quickLinks.length === 0) return null;

    // We need to create a list of visible items by sliding a window over the quickLinks array
    // If we reach the end, we wrap around.
    const getVisibleLinks = () => {
        const items = [];
        for (let i = 0; i < visibleItemsCount; i++) {
            const index = (currentIndex + i) % maxItems;
            items.push(quickLinks[index]);
        }
        return items;
    };

    const visibleLinks = getVisibleLinks();

    return (
        <section className="w-full py-8 sm:py-10 border-b border-zinc-900 bg-background transition-colors duration-300 relative overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-2 sm:px-6">
                <div
                    className="flex justify-center items-center h-full relative"
                    ref={containerRef}
                >
                    <AnimatePresence mode="popLayout">
                        {visibleLinks.map((link, idx) => {
                            // A unique key is important for Framer Motion to track elements sliding in and out
                            const uniqueKey = `${link.id}-${(currentIndex + idx) % maxItems}`;
                            return (
                                <motion.div
                                    key={uniqueKey}
                                    layout
                                    initial={{ opacity: 0, x: 50, scale: 0.8 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -50, scale: 0.8 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="flex flex-col items-center flex-shrink-0 mx-2 sm:mx-6 cursor-pointer"
                                    style={{ width: isMobile ? '96px' : '110px' }}
                                >
                                    <Link to={link.link || '#'} className="group flex flex-col items-center gap-3 sm:gap-4 outline-none w-full">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-white border border-gray-200 dark:border-zinc-800 shadow-md transform transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20 flex items-center justify-center">
                                            <img
                                                src={link.image}
                                                alt={link.title}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        </div>
                                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-text text-center line-clamp-2 transition-colors duration-300 group-hover:text-primary leading-tight">
                                            {link.title}
                                        </span>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default QuickLinks;
