
import React from 'react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const navigate = useNavigate();

  return (
    <div className="group flex flex-col gap-3">
      <div
        className="relative w-full aspect-[3/4] overflow-hidden rounded bg-surface-dark group cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url('${product.images[0]}')` }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white shadow-lg z-10"
        >
          <span className="material-symbols-outlined">shopping_bag</span>
        </button>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <div className="bg-primary text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
              Nuevo
            </div>
          )}
          {product.tags && product.tags.filter(t => !['SIN CATEGORIA', 'SIN CATEGORÍA'].includes(t.toUpperCase())).map(tag => (
            <div key={tag} className="bg-black/70 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
              {tag}
            </div>
          ))}
        </div>

        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-3 right-3 bg-red-800 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
          </div>
        )}
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h3
            className="text-white text-lg font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            {product.name}
          </h3>
          <p className="text-accent-gray text-xs uppercase tracking-wide mt-1">
            {product.category}
          </p>
        </div>
        <div className="text-right">
          <p className={`font-medium ${product.originalPrice && product.originalPrice > product.price ? 'text-primary' : 'text-white'}`}>
            Gs. {product.price.toLocaleString()}
          </p>
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-gray-500 line-through text-xs font-normal">Gs. {product.originalPrice.toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
