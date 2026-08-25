import React, { useMemo } from 'react';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { useStore } from '../context/StoreContext';

interface ProductGridProps {
  onOpenDetails: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ onOpenDetails }) => {
  const {
    products,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
  } = useStore();

  // Extract all unique categories with dynamic product counts
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const cat = (p.category || 'General').trim();
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const uniqueCats = Object.keys(counts).sort();
    return [
      { name: 'All', count: products.length },
      ...uniqueCats.map((cat) => ({ name: cat, count: counts[cat] })),
    ];
  }, [products]);

  // Filter & Sort logic with complete null-safety
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const prodCat = (product.category || 'General').trim().toLowerCase();
        const selCat = (selectedCategory || 'All').trim().toLowerCase();
        const matchesCategory = selCat === 'all' || prodCat === selCat;
        
        const q = searchQuery.trim().toLowerCase();
        const name = (product.name || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();
        const cat = (product.category || '').toLowerCase();
        const badge = (product.badge || '').toLowerCase();
        const id = (product.id || '').toLowerCase();

        const matchesSearch =
          !q ||
          name.includes(q) ||
          desc.includes(q) ||
          cat.includes(q) ||
          badge.includes(q) ||
          id.includes(q);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        // default featured
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="products-catalog-section" className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-pulse"></span>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Store Catalog ({products.length} {products.length === 1 ? 'Item' : 'Items'})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
            {selectedCategory === 'All' ? 'Exclusive Collections (সব পণ্য)' : `${selectedCategory} Collection`}
          </h2>
        </div>

        {/* Categories and Sort controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Pills with horizontal scroll on mobile */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100/90 rounded-2xl border border-stone-200 shadow-2xs overflow-x-auto max-w-full">
            {categories.map((catItem) => {
              const isSelected = selectedCategory.trim().toLowerCase() === catItem.name.trim().toLowerCase();
              return (
                <button
                  key={catItem.name}
                  id={`cat-filter-btn-${catItem.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedCategory(catItem.name)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#111111] text-[#FACC15] shadow-xs'
                      : 'text-gray-600 hover:text-black hover:bg-stone-200/80'
                  }`}
                >
                  <span>{catItem.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-[#FACC15]' : 'bg-stone-200 text-gray-600'}`}>
                    {catItem.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-700 shadow-2xs shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
            <select
              id="product-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-900 focus:outline-none cursor-pointer pr-1"
            >
              <option value="featured">Featured (জনপ্রিয়)</option>
              <option value="price-low">Price: Low to High (কম থেকে বেশি দাম)</option>
              <option value="price-high">Price: High to Low (বেশি থেকে কম দাম)</option>
              <option value="rating">Top Rated (সর্বোচ্চ রেটিং)</option>
              <option value="newest">Newest Arrivals (নতুন কালেকশন)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Category / Search Filter Banner */}
      {(searchQuery || selectedCategory !== 'All') && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 bg-amber-50 border border-amber-200/80 px-4 py-2.5 rounded-xl text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
              {selectedCategory !== 'All' && <span> in <em>"{selectedCategory}"</em></span>}
              {searchQuery && <span> matching <em>"{searchQuery}"</em></span>}
            </span>
          </div>
          <button
            id="clear-all-product-filters-btn"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="text-amber-900 font-bold hover:underline cursor-pointer bg-amber-200/60 px-2.5 py-1 rounded-lg"
          >
            Show All Products (সব পণ্য দেখুন)
          </button>
        </div>
      )}

      {/* Loading Skeleton State */}
      {loading && products.length === 0 ? (
        <div
          id="products-grid-skeleton"
          className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="flex flex-col space-y-3">
              <div className="aspect-[4/5] bg-stone-200 rounded-2xl w-full" />
              <div className="h-4 bg-stone-200 rounded-md w-3/4" />
              <div className="h-3 bg-stone-200 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        /* Product Cards Grid (4 columns) */
        <div
          id="products-grid-container"
          className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 mt-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No matching products found</h3>
          <p className="text-gray-500 text-xs mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or switching category filters.
          </p>
          <button
            id="reset-filters-btn"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-5 px-5 py-2 bg-gray-950 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
};

