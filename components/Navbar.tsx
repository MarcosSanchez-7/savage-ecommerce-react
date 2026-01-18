import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, ArrowLeft, Heart, User, ShoppingBag, Menu, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import AnnouncementBar from './AnnouncementBar';

interface NavbarProps {
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount }) => {
  const { toggleCart, products, categories, favorites } = useShop();
  const { user, signOut, isAdmin } = useAuth();

  // Hide "HUÉRFANOS" from public menu (Catalog Mode)
  const visibleCategories = categories
    .filter(c => !['HUÉRFANOS', 'HUERFANOS'].includes(c.name.toUpperCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

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

  const navigate = useNavigate();

  // Search Logic
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const results = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subcategory?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, products]);

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
      <nav className="sticky top-0 z-50 w-full border-b border-[#333] bg-[#0a0a0a]/80 backdrop-blur-md">
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

              {/* Categories Dropdown */}
              <div className="relative group h-full flex items-center">
                <button className="h-full flex items-center px-2 gap-1 text-sm font-bold text-gray-400 group-hover:text-white uppercase tracking-widest transition-colors relative">
                  CATEGORÍAS <ChevronDown size={14} />
                </button>

                {/* Dropdown Content */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-0 hidden group-hover:block min-w-[220px] z-50">
                  <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-2 shadow-2xl flex flex-col gap-1 backdrop-blur-md mt-0 animate-in fade-in slide-in-from-top-2">
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0a0a0a] border-t border-l border-gray-800 transform rotate-45"></div>
                    {visibleCategories.map(cat => (
                      <div key={cat.id} className="relative group/sub">
                        <Link
                          to={`/category/${cat.id}`}
                          className="flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-lg text-xs font-bold text-gray-300 hover:text-primary uppercase tracking-wider transition-colors w-full"
                        >
                          {cat.name}
                          {cat.subcategories && cat.subcategories.length > 0 && <ChevronRight size={12} className="text-gray-500 group-hover/sub:text-primary" />}
                        </Link>

                        {/* Subcategories Flyout */}
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <div className="absolute left-full top-0 pl-2 hidden group-hover/sub:block min-w-[180px] z-[60]">
                            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-2 shadow-2xl flex flex-col gap-1 backdrop-blur-md animate-in fade-in slide-in-from-left-2">
                              {cat.subcategories.map(sub => (
                                <Link
                                  key={sub}
                                  to={`/category/${cat.id}/${sub}`}
                                  className="px-4 py-2 hover:bg-white/5 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors block"
                                >
                                  {sub}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
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
          <div className="flex items-center gap-2 md:gap-6 z-50">

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
              <ShoppingBag size={22} />
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
      <div className={`fixed inset-0 bg-black z-[100] transition-transform duration-500 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-900">
          <div className="flex items-center gap-2">
            <div className="size-8">
              <img src="/crown.png" alt="" className="w-full h-full object-contain brightness-110" />
            </div>
            <span className="text-xl font-black text-white tracking-widest">SAVAGE</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white p-2">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
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

            <div className={`overflow-hidden transition-all duration-300 flex flex-col gap-4 pl-4 ${isMobileCategoriesOpen ? 'max-h-[500px] mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
              {visibleCategories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-bold text-gray-400 hover:text-white uppercase tracking-wider"
                >
                  {cat.name}
                </Link>
              ))}
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
