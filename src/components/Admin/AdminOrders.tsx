import React, { useState } from 'react';
import { Search, SlidersHorizontal, Eye, Trash2, X, CheckCircle, Package, Copy, Check, Phone, MapPin, CreditCard } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useStore } from '../../context/StoreContext';

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  Accepted: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  Processing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Shipped: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, branding } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedTrxId, setCopiedTrxId] = useState<string | null>(null);

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = statusFilter === 'All' || ord.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      ord.id.toLowerCase().includes(q) ||
      ord.customerName.toLowerCase().includes(q) ||
      ord.customerPhone.toLowerCase().includes(q) ||
      (ord.bkashTransactionId && ord.bkashTransactionId.toLowerCase().includes(q)) ||
      ord.city.toLowerCase().includes(q);

    return matchesStatus && matchesQuery;
  });

  const handleCopyTrx = (trxId: string) => {
    navigator.clipboard.writeText(trxId);
    setCopiedTrxId(trxId);
    setTimeout(() => setCopiedTrxId(null), 2000);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm(`Are you sure you want to delete order ${orderId}?`)) {
      await deleteOrder(orderId);
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Customer Orders ({orders.length})
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Track bKash payments, manage fulfillment states: Pending → Accepted → Processing → Shipped → Delivered.
          </p>
        </div>

        {/* Status counters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-full text-[11px]">
            Pending: {orders.filter((o) => o.status === 'Pending').length}
          </span>
          <span className="px-2.5 py-1 bg-cyan-100 text-cyan-900 font-bold rounded-full text-[11px]">
            Accepted: {orders.filter((o) => o.status === 'Accepted').length}
          </span>
          <span className="px-2.5 py-1 bg-blue-100 text-blue-900 font-bold rounded-full text-[11px]">
            Processing: {orders.filter((o) => o.status === 'Processing').length}
          </span>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-full text-[11px]">
            Delivered: {orders.filter((o) => o.status === 'Delivered').length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            id="admin-order-search-input"
            type="text"
            placeholder="Search by Order ID, Customer Name, Phone, or bKash TrxID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none bg-gray-50/50 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            id="admin-order-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/90 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer & Phone</th>
                  <th className="py-3.5 px-4">Items / Details</th>
                  <th className="py-3.5 px-4">Payment & TrxID</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((ord) => {
                  const style = STATUS_COLORS[ord.status] || STATUS_COLORS.Pending;
                  const dateStr = new Date(ord.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* ID & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-gray-900 block text-xs">
                          {ord.id}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {dateStr}
                        </span>
                      </td>

                      {/* Customer & Phone */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 block">
                          {ord.customerName}
                        </span>
                        <span className="text-[11px] text-gray-600 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                          {ord.customerPhone}
                        </span>
                      </td>

                      {/* Items Preview */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] text-gray-700">
                          <strong>{ord.items.reduce((acc, i) => acc + i.quantity, 0)} items</strong>
                          <div className="space-y-0.5 mt-0.5">
                            {ord.items.map((i, idx) => (
                              <div key={idx} className="text-[10px] text-gray-500 truncate max-w-[200px]">
                                {i.quantity}x {i.name} {i.selectedSize ? `[${i.selectedSize}]` : ''} {i.selectedColor ? `(${i.selectedColor})` : ''}
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Payment & TrxID */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-900 block text-[11px]">
                          {ord.paymentMethod}
                        </span>
                        {ord.bkashTransactionId ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono font-bold text-pink-700 bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded text-[10px]">
                              {ord.bkashTransactionId}
                            </span>
                            <button
                              onClick={() => handleCopyTrx(ord.bkashTransactionId!)}
                              className="p-1 text-gray-400 hover:text-pink-600 rounded"
                              title="Copy Transaction ID"
                            >
                              {copiedTrxId === ord.bkashTransactionId ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400">COD</span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 block font-mono text-xs">
                          {branding.currency}{ord.total.toFixed(2)}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                          className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md border cursor-pointer ${style.bg} ${style.text} ${style.border}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {ord.status === 'Pending' && (
                            <button
                              onClick={() => handleStatusChange(ord.id, 'Accepted')}
                              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10px] uppercase rounded-md transition-colors shadow-2xs cursor-pointer"
                              title="Accept Order"
                            >
                              Accept
                            </button>
                          )}
                          {ord.status === 'Accepted' && (
                            <button
                              onClick={() => handleStatusChange(ord.id, 'Processing')}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase rounded-md transition-colors shadow-2xs cursor-pointer"
                              title="Set to Processing"
                            >
                              Process
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Full Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(ord.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400 space-y-2">
            <Package className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs">No customer orders matching this criteria.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          id="order-details-modal-overlay"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            id="order-details-modal"
            className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
                  Order Invoice & Summary
                </span>
                <h3 className="text-lg font-bold text-gray-900 font-mono">
                  {selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Status State Machine Actions */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-bold uppercase text-[10px]">Order Status:</span>
                  <span
                    className={`px-3 py-1 text-[11px] font-bold uppercase rounded-md border ${
                      STATUS_COLORS[selectedOrder.status]?.bg
                    } ${STATUS_COLORS[selectedOrder.status]?.text} ${STATUS_COLORS[selectedOrder.status]?.border}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-200">
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Pending')}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-md text-[10px] cursor-pointer"
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Accepted')}
                    className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-md text-[10px] cursor-pointer"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Processing')}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md text-[10px] cursor-pointer"
                  >
                    Processing
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Shipped')}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md text-[10px] cursor-pointer"
                  >
                    Shipped
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Delivered')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-[10px] cursor-pointer"
                  >
                    Delivered
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Cancelled')}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md text-[10px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Customer, Phone & bKash Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Customer & Contact</span>
                  </h4>
                  <p className="font-bold text-gray-900 text-sm">{selectedOrder.customerName}</p>
                  <p className="font-mono text-gray-800 font-semibold">{selectedOrder.customerPhone}</p>
                  <p className="text-gray-500 text-[11px]">{selectedOrder.customerEmail}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-pink-600" />
                    <span>Payment Verification</span>
                  </h4>
                  <p className="font-semibold text-gray-900">{selectedOrder.paymentMethod}</p>
                  {selectedOrder.bkashTransactionId ? (
                    <div className="mt-1">
                      <span className="text-gray-400 text-[10px] block">bKash TrxID:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded text-xs">
                          {selectedOrder.bkashTransactionId}
                        </span>
                        <button
                          onClick={() => handleCopyTrx(selectedOrder.bkashTransactionId!)}
                          className="text-[10px] text-pink-700 underline font-bold"
                        >
                          {copiedTrxId === selectedOrder.bkashTransactionId ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-[11px]">Collect cash on delivery</p>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>Delivery Address</span>
                </h4>
                <p className="text-gray-900 font-medium">{selectedOrder.shippingAddress}</p>
                <p className="text-gray-600">{selectedOrder.city}, {selectedOrder.postalCode}</p>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-2 text-[10px]">
                  Ordered Products ({selectedOrder.items.length})
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-12 object-cover bg-gray-100 rounded-md border border-gray-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-gray-900 block text-xs">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {item.selectedSize ? `Size: ${item.selectedSize}` : ''}
                            {item.selectedSize && item.selectedColor ? ' • ' : ''}
                            {item.selectedColor ? `Color: ${item.selectedColor}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="font-bold text-gray-900 block text-xs">
                          {branding.currency}{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {item.quantity} × {branding.currency}{item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financials */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1.5 font-mono">
                <div className="flex justify-between text-gray-600 text-xs">
                  <span>Subtotal</span>
                  <span>{branding.currency}{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-xs">
                  <span>Delivery Fee</span>
                  <span>{branding.currency}{selectedOrder.shippingFee.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold text-xs">
                    <span>Discount</span>
                    <span>-{branding.currency}{selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-gray-950 pt-2 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span>{branding.currency}{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
