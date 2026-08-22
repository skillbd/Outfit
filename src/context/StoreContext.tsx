import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, HeroSlide, Order, BrandingSettings, CartItem, OrderStatus, ProductColor } from '../types';
import { INITIAL_BRANDING, INITIAL_HERO_SLIDES, INITIAL_PRODUCTS } from '../lib/initialData';
import { applyStoreFonts } from '../lib/fonts';

interface StoreContextType {
  products: Product[];
  heroSlides: HeroSlide[];
  orders: Order[];
  branding: BrandingSettings;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (product: Product | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  
  // Cart Actions
  addToCart: (
    product: Product,
    quantity?: number,
    selectedSize?: string,
    selectedImage?: string,
    selectedColor?: ProductColor
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Order Actions
  placeOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  
  // Admin Product Actions
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  
  // Admin Hero Slide Actions
  saveHeroSlide: (slide: HeroSlide) => Promise<void>;
  
  // Admin Branding Actions
  saveBranding: (settings: BrandingSettings) => Promise<void>;
  updateBranding: (settings: BrandingSettings) => Promise<void>;

  // Data reset / re-seed helper
  resetToDefaults: () => Promise<void>;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Clean data to prevent Firestore "Unsupported field value: undefined" errors
function cleanFirestorePayload<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return '' as any;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanFirestorePayload(item)) as any;
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestorePayload(value);
      }
    }
    return cleaned;
  }
  return obj;
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(INITIAL_HERO_SLIDES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [branding, setBranding] = useState<BrandingSettings>(INITIAL_BRANDING);
  const [loading, setLoading] = useState(true);

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  // Cart state persisted locally
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('store_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('store_cart_items', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  // Update browser title, favicon & fonts dynamically from branding
  useEffect(() => {
    if (branding.websiteTitle) {
      document.title = branding.websiteTitle;
    }
    if (branding.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = branding.faviconUrl;
    }
    // Apply dynamic typography
    applyStoreFonts(branding.fontFamily, branding.bodyFontFamily);
  }, [branding]);

  // Firestore Real-time Listeners
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    try {
      // 1. Products Listener
      const prodUnsub = onSnapshot(
        collection(db, 'products'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Product[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() } as Product);
            });
            // Sort by createdAt descending so newly added products appear first
            list.sort((a, b) => {
              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return timeB - timeA;
            });
            setProducts(list);
          } else {
            // Seed default products to Firestore if collection is empty
            INITIAL_PRODUCTS.forEach(async (p) => {
              try {
                await setDoc(doc(db, 'products', p.id), cleanFirestorePayload(p));
              } catch (err) {
                console.warn('Auto-seed product error:', err);
              }
            });
            setProducts(INITIAL_PRODUCTS);
          }
        },
        (error) => {
          console.warn('Products sync warning (using local fallback):', error.message);
          setProducts(INITIAL_PRODUCTS);
        }
      );
      unsubs.push(prodUnsub);

      // 2. Hero Slides Listener (Always guarantee exactly 3 slides)
      const heroUnsub = onSnapshot(
        collection(db, 'heroSlides'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: HeroSlide[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() } as HeroSlide);
            });
            list.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
            
            // Guarantee exactly 3 valid slides with image fallback
            const guaranteed: HeroSlide[] = [
              list[0] || INITIAL_HERO_SLIDES[0],
              list[1] || INITIAL_HERO_SLIDES[1],
              list[2] || INITIAL_HERO_SLIDES[2],
            ].map((slide, idx) => ({
              ...INITIAL_HERO_SLIDES[idx],
              ...slide,
              imageUrl: slide?.imageUrl || INITIAL_HERO_SLIDES[idx].imageUrl,
            }));
            
            setHeroSlides(guaranteed);
          } else {
            // Seed initial 3 slides
            INITIAL_HERO_SLIDES.forEach(async (slide) => {
              try {
                await setDoc(doc(db, 'heroSlides', slide.id), cleanFirestorePayload(slide));
              } catch (err) {
                console.warn('Auto-seed hero slide error:', err);
              }
            });
            setHeroSlides(INITIAL_HERO_SLIDES);
          }
        },
        (error) => {
          console.warn('Hero slides sync warning (using local fallback):', error.message);
          setHeroSlides(INITIAL_HERO_SLIDES);
        }
      );
      unsubs.push(heroUnsub);

      // 3. Orders Listener
      const ordersUnsub = onSnapshot(
        collection(db, 'orders'),
        (snapshot) => {
          const list: Order[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Order);
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(list);
        },
        (error) => {
          console.warn('Orders sync warning:', error.message);
        }
      );
      unsubs.push(ordersUnsub);

      // 4. Branding Settings Listener
      const brandingUnsub = onSnapshot(
        doc(db, 'settings', 'branding'),
        (docSnap) => {
          if (docSnap.exists()) {
            setBranding({ ...INITIAL_BRANDING, ...docSnap.data() } as BrandingSettings);
          } else {
            setDoc(doc(db, 'settings', 'branding'), INITIAL_BRANDING).catch((err) => {
              console.warn('Auto-seed branding error:', err);
            });
          }
          setLoading(false);
        },
        (error) => {
          console.warn('Branding sync warning:', error.message);
          setLoading(false);
        }
      );
      unsubs.push(brandingUnsub);
    } catch (err) {
      console.error('Initialization error in StoreContext:', err);
      setLoading(false);
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // Cart calculations
  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    selectedSize?: string,
    selectedImage?: string,
    selectedColor?: ProductColor
  ) => {
    const sizeToUse = selectedSize || (product.sizes?.length ? product.sizes[0] : undefined);
    const imageToUse = selectedImage || (product.images?.length ? product.images[0] : '');
    const colorToUse = selectedColor || (product.colors?.length ? product.colors[0] : undefined);
    const cartItemId = `${product.id}-${sizeToUse || 'default'}-${imageToUse || 'default'}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, product.stock || 99),
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            product,
            quantity: Math.min(quantity, product.stock || 99),
            selectedSize: sizeToUse,
            selectedImage: imageToUse,
            selectedColor: colorToUse,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const maxStock = item.product.stock || 99;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Order Placement
  const placeOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const orderId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistically prepend to local orders
    setOrders((prev) => [newOrder, ...prev]);

    try {
      const sanitized = cleanFirestorePayload(newOrder);
      await setDoc(doc(db, 'orders', orderId), sanitized);
      // Reduce product stock in local or Firestore
      for (const item of orderData.items) {
        const p = products.find((prod) => prod.id === item.productId);
        if (p) {
          const newStock = Math.max(0, p.stock - item.quantity);
          updateDoc(doc(db, 'products', p.id), { stock: newStock }).catch(() => {});
        }
      }
      clearCart();
      return orderId;
    } catch (error) {
      console.warn('Firestore placeOrder warning (saved locally):', error);
      clearCart();
      return orderId;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status, updatedAt: new Date().toISOString() } : ord))
    );
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Firestore updateOrderStatus warning:', error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (error) {
      console.warn('Firestore deleteOrder warning:', error);
    }
  };

  // Product CRUD
  const saveProduct = async (product: Product) => {
    const pId = product.id && product.id.trim() ? product.id.trim() : 'prod_' + Date.now();
    const cleanImages = (product.images || []).filter((img) => typeof img === 'string' && img.trim().length > 0);
    const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop';

    const numPrice = Number(product.price) >= 0 ? Number(product.price) : 0;
    const numOrigPrice = product.originalPrice && Number(product.originalPrice) > 0 ? Number(product.originalPrice) : undefined;
    const numDiscount = product.discountPercentage && Number(product.discountPercentage) > 0 ? Number(product.discountPercentage) : 0;
    const numStock = Math.max(0, parseInt(String(product.stock), 10) || 0);

    const payload: Product = {
      id: pId,
      name: product.name?.trim() || 'Product Name',
      description: product.description?.trim() || '',
      price: numPrice,
      originalPrice: numOrigPrice,
      discountPercentage: numDiscount,
      stock: numStock,
      category: product.category?.trim() || 'Apparel',
      images: cleanImages.length > 0 ? cleanImages : [fallbackImage],
      sizes: product.sizes || [],
      colors: product.colors || [],
      featured: Boolean(product.featured),
      rating: product.rating ? Number(product.rating) : 5.0,
      reviewCount: product.reviewCount ? Number(product.reviewCount) : 1,
      badge: product.badge?.trim() || undefined,
      updatedAt: new Date().toISOString(),
      createdAt: product.createdAt || new Date().toISOString(),
    };

    // Optimistically update local state immediately
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === pId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = payload;
        return next;
      }
      return [payload, ...prev];
    });

    try {
      const sanitized = cleanFirestorePayload(payload);
      await setDoc(doc(db, 'products', pId), sanitized);
    } catch (error) {
      console.warn('Firestore saveProduct write warning:', error);
    }
  };

  const deleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      console.warn('Firestore deleteProduct warning:', error);
    }
  };

  // Hero Slide Update (strictly 3 slides: slide_1, slide_2, slide_3)
  const saveHeroSlide = async (slide: HeroSlide) => {
    const payload: HeroSlide = {
      ...slide,
      updatedAt: new Date().toISOString(),
    };
    setHeroSlides((prev) => prev.map((s) => (s.id === slide.id ? payload : s)));
    try {
      const sanitized = cleanFirestorePayload(payload);
      await setDoc(doc(db, 'heroSlides', slide.id), sanitized);
    } catch (error) {
      console.warn('Firestore saveHeroSlide write warning:', error);
    }
  };

  // Branding Update
  const saveBranding = async (settings: BrandingSettings) => {
    const payload: BrandingSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    setBranding(payload);
    try {
      const sanitized = cleanFirestorePayload(payload);
      await setDoc(doc(db, 'settings', 'branding'), sanitized);
    } catch (error) {
      console.warn('Firestore saveBranding write warning:', error);
    }
  };

  const resetToDefaults = async () => {
    try {
      // Re-seed all initial data
      for (const p of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', p.id), p);
      }
      for (const s of INITIAL_HERO_SLIDES) {
        await setDoc(doc(db, 'heroSlides', s.id), s);
      }
      await setDoc(doc(db, 'settings', 'branding'), INITIAL_BRANDING);
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        heroSlides,
        orders,
        branding,
        cart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        selectedProductForModal,
        setSelectedProductForModal,
        isCheckoutOpen,
        setIsCheckoutOpen,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        placeOrder,
        updateOrderStatus,
        deleteOrder,
        saveProduct,
        deleteProduct,
        saveHeroSlide,
        saveBranding,
        updateBranding: saveBranding,
        resetToDefaults,
        loading,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
