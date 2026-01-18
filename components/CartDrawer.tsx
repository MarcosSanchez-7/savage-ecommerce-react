
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { X, Plus, Minus, Trash2, MapPin, Truck, ArrowLeft } from 'lucide-react';
import LocationPicker from './LocationPicker';
import { isPointInPolygon } from '../types';

const CartDrawer: React.FC = () => {
    const navigate = useNavigate();
    const {
        cart,
        isCartOpen,
        toggleCart,
        updateQuantity,
        updateCartItemSize, // Consume new function
        removeFromCart,
        cartTotal,
        createOrder,
        socialConfig,
        deliveryZones
    } = useShop();

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

    // Recalculate shipping when location changes
    React.useEffect(() => {
        if (!selectedLocation || deliveryZones.length === 0) {
            setShippingCost(0);
            return;
        }

        // Find which zone the user is in
        const zone = deliveryZones.find(z => isPointInPolygon(selectedLocation, z.points));
        if (zone) {
            setShippingCost(zone.price);
        } else {
            // Default logic if outside zones (maybe standard price or 0/contact needed)
            // For now let's set 0 (A convenir)
            setShippingCost(0);
        }
    }, [selectedLocation, deliveryZones]);

    const finalTotal = cartTotal + shippingCost;

    if (!isCartOpen) return null;

    const handleCheckout = () => {
        const orderId = crypto.randomUUID();
        const displayId = Math.floor(1000 + Math.random() * 9000); // Simple ID for display

        const newOrder: any = { // Temporary any to bridge types while refactoring
            id: orderId,
            display_id: displayId,
            product_ids: cart.map(item => item.id), // Storing Product IDs
            customerInfo: {
                location: selectedLocation || undefined
            },
            items: cart, // Storing full cart items for local UI
            total_amount: finalTotal,
            delivery_cost: shippingCost,
            status: 'Pendiente',
            created_at: new Date().toLocaleDateString()
        };

        createOrder(newOrder);

        // WhatsApp Checkout Logic
        const phoneNumber = socialConfig.whatsapp || "595983840235";
        const domain = window.location.hostname.includes('localhost') ? window.location.origin : 'https://www.savageeepy.com';

        // Helper for formatting currency
        const formatPrice = (price: number) => price.toLocaleString('es-PY') + ' Gs';

        // Helper to shorten image URL
        const getShortImgLink = (fullUrl: string) => {
            try {
                const fileName = fullUrl.split('/').pop(); // Extracts 'file.jpg' from '.../product-images/file.jpg'
                if (!fileName) return fullUrl;
                return `${domain}/view-img/${fileName}`;
            } catch (e) {
                return fullUrl;
            }
        };

        const message = `👋 Hola! Me gustaría confirmar la disponibilidad de talles para el siguiente pedido:\n\n` +
            `*PEDIDO #${displayId}*\n` +
            cart.map(item => {
                // Generate Short Link
                const imgLink = item.images && item.images.length > 0
                    ? `\n🖼️ Ver foto: ${getShortImgLink(item.images[0])}`
                    : '';
                return `▪️ *${item.name}*\n   Cant: ${item.quantity} | Talle Seleccionado: ${item.selectedSize}${imgLink}`;
            }).join('\n\n') +
            `\n\n--------------------------------\n` +
            `💵 *PRODUCTOS:* ${formatPrice(cartTotal)}\n` +
            `🚚 *ENVÍO:* ${shippingCost > 0 ? formatPrice(shippingCost) : 'A convenir'}\n` +
            `--------------------------------\n` +
            `*TOTAL FINAL:* ${formatPrice(finalTotal)}\n` +
            `\n📍 *Ubicación:* ${selectedLocation ? `https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}` : 'A coordinar'}\n` +
            `\n🔗 *Ver Resumen Visual:* ${domain}/order-summary/${orderId}`;

        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[9999] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm touch-none"
                onClick={toggleCart}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-[#0a0a0a] border-l border-gray-800 h-[100dvh] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 isolate overscroll-contain">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0a0a0a] flex-none z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={toggleCart} className="md:hidden text-gray-400 hover:text-white">
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-lg font-bold tracking-wider">CARRITO ({cart.length})</h2>
                    </div>
                    <button onClick={toggleCart} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-500 mt-20">
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
                            <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
                                <img
                                    src={item.images ? item.images[0] : 'https://via.placeholder.com/150'}
                                    alt={item.name}
                                    className="w-14 h-14 object-cover rounded-md"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-xs line-clamp-2 md:line-clamp-1 pr-2">{item.name}</h3>
                                        <button
                                            onClick={() => removeFromCart(item.id, item.selectedSize)}
                                            className="text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="text-accent-gray text-[10px] uppercase">{item.category}</p>

                                        {/* Size Selector Compact */}
                                        <div className="relative">
                                            {item.sizes && item.sizes.length > 0 && (
                                                <select
                                                    value={item.selectedSize}
                                                    onChange={(e) => updateCartItemSize(item.id, item.selectedSize, e.target.value)}
                                                    className="bg-[#111] border border-gray-700 text-white text-[10px] rounded px-1.5 py-0.5 outline-none focus:border-white appearance-none cursor-pointer hover:bg-gray-900 transition-colors text-center w-full min-w-[30px]"
                                                    style={{ backgroundImage: 'none', textAlignLast: 'center' }}
                                                >
                                                    {item.sizes.map(s => (
                                                        <option key={s} value={s} className="bg-white text-black">{s}</option>
                                                    ))}
                                                </select>
                                            )}
                                            {(!item.sizes || item.sizes.length === 0) && (
                                                <span className="text-[10px] text-gray-400">Único</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="font-mono font-bold text-sm">Gs. {item.price.toLocaleString()}</span>
                                        <div className="flex items-center gap-2 bg-black rounded px-1.5 py-0.5 border border-gray-800">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.selectedSize, -1)}
                                                className="hover:text-primary transition-colors disabled:opacity-50"
                                            >
                                                <Minus size={10} />
                                            </button>
                                            <span className="text-xs w-3 text-center font-bold">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.selectedSize, 1)}
                                                className="hover:text-primary transition-colors"
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
                    <div className="p-4 border-t border-gray-800 bg-[#0a0a0a] flex-none z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-400 text-xs">Subtotal</span>
                            <span className="text-sm font-bold font-mono">Gs. {cartTotal.toLocaleString()}</span>
                        </div>
                        {selectedLocation && (
                            <div className="flex justify-between items-center mb-4 animate-in fade-in">
                                <span className="text-gray-400 flex items-center gap-1 text-xs"><Truck size={12} /> Envío</span>
                                {shippingCost > 0 ? (
                                    <span className="text-white font-bold font-mono text-sm">Gs. {shippingCost.toLocaleString()}</span>
                                ) : (
                                    <span className="text-yellow-500 font-bold text-[10px] uppercase">A convenir</span>
                                )}
                            </div>
                        )}
                        <div className="flex justify-between items-center mb-4 pt-3 border-t border-gray-800">
                            <span className="text-gray-200 font-bold uppercase text-sm">Total</span>
                            <span className="text-lg text-primary font-black font-mono">Gs. {finalTotal.toLocaleString()}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-primary hover:bg-red-700 text-black font-black py-3 rounded-sm tracking-widest transition-all uppercase flex items-center justify-center gap-2 text-sm"
                        >
                            CONFIRMAR PEDIDO
                        </button>


                        <div className="mt-4">
                            {!selectedLocation ? (
                                <button
                                    onClick={() => setShowMap(true)}
                                    className="w-full border border-gray-700 hover:border-white text-gray-400 hover:text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-bold uppercase"
                                >
                                    <MapPin size={16} /> Marcar Ubicación de Envío
                                </button>
                            ) : (
                                <div className="bg-white/5 border border-green-500/30 rounded-lg p-3 flex justify-between items-center group">
                                    <div className="flex items-center gap-2 text-green-500">
                                        <MapPin size={16} />
                                        <span className="text-xs font-bold uppercase">Ubicación Marcada</span>
                                    </div>
                                    <button onClick={() => setShowMap(true)} className="text-xs text-gray-500 hover:text-white underline">
                                        Cambiar
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => { toggleCart(); navigate('/'); }}
                            className="w-full mt-3 bg-transparent border border-gray-800 hover:border-gray-500 text-gray-400 hover:text-white py-3 rounded-sm tracking-widest transition-all uppercase flex items-center justify-center gap-2 text-xs font-bold"
                        >
                            SEGUIR COMPRANDO
                        </button>

                        <p className="text-center text-xs text-gray-500 mt-4">
                            El pedido se enviará a través de WhatsApp para confirmar detalles.
                        </p>
                    </div>
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
