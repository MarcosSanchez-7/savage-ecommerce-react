import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { ArrowLeft } from 'lucide-react';

const CategoryPage: React.FC = () => {
    const { category, subcategory } = useParams<{ category: string; subcategory?: string }>();
    const navigate = useNavigate();
    const { products, categories, addToCart, cart } = useShop();

    // The "Current" Category Node we are viewing.
    const [currentScopeId, setCurrentScopeId] = React.useState<string>('');

    // 1. Resolve Scope safely handling Numeric/String IDs
    React.useEffect(() => {
        let foundId = '';

        if (subcategory) {
            // Try to find subcategory by ID or Name
            const subObj = categories.find(c => String(c.id).toLowerCase() === subcategory.toLowerCase() || c.name.toLowerCase() === subcategory.toLowerCase());
            if (subObj) foundId = String(subObj.id);
            else foundId = subcategory; // Fallback to param if not found (though less likely to match)
        } else if (category) {
            // Find the category object to resolve ID (validation)
            const catObj = categories.find(c => String(c.id).toLowerCase() === category.toLowerCase() || c.name.toLowerCase() === category.toLowerCase());
            if (catObj) foundId = String(catObj.id);
        }

        setCurrentScopeId(foundId);
        window.scrollTo(0, 0);
    }, [category, subcategory, categories]);

    const currentCategoryInfo = categories.find(c => String(c.id) === currentScopeId);

    // Find parent for "Back" navigation
    const parentCategory = currentCategoryInfo?.parent_id
        ? categories.find(c => String(c.id) === String(currentCategoryInfo.parent_id))
        : null;

    // 2. Recursive Descendant Fetcher (Safe String Ids)
    const getDescendants = React.useCallback((rootId: string): Set<string> => {
        if (!Array.isArray(categories)) return new Set();
        const descendants = new Set<string>();
        if (!rootId) return descendants;

        const stack = [String(rootId)];

        // Safety Break
        let iterations = 0;
        const MAX_ITERATIONS = 5000;

        while (stack.length > 0 && iterations < MAX_ITERATIONS) {
            iterations++;
            const current = stack.pop()!;

            if (descendants.has(current)) continue;
            descendants.add(current);

            // Find children: MUST convert c.parent_id to String for comparison
            const children = categories.filter(c => c && String(c.parent_id) === current);
            children.forEach(c => stack.push(String(c.id)));
        }
        return descendants;
    }, [categories]);

    // 3. Filter Products using Descendants
    const categoryProducts = React.useMemo(() => {
        if (!currentScopeId) return [];
        if (!Array.isArray(products)) return [];

        const allowedIds = getDescendants(currentScopeId);

        return products
            .filter(p => {
                if (!p) return false;
                if (p.isActive === false) return false;
                // String conversion for potentially numeric DB IDs
                const pCat = p.category ? String(p.category) : '';
                const pSub = p.subcategory ? String(p.subcategory) : '';
                const pSec = p.section ? String(p.section) : '';

                return allowedIds.has(pCat) || allowedIds.has(pSub) || allowedIds.has(pSec);
            })
            .sort((a, b) => {
                // Feature sort priority
                if (a.isCategoryFeatured !== b.isCategoryFeatured) return a.isCategoryFeatured ? -1 : 1;
                // Newest first (assuming ID or timestampish)
                return String(b.id).localeCompare(String(a.id));
            });
    }, [products, currentScopeId, getDescendants]);

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    // 4. SEO Info
    const getSEOInfo = (catInfo: typeof categories[0] | undefined) => {
        if (!catInfo) return { title: 'Categoría', desc: '', docTitle: 'Savage Store' };

        return {
            title: catInfo.name,
            desc: `Explora nuestra colección de ${catInfo.name}.`,
            docTitle: `${catInfo.name} - Savage Store Paraguay`
        };
    };
    const seoInfo = getSEOInfo(currentCategoryInfo);
    React.useEffect(() => { document.title = seoInfo.docTitle; }, [seoInfo]);

    // 5. Dynamic Pills: Direct Children of Current Scope
    const directChildren = React.useMemo(() => {
        return categories.filter(c => c && String(c.parent_id) === currentScopeId);
    }, [categories, currentScopeId]);

    // Navigation Handler
    const handleNavigation = (targetId: string) => {
        // Construct URL logic
        // If we are at root, go to /category/root/target
        // If we are at root/child, we want to go deeper? 
        // Our Router only supports :category and :subcategory (2 params).
        // If we click a 3rd level item, we MUST rely on the logic that "CategoryPage" detects the scope by ID.
        // So we can put the targetID in the second slot.
        // /category/ROOT_ID/TARGET_ID
        // We need to find the ROOT ID of the target.

        let root = categories.find(c => String(c.id) === targetId);
        // Climb up to find the top parent (L1)
        let safeLoop = 0;
        while (root && root.parent_id && safeLoop < 10) {
            const parent = categories.find(p => String(p.id) === String(root!.parent_id));
            if (parent) root = parent;
            else break;
            safeLoop++;
        }

        if (root) {
            navigate(`/category/${root.id}/${targetId}`);
        } else {
            // Fallback
            navigate(`/category/${category}/${targetId}`);
        }
    };

    return (
        <div className="min-h-screen bg-background-dark text-white selection:bg-primary selection:text-white">
            <Navbar cartCount={cartCount} />

            <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
                <div className="flex items-center gap-4 mb-8">
                    {parentCategory ? (
                        <Link to={`/category/${parentCategory.id}`} className="text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                    ) : (
                        <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                    )}

                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tight flex items-center gap-2">
                            {seoInfo.title}
                        </h1>
                        <p className="text-accent-gray text-sm mt-1">{seoInfo.desc}</p>
                    </div>
                </div>

                {/* Direct Children Pills */}
                {directChildren.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-12 animate-in fade-in slide-in-from-left-4 duration-500 overflow-x-auto pb-4 scrollbar-hide">
                        {directChildren.map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => handleNavigation(sub.id)}
                                className="whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all bg-transparent border-white/10 text-gray-500 hover:border-white/20 hover:text-white hover:bg-white/5"
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                )}

                {categoryProducts.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {categoryProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={() => addToCart(product)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-surface-dark border border-gray-800 rounded-xl">
                        <p className="text-gray-500 text-lg">No hay productos en esta sección.</p>
                        {directChildren.length > 0 && <p className="text-xs text-gray-600 mt-2 font-bold uppercase">Selecciona una subcategoría arriba</p>}
                        <Link to="/" className="text-primary hover:underline mt-4 inline-block font-bold">Volver al Inicio</Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default CategoryPage;


