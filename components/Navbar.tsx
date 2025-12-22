import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';

interface NavbarProps {
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount }) => {
  const { toggleCart, navbarLinks } = useShop();
  const [animateCart, setAnimateCart] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#333] bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-8 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-3xl">diamond</span>
          </div>
          <h2 className="text-white text-2xl font-black leading-none tracking-widest uppercase transition-colors group-hover:text-primary pt-1">
            SAVAGE
          </h2>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex flex-1 justify-center gap-10">
          {navbarLinks.map(link => (
            <Link
              key={link.id}
              className="text-gray-300 hover:text-white hover:font-bold transition-all text-sm font-medium uppercase tracking-widest"
              to={link.path}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="flex md:hidden p-2 text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>

          <button
            onClick={toggleCart}
            className={`relative flex items-center justify-center w-10 h-10 rounded hover:bg-white/10 transition-colors ${animateCart ? 'text-primary' : 'text-white'}`}
          >
            <span className={`material-symbols-outlined transition-transform duration-300 ${animateCart ? 'scale-125' : 'scale-100'}`}>
              shopping_bag
            </span>

            {cartCount > 0 && (
              <span className={`absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center transition-transform duration-300 ${animateCart ? 'scale-125' : 'scale-100'}`}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
