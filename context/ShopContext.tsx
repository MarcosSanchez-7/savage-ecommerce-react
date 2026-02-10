
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, HeroSlide, Order, SocialConfig, BlogPost, Category, DeliveryZone, NavbarLink, BannerBento, LifestyleConfig, FooterColumn, HeroCarouselConfig, Drop, DropsConfig, Attribute, AttributeValue, ProductAttributeValue, SeasonConfig } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import { supabase } from '../supabase/client';
import { useAuth } from './AuthContext';

interface CartItem extends Product {
    quantity: number;
    selectedSize: string;
}

interface ShopContextType {
    products: Product[];
    cart: CartItem[];
    heroSlides: HeroSlide[];
    orders: Order[];
    blogPosts: BlogPost[];
    drops: Drop[];
    socialConfig: SocialConfig;
    attributes: Attribute[];
    attributeValues: AttributeValue[];
    isCartOpen: boolean;
    toggleCart: () => void;
    addToCart: (product: Product, size?: string) => void;
    removeFromCart: (productId: string, size: string) => void;
    updateQuantity: (productId: string, size: string, delta: number) => void;
    updateCartItemSize: (productId: string, currentSize: string, newSize: string) => void;
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (productId: string) => void;
    updateHeroSlides: (slides: HeroSlide[]) => void;
    createOrder: (order: Order) => void;
    updateOrderStatus: (orderId: string, status: 'Pendiente' | 'Confirmado en Mercado' | 'En Camino' | 'Entregado') => void;
    deleteOrder: (orderId: string) => void;
    clearOrders: () => void;
    addBlogPost: (post: BlogPost) => void;
    updateBlogPost: (post: BlogPost) => void;
    deleteBlogPost: (id: string) => void;
    addDrop: (drop: Omit<Drop, 'id'>) => void;
    deleteDrop: (id: string) => void;

    dropsConfig: DropsConfig;
    updateDropsConfig: (config: DropsConfig) => void;

    seasonConfig: SeasonConfig;
    updateSeasonConfig: (config: SeasonConfig) => void;

    updateSocialConfig: (config: SocialConfig) => void;
    cartTotal: number;
    categories: Category[];
    addCategory: (category: Category) => void;
    updateCategory: (category: Category) => void;
    deleteCategory: (categoryId: string) => void;
    deliveryZones: DeliveryZone[];
    addDeliveryZone: (zone: DeliveryZone) => void;
    deleteDeliveryZone: (id: string) => void;
    updateDeliveryZone: (zone: DeliveryZone) => void;
    navbarLinks: NavbarLink[];
    updateNavbarLinks: (links: NavbarLink[]) => void;
    bannerBento: BannerBento[];
    updateBannerBento: (banners: BannerBento[]) => void;
    lifestyleConfig: LifestyleConfig;
    updateLifestyleConfig: (config: LifestyleConfig) => void;
    heroCarouselConfig: HeroCarouselConfig;
    updateHeroCarouselConfig: (config: HeroCarouselConfig) => void;
    footerColumns: FooterColumn[];
    updateFooterColumns: (columns: FooterColumn[]) => void;
    updateCategoryOrder: (orderedIds: string[]) => void;
    saveAllData: () => void;
    loading: boolean;
    favorites: string[];
    toggleFavorite: (productId: string) => void;

    addAttribute: (attribute: Omit<Attribute, 'id'>) => Promise<void>;
    deleteAttribute: (id: string) => Promise<void>;
    addAttributeValue: (value: Omit<AttributeValue, 'id'>) => Promise<void>;
    deleteAttributeValue: (id: string) => Promise<void>;
    updateAttributeValue: (id: string, value: string) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) {
        throw new Error('useShop must be used within a ShopProvider');
    }
    return context;
};

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
    {
        id: 'h1',
        title: 'SAVAGE ESSENCE 2026',
        subtitle: 'REDEFINIENDO EL STREETWEAR PREMIUM URBANO.',
        buttonText: 'EXPLORAR AHORA',
        buttonLink: '/category/Deportivo',
        image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=2000&auto=format&fit=crop'
    }
];

const DEFAULT_SOCIAL_CONFIG: SocialConfig = {
    instagram: 'https://instagram.com/savage',
    tiktok: 'https://tiktok.com/@savage',
    email: 'contacto@savagebrand.com',
    whatsapp: '595983840235',
    address: 'Palermo Soho, Buenos Aires',
    shippingText: 'Envío gratis en compras mayores a 500.000 Gs',
    extraShippingInfo: 'Devoluciones gratis hasta 30 días',
    topHeaderText: 'ENVIOS A TODO EL PAIS 🇵🇾'
};

