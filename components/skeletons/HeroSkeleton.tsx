import React from 'react';

const HeroSkeleton: React.FC = () => {
    return (
        <div className="relative h-[90vh] w-full overflow-hidden bg-gradient-to-br from-gray-900 to-black animate-pulse">
            {/* Background Image Skeleton */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 to-gray-900/30">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"
                    style={{
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2.5s infinite'
                    }}
                />
            </div>

            {/* Content Skeleton */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 space-y-6">
                {/* Logo/Title Skeleton */}
                <div className="h-16 bg-gray-800/50 rounded-lg w-64 md:w-96" />

                {/* Subtitle Skeleton */}
                <div className="h-8 bg-gray-800/50 rounded w-48 md:w-72" />

                {/* Button Skeleton */}
                <div className="h-14 bg-gray-800/50 rounded-full w-40 md:w-48 mt-8" />
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

export default HeroSkeleton;
