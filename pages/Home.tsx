
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import CategoryBento from '../components/CategoryBento';
import LifestyleSection from '../components/LifestyleSection';
import Footer from '../components/Footer';

import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';

import FeaturedCarousel from '../components/FeaturedCarousel';
import NewArrivalsCarousel from '../components/NewArrivalsCarousel';
import SeasonSection from '../components/SeasonSection';

import ProductSkeleton from '../components/ProductSkeleton'; // Import Skeleton

const Home: React.FC = () => {
    const { products, addToCart, cart, categories, loading } = useShop(); // Add loading

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    // Filter New Arrivals logic...
    const newArrivals = products
        .filter(p => p.isActive !== false)
        .filter(p => p.isNew)
        .slice(0, 24); // More items for the carousel

    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary selection:text-white overflow-x-hidden transition-colors duration-300">
            <Navbar cartCount={cartCount} />

            <main>
                <Hero />
                <SeasonSection />

                {/* NUEVOS INGRESOS Section */}
                <section className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto">
                    <div className="flex items-end justify-between mb-10 pb-4 border-b border-gray-800">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight text-text">RECIÉN LLEGADOS</h2>
                            <p className="text-text-muted mt-1 text-sm font-bold uppercase tracking-widest">Artículos limitados</p>
                        </div>
                        <Link to="/recien-llegados" className="flex bg-text text-background hover:opacity-80 px-4 md:px-6 py-2 rounded-none skew-x-[-12deg] hover:skew-x-0 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] items-center gap-2 transition-all group">
                            <span className="skew-x-[12deg] group-hover:skew-x-0 block whitespace-nowrap">VER MÁS</span>
                            <ChevronRight size={14} className="skew-x-[12deg] group-hover:skew-x-0" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                            {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
                        </div>
                    ) : (
                        <NewArrivalsCarousel
                            products={newArrivals}
                            onAddToCart={(product) => addToCart(product)}
                        />
                    )}
                </section>

                {/* Featured Products Section (Max 8) */}
                <section className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto">
                    <div className="flex items-end justify-between mb-10 pb-4 border-b border-gray-800">
                        <div>
                            <h2 className="text-3xl font-bold uppercase tracking-tight text-text">Destacados</h2>
                            <p className="text-text-muted mt-1 text-sm">Selección exclusiva de temporada</p>
                        </div>
                        <Link to="/destacados" className="flex bg-text text-background hover:opacity-80 px-4 md:px-6 py-2 rounded-none skew-x-[-12deg] hover:skew-x-0 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] items-center gap-2 transition-all group">
                            <span className="skew-x-[12deg] group-hover:skew-x-0 block whitespace-nowrap">VER MÁS</span>
                            <ChevronRight size={14} className="skew-x-[12deg] group-hover:skew-x-0" />
                        </Link>
                    </div>

                    {/* Featured Carousel */}
                    <FeaturedCarousel
                        products={products
                            .filter(p => p.isActive !== false)
                            .filter(p => p.isFeatured)
                            // Sort: Featured First (implicitly filtered), then by ID descending (newest first assumption) or specific date if available
                            // Using ID string comparison for rough "newest" approximation if UUIDs/TimeIDs
                            .sort((a, b) => b.id.localeCompare(a.id))}
                        onAddToCart={addToCart}
                    />

                </section>

                {/* OFFER Products Section (Dynamic Carousel) */}
                {products.filter(p => p.isActive !== false && p.isOffer).length > 0 && (
                    <section className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto border-t border-gray-900 bg-gradient-to-b from-red-900/5 to-transparent">
                        <div className="flex items-end justify-between mb-10 pb-4 border-b border-red-900/30">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">OFERTAS IMPERDIBLES</h2>
                                <p className="text-text-muted mt-1 text-sm font-bold uppercase tracking-widest">Precios de locura por tiempo limitado</p>
                            </div>
                            <Link to="/ofertas" className="flex bg-text text-background hover:opacity-80 px-4 md:px-6 py-2 rounded-none skew-x-[-12deg] hover:skew-x-0 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] items-center gap-2 transition-all group">
                                <span className="skew-x-[12deg] group-hover:skew-x-0 block whitespace-nowrap">VER MÁS</span>
                                <ChevronRight size={14} className="skew-x-[12deg] group-hover:skew-x-0" />
                            </Link>
                        </div>

                        {/* Reuse FeaturedCarousel for the same sliding effect */}
                        <FeaturedCarousel
                            products={products
                                .filter(p => p.isActive !== false)
                                .filter(p => p.isOffer)
                                .sort((a, b) => b.id.localeCompare(a.id))}
                            onAddToCart={addToCart}
                        />

                    </section>
                )}

                {/* Dynamic Category Sections (Root Categories Only) */}
                {categories
                    .filter(c => !c.parent_id && !['HUÉRFANOS', 'HUERFANOS'].includes(c.name.toUpperCase()))
                    .map(categoryObj => {
                        const category = categoryObj.id;
                        const children = categories.filter(c => c.parent_id === categoryObj.id);
                        const categoryIds = [category, ...children.map(c => c.id)];

                        const categoryProducts = products.filter(p =>
                            p.isActive !== false && (
                                categoryIds.includes(p.category) ||
                                categoryIds.includes(p.subcategory || '')
                            )
                        );

                        if (categoryProducts.length === 0) return null;

                        const displayProducts = categoryProducts
                            // Sort: Category Featured First, then Newest (ID desc)
                            .sort((a, b) => {
                                if (a.isCategoryFeatured !== b.isCategoryFeatured) {
                                    return a.isCategoryFeatured ? -1 : 1;
                                }
                                return b.id.localeCompare(a.id); // Newest first
                            })
                            .slice(0, 8);

                        const hasMore = categoryProducts.length > 8;

                        return (
                            <section
                                key={category}
                                id={category}
                                className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto border-t border-gray-900"
                                style={{ opacity: categoryObj.opacity !== undefined ? categoryObj.opacity : 1 }}
                            >
                                <div className="flex items-end justify-between mb-10 pb-4 border-b border-gray-800">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black uppercase tracking-tight text-text">{categoryObj.name}</h2>
                                        <p className="text-text-muted text-sm font-bold tracking-widest uppercase opacity-70">
                                            {children.length > 0 ? children.map(c => c.name).join(' / ') : 'Colección Oficial'}
                                        </p>
                                    </div>
                                    {hasMore && (
                                        <Link
                                            to={`/category/${category}`}
                                            className="hidden md:flex items-center text-[10px] font-black tracking-[0.2em] text-primary hover:text-white transition-all gap-2 group whitespace-nowrap"
                                        >
                                            VER TODO <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                                    {displayProducts.map(product => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            onAddToCart={() => addToCart(product)}
                                        />
                                    ))}
                                </div>

                                {hasMore && (
                                    <div className="mt-12 text-center md:hidden">
                                        <Link
                                            to={`/category/${category}`}
                                            className="inline-flex items-center text-xs font-black tracking-[0.2em] text-primary hover:text-white transition-colors gap-2 border border-primary/20 px-8 py-4 rounded-full"
                                        >
                                            VER TODO {categoryObj.name} <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                )}
                            </section>
                        );
                    })}

                <CategoryBento />



                <LifestyleSection />
            </main>

            <Footer />
        </div >
    );
};

export default Home;
