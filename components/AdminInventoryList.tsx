import React, { useState, memo } from 'react';
import {
    ChevronDown,
    Folder,
    Edit,
    Trash2,
    Layers,
    Search,
    Eye,
    EyeOff,
    Calendar
} from 'lucide-react';
import { Category, Product } from '../types';

interface AdminInventoryListProps {
    categories: Category[];
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
    onToggleActive: (product: Product) => void;
    seasonProductIds: string[];
    onToggleSeason: (product: Product) => void;
}

const AdminInventoryList: React.FC<AdminInventoryListProps> = ({
    categories,
    products,
    onEdit,
    onDelete,
    onToggleActive,
    seasonProductIds,
    onToggleSeason
}) => {
    // Local state for folder toggles (Performance Optimization)
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    const [openSubcategories, setOpenSubcategories] = useState<Record<string, boolean>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'FEATURED' | 'NEW' | 'OFFER' | 'IMPORTED' | 'SEASON'>('ALL');

    const toggleCategory = (catId: string) => {
        setOpenCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
    };

    const toggleSubcategory = (catId: string, subName: string) => {
        const key = `${catId}-${subName}`;
        setOpenSubcategories(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Filter products globally based on Search and Filter Buttons
    const getFilteredProducts = (prods: Product[]) => {
        let filtered = prods;

        // 1. Status Filter
        if (filterType === 'FEATURED') filtered = filtered.filter(p => p.isFeatured);
        if (filterType === 'NEW') filtered = filtered.filter(p => p.isNew);
        if (filterType === 'OFFER') filtered = filtered.filter(p => p.isOffer);
        if (filterType === 'IMPORTED') filtered = filtered.filter(p => p.isImported);
        if (filterType === 'SEASON') filtered = filtered.filter(p => seasonProductIds.includes(p.id));

        // 2. Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(term));
        }

        return filtered;
    };

    return (
        <div className="space-y-6">
            <h4 className="text-lg font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                Inventario
            </h4>
            <div className="flex flex-col gap-4 w-full md:w-auto">
                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterType('ALL')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${filterType === 'ALL' ? 'bg-white text-black border-white' : 'bg-black text-gray-500 border-gray-800 hover:border-gray-600'}`}
                    >
                        Todo
                    </button>
                    <button
                        onClick={() => setFilterType('FEATURED')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${filterType === 'FEATURED' ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'bg-black text-gray-500 border-gray-800 hover:border-yellow-400/50 hover:text-yellow-400'}`}
                    >
                        ★ Destacados
                    </button>
                    <button
                        onClick={() => setFilterType('OFFER')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${filterType === 'OFFER' ? 'bg-red-600 text-white border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-black text-gray-500 border-gray-800 hover:border-red-600/50 hover:text-red-500'}`}
                    >
                        % Ofertas
                    </button>
                    <button
                        onClick={() => setFilterType('NEW')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${filterType === 'NEW' ? 'bg-purple-600 text-white border-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-black text-gray-500 border-gray-800 hover:border-purple-600/50 hover:text-purple-500'}`}
                    >
                        ✦ Nuevos
                    </button>
                    <button
                        onClick={() => setFilterType('IMPORTED')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${filterType === 'IMPORTED' ? 'bg-blue-600 text-white border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-black text-gray-500 border-gray-800 hover:border-blue-600/50 hover:text-blue-500'}`}
                    >
                        Globe Importados
                    </button>
                    <button
                        onClick={() => setFilterType('SEASON')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${filterType === 'SEASON' ? 'bg-pink-600 text-white border-pink-600 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'bg-black text-gray-500 border-gray-800 hover:border-pink-600/50 hover:text-pink-500'}`}
                    >
                        📅 Season
                    </button>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar producto por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0c0c0c] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-primary focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {categories.map(category => {
                // First filter by category
                let categoryProducts = products.filter(p => p.category === category.id);

                // Then apply search filter
                categoryProducts = getFilteredProducts(categoryProducts);

                // If no products match in this category, hide it
                if (categoryProducts.length === 0) return null;

                // Auto-open ONLY if searching by text (to find specific item).
                // For filters (Offers, Featured...), items start closed to keep UI clean.
                const isTextSearching = searchTerm.length > 0;
                const isOpen = isTextSearching ? true : (openCategories[category.id] ?? false);

                const subcategories = Array.from(new Set(categoryProducts.map(p => p.subcategory || 'General'))) as string[];

                return (
                    <div key={category.id} className="bg-[#0c0c0c] border border-gray-800/50 rounded-2xl overflow-hidden shadow-xl transition-all">
                        {/* Category Folder Header */}
                        <button
                            onClick={() => toggleCategory(category.id)}
                            className="w-full p-5 flex items-center justify-between bg-black/40 hover:bg-black/60 transition-colors border-b border-gray-800/30 group"
                        >
                            <div className="flex items-center gap-4">
                                {/* Enhanced Touch Area for Toggle */}
                                <div
                                    className={`transition-transform duration-300 p-2 -m-2 rounded-full hover:bg-white/10 active:scale-90 cursor-pointer ${isOpen ? 'rotate-180' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCategory(category.id);
                                    }}
                                >
                                    <ChevronDown size={20} className="text-gray-500 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-base font-black text-white italic uppercase tracking-tighter">{category.name}</span>
                                <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-gray-400">{categoryProducts.length} items</span>
                            </div>
                        </button>

                        {/* Subcategories & Products Grid */}
                        {isOpen && (
                            <div className="p-6 space-y-10 animate-in slide-in-from-top-2 duration-300">
                                {subcategories.map(sub => {
                                    const subProducts = categoryProducts.filter(p => (p.subcategory || 'General') === sub);
                                    const subKey = `${category.id}-${sub}`;

                                    // Force open subcategory if searching
                                    const isSubOpen = isTextSearching ? true : (openSubcategories[subKey] ?? false);

                                    return (
                                        <div key={sub} className="space-y-4">
                                            {/* Subcategory Header */}
                                            <button
                                                onClick={() => toggleSubcategory(category.id, sub)}
                                                className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-all select-none group/sub ${isSubOpen ? 'bg-white/5 border-gray-800' : 'bg-transparent border-gray-900/50 hover:bg-white/2'}`}
                                            >
                                                {/* Enhanced Touch Area for Toggle */}
                                                <div
                                                    className={`transition-transform duration-300 p-2 -m-2 rounded-full hover:bg-white/10 active:scale-90 cursor-pointer ${isSubOpen ? 'rotate-180' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSubcategory(category.id, sub);
                                                    }}
                                                >
                                                    <ChevronDown size={14} className={isSubOpen ? 'text-primary' : 'text-gray-600 group-hover/sub:text-gray-400'} />
                                                </div>
                                                <Folder size={14} className={isSubOpen ? 'text-primary' : 'text-gray-700'} />
                                                <span className={`text-xs font-black italic uppercase tracking-widest transition-colors ${isSubOpen ? 'text-white' : 'text-gray-500'}`}>
                                                    {sub}
                                                </span>
                                                <span className="bg-black/50 border border-white/5 px-2 py-0.5 rounded text-[8px] font-black text-gray-400">
                                                    {subProducts.length} ITEMS
                                                </span>
                                            </button>

                                            {isSubOpen && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 animate-in slide-in-from-top-1 duration-200">
                                                    {subProducts.map(product => (
                                                        <div key={product.id} className={`bg-black/60 border border-gray-800 rounded-2xl p-4 flex flex-col gap-4 group hover:border-gray-700 transition-all hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden ${(product.isActive === false) ? 'opacity-50 grayscale' : ''}`}>
                                                            <div className="flex gap-4">
                                                                <div className="w-24 aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden border border-gray-800 flex-shrink-0">
                                                                    <img src={product.images?.[0]} alt="" className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="flex-1 min-w-0 flex flex-col">
                                                                    <div className="pr-16">
                                                                        <h5 className="text-sm font-black text-white italic uppercase tracking-tighter truncate">{product.name}</h5>
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase rounded">ADMIN</span>
                                                                            <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black uppercase rounded">ACTIVE</span>
                                                                            {product.isNew && <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-500 text-[8px] font-black uppercase rounded">NEW</span>}
                                                                            {product.isOffer && <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black uppercase rounded">OFFER</span>}
                                                                            {seasonProductIds.includes(product.id) && <span className="px-1.5 py-0.5 bg-pink-500/10 text-pink-500 text-[8px] font-black uppercase rounded">SEASON</span>}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex-1 flex items-center justify-center py-2">
                                                                        <span className="text-sm font-black text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">Gs. {product.price.toLocaleString()}</span>
                                                                    </div>

                                                                    <p className="text-[8px] text-gray-600 font-mono">ID: {product.id.toString().slice(0, 8).toUpperCase()}</p>
                                                                </div>
                                                            </div>

                                                            {/* Offer Tag Overlay */}
                                                            {product.isOffer && (
                                                                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                                                                    <div className="bg-red-600 text-white text-[8px] md:text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter rounded-sm flex items-center gap-1 shadow-lg border border-red-400/20 shadow-red-500/20">
                                                                        % OFERTA
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Tags for Imported Products */}
                                                            {product.isImported && (
                                                                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                                                                    <div className="bg-blue-600 text-white text-[8px] md:text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter rounded-sm flex items-center gap-1 shadow-lg border border-blue-400/20 shadow-blue-500/20">
                                                                        {/* Note: Icon used to be material-symbols, using lucid icon globe if needed or just text. Keeping structure. */}
                                                                        <span className="text-[10px] md:text-xs">🌐</span>
                                                                        IMPORTADO
                                                                    </div>
                                                                    <div className="bg-white/90 backdrop-blur-sm text-blue-600 text-[8px] md:text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter rounded-sm flex items-center gap-1 shadow-lg border border-blue-200">
                                                                        BAJO PEDIDO
                                                                    </div>
                                                                    <div className="bg-black/90 backdrop-blur-sm text-gray-300 text-[8px] md:text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter rounded-sm flex items-center gap-1 shadow-lg border border-gray-800">
                                                                        25-30 DÍAS
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Footer Stats: Featured & Stock */}
                                                            <div className="mt-auto pt-4 border-t border-gray-800/50 space-y-3 relative">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {product.isCategoryFeatured && (
                                                                        <span className="text-[10px] font-black text-white flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded border border-white/20">
                                                                            <Layers size={10} /> CAT.
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="relative mt-4">
                                                                    {product.isFeatured && (
                                                                        <div className="absolute -top-7 left-0 w-full flex justify-center pointer-events-none">
                                                                            <span className="text-[9px] font-black text-black bg-yellow-400 px-2 py-0.5 rounded border border-yellow-500/50 flex items-center gap-1 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.4)] z-20">
                                                                                ★ DESTACADO HOME
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {product.inventory?.map(inv => (
                                                                            <div key={inv.size} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${inv.quantity > 0 ? 'bg-white/5 border-gray-800' : 'bg-red-500/5 border-red-500/20 opacity-50'}`}>
                                                                                <span className={`text-[9px] font-black ${inv.quantity > 0 ? 'text-gray-400' : 'text-red-400'}`}>{inv.size}</span>
                                                                                <span className={`text-[10px] font-black ${inv.quantity > 0 ? 'text-blue-400' : 'text-red-500'}`}>{inv.quantity}</span>
                                                                            </div>
                                                                        ))}
                                                                        {product.isImported && product.sizes && product.sizes.map(size => (
                                                                            <div key={size} className="flex items-center gap-1.5 px-2 py-1 rounded-lg border bg-blue-500/5 border-blue-500/20 opacity-70">
                                                                                <span className="text-[9px] font-black text-blue-400">{size}</span>
                                                                                <span className="text-[10px] font-black text-blue-500">0</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Actions - Moved to bottom and added confirmation */}
                                                            <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-gray-800/30 group-hover:bg-white/2 transition-colors rounded-b-xl -mx-4 -mb-4 px-4 pb-4">
                                                                <button
                                                                    onClick={() => {
                                                                        const action = product.isActive === false ? 'mostrar' : 'ocultar';
                                                                        if (window.confirm(`¿Deseas ${action} el artículo "${product.name}"?`)) {
                                                                            onToggleActive(product);
                                                                        }
                                                                    }}
                                                                    className={`p-2.5 rounded-xl text-white transition-all shadow-xl backdrop-blur-md ${product.isActive === false ? 'bg-gray-600 hover:bg-gray-500' : 'bg-green-600/90 hover:bg-green-500'}`}
                                                                    title={product.isActive === false ? 'Activar' : 'Desactivar'}
                                                                >
                                                                    {product.isActive === false ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const isSeason = seasonProductIds.includes(product.id);
                                                                        const action = isSeason ? 'quitar de' : 'añadir a';
                                                                        if (window.confirm(`¿Deseas ${action} la colección de temporada al producto "${product.name}"?`)) {
                                                                            onToggleSeason(product);
                                                                        }
                                                                    }}
                                                                    className={`p-2.5 rounded-xl text-white transition-all shadow-xl backdrop-blur-md ${seasonProductIds.includes(product.id) ? 'bg-pink-600/90 hover:bg-pink-500 shadow-pink-500/20' : 'bg-gray-700/50 hover:bg-gray-600 border border-white/10'}`}
                                                                    title="Temporada"
                                                                >
                                                                    <Calendar size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (window.confirm(`¿Deseas editar el producto "${product.name}"?`)) {
                                                                            onEdit(product);
                                                                        }
                                                                    }}
                                                                    className="p-2.5 bg-blue-600/90 text-white rounded-xl hover:bg-blue-500 transition-all shadow-xl backdrop-blur-md"
                                                                    title="Editar"
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (window.confirm(`¿Deseas eliminar de forma permanente el producto "${product.name}"?`)) {
                                                                            onDelete(product.id);
                                                                        }
                                                                    }}
                                                                    className="p-2.5 bg-red-600/90 text-white rounded-xl hover:bg-red-500 transition-all shadow-xl backdrop-blur-md"
                                                                    title="Eliminar"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })
            }
        </div >
    );
};

export default memo(AdminInventoryList);
