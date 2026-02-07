import React from 'react';
import HeroSkeleton from './HeroSkeleton';
import ProductSectionSkeleton from './ProductSectionSkeleton';

const HomePageSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-background-dark text-white">
            {/* Navbar Skeleton */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10 animate-pulse">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
                    <div className="h-8 bg-gray-800/50 rounded w-32" />
                    <div className="flex gap-4">
                        <div className="h-8 w-8 bg-gray-800/50 rounded-full" />
                        <div className="h-8 w-8 bg-gray-800/50 rounded-full" />
                        <div className="h-8 w-8 bg-gray-800/50 rounded-full" />
                    </div>
                </div>
            </nav>

            <main className="pt-20">
                {/* Hero Skeleton */}
                <HeroSkeleton />

                {/* Season Section Skeleton */}
                <div className="py-12 px-6 lg:px-12 max-w-[1400px] mx-auto animate-pulse">
                    <div className="h-64 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-lg" />
                </div>

                {/* New Arrivals Section */}
                <ProductSectionSkeleton title="Recién Llegados" itemCount={8} />

                {/* Featured Section */}
                <ProductSectionSkeleton title="Destacados" itemCount={8} />

                {/* Category Sections */}
                <ProductSectionSkeleton title="Categoría" itemCount={8} />
                <ProductSectionSkeleton title="Categoría" itemCount={8} />

                {/* Lifestyle Section Skeleton */}
                <div className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-96 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-lg" />
                        <div className="h-96 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-lg" />
                    </div>
                </div>
            </main>

            {/* Footer Skeleton */}
            <footer className="bg-black/50 border-t border-white/10 py-12 animate-pulse">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-3">
                                <div className="h-4 bg-gray-800/50 rounded w-24" />
                                <div className="h-3 bg-gray-800/50 rounded w-32" />
                                <div className="h-3 bg-gray-800/50 rounded w-28" />
                                <div className="h-3 bg-gray-800/50 rounded w-36" />
                            </div>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePageSkeleton;
