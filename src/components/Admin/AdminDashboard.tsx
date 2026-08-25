import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Sliders,
  ShoppingBag,
  Palette,
  ArrowLeft,
  LogIn,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react';
import { AdminTab } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminHeroSlider } from './AdminHeroSlider';
import { AdminOrders } from './AdminOrders';
import { AdminBranding } from './AdminBranding';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const { user, isAdmin, loginWithGoogle, logout, toggleDemoAdmin, isDemoAdmin } = useAuth();
  const { branding, orders } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  const tabs: { id: AdminTab; label: string; section?: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'overview', label: 'Dashboard Overview', section: 'Core Management', icon: LayoutDashboard },
    { id: 'hero', label: 'Hero Settings (3/3)', section: 'Core Management', icon: Sliders },
    { id: 'products', label: 'Product Catalog', section: 'Core Management', icon: Package },
    { id: 'orders', label: 'Customer Orders', section: 'Core Management', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'branding', label: 'Appearance & Branding', section: 'Branding', icon: Palette },
  ];

  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-[#111827]">
      
      {/* Top Admin Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Back to store & Admin Title */}
            <div className="flex items-center gap-4">
              <button
                id="admin-back-to-store-btn"
                onClick={onBackToStore}
                className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Storefront</span>
              </button>

              <div className="h-4 w-px bg-gray-200 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#FACC15] rounded-full animate-pulse"></div>
                <h2 className="font-bold text-xs uppercase tracking-wider text-gray-700">
                  {branding.websiteName || 'Outfit'} Admin Console
                </h2>
              </div>
            </div>

            {/* Right: Auth / Demo Toggle */}
            <div className="flex items-center gap-3">
              
              {/* Demo Admin Quick Toggle for Testing */}
              <button
                id="admin-demo-mode-toggle"
                onClick={toggleDemoAdmin}
                className={`text-[11px] font-mono px-3 py-1 rounded-md border transition-colors cursor-pointer ${
                  isDemoAdmin
                    ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                }`}
                title="Toggle Super Admin privileges for testing"
              >
                {isDemoAdmin ? 'Admin: Active' : 'Admin: Preview'}
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <span className="hidden md:inline text-xs text-gray-600 truncate max-w-[140px] font-medium">
                    {user.email}
                  </span>
                  <button
                    onClick={logout}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  id="admin-google-login-btn"
                  onClick={loginWithGoogle}
                  className="flex items-center gap-1.5 text-xs text-white bg-gray-950 hover:bg-black px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                className="md:hidden p-1.5 text-gray-600 hover:text-black rounded-lg"
              >
                {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col md:flex-row gap-6">
        
        {/* Left Navigation Sidebar (Desktop) */}
        <aside className="hidden md:flex w-[260px] bg-white border border-gray-200 rounded-2xl flex-col shadow-xs overflow-hidden self-start">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
              <h2 className="font-bold text-xs uppercase tracking-wider text-gray-500">Navigation</h2>
            </div>
            <p className="text-[11px] text-gray-400">Store Management v2.4</p>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            <div className="text-[10px] font-bold text-gray-400 uppercase px-3 pt-2 mb-1.5 tracking-widest">
              Core Management
            </div>

            {tabs.filter(t => t.section === 'Core Management').map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`admin-tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-50 text-amber-950 font-bold border border-amber-300/80 shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="text-[10px] font-bold text-gray-400 uppercase px-3 pt-4 mb-1.5 tracking-widest">
              Branding
            </div>

            {tabs.filter(t => t.section === 'Branding').map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`admin-tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-50 text-amber-950 font-bold border border-amber-300/80 shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Bottom live stats card */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/80">
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Live Revenue</p>
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-gray-900">{branding.currency}{totalRevenue.toFixed(0)}</span>
                <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +14% ↑
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Nav Pills Bar */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold shrink-0 rounded-lg ${
                  isActive
                    ? 'bg-[#111111] text-[#FACC15] shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'overview' && <AdminOverview setActiveTab={setActiveTab} />}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'hero' && <AdminHeroSlider />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'branding' && <AdminBranding />}
        </main>
      </div>
    </div>
  );
};
