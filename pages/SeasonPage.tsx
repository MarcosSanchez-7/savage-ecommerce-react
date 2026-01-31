
import React from 'react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';

const SeasonPage: React.FC = () => {
    const { seasonConfig, products, addToCart, cart } = useShop();
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const seasonProducts = products.filter(p =>
        seasonConfig.productIds.includes(p.id) && p.isActive !== false
    );

    if (!seasonConfig?.isEnabled) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
                <Navbar cartCount={cartCount} />
                <h1 className="text-2xl font-bold uppercase tracking-widest text-gray-500">Colección no disponible</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-white">
            <Navbar cartCount={cartCount} />

            {/* Hero Header */}
            <div className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden border-b border-white/5">
                <Link to="/" className="absolute top-4 md:top-24 left-4 md:left-12 z-20 flex items-center gap-3 group transition-all">
                    <div className="bg-black/50 p-3 rounded-full text-primary border border-primary/20 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all backdrop-blur-md shadow-[0_0_15px_rgba(234,179,8,0.15)] group-hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                        <ArrowLeft size={22} />
                    </div>
                    <span className="font-black uppercase tracking-widest text-xs hidden md:block text-primary group-hover:translate-x-1 transition-transform">Volver al Inicio</span>
                </Link>
                <img
                    src={seasonConfig.backgroundImage || 'https://images.unsplash.com/photo-1523398002811-999ca8dec234'}
                    alt="Season Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 select-none animate-in fade-in duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-[#050505]" />
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

                <div className="relative z-10 text-center px-4 animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-100">
                    <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-6 text-white drop-shadow-2xl">
                        {seasonConfig.title}
                    </h1>
                    <p className="inline-block bg-white text-black px-6 py-2 text-xs md:text-sm font-black uppercase tracking-[0.4em] shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        {seasonConfig.subtitle}
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-[1400px] mx-auto px-6 py-20">
                <div className="flex justify-between items-end mb-10 pb-4 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Colección Completa</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{seasonProducts.length} Productos Exclusivos</p>
                    </div>
                </div>

                {seasonProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-12">
                        {seasonProducts.map((product, idx) => (
                            <div key={product.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 50}ms` }}>
                                <ProductCard product={product} onAddToCart={() => addToCart(product)} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500 font-bold uppercase tracking-widest">
                        No hay productos disponibles en esta colección por el momento.
                    </div>
                )}
            </div>
        </div>
    );
};
export default SeasonPage;
