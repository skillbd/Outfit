import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  currentView: 'shop' | 'admin';
  setCurrentView: (view: 'shop' | 'admin') => void;
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onNavigateHome,
  onNavigateProducts,
}) => {
  const { cartCount, setIsCartOpen, searchQuery, setSearchQuery, setSelectedCategory } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          
          {/* Left: Mobile Menu Trigger & Brand Logo */}
          <div className="flex items-center gap-4 sm:gap-8">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Brand Logo with Luxury Serif Typography */}
            <button
              id="brand-logo-btn"
              onClick={() => {
                setCurrentView('shop');
                onNavigateHome();
              }}
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
            >
              <BrandLogo size="lg" />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold tracking-wider uppercase text-gray-600 ml-2">
              <button
                id="nav-link-home"
                onClick={() => {
                  setCurrentView('shop');
                  onNavigateHome();
                }}
                className={`transition-colors hover:text-black py-1 ${
                  currentView === 'shop' ? 'text-black border-b-2 border-[#FACC15]' : ''
                }`}
              >
                Home
              </button>
              <button
                id="nav-link-products"
                onClick={() => {
                  setCurrentView('shop');
                  setSelectedCategory('All');
                  onNavigateProducts();
                }}
                className="transition-colors hover:text-black py-1"
              >
                Catalog
              </button>
              <button
                id="nav-link-apparel"
                onClick={() => {
                  setCurrentView('shop');
                  setSelectedCategory('Apparel');
                  onNavigateProducts();
                }}
                className="transition-colors hover:text-black py-1"
              >
                Apparel
              </button>
              <button
                id="nav-link-accessories"
                onClick={() => {
                  setCurrentView('shop');
                  setSelectedCategory('Accessories');
                  onNavigateProducts();
                }}
                className="transition-colors hover:text-black py-1"
              >
                Accessories
              </button>
              <button
                id="nav-link-footwear"
                onClick={() => {
                  setCurrentView('shop');
                  setSelectedCategory('Footwear');
                  onNavigateProducts();
                }}
                className="transition-colors hover:text-black py-1"
              >
                Footwear
              </button>
            </nav>
          </div>

          {/* Right: Search & Cart */}
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            
            {/* Search Input on Desktop */}
            <div className="relative hidden md:block">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-1.5 border border-gray-200 focus-within:border-black focus-within:bg-white transition-all w-44 lg:w-56 shadow-2xs">
                <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
                <input
                  id="navbar-search-input"
                  type="text"
                  placeholder="Search Outfit..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentView !== 'shop') setCurrentView('shop');
                  }}
                  className="w-full bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-700 text-xs px-1"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Search Button */}
            <button
              id="mobile-search-toggle"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="md:hidden p-2 text-gray-700 hover:text-black rounded-full hover:bg-gray-100 cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Shopping Cart Button */}
            <button
              id="navbar-cart-trigger"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-800 hover:text-black hover:bg-gray-100 rounded-full transition-all group cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-105" />
              {cartCount > 0 && (
                <span
                  id="cart-badge-count"
                  className="absolute top-0 right-0 bg-[#FACC15] text-[#111111] text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in duration-200"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Expandable Bar */}
        {isSearchExpanded && (
          <div className="md:hidden py-3 border-t border-gray-100">
            <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
              <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
              <input
                id="mobile-search-input-field"
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentView !== 'shop') setCurrentView('shop');
                }}
                className="w-full bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-700 text-xs px-1.5"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[var(--navbar-height,64px)] bg-white border-b border-gray-200 shadow-2xl p-6 z-50 animate-in slide-in-from-top duration-200">
          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Collections</p>
            <div className="flex flex-col space-y-2 text-sm font-medium text-gray-800">
              <button
                onClick={() => {
                  setCurrentView('shop');
                  onNavigateHome();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between text-left py-2 hover:text-black border-b border-gray-100"
              >
                <span>Home</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => {
                  setCurrentView('shop');
                  setSelectedCategory('All');
                  onNavigateProducts();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between text-left py-2 hover:text-black border-b border-gray-100"
              >
                <span>Full Catalog</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => {
                  setCurrentView('shop');
                  setSelectedCategory('Apparel');
                  onNavigateProducts();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between text-left py-2 hover:text-black border-b border-gray-100"
              >
                <span>Apparel</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => {
                  setCurrentView('shop');
                  setSelectedCategory('Accessories');
                  onNavigateProducts();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between text-left py-2 hover:text-black border-b border-gray-100"
              >
                <span>Accessories</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => {
                  setCurrentView('shop');
                  setSelectedCategory('Footwear');
                  onNavigateProducts();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between text-left py-2 hover:text-black border-b border-gray-100"
              >
                <span>Footwear</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
