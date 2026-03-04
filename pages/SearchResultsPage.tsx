import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { Search } from 'lucide-react';

const SearchResultsPage: React.FC = () => {
    const { products, categories, cart, addToCart } = useShop();

    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const handleQuickAdd = (product: any) => {
        addToCart(product);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 24;

    const searchResults = useMemo(() => {
        if (!query.trim()) return [];
        const lowerQuery = query.toLowerCase();

        return products.filter(p => {
            if (!p) return false;
            if (p.isActive === false) return false;

            const cat = categories.find(c => c && String(c.id) === String(p.category));
            const sub = categories.find(c => c && String(c.id) === String(p.subcategory));

            const nameMatch = p.name ? p.name.toLowerCase().includes(lowerQuery) : false;
            const catMatch = cat && cat.name ? cat.name.toLowerCase().includes(lowerQuery) : false;
            const subMatch = sub && sub.name ? sub.name.toLowerCase().includes(lowerQuery) : false;
            const tagMatch = p.tags && Array.isArray(p.tags) ? p.tags.some(tag => tag && tag.toLowerCase().includes(lowerQuery)) : false;

            return nameMatch || catMatch || subMatch || tagMatch;
        });
    }, [query, products, categories]);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = searchResults.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(searchResults.length / productsPerPage);

    return (
        <div className="bg-background min-h-screen text-text flex flex-col font-sans transition-colors duration-300">
            <SEO
                title={`Resultados para "${query}" - Savage Store`}
                description={`Explora los resultados de búsqueda para ${query} en Savage Store`}
            />
            <Navbar cartCount={cartCount} />

            <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 md:px-8 py-10">
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-text">
                        Resultados de <span className="text-primary italic">Búsqueda</span>
                    </h1>
                    <p className="text-text-muted mt-2 text-lg">
                        {searchResults.length} {searchResults.length === 1 ? 'producto encontrado' : 'productos encontrados'} para "{query}"
                    </p>
                </div>

                {searchResults.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 gap-y-10 md:gap-8">
                            {currentProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={handleQuickAdd}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-16 mb-8">
                                <button
                                    onClick={() => {
                                        setCurrentPage(prev => Math.max(prev - 1, 1));
                                        window.scrollTo(0, 0);
                                    }}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-surface border border-border rounded text-text font-bold disabled:opacity-50 hover:border-primary transition-colors"
                                >
                                    Anterior
                                </button>
                                <span className="text-text font-bold px-4">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => {
                                        setCurrentPage(prev => Math.min(prev + 1, totalPages));
                                        window.scrollTo(0, 0);
                                    }}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-surface border border-border rounded text-text font-bold disabled:opacity-50 hover:border-primary transition-colors"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                        <div className="w-24 h-24 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted mb-6">
                            <Search size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-text mb-2 uppercase">No se encontraron resultados</h2>
                        <p className="text-text-muted max-w-md mb-8">No logramos encontrar ningún producto que coincida con "{query}". Intenta con otros términos o explora nuestras categorías.</p>

                        <button
                            onClick={() => navigate('/')}
                            className="bg-primary text-black font-black px-8 py-4 rounded-full text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default SearchResultsPage;
