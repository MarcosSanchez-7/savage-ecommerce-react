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
    // If subcategory is present, it's that. Otherwise it's category.
    const [currentScopeId, setCurrentScopeId] = React.useState<string>('');

    React.useEffect(() => {
        if (subcategory) {
            setCurrentScopeId(subcategory);
        } else if (category) {
            // Find the category object to resolve ID (validation)
            const catObj = categories.find(c => c.id.toLowerCase() === category.toLowerCase() || c.name.toLowerCase() === category.toLowerCase());
            if (catObj) setCurrentScopeId(catObj.id);
        }
        window.scrollTo(0, 0);
    }, [category, subcategory, categories]);

    const currentCategoryInfo = categories.find(c => c.id === currentScopeId);

    // Find parent for "Back" navigation or breadcrumbs
    const parentCategory = currentCategoryInfo?.parent_id
        ? categories.find(c => c.id === currentCategoryInfo.parent_id)
        : null;

    // Helper: Get all descendant IDs recursively
    const getDescendants = (rootId: string): Set<string> => {
        const descendants = new Set<string>();
        const stack = [rootId];
        while (stack.length > 0) {
            const current = stack.pop()!;
            descendants.add(current);
            const children = categories.filter(c => c.parent_id === current);
            children.forEach(c => stack.push(c.id));
        }
        return descendants;
    };

    // Filter Products
    const categoryProducts = React.useMemo(() => {
        if (!currentScopeId) return [];
        const allowedIds = getDescendants(currentScopeId);

        return products
            .filter(p => {
                // Check if product's category OR subcategory is in the allowed set of descendants
                // This covers cases where product is directly assigned to the current node 
                // OR assigned to a deep child of the current node.
                const catMatch = allowedIds.has(p.category);
                const subMatch = p.subcategory && allowedIds.has(p.subcategory);
                return catMatch || subMatch;
            })
            .sort((a, b) => {
                if (a.isCategoryFeatured !== b.isCategoryFeatured) return a.isCategoryFeatured ? -1 : 1;
                return b.id.localeCompare(a.id);
            });
    }, [products, currentScopeId, categories]);

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    // SEO
    const getSEOInfo = (catInfo: typeof categories[0] | undefined) => {
        if (!catInfo) return { title: 'Categoría', desc: '', docTitle: 'Savage Store' };
        const name = catInfo.name.toLowerCase();

        return {
            title: catInfo.name,
            desc: `Explora nuestra colección de ${catInfo.name}.`,
            docTitle: `${catInfo.name} - Savage Store Paraguay`
        };
    };
    const seoInfo = getSEOInfo(currentCategoryInfo);
    React.useEffect(() => document.title = seoInfo.docTitle, [seoInfo]);

    // Subcategories for Filter Pills (Direct Children of Current Scope)
    const directChildren = categories.filter(c => c.parent_id === currentScopeId);

    // Navigation Handler for Pills
    const handleSubcategoryClick = (subId: string) => {
        // If we represent hierarchy in URL:
        // Case 1: Root -> Child (standard) => /category/root/child
        // Case 2: Root -> Child -> Grandchild => /category/root/grandchild ? 
        //         OR /category/child/grandchild ?
        // Since WebRoutes is /category/:category/:subcategory, we have 2 slots.
        // We can try to keep the first slot as the "Root Context" if possible, or just shift.

        // If current is Root, next is /category/root/subId.
        if (!currentCategoryInfo?.parent_id) {
            navigate(`/category/${currentCategoryInfo?.id}/${subId}`);
        } else {
            // We are already deep. 
            // Option A: Replace subcategory slot: /category/ROOT/GRANDCHILD_ID
            // This requires knowing ROOT.
            // Let's find the ultimate root.
            let root = currentCategoryInfo;
            while (root?.parent_id) {
                const found = categories.find(c => c.id === root?.parent_id);
                if (found) root = found;
                else break;
            }
            if (root) {
                navigate(`/category/${root.id}/${subId}`);
            } else {
                // Fallback
                navigate(`/category/${category}/${subId}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-background-dark text-white selection:bg-primary selection:text-white">
            <Navbar cartCount={cartCount} />

            <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
                <div className="flex items-center gap-4 mb-8">
                    {/* Back Button Logic */}
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
                            {/* Breadcrumb hint could go here */}
                        </h1>
                        <p className="text-accent-gray text-sm mt-1">{seoInfo.desc}</p>
                    </div>
                </div>

                {/* Subcategories Filter (Children of Current Scope) */}
                {directChildren.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-12 animate-in fade-in slide-in-from-left-4 duration-500 overflow-x-auto pb-4 scrollbar-hide">
                        {/* Optional 'All' button if we want to reset to parent? No, we are IN parent. */}
                        {directChildren.map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => handleSubcategoryClick(sub.id)}
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
