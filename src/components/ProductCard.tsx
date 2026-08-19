import React, { useState } from 'react';
import { ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { branding, addToCart } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
  const secondaryImage = product.images?.[1] || primaryImage;

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPct = product.discountPercentage || (hasDiscount ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0);
  const isOutOfStock = product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const selectedColor = product.colors?.[selectedColorIdx] || undefined;
    const selectedSize = product.sizes?.[0] || undefined;
    addToCart(product, 1, selectedSize, selectedColor);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group cursor-pointer flex flex-col transition-all duration-300"
      onClick={() => onOpenDetails(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Aspect Ratio [4/5] Rounded-2xl Container */}
      <div className="aspect-[4/5] bg-gray-100 rounded-2xl mb-3 overflow-hidden relative border border-gray-100 shadow-xs">
        
        {/* Main Image with Smooth Zoom */}
        <div
          className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
          style={{ backgroundImage: `url(${isHovered ? secondaryImage : primaryImage})` }}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.badge && (
            <span
              id={`product-badge-${product.id}`}
              className="bg-[#111111] text-[#FACC15] px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest shadow-xs"
            >
              {product.badge}
            </span>
          )}
        </div>

        {hasDiscount && (
          <div
            id={`product-discount-${product.id}`}
            className="absolute top-3 right-3 bg-[#FACC15] text-[#111111] px-2 py-0.5 rounded-sm text-[10px] font-extrabold shadow-xs"
          >
            -{discountPct}%
          </div>
        )}

        {/* Sold Out / Low Stock Indicator */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="text-[#111111] text-xs font-bold tracking-widest uppercase bg-[#FACC15] px-3 py-1 rounded-sm shadow-md">
              Sold Out
            </span>
          </div>
        ) : product.stock <= 5 ? (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-2xs">
              {product.stock} left
            </span>
          </div>
        ) : null}

        {/* Floating Quick Action Overlay */}
        <div className="absolute inset-x-3 bottom-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button
            id={`product-quick-view-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="flex-1 py-2 bg-white/95 hover:bg-white text-[#111111] text-xs font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            aria-label="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>
          
          <button
            id={`product-quick-add-${product.id}`}
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`px-3 py-2 text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : justAdded
                ? 'bg-[#FACC15] text-[#111111]'
                : 'bg-[#111111] hover:bg-black text-[#FACC15]'
            }`}
            aria-label="Quick Add to Bag"
          >
            {justAdded ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Product Details info */}
      <div className="flex flex-col">
        <h4
          id={`product-title-${product.id}`}
          className="font-serif text-sm font-semibold text-[#111111] mb-1 truncate group-hover:text-amber-700 transition-colors"
        >
          {product.name}
        </h4>

        {/* Pricing & Stock status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              id={`product-price-${product.id}`}
              className="text-sm font-bold text-[#111111]"
            >
              {branding.currency}{product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {branding.currency}{product.originalPrice?.toFixed(2)}
              </span>
            )}
          </div>

          {/* Color count or stock badge */}
          {product.colors && product.colors.length > 1 ? (
            <span className="text-[10px] text-gray-400 font-medium">
              {product.colors.length} colors
            </span>
          ) : !isOutOfStock ? (
            <span className="text-[10px] text-green-600 font-bold">
              In Stock
            </span>
          ) : (
            <span className="text-[10px] text-rose-500 font-medium">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
