import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, ArrowLeft, Heart, User, ShoppingCart, Menu, ChevronDown, ChevronUp, ChevronRight, Moon, Sun } from 'lucide-react';
import AnnouncementBar from './AnnouncementBar';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount }) => {
  const { toggleCart, products, categories, favorites } = useShop();
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

  const handleProductClick = (id: string) => {
    navigate(`/product/${id}`);
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
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

  return (
    <>
      <AnnouncementBar />
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between relative">

          {/* LEFT: Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group z-50"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setIsMobileMenuOpen(false);
            }}
          >
            <div className="size-8 md:size-10 flex items-center justify-center transition-transform group-hover:scale-110">
              <img src="/crown.png" alt="Savage Crown" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] filter brightness-110" />
            </div>
            <h2 className="text-white text-xl md:text-2xl font-black leading-none tracking-widest uppercase transition-colors group-hover:text-primary pt-1">
              SAVAGE
            </h2>
          </Link>

          {/* CENTER: Desktop Links */}
          <div className="hidden md:flex flex-1 justify-center items-center h-full gap-8 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl pointer-events-none">
            <div className="flex gap-8 pointer-events-auto h-full items-center">
              <Link to="/" className="h-full flex items-center px-2 text-sm font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors relative group">
                INICIO
                <span className="absolute bottom-6 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>

              {/* Hierarchical Categories Dropdown */}
              <div className="relative group h-full flex items-center">
                <button className="h-full flex items-center px-2 gap-1 text-sm font-bold text-gray-400 group-hover:text-white uppercase tracking-widest transition-colors relative">
                  PRODUCTOS <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                </button>

                {/* Mega Menu Content (Expanded) */}
                <div className="absolute top-[calc(100%-1rem)] -left-[450px] pt-6 hidden group-hover:block z-50">
                  <div className="bg-[#0a0a0a]/95 border border-white/10 rounded-[32px] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.7)] backdrop-blur-3xl animate-in fade-in zoom-in-95 slide-in-from-top-4 flex flex-col gap-10 w-[1100px]">
                    <div className="grid grid-cols-5 gap-x-8 gap-y-12 w-full">
                      {(Array.isArray(categories) ? categories : []).filter(c => c && !c.parent_id && !['HUÉRFANOS', 'HUERFANOS'].includes((c.name || '').toUpperCase())).map(parent => {
                        const children = categories.filter(c => c && String(c.parent_id) === String(parent.id));
                        return (
                          <div key={parent.id} className="space-y-4">
                            <Link
                              to={`/category/${parent.id}`}
                              className="group/cat flex items-center gap-3 text-[12px] font-black tracking-[0.25em] text-white hover:text-primary uppercase transition-colors mb-2"
                            >
                              <span className="w-5 h-[2px] bg-primary/40 group-hover/cat:w-8 group-hover/cat:bg-primary transition-all"></span>
                              {parent.name}
                            </Link>

                            <div className="flex flex-col gap-2 pl-8 border-l border-white/5">
                              {children.length > 0 ? (
                                children.map(child => {
                                  if (!child) return null;
                                  const grandChildren = categories.filter(gc => gc && String(gc.parent_id) === String(child.id));
                                  // If Grandchildren exist, render Child as a Sub-Header, else as a Link

                                  if (grandChildren.length > 0) {
                                    const isExpanded = expandedDesktopCategories[child.id];
                                    return (
                                      <div key={child.id} className="mb-2">
                                        <div className="flex items-center justify-between group/sub mb-1">
                                          <Link
                                            to={`/category/${parent.id}/${child.id}`}
                                            className="text-[11px] font-bold text-gray-400 hover:text-white uppercase tracking-wider block"
                                          >
                                            {child.name}
                                          </Link>
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setExpandedDesktopCategories(prev => ({
                                                ...prev,
                                                [String(child.id)]: !prev[String(child.id)]
                                              }));
                                            }}
                                            className="text-gray-600 hover:text-primary transition-colors p-1 -mr-2"
                                          >
                                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                          </button>
                                        </div>
                                        <div className={`flex flex-col gap-1 pl-2 border-l border-white/5 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                          {grandChildren.map(grand => (
                                            grand ? (
                                              <Link
                                                key={grand.id}
                                                to={`/category/${parent.id}/${grand.id}`}
                                                className="text-[10px] font-medium text-gray-600 hover:text-primary uppercase tracking-wide block transition-colors"
                                              >
                                                {grand.name}
                                              </Link>
                                            ) : null
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }

                                  return (
                                    <Link
                                      key={child.id}
                                      to={`/category/${parent.id}/${child.id}`}
                                      className="text-[12px] font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-all hover:translate-x-2 flex items-center gap-2 group/item"
                                    >
                                      <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 -ml-5 transition-all text-primary" />
                                      {child.name}
                                    </Link>
                                  )
                                })
                              ) : (
                                <span className="text-[10px] text-gray-700 italic tracking-[0.1em] uppercase">...</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <Link to="/nosotros" className="h-full flex items-center px-2 text-sm font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors relative group">
                NOSOTROS
                <span className="absolute bottom-6 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>

              <Link to="/ayuda" className="h-full flex items-center px-2 text-sm font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors relative group">
                AYUDA
                <span className="absolute bottom-6 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
            </div>
          </div>

          {/* RIGHT: Icons */}
          <div className="flex items-center gap-2 md:gap-5 z-50">

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 hover:border-primary/50 text-[10px] font-black tracking-[0.2em] text-white hover:text-primary transition-all group"
              title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
            >
              <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-primary shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'bg-gray-400'} group-hover:scale-110 transition-transform`}></div>
              TEMAS
            </button>

            {/* Desktop Search Trigger */}
            <div ref={searchRef} className="relative hidden md:block">
              <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-64 bg-white/5 border-gray-700 px-3' : 'w-10 border-transparent justify-center'} border rounded-full overflow-hidden h-10`}>
                <button
                  onClick={() => {
                    setIsSearchOpen(!isSearchOpen);
                    if (!isSearchOpen) setTimeout(() => document.getElementById('navbar-search-input')?.focus(), 100);
                  }}
                  className={`text-white hover:text-primary transition-colors ${isSearchOpen ? 'mr-2' : ''}`}
                >
                  <Search size={20} />
                </button>
                <input
                  id="navbar-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="BUSCAR..."
                  className={`bg-transparent border-none outline-none text-xs font-bold text-white placeholder-gray-500 w-full ${isSearchOpen ? 'block' : 'hidden'}`}
                />
                {isSearchOpen && searchQuery && (
                  <button onClick={() => { setSearchQuery(''); document.getElementById('navbar-search-input')?.focus(); }} className="text-gray-500 hover:text-white ml-2">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Desktop Search Results */}
              {isSearchOpen && searchQuery.length > 1 && (
                <div className="absolute top-12 right-0 w-80 bg-[#0a0a0a] border border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                  {searchResults.length > 0 ? (
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      <div className="p-3 bg-white/5 border-b border-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 backdrop-blur-md">
                        Resultados ({searchResults.length})
                      </div>
                      {searchResults.map(product => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-gray-800/50 last:border-0 text-left group"
                        >
                          <div className="w-10 h-12 overflow-hidden rounded bg-gray-900 flex-shrink-0">
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white uppercase tracking-wide group-hover:text-primary transition-colors line-clamp-1">{product.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">Gs. {product.price.toLocaleString()}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500 text-xs uppercase tracking-widest">Sin resultados</div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Search Trigger */}
            <button className="md:hidden text-white hover:text-primary transition-colors p-2" onClick={() => setIsMobileSearchOpen(true)}>
              <Search size={22} />
            </button>

            {/* Favorites & User Icons REMOVED for Catalog Mode */}



            {/* Cart Icon */}
            <button
              onClick={toggleCart}
              className={`relative flex items-center justify-center p-2 text-white hover:text-primary transition-colors ${animateCart ? 'text-primary scale-110' : ''}`}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] h-[14px] flex items-center justify-center border border-black">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-white p-1 ml-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU FULLSCREEN */}
      <div className={`fixed inset-0 bg-background z-[100] transition-transform duration-500 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="size-8">
              <img src="/crown.png" alt="" className="w-full h-full object-contain brightness-110" />
            </div>
            <span className="text-xl font-black text-text tracking-widest">SAVAGE</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-text-muted hover:text-text p-2">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Mobile Theme Toggle */}
          <button
            onClick={() => { toggleTheme(); }}
            className="flex items-center justify-between w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-primary/20 text-primary' : 'bg-zinc-800 text-zinc-400'}`}>
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </div>
              <span className="text-sm font-black tracking-[0.2em] uppercase">CAMBIAR TEMA</span>
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
              {theme === 'dark' ? 'MODO OSCURO' : 'MODO CLARO'}
            </span>
          </button>
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-white uppercase tracking-widest hover:text-primary transition-colors">
            INICIO
          </Link>

          {/* Mobile Categories Accordion */}
          <div>
            <button
              onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
              className="w-full flex items-center justify-between text-2xl font-black text-white uppercase tracking-widest hover:text-primary transition-colors"
            >
              CATEGORÍAS
              {isMobileCategoriesOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>

            <div className={`overflow-hidden transition-all duration-300 flex flex-col gap-6 pl-2 ${isMobileCategoriesOpen ? 'max-h-[800px] mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
              {(Array.isArray(categories) ? categories : []).filter(c => c && !c.parent_id && !['HUÉRFANOS', 'HUERFANOS'].includes((c.name || '').toUpperCase())).map(parent => {
                const children = categories.filter(c => c && String(c.parent_id) === String(parent.id));
                const isExpanded = expandedMobileCategories[String(parent.id)];

                return (
                  <div key={parent.id} className="flex flex-col border-b border-gray-800/30 last:border-0">
                    <div className="flex items-center justify-between py-1">
                      <Link
                        to={`/category/${parent.id}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-lg font-black text-white hover:text-primary uppercase tracking-widest py-2"
                      >
                        {parent.name}
                      </Link>

                      {children.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setExpandedMobileCategories(prev => ({
                              ...prev,
                              [String(parent.id)]: !prev[String(parent.id)]
                            }));
                          }}
                          className="p-3 -mr-3 text-gray-400 hover:text-white active:scale-90 transition-all"
                        >
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      )}
                    </div>

                    {/* Subcategories with smooth transition */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                      <div className="flex flex-col gap-3 pl-4 border-l-2 border-primary/20 ml-1">
                        {children.map(child => {
                          if (!child) return null;
                          const grandChildren = categories.filter(gc => gc && String(gc.parent_id) === String(child.id));
                          const isChildExpanded = expandedMobileCategories[String(child.id)];

                          return (
                            <div key={child.id} className="flex flex-col">
                              <div className="flex items-center justify-between">
                                <Link
                                  to={`/category/${parent.id}/${child.id}`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="text-sm font-bold text-gray-500 hover:text-white uppercase tracking-wider py-1 block"
                                >
                                  {child.name}
                                </Link>
                                {grandChildren.length > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setExpandedMobileCategories(prev => ({
                                        ...prev,
                                        [String(child.id)]: !prev[String(child.id)]
                                      }));
                                    }}
                                    className="p-2 -mr-2 text-gray-600 hover:text-white"
                                  >
                                    {isChildExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </button>
                                )}
                              </div>

                              {/* L3 Grandchildren */}
                              {grandChildren.length > 0 && (
                                <div className={`overflow-hidden transition-all duration-300 pl-4 border-l border-white/10 mt-1 flex flex-col gap-2 ${isChildExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                  {grandChildren.map(grand => (
                                    grand ? (
                                      <Link
                                        key={grand.id}
                                        // Navigate to Parent/Child (Context) but we really want filtering by GrandChild
                                        // CategoryPage now handles drilled down filtering if we pass subcategory=grand.id
                                        // We rely on CategoryPage resolving the scope by ID.
                                        // So we pass: /category/ROOT_ID/GRAND_ID
                                        to={`/category/${parent.id}/${grand.id}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-xs font-bold text-gray-600 hover:text-primary uppercase tracking-wider py-1 block"
                                      >
                                        {grand.name}
                                      </Link>
                                    ) : null
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Link to="/nosotros" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-white uppercase tracking-widest hover:text-primary transition-colors">
            NOSOTROS
          </Link>

          <Link to="/ayuda" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-white uppercase tracking-widest hover:text-primary transition-colors">
            AYUDA
          </Link>

          <div className="mt-8 border-t border-gray-900 pt-8 flex flex-col gap-4">
            {/* Catalog Mode: No user menu */}
          </div>
        </div>
      </div>

      {/* MOBILE SEARCH OVERLAY (Same as before but refined) */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center gap-4 p-4 border-b border-gray-800">
            <button onClick={() => setIsMobileSearchOpen(false)} className="text-gray-400 hover:text-white">
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1 bg-gray-900 rounded-full px-4 py-3 flex items-center gap-2">
              <Search size={18} className="text-gray-500" />
              <input
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-white text-sm font-medium placeholder-gray-500"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-500">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Results Logic same as desktop */}
            {searchQuery.length > 1 && (
              <div className="flex flex-col gap-4">
                {searchResults.length > 0 ? (
                  searchResults.map(p => (
                    <button key={p.id} onClick={() => handleProductClick(p.id)} className="flex gap-4 items-center">
                      <div className="w-16 h-20 bg-gray-900 rounded-md overflow-hidden">
                        <img src={p.images[0]} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold text-sm uppercase line-clamp-2">{p.name}</p>
                        <p className="text-primary font-bold text-sm mt-1">Gs. {p.price.toLocaleString()}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-500 text-sm mt-10">No se encontraron resultados</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </>
  );
};

export default Navbar;
