import React from 'react';
import ProductCardSkeleton from './ProductCardSkeleton';

interface ProductSectionSkeletonProps {
    title?: string;
    itemCount?: number;
}

const ProductSectionSkeleton: React.FC<ProductSectionSkeletonProps> = ({
    title = 'Cargando...',
    itemCount = 4
}) => {
    return (
        <section className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto">
            {/* Section Header Skeleton */}
            <div className="flex items-end justify-between mb-10 pb-4 border-b border-gray-800 animate-pulse">
                <div className="space-y-2">
                    <div className="h-8 bg-gray-800/50 rounded w-48" />
                    <div className="h-4 bg-gray-800/50 rounded w-64" />
                </div>
                <div className="hidden md:block h-4 bg-gray-800/50 rounded w-24" />
            </div>

            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {Array.from({ length: itemCount }).map((_, idx) => (
                    <ProductCardSkeleton key={idx} />
                ))}
            </div>
        </section>
    );
};

export default ProductSectionSkeleton;
