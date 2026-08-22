import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Banknote, ShoppingBag, ArrowRight, Loader2, Copy, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { OrderItem } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    branding,
    cart,
    cartSubtotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    placeOrder,
  } = useStore();

  const bkashNumber = branding.bkashNumber || '01342826145';

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    city: '',
    postalCode: '',
    paymentMethod: 'bKash Personal',
    bkashTransactionId: '',
    notes: '',
  });

  const [copiedNumber, setCopiedNumber] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const freeShippingThreshold = branding.freeShippingThreshold || 2500;
  const isFreeShipping = cartSubtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : 60; // 60 BDT standard delivery
  const totalAmount = Math.max(0, cartSubtotal + shippingFee - discountApplied);

  const handleCopyBkash = () => {
    navigator.clipboard.writeText(bkashNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'WELCOME10') {
      const disc = Math.round(cartSubtotal * 0.1);
      setDiscountApplied(disc);
      setPromoMessage('Promo code applied: 10% discount!');
    } else if (promoCode.trim().toUpperCase() === 'VIP20') {
      const disc = Math.round(cartSubtotal * 0.2);
      setDiscountApplied(disc);
      setPromoMessage('VIP code applied: 20% discount!');
    } else {
      setPromoMessage('Invalid promo code. Try "WELCOME10" or "VIP20"');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.shippingAddress) {
      alert('Please fill out Name, Phone Number, and Delivery Address.');
      return;
    }

    if (formData.paymentMethod === 'bKash Personal' && !formData.bkashTransactionId.trim()) {
      alert('Please enter your bKash Transaction ID (TrxID) after sending payment.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems: OrderItem[] = cart.map((c) => ({
        productId: c.product.id,
        name: c.product.name,
        price: c.product.price,
        quantity: c.quantity,
        image: c.selectedImage || c.product.images?.[0] || '',
        selectedSize: c.selectedSize || '',
        selectedColor: c.selectedColor?.name || '',
      }));

      const orderData: any = {
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail?.trim() || 'customer@store.local',
        customerPhone: formData.customerPhone.trim(),
        shippingAddress: formData.shippingAddress.trim(),
        city: formData.city?.trim() || 'Dhaka',
        postalCode: formData.postalCode?.trim() || '1200',
        items: orderItems,
        subtotal: cartSubtotal,
        shippingFee,
        discount: discountApplied,
        total: totalAmount,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentMethod === 'bKash Personal' ? 'Paid' : 'Pending',
        status: 'Pending',
        notes: formData.notes?.trim() || '',
      };

      if (formData.paymentMethod === 'bKash Personal' && formData.bkashTransactionId?.trim()) {
        orderData.bkashTransactionId = formData.bkashTransactionId.trim();
      }

      const orderId = await placeOrder(orderData);
      setCompletedOrderId(orderId);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Could not place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setCompletedOrderId(null);
  };

  return (
    <div
      id="checkout-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        id="checkout-modal-container"
        className="relative bg-white w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-checkout-modal-btn"
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-black bg-white/90 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close Checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {completedOrderId ? (
          /* Order Confirmation Screen */
          <div className="p-6 sm:p-10 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-in zoom-in">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Order Received Successfully
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                Thank you for your order!
              </h2>
              <p className="text-gray-500 text-xs mt-1">
                Order Reference ID: <strong className="text-gray-900 font-mono text-sm">{completedOrderId}</strong>
              </p>
            </div>

            {/* Order Recap Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left max-w-md mx-auto text-xs space-y-2.5">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Customer Name</span>
                <span className="font-semibold text-gray-900">{formData.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Phone Number</span>
                <span className="font-semibold text-gray-900 font-mono">{formData.customerPhone}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Delivery Address</span>
                <span className="font-semibold text-gray-900 text-right">{formData.shippingAddress}, {formData.city}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-semibold text-gray-900">{formData.paymentMethod}</span>
              </div>
              {formData.bkashTransactionId && (
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">bKash TrxID</span>
                  <span className="font-mono font-bold text-pink-600 uppercase">{formData.bkashTransactionId}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 font-bold text-gray-950 text-sm">
                <span>Total Amount</span>
                <span>{branding.currency}{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Our team has received your order details and is verifying dispatch. Status: <strong>Pending</strong>.
            </p>

            <button
              id="continue-shopping-after-order-btn"
              onClick={handleClose}
              className="px-6 py-2.5 bg-gray-950 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <div className="p-5 sm:p-8">
            <div className="pb-4 border-b border-gray-100 mb-5">
              <h2 className="text-xl font-bold font-serif text-gray-900">
                Checkout & Shipping
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 font-light">
                Complete your details below to place your order with {branding.websiteName || 'Outfit'}.
              </p>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-5 text-xs">
              
              {/* 1. Customer Information */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <span className="w-4 h-4 bg-gray-900 text-white rounded-full text-[9px] flex items-center justify-center font-bold">1</span>
                  <span>Customer Details</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      id="checkout-customer-name"
                      type="text"
                      required
                      placeholder="e.g. Tanvir Ahmed"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      Phone Number *
                    </label>
                    <input
                      id="checkout-customer-phone"
                      type="tel"
                      required
                      placeholder="e.g. 017XXXXXXXX"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      id="checkout-customer-email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Delivery Address */}
              <div className="pt-3 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <span className="w-4 h-4 bg-gray-900 text-white rounded-full text-[9px] flex items-center justify-center font-bold">2</span>
                  <span>Delivery Address</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      Full Address (House, Road, Area) *
                    </label>
                    <input
                      id="checkout-shipping-address"
                      type="text"
                      required
                      placeholder="e.g. House 12, Road 4, Sector 7, Uttara"
                      value={formData.shippingAddress}
                      onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      City / District *
                    </label>
                    <input
                      id="checkout-shipping-city"
                      type="text"
                      required
                      placeholder="e.g. Dhaka, Chittagong, Sylhet"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      Postal Code / Area
                    </label>
                    <input
                      id="checkout-shipping-postal"
                      type="text"
                      placeholder="e.g. 1230"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Payment Method */}
              <div className="pt-3 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <span className="w-4 h-4 bg-gray-900 text-white rounded-full text-[9px] flex items-center justify-center font-bold">3</span>
                  <span>Select Payment Method</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* bKash Payment Option */}
                  <label
                    className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                      formData.paymentMethod === 'bKash Personal'
                        ? 'border-pink-600 bg-pink-50/40 ring-1 ring-pink-500 shadow-2xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bKash Personal"
                      checked={formData.paymentMethod === 'bKash Personal'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'bKash Personal' })}
                      className="mt-0.5 text-pink-600 focus:ring-pink-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900 block">bKash Personal</span>
                        <span className="bg-pink-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">Instant</span>
                      </div>
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        Send Money to <strong>{bkashNumber}</strong>
                      </span>
                    </div>
                  </label>

                  {/* Cash on Delivery Option */}
                  <label
                    className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                      formData.paymentMethod === 'Cash on Delivery'
                        ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500 shadow-2xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={formData.paymentMethod === 'Cash on Delivery'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'Cash on Delivery' })}
                      className="mt-0.5 text-blue-600 focus:ring-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900 block">Cash on Delivery</span>
                      </div>
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        Pay in cash upon delivery to courier
                      </span>
                    </div>
                  </label>
                </div>

                {/* bKash Payment Instructions Box */}
                {formData.paymentMethod === 'bKash Personal' && (
                  <div className="mt-3 p-4 bg-pink-50/70 border border-pink-200 rounded-xl space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-pink-900">
                        bKash Personal Number:
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyBkash}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-700 bg-pink-100 hover:bg-pink-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        {copiedNumber ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedNumber ? 'Copied!' : 'Copy Number'}</span>
                      </button>
                    </div>

                    <div className="p-2.5 bg-white border border-pink-200 rounded-lg flex items-center justify-between">
                      <span className="font-mono text-base font-extrabold text-pink-700 tracking-wider">
                        {bkashNumber}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">Send Money</span>
                    </div>

                    <ol className="text-[11px] text-pink-950 space-y-1 list-decimal list-inside leading-relaxed">
                      <li>Open bKash app or dial *247#</li>
                      <li>Select <strong>Send Money</strong> and enter <strong>{bkashNumber}</strong></li>
                      <li>Enter amount: <strong>{branding.currency}{totalAmount.toFixed(2)}</strong></li>
                      <li>Copy the <strong>Transaction ID (TrxID)</strong> and paste below:</li>
                    </ol>

                    <div>
                      <label className="block text-[11px] font-bold text-pink-900 uppercase mb-1">
                        bKash Transaction ID (TrxID) *
                      </label>
                      <input
                        id="checkout-bkash-trxid"
                        type="text"
                        required={formData.paymentMethod === 'bKash Personal'}
                        placeholder="e.g. 9J28DAK23X"
                        value={formData.bkashTransactionId}
                        onChange={(e) => setFormData({ ...formData, bkashTransactionId: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2 border border-pink-300 bg-white rounded-lg focus:border-pink-600 focus:outline-none font-mono font-bold tracking-wider uppercase text-pink-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items & Summary */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-gray-900 pb-1.5 border-b border-gray-200">
                  <span>Cart Items ({cart.length})</span>
                  <span>Price</span>
                </div>
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-gray-600 text-[11px] gap-2">
                    <div className="flex items-center gap-2 truncate max-w-[280px]">
                      <img
                        src={item.selectedImage || item.product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-9 object-cover rounded border border-gray-200 shrink-0"
                      />
                      <span className="truncate">
                        {item.quantity}× {item.product.name} {item.selectedSize ? `(${item.selectedSize})` : ''}
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-gray-900 shrink-0">
                      {branding.currency}{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                
                <div className="pt-2 border-t border-gray-200 flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{branding.currency}{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-900">{shippingFee === 0 ? 'FREE' : `${branding.currency}${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-950 pt-1.5 border-t border-gray-200">
                  <span>Total Payable</span>
                  <span>{branding.currency}{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="place-order-submit-btn"
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-3.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#111111] text-xs font-bold tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#111111]" />
                    <span>Confirm Order ({branding.currency}{totalAmount.toFixed(2)})</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
