
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { X, Plus, Minus, Trash2, MapPin, Truck, ArrowLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import LocationPicker from './LocationPicker';
import { isPointInPolygon } from '../types';
import { useTheme } from '../context/ThemeContext';

const CartDrawer: React.FC = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const {
        cart,
        isCartOpen,
        toggleCart,
        updateQuantity,
        updateCartItemSize,
        removeFromCart,
        cartTotal,
        createOrder,
        socialConfig,
        deliveryZones
    } = useShop();

    // Step Management
    const [step, setStep] = React.useState<1 | 2>(1);

    // Customer Info
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');

    // Location & Shipping
    const [showMap, setShowMap] = React.useState(false);
    const [selectedLocation, setSelectedLocation] = React.useState<{ lat: number, lng: number } | null>(null);
    const [shippingCost, setShippingCost] = React.useState(0);

    // Lock Body Scroll when Cart is Open
    React.useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isCartOpen]);

    // Reset to step 1 when cart opens
    React.useEffect(() => {
        if (isCartOpen) {
            setStep(1);
        }
    }, [isCartOpen]);

    // Recalculate shipping when location changes
    React.useEffect(() => {
        if (!selectedLocation || deliveryZones.length === 0) {
            setShippingCost(0);
            return;
        }

        const zone = deliveryZones.find(z => isPointInPolygon(selectedLocation, z.points));
        if (zone) {
            setShippingCost(zone.price);
        } else {
            setShippingCost(0);
        }
    }, [selectedLocation, deliveryZones]);

    const finalTotal = cartTotal + shippingCost;

    const handleNextStep = () => {
        if (cart.length === 0) {
            toast.error("Tu carrito está vacío");
            return;
        }
        setStep(2);
    };

    const handleBackToCart = () => {
        setStep(1);
    };

    const isCheckoutDisabled = !firstName.trim() || !lastName.trim() || !selectedLocation;

    const handleCheckout = () => {
        if (isCheckoutDisabled) {
            if (!firstName.trim() || !lastName.trim()) {
                toast.error("Por favor, ingresa tu nombre y apellido");
                return;
            }
            if (!selectedLocation) {
                toast.error("Por favor, marca tu ubicación de envío en el mapa");
                setShowMap(true);
                return;
            }
        }

        const orderId = crypto.randomUUID();
        const displayId = Math.floor(1000 + Math.random() * 9000);

        const newOrder: any = {
            id: orderId,
            display_id: displayId,
            product_ids: cart.map(item => item.id),
            customerInfo: {
                location: selectedLocation || undefined,
                name: `${firstName} ${lastName}`,
                needs_confirmation: true
            },
            items: cart,
            total_amount: finalTotal,
            delivery_cost: shippingCost,
            status: 'Pendiente',
            created_at: new Date().toISOString()
        };

        createOrder(newOrder);

        // WhatsApp Checkout Logic
        const shopNumber = socialConfig.whatsapp || "595983840235";
        const formatPrice = (price: number) => price.toLocaleString('es-PY') + ' Gs';
        const baseUrl = "https://www.savageeepy.com";

        const message = `👋 *¡Hola! Soy ${firstName} ${lastName}.*\nMe gustaría confirmar mi pedido:\n\n` +
            `🧾 *RECIBO #${displayId}*\n` +
            `🗓️ Fecha: ${new Date().toLocaleDateString()}\n` +
            `----------------------------------\n\n` +
            cart.map(item => {
                const productUrl = `${baseUrl}/product/${item.slug || item.id}`;
                return `▪️ *${item.name.toUpperCase()}*\n` +
                    `   Cant: ${item.quantity} | Talle: ${item.selectedSize}\n` +
                    `   🔗 ${productUrl}`;
            }).join('\n\n') +
            `\n\n----------------------------------\n` +
            `💰 *SUBTOTAL:* ${formatPrice(cartTotal)}\n` +
            `🚚 *ENVÍO:* ${shippingCost > 0 ? formatPrice(shippingCost) : 'A convenir'}\n` +
            `⭐️ *TOTAL FINAL:* ${formatPrice(finalTotal)}\n` +
            `----------------------------------\n` +
            `📍 *UBICACIÓN:* ${selectedLocation ? `https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}` : 'A coordinar'}`;

        console.log("--------------- WHATSAPP MESSAGE DEBUG ---------------");
        console.log(message);
        console.log("------------------------------------------------------");

        // GA4 Purchase Event
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'purchase', {
                transaction_id: displayId.toString(),
                value: finalTotal,
                currency: 'PYG',
                shipping: shippingCost,
                items: cart.map(item => ({
                    item_id: item.id,
                    item_name: item.name,
                    item_category: item.category,
                    item_variant: item.selectedSize,
                    price: item.price,
                    quantity: item.quantity
                }))
            });
        }

        const url = `https://wa.me/${shopNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm touch-none"
                onClick={toggleCart}
            />

            {/* Drawer */}
            <div className={`relative w-full max-w-md border-l h-[100dvh] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 isolate overscroll-contain transition-colors duration-300 ${theme === 'light' ? 'bg-surface border-border' : 'bg-[#0a0a0a] border-gray-800'}`}>
                {/* Header */}
                <div className={`p-4 border-b flex justify-between items-center flex-none z-10 transition-colors duration-300 ${theme === 'light' ? 'bg-surface border-border text-text' : 'bg-[#0a0a0a] border-gray-800 text-white'}`}>
                    <div className="flex items-center gap-3">
                        {step === 2 ? (
                            <button onClick={handleBackToCart} className="text-text-muted hover:text-text transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                        ) : (
                            <button onClick={toggleCart} className="md:hidden text-text-muted hover:text-text">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <h2 className="text-lg font-bold tracking-wider">
                            {step === 1 ? `CARRITO (${cart.length})` : 'DATOS DE ENVÍO'}
                        </h2>
                    </div>
                    <button onClick={toggleCart} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-text">
                        <X size={18} />
                    </button>
                </div>

                {/* STEP 1: Cart Review */}
                {step === 1 && (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 animate-in fade-in duration-300">
                            {cart.length === 0 ? (
                                <div className="text-center text-text-muted mt-20">
                                    <p>Tu carrito está vacío.</p>
                                    <button
                                        onClick={() => {
                                            toggleCart();
                                            navigate('/');
                                        }}
                                        className="mt-4 text-primary hover:underline text-sm font-bold"
                                    >
                                        IR A COMPRAR
                                    </button>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={`${item.id}-${item.selectedSize}`} className={`flex gap-3 p-2 rounded-lg border transition-colors ${theme === 'light' ? 'bg-background border-border shadow-sm' : 'bg-white/5 border-white/5'}`}>
                                        <img
                                            src={item.images ? item.images[0] : 'https://via.placeholder.com/150'}
                                            alt={item.name}
                                            className="w-14 h-14 object-cover rounded-md"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-xs line-clamp-2 md:line-clamp-1 pr-2 text-text">{item.name}</h3>
                                                <button
                                                    onClick={() => removeFromCart(item.id, item.selectedSize)}
                                                    className="text-text-muted hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <p className="text-text-muted text-[10px] uppercase">{item.category}</p>

                                                {/* Size Selector */}
                                                <div className="relative">
                                                    {item.sizes && item.sizes.length > 0 && (
                                                        <select
                                                            value={item.selectedSize}
                                                            onChange={(e) => updateCartItemSize(item.id, item.selectedSize, e.target.value)}
                                                            className={`border text-[10px] rounded px-1.5 py-0.5 outline-none focus:border-primary appearance-none cursor-pointer transition-colors text-center w-full min-w-[30px] ${theme === 'light' ? 'bg-surface text-text border-border hover:bg-gray-50' : 'bg-[#111] border-gray-700 text-white hover:bg-gray-900'}`}
                                                            style={{ backgroundImage: 'none', textAlignLast: 'center' }}
                                                        >
                                                            {item.sizes.map(s => (
                                                                <option key={s} value={s} className="bg-background text-text">{s}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                    {(!item.sizes || item.sizes.length === 0) && (
                                                        <span className="text-[10px] text-gray-400">Único</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="font-mono font-bold text-sm text-primary">Gs. {item.price.toLocaleString()}</span>
                                                <div className={`flex items-center gap-2 rounded px-1.5 py-0.5 border ${theme === 'light' ? 'bg-background border-border' : 'bg-black border-gray-800'}`}>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.selectedSize, -1)}
                                                        className="hover:text-primary transition-colors disabled:opacity-50 text-text"
                                                    >
                                                        <Minus size={10} />
                                                    </button>
                                                    <span className="text-xs w-3 text-center font-bold text-text">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.selectedSize, 1)}
                                                        className="hover:text-primary transition-colors text-text"
                                                    >
                                                        <Plus size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className={`p-4 border-t flex-none z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] transition-colors duration-300 ${theme === 'light' ? 'bg-surface border-border' : 'bg-[#0a0a0a] border-gray-800'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-text-muted text-xs">Subtotal</span>
                                    <span className="text-sm font-bold font-mono text-text">Gs. {cartTotal.toLocaleString()}</span>
                                </div>

                                <button
                                    onClick={handleNextStep}
                                    className="w-full bg-primary hover:bg-primary/90 text-black font-black py-3 rounded-sm tracking-widest transition-all uppercase flex items-center justify-center gap-2 text-sm"
                                >
                                    SIGUIENTE
                                    <ChevronRight size={18} />
                                </button>

                                <button
                                    onClick={() => { toggleCart(); navigate('/'); }}
                                    className={`w-full mt-3 bg-transparent border hover:border-text-muted text-text-muted hover:text-text py-3 rounded-sm tracking-widest transition-all uppercase flex items-center justify-center gap-2 text-xs font-bold ${theme === 'light' ? 'border-border' : 'border-gray-800'}`}
                                >
                                    SEGUIR COMPRANDO
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* STEP 2: Shipping & Confirmation */}
                {step === 2 && (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 animate-in fade-in duration-300">
                            {/* Customer Info Form */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-text mb-4">Datos del Cliente</h3>

                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 block">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Tu nombre"
                                        className={`w-full px-4 py-3 rounded-sm border text-sm font-medium outline-none focus:border-primary transition-colors ${theme === 'light' ? 'bg-background border-border text-text placeholder-text-muted' : 'bg-black border-gray-700 text-white placeholder-gray-500'}`}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 block">
                                        Apellido *
                                    </label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Tu apellido"
                                        className={`w-full px-4 py-3 rounded-sm border text-sm font-medium outline-none focus:border-primary transition-colors ${theme === 'light' ? 'bg-background border-border text-text placeholder-text-muted' : 'bg-black border-gray-700 text-white placeholder-gray-500'}`}
                                    />
                                </div>
                            </div>

                            {/* Location Picker */}
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-text mb-4">Ubicación de Envío</h3>

                                {!selectedLocation ? (
                                    <button
                                        onClick={() => setShowMap(true)}
                                        className={`w-full border-2 border-primary border-dashed py-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-all hover:bg-primary/5 ${theme === 'light' ? 'bg-primary/5 text-primary' : 'bg-white/5 text-primary'}`}
                                    >
                                        <MapPin size={24} />
                                        <div className="text-center">
                                            <p className="text-xs font-black uppercase tracking-widest">Marcar en el Mapa</p>
                                            <p className="text-[10px] font-bold opacity-80">Requerido para calcular envío</p>
                                        </div>
                                    </button>
                                ) : (
                                    <div className={`border border-green-500/30 rounded-lg p-3 flex justify-between items-center group ${theme === 'light' ? 'bg-green-50' : 'bg-white/5'}`}>
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                                            <MapPin size={16} />
                                            <span className="text-xs font-bold uppercase">Ubicación Confirmada</span>
                                        </div>
                                        <button onClick={() => setShowMap(true)} className="text-xs text-text-muted hover:text-text underline">
                                            Cambiar
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Order Summary */}
                            <div className={`rounded-lg p-4 space-y-3 ${theme === 'light' ? 'bg-background border border-border' : 'bg-white/5 border border-white/10'}`}>
                                <h3 className="text-sm font-black uppercase tracking-widest text-text">Resumen del Pedido</h3>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-text-muted">Productos ({cart.length})</span>
                                    <span className="font-mono font-bold text-text">Gs. {cartTotal.toLocaleString()}</span>
                                </div>

                                {selectedLocation && (
                                    <div className="flex justify-between items-center text-xs animate-in fade-in">
                                        <span className="text-text-muted flex items-center gap-1">
                                            <Truck size={12} /> Envío
                                        </span>
                                        {shippingCost > 0 ? (
                                            <span className="font-mono font-bold text-text">Gs. {shippingCost.toLocaleString()}</span>
                                        ) : (
                                            <span className="text-yellow-500 font-bold text-[10px] uppercase">A convenir</span>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-3 border-t border-border">
                                    <span className="text-text font-bold uppercase text-sm">Total</span>
                                    <span className="text-lg text-primary font-black font-mono">Gs. {finalTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 Footer */}
                        <div className={`p-4 border-t flex-none z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] transition-colors duration-300 ${theme === 'light' ? 'bg-surface border-border' : 'bg-[#0a0a0a] border-gray-800'}`}>
                            <button
                                onClick={handleCheckout}
                                disabled={isCheckoutDisabled}
                                className={`w-full py-3 rounded-sm tracking-widest transition-all uppercase flex items-center justify-center gap-2 text-sm font-black ${isCheckoutDisabled
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-primary hover:bg-primary/90 text-black'
                                    }`}
                            >
                                CONFIRMAR PEDIDO
                            </button>

                            <p className="text-center text-xs text-text-muted mt-4">
                                El pedido se enviará a través de WhatsApp para confirmar detalles.
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Location Picker Modal */}
            {showMap && (
                <LocationPicker
                    onClose={() => setShowMap(false)}
                    initialLocation={selectedLocation || undefined}
                    onLocationSelect={(lat, lng) => {
                        setSelectedLocation({ lat, lng });
                    }}
                />
            )}
        </div>
    );
};

export default CartDrawer;
