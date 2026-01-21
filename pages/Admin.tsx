
import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    Trash2,
    Layout,
    ShoppingBag,
    Image as ImageIcon,
    Save,
    LogOut,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    Folder,
    FolderOpen,
    X,
    FileText,
    Settings,
    MessageSquare,
    Layers,
    Map,
    Edit,
    Type,
    Menu,
    ArrowUp,
    ArrowDown,
    Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminAnalytics from '../components/AdminAnalytics';
import { HeroSlide, BlogPost, Category, NavbarLink, BannerBento, FooterColumn } from '../types';
import DeliveryZoneMap from '../components/DeliveryZoneMap';
import { Loader2, UploadCloud } from 'lucide-react';
import { useImageOptimizer } from '../hooks/useImageOptimizer';
import { uploadProductImage as uploadImage } from '../services/uploadService';

// Helper to generate URL-friendly slugs
const generateSlug = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Separate accents
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start
        .replace(/-+$/, ''); // Trim - from end
};

const AdminDashboard: React.FC = () => {
    // --- AUTH PROTECTION ---
    const { session, loading: authLoading, signInWithEmail } = useAuth();
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setLoginError('');

        const { error } = await signInWithEmail(loginEmail, loginPassword);
        if (error) {
            console.error(error);
            setLoginError('Credenciales incorrectas.');
            setIsLoggingIn(false);
        }
        // If success, session updates automatically and renders dashboard
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#050505] border border-gray-800 p-8 rounded-2xl shadow-[0_0_50px_rgba(255,215,0,0.05)]">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black text-white italic tracking-tighter mb-2">SAVAGE <span className="text-primary">ADMIN</span></h1>
                        <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em]">Panel de Control Restringido</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email de Acceso</label>
                            <input
                                type="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-all placeholder:text-gray-800 text-sm"
                                placeholder="ceo@savage.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contraseña</label>
                            <input
                                type="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-all placeholder:text-gray-800 text-sm"
                                placeholder="••••••••••••"
                            />
                        </div>

                        {loginError && (
                            <div className="text-red-500 text-[10px] font-bold text-center bg-red-900/10 p-3 rounded border border-red-900/20 animate-in fade-in slide-in-from-top-2">
                                {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full bg-primary hover:bg-yellow-500 text-black font-black uppercase py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-widest text-xs shadow-lg shadow-primary/20 hover:shadow-primary/40"
                        >
                            {isLoggingIn ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" size={14} /> VERIFICANDO...
                                </span>
                            ) : 'INGRESAR AL SISTEMA'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    // --- END AUTH PROTECTION ---

    const {
        heroSlides, updateHeroSlides,
        orders, updateOrderStatus, deleteOrder, clearOrders,
        blogPosts, addBlogPost, updateBlogPost, deleteBlogPost,
        socialConfig, updateSocialConfig,
        categories, addCategory, deleteCategory, updateCategory,
        navbarLinks, updateNavbarLinks,
        bannerBento, updateBannerBento,
        lifestyleConfig, updateLifestyleConfig,
        heroCarouselConfig,
        updateHeroCarouselConfig,
        footerColumns, updateFooterColumns,
        saveAllData, loading,
        updateCategoryOrder, descriptionTemplates, updateDescriptionTemplates
    } = useShop();

    const { optimizeImage, isProcessing: isOptimizing } = useImageOptimizer();

    const [activeTab, setActiveTab] = useState<'hero' | 'orders' | 'blog' | 'config' | 'categories' | 'delivery' | 'webDesign' | 'texts'>('orders');
    const [activeFormTab, setActiveFormTab] = useState<'ESTÁNDAR' | 'INFANTIL' | 'ACCESORIOS' | 'CALZADOS'>('ESTÁNDAR');

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const faviconFileInputRef = React.useRef<HTMLInputElement>(null);
    const [isFaviconUploading, setIsFaviconUploading] = useState(false);
    const blogFileInputRef = React.useRef<HTMLInputElement>(null);
    const [isBlogUploading, setIsBlogUploading] = useState(false);


    // Hero Form State
    const [heroForm, setHeroForm] = useState<HeroSlide[]>(heroSlides);
    const [heroInterval, setHeroInterval] = useState(5); // Seconds

    const [uploadingSlideId, setUploadingSlideId] = useState<string | null>(null);
    const heroFileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (heroSlides && heroSlides.length > 0) {
            setHeroForm(heroSlides);
        }
        if (heroCarouselConfig) {
            setHeroInterval(heroCarouselConfig.interval / 1000);
        }
    }, [heroSlides, heroCarouselConfig]);

    const handleHeroFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && uploadingSlideId) {
            const file = e.target.files[0];
            const url = await uploadImage(file, 'hero');
            if (url) {
                setHeroForm(prev => prev.map(s => s.id === uploadingSlideId ? { ...s, image: url } : s));
            }
        }
    };

    const handleBlogFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsBlogUploading(true);
            const file = e.target.files[0];
            const url = await uploadImage(file, 'blog');
            if (url) {
                setBlogForm(prev => ({ ...prev, image: url }));
            }
            setIsBlogUploading(false);
        }
    };

    const handleFaviconFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsFaviconUploading(true);
            const file = e.target.files[0];
            const url = await uploadImage(file, 'config');
            if (url) {
                setConfigForm(prev => ({ ...prev, favicon: url }));
            }
            setIsFaviconUploading(false);
        }
    };
    // Blog Form State
    const [blogForm, setBlogForm] = useState({
        title: '',
        content: '',
        image: '',
        author: 'Admin',
        rating: 5,
        tag: 'LIFESTYLE'
    });

    const [editingPostId, setEditingPostId] = useState<string | null>(null);



    // Config Form State
    const [configForm, setConfigForm] = useState({
        instagram: '', tiktok: '', email: '', whatsapp: '', address: '', shippingText: '', topHeaderText: '', extraShippingInfo: '', ...socialConfig
    });

    // Validates that the form stays in sync with the database/context data when it loads
    React.useEffect(() => {
        if (socialConfig) {
            setConfigForm(prev => ({
                ...prev,
                ...socialConfig
            }));
        }
    }, [socialConfig]);

    const [lifestyleForm, setLifestyleForm] = useState(lifestyleConfig || {
        sectionTitle: 'THE SAVAGE LIFESTYLE',
        sectionSubtitle: 'Únete a la comunidad...',
        buttonText: 'LEER EL BLOG',
        buttonLink: '/blog'
    });

    React.useEffect(() => {
        if (lifestyleConfig) {
            setLifestyleForm(lifestyleConfig);
        }
    }, [lifestyleConfig]);

    // Web Design Form State
    const [navForm, setNavForm] = useState<NavbarLink[]>(navbarLinks || []);
    const [bentoForm, setBentoForm] = useState<BannerBento[]>(bannerBento || []);
    const [footerForm, setFooterForm] = useState<FooterColumn[]>(footerColumns || []);

    React.useEffect(() => { if (navbarLinks) setNavForm(navbarLinks); }, [navbarLinks]);
    React.useEffect(() => { if (bannerBento) setBentoForm(bannerBento); }, [bannerBento]);
    React.useEffect(() => { if (footerColumns) setFooterForm(footerColumns); }, [footerColumns]);

    // Categories Form State
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategorySubcats, setNewCategorySubcats] = useState('');
    const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);
    const [editSubcats, setEditSubcats] = useState('');

    // Description Settings Form
    const [textsForm, setTextsForm] = useState({ fan: '', player: '', kids: '', shoes: '' });

    useEffect(() => {
        if (descriptionTemplates) {
            setTextsForm(descriptionTemplates);
        }
    }, [descriptionTemplates]);

    const handleTextsSave = async () => {
        await updateDescriptionTemplates(textsForm);
        alert('Plantillas de texto actualizadas!');
    };



    // --- Hero Handlers ---
    const handleHeroSave = async () => {
        try {
            await updateHeroSlides(heroForm);
            if (updateHeroCarouselConfig) {
                await updateHeroCarouselConfig({ interval: heroInterval * 1000 });
            }
            alert('Añadido correctamente a la base de datos');
        } catch (error) {
            console.error(error);
            alert('Hubo un error guardando en la base de datos.');
        }
    };

    const addSlide = () => {
        setHeroForm([...heroForm, {
            id: Date.now().toString(),
            title: 'NUEVO BANNER',
            subtitle: 'Subtítulo aquí',
            buttonText: 'VER MÁS',
            image: 'https://via.placeholder.com/1920x1080'
        }]);
    };

    const removeSlide = (id: string) => {
        setHeroForm(heroForm.filter(s => s.id !== id));
    };

    const updateSlide = (id: string, field: keyof HeroSlide, value: string) => {
        setHeroForm(heroForm.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const moveSlide = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === heroForm.length - 1) return;

        const newSlides = [...heroForm];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
        setHeroForm(newSlides);
    };

    // --- Order Handlers ---
    const toggleOrderStatus = (orderId: string, currentStatus: string) => {
        // Toggle logic: Pendiente -> Entregado. Anything else -> Pendiente (Reopen)
        const newStatus = currentStatus === 'Pendiente' ? 'Entregado' : 'Pendiente';
        updateOrderStatus(orderId, newStatus as any);
    };

    // --- Blog Handlers ---
    const handleAddBlogPost = (e: React.FormEvent) => {
        e.preventDefault();
        const postData: BlogPost = {
            id: editingPostId || Date.now().toString(),
            title: blogForm.title,
            content: blogForm.content,
            image: blogForm.image || 'https://via.placeholder.com/800x600',
            author: blogForm.author,
            date: new Date().toLocaleDateString(),
            rating: blogForm.rating,
            tag: blogForm.tag
        };

        if (editingPostId) {
            updateBlogPost(postData);
            setEditingPostId(null);
            alert('Post actualizado!');
        } else {
            addBlogPost(postData);
            alert('Post/Testimonio agregado!');
        }

        setBlogForm({ title: '', content: '', image: '', author: 'Admin', rating: 5, tag: 'LIFESTYLE' });
    };

    const handleEditBlogPost = (post: BlogPost) => {
        setBlogForm({
            title: post.title,
            content: post.content,
            image: post.image || '',
            author: post.author || 'Admin',
            rating: post.rating || 5,
            tag: post.tag || 'LIFESTYLE'
        });
        setEditingPostId(post.id);
        // Scroll to form (roughly, simplified)
        const formElement = document.querySelector('form');
        if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCancelEditBlog = () => {
        setEditingPostId(null);
        setBlogForm({ title: '', content: '', image: '', author: 'Admin', rating: 5, tag: 'LIFESTYLE' });
    };

    const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
        if (!categories) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === categories.length - 1) return;

        const newCats = [...categories];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap locally to get the new order of IDs
        const temp = newCats[index];
        newCats[index] = newCats[targetIndex];
        newCats[targetIndex] = temp;

        const newOrderIds = newCats.map(c => c.id);
        updateCategoryOrder(newOrderIds);
    };

    // --- Config Handlers ---
    const handleConfigSave = async () => {
        try {
            await Promise.all([
                updateSocialConfig(configForm),
                updateLifestyleConfig(lifestyleForm)
            ]);
            alert('Añadido correctamente a la base de datos');
        } catch (error) {
            console.error(error);
            alert('Hubo un error guardando en la base de datos.');
        }
    };

    // --- Category Handlers ---
    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        const id = newCategoryName.toLowerCase().replace(/\s+/g, '-');
        const subcategories = newCategorySubcats.split(',').map(s => s.trim()).filter(s => s !== '');

        addCategory({ id, name: newCategoryName, subcategories });
        setNewCategoryName('');
        setNewCategorySubcats('');
        alert('Categoría agregada');
    };

    const [editOpacity, setEditOpacity] = useState('');

    const handleUpdateCategory = (catId: string) => {
        const subcategories = editSubcats.split(',').map(s => s.trim()).filter(s => s !== '');
        const opacity = editOpacity ? parseFloat(editOpacity) : undefined;

        const cat = categories.find(c => c.id === catId);
        if (!cat) return;

        if (updateCategory) {
            updateCategory({ ...cat, subcategories, opacity });
        } else {
            deleteCategory(catId);
            addCategory({ ...cat, subcategories, opacity });
        }

        setCategoryToEdit(null);
        setEditSubcats('');
        setEditOpacity('');
    };





    // --- Web Design Handlers ---
    const handleNavSave = async () => {
        try {
            await updateNavbarLinks(navForm);
            alert('Añadido correctamente a la base de datos');
        } catch (error) {
            console.error(error);
            alert('Hubo un error guardando en la base de datos.');
        }
    };

    const addNavLink = () => {
        const newId = 'nav' + Date.now();
        setNavForm([...navForm, { id: newId, label: 'NUEVO LINK', path: '/' }]);
    };

    const removeNavLink = (id: string) => {
        setNavForm(navForm.filter(l => l.id !== id));
    };

    const updateNavLink = (id: string, field: keyof NavbarLink, value: any) => {
        setNavForm(navForm.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const addBentoItem = () => {
        const newId = `bento-${Date.now()}`;
        setBentoForm(prev => [...prev, {
            id: newId,
            title: 'NUEVO BANNER',
            image: '',
            link: '/',
            buttonText: 'Ver Más'
        }]);
    };

    const removeBentoItem = (id: string) => {
        setBentoForm(prev => prev.filter(b => b.id !== id));
    };

    const updateBentoItem = (id: string, field: keyof BannerBento, value: string) => {
        setBentoForm(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const getBentoLabel = (index: number) => {
        if (index === 0) return 'Bloque Grande (Izquierda)';
        if (index === 1) return 'Bloque Medio (Arriba Derecha)';
        if (index === 2) return 'Bloque Medio (Abajo Derecha)';
        return `Banner Adicional #${index + 1}`;
    };

    const handleBentoSave = async () => {
        try {
            await updateBannerBento(bentoForm);
            alert('Añadido correctamente a la base de datos');
        } catch (error) {
            console.error(error);
            alert('Hubo un error guardando en la base de datos.');
        }
    };



    // --- Footer Handlers ---
    const handleFooterSave = async () => {
        try {
            await updateFooterColumns(footerForm);
            alert('Añadido correctamente a la base de datos');
        } catch (error) {
            console.error(error);
            alert('Hubo un error guardando en la base de datos.');
        }
    };

    const updateFooterColumnTitle = (colId: string, title: string) => {
        setFooterForm(prev => prev.map(col => col.id === colId ? { ...col, title } : col));
    };

    const addFooterLink = (colId: string) => {
        const newId = 'l' + Date.now();
        setFooterForm(prev => prev.map(col => {
            if (col.id === colId) {
                return { ...col, links: [...col.links, { id: newId, label: 'NUEVO LINK', url: '#' }] };
            }
            return col;
        }));
    };

    const removeFooterLink = (colId: string, linkId: string) => {
        setFooterForm(prev => prev.map(col => {
            if (col.id === colId) {
                return { ...col, links: col.links.filter(l => l.id !== linkId) };
            }
            return col;
        }));
    };

    const updateFooterLink = (colId: string, linkId: string, field: 'label' | 'url', value: string) => {
        setFooterForm(prev => prev.map(col => {
            if (col.id === colId) {
                const newLinks = col.links.map(l => l.id === linkId ? { ...l, [field]: value } : l);
                return { ...col, links: newLinks };
            }
            return col;
        }));
    };




    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row relative">

            {/* Mobile Header */}
            <div className="md:hidden bg-black border-b border-gray-800 p-4 flex justify-between items-center sticky top-0 z-50">
                <h1 className="text-xl font-black tracking-tighter text-primary">SAVAGE<span className="text-white">ADMIN</span></h1>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-[#050505] border-r border-gray-800 p-6 flex flex-col h-screen
                transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
                md:translate-x-0 md:static md:w-64 md:sticky md:top-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-2xl font-black tracking-tighter text-primary">SAVAGE<span className="text-white">ADMIN</span></h1>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'analytics' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <Activity size={20} className="text-primary" /> <span className="font-bold text-sm">Dashboard & Ventas</span>
                    </button>

                    <button onClick={() => setActiveTab('webDesign')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'webDesign' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <Layout size={20} /> <span className="font-bold text-sm">Diseño Web / Banners</span>
                    </button>
                    <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'orders' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <FileText size={20} /> <span className="font-bold text-sm">Pedidos / Ventas</span>
                    </button>
                    <button onClick={() => setActiveTab('hero')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'hero' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <ImageIcon size={20} /> <span className="font-bold text-sm">Carrusel Hero</span>
                    </button>

                    <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'categories' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <Layers size={20} /> <span className="font-bold text-sm">Categorías</span>
                    </button>
                    <button onClick={() => setActiveTab('delivery')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'delivery' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <Map size={20} /> <span className="font-bold text-sm">Zonas de Entrega</span>
                    </button>
                    <button onClick={() => setActiveTab('blog')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'blog' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <MessageSquare size={20} /> <span className="font-bold text-sm">Blog / Reviews</span>
                    </button>
                    <button onClick={() => setActiveTab('texts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'texts' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <Type size={20} /> <span className="font-bold text-sm">Textos / Descripciones</span>
                    </button>
                    <button onClick={() => setActiveTab('config')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'config' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <Settings size={20} /> <span className="font-bold text-sm">Configuración</span>
                    </button>

                    <button
                        onClick={() => { saveAllData(); alert('Todos los cambios han sido guardados correctamente.'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-green-500 hover:bg-green-500/10 hover:text-green-400 mt-4 border border-green-900/50"
                    >
                        <Save size={20} /> <span className="font-bold text-sm">GUARDAR TODO</span>
                    </button>
                </nav>

                <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white transition-colors mt-auto">
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Volver a Tienda</span>
                </Link>
            </aside>

            {/* Main Content */}
            <main id="admin-main-content" className="flex-1 p-4 md:p-10 overflow-y-auto h-[calc(100vh-73px)] md:h-screen">

                {/* ANALYTICS TAB */}
                {activeTab === 'analytics' && (
                    <div className="max-w-7xl mx-auto space-y-12">
                        <AdminAnalytics />
                    </div>
                )}






                {/* ORDERS TAB */}
                {
                    activeTab === 'orders' && (
                        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <header className="border-b border-gray-800 pb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">Pedidos y Ventas</h2>
                                    <p className="text-gray-400">Control de pedidos iniciados via WhatsApp.</p>
                                </div>
                                {orders.length > 0 && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm('¿ESTÁS SEGURO DE ELIMINAR TODOS LOS PEDIDOS? Esta acción no se puede deshacer.')) {
                                                clearOrders();
                                            }
                                        }}
                                        className="bg-red-900/20 hover:bg-red-900/40 text-red-500 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors border border-red-900/30 flex items-center gap-2"
                                    >
                                        <Trash2 size={16} /> ELIMINAR TODO
                                    </button>
                                )}
                            </header>

                            <div className="space-y-4" key={orders?.map(o => o?.id || 'null').join(',') || 'empty'}>
                                {orders.length === 0 ? (
                                    <div className="text-center py-20 bg-[#0a0a0a] border border-gray-800 rounded-xl">
                                        <p className="text-gray-500">No hay pedidos registrados aún.</p>
                                    </div>
                                ) : (
                                    orders.map(order => (
                                        <div key={order.id} className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wider ${order.status === 'Pendiente' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                                        {order.status}
                                                    </span>
                                                    <span className="text-gray-500 text-xs">{order.created_at}</span>
                                                    <span className="text-[10px] text-gray-700 font-mono">#{order.display_id || order.id.toString().slice(-4)}</span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteOrder(order.id);
                                                        }}
                                                        className="p-3 text-red-500 hover:bg-red-900/20 rounded-lg transition-all ml-auto md:ml-2 border border-red-900/30"
                                                        title="Eliminar DEFINITIVAMENTE"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    {/* Compatibility check for items */}
                                                    {(order.items as any[])?.map((item: any) => (
                                                        <div key={item.id + (item.selectedSize || '')} className="text-sm">
                                                            <span className="font-bold text-white">{item.quantity || 1}x {item.name}</span>
                                                            {item.selectedSize && <span className="text-gray-500 ml-2">({item.selectedSize})</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-2 text-xs text-gray-400">
                                                    Total: <span className="text-white font-bold text-base">Gs. {order.total_amount?.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                                {order.status === 'Pendiente' ? (
                                                    <button
                                                        onClick={() => toggleOrderStatus(order.id, 'Pendiente')}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors w-full md:w-auto"
                                                    >
                                                        Marcar Finalizado
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => toggleOrderStatus(order.id, 'Entregado')}
                                                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors w-full md:w-auto"
                                                    >
                                                        Reabrir Pedido
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                }


                {/* BLOG TAB */}
                {
                    activeTab === 'blog' && (
                        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <header className="border-b border-gray-800 pb-6">
                                <h2 className="text-3xl font-bold mb-2">Blog y Reseñas</h2>
                                <p className="text-gray-400">Gestiona entradas del blog y testimonios de clientes.</p>
                            </header>

                            {/* Add Post Form */}
                            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 shadow-2xl">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary">
                                    {editingPostId ? <Edit size={24} /> : <Plus size={24} />}
                                    {editingPostId ? 'EDITAR ENTRADA / RESEÑA' : 'NUEVA ENTRADA / RESEÑA'}
                                </h3>
                                <form onSubmit={handleAddBlogPost} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
                                        <input type="text" value={blogForm.title} onChange={e => setBlogForm({ ...blogForm, title: e.target.value })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" placeholder="Ej. Cliente Satisfecho" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Contenido / Comentario</label>
                                        <textarea value={blogForm.content} onChange={e => setBlogForm({ ...blogForm, content: e.target.value })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors h-32 resize-none" placeholder="Escribe aquí..." required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">URL Imagen</label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => blogFileInputRef.current?.click()}
                                                    className="text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-3 rounded-lg flex items-center gap-2 font-bold transition-colors whitespace-nowrap"
                                                    disabled={isBlogUploading}
                                                >
                                                    {isBlogUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                                                    {isBlogUploading ? '...' : 'SUBIR PC'}
                                                </button>
                                                <input type="text" value={blogForm.image} onChange={e => setBlogForm({ ...blogForm, image: e.target.value })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" placeholder="https://..." />
                                                <input
                                                    type="file"
                                                    ref={blogFileInputRef}
                                                    onChange={handleBlogFileSelect}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                            </div>

                                            {blogForm.image && (
                                                <div className="mt-3 relative w-full h-48 bg-gray-900 rounded-lg overflow-hidden border border-gray-800 group">
                                                    <img src={blogForm.image} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-xs font-bold text-white uppercase tracking-widest">Vista Previa</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Calificación (Estrellas)</label>
                                            <select value={blogForm.rating} onChange={e => setBlogForm({ ...blogForm, rating: Number(e.target.value) })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors text-white">
                                                <option value="5">5 Estrellas</option>
                                                <option value="4">4 Estrellas</option>
                                                <option value="3">3 Estrellas</option>
                                                <option value="2">2 Estrellas</option>
                                                <option value="1">1 Estrella</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Tag (Etiqueta)</label>
                                            <input type="text" value={blogForm.tag} onChange={e => setBlogForm({ ...blogForm, tag: e.target.value })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" placeholder="Ej. LIFESTYLE" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Autor</label>
                                        <input type="text" value={blogForm.author} onChange={e => setBlogForm({ ...blogForm, author: e.target.value })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" placeholder="Nombre del autor/cliente" />
                                    </div>
                                    <button type="submit" className={`w-full font-black py-4 rounded-lg transition-all uppercase text-sm tracking-widest shadow-lg ${editingPostId ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-white hover:bg-gray-200 text-black'}`}>
                                        {editingPostId ? 'GUARDAR CAMBIOS' : 'PUBLICAR'}
                                    </button>
                                    {editingPostId && (
                                        <button type="button" onClick={handleCancelEditBlog} className="w-full bg-transparent border border-gray-800 text-gray-500 font-bold py-3 mt-2 rounded-lg hover:border-white hover:text-white transition-all uppercase text-xs tracking-widest">
                                            CANCELAR EDICIÓN
                                        </button>
                                    )}
                                </form>
                            </div>

                            {/* List Posts */}
                            <div className="space-y-4">
                                {blogPosts.map(post => (
                                    <div key={post.id} className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 flex gap-4 items-start">
                                        <img src={post.image} alt="" className="w-24 h-24 object-cover rounded-lg bg-gray-900" />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-white text-lg">{post.title}</h4>
                                                <div className="flex gap-1 text-yellow-500 text-xs">
                                                    {'★'.repeat(post.rating || 5)}{'☆'.repeat(5 - (post.rating || 5))}
                                                </div>
                                            </div>
                                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{post.content}</p>
                                            <div className="flex justify-between items-center mt-4">
                                                <span className="text-xs text-gray-600">Por {post.author} • {post.date}</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditBlogPost(post)} className="text-gray-400 hover:text-white text-xs font-bold uppercase hover:underline">Editar</button>
                                                    <button onClick={() => deleteBlogPost(post.id)} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase hover:underline">Eliminar</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div >
                    )
                }


                {/* CONFIG TAB */}
                {
                    activeTab === 'config' && (
                        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <header className="border-b border-gray-800 pb-6">
                                <h2 className="text-3xl font-bold mb-2">Configuración General</h2>
                                <p className="text-gray-400">Redes sociales y datos de contacto.</p>
                            </header>

                            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 shadow-2xl space-y-6">
                                {/* Brand Assets */}
                                <div className="space-y-4 mb-6 pb-6 border-b border-gray-800">
                                    <h3 className="text-lg font-bold text-white mb-2">Identidad de Marca</h3>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Favicon / Icono de Navegador</label>
                                        <div className="flex gap-4 items-center">
                                            {configForm.favicon && (
                                                <div className="w-12 h-12 bg-gray-900 rounded-lg p-2 border border-gray-700">
                                                    <img src={configForm.favicon} alt="Favicon" className="w-full h-full object-contain" />
                                                </div>
                                            )}
                                            <div className="flex-1 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={configForm.favicon || ''}
                                                    readOnly
                                                    className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors text-gray-500"
                                                    placeholder="URL del Favicon..."
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => faviconFileInputRef.current?.click()}
                                                    className="bg-white text-black font-bold px-4 rounded-lg hover:bg-gray-200 transition-all uppercase text-xs tracking-widest flex items-center gap-2 whitespace-nowrap"
                                                    disabled={isFaviconUploading}
                                                >
                                                    {isFaviconUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                                                    {isFaviconUploading ? '...' : 'SUBIR'}
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={faviconFileInputRef}
                                                    onChange={handleFaviconFileSelect}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-500">Recomendado: PNG o ICO con fondo transparente.</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Instagram URL</label>
                                    <input type="text" value={configForm.instagram} onChange={e => setConfigForm({ ...configForm, instagram: e.target.value })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">TikTok URL</label>
                                    <input type="text" value={configForm.tiktok} onChange={e => setConfigForm({ ...configForm, tiktok: e.target.value })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp (Número sin +)</label>
                                    <input type="text" value={configForm.whatsapp} onChange={e => setConfigForm({ ...configForm, whatsapp: e.target.value })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Dirección / Footer Info</label>
                                    <input type="text" value={configForm.address} onChange={e => setConfigForm({ ...configForm, address: e.target.value })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" />
                                </div>

                                <hr className="border-gray-800 my-4" />
                                <h3 className="text-lg font-bold text-white mb-2">Encabezado (Top Bar)</h3>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Texto del Encabezado</label>
                                    <input type="text" value={configForm.topHeaderText || ''} onChange={e => setConfigForm({ ...configForm, topHeaderText: e.target.value })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" placeholder="Ej. ENVÍOS GRATIS..." />
                                </div>

                                <hr className="border-gray-800 my-4" />
                                <h3 className="text-lg font-bold text-white mb-2">Sección Lifestyle / Blog (Home)</h3>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Título de Sección</label>
                                    <input type="text" value={lifestyleForm.sectionTitle} onChange={e => setLifestyleForm({ ...lifestyleForm, sectionTitle: e.target.value })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Subtítulo</label>
                                    <input type="text" value={lifestyleForm.sectionSubtitle} onChange={e => setLifestyleForm({ ...lifestyleForm, sectionSubtitle: e.target.value })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Texto Botón</label>
                                        <input type="text" value={lifestyleForm.buttonText} onChange={e => setLifestyleForm({ ...lifestyleForm, buttonText: e.target.value })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Link Botón</label>
                                        <input type="text" value={lifestyleForm.buttonLink} onChange={e => setLifestyleForm({ ...lifestyleForm, buttonLink: e.target.value })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" />
                                    </div>
                                </div>
                                <hr className="border-gray-800 my-4" />

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Texto de Envío (Info Producto)</label>
                                    <input type="text" value={configForm.shippingText} onChange={e => setConfigForm({ ...configForm, shippingText: e.target.value })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" placeholder="Ej. Envío gratis en compras mayores a..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Texto de Devoluciones (Info Producto)</label>
                                    <input type="text" value={configForm.extraShippingInfo || ''} onChange={e => setConfigForm({ ...configForm, extraShippingInfo: e.target.value })} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" placeholder="Ej. Devoluciones gratis hasta 30 días" />
                                </div>
                                <button onClick={handleConfigSave} className="w-full bg-primary text-white font-black py-4 rounded-lg hover:bg-red-700 transition-all uppercase text-sm tracking-widest shadow-lg mt-4">
                                    Guardar Configuración
                                </button>
                            </div>
                        </div>
                    )
                }

                {/* CATEGORIES TAB */}
                {
                    activeTab === 'categories' && (
                        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <header className="border-b border-gray-800 pb-6">
                                <h2 className="text-3xl font-bold mb-2">Gestión de Categorías</h2>
                                <p className="text-gray-400">Crea y elimina categorías para organizar tu tienda.</p>
                            </header>

                            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 shadow-2xl">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary">
                                    <Plus size={24} /> NUEVA CATEGORÍA
                                </h3>
                                <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="space-y-2 flex-1 w-full">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Nombre de Categoría</label>
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={e => setNewCategoryName(e.target.value)}
                                            className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors"
                                            placeholder="Ej. Camperas"
                                        />
                                    </div>
                                    <div className="space-y-2 flex-1 w-full">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Subcategorías (Separadas por comas)</label>
                                        <input
                                            type="text"
                                            value={newCategorySubcats}
                                            onChange={e => setNewCategorySubcats(e.target.value)}
                                            className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors"
                                            placeholder="Ej. Nike, Adidas, Puma..."
                                        />
                                    </div>
                                    <button type="submit" className="bg-white text-black font-black px-8 py-3 rounded-lg hover:bg-gray-200 transition-all uppercase text-sm tracking-widest shadow-lg h-[46px] w-full md:w-auto">
                                        AGREGAR
                                    </button>
                                </form>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold border-b border-gray-800 pb-2">Categorías Existentes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {categories.map((cat, index) => (
                                        <div key={cat.id} className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4 flex flex-col gap-4 group">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    {/* Sort Controls */}
                                                    <div className="flex flex-col gap-1">
                                                        <button
                                                            onClick={() => handleMoveCategory(index, 'up')}
                                                            disabled={index === 0}
                                                            className="text-gray-600 hover:text-white disabled:opacity-30 disabled:hover:text-gray-600 transition-colors"
                                                        >
                                                            <ArrowUp size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleMoveCategory(index, 'down')}
                                                            disabled={index === categories.length - 1}
                                                            className="text-gray-600 hover:text-white disabled:opacity-30 disabled:hover:text-gray-600 transition-colors"
                                                        >
                                                            <ArrowDown size={14} />
                                                        </button>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white text-lg">{cat.name}</h4>
                                                        <span className="text-xs text-gray-500 font-mono">ID: {cat.id}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setCategoryToEdit(cat.id);
                                                            setEditSubcats(cat.subcategories ? cat.subcategories.join(', ') : '');
                                                        }}
                                                        className="p-2 text-gray-600 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                                        title="Editar Subcategorías"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    {cat.id !== 'huerfanos' && (
                                                        <button
                                                            onClick={() => deleteCategory(cat.id)}
                                                            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                            title="Eliminar Categoría"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Subcategories Display/Edit */}
                                            {categoryToEdit === cat.id ? (
                                                <div className="flex flex-col gap-2 animate-in fade-in">
                                                    <input
                                                        type="text"
                                                        value={editSubcats}
                                                        onChange={e => setEditSubcats(e.target.value)}
                                                        className="w-full bg-black border border-gray-700 rounded p-2 text-xs text-white"
                                                        placeholder="Subcategorías (Nike, Adidas...)"
                                                    />
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            value={editOpacity}
                                                            onChange={e => setEditOpacity(e.target.value)}
                                                            className="w-24 bg-black border border-gray-700 rounded p-2 text-xs text-white"
                                                            placeholder="Opacidad (0.5)"
                                                            step="0.1"
                                                        />
                                                        <button onClick={() => handleUpdateCategory(cat.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">OK</button>
                                                        <button onClick={() => setCategoryToEdit(null)} className="bg-gray-700 text-white px-3 py-1 rounded text-xs">Cancelar</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {cat.subcategories?.map(sub => (
                                                        <span key={sub} className="px-2 py-1 bg-gray-900 text-gray-400 text-[10px] rounded uppercase border border-gray-800">{sub}</span>
                                                    ))}
                                                    {(!cat.subcategories || cat.subcategories.length === 0) && <span className="text-[10px] text-gray-700 italic">Sin subcategorías</span>}
                                                    {cat.opacity !== undefined && <span className="text-[10px] text-yellow-500 ml-2">Opacidad: {cat.opacity}</span>}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* DELIVERY TAB */}
                {
                    activeTab === 'delivery' && (
                        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <header className="border-b border-gray-800 pb-6">
                                <h2 className="text-3xl font-bold mb-2">Zonas de Entrega</h2>
                                <p className="text-gray-400">Configura áreas geográficas y precios de envío automáticos.</p>
                            </header>

                            <DeliveryZoneMap />
                        </div>
                    )
                }

                {/* VISUAL CONFIG TAB (was activeTab === 'hero' previously? No, hero is separate) */}
                {/* HERO TAB */}
                {
                    activeTab === 'hero' && (
                        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <header className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">Carrusel Hero</h2>
                                    <p className="text-gray-400">Personaliza el carrusel principal.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1">Intervalo (seg)</label>
                                        <input
                                            type="number"
                                            value={heroInterval}
                                            onChange={e => setHeroInterval(Number(e.target.value))}
                                            className="bg-black border border-gray-800 rounded p-2 text-sm w-20 text-center font-bold text-white focus:border-primary focus:outline-none"
                                            min="1"
                                        />
                                    </div>
                                    <button onClick={handleHeroSave} className="bg-primary hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
                                        <Save size={18} /> GUARDAR CAMBIOS
                                    </button>
                                </div>
                            </header>

                            <input type="file" ref={heroFileInputRef} onChange={handleHeroFileSelect} className="hidden" accept="image/*" />

                            <div className="space-y-6">
                                {heroForm.map((slide, index) => (
                                    <div key={slide.id} className="bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden relative group">
                                        <div className="absolute right-4 top-4 z-10 flex gap-2">
                                            <button onClick={() => moveSlide(index, 'up')} className="p-2 bg-black/50 hover:bg-white text-white hover:text-black rounded-lg transition-colors border border-gray-700" title="Mover arriba">
                                                <ChevronUp size={16} />
                                            </button>
                                            <button onClick={() => moveSlide(index, 'down')} className="p-2 bg-black/50 hover:bg-white text-white hover:text-black rounded-lg transition-colors border border-gray-700" title="Mover abajo">
                                                <ChevronDown size={16} />
                                            </button>
                                            <button onClick={() => removeSlide(slide.id)} className="p-2 bg-red-900/50 hover:bg-red-600 text-white rounded-lg transition-colors border border-red-900">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3">
                                            {/* Preview Area */}
                                            <div className="relative h-64 md:h-auto md:col-span-1 bg-gray-900">
                                                <img src={slide.image} alt="Preview" className="w-full h-full object-cover opacity-60" />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                                    <h2 className="text-xl font-black italic tracking-tighter uppercase mb-1 shadow-black drop-shadow-lg">{slide.title}</h2>
                                                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase shadow-black drop-shadow-md">{slide.subtitle}</p>
                                                </div>
                                                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-gray-300 font-mono">
                                                    Slide #{index + 1}
                                                </div>
                                            </div>

                                            {/* Edit Form */}
                                            <div className="p-6 md:col-span-2 space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">URL Imagen</label>
                                                    <div className="flex gap-2">
                                                        <input type="text" value={slide.image} onChange={e => updateSlide(slide.id, 'image', e.target.value)} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" />
                                                        <button
                                                            onClick={() => { setUploadingSlideId(slide.id); heroFileInputRef.current?.click(); }}
                                                            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg transition-colors"
                                                            title="Subir imagen"
                                                        >
                                                            <UploadCloud size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
                                                        <input type="text" value={slide.title} onChange={e => updateSlide(slide.id, 'title', e.target.value)} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase">Subtítulo</label>
                                                        <input type="text" value={slide.subtitle} onChange={e => updateSlide(slide.id, 'subtitle', e.target.value)} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase">Texto Botón</label>
                                                        <input type="text" value={slide.buttonText} onChange={e => updateSlide(slide.id, 'buttonText', e.target.value)} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase">Link Botón</label>
                                                        <input type="text" value={slide.buttonLink || ''} onChange={e => updateSlide(slide.id, 'buttonLink', e.target.value)} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors" placeholder="/category/..." />
                                                    </div>

                                                    {/* Image Position Controls */}
                                                    <div className="col-span-2 border-t border-gray-800 pt-4 mt-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                                                            <span className="material-symbols-outlined text-sm">crop</span> Ajuste de Posición Imagen
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-gray-500 uppercase block">Móvil</label>
                                                                <select
                                                                    value={slide.mobilePosition || 'center center'}
                                                                    onChange={e => updateSlide(slide.id, 'mobilePosition', e.target.value)}
                                                                    className="w-full bg-black border border-gray-800 rounded p-2 text-xs focus:border-primary focus:outline-none transition-colors text-white"
                                                                >
                                                                    <option value="center center">Centro (Default)</option>
                                                                    <option value="center top">Arriba (Top)</option>
                                                                    <option value="center bottom">Abajo (Bottom)</option>
                                                                    <option value="left center">Izquierda</option>
                                                                    <option value="right center">Derecha</option>
                                                                    <option value="center 20%">Arriba 20%</option>
                                                                    <option value="center 80%">Abajo 80%</option>
                                                                </select>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-gray-500 uppercase block">Escritorio</label>
                                                                <select
                                                                    value={slide.desktopPosition || 'center center'}
                                                                    onChange={e => updateSlide(slide.id, 'desktopPosition', e.target.value)}
                                                                    className="w-full bg-black border border-gray-800 rounded p-2 text-xs focus:border-primary focus:outline-none transition-colors text-white"
                                                                >
                                                                    <option value="center center">Centro (Default)</option>
                                                                    <option value="center top">Arriba (Top)</option>
                                                                    <option value="center bottom">Abajo (Bottom)</option>
                                                                    <option value="left center">Izquierda</option>
                                                                    <option value="right center">Derecha</option>
                                                                    <option value="center 20%">Arriba 20%</option>
                                                                    <option value="center 80%">Abajo 80%</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button onClick={addSlide} className="w-full py-8 border-2 border-dashed border-gray-800 hover:border-gray-600 rounded-xl text-gray-500 hover:text-white font-bold flex flex-col items-center justify-center gap-2 transition-colors">
                                    <Plus size={32} />
                                    AGREGAR NUEVO SLIDE
                                </button>
                            </div>
                        </div>
                    )
                }

                {/* WEB DESIGN TAB */}
                {
                    activeTab === 'webDesign' && (
                        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <header className="border-b border-gray-800 pb-6">
                                <h2 className="text-3xl font-bold mb-2">Diseño Web y Atajos</h2>
                                <p className="text-gray-400">Personaliza la barra de navegación y los banners de categoría.</p>
                            </header>

                            {/* NAVBAR SECTION */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Layers size={20} /> BARRA DE NAVEGACIÓN (Navbar)
                                    </h3>
                                    <button onClick={handleNavSave} className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
                                        <Save size={16} /> Guardar Menú
                                    </button>
                                </div>

                                <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6">
                                    <div className="space-y-4">
                                        {navForm.map((link, idx) => (
                                            <div key={link.id} className="flex gap-4 items-center bg-black/50 p-4 rounded-lg border border-gray-800">
                                                <span className="text-gray-500 font-mono text-xs">#{idx + 1}</span>
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Texto (Label)</label>
                                                        <input
                                                            type="text"
                                                            value={link.label}
                                                            onChange={(e) => updateNavLink(link.id, 'label', e.target.value)}
                                                            className="w-full bg-black border border-gray-700 rounded p-2 text-sm text-white focus:border-primary focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Ruta (Path)</label>
                                                        <input
                                                            type="text"
                                                            value={link.path}
                                                            onChange={(e) => updateNavLink(link.id, 'path', e.target.value)}
                                                            className="w-full bg-black border border-gray-700 rounded p-2 text-sm text-gray-300 font-mono focus:border-primary focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Subcategorías</label>
                                                        <input
                                                            type="text"
                                                            value={link.subcategories ? link.subcategories.join(', ') : ''}
                                                            onChange={(e) => updateNavLink(link.id, 'subcategories' as any, e.target.value ? e.target.value.split(',').map(s => s.trim()) : [])}
                                                            className="w-full bg-black border border-gray-700 rounded p-2 text-sm text-gray-300 font-mono focus:border-primary focus:outline-none"
                                                            placeholder="Ej. River, Boca, Selección..."
                                                        />
                                                    </div>
                                                </div>
                                                <button onClick={() => removeNavLink(link.id)} className="text-gray-600 hover:text-red-500 p-2">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                        <button onClick={addNavLink} className="w-full py-4 border border-dashed border-gray-800 text-gray-500 hover:text-white hover:border-gray-600 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                            <Plus size={16} /> Agregar Item al Menú
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* BENTO BANNERS SECTION */}
                            <div className="space-y-6 pt-6 border-t border-gray-800">
                                <div className="flex justify-between items-end">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <ImageIcon size={20} /> BANNERS DE CATEGORÍA
                                    </h3>
                                    <button onClick={handleBentoSave} className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
                                        <Save size={16} /> Guardar Banners
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {bentoForm.map((banner, idx) => (
                                        <div key={banner.id} className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 group">
                                            <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-2">
                                                <h4 className="text-lg font-bold text-white">
                                                    {getBentoLabel(idx)}
                                                </h4>
                                                <button onClick={() => removeBentoItem(banner.id)} className="text-gray-500 hover:text-red-500 p-1 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* Preview */}
                                                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                                                    {banner.image ? (
                                                        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover opacity-75" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin Imagen</div>
                                                    )}
                                                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                                                        <span className="text-white font-black text-xl uppercase leading-none mb-1 shadow-black drop-shadow-md">{banner.title}</span>
                                                        {banner.buttonText && <span className="text-primary text-xs font-bold uppercase shadow-black drop-shadow-md">{banner.buttonText}</span>}
                                                    </div>
                                                </div>

                                                {/* Fields */}
                                                <div className="md:col-span-2 space-y-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Título</label>
                                                        <input
                                                            type="text"
                                                            value={banner.title}
                                                            onChange={(e) => updateBentoItem(banner.id, 'title', e.target.value)}
                                                            className="w-full bg-black border border-gray-700 rounded p-2 text-sm text-white focus:border-primary focus:outline-none"
                                                        />
                                                    </div>
                                                    {idx === 0 && (
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Subtítulo</label>
                                                            <input
                                                                type="text"
                                                                value={banner.subtitle || ''}
                                                                onChange={(e) => updateBentoItem(banner.id, 'subtitle', e.target.value)}
                                                                className="w-full bg-black border border-gray-700 rounded p-2 text-sm text-white focus:border-primary focus:outline-none"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Texto Botón</label>
                                                            <input
                                                                type="text"
                                                                value={banner.buttonText || ''}
                                                                onChange={(e) => updateBentoItem(banner.id, 'buttonText', e.target.value)}
                                                                className="w-full bg-black border border-gray-700 rounded p-2 text-sm text-white focus:border-primary focus:outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Link / Ruta</label>
                                                            <input
                                                                type="text"
                                                                value={banner.link}
                                                                onChange={(e) => updateBentoItem(banner.id, 'link', e.target.value)}
                                                                className="w-full bg-black border border-gray-700 rounded p-2 text-sm text-white focus:border-primary focus:outline-none font-mono"
                                                                placeholder="/category/..."
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase">URL Imagen</label>
                                                        <input
                                                            type="text"
                                                            value={banner.image}
                                                            onChange={(e) => updateBentoItem(banner.id, 'image', e.target.value)}
                                                            className="w-full bg-black border border-gray-700 rounded p-2 text-xs text-gray-300 focus:border-primary focus:outline-none font-mono"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={addBentoItem} className="w-full py-4 border border-dashed border-gray-800 text-gray-500 hover:text-white hover:border-gray-600 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                        <Plus size={16} /> Agregar Nuevo Banner
                                    </button>
                                </div>
                            </div>

                            {/* FOOTER SECTION */}
                            <div className="space-y-6 pt-6 border-t border-gray-800">
                                <div className="flex justify-between items-end">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Layout size={20} /> FOOTER (Enlaces)
                                    </h3>
                                    <button onClick={handleFooterSave} className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
                                        <Save size={16} /> Guardar Footer
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    {footerForm.map((col) => (
                                        <div key={col.id} className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6">
                                            <div className="mb-6">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Título de Columna</label>
                                                <input
                                                    type="text"
                                                    value={col.title}
                                                    onChange={(e) => updateFooterColumnTitle(col.id, e.target.value)}
                                                    className="w-full bg-black border border-gray-700 rounded p-3 text-lg font-bold text-white focus:border-primary focus:outline-none"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                {col.links.map((link) => (
                                                    <div key={link.id} className="flex gap-2 items-center bg-black/50 p-3 rounded-lg border border-gray-800">
                                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    value={link.label}
                                                                    onChange={(e) => updateFooterLink(col.id, link.id, 'label', e.target.value)}
                                                                    className="w-full bg-transparent border-b border-gray-700 text-sm text-gray-300 focus:border-primary focus:outline-none pb-1"
                                                                    placeholder="Texto Enlace"
                                                                />
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    value={link.url}
                                                                    onChange={(e) => updateFooterLink(col.id, link.id, 'url', e.target.value)}
                                                                    className="w-full bg-transparent border-b border-gray-700 text-sm text-gray-500 font-mono focus:border-primary focus:outline-none pb-1"
                                                                    placeholder="/ruta..."
                                                                />
                                                            </div>
                                                        </div>
                                                        <button onClick={() => removeFooterLink(col.id, link.id)} className="text-gray-600 hover:text-red-500 p-1">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <button onClick={() => addFooterLink(col.id)} className="mt-4 w-full py-3 border border-dashed border-gray-800 text-gray-500 hover:text-white hover:border-gray-600 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                                <Plus size={14} /> Agregar Enlace
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                }
                {
                    activeTab === 'texts' && (
                        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                            <header className="border-b border-gray-800 pb-6 flex justify-between items-end">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">Configuración de Textos</h2>
                                    <p className="text-gray-400">Define las descripciones base para el autocompletado en productos.</p>
                                </div>
                                <button onClick={handleTextsSave} className="bg-primary hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
                                    <Save size={18} /> GUARDAR TEXTOS
                                </button>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Fan Version */}
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        Versión Fan
                                    </label>
                                    <textarea
                                        value={textsForm.fan}
                                        onChange={e => setTextsForm(prev => ({ ...prev, fan: e.target.value }))}
                                        className="w-full h-40 bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 text-sm text-gray-300 focus:border-primary focus:outline-none transition-colors resize-none font-sans leading-relaxed"
                                        placeholder="Descripción para camisetas versión Fan..."
                                    />
                                </div>

                                {/* Player Version */}
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                        Versión Player
                                    </label>
                                    <textarea
                                        value={textsForm.player}
                                        onChange={e => setTextsForm(prev => ({ ...prev, player: e.target.value }))}
                                        className="w-full h-40 bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 text-sm text-gray-300 focus:border-primary focus:outline-none transition-colors resize-none font-sans leading-relaxed"
                                        placeholder="Descripción para camisetas versión Player..."
                                    />
                                </div>

                                {/* Kids */}
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                        Conjuntos Infantil
                                    </label>
                                    <textarea
                                        value={textsForm.kids}
                                        onChange={e => setTextsForm(prev => ({ ...prev, kids: e.target.value }))}
                                        className="w-full h-40 bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 text-sm text-gray-300 focus:border-primary focus:outline-none transition-colors resize-none font-sans leading-relaxed"
                                        placeholder="Descripción para conjuntos de niños..."
                                    />
                                </div>

                                {/* Shoes */}
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Calzados Premium
                                    </label>
                                    <textarea
                                        value={textsForm.shoes}
                                        onChange={e => setTextsForm(prev => ({ ...prev, shoes: e.target.value }))}
                                        className="w-full h-40 bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 text-sm text-gray-300 focus:border-primary focus:outline-none transition-colors resize-none font-sans leading-relaxed"
                                        placeholder="Descripción para calzados..."
                                    />
                                </div>
                            </div>
                        </div>
                    )
                }
            </main>
        </div>
    );
};

export default AdminDashboard;
