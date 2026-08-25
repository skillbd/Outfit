import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Zap,
  Info,
  CheckCircle2,
  Image as ImageIcon,
  MessageCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { branding, addToCart, setIsCheckoutOpen } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [showReturnPolicy, setShowReturnPolicy] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedSize(product.sizes?.[0] || '');
      setQuantity(1);
      setAddedAnimation(false);
      setShowReturnPolicy(false);
    }
  }, [product]);

  if (!product) return null;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];

  const selectedImageUrl = images[activeImageIndex] || images[0];

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPct =
    product.discountPercentage ||
    (hasDiscount
      ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
      : 0);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize, selectedImageUrl);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize, selectedImageUrl);
    onClose();
    setIsCheckoutOpen(true);
  };

  // Direct WhatsApp Order
  const handleWhatsAppOrder = () => {
    const rawPhone = branding.contactPhone || '8801700000000';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const targetPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;

    const message = encodeURIComponent(
      `Hello ${branding.websiteName || 'Outfit'},\n\nI want to order this product:\n🛍️ *Product:* ${product.name}\n🆔 *SKU/ID:* ${product.id}\n💰 *Price:* ${branding.currency}${product.price}\n📦 *Quantity:* ${quantity}${
        selectedSize ? `\n📏 *Size:* ${selectedSize}` : ''
      }\n🖼️ *Selected Photo:* Variant #${activeImageIndex + 1}\n\nPlease confirm my order. Thank you!`
    );

    window.open(`https://wa.me/${targetPhone}?text=${message}`, '_blank');
  };

  return (
    <div
      id="product-detail-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="product-detail-modal-container"
        className="relative bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 p-5 sm:p-8 lg:p-10">
          {/* Left Column: Image Gallery & Photo Selection */}
          <div className="flex flex-col gap-3">
            {/* Main Stage Image */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100 rounded-2xl border border-gray-100 shadow-xs group">
              <img
                src={selectedImageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />

              {/* Selected Photo Variant Tag */}
              <div className="absolute bottom-3 left-3 bg-[#111111]/90 backdrop-blur-xs text-[#FACC15] text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1.5 border border-yellow-400/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>Selected: Photo #{activeImageIndex + 1}</span>
              </div>

              {product.badge && (
                <span className="absolute top-3 left-3 bg-gray-950 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md shadow-sm">
                  {product.badge}
                </span>
              )}

              {hasDiscount && (
                <span className="absolute top-3 right-3 bg-[#FACC15] text-[#111111] text-[10px] font-extrabold tracking-wide uppercase px-2.5 py-1 rounded-md shadow-sm">
                  -{discountPct}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Strip with Photo Click Selector */}
            {images.length > 1 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-gray-600 font-medium">
                  <span className="flex items-center gap-1 font-semibold text-gray-800">
                    <ImageIcon className="w-3.5 h-3.5 text-[#111111]" />
                    <span>যে ছবিটি অর্ডার করতে চান ক্লিক করুন:</span>
                  </span>
                  <span className="text-gray-400 font-mono text-[10px]">
                    {activeImageIndex + 1}/{images.length}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      id={`photo-variant-thumb-${idx}`}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-20 shrink-0 rounded-xl border-2 overflow-hidden transition-all cursor-pointer group ${
                        activeImageIndex === idx
                          ? 'border-[#111111] ring-2 ring-[#FACC15] ring-offset-1 shadow-md scale-102'
                          : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-400'
                      }`}
                      title={`Select Photo ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`Photo ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {activeImageIndex === idx && (
                        <div className="absolute top-1 right-1 bg-[#111111] text-[#FACC15] rounded-full p-0.5 shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Purchase Form */}
          <div className="flex flex-col justify-between space-y-5">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-gray-400 uppercase tracking-widest font-mono">
                <span className="font-bold text-[#111111] bg-stone-100 px-2 py-0.5 rounded">
                  {product.category}
                </span>
                <span>ID: {product.id}</span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight mt-2">
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
                  ({product.reviewCount || 18} verified reviews)
                </span>
              </div>

              {/* Price Section */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {branding.currency}
                  {product.price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-gray-400 line-through">
                      {branding.currency}
                      {product.originalPrice?.toFixed(2)}
                    </span>
                    <span className="bg-[#FACC15]/20 text-[#111111] border border-[#FACC15] text-xs font-extrabold px-2 py-0.5 rounded-md">
                      SAVE {discountPct}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock Indicator */}
              <div className="mt-2.5 flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOutOfStock
                      ? 'bg-rose-500'
                      : product.stock <= 5
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="text-xs font-semibold text-gray-700">
                  {isOutOfStock
                    ? 'Currently Out of Stock (স্টকে নেই)'
                    : product.stock <= 5
                    ? `Low Inventory: Only ${product.stock} units remaining (সীমিত স্টক)`
                    : `In Stock (${product.stock} units ready to ship)`}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-4 pt-4 border-t border-gray-100">
                {product.description}
              </p>

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-gray-800 uppercase tracking-wide text-[10px]">
                      Select Size (সাইজ নির্বাচন করুন):{' '}
                      <span className="font-semibold text-amber-700">{selectedSize}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[44px] px-3.5 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                          selectedSize === size
                            ? 'bg-[#111111] text-[#FACC15] border-[#111111] shadow-xs'
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
                  Quantity (পরিমাণ):
                </span>
                <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl p-0.5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2 text-gray-600 hover:text-black disabled:opacity-30 cursor-pointer"
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
                    className="p-2 text-gray-600 hover:text-black disabled:opacity-30 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-5 border-t border-gray-100 space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2.5">
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
                      <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag (ব্যাগে যোগ করুন)'}</span>
                    </>
                  )}
                </button>

                <button
                  id="modal-buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 py-3 bg-[#111111] hover:bg-black text-[#FACC15] text-xs font-bold tracking-wider uppercase rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-[#FACC15]" />
                  <span>Buy Now (সরাসরি কিনুন)</span>
                </button>
              </div>

              {/* Direct WhatsApp Order Button */}
              <button
                id="modal-whatsapp-order-btn"
                onClick={handleWhatsAppOrder}
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Order via WhatsApp (হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন)</span>
              </button>

              {/* Trust Assurances */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-gray-600 text-[10px]">
                <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <Truck className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                  <span className="truncate font-medium">৳১৫০ ডেলিভারি চার্জ</span>
                </div>
                <button
                  type="button"
                  id="product-return-policy-btn"
                  onClick={() => setShowReturnPolicy(true)}
                  className="flex items-center gap-1.5 bg-yellow-50/80 hover:bg-yellow-100 text-[#111111] p-2 rounded-lg border border-yellow-200 transition-colors cursor-pointer text-left group"
                  title="Click to view Return Policy"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#111111] shrink-0 group-hover:rotate-45 transition-transform" />
                  <span className="truncate font-bold underline decoration-yellow-400 underline-offset-2">
                    রিটার্ন পলিসি
                  </span>
                </button>
                <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                  <span className="truncate font-medium">ক্যাশ অন ডেলিভারি</span>
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
            className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-gray-200 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FACC15] text-[#111111] flex items-center justify-center font-bold">
                  <RotateCcw className="w-4 h-4 text-[#111111]" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">
                  রিটার্ন পলিসি (Return Policy)
                </h3>
              </div>
              <button
                onClick={() => setShowReturnPolicy(false)}
                className="text-gray-400 hover:text-black p-1 rounded-md cursor-pointer"
                aria-label="Close Return Policy"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-gray-700 leading-relaxed">
              <div className="flex items-start gap-3 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-950">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="font-semibold text-xs leading-relaxed">
                  ডেলিভারি ম্যান দাঁড়িয়ে থাকা অবস্থায় প্রোডাক্টটি চেক করে নিতে হবে, প্রোডাক্ট এর কোন ত্রুটি বের হলে তখনই রিটার্ন করতে বলবেন।
                </p>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="font-medium text-xs leading-relaxed">
                  ডেলিভারি ম্যান চলে যাওয়ার পর প্রোডাক্টটি রিটার্ন অথবা পরিবর্তন করে নিতে চাইলে অতিরক্ত ডেলিভারি চার্জ প্রদান করতে হবে।
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowReturnPolicy(false)}
                className="w-full py-2.5 bg-[#111111] text-[#FACC15] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
              >
                বুঝেছি (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

