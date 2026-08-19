import React from 'react';
import { DollarSign, ShoppingBag, Package, AlertCircle, ArrowUpRight, TrendingUp, Sparkles, Layers } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminTab } from '../../types';

interface AdminOverviewProps {
  setActiveTab: (tab: AdminTab) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ setActiveTab }) => {
  const { products, orders, branding } = useStore();

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === 'Pending');
  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Gross Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Total Revenue
            </span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">
              {branding.currency}{totalRevenue.toFixed(2)}
            </span>
            <span className="text-[11px] text-green-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+14.8% this month</span>
            </span>
          </div>
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Total Orders
            </span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">
              {orders.length}
            </span>
            <span className="text-[11px] text-gray-500 block mt-1">
              {pendingOrders.length} orders pending review
            </span>
          </div>
          <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Products in Catalog */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Active Catalog
            </span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">
              {products.length}
            </span>
            <span className="text-[11px] text-gray-500 block mt-1">
              Live across store
            </span>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Stock Alerts
            </span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">
              {lowStockProducts.length}
            </span>
            <span className="text-[11px] text-amber-600 font-bold block mt-1">
              ≤ 5 units remaining
            </span>
          </div>
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Hero 3/3 Shortcut Banner */}
      <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold tracking-widest uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Storefront Polish</span>
          </div>
          <h3 className="text-lg font-bold">
            Hero Slider (3/3 Images) & Branding Settings
          </h3>
          <p className="text-gray-300 text-xs mt-1 max-w-xl">
            Update the 3 main background marketing slides or modify your store's logo, title, and color scheme.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('hero')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Hero Slider (3/3)
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Branding
          </button>
        </div>
      </div>

      {/* Two Columns: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Recent Orders
              </h3>
              <p className="text-xs text-gray-400">Latest incoming purchases</p>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-100 text-xs">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-mono font-bold text-gray-900 block">
                      {ord.id}
                    </span>
                    <span className="text-gray-500 text-[11px]">
                      {ord.customerName} • {ord.items.length} items
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-gray-900 block">
                      {branding.currency}{ord.total.toFixed(2)}
                    </span>
                    <span
                      className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        ord.status === 'Pending'
                          ? 'bg-amber-100 text-amber-900'
                          : ord.status === 'Processing'
                          ? 'bg-blue-100 text-blue-900'
                          : ord.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-xs">
              No orders placed yet. Test the checkout flow on the storefront.
            </div>
          )}
        </div>

        {/* Low Stock Watchlist (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Inventory Watchlist
              </h3>
              <p className="text-xs text-gray-400">Items running low on stock</p>
            </div>
            <button
              onClick={() => setActiveTab('products')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Catalog</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="divide-y divide-gray-100 text-xs">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-8 h-10 object-cover bg-gray-100 rounded-md border border-gray-200 shrink-0"
                    />
                    <span className="font-semibold text-gray-800 truncate">
                      {p.name}
                    </span>
                  </div>

                  <span
                    className={`shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-md ${
                      p.stock <= 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.stock <= 0 ? '0 Units' : `${p.stock} Left`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-xs">
              All inventory levels are optimal!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
