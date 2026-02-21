import React from 'react';
import { useShop } from '../context/ShopContext';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedPage: React.FC = () => {
    const { products, addToCart, cart, loading } = useShop();
    const { theme } = useTheme();

    const featuredProducts = products
        .filter(p => p.isActive !== false && p.isFeatured)
        .sort((a, b) => b.id.localeCompare(a.id));

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    React.useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Destacados - Savage Store';
    }, []);

    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary selection:text-white transition-colors duration-300">
            <Navbar cartCount={cartCount} />

            <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="text-text-muted hover:text-primary transition-colors">
                        <ArrowLeft size={24} />
                    </Link>

                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tight flex items-center gap-2 text-primary">
                            DESTACADOS
                        </h1>
                        <p className="text-accent-gray text-sm mt-1">Selección exclusiva de temporada</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                ) : featuredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {featuredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={() => addToCart(product)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-surface border border-border rounded-xl">
                        <p className="text-text-muted text-lg">No hay productos destacados en este momento.</p>
                        <Link to="/" className="text-primary hover:underline mt-4 inline-block font-bold">Volver al Inicio</Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default FeaturedPage;
