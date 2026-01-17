import React from 'react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const FavoritesPage: React.FC = () => {
    const { favorites, products, addToCart } = useShop();

    // Filter products that are in favorites
    const favoriteProducts = products.filter(p => favorites.includes(p.id));

    return (
        <div className="min-h-screen bg-black text-white pt-24 px-6 md:px-12 pb-20">
            <SEO title="Mis Favoritos - Savage Store" description="Tus productos guardados." />

            <div className="max-w-7xl mx-auto">
                <header className="mb-12 border-b border-white/10 pb-8 flex flex-col gap-4">
                    <Link to="/" className="text-gray-500 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors w-fit">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Volver al inicio
                    </Link>
                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2">Favoritos</h1>
                            <p className="text-gray-500">{favorites.length} productos guardados</p>
                        </div>
                    </div>
                </header>

                {favoriteProducts.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {favoriteProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={(p) => addToCart(p)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 opacity-50">
                        <p className="text-xl font-medium mb-4">No tienes favoritos aún.</p>
                        <Link to="/" className="text-primary hover:underline">Explorar la tienda</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
