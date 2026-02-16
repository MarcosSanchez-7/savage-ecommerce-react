
import React from 'react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  showCategoryTag?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, showCategoryTag }) => {
  const navigate = useNavigate();
  // Favorites removed
  // const { favorites, toggleFavorite } = useShop();
  // const isFavorite = favorites.includes(product.id);

  const totalStock = product.inventory && product.inventory.length > 0
    ? product.inventory.reduce((acc, curr) => acc + Number(curr.quantity), 0)
    : product.stock || 0;

  const isTotallyOutOfStock = !product.isImported && totalStock <= 0;
  const isImported = product.isImported;

  return (
    <div className="group flex flex-col gap-3">
      <div
        className="relative w-full aspect-[3/4] overflow-hidden rounded bg-surface-dark group cursor-pointer"
        onClick={() => navigate(`/product/${product.slug || product.id}`)}
      >
        <div className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-110">
          <img
            src={product.images[0]}
            alt={
              (product.name.toLowerCase().includes('camiseta') || product.category.toLowerCase().includes('ropa'))
                ? `Camiseta de fútbol ${product.name} - Savage Store Paraguay`
                : `${product.name} - Savage Store Paraguay`
            }
            className={`w-full h-full ${product.type === 'footwear' ? 'object-contain' : 'object-cover'} ${isTotallyOutOfStock ? 'grayscale opacity-50' : ''}`}
          />
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt={`${product.name} vista alternativa`}
              className={`absolute inset-0 w-full h-full transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${product.type === 'footwear' ? 'object-contain' : 'object-cover'} ${isTotallyOutOfStock ? 'grayscale opacity-50' : ''}`}
            />
          )}
        </div>

        {/* Favorite Button */}
        {/* Favorite Button Removed */}

        {/* Sold Out Overlay */}
        {isTotallyOutOfStock && (
          <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
            <span className="bg-black text-white font-black px-4 py-2 uppercase tracking-widest text-sm border-2 border-white transform -rotate-12 shadow-xl">
              AGOTADO
            </span>
          </div>
        )}


        {!isTotallyOutOfStock && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="absolute bottom-3 right-3 bg-white text-black p-2.5 rounded-full transition-all duration-300 hover:scale-110 hover:bg-black hover:text-white shadow-xl z-10 flex items-center justify-center"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
          </button>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {product.isImported && (
            <>
              <div className="bg-blue-600 text-white text-[8px] md:text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter rounded-sm flex items-center gap-1 shadow-lg border border-blue-400/20">
                <span className="material-symbols-outlined text-[10px] md:text-xs">globe</span>
                IMPORTADO
              </div>
              <div className="bg-white/95 backdrop-blur-sm text-blue-600 text-[8px] md:text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter rounded-sm flex items-center gap-1 shadow-lg border border-blue-100">
                BAJO PEDIDO
              </div>
              <div className="bg-black/90 backdrop-blur-sm text-gray-300 text-[8px] md:text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter rounded-sm flex items-center gap-1 shadow-lg border border-gray-800">
                25-30 DÍAS
              </div>
            </>
          )}
          {product.isNew && (
            <div className="bg-primary text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 uppercase tracking-wider rounded-sm">
              Nuevo
            </div>
          )}
          {product.visualTag && product.visualTag.text && (
            <div
              className="text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 uppercase tracking-wider rounded-sm shadow-md"
              style={{ backgroundColor: product.visualTag.color, color: '#fff' }}
            >
              {product.visualTag.text}
            </div>
          )}
          {product.tags && product.tags
            .filter(tag => {
              const t = tag.trim().toUpperCase();
              return !['SIN CATEGORIA', 'SIN CATEGORÍA', 'NUEVO', 'NEW'].includes(t);
            })
            .map(tag => (
              <div key={tag} className="bg-black/70 backdrop-blur-md text-white border border-white/20 text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 uppercase tracking-wider rounded-sm">
                {tag}
              </div>
            ))}
        </div>

        {/* Category Tag Overlay (Featured only) */}
        {showCategoryTag && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/category/${product.category}`);
            }}
            className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-black text-[8px] md:text-[10px] font-bold px-2 py-1 md:px-3 md:py-1.5 uppercase tracking-wider rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors z-20 flex items-center gap-1"
          >
            {product.category} <span className="material-symbols-outlined text-[10px]">arrow_outward</span>
          </button>
        )}

        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
            <div className="bg-red-600 text-white text-[8px] md:text-[10px] font-black px-2 py-1 uppercase tracking-widest rounded-sm z-20 animate-pulse shadow-lg">
              OFERTA
            </div>
            <div className="bg-black/80 backdrop-blur-md text-primary text-[8px] md:text-[10px] font-black px-2 py-1 uppercase tracking-widest rounded-sm z-20 border border-primary/20">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mt-2">
        <div className="flex-1">
          <h3
            className="text-text text-sm sm:text-base lg:text-lg font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer line-clamp-2"
            onClick={() => navigate(`/product/${product.slug || product.id}`)}
          >
            {product.name}
            {(product.name.length < 25 && (product.category.toLowerCase().includes('camiseta') || product.name.toLowerCase().includes('camiseta'))) && (
              <span className="hidden opacity-0 w-0 h-0"> - Camiseta de Fútbol Premium</span>
            )}
          </h3>
          <p className="text-text-muted text-[10px] md:text-xs uppercase tracking-wide mt-1 flex items-center gap-1">
            {product.subcategory || product.category}
            {product.isCategoryFeatured && <Star size={10} className="text-primary fill-primary" />}
          </p>
        </div>
        <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
          <p className={`font-bold text-sm md:text-base ${product.originalPrice && product.originalPrice > product.price ? 'text-primary' : 'text-text'}`}>
            Gs. {product.price.toLocaleString()}
          </p>
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-text-muted line-through text-[10px] md:text-xs font-normal">Gs. {product.originalPrice.toLocaleString()}</p>
          )}
        </div>
      </div>
    </div >
  );
};

export default ProductCard;
