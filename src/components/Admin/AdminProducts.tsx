import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, SlidersHorizontal, Image as ImageIcon, Check, X, AlertTriangle, Sparkles } from 'lucide-react';
import { Product, ProductColor } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ImageUploadDropzone } from '../ImageUploadDropzone';

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45', 'One Size'];

const PRODUCT_PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1000&auto=format&fit=crop',
];

export const AdminProducts: React.FC = () => {
  const { products, saveProduct, deleteProduct, branding } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#111827');
  const [customSize, setCustomSize] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Dynamic unique categories for dropdown & datalist suggestions
  const allCategories = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.category.trim()) set.add(p.category.trim());
    });
    return Array.from(set).sort();
  }, [products]);

  // Filter products with full null-safety
  const filtered = products.filter((p) => {
    const pCat = (p.category || 'General').trim().toLowerCase();
    const fCat = categoryFilter.trim().toLowerCase();
    const matchesCat = fCat === 'all' || pCat === fCat;
    
    const q = searchQuery.trim().toLowerCase();
    const pName = (p.name || '').toLowerCase();
    const pId = (p.id || '').toLowerCase();
    const matchesQuery = !q || pName.includes(q) || pId.includes(q) || pCat.includes(q);
    return matchesCat && matchesQuery;
  });

  const handleOpenAdd = () => {
    setEditingProduct({
      id: '',
      name: '',
      description: '',
      price: 99,
      originalPrice: 129,
      discountPercentage: 23,
      stock: 10,
      category: 'Apparel',
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop',
      ],
      sizes: ['S', 'M', 'L'],
      colors: [
        { name: 'Noir Black', hex: '#111827' },
        { name: 'Pure White', hex: '#f9fafb' },
      ],
      featured: false,
      rating: 5.0,
      reviewCount: 1,
      badge: 'NEW',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setIsModalOpen(true);
  };

  const handleProductImagesChange = (newImages: string[]) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      images: newImages,
    });
  };

  const handleToggleSize = (size: string) => {
    if (!editingProduct) return;
    const current = editingProduct.sizes || [];
    if (current.includes(size)) {
      setEditingProduct({ ...editingProduct, sizes: current.filter((s) => s !== size) });
    } else {
      setEditingProduct({ ...editingProduct, sizes: [...current, size] });
    }
  };

  const handleAddCustomSize = () => {
    if (!customSize.trim() || !editingProduct) return;
    if (!editingProduct.sizes?.includes(customSize.trim())) {
      setEditingProduct({
        ...editingProduct,
        sizes: [...(editingProduct.sizes || []), customSize.trim()],
      });
    }
    setCustomSize('');
  };

  const handleAddColor = () => {
    if (!newColorName.trim() || !editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      colors: [
        ...(editingProduct.colors || []),
        { name: newColorName.trim(), hex: newColorHex },
      ],
    });
    setNewColorName('');
  };

  const handleRemoveColor = (index: number) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      colors: editingProduct.colors.filter((_, idx) => idx !== index),
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name.trim()) {
      alert('Please provide a product title.');
      return;
    }
    setIsSaving(true);
    try {
      const priceNum = parseFloat(String(editingProduct.price)) || 0;
      const origPriceNum = editingProduct.originalPrice ? parseFloat(String(editingProduct.originalPrice)) : undefined;
      let discountPct = 0;
      if (origPriceNum && origPriceNum > priceNum) {
        discountPct = Math.round(((origPriceNum - priceNum) / origPriceNum) * 100);
      }
      const stockNum = Math.max(0, parseInt(String(editingProduct.stock), 10) || 0);

      await saveProduct({
        ...editingProduct,
        name: editingProduct.name.trim(),
        price: priceNum,
        originalPrice: origPriceNum,
        discountPercentage: discountPct,
        stock: stockNum,
        images: editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images : [PRODUCT_PRESET_IMAGES[0]],
      });

      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Save product error:', err);
      alert('Could not save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (pId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteProduct(pId);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Products Catalog
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage inventory, upload multiple product photos, set variant pricing, sizes and colors.
          </p>
        </div>

              <button
                id="admin-add-new-product-btn"
                onClick={handleOpenAdd}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111111] hover:bg-black text-[#FACC15] text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer border border-yellow-500/20"
              >
                <Plus className="w-4 h-4 text-[#FACC15]" />
                <span>Add New Product</span>
              </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            id="admin-product-search-input"
            type="text"
            placeholder="Search by title or product ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none bg-gray-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            id="admin-product-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white cursor-pointer"
          >
            <option value="All">All Categories ({products.length})</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({products.filter((p) => (p.category || 'General').trim().toLowerCase() === cat.toLowerCase()).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/90 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price / Discount</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Variants</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((product) => {
                  const isLow = product.stock <= 5;
                  const isOut = product.stock <= 0;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Product details & thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-14 object-cover bg-gray-100 rounded-lg border border-gray-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-gray-900 block text-xs">
                              {product.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              ID: {product.id} • {product.images?.length || 1} {product.images?.length === 1 ? 'photo' : 'photos'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Badge */}
                      <td className="py-3.5 px-4 text-gray-600">
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-[10px] font-bold uppercase rounded-md text-gray-700">
                          {product.category}
                        </span>
                        {product.badge && (
                          <span className="inline-block ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-bold rounded-md">
                            {product.badge}
                          </span>
                        )}
                      </td>

                      {/* Price & Discount */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">
                          {branding.currency}{product.price.toFixed(2)}
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="text-[10px] text-gray-400 line-through">
                            {branding.currency}{product.originalPrice.toFixed(2)} (-{product.discountPercentage}%)
                          </div>
                        )}
                      </td>

                      {/* Stock Inventory */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                            isOut
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : `${product.stock} in stock`}
                        </span>
                      </td>

                      {/* Sizes & Colors */}
                      <td className="py-3.5 px-4 text-gray-500">
                        <div className="text-[10px]">
                          <span>{product.sizes?.length || 0} sizes</span>
                          <span className="mx-1">•</span>
                          <span>{product.colors?.length || 0} colors</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`edit-product-${product.id}`}
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`delete-product-${product.id}`}
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Product"
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
          <div className="py-16 text-center text-gray-400">
            <p>No products match your current search.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && editingProduct && (
        <div
          id="admin-product-edit-modal-overlay"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in"
        >
          <div
            id="admin-product-edit-modal"
            className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-8"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingProduct.id ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-[11px] text-gray-400">Upload photos, configure pricing, variants and stock</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="e.g. Essential Ceramic Watch"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    list="category-options-list"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    placeholder="e.g. Apparel, Panjabi, Shirt, Footwear, Saree"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                  <datalist id="category-options-list">
                    {allCategories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                    <option value="Apparel" />
                    <option value="Accessories" />
                    <option value="Footwear" />
                    <option value="Living" />
                    <option value="Men" />
                    <option value="Women" />
                    <option value="Panjabi" />
                    <option value="Shirt" />
                    <option value="T-Shirt" />
                    <option value="Dress" />
                    <option value="Saree" />
                    <option value="Perfume" />
                    <option value="Watch" />
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    placeholder="e.g. NEW, BESTSELLER, LIMITED"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Provide details on materials, silhouette, craftsmanship and dimensions..."
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="pt-3 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-3 text-[11px]">
                  Pricing & Inventory
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                      Price ({branding.currency}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                      Original Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.originalPrice || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="Optional strike price"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                      Stock Count *
                    </label>
                    <input
                      type="number"
                      required
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Multiple Images Upload Dropzone Component */}
              <div className="pt-3 border-t border-gray-100">
                <ImageUploadDropzone
                  label="Product Images Gallery (Multiple Upload / একাধিক ছবি)"
                  description="Upload photos directly from your device (৩টির বেশি বা সর্বোচ্চ ২০টি ছবি), paste URLs, or choose curated presets."
                  images={editingProduct.images || []}
                  onChange={handleProductImagesChange}
                  multiple={true}
                  maxFiles={20}
                  presets={PRODUCT_PRESET_IMAGES}
                  aspectRatio="square"
                />
              </div>

              {/* Sizes Selection */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                  Available Sizes
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SIZES.map((size) => {
                    const isSelected = editingProduct.sizes?.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleToggleSize(size)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors Selection */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                  Color Swatches
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-8 h-8 p-0 border border-gray-300 cursor-pointer rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Color Name (e.g. Midnight Blue)"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3 py-1.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-black text-xs cursor-pointer"
                  >
                    + Add Color
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {editingProduct.colors?.map((c, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-full text-xs"
                    >
                      <span className="w-3 h-3 rounded-full border border-gray-400" style={{ backgroundColor: c.hex }} />
                      <span className="font-medium text-gray-800">{c.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="text-gray-400 hover:text-rose-600 ml-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit / Cancel Footer */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#111111] font-bold rounded-lg shadow-sm disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
