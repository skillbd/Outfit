import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, HeroSlide, Order, BrandingSettings, CartItem, OrderStatus, ProductColor } from '../types';
import { INITIAL_BRANDING, INITIAL_HERO_SLIDES, INITIAL_PRODUCTS } from '../lib/initialData';
import { applyStoreFonts } from '../lib/fonts';
import { compressDataUrlIfNeeded } from '../utils/imageUtils';

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

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(INITIAL_HERO_SLIDES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [branding, setBranding] = useState<BrandingSettings>(INITIAL_BRANDING);
  const [loading, setLoading] = useState<boolean>(true);

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
    const unsubs: (() => void)[] = [];

    try {
      // 1. Products Real-time Listener (Single Source of Truth)
      const prodUnsub = onSnapshot(
        collection(db, 'products'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Product[] = [];
            snapshot.forEach((docSnap) => {
              const d = docSnap.data();
              if (!d) return;

              // Handle product name & category
              const prodName = String(d.name || d.title || '').trim() || 'Product';
              const prodCat = String(d.category || d.cat || '').trim() || 'Apparel';
              const prodDesc = String(d.description || d.desc || '');

              // Handle price & original price
              const prodPrice = typeof d.price === 'number' ? d.price : parseFloat(String(d.price)) || 0;
              const rawOrigPrice = d.originalPrice !== undefined ? d.originalPrice : (d.regularPrice !== undefined ? d.regularPrice : undefined);
              const prodOrigPrice = rawOrigPrice !== undefined ? (typeof rawOrigPrice === 'number' ? rawOrigPrice : parseFloat(String(rawOrigPrice)) || undefined) : undefined;
              
              // Discount
              const rawDiscount = d.discountPercentage !== undefined ? d.discountPercentage : (d.discount !== undefined ? d.discount : 0);
              const prodDiscount = Number(rawDiscount) || (prodOrigPrice && prodOrigPrice > prodPrice ? Math.round(((prodOrigPrice - prodPrice) / prodOrigPrice) * 100) : 0);
              
              // Stock
              const rawStock = d.stock !== undefined ? d.stock : (d.quantity !== undefined ? d.quantity : 10);
              const prodStock = Math.max(0, parseInt(String(rawStock), 10) || 0);

              // Handle all image variations (images array, imageUrl, image, photo)
              let prodImages: string[] = [];
              if (Array.isArray(d.images) && d.images.length > 0) {
                prodImages = d.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0);
              } else if (typeof d.imageUrl === 'string' && d.imageUrl.trim()) {
                prodImages = [d.imageUrl.trim()];
              } else if (typeof d.image === 'string' && d.image.trim()) {
                prodImages = [d.image.trim()];
              } else if (typeof d.photo === 'string' && d.photo.trim()) {
                prodImages = [d.photo.trim()];
              }
              if (prodImages.length === 0) {
                prodImages = ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];
              }

              // Sizes
              let prodSizes: string[] = [];
              if (Array.isArray(d.sizes)) {
                prodSizes = d.sizes.map(String).filter(Boolean);
              } else if (typeof d.sizes === 'string') {
                prodSizes = d.sizes.split(',').map((s) => s.trim()).filter(Boolean);
              }

              // Colors
              const prodColors = Array.isArray(d.colors) ? d.colors : [];

              // Timestamps
              let createdIso = new Date().toISOString();
              if (d.createdAt && typeof d.createdAt === 'object' && typeof d.createdAt.toDate === 'function') {
                createdIso = d.createdAt.toDate().toISOString();
              } else if (typeof d.createdAt === 'string') {
                createdIso = d.createdAt;
              } else if (d.created_at && typeof d.created_at.toDate === 'function') {
                createdIso = d.created_at.toDate().toISOString();
              }

              let updatedIso = new Date().toISOString();
              if (d.updatedAt && typeof d.updatedAt === 'object' && typeof d.updatedAt.toDate === 'function') {
                updatedIso = d.updatedAt.toDate().toISOString();
              } else if (typeof d.updatedAt === 'string') {
                updatedIso = d.updatedAt;
              }

              list.push({
                ...d,
                id: docSnap.id,
                name: prodName,
                description: prodDesc,
                category: prodCat,
                price: prodPrice,
                originalPrice: prodOrigPrice && prodOrigPrice > prodPrice ? prodOrigPrice : undefined,
                discountPercentage: prodDiscount,
                stock: prodStock,
                images: prodImages,
                sizes: prodSizes,
                colors: prodColors,
                featured: Boolean(d.featured),
                rating: d.rating !== undefined ? Number(d.rating) || 5.0 : 5.0,
                reviewCount: d.reviewCount !== undefined ? Number(d.reviewCount) || 1 : 1,
                badge: d.badge ? String(d.badge).trim() : undefined,
                createdAt: createdIso,
                updatedAt: updatedIso,
              } as Product);
            });

            // Sort by createdAt descending (newest first)
            list.sort((a, b) => {
              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return timeB - timeA;
            });

            setProducts(list);
          } else {
            // First time setup if database has zero products: seed catalog directly into Firestore
            const autoSeedDone = localStorage.getItem('outfit_store_autoseeded');
            if (!autoSeedDone) {
              localStorage.setItem('outfit_store_autoseeded', 'true');
              INITIAL_PRODUCTS.forEach(async (p) => {
                try {
                  await setDoc(doc(db, 'products', p.id), cleanFirestorePayload(p));
                } catch (err) {
                  console.warn('Auto-seed product error:', err);
                }
              });
              setProducts(INITIAL_PRODUCTS);
            } else {
              setProducts([]);
            }
          }
          setLoading(false);
        },
        (error) => {
          console.error('Firestore products onSnapshot error:', error);
          setLoading(false);
        }
      );
      unsubs.push(prodUnsub);

      // 2. Hero Slides Listener
      const heroUnsub = onSnapshot(
        collection(db, 'heroSlides'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: HeroSlide[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() } as HeroSlide);
            });
            list.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
            
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
          console.warn('Hero slides sync error:', error.message);
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
          console.warn('Orders sync error:', error.message);
        }
      );
      unsubs.push(ordersUnsub);

      // 4. Branding Settings Listener
      const brandingUnsub = onSnapshot(
        doc(db, 'settings', 'branding'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const loadedBranding: BrandingSettings = {
              ...INITIAL_BRANDING,
              ...data,
              deliveryFee: data.deliveryFee !== undefined ? Number(data.deliveryFee) : 150,
            };
            setBranding(loadedBranding);
            if (loadedBranding.fontFamily && loadedBranding.bodyFontFamily) {
              applyStoreFonts(loadedBranding.fontFamily, loadedBranding.bodyFontFamily);
            }
            if (loadedBranding.websiteTitle) {
              document.title = loadedBranding.websiteTitle;
            }
            if (loadedBranding.faviconUrl) {
              let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
              if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
              }
              link.href = loadedBranding.faviconUrl;
            }
          } else {
            setDoc(doc(db, 'settings', 'branding'), INITIAL_BRANDING).catch((err) => {
              console.warn('Auto-seed branding error:', err);
            });
          }
        },
        (error) => {
          console.warn('Branding sync error:', error.message);
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
    const rawImages = (product.images || []).filter((img) => typeof img === 'string' && img.trim().length > 0);
    const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop';

    // Compress all images so the document stays ultra-lightweight and well within Firestore's 1MB limit
    const compressedImages = rawImages.length > 0
      ? await Promise.all(rawImages.map((img) => compressDataUrlIfNeeded(img, 560, 0.60)))
      : [fallbackImage];

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
      images: compressedImages,
      sizes: product.sizes || [],
      colors: product.colors || [],
      featured: Boolean(product.featured),
      rating: product.rating ? Number(product.rating) : 5.0,
      reviewCount: product.reviewCount ? Number(product.reviewCount) : 1,
      badge: product.badge?.trim() || undefined,
      updatedAt: new Date().toISOString(),
      createdAt: product.createdAt || new Date().toISOString(),
    };

    try {
      const sanitized = cleanFirestorePayload(payload);
      await setDoc(doc(db, 'products', pId), sanitized);
    } catch (error) {
      console.warn('Firestore saveProduct write warning:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
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
    if (payload.fontFamily && payload.bodyFontFamily) {
      applyStoreFonts(payload.fontFamily, payload.bodyFontFamily);
    }
    if (payload.websiteTitle) {
      document.title = payload.websiteTitle;
    }
    if (payload.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = payload.faviconUrl;
    }
    try {
      const sanitized = cleanFirestorePayload(payload);
      await setDoc(doc(db, 'settings', 'branding'), sanitized, { merge: true });
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

