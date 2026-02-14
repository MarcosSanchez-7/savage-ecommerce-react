import React from 'react';
import { useShop } from '../context/ShopContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const OffersPage: React.FC = () => {
    const { products, addToCart, cart, loading } = useShop();

    const offerProducts = products
        .filter(p => p.isActive !== false && p.isOffer)
        .sort((a, b) => b.id.localeCompare(a.id));

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    React.useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Ofertas Imperdibles - Savage Store';
    }, []);

    return (
        <div className="min-h-screen bg-background-dark text-white selection:bg-primary selection:text-white">
            <Navbar cartCount={cartCount} />

            <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>

                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tight flex items-center gap-2 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                            OFERTAS IMPERDIBLES
                        </h1>
                        <p className="text-gray-400 text-sm mt-1 font-bold uppercase tracking-widest">Precios de locura por tiempo limitado</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                ) : offerProducts.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {offerProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={() => addToCart(product)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-surface-dark border border-gray-800 rounded-xl">
                        <p className="text-gray-500 text-lg">No hay ofertas disponibles en este momento.</p>
                        <Link to="/" className="text-primary hover:underline mt-4 inline-block font-bold">Volver al Inicio</Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default OffersPage;
