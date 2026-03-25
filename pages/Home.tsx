import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import QuickLinks from '../components/QuickLinks';
import ProductCard from '../components/ProductCard';
import CategoryBento from '../components/CategoryBento';
import LifestyleSection from '../components/LifestyleSection';
import Footer from '../components/Footer';

import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';

import FeaturedCarousel from '../components/FeaturedCarousel';
import NewArrivalsCarousel from '../components/NewArrivalsCarousel';
import SeasonSection from '../components/SeasonSection';

import ProductSkeleton from '../components/ProductSkeleton'; // Import Skeleton

const Home: React.FC = () => {
    const { products, addToCart, cart, categories, loading, homeSectionsConfig } = useShop(); // Add loading

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const [isMobileHome, setIsMobileHome] = React.useState(false);
    React.useEffect(() => {
        const handleResize = () => setIsMobileHome(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxItems = isMobileHome ? 4 : 12;

    // Filter New Arrivals logic...
    const newArrivals = products
        .filter(p => p.isActive !== false)
        .filter(p => p.isNew)
        .slice(0, maxItems);

    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary selection:text-white transition-colors duration-300">
            <SEO />
            <Navbar cartCount={cartCount} />

            <main className="overflow-x-clip">
                <Hero />
                <SeasonSection />

                {/* NUEVOS INGRESOS Section */}
                {homeSectionsConfig?.showNewArrivals && (
                <section className="py-10 md:py-16 px-6 lg:px-12 max-w-[1400px] mx-auto">
                    <div className="text-center mb-8 pb-4 border-b border-gray-800 flex flex-col items-center justify-center">
                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-text">RECIÉN LLEGADOS</h2>
                        <p className="text-text-muted mt-2 text-xs md:text-sm font-bold uppercase tracking-widest">Artículos limitados</p>
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

                    <div className="mt-8 text-center flex justify-center">
                        <Link to="/recien-llegados" className="group flex items-center gap-3 bg-zinc-900 border border-gray-800 text-white hover:bg-white hover:text-black transition-colors px-8 py-4 text-[11px] md:text-xs font-black uppercase tracking-[0.2em] shadow-xl">
                            VER MÁS RECIÉN LLEGADOS
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </section>
                )}

                {/* Featured Products Section (Max 8) */}
                {homeSectionsConfig?.showFeatured && (
                <section className="py-10 md:py-16 px-6 lg:px-12 max-w-[1400px] mx-auto border-t border-gray-900/50">
                    <div className="text-center mb-8 pb-4 border-b border-gray-800 flex flex-col items-center justify-center">
                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-text">DESTACADOS</h2>
                        <p className="text-text-muted mt-2 text-xs md:text-sm font-bold uppercase tracking-widest">Selección exclusiva de temporada</p>
                    </div>

                    <FeaturedCarousel
                        products={products
                            .filter(p => p.isActive !== false)
                            .filter(p => p.isFeatured)
                            .sort((a, b) => b.id.localeCompare(a.id))
                            .slice(0, maxItems)}
                        onAddToCart={addToCart}
                    />

                    <div className="mt-8 text-center flex justify-center">
                        <Link to="/destacados" className="group flex items-center gap-3 bg-zinc-900 border border-gray-800 text-white hover:bg-white hover:text-black transition-colors px-8 py-4 text-[11px] md:text-xs font-black uppercase tracking-[0.2em] shadow-xl">
                            VER MÁS DESTACADOS
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </section>
                )}

                {/* OFFER Products Section (Dynamic Carousel) */}
                {homeSectionsConfig?.showOffers && products.filter(p => p.isActive !== false && p.isOffer).length > 0 && (
                    <section className="py-10 md:py-16 px-6 lg:px-12 max-w-[1400px] mx-auto border-t border-red-900/20 bg-gradient-to-b from-red-900/5 to-transparent">
                        <div className="text-center mb-8 pb-4 border-b border-red-900/30 flex flex-col items-center justify-center">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">OFERTAS IMPERDIBLES</h2>
                            <p className="text-text-muted mt-2 text-xs md:text-sm font-bold uppercase tracking-widest">Precios de locura por tiempo limitado</p>
                        </div>

                        <FeaturedCarousel
                            products={products
                                .filter(p => p.isActive !== false)
                                .filter(p => p.isOffer)
                                .sort((a, b) => b.id.localeCompare(a.id))
                                .slice(0, maxItems)}
                            onAddToCart={addToCart}
                        />

                        <div className="mt-8 text-center flex justify-center">
                            <Link to="/ofertas" className="group flex items-center gap-3 bg-red-950/40 border border-red-900/50 text-red-100 hover:bg-red-600 hover:border-red-500 hover:text-white transition-colors px-8 py-4 text-[11px] md:text-xs font-black uppercase tracking-[0.2em] shadow-xl">
                                VER MÁS OFERTAS
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </section>
                )}
                
                <QuickLinks />
                
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
                            .slice(0, isMobileHome ? 4 : 12); // Give it some room to scroll natively

                        const hasMore = categoryProducts.length > 4;

                        return (
                            <section
                                key={category}
                                id={category}
                                className="py-10 md:py-16 px-6 lg:px-12 max-w-[1400px] mx-auto border-t border-gray-900"
                                style={{ opacity: categoryObj.opacity !== undefined ? categoryObj.opacity : 1 }}
                            >
                                <div className="text-center mb-8 pb-4 border-b border-gray-800 flex flex-col items-center justify-center">
                                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-text">{categoryObj.name}</h2>
                                    <p className="text-text-muted text-xs md:text-sm font-bold tracking-widest uppercase opacity-70 mt-2">
                                        {children.length > 0 ? children.map(c => c.name).join(' / ') : 'Colección Oficial'}
                                    </p>
                                </div>

                                {/* Custom FeaturedCarousel for categories so they follow the new slider UI */}
                                <FeaturedCarousel 
                                    products={displayProducts}
                                    onAddToCart={addToCart}
                                />

                                {hasMore && (
                                    <div className="mt-8 text-center flex justify-center">
                                        <Link
                                            to={`/category/${category}`}
                                            className="group flex items-center gap-3 bg-zinc-900 border border-gray-800 text-white hover:bg-white hover:text-black transition-colors px-8 py-4 text-[11px] md:text-xs font-black uppercase tracking-[0.2em] shadow-xl"
                                        >
                                            VER MÁS {categoryObj.name}
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                )}
                            </section>
                        );
                    })}



                <LifestyleSection />
            </main>

            <Footer />
        </div >
    );
};

export default Home;
