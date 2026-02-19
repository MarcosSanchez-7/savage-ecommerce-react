import React from 'react';

const ProductDetailSkeleton: React.FC = () => {
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

            <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 pt-32 animate-pulse">
                {/* Back Button Skeleton */}
                <div className="h-6 bg-gray-800/50 rounded w-24 mb-8" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Gallery Section Skeleton */}
                    <div className="space-y-6">
                        {/* Main Image */}
                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/5 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"
                                style={{
                                    backgroundSize: '200% 100%',
                                    animation: 'shimmer 2s infinite'
                                }}
                            />
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-24 aspect-square rounded-md bg-gray-800/50" />
                            ))}
                        </div>
                    </div>

                    {/* Details Section Skeleton */}
                    <div className="flex flex-col space-y-6">
                        {/* Tags */}
                        <div className="flex gap-2">
                            <div className="h-6 bg-gray-800/50 rounded w-16" />
                            <div className="h-6 bg-gray-800/50 rounded w-20" />
                        </div>

                        {/* Title */}
                        <div className="space-y-3">
                            <div className="h-12 bg-gray-800/50 rounded w-3/4" />
                            <div className="h-12 bg-gray-800/50 rounded w-1/2" />
                        </div>

                        {/* Price */}
                        <div className="h-10 bg-gray-800/50 rounded w-48" />

                        {/* Size Selector */}
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-800/50 rounded w-32" />
                            <div className="grid grid-cols-5 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                                {['P', 'M', 'G', 'XL', 'XXL'].map((size) => (
                                    <div key={size} className="h-12 w-20 bg-gray-800/50 rounded" />
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-800/50 rounded w-24" />
                            <div className="h-3 bg-gray-800/50 rounded w-full" />
                            <div className="h-3 bg-gray-800/50 rounded w-full" />
                            <div className="h-3 bg-gray-800/50 rounded w-3/4" />
                        </div>

                        {/* Add to Cart Button */}
                        <div className="h-14 bg-gray-800/50 rounded w-full mt-auto" />

                        {/* Related Products */}
                        <div className="border-t border-gray-800 pt-6 space-y-4">
                            <div className="h-4 bg-gray-800/50 rounded w-32" />
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="aspect-[3/4] bg-gray-800/50 rounded" />
                                        <div className="h-3 bg-gray-800/50 rounded w-full" />
                                        <div className="h-3 bg-gray-800/50 rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
};

export default ProductDetailSkeleton;
