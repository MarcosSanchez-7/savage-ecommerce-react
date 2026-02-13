
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ShoppingBag, ArrowLeft, Star, Share2, Heart } from 'lucide-react';
import { toast } from 'react-toastify';

const ProductDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { products, addToCart, cart, socialConfig, toggleCart } = useShop();
    // const { favorites, toggleFavorite } = useShop(); // Removed favorites

    // Check if slug looks like a UUID (fallback for old links)
    const isUuid = (str?: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str || '');

    // Find by slug OR by ID
    const product = products.find(p => p.slug === slug || p.id === slug);

    // State
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string>('');

    // Scroll handling is now managed by ScrollToTop component in App.tsx

    if (!product || product.isActive === false) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center space-y-4">
                <div className="text-6xl">🙈</div>
                <h1 className="text-2xl font-black uppercase tracking-widest text-primary">Producto No Disponible</h1>
                <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">Este producto está oculto temporalmente o no existe.</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest rounded-lg transition-all"
                >
                    Volver al Inicio
                </button>
            </div>
        );
    }

    const isAccessory = product.category?.toUpperCase() === 'ACCESORIOS';

    const isTotallyOutOfStock = !product.isImported && (product.inventory && product.inventory.length > 0
        ? product.inventory.every(i => Number(i.quantity) === 0)
        : product.stock === 0);

    const handleAddToCart = () => {
        if (isTotallyOutOfStock) return;

        if (product.sizes && product.sizes.length > 0 && !selectedSize && !isAccessory) {
            toast.error('❌ Por favor selecciona un talle para continuar.');
            return;
        }

        addToCart(product, selectedSize || 'Único');
        // Success toast is handled directly in ShopContext.addToCart
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

            <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 min-h-[70vh]">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> Volver
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Gallery Section (Kept Same) */}
                    {/* Gallery Section with Arrows */}
                    <div className="space-y-6">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-surface-dark border border-white/5 relative group">
                            <img
                                src={product.images[selectedImage]}
                                alt={product.name}
                                className={`w-full h-full object-cover ${isTotallyOutOfStock ? 'grayscale opacity-50' : ''}`}
                            />

                            {/* Navigation Arrows */}
                            {product.images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(prev => prev === 0 ? product.images.length - 1 : prev - 1);
                                        }}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(prev => prev === product.images.length - 1 ? 0 : prev + 1);
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ArrowLeft size={20} className="rotate-180" />
                                    </button>
                                </>
                            )}

                            {isTotallyOutOfStock && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="bg-black text-white font-black px-6 py-3 uppercase tracking-widest text-xl border-4 border-white transform -rotate-12 shadow-2xl">
                                        AGOTADO
                                    </span>
                                </div>
                            )}
                        </div>
                        {/* Thumbnails code */}
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

                        {/* Size Selector */}
                        {!isAccessory && (
                            <div className="mb-10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-bold uppercase tracking-widest text-gray-300">
                                        {product.isImported ? 'SELECCIONA TU TALLE' : (product.category?.toUpperCase() === 'CALZADOS' ? 'CALCE' : 'TALLE')}
                                    </span>
                                </div>

                                {product.isImported ? (
                                    // Imported Logic: Fixed Sizes P-XXL, No Stock Check
                                    <div className="grid grid-cols-5 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                                        {['P', 'M', 'G', 'XL', 'XXL'].map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`h-10 sm:h-12 w-full sm:w-20 flex flex-col items-center justify-center border rounded font-mono font-medium transition-all relative overflow-hidden 
                                                ${selectedSize === size
                                                        ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                                        : 'border-gray-800 text-gray-400 hover:border-blue-500/50 hover:text-blue-400'
                                                    }`}
                                            >
                                                <span className="text-xs sm:text-base">{size}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    // Standard Logic: Dynamic Sizes with Stock Check
                                    <div className="grid grid-cols-5 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                                        {product.sizes?.map(size => {
                                            const normalizedSize = size.trim().toUpperCase();
                                            const invItem = product.inventory?.find(i => i.size.trim().toUpperCase() === normalizedSize);
                                            const isOutOfStock = !product.isImported && (invItem ? Number(invItem.quantity) <= 0 : (product.inventory && product.inventory.length > 0));

                                            return (
                                                <button
                                                    key={size}
                                                    onClick={() => !isOutOfStock && setSelectedSize(size)}
                                                    disabled={isOutOfStock}
                                                    className={`h-10 sm:h-12 w-full sm:w-20 flex flex-col items-center justify-center border rounded font-mono font-medium transition-all relative overflow-hidden 
                                                    ${isOutOfStock
                                                            ? 'bg-gray-900 border-gray-800 text-gray-700 cursor-not-allowed opacity-50 relative'
                                                            : selectedSize === size
                                                                ? 'bg-white text-black border-white'
                                                                : 'border-gray-800 text-gray-400 hover:border-gray-600'
                                                        }`}
                                                >
                                                    <span className={`text-xs sm:text-base ${isOutOfStock ? 'opacity-20' : ''}`}>{size}</span>
                                                    {isOutOfStock && <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-red-500 bg-black/10">AGOTADO</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {product.isImported && (
                                    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/5 p-2 rounded border border-blue-500/20">
                                        <span className="material-symbols-outlined text-xs">info</span>
                                        Elige el talle que deseas importar
                                    </div>
                                )}
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

                        {/* Import Conditions */}
                        {product.isImported && (
                            <div className="mb-6 bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-700">
                                <div className="flex items-center gap-2 text-blue-400 border-b border-blue-500/20 pb-3">
                                    <span className="material-symbols-outlined">globe</span>
                                    <h3 className="text-xs font-black uppercase tracking-[2px]">Condiciones de Compra y Envío</h3>
                                </div>
                                <div className="space-y-4 text-[13px] leading-relaxed text-gray-300 font-light">
                                    <p>Para garantizar la mejor gestión de tu pedido, operamos bajo los siguientes términos:</p>

                                    <div>
                                        <p className="font-black text-blue-400 text-[10px] uppercase tracking-wider mb-1">Tiempo de Entrega</p>
                                        <p>Al ser un producto importado, el tiempo estimado de espera es de <span className="text-white font-bold">25 a 30 días</span>.</p>
                                    </div>

                                    <div>
                                        <p className="font-black text-blue-400 text-[10px] uppercase tracking-wider mb-1">Reserva</p>
                                        <p>Se requiere el pago de una <span className="text-white font-bold">seña del 50%</span> del valor total para procesar el pedido y asegurar el cupo de importación.</p>
                                    </div>

                                    <div>
                                        <p className="font-black text-blue-400 text-[10px] uppercase tracking-wider mb-1">Políticas de Pedido</p>
                                        <p>Una vez abonada la seña, el pedido se considera definitivo. Debido a los costos logísticos y de gestión, no se realizan devoluciones de dinero ni del producto en caso de cancelaciones una vez efectuado el pago.</p>
                                    </div>

                                    <div className="bg-black/40 p-3 rounded border border-white/5 italic text-[11px] text-gray-400">
                                        Nota: Por favor, verifique todos los detalles (talle, color o modelo) antes de confirmar su seña.
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-auto space-y-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={isTotallyOutOfStock}
                                className={`w-full py-5 font-bold tracking-[0.15em] uppercase rounded-sm transition-all flex items-center justify-center gap-3 text-lg ${isTotallyOutOfStock ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : product.isImported ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'bg-primary hover:bg-[#cda434] text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] lg:hover:scale-[1.01]'}`}
                            >
                                {isTotallyOutOfStock ? 'AGOTADO' : (
                                    <>
                                        <ShoppingBag size={24} className={product.isImported ? "text-white" : "text-black"} />
                                        {product.isImported ? 'RESERVAR BAJO PEDIDO' : 'AÑADIR AL CARRITO'}
                                    </>
                                )}
                            </button>
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
                            {socialConfig.shippingText && (
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    {socialConfig.shippingText}
                                </div>
                            )}
                            {socialConfig.extraShippingInfo && (
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    {socialConfig.extraShippingInfo}
                                </div>
                            )}
                            {/* Dynamic Info Items */}
                            {socialConfig.productInfoItems?.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm text-gray-400">
                                    <span className="material-symbols-outlined text-green-500">{item.icon || 'check_circle'}</span>
                                    {item.text}
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductDetail;
