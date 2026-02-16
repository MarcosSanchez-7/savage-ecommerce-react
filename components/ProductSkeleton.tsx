import React from 'react';

const ProductSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col gap-3 animate-pulse">
            <div className="w-full aspect-[3/4] rounded bg-gray-800/50" />
            <div className="flex flex-col gap-2 mt-2">
                <div className="h-4 bg-gray-800/50 rounded w-3/4" />
                <div className="h-3 bg-gray-800/30 rounded w-1/2" />
                <div className="flex justify-between items-center mt-2">
                    <div className="h-4 bg-gray-800/50 rounded w-1/3" />
                </div>
            </div>
        </div>
    );
};

export default ProductSkeleton;
