import React from 'react';

const CategoryPageSkeleton: React.FC = () => {
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

            <main className="pt-32 px-6 lg:px-12 max-w-[1400px] mx-auto animate-pulse">
                {/* Back Button */}
                <div className="h-6 bg-gray-800/50 rounded w-24 mb-8" />

                {/* Category Header */}
                <div className="mb-12 space-y-4">
                    <div className="h-12 bg-gray-800/50 rounded w-64" />
                    <div className="h-6 bg-gray-800/50 rounded w-96" />
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-8">
                    <div className="h-10 bg-gray-800/50 rounded w-32" />
                    <div className="h-10 bg-gray-800/50 rounded w-32" />
                    <div className="h-10 bg-gray-800/50 rounded w-32" />
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {Array.from({ length: 12 }).map((_, idx) => (
                        <div key={idx} className="group relative">
                            {/* Image */}
                            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/5 relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"
                                    style={{
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 2s infinite'
                                    }}
                                />
                            </div>
                            {/* Content */}
                            <div className="mt-4 space-y-2">
                                <div className="h-4 bg-gray-800/50 rounded w-3/4" />
                                <div className="h-5 bg-gray-800/50 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
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

export default CategoryPageSkeleton;