const DEFAULT_CATEGORIES: Category[] = [
    { id: 'ropa', name: 'Ropa', image: '' },
    { id: 'deportivo', name: 'Deportivo', image: '' },
    { id: 'calzados', name: 'Calzados', image: '' },
    { id: 'joyas', name: 'Joyas', image: '' },
    { id: 'accesorios', name: 'Accesorios', image: '' },
    { id: 'huerfanos', name: 'Huérfanos', image: '' }
];

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Products
    // Products - Now synced with Supabase
    const [products, setProducts] = useState<Product[]>([]);

    // Categories - Now synced with Supabase
    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
    const [categorySortOrder, setCategorySortOrder] = useState<string[]>([]);

    // Cart - Stays in LocalStorage (Cart shouldn't be shared across devices usually unless logged in user, which we don't have yet)
    const [cart, setCart] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('savage_cart');
        return saved ? JSON.parse(saved) : [];
    });

    // Hero List
    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
        const saved = localStorage.getItem('savage_hero_slides');
        return saved ? JSON.parse(saved) : [];
    });

    // Orders
    const [orders, setOrders] = useState<Order[]>(() => {
        const saved = localStorage.getItem('savage_orders');
        return saved ? JSON.parse(saved) : [];
    });

    // Blog
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
        const saved = localStorage.getItem('savage_blog_posts');
        return saved ? JSON.parse(saved) : [];
    });

    // Drops
    const [drops, setDrops] = useState<Drop[]>([]);

    // Attributes
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [attributeValues, setAttributeValues] = useState<AttributeValue[]>([]);

    const addDrop = async (drop: Omit<Drop, 'id'>) => {
        console.log("ShopContext: Adding drop:", drop);
        try {
            const { data, error } = await supabase.from('drops').insert(drop).select().single();
            if (error) throw error;
            if (data) {
                setDrops(prev => [data, ...prev]);
            }
        } catch (error) {
            console.error('Error adding drop:', error);
            alert('Error al guardar drop');
        }
    };

    const deleteDrop = async (id: string) => {
        try {
            const { error } = await supabase.from('drops').delete().match({ id });
            if (error) throw error;
            setDrops(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            console.error('Error deleting drop:', error);
            alert('Error eliminando drop');
        }
    };

    // Social Config
    const [socialConfig, setSocialConfig] = useState<SocialConfig>(() => {
        const saved = localStorage.getItem('savage_social_config');
        return saved ? JSON.parse(saved) : DEFAULT_SOCIAL_CONFIG;
    });

    // Lifestyle Config
    const [lifestyleConfig, setLifestyleConfig] = useState<LifestyleConfig>(() => {
        const saved = localStorage.getItem('savage_lifestyle_config');
        return saved ? JSON.parse(saved) : {
            sectionTitle: 'THE SAVAGE LIFESTYLE',
            sectionSubtitle: 'Únete a la comunidad...',
            buttonText: 'LEER EL BLOG',
            buttonLink: '/blog'
        };
    });

    // Hero Carousel Config
    const [heroCarouselConfig, setHeroCarouselConfig] = useState<HeroCarouselConfig>({ interval: 5000 });

    // Drops Config
    const [dropsConfig, setDropsConfig] = useState<DropsConfig>(() => {
        const saved = localStorage.getItem('savage_drops_config');
        return saved ? JSON.parse(saved) : { isEnabled: false };
    });

    useEffect(() => {
        localStorage.setItem('savage_drops_config', JSON.stringify(dropsConfig));
    }, [dropsConfig]);

    const updateDropsConfig = async (config: DropsConfig) => {
        setDropsConfig(config);
        try {
            const { error } = await supabase.from('store_config').upsert({
                key: 'drops_config',
                value: config,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    // Season Config
    const [seasonConfig, setSeasonConfig] = useState<SeasonConfig>({
        isEnabled: false,
        title: 'SEASON 2026',
        subtitle: 'COLECCIÓN EXCLUSIVA',
        backgroundImage: '',
        productIds: []
    });

    const updateSeasonConfig = async (config: SeasonConfig) => {
        setSeasonConfig(config);
        try {
            const { error } = await supabase.from('store_config').upsert({
                key: 'season_config',
                value: config,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const [footerColumns, setFooterColumns] = useState<FooterColumn[]>(() => {
        const saved = localStorage.getItem('savage_footer_columns');
        return saved ? JSON.parse(saved) : [];
    });

    const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);

    // Favorites Logic
    // Favorites Logic
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<string[]>(() => {
        const saved = localStorage.getItem('savage_favorites');
        return saved ? JSON.parse(saved) : [];
    });

    // 1. Sync DB -> Local when User logs in
    useEffect(() => {
        if (!user) return;

        const syncFavorites = async () => {
            try {
                // Fetch from DB
                const { data, error } = await supabase
                    .from('favorites')
                    .select('product_id')
                    .eq('user_id', user.id);

                if (error) throw error;

                if (data) {
                    const dbIds = data.map(f => f.product_id);
                    // Merge Local + DB (Union)
                    const merged = Array.from(new Set([...favorites, ...dbIds]));

                    // Update Local State
                    setFavorites(merged);

                    // Push missing local items to DB
                    const newToDb = favorites.filter(id => !dbIds.includes(id));
                    if (newToDb.length > 0) {
                        await supabase.from('favorites').insert(
                            newToDb.map(pid => ({ user_id: user.id, product_id: pid }))
                        );
                    }
                }
            } catch (err) {
                console.warn("Error syncing favorites (non-critical):", err);
                // Fallback: Just keep using local favorites without syncing/crashing
            }
        };

        syncFavorites();
    }, [user]); // Run when user changes (login)

    // 2. Persist to LocalStorage always
    useEffect(() => {
        localStorage.setItem('savage_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = async (productId: string) => {
        const isFav = favorites.includes(productId);

        // Optimistic UI Update
        setFavorites(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            }
            return [...prev, productId];
        });

        // DB Update if user is logged in
        if (user) {
            if (isFav) {
                // Remove
                await supabase.from('favorites').delete().match({ user_id: user.id, product_id: productId });
            } else {
                // Add
                await supabase.from('favorites').insert({ user_id: user.id, product_id: productId });
            }
        }
    };

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);



    // --- SUPABASE MIGRATION: FETCH DATA ---
    // --- SUPABASE MIGRATION: FETCH DATA ---
    const fetchData = async () => {
        setLoading(true);

        // 1. PRODUCTS & INVENTORY (Critical)
        try {
            const { data: productsData, error: productsError } = await supabase.from('products').select('*');
            const { data: inventoryData, error: inventoryError } = await supabase.from('inventory').select('*');

            if (inventoryError) console.error('Error fetching inventory:', inventoryError);
            if (productsError) {
                console.error('Error fetching products from Supabase:', productsError);
                if (productsError.code === '42501' || productsError.message.includes('row-level security')) {
                    console.warn('RLS Error on products table. Check Supabase policies.');
                }
            } else if (productsData) {
                setProducts(productsData.map(p => ({
                    ...p,
                    price: Number(p.price),
                    originalPrice: p.original_price ? Number(p.original_price) : undefined,
                    isFeatured: p.is_featured,
                    isCategoryFeatured: p.is_category_featured,
                    isNew: p.is_new,
                    category: p.category || p.Category || p.category_id || p.category_name || '',
                    subcategory: p.subcategory || p.Subcategory || p.sub_category || '',
                    stock: p.stock_quantity,
                    costPrice: Number(p.cost_price || p.unit_cost || 0),
                    imageAlts: p.image_alts,
                    isImported: p.is_imported,
                    visualTag: p.visual_tag,
                    section: p.section_id, // Map DB section_id to Product.section
                    inventory: inventoryData ? inventoryData.filter((i: any) => i.product_id === p.id) : [],
                    isActive: p.is_active ?? true,
                    isOffer: p.is_offer ?? false
                })));
            }
        } catch (e) {
            console.error("Critical Error loading products:", e);
        }

        // 2. CATEGORIES (Important)
        let fetchedCategories: any[] = [];
        try {
            const { data, error } = await supabase.from('categories').select('*');
            if (error) console.error("Error fetching categories:", error);
            if (data) fetchedCategories = data;
        } catch (e) {
            console.error("Critical Error loading categories:", e);
        }

        // 3. STORE CONFIG (Banners, Hero, Links)
        let fetchedSortOrder: string[] = [];
        try {
            const { data: allConfigs, error: anyConfigError } = await supabase.from('store_config').select('*');
            if (anyConfigError) {
                console.error("Error fetching store config:", anyConfigError);
            } else if (allConfigs) {
                allConfigs.forEach(conf => {
                    try {
                        if (conf.key === 'social_config') setSocialConfig(conf.value);
                        if (conf.key === 'navbar_links') setNavbarLinks(conf.value);
                        if (conf.key === 'banner_bento') setBannerBento(conf.value);
                        if (conf.key === 'lifestyle_config') setLifestyleConfig(conf.value);
                        if (conf.key === 'hero_slides') setHeroSlides(conf.value);
                        if (conf.key === 'footer_columns') setFooterColumns(conf.value);
                        if (conf.key === 'hero_carousel_config') setHeroCarouselConfig(conf.value);
                        if (conf.key === 'drops_config') setDropsConfig(conf.value);
                        if (conf.key === 'season_config') setSeasonConfig(conf.value);
                        if (conf.key === 'category_sort_order') {
                            fetchedSortOrder = conf.value as string[];
                            setCategorySortOrder(fetchedSortOrder);
                        }

                    } catch (parseError) {
                        console.warn(`Error parsing config for ${conf.key}`, parseError);
                    }
                });
            }
        } catch (e) {
            console.error("Critical Error loading store config:", e);
        }

        // Logic to set categories AFTER config is loaded
        if (fetchedCategories.length > 0) {
            if (fetchedSortOrder.length > 0) {
                const sorted = [...fetchedCategories].sort((a, b) => {
                    const idxA = fetchedSortOrder.indexOf(a.id);
                    const idxB = fetchedSortOrder.indexOf(b.id);
                    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                    if (idxA !== -1) return -1;
                    if (idxB !== -1) return 1;
                    return 0;
                });
                setCategories(sorted);
            } else {
                setCategories(fetchedCategories);
            }
        }

        // 4. SECONDARY DATA (Orders, Delivery Zones, Blog)
        try {
            const { data: zones } = await supabase.from('delivery_zones').select('*');
            if (zones) setDeliveryZones(zones.map(z => ({ ...z, price: Number(z.price), points: typeof z.points === 'string' ? JSON.parse(z.points) : z.points })));

            const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
            if (orders) setOrders(orders.map(o => ({ ...o, total_amount: Number(o.total_amount), delivery_cost: Number(o.delivery_cost) })));

            const { data: posts } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
            if (posts) setBlogPosts(posts);

            const { data: drops } = await supabase.from('drops').select('*').order('created_at', { ascending: false });
            if (drops) setDrops(drops);

            // 5. ATTRIBUTES (Dynamic funnel)
            const { data: attrData } = await supabase.from('attributes').select('*');
            const { data: valData } = await supabase.from('attribute_values').select('*');
            if (attrData) setAttributes(attrData);
            if (valData) setAttributeValues(valData);

        } catch (secondaryError) {
            console.warn("Non-critical error loading secondary data:", secondaryError);
        } finally {
            setLoading(false);
        }
    };

    // --- ATTRIBUTE CRUD ---
    const addAttribute = async (attribute: Omit<Attribute, 'id'>) => {
        try {
            const { data, error } = await supabase.from('attributes').insert([attribute]).select().single();
            if (error) throw error;
            if (data) setAttributes(prev => [...prev, data]);
        } catch (e) {
            console.error('Error adding attribute:', e);
            alert('Error al añadir atributo');
        }
    };

    const deleteAttribute = async (id: string) => {
        try {
            const { error } = await supabase.from('attributes').delete().eq('id', id);
            if (error) throw error;
            setAttributes(prev => prev.filter(a => a.id !== id));
            setAttributeValues(prev => prev.filter(v => v.attribute_id !== id));
        } catch (e) {
            console.error('Error deleting attribute:', e);
            alert('Error al eliminar atributo');
        }
    };

    const addAttributeValue = async (value: Omit<AttributeValue, 'id'>) => {
        try {
            const { data, error } = await supabase.from('attribute_values').insert([value]).select().single();
            if (error) throw error;
            if (data) setAttributeValues(prev => [...prev, data]);
        } catch (e) {
            console.error('Error adding value:', e);
            alert('Error al añadir valor');
        }
    };

    const deleteAttributeValue = async (id: string) => {
        try {
            const { error } = await supabase.from('attribute_values').delete().eq('id', id);
            if (error) throw error;
            setAttributeValues(prev => prev.filter(v => v.id !== id));
        } catch (e) {
            console.error('Error deleting value:', e);
            alert('Error al eliminar valor');
        }
    };

    const updateAttributeValue = async (id: string, value: string) => {
        try {
            const { error } = await supabase.from('attribute_values').update({ value }).eq('id', id);
            if (error) throw error;
            setAttributeValues(prev => prev.map(v => v.id === id ? { ...v, value } : v));
        } catch (e) {
            console.error('Error updating value:', e);
            alert('Error al actualizar valor');
        }
    };

    useEffect(() => {
        fetchData();

        // Safety timeout to prevent infinite loading (Black Screen Fix)
        const safetyTimer = setTimeout(() => {
            setLoading(false);
        }, 3000); // 3 seconds max loading time

        return () => clearTimeout(safetyTimer);
    }, []);

    // --- END SUPABASE FETCH ---

    // Persistence Effects (Legacy LocalStorage for non-critical stuff or backup)
    useEffect(() => { localStorage.setItem('savage_cart', JSON.stringify(cart)); }, [cart]);
    // useEffect(() => { localStorage.setItem('savage_hero_slides', JSON.stringify(heroSlides)); }, [heroSlides]);
    // useEffect(() => { localStorage.setItem('savage_orders', JSON.stringify(orders)); }, [orders]);
    // useEffect(() => { localStorage.setItem('savage_blog_posts', JSON.stringify(blogPosts)); }, [blogPosts]);
    useEffect(() => { localStorage.setItem('savage_social_config', JSON.stringify(socialConfig)); }, [socialConfig]);
    // Dynamic Favicon Effect
    useEffect(() => {
        if (socialConfig.favicon) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = socialConfig.favicon;
        }
    }, [socialConfig.favicon]);
    // useEffect(() => { localStorage.setItem('savage_delivery_zones', JSON.stringify(deliveryZones)); }, [deliveryZones]);
    // useEffect(() => { localStorage.setItem('savage_orders', JSON.stringify(orders)); }, [orders]);
    // useEffect(() => { localStorage.setItem('savage_blog_posts', JSON.stringify(blogPosts)); }, [blogPosts]);


    // Cart Logic
    const addToCart = (product: Product, size?: string) => {
        const finalSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'One Size');

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id && item.selectedSize === finalSize);
            if (existing) {
                return prev.map(item =>
                    (item.id === product.id && item.selectedSize === finalSize) ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1, selectedSize: finalSize }];
        });
        setIsCartOpen(false); // Disabled auto-open
    };

    const removeFromCart = (productId: string, size: string) => {
        setCart(prev => prev.filter(item => !(item.id === productId && item.selectedSize === size)));
    };

    const updateQuantity = (productId: string, size: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId && item.selectedSize === size) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const updateCartItemSize = (productId: string, currentSize: string, newSize: string) => {
        setCart(prev => {
            // 1. Find the item to update
            const itemToUpdate = prev.find(item => item.id === productId && item.selectedSize === currentSize);
            if (!itemToUpdate) return prev;

            // 2. Check if an item with the NEW size already exists
            const targetItem = prev.find(item => item.id === productId && item.selectedSize === newSize);

            if (targetItem) {
                // MERGE: Remove the old one, update the target one
                return prev.map(item => {
                    if (item.id === productId && item.selectedSize === newSize) {
                        return { ...item, quantity: item.quantity + itemToUpdate.quantity };
                    }
                    return item;
                }).filter(item => !(item.id === productId && item.selectedSize === currentSize));
            } else {
                // JUST UPDATE: Change size
                return prev.map(item =>
                    (item.id === productId && item.selectedSize === currentSize)
                        ? { ...item, selectedSize: newSize }
                        : item
                );
            }
        });
    };

    const toggleCart = () => setIsCartOpen(prev => !prev);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Admin Logic - SUPABASE SYNCED
    const saveInventory = async (productId: string, inventory: { size: string; quantity: number }[]) => {
        if (!inventory || inventory.length === 0) return;
        try {
            // Delete old inventory for this product
            await supabase.from('inventory').delete().eq('product_id', productId);

            // Insert new inventory
            const inserts = inventory.map(item => ({
                product_id: productId,
                size: item.size,
                quantity: item.quantity
            }));

            const { error } = await supabase.from('inventory').insert(inserts);
            if (error) console.error('Error saving inventory:', error);
        } catch (e) {
            console.error('Exception saving inventory:', e);
        }
    };

    const addProduct = async (product: Product): Promise<string | null> => {
        // Optimistic UI update (using the temporary ID passed from Admin)
        setProducts(prev => [...prev, product]);

        try {
            // DB Mapping: OMIT 'id' so Supabase generates a UUID
            const dbProduct = {
                // id: product.id, <--- REMOVED to let DB generate UUID
                savage_id: `SVG-${product.id}`, // Temporary filler using the timestamp, user might want to change this later
                name: product.name,
                price: parseFloat(product.price.toString()),
                original_price: product.originalPrice ? parseFloat(product.originalPrice.toString()) : null,
                category: product.category,
                subcategory: product.subcategory,
                type: product.type,
                images: product.images,
                sizes: product.sizes,
                tags: product.tags,
                fit: product.fit,
                is_new: product.isNew,
                is_featured: product.isFeatured,
                is_category_featured: product.isCategoryFeatured,
                description: product.description,
                stock_quantity: product.stock || 0,
                cost_price: product.costPrice || 0,
                slug: product.slug,
                image_alts: product.imageAlts,
                is_imported: product.isImported,
                visual_tag: product.visualTag,
                section_id: product.section, // Map Level 3
                is_active: product.isActive ?? true,
                is_offer: product.isOffer ?? false
            };

            const { data, error } = await supabase
                .from('products')
                .insert([dbProduct])
                .select()
                .single();

            if (error) {
                console.error('Error adding product to Supabase:', error);

                // Security policy error check
                if (error.code === '42501') {
                    alert('ERROR: Permisos denegados (RLS). Revisa las políticas en Supabase.');
                } else {
                    alert(`Hubo un error guardando en la base de datos: ${error.message}`);
                }

                // Revert optimistic update on error
                setProducts(prev => prev.filter(p => p.id !== product.id));
                return null;
            } else if (data) {
                // Save Attributes
                if (product.selectedAttributes) {
                    const attrInserts = Object.values(product.selectedAttributes)
                        .filter(valId => valId)
                        .map(valId => ({
                            product_id: data.id,
                            attribute_value_id: valId
                        }));
                    if (attrInserts.length > 0) {
                        await supabase.from('product_attribute_values').insert(attrInserts);
                    }
                }

                // Save Inventory
                if (product.inventory) {
                    await saveInventory(data.id, product.inventory);
                }

                // Success! Update the local state with the REAL UUID from the DB
                setProducts(prev => prev.map(p => p.id === product.id ? { ...p, id: data.id } : p));
                return data.id;
            }
            return null;
        } catch (err) {
            console.error(err);
            setProducts(prev => prev.filter(p => p.id !== product.id));
            return null;
        }
    };

    const updateProduct = async (updatedProduct: Product) => {
        // Optimistic UI
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));

        try {
            const dbProduct = {
                name: updatedProduct.name,
                price: parseFloat(updatedProduct.price.toString()),
                original_price: updatedProduct.originalPrice ? parseFloat(updatedProduct.originalPrice.toString()) : null,
                category: updatedProduct.category,
                subcategory: updatedProduct.subcategory,
                type: updatedProduct.type,
                images: updatedProduct.images,
                sizes: updatedProduct.sizes,
                tags: updatedProduct.tags,
                fit: updatedProduct.fit,
                is_new: updatedProduct.isNew,
                is_featured: updatedProduct.isFeatured,
                is_category_featured: updatedProduct.isCategoryFeatured,
                description: updatedProduct.description,
                stock_quantity: updatedProduct.stock || 0,
                cost_price: updatedProduct.costPrice || 0,
                slug: updatedProduct.slug,
                image_alts: updatedProduct.imageAlts,
                is_imported: updatedProduct.isImported,
                visual_tag: updatedProduct.visualTag,
                section_id: updatedProduct.section, // Map Level 3
                is_active: updatedProduct.isActive,
                is_offer: updatedProduct.isOffer
            };

            const { error } = await supabase
                .from('products')
                .update(dbProduct)
                .eq('id', updatedProduct.id);

            if (error) {
                console.error('Error updating product in Supabase:', error);
            } else {
                // Save Attributes
                if (updatedProduct.selectedAttributes) {
                    // Delete existing first
                    await supabase.from('product_attribute_values').delete().eq('product_id', updatedProduct.id);

                    const attrInserts = Object.values(updatedProduct.selectedAttributes)
                        .filter(valId => valId)
                        .map(valId => ({
                            product_id: updatedProduct.id,
                            attribute_value_id: valId
                        }));
                    if (attrInserts.length > 0) {
                        await supabase.from('product_attribute_values').insert(attrInserts);
                    }
                }

                // Update Inventory
                if (updatedProduct.inventory) {
                    await saveInventory(updatedProduct.id, updatedProduct.inventory);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteProduct = async (productId: string) => {
        // Optimistic UI
        const previousProducts = [...products];
        setProducts(prev => prev.filter(p => p.id !== productId));

        try {
            // 1. Manual Cascade: Delete dependencies first
            // Supabase might have foreign key constraints that prevent deleting the product
            // if we don't delete the children first (unless ON DELETE CASCADE is set in DB).
            await supabase.from('inventory').delete().eq('product_id', productId);
            await supabase.from('favorites').delete().eq('product_id', productId);

            // 2. Delete the Product
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) {
                console.error('Error deleting product from Supabase:', error);
                alert(`Error al eliminar de la base de datos: ${error.message}`);
                setProducts(previousProducts); // Revert on specific error
            }
        } catch (err) {
            console.error("Exception deleting product:", err);
            setProducts(previousProducts); // Revert
            alert("Ocurrió un error inesperado al eliminar el producto.");
        }
    };


    const updateHeroSlides = async (slides: HeroSlide[]) => {
        setHeroSlides(slides);
        try {
            const { error } = await supabase.from('store_config').upsert({
                key: 'hero_slides',
                value: slides,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    // Order Logic
    // Order Logic - SUPABASE SYNCED
    const createOrder = async (order: Order) => {
        // Optimistic UI
        setOrders(prev => [order, ...prev]);
        setCart([]); // Clear cart immediately for better UX
        localStorage.removeItem('savage_cart');

        try {
            // SECURITY: Validate Prices against DB (Source of Truth)
            // 1. Extract IDs and Quantities
            const orderItems = order.items as any[] || [];
            const itemMap = new Map<string, number>(); // ID -> Quantity

            orderItems.forEach(item => {
                const qty = item.quantity || 1;
                // Accumulate quantity for same product (diff sizes)
                itemMap.set(item.id, (itemMap.get(item.id) || 0) + qty);
            });

            const productIds = Array.from(itemMap.keys());

            if (productIds.length > 0) {
                // 2. Fetch Fresh Data
                const { data: dbProducts, error: priceError } = await supabase
                    .from('products')
                    .select('id, price, name')
                    .in('id', productIds);

                if (priceError) {
                    console.error("Security Check Failed: Could not fetch product prices.", priceError);
                    // Decide whether to abort or proceed with warning. For security, we should probably abort or use frontend values but flag it.
                    // But blocking the user might be bad if it's just a network glitch. 
                    // However, 'Admin-Only' mode implies high security.
                    // Let's recalculate with what we have if possible, or fail safe.
                    // Continuing with FRONTEND values but logging CRITICAL error.
                }

                if (dbProducts) {
                    // 3. Recalculate Total
                    let calculatedSubtotal = 0;

                    orderItems.forEach(item => {
                        const dbProd = dbProducts.find(p => p.id === item.id);
                        if (dbProd) {
                            const qty = item.quantity || 1;
                            const realPrice = Number(dbProd.price);
                            calculatedSubtotal += (realPrice * qty);
                        } else {
                            console.warn(`Product ${item.id} not found in DB validation. Using frontend price.`);
                            calculatedSubtotal += (item.price * (item.quantity || 1));
                        }
                    });

                    const calculatedTotal = calculatedSubtotal + (order.delivery_cost || 0);

                    // 4. Validate
                    const mismatch = Math.abs(calculatedTotal - order.total_amount) > 100; // 100 Gs margin
                    if (mismatch) {
                        console.warn(`SECURITY ALERT: Price Manipulation Detected! Frontend: ${order.total_amount}, ServerCalc: ${calculatedTotal}. Overwriting with Server Value.`);
                        // Overwrite with correct value
                        order.total_amount = calculatedTotal;
                    } else {
                        console.log(`Security Check Passed: Price Verified (${calculatedTotal})`);
                    }
                }
            }

            const dbOrder = {
                id: order.id,
                display_id: order.display_id,
                // USE VERIFIED TOTAL
                total_amount: order.total_amount,
                delivery_cost: order.delivery_cost,
                status: 'Pendiente', // Force Spanish standard
                items: order.items,
                customer_info: order.customerInfo,
                product_ids: order.product_ids || []
            };

            const { error } = await supabase
                .from('orders')
                .insert([dbOrder]);

            if (error) {
                console.error('Error creating order in Supabase:', error);
                alert('Hubo un error guardando tu pedido en el sistema, pero el enlace de WhatsApp se generó correctamente.');
            }
        } catch (e) {
            console.error('Exception creating order:', e);
        }
    };

    const updateOrderStatus = async (orderId: string, status: 'Pendiente' | 'Confirmado en Mercado' | 'En Camino' | 'Entregado') => {
        // 1. Local State Optimistic Update (Order Status Only)
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));

        try {
            // 2. DB Update (Order Status) with Retry Logic for Enum Casing
            let confirmedStatus = status;
            let dbSuccess = false;
            let errorDetails = null;

            // Helper to attempt update
            const attemptUpdate = async (statusToUse: string) => {
                const { error } = await supabase
                    .from('orders')
                    .update({ status: statusToUse })
                    .eq('id', orderId);
                return error;
            };

            // Attempt 1: As provided (PascalCase usually - Standard 'Entregado')
            let error = await attemptUpdate(status);

            // Retry Logic for Enum Casing (Sequential Fallbacks - Spanish Only)
            if (error && error.code === '22P02') {
                console.warn(`Status '${status}' rejected. Trying UPPERCASE...`);
                // Attempt 2: UPPERCASE
                const upperStatus = status.toUpperCase();
                error = await attemptUpdate(upperStatus);
                if (!error) confirmedStatus = upperStatus as any;
            }

            if (error && error.code === '22P02') {
                console.warn(`Status '${status.toUpperCase()}' rejected. Trying lowercase...`);
                // Attempt 3: lowercase
                const lowerStatus = status.toLowerCase();
                error = await attemptUpdate(lowerStatus);
                if (!error) confirmedStatus = lowerStatus as any;
            }

            if (error) {
                // If all attempts failed
                console.error('Error updating order status in Supabase (All Spanish formats failed):', error);
                alert(`Error CRÍTICO al actualizar estado en Supabase:\n\nMensaje: ${error.message}\nCodigo: ${error.code}\n\nProbamos: ${status}, ${status.toUpperCase()}, ${status.toLowerCase()}.\nNinguno fue aceptado por el Enum. Revise que la columna status acepte 'Entregado'.`);
                return;
            }

            // Success! Proceed with Stock Logic using the confirmed status semantics
            // We map confirmedStatus back to our logical types for the IF checks
            // (Assumes logical 'Entregado' maps to 'ENTREGADO'/'entregado'/'Entregado')
            const isDelivered = confirmedStatus.toLowerCase() === 'entregado' || confirmedStatus.toLowerCase() === 'finalizado';
            const isPending = confirmedStatus.toLowerCase() === 'pendiente';

            // 3. Stock Management Logic
            // FIX: Deduct stock when Order is CONFIRMED or DELIVERED (and not before)
            const currentOrder = orders.find(o => o.id === orderId);
            const oldStatusNormalized = currentOrder?.status?.toLowerCase() || '';
            const newStatusNormalized = confirmedStatus.toLowerCase();

            // States that imply stock has been deducted
            const deductedStates = ['confirmado en mercado', 'en camino', 'entregado', 'finalizado'];
            const wasDeducted = deductedStates.includes(oldStatusNormalized);
            const isTargetState = deductedStates.includes(newStatusNormalized);

            // Trigger deduction only if we are moving TO a deducted state FROM a non-deducted state (e.g. Pendiente)
            if (isTargetState && !wasDeducted && currentOrder && currentOrder.items) {
                console.log(`Deducting stock for Order #${currentOrder.display_id} (Status: ${confirmedStatus})`);

                let updatedCount = 0;

                for (const item of currentOrder.items as any[]) {
                    // 1. Try to find by ID (Standard)
                    let product = products.find(p => p.id === item.id);

                    // 2. Fallback: Try to find by Name
                    if (!product) {
                        product = products.find(p => p.name === item.name);
                    }

                    if (product) {
                        const qtyToDeduct = item.quantity || 1;
                        const sizeToDeduct = item.selectedSize;

                        // A. Deduct from Total Stock
                        const currentStock = product.stock || 0;
                        const newStock = Math.max(0, currentStock - qtyToDeduct);

                        // B. Deduct from Inventory (Size Matrix)
                        if (sizeToDeduct && product.inventory) {
                            const invItem = product.inventory.find(i => i.size === sizeToDeduct);
                            if (invItem) {
                                const newQty = Math.max(0, invItem.quantity - qtyToDeduct);

                                // Update Inventory Table
                                const { error: invError } = await supabase
                                    .from('inventory')
                                    .update({ quantity: newQty })
                                    .eq('id', invItem.id);

                                if (invError) console.error(`Error updating inventory size ${sizeToDeduct} for ${product.name}:`, invError);
                            }
                        }

                        // Update Product Table (Total Stock)
                        const { data: updatedData, error: stockError } = await supabase
                            .from('products')
                            .update({ stock_quantity: newStock })
                            .eq('id', product.id)
                            .select();

                        if (stockError) {
                            console.error('Error updating stock in DB:', stockError);
                        } else {
                            // Local State Update (Complex: Update total stock AND inventory array)
                            setProducts(prev => prev.map(p => {
                                if (p.id === product!.id) {
                                    const updatedInventory = p.inventory?.map(inv =>
                                        inv.size === sizeToDeduct ? { ...inv, quantity: Math.max(0, inv.quantity - qtyToDeduct) } : inv
                                    );
                                    return {
                                        ...p,
                                        stock: updatedData[0].stock_quantity,
                                        inventory: updatedInventory
                                    };
                                }
                                return p;
                            }));
                        }

                        // 4. Register Sale in 'sales' table
                        try {

                            // Determinar precio unitario:
                            // Si el item en el pedido ya tiene precio (snapshot del momento de compra), usarlo.
                            // Si no, usar el precio actual del producto.
                            // Nota: item.price podría no existir si items es un array simple. Asumimos que createOrder guarda precio.
                            const saleUnitPrice = item.price !== undefined ? Number(item.price) : Number(product.price);

                            const saleRecord = {
                                product_id: product.id,
                                quantity: qtyToDeduct,
                                size: item.selectedSize || 'Standard',
                                unit_price: saleUnitPrice,
                                cost_price: product.costPrice || 0,
                                origin: 'web',
                                created_at: new Date().toISOString() // Optional, DB usually handles it
                            };

                            const { error: salesError } = await supabase
                                .from('sales')
                                .insert([saleRecord]);

                            if (salesError) {
                                console.error('Error inserting into sales table:', salesError);
                                // Non-blocking error alert
                                // alert(`Atención: Stock descontado pero error al registrar venta en tabla 'sales': ${salesError.message}`);
                            } else {
                                console.log('Sale registered successfully for', product.name);
                            }

                        } catch (saleErr) {
                            console.error('Exception registering sale:', saleErr);
                        }
                        updatedCount++;
                    } else {
                        console.error(`CRITICO: No se encontró producto para descontar stock: ${item.name} (${item.id})`);
                        alert(`ATENCIÓN: No se pudo descontar el stock de "${item.name}". No se encontró en la base de datos de productos.`);
                    }
                }
                if (updatedCount > 0) {
                    alert(`ÉXITO TOTAL: Estado actualizado a "${confirmedStatus}" y stock descontado de ${updatedCount} productos.`);
                }
            } else if (newStatusNormalized === 'pendiente' && currentOrder) {
                // Restoration Logic (Re-opening order)
                // Restore if coming from a deducted state
                // We re-calculate because we are in a different block scope if I don't lift vars
                // reusing 'currentOrder' and 'oldStatusNormalized' from outer scope

                const wasDeducted = ['confirmado en mercado', 'en camino', 'entregado', 'finalizado'].includes(oldStatusNormalized);

                if (wasDeducted) {
                    for (const item of currentOrder.items as any[]) {
                        let product = products.find(p => p.id === item.id);
                        if (!product) product = products.find(p => p.name === item.name);

                        if (product) {
                            const qtyToAdd = item.quantity || 1;
                            const sizeToAdd = item.selectedSize;
                            const newStock = (product.stock || 0) + qtyToAdd;

                            // Restore Inventory Size
                            if (sizeToAdd && product.inventory) {
                                const invItem = product.inventory.find(i => i.size === sizeToAdd);
                                if (invItem) {
                                    await supabase.from('inventory').update({ quantity: invItem.quantity + qtyToAdd }).eq('id', invItem.id);
                                }
                            }

                            // Restore Product Table
                            const { error: stockError } = await supabase.from('products').update({ stock_quantity: newStock }).eq('id', product.id);

                            if (!stockError) {
                                setProducts(prev => prev.map(p => {
                                    if (p.id === product!.id) {
                                        const updatedInventory = p.inventory?.map(inv =>
                                            inv.size === sizeToAdd ? { ...inv, quantity: inv.quantity + qtyToAdd } : inv
                                        );
                                        return { ...p, stock: newStock, inventory: updatedInventory };
                                    }
                                    return p;
                                }));
                            }
                        }
                    }
                    alert('Stock restaurado porque se reabrió el pedido (Volvió a Pendiente).');
                }
            }

        } catch (e) {
            console.error('Exception updating order status:', e);
        }
    };

    const deleteOrder = async (orderId: string) => {
        const targetId = String(orderId);
        setOrders(prev => {
            const filtered = prev.filter(o => String(o.id) !== targetId);
            return filtered;
        });

        try {
            const { error } = await supabase.from('orders').delete().eq('id', targetId);
            if (error) console.error('Error deleting order:', error);
        } catch (e) {
            console.error(e);
        }
    };

    const clearOrders = async () => {
        setOrders([]);
        localStorage.removeItem('savage_orders');
        try {
            const { error } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (error) console.error('Error clearing all orders:', error);
        } catch (e) {
            console.error(e);
        }
    };

    // Blog Logic
    // Blog Logic - SUPABASE SYNCED
    const addBlogPost = async (post: BlogPost) => {
        setBlogPosts(prev => [post, ...prev]);

        try {
            // Omit ID to let DB generate it, OR use the optimistic one.
            // Let's use optimistic ID if it's UUID, or omit if timestamp.
            // The frontend usually generates "blog-date" or similar.
            // Let's rely on DB UUID for cleanliness, but we need to update local or re-fetch.
            const { data, error } = await supabase
                .from('blog_posts')
                .insert([{
                    title: post.title,
                    content: post.content,
                    image: post.image,
                    rating: post.rating,
                    tag: post.tag,
                    author: post.author
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creating blog post:', error);
                setBlogPosts(prev => prev.filter(p => p.id !== post.id));
            } else if (data) {
                setBlogPosts(prev => prev.map(p => p.id === post.id ? { ...p, id: data.id } : p));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const updateBlogPost = async (updatedPost: BlogPost) => {
        setBlogPosts(prev => prev.map(post => post.id === updatedPost.id ? updatedPost : post));

        try {
            const { error } = await supabase
                .from('blog_posts')
                .update({
                    title: updatedPost.title,
                    content: updatedPost.content,
                    image: updatedPost.image,
                    rating: updatedPost.rating,
                    tag: updatedPost.tag,
                    author: updatedPost.author
                })
                .eq('id', updatedPost.id);

            if (error) console.error('Error updating blog post:', error);
        } catch (e) {
            console.error(e);
        }
    };

    const deleteBlogPost = async (id: string) => {
        setBlogPosts(prev => prev.filter(p => p.id !== id));
        try {
            const { error } = await supabase
                .from('blog_posts')
                .delete()
                .eq('id', id);

            if (error) console.error('Error deleting blog post:', error);
        } catch (e) {
            console.error(e);
        }
    };

    // Social Logic
    const updateSocialConfig = async (config: SocialConfig) => {
        setSocialConfig(config); // Optimistic

        try {
            const { error } = await supabase
                .from('store_config')
                .upsert({
                    key: 'social_config',
                    value: config,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error('Error saving social config to DB:', error);
                throw error;
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    // --- Web Layout Config ---

    const DEFAULT_NAVBAR: NavbarLink[] = [
        { id: 'nav1', label: 'INICIO', path: '/' },
        { id: 'nav2', label: 'DEPORTIVO', path: '/category/Deportivo' },
        { id: 'nav3', label: 'CALZADOS', path: '/category/Calzados' },
        { id: 'nav4', label: 'CLIENTES', path: '/' }
    ];

    const DEFAULT_BANNERS: BannerBento[] = [
        {
            id: 'large',
            title: 'Joyas',
            subtitle: 'Plata esterlina y acero inoxidable. Diseños agresivos para un estilo sin límites.',
            buttonText: 'Ver Colección',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAqGbUj2FJLIGgcAKZAKLYBngrFEDRYfQoeV7VkDrTvzr13ECdtmX2qfvHu6Qd8h9Up5ZVYnAg66Dv1QOA9uM8kN4zE3xiXEEsDqWkYlRgdrn9-7nULwBuow4fqc66fDikz66FszvQXmPZaVivdWb8Urjz5K3eTyglcRqwOmNXSLR2hI_IURHsacCZ16ekg-ZEtzvjJHTnBJn5SM0Xb7JrstUnlakaQ8iAMvY2D23ZbcsDUdHvwFwsWY5KbMOvBFBjhyaDMh0mhrc',
            link: '/category/Joyas'
        },
        {
            id: 'top_right',
            title: 'Ropa',
            buttonText: 'Explorar',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyAeoyNm7zGmNtvPtnOAzDOnFCMqNI5GjDezYSapx09Jzqb2J2YHFfQd-9uyoWu-hCvaOzmQsy6GbAS4FqEzWscWIUzekY1vjZjUwnjojprLpYk0VW2NPY-UofDRuLKAnpsEmj0-8a6BAJ-j_ta15GW7wu9GI3IyZiYO2wt1huNB_KCyaad9JCU4z_eRdOVUxVTBIHxytiKBBJ0aPGEnIwAWjhooQnJzAb2BXKpa842Xhj16wQ9kCXIkW1kP78huM7WzXjvu9sAoM',
            link: '/category/Ropa'
        },
        {
            id: 'bottom_right',
            title: 'Nuevos Ingresos',
            subtitle: 'La última gota',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtj6EY5btq8X5E8_8GCid2GriBY3VTDKQBFQUT1C5CC2AiohgJiQRz0LUBMOku2H8qrVJIPPTVlwnNNIbhzigrSBC9tFulP2vcuiKTE8Y5BnVFWSoauuXZxTs0YHEP1_cbOkJE6KR3vLSsLIj61LOBTteCP5CgxQN7fN_b9kLQkH_-G9Afu1VHCOqdSebpMKz_g4qZvRlX7jmBLrnA-zjE5iBTFCd8mc_hy0FZyuRp1z0f4Ypwb1VP_tXyHN-xQiKQXcTp3i9Rpe0',
            link: '/category/New'
        }
    ];

    const [navbarLinks, setNavbarLinks] = useState<NavbarLink[]>(() => {
        const saved = localStorage.getItem('savage_navbar');
        return saved ? JSON.parse(saved) : DEFAULT_NAVBAR;
    });

    const [bannerBento, setBannerBento] = useState<BannerBento[]>(() => {
        const saved = localStorage.getItem('savage_banners_bento');
        return saved ? JSON.parse(saved) : DEFAULT_BANNERS;
    });

    // ... (rest of file)

    const updateNavbarLinks = async (links: NavbarLink[]) => {
        setNavbarLinks(links);
        try {
            const { error } = await supabase.from('store_config').upsert({
                key: 'navbar_links',
                value: links,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const updateBannerBento = async (banners: BannerBento[]) => {
        setBannerBento(banners);
        try {
            const { error } = await supabase.from('store_config').upsert({
                key: 'banner_bento',
                value: banners,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };


    // --- Footer Config ---


    const updateFooterColumns = async (columns: FooterColumn[]) => {
        setFooterColumns(columns);
        try {
            const { error } = await supabase.from('store_config').upsert({
                key: 'footer_columns',
                value: columns,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };


    const updateLifestyleConfig = async (config: LifestyleConfig) => {
        setLifestyleConfig(config);
        try {
            const { error } = await supabase.from('store_config').upsert({
                key: 'lifestyle_config',
                value: config,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const updateHeroCarouselConfig = async (config: HeroCarouselConfig) => {
        setHeroCarouselConfig(config);
        try {
            const { error } = await supabase.from('store_config').upsert({
                key: 'hero_carousel_config',
                value: config,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };
    // Category Logic - SUPABASE SYNCED
    const addCategory = async (category: Category) => {
        // Optimistic: Append to end
        setCategories(prev => [...prev, category]);

        // Also update sort order
        const newOrder = [...categorySortOrder, category.id];
        setCategorySortOrder(newOrder);

        try {
            // 1. Insert Category
            const { error } = await supabase
                .from('categories')
                .insert([category]);

            if (error) {
                console.error('Error adding category to DB:', error);
                alert('Error al guardar categoría en la nube.');
                // Revert
                setCategories(prev => prev.filter(c => c.id !== category.id));
                return;
            }

            // 2. Update Sort Order Config
            await supabase.from('store_config').upsert({
                key: 'category_sort_order',
                value: newOrder,
                updated_at: new Date().toISOString()
            });

        } catch (e) {
            console.error(e);
        }
    };

    const deleteCategory = async (categoryId: string) => {
        // Prevent deleting 'huerfanos'
        if (categoryId === 'huerfanos') return;

        // Optimistic UI
        setCategories(prev => prev.filter(c => c.id !== categoryId));
        setProducts(prev => prev.map(p =>
            p.category === categoryId
                ? { ...p, category: 'huerfanos', tags: [...p.tags, 'Sin Categoría'] }
                : p
        ));

        // Update Sort Order
        const newOrder = categorySortOrder.filter(id => id !== categoryId);
        setCategorySortOrder(newOrder);

        try {
            // 1. Move products to 'huerfanos' in DB
            // IMPORTANT: 'huerfanos' category MUST exist in the DB for this to work if there is a FK constraint.
            // If it doesn't exist, this might fail or create inconsistent data depending on DB setup.
            // Assuming 'huerfanos' exists or FK is loose.
            const { error: productsError } = await supabase
                .from('products')
                .update({ category: 'huerfanos' })
                .eq('category', categoryId); // Relies on exact match. categoryId comes from UI layer.

            if (productsError) {
                console.error('Error moving products to huerfanos:', productsError);
                throw new Error('No se pudieron mover los productos a Huérfanos.');
            }

            // 2. Delete category
            const { error: deleteError } = await supabase
                .from('categories')
                .delete()
                .eq('id', categoryId);

            if (deleteError) {
                console.error('Error deleting category from DB:', deleteError);
                // If violation of FK, alert specific message
                if (deleteError.code === '23503') { // foreign_key_violation
                    alert('No se pudo eliminar la categoría porque aún tiene productos vinculados. Intenta recargar la página.');
                } else {
                    alert(`Error al eliminar categoría: ${deleteError.message}`);
                }
                // Rollback optimistic update
                const { data: catData } = await supabase.from('categories').select('*');
                if (catData) setCategories(catData);
            } else {
                // 3. Save new sort order
                await supabase.from('store_config').upsert({
                    key: 'category_sort_order',
                    value: newOrder,
                    updated_at: new Date().toISOString()
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const updateCategory = async (updatedCategory: Category) => {
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));

        try {
            const { error } = await supabase
                .from('categories')
                .update(updatedCategory)
                .eq('id', updatedCategory.id);

            if (error) console.error('Error updating category in DB:', error);
        } catch (e) {
            console.error(e);
        }
    };

    const updateCategoryOrder = async (orderedIds: string[]) => {
        setCategorySortOrder(orderedIds);
        // Resort local categories
        setCategories(prev => {
            return [...prev].sort((a, b) => {
                const idxA = orderedIds.indexOf(a.id);
                const idxB = orderedIds.indexOf(b.id);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return 0;
            });
        });

        try {
            const { error } = await supabase.from('store_config').upsert({
                key: 'category_sort_order',
                value: orderedIds,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
        } catch (e) {
            console.error('Error updating category order:', e);
            alert('Error al guardar el orden de categorías');
        }
    };

    // Delivery Zone Logic
    // Delivery Zone Logic - SUPABASE SYNCED
    const addDeliveryZone = async (zone: DeliveryZone) => {
        // Optimistic UI
        setDeliveryZones(prev => [...prev, zone]);

        try {
            console.log('Sending zone to DB:', zone);
            const { data, error } = await supabase
                .from('delivery_zones')
                .insert([{
                    name: zone.name,
                    price: Number(zone.price), // Ensure number
                    points: zone.points,
                    color: zone.color
                }])
                .select()
                .single();

            if (error) {
                console.error('Error adding zone:', error);
                alert(`Error guardando zona en la nube: ${error.message} (${error.details || ''})`);
                setDeliveryZones(prev => prev.filter(z => z.id !== zone.id)); // Revert
            } else if (data) {
                console.log('Zone saved, DB ID:', data.id);
                // Update temp ID with real DB ID
                setDeliveryZones(prev => prev.map(z => z.id === zone.id ? { ...z, id: data.id } : z));
            }
        } catch (e) {
            console.error('Exception adding zone:', e);
            alert('Error inesperado al guardar zona.');
        }
    };

    const deleteDeliveryZone = async (id: string) => {
        // Optimistic
        setDeliveryZones(prev => prev.filter(z => z.id !== id));

        try {
            const { error } = await supabase
                .from('delivery_zones')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting zone:', error);
                alert('No se pudo eliminar la zona de la base de datos.');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const updateDeliveryZone = async (zone: DeliveryZone) => {
        // Optimistic
        setDeliveryZones(prev => prev.map(z => z.id === zone.id ? zone : z));

        try {
            const { error } = await supabase
                .from('delivery_zones')
                .update({
                    name: zone.name,
                    price: Number(zone.price), // Ensure number
                    points: zone.points,
                    color: zone.color
                })
                .eq('id', zone.id);

            if (error) {
                console.error('Error updating zone:', error);
                alert(`Error actualizando zona: ${error.message}`);
                // Revert logic could be complex here, assuming simple success usually.
            }
        } catch (e) {
            console.error(e);
        }
    };



    const saveAllData = () => {
        // Deprecated manual save, but kept for legacy manual triggers if any
    };

    return (
        <ShopContext.Provider value={{
            products,
            cart,
            heroSlides,
            orders,
            blogPosts,
            socialConfig,
            isCartOpen,
            toggleCart,
            addToCart,
            removeFromCart,
            updateQuantity,
            updateCartItemSize,
            addProduct,
            updateProduct,
            deleteProduct,
            updateHeroSlides,
            createOrder,
            updateOrderStatus,
            deleteOrder,
            clearOrders,
            addBlogPost,
            updateBlogPost,
            deleteBlogPost,
            drops,
            addDrop,
            deleteDrop,
            dropsConfig,
            updateDropsConfig,
            seasonConfig,
            updateSeasonConfig,
            updateSocialConfig,

            cartTotal,
            categories,
            addCategory,
            updateCategory,
            deleteCategory,
            updateCategoryOrder,
            deliveryZones,
            addDeliveryZone,
            deleteDeliveryZone,
            updateDeliveryZone,

            navbarLinks,
            updateNavbarLinks,
            bannerBento,
            updateBannerBento,

            lifestyleConfig,
            updateLifestyleConfig,
            footerColumns,
            updateFooterColumns,
            heroCarouselConfig,
            updateHeroCarouselConfig,
            saveAllData,
            loading,
            favorites,
            toggleFavorite,

            attributes,
            attributeValues,
            addAttribute,
            deleteAttribute,
            addAttributeValue,
            deleteAttributeValue,
            updateAttributeValue

        }}>
            {children}
        </ShopContext.Provider>
    );
};
