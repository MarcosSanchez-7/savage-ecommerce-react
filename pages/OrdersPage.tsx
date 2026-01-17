import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const OrdersPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white pt-24 px-6 md:px-12 pb-20">
            <SEO title="Mis Pedidos - Savage Store" description="Historial de tus compras." />

            <div className="max-w-5xl mx-auto">
                <header className="mb-12 border-b border-white/10 pb-8 flex flex-col gap-4">
                    <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors w-fit">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Volver al inicio
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2">Mis Pedidos</h1>
                        <p className="text-gray-500">Historial y estado de tus compras recientes.</p>
                    </div>
                </header>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-3xl text-gray-400">shopping_bag</span>
                    </div>
                    <h2 className="text-xl font-bold uppercase tracking-wider mb-2">Aún no tienes pedidos</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Cuando realices compras en Savage Store, aparecerán aquí con todos sus detalles de seguimiento.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-white text-black font-bold uppercase tracking-widest py-3 px-8 rounded-full hover:bg-primary transition-colors"
                    >
                        Empezar a comprar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
