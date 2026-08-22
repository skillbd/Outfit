export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  stock: number;
  category: string;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HeroSlide {
  id: string;
  index: number; // 0, 1, 2
  title: string;
  subtitle: string;
  tag?: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  align?: 'left' | 'center' | 'right';
  updatedAt?: string;
}

export interface CartItem {
  id: string; // unique cart item instance ID (e.g. productId-size-image)
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedImage?: string;
  selectedColor?: ProductColor;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedSize?: string;
  selectedColor?: string;
}

export type OrderStatus = 'Pending' | 'Accepted' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: 'bKash Personal' | 'Cash on Delivery' | string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  bkashTransactionId?: string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandingSettings {
  websiteName: string;
  websiteTitle: string;
  websiteDescription: string;
  logoUrl?: string;
  faviconUrl?: string;
  logoHeight?: number; // Logo image height in pixels (e.g. 20 - 120px, default 36)
  logoTextScale?: number; // Brand typography scale percentage (e.g. 80 - 180%, default 100)
  showLogoText?: boolean; // Whether to display brand name text alongside uploaded image logo
  currency: string;
  contactEmail: string;
  contactPhone: string;
  bkashNumber: string;
  freeShippingThreshold: number;
  fontFamily?: string; // Heading & Brand Logo Font (e.g. 'Cormorant Garamond', 'Cinzel', 'Playfair Display', 'Bodoni Moda', 'Marcellus', 'Plus Jakarta Sans', 'Outfit', 'Montserrat', 'Lora', 'Prata')
  bodyFontFamily?: string; // Body & UI Text Font (e.g. 'Plus Jakarta Sans', 'Outfit', 'Montserrat', 'Lora', 'Cormorant Garamond')
  updatedAt?: string;
}

export type AdminTab = 'overview' | 'products' | 'hero' | 'orders' | 'branding';
