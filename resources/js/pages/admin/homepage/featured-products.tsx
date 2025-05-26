import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { FormEvent, useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import ProductCard, { ProductProps } from '@/components/ui/product-card';

interface Product {
  id: number;
  name: string;
  price: number;
  sale_price: number | null;
  slug?: string;
  images: Array<{
    id: number;
    url: string;
  }>;
}

interface FeaturedProduct {
  id: number;
  product_id: number;
  product: Product;
  is_active: boolean;
  sort_order: number;
}

interface Props {
  featuredProducts: FeaturedProduct[];
  availableProducts: Product[];
}

export default function FeaturedProducts({ featuredProducts, availableProducts }: Props) {
  const [products, setProducts] = useState(featuredProducts);
  const [reordering, setReordering] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showReorderSuccess, setShowReorderSuccess] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [batchActionOpen, setBatchActionOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewProducts, setPreviewProducts] = useState<FeaturedProduct[]>([]);

  const { data, setData, post, processing } = useForm({
    product_id: '',
    sort_order: featuredProducts.length > 0 
      ? Math.max(...featuredProducts.map(p => p.sort_order)) + 1 
      : 1
  });

  // Filter available products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return availableProducts;
    
    return availableProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableProducts, searchTerm]);

  // Set up preview products when regular products change
  useEffect(() => {
    // Only show active products in the preview
    setPreviewProducts(products.filter(p => p.is_active).sort((a, b) => a.sort_order - b.sort_order));
  }, [products]);

  const handleAddProduct = (e: FormEvent) => {
    e.preventDefault();
    post(route('admin.homepage.featured-products.add'), {
      onSuccess: () => {
        setData('product_id', '');
      }
    });
  };

  const handleRemoveProduct = (id: number) => {
    if (confirm('Are you sure you want to remove this product from featured products?')) {
      router.delete(route('admin.homepage.featured-products.remove', id));
    }
  };

  const handleToggleStatus = (id: number) => {
    router.put(route('admin.homepage.featured-products.toggle', id));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    // Reorder the products
    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update sort order based on new positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index + 1
    }));

    setProducts(updatedItems);

    // Save the new order to the server
    setIsSaving(true);
    post(route('admin.homepage.featured-products.order'), {
      method: 'put',
      data: {
        products: updatedItems.map(item => ({
          id: item.id,
          sort_order: item.sort_order
        }))
      },
      onSuccess: () => {
        setIsSaving(false);
        setShowReorderSuccess(true);
        setTimeout(() => setShowReorderSuccess(false), 3000);
      }
    } as any);
  };

  const startReordering = () => {
    setReordering(true);
    // Scroll to the products list to make it more visible
    document.getElementById('featured-products-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const stopReordering = () => {
    setReordering(false);
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      // If all are selected, deselect all
      setSelectedProducts([]);
    } else {
      // Otherwise, select all
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleBatchActivate = () => {
    if (selectedProducts.length === 0) return;
    
    // Make parallel requests to activate each selected product
    setIsSaving(true);
    
    // Use Promise.all with router.put for batch operations
    Promise.all(
      selectedProducts.map(id => 
        new Promise(resolve => {
          router.put(
            route('admin.homepage.featured-products.toggle', id), 
            { is_active: true },
            {
              preserveScroll: true,
              onSuccess: () => resolve(true),
              onError: () => resolve(false)
            }
          );
        })
      )
    ).then(() => {
      // Update local state
      setProducts(prev => 
        prev.map(product => 
          selectedProducts.includes(product.id) 
            ? { ...product, is_active: true } 
            : product
        )
      );
      setIsSaving(false);
      setBatchActionOpen(false);
      setSelectedProducts([]);
    });
  };

  const handleBatchDeactivate = () => {
    if (selectedProducts.length === 0) return;
    
    // Make parallel requests to deactivate each selected product
    setIsSaving(true);
    
    // Use Promise.all with router.put for batch operations
    Promise.all(
      selectedProducts.map(id => 
        new Promise(resolve => {
          router.put(
            route('admin.homepage.featured-products.toggle', id), 
            { is_active: false },
            {
              preserveScroll: true,
              onSuccess: () => resolve(true),
              onError: () => resolve(false)
            }
          );
        })
      )
    ).then(() => {
      // Update local state
      setProducts(prev => 
        prev.map(product => 
          selectedProducts.includes(product.id) 
            ? { ...product, is_active: false } 
            : product
        )
      );
      setIsSaving(false);
      setBatchActionOpen(false);
      setSelectedProducts([]);
    });
  };

  const handleBatchRemove = () => {
    if (selectedProducts.length === 0) return;
    
    if (!confirm(`Are you sure you want to remove ${selectedProducts.length} product(s) from featured products?`)) {
      return;
    }
    
    // Make parallel requests to remove each selected product
    setIsSaving(true);
    
    // Use Promise.all with router.delete for batch operations
    Promise.all(
      selectedProducts.map(id => 
        new Promise(resolve => {
          router.delete(
            route('admin.homepage.featured-products.remove', id),
            {
              preserveScroll: true,
              onSuccess: () => resolve(true),
              onError: () => resolve(false)
            }
          );
        })
      )
    ).then(() => {
      // Update local state
      setProducts(prev => prev.filter(product => !selectedProducts.includes(product.id)));
      setIsSaving(false);
      setBatchActionOpen(false);
      setSelectedProducts([]);
    });
  };

  return (
    <AdminLayout>
      <Head title="Manage Featured Products" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-4 flex items-center text-sm text-gray-600">
            <Link href={route('admin.homepage.index')} className="hover:text-indigo-600">
              Homepage Sections
            </Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-medium text-gray-900">Featured Products</span>
          </div>

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Manage Featured Products</h1>
                  <p className="text-gray-600 mt-1">
                    Products added here will be displayed in the Featured Products section on your homepage
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                  >
                    {showPreview ? 'Hide Preview' : 'Preview Section'}
                  </button>
                  <Link 
                    href={route('admin.homepage.index')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    Back to Homepage Sections
                  </Link>
                </div>
              </div>

              {/* Preview Section */}
              {showPreview && (
                <div className="mb-8 border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-4 border-b border-gray-300 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800">Homepage Preview</h2>
                    <span className="text-sm text-gray-500">
                      {previewProducts.length} active product{previewProducts.length !== 1 ? 's' : ''} will be displayed
                    </span>
                  </div>
                  <div className="p-6 bg-gray-50">
                    <h3 className="text-2xl font-bold text-center mb-6">Featured Products</h3>
                    
                    {previewProducts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No active featured products to display on the homepage.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {previewProducts.map(featuredProduct => (
                          <ProductCard 
                            key={featuredProduct.id}
                            product={{
                              id: featuredProduct.product.id,
                              name: featuredProduct.product.name,
                              price: featuredProduct.product.price,
                              sale_price: featuredProduct.product.sale_price,
                              slug: featuredProduct.product.slug || `product-${featuredProduct.product.id}`,
                              images: featuredProduct.product.images || [],
                              stock: 1000 // Default stock value for preview
                            }}
                            showActions={false}
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="text-center mt-8">
                      <button className="inline-block border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300">
                        View All Products
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-3 border-t border-gray-300 text-center text-sm text-gray-500">
                    This is a preview of how the featured products section will appear on the homepage
                  </div>
                </div>
              )}

              {/* Add Product Form */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Add Featured Product</h2>
                <form onSubmit={handleAddProduct} className="flex flex-wrap items-end gap-4">
                  <div className="w-full md:w-auto flex-grow">
                    <label htmlFor="product_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Product
                    </label>
                    <div className="relative">
                      <div className="flex items-center mb-2">
                        <input
                          type="text"
                          placeholder="Search products..."
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                          <button
                            type="button"
                            className="absolute right-2 text-gray-500"
                            onClick={() => setSearchTerm('')}
                          >
                            <span className="sr-only">Clear search</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <select
                        id="product_id"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={data.product_id}
                        onChange={e => setData('product_id', e.target.value)}
                        required
                        size={filteredProducts.length > 0 ? Math.min(5, filteredProducts.length) : 1}
                      >
                        <option value="">Select a product</option>
                        {filteredProducts.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - ৳{product.sale_price || product.price}
                          </option>
                        ))}
                      </select>
                      {filteredProducts.length === 0 && searchTerm && (
                        <p className="mt-1 text-sm text-red-600">No products match your search</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-32">
                    <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      id="sort_order"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={data.sort_order}
                      onChange={e => setData('sort_order', parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={processing || !data.product_id}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                  >
                    {processing ? 'Adding...' : 'Add to Featured'}
                  </button>
                </form>
              </div>

              {/* Featured Products List */}
              <div id="featured-products-list">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Current Featured Products</h2>
                  <div className="flex items-center space-x-2">
                    {showReorderSuccess && (
                      <span className="text-sm text-green-600 animate-pulse">Order updated successfully!</span>
                    )}
                    {isSaving && (
                      <span className="text-sm text-blue-600">Saving changes...</span>
                    )}
                    <button
                      onClick={reordering ? stopReordering : startReordering}
                      className={`px-3 py-1 rounded text-sm ${
                        reordering 
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                          : 'text-indigo-600 hover:text-indigo-800'
                      }`}
                      disabled={selectedProducts.length > 0}
                    >
                      {reordering ? 'Done Reordering' : 'Reorder Products'}
                    </button>
                  </div>
                </div>

                {selectedProducts.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="font-medium text-yellow-800">{selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setBatchActionOpen(!batchActionOpen)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded border border-yellow-300 flex items-center"
                        >
                          <span>Batch Actions</span>
                          <svg className={`ml-1 h-5 w-5 transform ${batchActionOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {batchActionOpen && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                type="button"
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                                onClick={handleBatchActivate}
                                disabled={isSaving}
                              >
                                <svg className="mr-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Activate All
                              </button>
                              <button
                                type="button"
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                                onClick={handleBatchDeactivate}
                                disabled={isSaving}
                              >
                                <svg className="mr-2 h-4 w-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                Deactivate All
                              </button>
                              <button
                                type="button"
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                                onClick={handleBatchRemove}
                                disabled={isSaving}
                              >
                                <svg className="mr-2 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Remove All
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedProducts([])}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {products.length > 0 && !reordering && (
                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        id="select-all"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={handleSelectAll}
                      />
                      <label htmlFor="select-all" className="ml-2 text-sm text-gray-700">
                        Select All
                      </label>
                    </div>
                  </div>
                )}

                {reordering && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Reordering Mode</h3>
                        <div className="mt-1 text-sm text-blue-700">
                          <p>Drag and drop products to change their order. Changes are saved automatically.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No featured products yet. Add some products above.
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="featured-products">
                      {(provided: DroppableProvided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-4"
                        >
                          {products.map((featuredProduct, index) => (
                            <Draggable
                              key={featuredProduct.id}
                              draggableId={featuredProduct.id.toString()}
                              index={index}
                              isDragDisabled={!reordering}
                            >
                              {(provided: DraggableProvided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                                    reordering 
                                      ? 'border-indigo-300 bg-indigo-50 shadow-md' 
                                      : selectedProducts.includes(featuredProduct.id)
                                        ? 'border-yellow-300 bg-yellow-50'
                                        : 'border-gray-200'
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row">
                                    {reordering ? (
                                      <div
                                        {...provided.dragHandleProps}
                                        className="flex items-center justify-center p-4 bg-indigo-100 cursor-move"
                                        title="Drag to reorder"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                        </svg>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center p-4">
                                        <input
                                          type="checkbox"
                                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                          checked={selectedProducts.includes(featuredProduct.id)}
                                          onChange={() => toggleProductSelection(featuredProduct.id)}
                                        />
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center p-4 flex-grow">
                                      <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden mr-4">
                                        <img
                                          src={
                                            featuredProduct.product.images && featuredProduct.product.images.length > 0
                                              ? `/storage/${featuredProduct.product.images[0].url}`
                                              : '/images/placeholder.jpg'
                                          }
                                          alt={featuredProduct.product.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = '/images/placeholder.jpg';
                                          }}
                                        />
                                      </div>
                                      
                                      <div className="flex-grow">
                                        <h3 className="font-medium text-gray-900">{featuredProduct.product.name}</h3>
                                        <div className="text-sm text-gray-500">
                                          {featuredProduct.product.sale_price ? (
                                            <>
                                              <span className="line-through mr-2">৳{featuredProduct.product.price}</span>
                                              <span className="text-indigo-600">৳{featuredProduct.product.sale_price}</span>
                                            </>
                                          ) : (
                                            <span>৳{featuredProduct.product.price}</span>
                                          )}
                                        </div>
                                        <div className="mt-1 flex items-center">
                                          <span className="text-sm text-gray-500 mr-3">Position: {featuredProduct.sort_order}</span>
                                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            featuredProduct.is_active
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-red-100 text-red-800'
                                          }`}>
                                            {featuredProduct.is_active ? 'Active' : 'Inactive'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex sm:flex-col justify-end p-4 space-x-2 sm:space-x-0 sm:space-y-2">
                                      <button
                                        onClick={() => handleToggleStatus(featuredProduct.id)}
                                        className={`inline-flex items-center px-3 py-1 border rounded text-sm ${
                                          featuredProduct.is_active
                                            ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                                            : 'border-green-300 text-green-700 hover:bg-green-50'
                                        }`}
                                      >
                                        {featuredProduct.is_active ? 'Deactivate' : 'Activate'}
                                      </button>
                                      <button
                                        onClick={() => handleRemoveProduct(featuredProduct.id)}
                                        className="inline-flex items-center px-3 py-1 border border-red-300 text-sm text-red-700 hover:bg-red-50 rounded"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 