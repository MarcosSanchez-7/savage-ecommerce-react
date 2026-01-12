import React from 'react';
import { useShop } from '../context/ShopContext';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const UpcomingDrops: React.FC = () => {
    const { products, addToCart } = useShop();

    // Filter products tagged with "DROP" or "COMING SOON" or "PRÓXIMAMENTE"
    const drops = products.filter(p =>
        p.tags.some(t => ['DROP', 'COMING SOON', 'PRÓXIMAMENTE', 'PROXIMAMENTE'].includes(t.toUpperCase()))
    ).slice(0, 4);

    if (drops.length === 0) return null;

    return (
        <section className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto border-t border-gray-900 bg-[#0a0a0a]">
            <div className="flex items-end justify-between mb-10 pb-4 border-b border-gray-800">
                <div>
                    <h2 className="text-3xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                        PRÓXIMOS LANZAMIENTOS <span className="bg-primary text-black text-[10px] px-2 py-1 rounded font-black animate-pulse">HYPE</span>
                    </h2>
                    <p className="text-accent-gray mt-1 text-sm">Lo que se viene en Savage. Prepárate.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {drops.map(product => (
                    <div key={product.id} className="relative group opacity-75 hover:opacity-100 transition-opacity">
                        <div className="absolute inset-0 z-10 bg-black/40 group-hover:bg-transparent transition-colors pointer-events-none flex items-center justify-center">
                            <span className="bg-black text-white text-xs font-bold px-3 py-1 border border-white/20 uppercase tracking-widest backdrop-blur-sm">
                                Coming Soon
                            </span>
                        </div>
                        {/* We use ProductCard but maybe disable interactions or show as "Preview" */}
                        <ProductCard
                            product={{ ...product, stock: 0 }} // Force styling as if no stock (or use custom card)
                            onAddToCart={() => alert('¡Este producto estará disponible pronto!')}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default UpcomingDrops;
