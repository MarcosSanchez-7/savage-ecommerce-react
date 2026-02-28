
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const NewArrivalsPage: React.FC = () => {
    const { products, cart, loading } = useShop();
    const { theme } = useTheme();
    const navigate = useNavigate();

    // Filter products marked as "New"
    const newArrivals = useMemo(() => {
        return (products || []).filter(p => p.isNew && p.isActive !== false);
    }, [products]);

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className={`min-h-screen flex flex-col ${theme === 'light' ? 'bg-white' : 'bg-black'} transition-colors duration-300`}>
            <Navbar cartCount={cartCount} />

            <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-primary font-black tracking-widest text-xs uppercase mb-4 hover:translate-x-[-4px] transition-transform"
                        >
                            <ArrowLeft size={16} /> VOLVER A INICIO
                        </button>
                        <h1 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                            RECIÉN <span className="text-primary">LLEGADOS</span>
                        </h1>
                        <p className="text-text-muted mt-2 font-medium tracking-wide">ARTÍCULOS LIMITADOS</p>
                    </div>


                </div>

                {/* Grid Area */}
                <div className="min-h-[600px]">
                    <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
                        {newArrivals.length > 0 ? (
                            newArrivals.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-text-muted text-lg">No hay productos nuevos en este momento.</p>
                            </div>
                        )}
                    </div>
                </div>



            </main>

            <Footer />
        </div>
    );
};

export default NewArrivalsPage;
