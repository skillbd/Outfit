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

  // Extract all unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'All' ||
          product.category.toLowerCase() === selectedCategory.toLowerCase();
        
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          product.name.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          (product.badge && product.badge.toLowerCase().includes(q));

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Store Catalog
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            {selectedCategory === 'All' ? 'Featured Products' : `${selectedCategory} Collection`}
          </h2>
        </div>

        {/* Categories and Sort controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-100/90 rounded-full border border-gray-200/60 shadow-2xs">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`cat-filter-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-gray-950 text-white shadow-xs'
                    : 'text-gray-600 hover:text-black hover:bg-gray-200/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-xs text-gray-700 shadow-2xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <select
              id="product-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-gray-900 focus:outline-none cursor-pointer pr-1"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Search Filter Banner */}
      {searchQuery && (
        <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-xl text-xs text-blue-900">
          <span>
            Filtering results for: <strong className="font-semibold">"{searchQuery}"</strong> ({filteredProducts.length} items found)
          </span>
          <button
            id="clear-search-query-btn"
            onClick={() => setSearchQuery('')}
            className="text-blue-700 font-bold hover:underline cursor-pointer"
          >
            Clear Search
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

