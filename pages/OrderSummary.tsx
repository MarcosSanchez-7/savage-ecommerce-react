import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Order } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Box, Truck, CheckCircle, Clock } from 'lucide-react';

const OrderSummary: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            try {
                // Try fetching by ID (UUID) or display_id (if we supported searching by it, but ID is safer for URL)
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (data) {
                    setOrder({
                        ...data,
                        items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
                        customerInfo: typeof data.customer_info === 'string' ? JSON.parse(data.customer_info) : data.customer_info
                    });
                }
            } catch (err) {
                console.error("Error fetching order:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-background-dark text-white flex flex-col items-center justify-center p-6">
                <h1 className="text-2xl font-bold mb-4">Pedido no encontrado</h1>
                <Link to="/" className="text-primary hover:underline">Volver al inicio</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark text-white selection:bg-primary selection:text-white">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-800 bg-black/50">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-black uppercase tracking-wider text-white">
                                    Pedido #{order.display_id}
                                </h1>
                                <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                                    <Clock size={14} /> Fecha: {new Date(order.created_at || Date.now()).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="px-4 py-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded font-bold uppercase text-sm tracking-wider">
                                {order.status}
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="p-6 space-y-8">
                        <h2 className="text-xl font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
                            <Box size={20} className="text-primary" /> Productos ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
                        </h2>

                        <div className="space-y-6">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row gap-6 p-4 bg-white/5 rounded-lg border border-white/5">
                                    {/* Large Image */}
                                    <div className="w-full sm:w-48 aspect-square flex-shrink-0 bg-black rounded-md overflow-hidden border border-gray-700">
                                        <img
                                            src={item.images?.[0] || 'https://via.placeholder.com/300'}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="bg-primary text-black px-2 py-1 rounded text-xs font-bold uppercase">
                                                Talle: {item.selectedSize || 'Único'}
                                            </span>
                                            <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-bold uppercase">
                                                Cant: {item.quantity}
                                            </span>
                                        </div>
                                        <p className="text-lg font-mono text-gray-300">
                                            Gs. {item.price.toLocaleString()} x {item.quantity}
                                        </p>
                                        <p className="text-xl font-bold text-primary mt-2">
                                            Total: Gs. {(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Costs & Info */}
                    <div className="p-6 bg-black/30 border-t border-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-bold uppercase text-gray-400 mb-4 flex items-center gap-2">
                                    <MapPin size={16} /> Ubicación de Entrega
                                </h3>
                                {order.customer_info?.location ? (
                                    <div className="bg-white/5 p-4 rounded border border-white/5">
                                        <a
                                            href={`https://www.google.com/maps?q=${order.customer_info.location.lat},${order.customer_info.location.lng}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-primary hover:underline flex items-center gap-2 font-bold"
                                        >
                                            <MapPin size={16} /> Ver en Google Maps
                                        </a>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Lat: {order.customer_info.location.lat}<br />
                                            Lng: {order.customer_info.location.lng}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">A coordinar</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-bold uppercase text-gray-400 mb-4">Resumen de Costos</h3>
                                <div className="flex justify-between text-gray-300">
                                    <span>Subtotal Productos</span>
                                    <span className="font-mono">Gs. {(Number(order.total_amount) - Number(order.delivery_cost || 0)).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span className="flex items-center gap-2"><Truck size={14} /> Envío</span>
                                    <span className="font-mono">Gs. {Number(order.delivery_cost || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-white text-xl font-bold pt-4 border-t border-gray-700">
                                    <span>TOTAL</span>
                                    <span className="text-primary font-mono">Gs. {Number(order.total_amount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrderSummary;
