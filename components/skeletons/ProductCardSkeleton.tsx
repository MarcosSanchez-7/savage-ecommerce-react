import React from 'react';

const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="group relative animate-pulse">
            {/* Image Skeleton */}
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"
                    style={{
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s infinite'
                    }}
                />
            </div>

            {/* Content Skeleton */}
            <div className="mt-4 space-y-2">
                {/* Title */}
                <div className="h-4 bg-gray-800/50 rounded w-3/4" />

                {/* Price */}
                <div className="h-5 bg-gray-800/50 rounded w-1/2" />

                {/* Tags */}
                <div className="flex gap-2">
                    <div className="h-3 bg-gray-800/50 rounded w-16" />
                    <div className="h-3 bg-gray-800/50 rounded w-12" />
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
};

export default ProductCardSkeleton;
