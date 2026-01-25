
import React, { useState, useMemo } from 'react';
import {
    Plus,
    FolderPlus,
    Edit2,
    Trash2,
    ChevronRight,
    ChevronDown,
    Layers,
    Settings,
    Search,
    AlertCircle,
    Check,
    X,
    Filter
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Category, Attribute, AttributeValue } from '../types';

const MasterInventoryManager: React.FC = () => {
    const {
        categories, addCategory, updateCategory, deleteCategory,
        attributes, attributeValues,
        addAttribute, deleteAttribute,
        addAttributeValue, deleteAttributeValue, updateAttributeValue
    } = useShop();

    const [activeTab, setActiveTab] = useState<'categories' | 'attributes'>('categories');
    const [searchTerm, setSearchTerm] = useState('');

    // Category Tree States
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalParentId, setModalParentId] = useState<string | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Attribute States
    const [selectedAttrId, setSelectedAttrId] = useState<string | null>(null);
    const [isAddAttrModalOpen, setIsAddAttrModalOpen] = useState(false);
    const [newAttrName, setNewAttrName] = useState('');
    const [newValueName, setNewValueName] = useState('');

    // --- CATEGORY LOGIC ---
    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const rootCategories = useMemo(() =>
        categories.filter(c => !c.parent_id),
        [categories]);

    const getSubcategories = (parentId: string) =>
        categories.filter(c => c.parent_id === parentId);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;

        const newCat: Category = {
            id: Date.now().toString(), // Temp ID, ShopContext handles UUID replacement
            name: newCategoryName,
            parent_id: modalParentId,
            image: ''
        };

        // @ts-ignore - ShopContext might not have parent_id in types yet but we added it
        await addCategory(newCat);
        setNewCategoryName('');
        setIsAddModalOpen(false);
        setModalParentId(null);
    };

    const handleDeleteCategory = (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar esta categoría? Los productos asociados se moverán a Huérfanos.')) {
            deleteCategory(id);
        }
    };

    const renderCategoryRow = (category: Category, level: number = 0) => {
        const subcats = getSubcategories(category.id);
        const isExpanded = expandedIds.has(category.id);
        const hasSubcats = subcats.length > 0;

        return (
            <React.Fragment key={category.id}>
                <div
                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 mb-2 ${level === 0 ? 'bg-white/5 border-white/10' : 'bg-black/20 border-white/5 ml-8'
                        } hover:border-primary/40 hover:bg-primary/5`}
                >
                    <div className="flex items-center gap-3">
                        {hasSubcats ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(category.id);
                                }}
                                className="text-gray-500 hover:text-white transition-all p-2 -m-2 cursor-pointer active:scale-90 transform duration-75"
                            >
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                        ) : (
                            <div className="w-[18px]" />
                        )}
                        <span className={`font-black uppercase tracking-tighter italic ${level === 0 ? 'text-sm' : 'text-xs text-gray-300'}`}>
                            {category.name}
                        </span>
                        {hasSubcats && (
                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-500 font-bold">
                                {subcats.length} ramas
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => {
                                setModalParentId(category.id);
                                setIsAddModalOpen(true);
                            }}
                            className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-black rounded-lg transition-all"
                            title="Añadir Subcategoría"
                        >
                            <FolderPlus size={14} />
                        </button>
                        <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                            title="Eliminar"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
                {isExpanded && subcats.map(sub => renderCategoryRow(sub, level + 1))}
            </React.Fragment>
        );
    };

    // --- ATTRIBUTE LOGIC ---
    const handleAddAttribute = async () => {
        if (!newAttrName.trim()) return;
        // @ts-ignore
        await addAttribute({ name: newAttrName });
        setNewAttrName('');
        setIsAddAttrModalOpen(false);
    };

    const handleAddValue = async () => {
        if (!newValueName.trim() || !selectedAttrId) return;
        // @ts-ignore
        await addAttributeValue({ attribute_id: selectedAttrId, value: newValueName });
        setNewValueName('');
    };

    const handleDeleteValue = async (id: string) => {
        // @ts-ignore
        await deleteAttributeValue(id);
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* Header with Navigation */}
            <div className="bg-[#0c0c0c] border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                        <Layers className="text-primary" />
                        Inventario Maestro
                    </h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                        Control total de categorías y filtros dinámicos
                    </p>
                </div>

                <div className="flex bg-black border border-gray-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'categories' ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        Jerarquía
                    </button>
                    <button
                        onClick={() => setActiveTab('attributes')}
                        className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'attributes' ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        Filtros (Embudo)
                    </button>
                </div>
            </div>

            {/* Content Tabs */}
            {activeTab === 'categories' ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between bg-black/40 border border-gray-800 rounded-2xl p-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                            <input
                                type="text"
                                placeholder="BUSCAR CATEGORÍA..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-black border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setModalParentId(null);
                                setIsAddModalOpen(true);
                            }}
                            className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all"
                        >
                            <Plus size={16} /> Añadir Categoría Raíz
                        </button>
                    </div>

                    <div className="bg-[#0c0c0c] border border-gray-800 rounded-3xl p-8 shadow-2xl overflow-hidden min-h-[500px]">
                        {rootCategories.length > 0 ? (
                            rootCategories
                                .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(cat => renderCategoryRow(cat))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                                <AlertCircle size={48} className="mb-4 opacity-20" />
                                <p className="text-sm font-black uppercase tracking-widest">No hay categorías cargadas</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Attributes Tab: Master-Detail Layout */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[600px]">
                    {/* Left Panel: Attribute Types */}
                    <div className="md:col-span-4 bg-[#0c0c0c] border border-gray-800 rounded-3xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Atributos</h3>
                            <button
                                onClick={() => setIsAddAttrModalOpen(true)}
                                className="p-2 hover:bg-white/5 rounded-lg text-primary transition-all"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {attributes.map(attr => (
                                <button
                                    key={attr.id}
                                    onClick={() => setSelectedAttrId(attr.id)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${selectedAttrId === attr.id
                                        ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20'
                                        : 'bg-black/40 border-gray-800 text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    <span className="font-black italic uppercase tracking-tighter">{attr.name}</span>
                                    <ChevronRight size={16} className={selectedAttrId === attr.id ? 'text-black' : 'text-gray-700'} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel: Values */}
                    <div className="md:col-span-8 bg-[#0c0c0c] border border-gray-800 rounded-3xl overflow-hidden flex flex-col">
                        {!selectedAttrId ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                                <Filter size={48} className="mb-4 opacity-10" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Selecciona un atributo para editar sus valores</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-black/20">
                                    <div>
                                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
                                            Valores de {attributes.find(a => a.id === selectedAttrId)?.name}
                                        </h3>
                                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Añade o elimina opciones para el embudo</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            value={newValueName}
                                            onChange={e => setNewValueName(e.target.value)}
                                            placeholder="NUEVO VALOR..."
                                            className="bg-black border border-gray-800 rounded-lg px-4 py-2 text-[10px] font-bold uppercase outline-none focus:border-primary transition-all"
                                        />
                                        <button
                                            onClick={handleAddValue}
                                            className="bg-primary text-black p-2 rounded-lg hover:bg-white transition-all"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {attributeValues.filter(v => v.attribute_id === selectedAttrId).map(val => (
                                            <div key={val.id} className="group relative bg-black border border-gray-800 rounded-2xl p-4 flex items-center justify-between hover:border-primary/50 transition-all">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white truncate pr-6">{val.value}</span>
                                                <button
                                                    onClick={() => handleDeleteValue(val.id)}
                                                    className="absolute right-3 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* MODALS (Using basic fixed overlays for Shadcn feel) */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#0c0c0c] border border-gray-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-gray-800 bg-black/40">
                            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">
                                {modalParentId ? 'Añadir Rama' : 'Nueva Categoría Raíz'}
                            </h4>
                            {modalParentId && (
                                <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">
                                    Dentro de: {categories.find(c => c.id === modalParentId)?.name}
                                </p>
                            )}
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Nombre del Brazo</label>
                                <input
                                    autoFocus
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    placeholder="Ej: Remeras de Entrenamiento..."
                                    className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-primary outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddCategory}
                                    className="flex-1 bg-primary hover:bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                                >
                                    Crear Categoría
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isAddAttrModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#0c0c0c] border border-gray-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-gray-800 bg-black/40 text-center">
                            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Nuevo Tipo de Atributo</h4>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Nombre del Atributo (Ej: Temporada)</label>
                                <input
                                    autoFocus
                                    value={newAttrName}
                                    onChange={e => setNewAttrName(e.target.value)}
                                    placeholder="TIPO DE FILTRO..."
                                    className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-primary outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsAddAttrModalOpen(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddAttribute}
                                    className="flex-1 bg-primary hover:bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                                >
                                    Crear Atributo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasterInventoryManager;
