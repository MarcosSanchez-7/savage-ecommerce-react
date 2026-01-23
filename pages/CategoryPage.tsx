
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { ArrowLeft } from 'lucide-react';

const CategoryPage: React.FC = () => {
    const { category, subcategory } = useParams<{ category: string; subcategory?: string }>();
    const navigate = useNavigate();
    const { products, categories, addToCart, cart } = useShop();
    const [activeSubcategory, setActiveSubcategory] = React.useState<string>('ALL');

    React.useEffect(() => {
        if (subcategory) {
            setActiveSubcategory(subcategory);
        } else {
            setActiveSubcategory('ALL');
        }
        window.scrollTo(0, 0);
    }, [category, subcategory]);

    const currentCategoryInfo = categories.find(c => c.id.toLowerCase() === category?.toLowerCase() || c.name.toLowerCase() === category?.toLowerCase());

    const categoryProducts = products.filter(p => {
        const matchesCategory = p.category === currentCategoryInfo?.id;
        if (!matchesCategory) return false;
        if (activeSubcategory === 'ALL') return true;
        return p.subcategory === activeSubcategory;
    });

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const getSEOInfo = (catInfo: typeof categories[0] | undefined) => {
        const name = catInfo?.name.toLowerCase() || '';
        if (name.includes('camisetas') || name === 'ropa') return {
            title: 'Camisetas de Fútbol Premium',
            desc: 'La mejor selección de camisetas de fútbol retro y actuales en Paraguay.',
            docTitle: 'Camisetas de Fútbol - Savage Store Paraguay'
        };
        if (name.includes('calzado')) return {
            title: 'Calzado Urbano & Sneakers',
            desc: 'Zapatillas y sneakers exclusivos para completar tu outfit Savage.',
            docTitle: 'Calzado Urbano - Savage Store Paraguay'
        };
        if (name.includes('relojes') || name.includes('accesorios') || name.includes('joyas')) return {
            title: 'Relojes y Accesorios Premium',
            desc: 'Complementos de lujo: Relojes, cadenas y accesorios para destacar.',
            docTitle: 'Accesorios y Relojes - Savage Store Paraguay'
        };
        return {
            title: catInfo?.name || 'Categoría',
            desc: `${categoryProducts.length} productos disponibles`,
            docTitle: `${catInfo?.name || 'Categoría'} - Savage Store Paraguay`
        };
    };

    const seoInfo = getSEOInfo(currentCategoryInfo);

    React.useEffect(() => {
        document.title = seoInfo.docTitle;
    }, [category, seoInfo.docTitle]);

    return (
        <div className="min-h-screen bg-background-dark text-white selection:bg-primary selection:text-white">
            <Navbar cartCount={cartCount} />

            <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tight">{seoInfo.title}</h1>
                        <p className="text-accent-gray text-sm mt-1">{seoInfo.desc}</p>
                    </div>
                </div>

                {/* Subcategories Filter (Hierarchical) */}
                {(() => {
                    const subCats = categories.filter(c => c.parent_id === currentCategoryInfo?.id);
                    if (subCats.length === 0) return null;

                    return (
                        <div className="flex flex-wrap gap-2 mb-12 animate-in fade-in slide-in-from-left-4 duration-500 overflow-x-auto pb-4 scrollbar-hide">
                            <button
                                onClick={() => navigate(`/category/${category}`)}
                                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${activeSubcategory === 'ALL' ? 'bg-primary border-primary text-white shadow-[0_10px_20px_rgba(212,175,55,0.3)]' : 'bg-transparent border-white/10 text-gray-500 hover:border-white/20 hover:text-white'}`}
                            >
                                VER TODO
                            </button>
                            {subCats.map(sub => (
                                <button
                                    key={sub.id}
                                    onClick={() => navigate(`/category/${category}/${sub.id}`)}
                                    className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${activeSubcategory === sub.id ? 'bg-white text-black border-white shadow-[0_10px_20px_rgba(255,255,255,0.1)]' : 'bg-transparent border-white/10 text-gray-500 hover:border-white/20 hover:text-white'}`}
                                >
                                    {sub.name}
                                </button>
                            ))}
                        </div>
                    );
                })()}

                {categoryProducts.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {categoryProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={() => addToCart(product)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-surface-dark border border-gray-800 rounded-xl">
                        <p className="text-gray-500 text-lg">No hay productos en esta categoría.</p>
                        <Link to="/" className="text-primary hover:underline mt-4 inline-block font-bold">Volver al Inicio</Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default CategoryPage;
