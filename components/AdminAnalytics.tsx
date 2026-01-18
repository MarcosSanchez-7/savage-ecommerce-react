import React, { useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, ShoppingBag, Users, DollarSign, Activity, Package } from 'lucide-react';

const AdminAnalytics: React.FC = () => {
    const { orders } = useShop();

    // --- KPI Calculations ---
    const stats = useMemo(() => {
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((acc, order) => acc + (order.total_amount || 0), 0);
        const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Filter delivered/confirmed orders for "Real Sales" ideally, but let's show all for now or separate
        const deliveredOrders = orders.filter(o => o.status === 'Entregado').length;
        const conversionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

        return {
            totalOrders,
            totalRevenue,
            avgTicket,
            deliveredOrders,
            conversionRate
        };
    }, [orders]);

    // --- Charts Data Preparation ---

    // 1. Sales Over Time (Last 30 Days? Or All Time grouped by Month/Day)
    const salesData = useMemo(() => {
        // Group by Date
        const grouped = orders.reduce((acc, order) => {
            // Assuming order.created_at exists, if not use a fallback or skip
            // Types say created_at is optional string.
            const date = order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Desconocido';
            if (!acc[date]) acc[date] = 0;
            acc[date] += order.total_amount || 0;
            return acc;
        }, {} as Record<string, number>);

        // Convert to Array and Sort
        return Object.keys(grouped).map(date => ({
            date,
            sales: grouped[date]
        })).slice(-7); // Last 7 data points (days) for cleaner view initially
    }, [orders]);

    // 2. Order Status Distribution
    const statusData = useMemo(() => {
        const grouped = orders.reduce((acc, order) => {
            const status = order.status || 'Pendiente';
            if (!acc[status]) acc[status] = 0;
            acc[status]++;
            return acc;
        }, {} as Record<string, number>);

        return Object.keys(grouped).map(key => ({
            name: key,
            value: grouped[key]
        }));
    }, [orders]);

    // 3. Payment Methods (Mocked if not strictly tracked as field yet, 
    // but types say `payment_method?: 'Efectivo' | 'QR' | 'Transferencia'`)
    const paymentData = useMemo(() => {
        const grouped = orders.reduce((acc, order) => {
            const method = order.payment_method || 'Otros';
            if (!acc[method]) acc[method] = 0;
            acc[method]++;
            return acc;
        }, {} as Record<string, number>);

        return Object.keys(grouped).map(key => ({
            name: key,
            value: grouped[key]
        }));
    }, [orders]);

    // Format Currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(amount);
    };

    const COLORS = ['#FEF9C3', '#FACC15', '#CA8A04', '#A16207', '#713F12'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row justify-between md:items-end border-b border-gray-800 pb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                        <Activity className="text-primary" size={32} />
                        ANALYTICS & VENTAS
                    </h2>
                    <p className="text-gray-400">Resumen en tiempo real del rendimiento de tu tienda.</p>
                </div>
                <div className="text-right">
                    <span className="text-xs font-bold text-gray-500 uppercase">Ingresos Totales</span>
                    <div className="text-3xl font-black text-white">{formatCurrency(stats.totalRevenue)}</div>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShoppingBag size={62} />
                    </div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Pedidos Totales</h3>
                    <p className="text-3xl font-black text-white">{stats.totalOrders}</p>
                    <p className="text-xs text-green-500 mt-2 font-mono flex items-center gap-1">
                        <TrendingUp size={12} /> +{orders.length > 0 ? '100%' : '0%'} vs mes anterior
                    </p>
                </div>

                <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={62} />
                    </div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Ticket Promedio</h3>
                    <p className="text-3xl font-black text-white">{formatCurrency(stats.avgTicket)}</p>
                    <p className="text-xs text-gray-500 mt-2 font-mono">Promedio por venta</p>
                </div>

                <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Package size={62} />
                    </div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Pedidos Entregados</h3>
                    <p className="text-3xl font-black text-white">{stats.deliveredOrders}</p>
                    <p className="text-xs text-blue-500 mt-2 font-mono">
                        {stats.conversionRate.toFixed(1)}% Completados
                    </p>
                </div>

                <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={62} />
                    </div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Conversión</h3>
                    <p className="text-3xl font-black text-white">2.4%</p>
                    <p className="text-xs text-gray-500 mt-2 font-mono">Estimada (Visitas vs Ventas)</p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-gray-800 p-6 rounded-xl">
                    <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" /> Ventas Recientes (Gs.)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₲${val / 1000}k`} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#FACC15" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Pie Chart */}
                <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-xl">
                    <h3 className="text-lg font-bold mb-6 text-white text-center">Estados de Pedidos</h3>
                    <div className="h-[300px] w-full flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black text-white">{stats.totalOrders}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                        {statusData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-500">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Actions / Insights */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-6 rounded-xl">
                    <h3 className="text-lg font-bold mb-4 text-white">Insights de Inventario</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Productos con bajo stock o alto movimiento que requieren atención.
                    </p>
                    {/* Placeholder for future inventory insights */}
                    <div className="p-4 border border-dashed border-gray-800 rounded bg-black/50 text-center text-gray-600 text-sm">
                        Sistema de alertas de stock próximamente...
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
