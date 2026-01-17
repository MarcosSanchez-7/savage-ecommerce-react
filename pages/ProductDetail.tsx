
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ShoppingBag, ArrowLeft, Star, Share2, Heart } from 'lucide-react';

const ProductDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { products, addToCart, cart, socialConfig, favorites, toggleFavorite } = useShop();

    // Check if slug looks like a UUID (fallback for old links)
    const isUuid = (str?: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str || '');

    // Find by slug OR by ID
    const product = products.find(p => p.slug === slug || p.id === slug);

    // State
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string>('');

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    if (!product) {
        return <div className="min-h-screen bg-background-dark text-white flex items-center justify-center">Producto no encontrado</div>;
    }

    const isAccessory = product.category?.toUpperCase() === 'ACCESORIOS';

    const isTotallyOutOfStock = product.inventory && product.inventory.length > 0
        ? product.inventory.every(i => Number(i.quantity) === 0)
        : product.stock === 0;

    const handleWhatsAppOrder = () => {
        if (isTotallyOutOfStock) return;

        // Build Message
        const sizeInfo = selectedSize || (isAccessory ? 'Único' : 'No especificado');
        const message = `Hola! Quiero más info de: ${product.name} (Talle: ${sizeInfo}). ID: ${product.id}`;

        // WhatsApp URL
        const number = socialConfig.whatsapp ? socialConfig.whatsapp.replace(/\D/g, '') : '595983840235'; // Fallback
        window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    // ... (Related products logic remains)
    const relatedProducts = React.useMemo(() => {
        if (!product) return [];
        const candidates = products.filter(p => p.id !== product.id && p.category === product.category);
        const sameSub = candidates.filter(p => p.subcategory === product.subcategory);
        const otherSub = candidates.filter(p => p.subcategory !== product.subcategory);
        const shuffle = (list: typeof products) => [...list].sort(() => 0.5 - Math.random());
        return [...shuffle(sameSub), ...shuffle(otherSub)].slice(0, 3);
    }, [product, products]);

    return (
        <div className="min-h-screen bg-background-dark text-white">
            <Navbar cartCount={cartCount} />

            {/* SEO & Schema ... (kept same) */}
            <SEO
                title={`${product.name} - Savage Store Paraguay`}
                description={product.description || `Comprá ${product.name} en Savage Store. Calidad Premium.`}
                image={product.images[0]}
                product={true}
                url={window.location.href}
            />
            {/* ... Schema Script ... */}

            <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> Volver
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Gallery Section (Kept Same) */}
                    <div className="space-y-6">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-surface-dark border border-white/5 relative group">
                            <img
                                src={product.images[selectedImage]}
                                alt={product.name}
                                className={`w-full h-full object-cover ${isTotallyOutOfStock ? 'grayscale opacity-50' : ''}`}
                            />
                            {isTotallyOutOfStock && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="bg-red-600 text-white font-black px-6 py-3 uppercase tracking-widest text-xl border-4 border-white transform -rotate-12 shadow-2xl">
                                        AGOTADO
                                    </span>
                                </div>
                            )}
                        </div>
                        {/* Thumbnails code kept implicity if not removed */}
                        {product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative w-24 aspect-square rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImage === idx ? 'border-primary' : 'border-transparent hover:border-gray-600'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col">
                        {/* Tags & Title & Price ... (Kept same) */}
                        <div className="mb-2 flex gap-2">
                            {product.tags.filter(t => !['SIN CATEGORIA', 'SIN CATEGorÍA', 'NUEVO', 'NEW'].includes(t.toUpperCase())).map(tag => (
                                <span key={tag} className="px-2 py-1 bg-white/10 text-xs font-bold uppercase rounded text-primary border border-primary/20">{tag}</span>
                            ))}
                            {product.isNew && <span className="px-2 py-1 bg-primary text-xs font-bold uppercase rounded text-white">NUEVO</span>}
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4 leading-none">{product.name}</h1>

                        <div className="flex items-end gap-4 mb-8">
                            <span className="text-4xl font-bold font-mono text-primary">Gs. {product.price.toLocaleString()}</span>
                        </div>

                        {/* Size Selector (Kept same) */}
                        {!isAccessory && (
                            <div className="mb-10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-bold uppercase tracking-widest text-gray-300">Talle (Opcional)</span>
                                </div>
                                <div className="grid grid-cols-5 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                                    {product.sizes.map(size => {
                                        const normalizedSize = size.trim().toUpperCase();
                                        return (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`h-10 sm:h-12 w-full sm:w-20 flex flex-col items-center justify-center border rounded font-mono font-medium transition-all relative overflow-hidden ${selectedSize === size
                                                    ? 'bg-white text-black border-white'
                                                    : 'border-gray-800 text-gray-400 hover:border-gray-600'
                                                    }`}
                                            >
                                                <span className="text-xs sm:text-base">{size}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {product.description && (
                            <div className="mb-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Descripción</h3>
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line font-light">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        <div className="mt-auto space-y-4">
                            <button
                                onClick={handleWhatsAppOrder}
                                disabled={isTotallyOutOfStock}
                                className={`w-full py-5 font-bold tracking-[0.15em] uppercase rounded transition-all flex items-center justify-center gap-3 text-lg ${isTotallyOutOfStock ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#25D366] hover:bg-[#20b858] text-white shadow-lg lg:hover:scale-[1.01]'}`}
                            >
                                {isTotallyOutOfStock ? 'AGOTADO' : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
                                        PEDIR POR WHATSAPP
                                    </>
                                )}
                            </button>

                            <div className="flex gap-4 mt-4">
                                <button className="flex-1 py-4 border border-gray-800 hover:bg-white/5 rounded text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors text-white">
                                    <Share2 size={16} /> Compartir
                                </button>
                            </div>
                        </div>

                        {/* Recommendations Section */}
                        {relatedProducts.length > 0 && (
                            <div className="mt-8 border-t border-gray-800 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                                    <Star size={12} className="text-primary" /> Recomendaciones
                                </h3>
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {relatedProducts.map(rp => (
                                        <button
                                            key={rp.id}
                                            onClick={() => {
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                navigate(`/product/${rp.slug || rp.id}`);
                                            }}
                                            className="group text-left"
                                        >
                                            <div className="aspect-[3/4] rounded bg-gray-900 border border-white/10 overflow-hidden mb-2 group-hover:border-primary transition-colors relative">
                                                <img src={rp.images[0]} alt={rp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                {rp.images[1] && (
                                                    <img src={rp.images[1]} alt={rp.name} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                )}
                                            </div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase truncate group-hover:text-white transition-colors">{rp.name}</p>
                                            <p className="text-[9px] text-primary font-bold">Gs. {rp.price.toLocaleString()}</p>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => navigate(`/category/${product.category}`)}
                                    className="w-full py-3 border border-gray-800 hover:bg-white/5 hover:border-white/20 rounded text-[10px] font-bold uppercase tracking-[0.2em] transition-all text-center block text-gray-400 hover:text-white"
                                >
                                    Ver Más Opciones
                                </button>
                            </div>
                        )}

                        <div className="mt-8 border-t border-gray-800 pt-6 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <span className="material-symbols-outlined text-green-500">check_circle</span>
                                {socialConfig.shippingText || 'Envío gratis en compras mayores a Gs. 200.000'}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <span className="material-symbols-outlined text-green-500">check_circle</span>
                                {socialConfig.extraShippingInfo || 'Devoluciones gratis hasta 30 días'}
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductDetail;
