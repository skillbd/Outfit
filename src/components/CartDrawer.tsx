import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    branding,
    cart,
    cartCount,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    setIsCheckoutOpen,
  } = useStore();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div
      id="cart-drawer-overlay"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={() => setIsCartOpen(false)}
    >
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="cart-drawer-panel"
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-gray-200 animate-in slide-in-from-right duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Shopping Bag
                </h2>
                <span className="text-[11px] text-gray-400 font-medium">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
                </span>
              </div>
            </div>
            <button
              id="close-cart-drawer-btn"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close Shopping Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div
                  key={item.id}
                  id={`cart-item-${item.id}`}
                  className="flex gap-3.5 pb-4 border-b border-gray-100 last:border-0"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.selectedImage || item.product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-20 object-cover object-center bg-gray-100 rounded-xl border border-gray-200 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-gray-500">
                        {item.selectedSize && (
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-semibold">
                            {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                            <span
                              className="w-2 h-2 rounded-full border border-gray-400"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            <span>{item.selectedColor.name}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price and Quantity Stepper */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 bg-gray-50 rounded-lg">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-600 hover:text-black cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-gray-900 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product.stock || 99)}
                          className="p-1 text-gray-600 hover:text-black disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-900">
                          {branding.currency}{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* Empty Cart State */
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Your bag is empty</h3>
                <p className="text-gray-400 text-xs mt-1 max-w-[220px]">
                  Explore our featured catalog and add your favorite items.
                </p>
                <button
                  id="empty-cart-browse-btn"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-5 py-2 bg-gray-950 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors cursor-pointer"
                >
                  Browse Catalog
                </button>
              </div>
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/90 space-y-3.5">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between text-xs">
                  <span>Products Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {branding.currency}{cartSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Delivery / Shipping Fee</span>
                  <span className="font-semibold text-gray-900">
                    +{branding.currency}{(branding.deliveryFee ?? 150).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-950 pt-2 border-t border-gray-200">
                  <span>Estimated Total</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    {branding.currency}{(cartSubtotal + (branding.deliveryFee ?? 150)).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                id="cart-proceed-checkout-btn"
                onClick={handleProceedToCheckout}
                className="w-full py-3 bg-[#FACC15] hover:bg-[#EAB308] text-[#111111] text-xs font-bold tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#111111]" />
              </button>

              <p className="text-[10px] text-gray-400 text-center">
                Secure 256-bit encrypted checkout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
