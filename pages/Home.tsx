
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

const Home: React.FC = () => {
    const { products, addToCart, cart } = useShop();

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    // Get unique categories
    const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

    return (
        <div className="min-h-screen bg-background-dark text-white selection:bg-primary selection:text-white">
            <Navbar cartCount={cartCount} />

            <main>
                <Hero />

                {/* Featured Products Section (Max 8) */}
                <section className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto">
                    <div className="flex items-end justify-between mb-10 pb-4 border-b border-gray-800">
                        <div>
                            <h2 className="text-3xl font-bold uppercase tracking-tight">Destacados</h2>
                            <p className="text-accent-gray mt-1 text-sm">Selección exclusiva de temporada</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.slice(0, 8).map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={() => addToCart(product)}
                            />
                        ))}
                    </div>
                </section>

                {/* Dynamic Category Sections */}
                {categories.map(category => {
                    const categoryProducts = products.filter(p => p.category === category);
                    if (categoryProducts.length === 0) return null;
                    const displayProducts = categoryProducts.slice(0, 8);
                    const hasMore = categoryProducts.length > 8;

                    return (
                        <section key={category} className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto border-t border-gray-900">
                            <div className="flex items-end justify-between mb-10 pb-4 border-b border-gray-800">
                                <div>
                                    <h2 className="text-3xl font-bold uppercase tracking-tight">{category}</h2>
                                    <p className="text-accent-gray mt-1 text-sm">Explora nuestra colección de {category}</p>
                                </div>
                                {hasMore && (
                                    <Link
                                        to={`/category/${category}`}
                                        className="hidden md:flex items-center text-sm font-bold text-primary hover:text-white transition-colors gap-1"
                                    >
                                        VER TODO <ArrowRight size={16} />
                                    </Link>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {displayProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={() => addToCart(product)}
                                    />
                                ))}
                            </div>

                            {hasMore && (
                                <div className="mt-8 text-center md:hidden">
                                    <Link
                                        to={`/category/${category}`}
                                        className="inline-flex items-center text-sm font-bold text-primary hover:text-white transition-colors gap-1 border border-primary/50 px-6 py-3 rounded"
                                    >
                                        VER TODO {category} <ArrowRight size={16} />
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
