import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, Check, ShieldCheck, Truck, RotateCcw, Plus, Minus, Zap, Info } from 'lucide-react';
import { Product, ProductColor } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { branding, addToCart, setIsCheckoutOpen } = useStore();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [showReturnPolicy, setShowReturnPolicy] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedSize(product.sizes?.[0] || '');
      setSelectedColor(product.colors?.[0] || undefined);
      setQuantity(1);
      setAddedAnimation(false);
      setShowReturnPolicy(false);
    }
  }, [product]);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPct = product.discountPercentage || (hasDiscount ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    onClose();
    setIsCheckoutOpen(true);
  };

  return (
    <div
      id="product-detail-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="product-detail-modal-container"
        className="relative bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-product-detail-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-black bg-white/90 hover:bg-gray-100 rounded-full transition-colors shadow-2xs cursor-pointer"
          aria-label="Close Product Details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-10">
          
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col gap-3">
            {/* Main Stage Image */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100 rounded-2xl border border-gray-100 shadow-xs">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-center transition-all duration-500"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 bg-gray-950 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md shadow-sm">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-20 shrink-0 rounded-xl border overflow-hidden transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-blue-600 ring-2 ring-blue-500 ring-offset-1 shadow-xs'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Purchase Form */}
          <div className="flex flex-col justify-between space-y-5">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-gray-400 uppercase tracking-widest font-mono">
                <span className="font-bold text-blue-600">{product.category}</span>
                <span>ID: {product.id}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-800">
                  {product.rating ? product.rating.toFixed(1) : '5.0'}
                </span>
                <span className="text-xs text-gray-400">
                  ({product.reviewCount || 18} reviews)
                </span>
              </div>

              {/* Price Section */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {branding.currency}{product.price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-gray-400 line-through">
                      {branding.currency}{product.originalPrice?.toFixed(2)}
                    </span>
                    <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-md border border-rose-100">
                      SAVE {discountPct}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock Indicator */}
              <div className="mt-2.5 flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOutOfStock ? 'bg-rose-500' : product.stock <= 5 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
                <span className="text-xs font-semibold text-gray-600">
                  {isOutOfStock
                    ? 'Currently Out of Stock'
                    : product.stock <= 5
                    ? `Low Inventory: Only ${product.stock} units remaining`
                    : `In Stock (${product.stock} units ready to ship)`}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 leading-relaxed mt-4 pt-4 border-t border-gray-100">
                {product.description}
              </p>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-gray-800 uppercase tracking-wide text-[10px]">
                      Color: <span className="font-medium text-gray-600">{selectedColor?.name}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.colors.map((color, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => setSelectedColor(color)}
                        className={`group relative flex items-center justify-center p-0.5 rounded-full transition-all cursor-pointer ${
                          selectedColor?.name === color.name
                            ? 'ring-2 ring-blue-600 ring-offset-2 scale-110'
                            : 'hover:scale-105'
                        }`}
                        title={color.name}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-gray-300 shadow-2xs"
                          style={{ backgroundColor: color.hex }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-gray-800 uppercase tracking-wide text-[10px]">
                      Size: <span className="font-medium text-gray-600">{selectedSize}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[40px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
                          selectedSize === size
                            ? 'bg-gray-950 text-white border-gray-950 shadow-xs'
                            : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wide text-[10px]">
                  Quantity:
                </span>
                <div className="flex items-center border border-gray-200 bg-gray-50 rounded-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-1.5 text-gray-600 hover:text-black disabled:opacity-30 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-gray-900 font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                    disabled={quantity >= (product.stock || 99) || isOutOfStock}
                    className="p-1.5 text-gray-600 hover:text-black disabled:opacity-30 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-5 border-t border-gray-100 space-y-3">
              <div className="flex gap-2.5">
                <button
                  id="modal-add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                    isOutOfStock
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : addedAnimation
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#FACC15] hover:bg-[#EAB308] text-[#111111]'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#111111]" />
                      <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                    </>
                  )}
                </button>

                <button
                  id="modal-buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 py-3 bg-[#111111] hover:bg-black text-white text-xs font-bold tracking-wider uppercase rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                >
                  Buy Now
                </button>
              </div>

              {/* Trust Assurances */}
              <div className="grid grid-cols-3 gap-2 pt-3 text-gray-600 text-[10px]">
                <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <Truck className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                  <span className="truncate font-medium">Fast Shipping</span>
                </div>
                <button
                  type="button"
                  id="product-return-policy-btn"
                  onClick={() => setShowReturnPolicy(true)}
                  className="flex items-center gap-1.5 bg-yellow-50/80 hover:bg-yellow-100 text-[#111111] p-2 rounded-lg border border-yellow-200 transition-colors cursor-pointer text-left group"
                  title="Click to view Return Policy"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#111111] shrink-0 group-hover:rotate-45 transition-transform" />
                  <span className="truncate font-bold underline decoration-yellow-400 underline-offset-2">Return Policy</span>
                </button>
                <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                  <span className="truncate font-medium">Verified Quality</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Return Policy Dialog Modal */}
      {showReturnPolicy && (
        <div
          id="return-policy-modal-overlay"
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setShowReturnPolicy(false);
          }}
        >
          <div
            id="return-policy-card"
            className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gray-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">রিটার্ন পলিসি (Return Policy)</h3>
                  <p className="text-[11px] text-gray-400">পণ্য গ্রহণ ও পরিবর্তন সংক্রান্ত নিয়মাবলী</p>
                </div>
              </div>
              <button
                type="button"
                id="close-return-policy-btn"
                onClick={() => setShowReturnPolicy(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Close Return Policy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Policy Content */}
            <div className="p-5 sm:p-6 space-y-4 text-xs text-gray-700 leading-relaxed">
              <div className="flex items-start gap-3 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-950">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="font-semibold text-xs leading-relaxed">
                  ডেলিভারি ম্যান দাঁড়িয়ে থাকা অবস্থায় প্রোডাক্টটি চেক করে নিতে হবে। প্রোডাক্টে কোনো ত্রুটি, ভুল পণ্য বা সমস্যা পাওয়া গেলে ডেলিভারি ম্যানকে সঙ্গে সঙ্গে জানিয়ে তখনই রিটার্ন করতে হবে।
                </p>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800">
                <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="font-medium text-xs leading-relaxed">
                  ডেলিভারি ম্যান চলে যাওয়ার পর প্রোডাক্টটি রিটার্ন বা পরিবর্তন করতে চাইলে অতিরিক্ত ডেলিভারি চার্জ প্রদান করতে হবে।
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowReturnPolicy(false)}
                  className="w-full py-2.5 bg-gray-950 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  বুঝেছি (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
