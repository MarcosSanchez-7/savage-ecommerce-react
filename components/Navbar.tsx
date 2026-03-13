import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, ArrowLeft, Heart, User, ShoppingCart, Menu, ChevronDown, ChevronUp, ChevronRight, Moon, Sun } from 'lucide-react';
import AnnouncementBar from './AnnouncementBar';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

interface NavbarProps {
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount }) => {
  const { toggleCart, addToCart, products, categories, favorites } = useShop();
  const { user, signOut, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [animateCart, setAnimateCart] = useState(false);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof products>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<Record<string, boolean>>({});
  const [expandedDesktopCategories, setExpandedDesktopCategories] = useState<Record<string, boolean>>({});
  const [isMobileSectionsOpen, setIsMobileSectionsOpen] = useState(false);

  const navigate = useNavigate();

  // Search Logic (Fixed to resolve Category Names)
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      if (!Array.isArray(products)) {
        setSearchResults([]);
        return;
      }

      const results = products.filter(p => {
        if (!p) return false;
        if (p.isActive === false) return false;

        const cat = categories.find(c => c && c.id === p.category);
        const sub = categories.find(c => c && c.id === p.subcategory);
        const query = searchQuery.toLowerCase();

        const nameMatch = p.name ? p.name.toLowerCase().includes(query) : false;
        const catMatch = cat && cat.name ? cat.name.toLowerCase().includes(query) : false;
        const subMatch = sub && sub.name ? sub.name.toLowerCase().includes(query) : false;
        const tagMatch = p.tags && Array.isArray(p.tags) ? p.tags.some(tag => tag && tag.toLowerCase().includes(query)) : false;

        return nameMatch || catMatch || subMatch || tagMatch;
      }).slice(0, 50);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, products, categories]);

  // Click Outside Search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductClick = (id: string | number) => {
    navigate(`/product/${id}`);
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
  };

  const handleQuickAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addToCart(product);
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
  };

  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 600);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const handleThemeClick = () => {
    const isDark = theme === 'dark';
    const message = isDark
      ? '¿Cambiar al tema Claro?'
      : '¿Cambiar al tema Oscuro?';

    toast(
      ({ closeToast }) => (
        <div className="flex items-center justify-between gap-4 p-0.5">
          <p className="font-bold text-xs tracking-wide m-0">{message}</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toggleTheme();
                if (closeToast) closeToast();
              }}
              className="bg-primary text-black font-black px-3 py-1.5 rounded-md text-[10px] uppercase hover:scale-105 active:scale-95 transition-all"
            >
              Sí
            </button>
            <button
              onClick={() => { if (closeToast) closeToast(); }}
              className={`border font-bold px-3 py-1.5 rounded-md text-[10px] uppercase hover:scale-105 active:scale-95 transition-all ${theme === 'light' ? 'border-gray-300 text-gray-700 bg-gray-100' : 'border-gray-700 text-gray-300 bg-gray-800'}`}
            >
              No
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        position: "bottom-center",
        className: theme === 'light' ? '!bg-white !text-black border border-gray-200 !min-h-0 !py-2 !px-4' : '!bg-zinc-900 !text-white border border-zinc-800 !min-h-0 !py-2 !px-4'
      }
    );
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim().length > 1) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <AnnouncementBar />
      <nav className={`sticky top-0 z-50 w-full border-b border-border transition-all duration-300 ${theme === 'light' ? 'bg-white shadow-md' : 'bg-black'}`}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between relative gap-4">

          {/* LEFT SECTION: Hamburger (Mobile) / Logo (Desktop) */}
          <div className="flex items-center gap-2 md:gap-4 z-[60] flex-1 justify-start">
            {/* Mobile Menu Icon */}
            <button
              className="md:hidden text-text hover:text-primary transition-colors p-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={26} />
            </button>

            {/* Logo (Desktop) */}
            <Link
              to="/"
              className="hidden md:flex items-center gap-2 group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="size-8 md:size-10 flex items-center justify-center transition-transform group-hover:scale-110">
                <img src="/crown.png" alt="Savage Crown" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] filter brightness-110" />
              </div>
              <h2 className="text-text text-lg md:text-2xl font-black leading-none tracking-widest uppercase transition-colors group-hover:text-primary pt-1">
                SAVAGE
              </h2>
            </Link>
          </div>

          {/* MOBILE LOGO (Centered) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden z-50">
            <Link
              to="/"
              className="flex items-center gap-2"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setIsMobileMenuOpen(false);
              }}
            >
              <div className="size-8 flex items-center justify-center">
                <img src="/crown.png" alt="Savage Crown" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-text text-lg font-black tracking-widest uppercase pt-1">
                SAVAGE
              </h2>
            </Link>
          </div>

          {/* CENTER: Search Bar (Hidden on Mobile, Centered on Desktop) */}
          <div className="hidden md:flex flex-[3] w-full max-w-3xl justify-center relative z-50" ref={searchRef}>
            <div className="w-full relative">
              <form onSubmit={handleSearchSubmit} className={`flex items-center w-full h-11 rounded-full border border-border group ${theme === 'light' ? 'bg-zinc-100 hover:bg-zinc-200' : 'bg-surface hover:bg-white/5'} transition-colors overflow-hidden focus-within:!border-primary focus-within:!bg-background`}>
                <input
                  id="navbar-search-input"
                  type="text"
                  placeholder="¿Qué estás buscando? Escribí aquí..."
                  value={searchQuery}
                  onChange={(e) => {
                     setSearchQuery(e.target.value);
                     setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="flex-1 bg-transparent border-none outline-none px-6 text-sm font-medium text-text placeholder-text-muted h-full"
                />
                {searchQuery && (
                  <button type="button" onClick={() => { setSearchQuery(''); document.getElementById('navbar-search-input')?.focus(); }} className="text-text-muted hover:text-text px-2 h-full flex items-center">
                    <X size={16} />
                  </button>
                )}
                <button type="submit" className="h-full px-5 md:px-8 bg-primary text-black font-black uppercase text-xs md:text-sm tracking-wider hover:bg-primary/80 transition-colors flex items-center justify-center gap-2 border-l border-primary/20">
                  <span className="hidden md:block">BUSCAR</span>
                  <Search size={18} />
                </button>
              </form>

              {/* Desktop Results Dropdown */}
              {isSearchOpen && searchQuery.length > 1 && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                  {searchResults.length > 0 ? (
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      <div className="p-3 bg-background/50 border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider sticky top-0 backdrop-blur-md z-10">
                        Resultados rápidos ({searchResults.length})
                      </div>
                      {searchResults.slice(0, 5).map(product => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product.slug || product.id)}
                          className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-border/50 last:border-0 text-left group cursor-pointer"
                        >
                          <div className="w-14 h-14 overflow-hidden rounded-md bg-background flex-shrink-0">
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-sm text-text uppercase tracking-wide group-hover:text-primary transition-colors line-clamp-1">{product.name}</div>
                            <div className="text-xs text-text-muted font-mono mt-1">Gs. {product.price.toLocaleString()}</div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleQuickAddToCart(e, product)}
                            className="p-3 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-black transition-all active:scale-90"
                            title="Añadir rápido"
                          >
                            <ShoppingCart size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-text-muted text-xs uppercase tracking-widest font-bold">Sin resultados</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SECTION: Icons (Desktop: Theme/Cart, Mobile: Search/Cart/Menu) */}
          <div className="flex items-center justify-end gap-1 md:gap-4 z-[60] flex-1">
            {/* Mobile Search Icon */}
            <button
              className="md:hidden text-text hover:text-primary transition-colors p-2"
              onClick={() => setIsMobileSearchOpen(true)}
            >
              <Search size={22} />
            </button>

            {/* Cart Icon (All) */}
            <button
              onClick={toggleCart}
              className={`relative flex items-center justify-center p-2 text-text hover:text-primary transition-all duration-300 ${animateCart ? 'text-primary scale-125' : ''}`}
            >
              <ShoppingCart size={22} md:size={24} />
              {cartCount > 0 && (
                <span className={`absolute top-0 right-0 bg-primary text-black text-[9px] md:text-[10px] font-bold px-1.5 rounded-full min-w-[14px] md:min-w-[16px] h-[14px] md:h-[16px] flex items-center justify-center border border-black transform translate-x-1 -translate-y-1 transition-transform duration-300 ${animateCart ? 'scale-150 animate-bounce' : 'scale-100'}`}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>



      {/* MOBILE SEARCH OVERLAY (Full Screen) */}
      {isMobileSearchOpen && (
        <div className={`fixed inset-0 z-[200] flex flex-col animate-in fade-in duration-200 ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
          <div className="flex items-center gap-4 p-4 border-b border-border">
            <button onClick={() => setIsMobileSearchOpen(false)} className="text-text hover:text-primary p-1">
              <ArrowLeft size={28} />
            </button>
            <form onSubmit={handleSearchSubmit} className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-full border border-border ${theme === 'light' ? 'bg-zinc-100' : 'bg-surface'}`}>
              <Search size={20} className="text-text-muted" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar productos..."
                className="flex-1 bg-transparent border-none outline-none text-text text-base font-medium placeholder:text-text-muted py-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="text-text-muted">
                  <X size={18} />
                </button>
              )}
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {searchQuery.length > 1 ? (
              searchResults.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {searchResults.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.slug || product.id)}
                      className="flex items-center gap-4 p-2 rounded-xl hover:bg-surface transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text uppercase tracking-wide truncate">{product.name}</p>
                        <p className="text-primary font-bold text-sm mt-0.5">Gs. {product.price.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={(e) => handleQuickAddToCart(e, product)}
                        className="p-3 bg-primary text-black rounded-lg active:scale-95 shadow-lg"
                      >
                        <ShoppingCart size={20} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleSearchSubmit()}
                    className="w-full py-4 mt-2 text-center text-xs font-black text-primary uppercase tracking-[0.2em] border border-primary/20 rounded-xl"
                  >
                    Ver todos los resultados
                  </button>
                </div>
              ) : (
                <div className="py-20 text-center">
                  <Search size={40} className="mx-auto text-text-muted mb-4 opacity-20" />
                  <p className="text-text-muted font-bold uppercase tracking-widest text-sm">Sin resultados para "{searchQuery}"</p>
                </div>
              )
            ) : (
              <div className="py-20 text-center">
                <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Escribe al menos 2 letras para buscar...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className={`fixed inset-0 z-[200] flex flex-col pt-16 animate-in slide-in-from-left duration-300 ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
          <div className="overflow-y-auto w-full custom-scrollbar pb-20">
             <div className="flex w-full shrink-0 bg-background border-t border-gray-800 flex-col shadow-xl z-50 relative mt-4">
               <div className="bg-primary text-black font-black uppercase tracking-wider px-4 py-4 flex items-center gap-2 rounded-t-lg mx-4 mt-4">
                 <span>CATEGORÍAS</span>
               </div>
               <nav className="flex-col py-2 relative px-4">
                 {categories?.filter(c => !c.parent_id && !['HUÉRFANOS', 'HUERFANOS'].includes(c.name.toUpperCase())).map(category => {
                    const subcategories = categories?.filter(c => c.parent_id === category.id) || [];
                    const hasSubcategories = subcategories.length > 0;
                    const isExpanded = expandedMobileCategories[category.id];

                    return (
                      <div key={category.id} className="border-b border-gray-800/30 last:border-0 relative">
                        <div 
                          className="flex flex-1 items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                          onClick={() => {
                            if (hasSubcategories) {
                              setExpandedMobileCategories(prev => ({ ...prev, [category.id]: !prev[category.id] }));
                            } else {
                              navigate(`/category/${category.id}`);
                              setIsMobileMenuOpen(false);
                            }
                          }}
                        >
                          <span className="text-sm font-black uppercase text-gray-300 transition-colors tracking-widest">{category.name}</span>
                          <span className={`${hasSubcategories ? 'text-primary' : 'text-gray-600'} transition-colors`}>
                            {hasSubcategories ? (isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />) : <ChevronRight size={18} />}
                          </span>
                        </div>
                        {hasSubcategories && isExpanded && (
                          <div className="flex flex-col bg-black/50 py-2">
                             <Link 
                               to={`/category/${category.id}`} 
                               className="px-8 py-3 text-xs font-bold uppercase text-primary hover:text-white transition-colors"
                               onClick={() => setIsMobileMenuOpen(false)}
                             >
                               Ver Todo en {category.name}
                             </Link>
                             {subcategories.map(sub => (
                               <Link
                                 key={sub.id}
                                 to={`/category/${sub.id}`}
                                 className="px-8 py-3 text-[11px] font-bold uppercase text-gray-400 hover:text-white transition-colors"
                                 onClick={() => setIsMobileMenuOpen(false)}
                               >
                                 {sub.name}
                               </Link>
                             ))}
                          </div>
                        )}
                      </div>
                    )
                 })}
               </nav>
             </div>
          </div>
          <button 
             onClick={() => setIsMobileMenuOpen(false)} 
             className="absolute top-4 right-4 text-text p-2 bg-gray-900 rounded-full"
          >
             <X size={24} />
          </button>
        </div>
      )}

    </>
  );
};

export default Navbar;
