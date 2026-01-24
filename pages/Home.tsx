
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import CategoryBento from '../components/CategoryBento';
import LifestyleSection from '../components/LifestyleSection';
import Footer from '../components/Footer';

import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import UpcomingDrops from '../components/UpcomingDrops';
import FeaturedCarousel from '../components/FeaturedCarousel';

const Home: React.FC = () => {
    const { products, addToCart, cart, categories } = useShop();

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    // Categories are now directly from context (objects)

    return (
        <div className="min-h-screen bg-background-dark text-white selection:bg-primary selection:text-white overflow-x-hidden">
            <Navbar cartCount={cartCount} />

            <main>
                <Hero />
                <UpcomingDrops />

                {/* Featured Products Section (Max 8) */}
                <section className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto">
                    <div className="flex items-end justify-between mb-10 pb-4 border-b border-gray-800">
                        <div>
                            <h2 className="text-3xl font-bold uppercase tracking-tight">Destacados</h2>
                            <p className="text-accent-gray mt-1 text-sm">Selección exclusiva de temporada</p>
                        </div>
                    </div>

                    {/* Featured Carousel */}
                    <FeaturedCarousel
                        products={products
                            .filter(p => p.isFeatured)
                            // Sort: Featured First (implicitly filtered), then by ID descending (newest first assumption) or specific date if available
                            // Using ID string comparison for rough "newest" approximation if UUIDs/TimeIDs
                            .sort((a, b) => b.id.localeCompare(a.id))}
                        onAddToCart={addToCart}
                    />

                </section>

                {/* Dynamic Category Sections (Root Categories Only) */}
                {categories
                    .filter(c => !c.parent_id && !['HUÉRFANOS', 'HUERFANOS'].includes(c.name.toUpperCase()))
                    .map(categoryObj => {
                        const category = categoryObj.id;
                        const children = categories.filter(c => c.parent_id === categoryObj.id);
                        const categoryIds = [category, ...children.map(c => c.id)];

                        const categoryProducts = products.filter(p =>
                            categoryIds.includes(p.category) ||
                            categoryIds.includes(p.subcategory || '')
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
                                        <h2 className="text-3xl font-black uppercase tracking-tight">{categoryObj.name}</h2>
                                        <p className="text-gray-500 text-sm font-bold tracking-widest uppercase opacity-70">
                                            {children.length > 0 ? children.map(c => c.name).join(' / ') : 'Colección Oficial'}
                                        </p>
                                    </div>
                                    {hasMore && (
                                        <Link
                                            to={`/category/${category}`}
                                            className="hidden md:flex items-center text-xs font-black tracking-[0.2em] text-primary hover:text-white transition-all gap-2 group"
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
        </div>
    );
};

export default Home;
