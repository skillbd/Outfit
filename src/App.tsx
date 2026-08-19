import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { HeroSlider } from './components/HeroSlider';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { Product } from './types';

const MainAppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'shop' | 'admin'>(() => {
    return window.location.pathname.includes('admin') || window.location.hash.includes('admin')
      ? 'admin'
      : 'shop';
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  const { isAdmin, loading: authLoading } = useAuth();
  const {
    selectedProductForModal,
    setSelectedProductForModal,
    setSelectedCategory,
  } = useStore();

  // Listen to hash / URL changes for /admin navigation
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.pathname.includes('/admin')) {
        setCurrentView('admin');
      } else {
        setCurrentView('shop');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync window hash when view changes
  useEffect(() => {
    if (currentView === 'admin') {
      if (window.location.hash !== '#admin' && !window.location.pathname.includes('/admin')) {
        window.location.hash = 'admin';
      }
    } else {
      if (window.location.hash === '#admin') {
        window.history.pushState('', document.title, window.location.pathname + window.location.search);
      }
    }
  }, [currentView]);

  const handleNavigateHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateProducts = () => {
    const section = document.getElementById('products-catalog-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHeroCtaClick = (category?: string) => {
    if (category && category !== 'All') {
      setSelectedCategory(category);
    }
    handleNavigateProducts();
  };

  const handleOpenMahfuzAdmin = () => {
    if (isAdmin) {
      setCurrentView('admin');
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-white">
      {currentView === 'shop' ? (
        <>
          {/* Customer Navigation Bar */}
          <Navbar
            currentView={currentView}
            setCurrentView={setCurrentView}
            onNavigateHome={handleNavigateHome}
            onNavigateProducts={handleNavigateProducts}
          />

          {/* Hero Slider with Exactly 3 Images */}
          <HeroSlider onCtaClick={handleHeroCtaClick} />

          {/* Products Displayed Immediately Below Hero */}
          <main className="flex-1">
            <ProductGrid
              onOpenDetails={(product: Product) => setSelectedProductForModal(product)}
            />
          </main>

          {/* Customer Footer with hidden Mahfuz entry */}
          <Footer
            onNavigateCategory={(cat) => {
              setSelectedCategory(cat);
              handleNavigateProducts();
            }}
            onOpenAdmin={handleOpenMahfuzAdmin}
          />
        </>
      ) : (
        /* Protected Admin Dashboard View */
        isAdmin ? (
          <AdminDashboard onBackToStore={() => setCurrentView('shop')} />
        ) : (
          /* Secure Firebase Login Gate for /admin */
          <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-800 shadow-2xl space-y-6 animate-in zoom-in-95">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <span className="font-bold text-lg">M</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Admin Authentication</h2>
                <p className="text-xs text-gray-500">
                  Enter your verified Firebase administrator credentials to access the console.
                </p>
              </div>

              <AdminLoginModal
                isOpen={true}
                onClose={() => setCurrentView('shop')}
                onSuccess={() => setCurrentView('admin')}
              />

              <div className="text-center pt-2">
                <button
                  onClick={() => setCurrentView('shop')}
                  className="text-xs text-gray-500 hover:text-black font-semibold underline cursor-pointer"
                >
                  ← Return to Storefront
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* Admin Login Modal (Triggered by Mahfuz click from storefront) */}
      {isAdminLoginModalOpen && (
        <AdminLoginModal
          isOpen={isAdminLoginModalOpen}
          onClose={() => setIsAdminLoginModalOpen(false)}
          onSuccess={() => {
            setIsAdminLoginModalOpen(false);
            setCurrentView('admin');
          }}
        />
      )}

      {/* Global Modals & Overlays */}
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
      />

      <CartDrawer />
      <CheckoutModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <MainAppContent />
      </StoreProvider>
    </AuthProvider>
  );
}

