import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { FormEvent, useState, useEffect, useMemo, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import ProductCard, { ProductProps } from '@/components/ui/product-card';

interface Product {
  id: number;
  name: string;
  price: number;
  sale_price: number | null;
  slug?: string;
  main_image?: string;
  images: Array<{
    id: number;
    url: string | null;
    image_path?: string | null;
    is_main?: boolean;
  }>;
  category?: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    parent_id?: number;
    image_path?: string;
    is_active?: number;
    sort_order?: number;
    created_at?: string;
    updated_at?: string;
  };
  category_id?: number;
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

const ProductImage = ({ product, className = "w-16 h-16" }: { product: Product; className?: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const getImageUrl = () => {
    // First try to use main_image from product if available
    if ('main_image' in product && product.main_image) {
      return `/storage/${product.main_image}`;
    }
    
    // Then check if images array exists and has items
    if (product.images && product.images.length > 0) {
      // Try to find the main image first
      const mainImage = product.images.find(img => img.is_main);
      if (mainImage) {
        // Use image_path if available, otherwise url
        if ('image_path' in mainImage && mainImage.image_path) {
          return `/storage/${mainImage.image_path}`;
        } else if (mainImage.url) {
          return `/storage/${mainImage.url}`;
        }
      }
      
      // If no main image found, use the first image
      const firstImage = product.images[0];
      if ('image_path' in firstImage && firstImage.image_path) {
        return `/storage/${firstImage.image_path}`;
      } else if (firstImage.url) {
        return `/storage/${firstImage.url}`;
      }
    }
    
    // Fallback to placeholder if no images found
    return '/images/placeholder.jpg';
  };

  const imageUrl = getImageUrl();

  return (
    <div className={`${className} flex-shrink-0 bg-gray-100 rounded overflow-hidden relative`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      <img
        src={imageUrl}
        alt={product.name}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={(e) => {
          setIsLoading(false);
          setHasError(true);
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = '/images/placeholder.jpg';
        }}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
};

const ProductDropdown = ({ 
  products, 
  value, 
  onChange, 
  searchTerm, 
  onSearchChange 
}: { 
  products: Product[];
  value: string;
  onChange: (value: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedProduct = products.find(p => p.id.toString() === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-col space-y-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full p-2 pr-8 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onClick={() => setIsOpen(true)}
          />
          {searchTerm && (
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => onSearchChange('')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        {selectedProduct && (
          <div className="flex items-center p-2 bg-indigo-50 border border-indigo-100 rounded-md">
            <ProductImage product={selectedProduct} className="w-12 h-12 mr-3" />
            <div className="flex-grow">
              <div className="font-medium text-gray-900">{selectedProduct.name}</div>
              <div className="text-sm text-gray-500">
                {selectedProduct.sale_price ? (
                  <>
                    <span className="line-through mr-2">৳{selectedProduct.price}</span>
                    <span className="text-indigo-600">৳{selectedProduct.sale_price}</span>
                  </>
                ) : (
                  <span>৳{selectedProduct.price}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600"
              onClick={() => onChange('')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {isOpen && products.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200">
          {products.map((product) => (
            <div
              key={product.id}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 ${
                product.id.toString() === value ? 'bg-indigo-50' : ''
              }`}
              onClick={() => {
                onChange(product.id.toString());
                setIsOpen(false);
              }}
            >
              <div className="flex items-center">
                <ProductImage product={product} className="w-10 h-10 mr-3" />
                <div className="flex-grow">
                  <div className="font-medium text-gray-900 truncate">{product.name}</div>
                  <div className="text-sm text-gray-500">
                    {product.sale_price ? (
                      <>
                        <span className="line-through mr-2">৳{product.price}</span>
                        <span className="text-indigo-600">৳{product.sale_price}</span>
                      </>
                    ) : (
                      <span>৳{product.price}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
    const activeProducts = products.filter(p => p.is_active).sort((a, b) => a.sort_order - b.sort_order);
    
    // Map the products to ensure image data is correctly formatted
    const formattedProducts = activeProducts.map(product => {
      // Create a copy of the product with properly typed images
      const formattedProduct = {
        ...product,
        product: {
          ...product.product,
          // Ensure images have both url and image_path with proper types
          images: (product.product.images || []).map(img => ({
            id: img.id,
            url: img.url || '',  // Ensure url is never null
            image_path: img.image_path || undefined,
            is_main: img.is_main || false
          })),
          // Ensure category data is included
          category: product.product.category,
          category_id: product.product.category?.id
        }
      };
      
      return formattedProduct;
    });
    
    setPreviewProducts(formattedProducts);
  }, [products]);

  // Debug preview products
  useEffect(() => {
    if (previewProducts.length > 0) {
      console.log('Preview Products:', previewProducts);
      console.log('First product images:', previewProducts[0]?.product?.images);
      console.log('First product category:', previewProducts[0]?.product?.category);
    }
  }, [previewProducts]);

  const handleAddProduct = (e: FormEvent) => {
    e.preventDefault();
    
    // Find the selected product
    const selectedProduct = availableProducts.find(p => p.id.toString() === data.product_id);
    if (!selectedProduct) return;

    // Create the new featured product object
    const newFeaturedProduct: FeaturedProduct = {
      id: Date.now(), // Temporary ID until server responds
      product_id: parseInt(data.product_id),
      product: selectedProduct,
      is_active: true,
      sort_order: data.sort_order
    };

    // Optimistically update the UI
    setProducts(prev => [...prev, newFeaturedProduct]);

    // Make the server request
    post(route('admin.homepage.featured-products.add'), {
      onSuccess: () => {
        setData('product_id', '');
        // No need to update products here as we already did it optimistically
      },
      onError: () => {
        // Revert the optimistic update on error
        setProducts(prev => prev.filter(p => p.id !== newFeaturedProduct.id));
      }
    });
  };

  const handleRemoveProduct = (id: number) => {
    if (confirm('Are you sure you want to remove this product from featured products?')) {
      // Find the product to be removed
      const productToRemove = products.find(p => p.id === id);
      if (!productToRemove) return;

      // Optimistically remove from local state
      setProducts(prev => prev.filter(p => p.id !== id));
      
      // Also remove from selected products if it was selected
      setSelectedProducts(prev => prev.filter(selectedId => selectedId !== id));
      
      // Also update preview if needed
      setPreviewProducts(prev => prev.filter(p => p.id !== id));

      // Make the server request
      router.delete(route('admin.homepage.featured-products.remove', id), {
        onError: () => {
          // Revert the optimistic update on error
          setProducts(prev => [...prev, productToRemove]);
          // Also revert preview if needed
          if (productToRemove.is_active) {
            setPreviewProducts(prev => [...prev, productToRemove]);
          }
        },
        preserveScroll: true
      });
    }
  };

  const handleToggleStatus = (id: number) => {
    // Find the product to toggle
    const productToToggle = products.find(p => p.id === id);
    if (!productToToggle) return;

    // Create updated product with new status
    const updatedProduct = {
      ...productToToggle,
      is_active: !productToToggle.is_active
    };

    // Optimistically update the UI
    setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
    
    // Update preview products
    if (updatedProduct.is_active) {
      setPreviewProducts(prev => [...prev, updatedProduct].sort((a, b) => a.sort_order - b.sort_order));
    } else {
      setPreviewProducts(prev => prev.filter(p => p.id !== id));
    }

    // Make the server request
    router.put(route('admin.homepage.featured-products.toggle', id), {
      is_active: updatedProduct.is_active
    }, {
      onError: () => {
        // Revert the optimistic update on error
        setProducts(prev => prev.map(p => p.id === id ? productToToggle : p));
        if (productToToggle.is_active) {
          setPreviewProducts(prev => [...prev, productToToggle].sort((a, b) => a.sort_order - b.sort_order));
        } else {
          setPreviewProducts(prev => prev.filter(p => p.id !== id));
        }
      },
      preserveScroll: true
    });
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
    
    // Use router.put instead of post with method: 'put'
    router.put(route('admin.homepage.featured-products.order'), {
      products: updatedItems.map(item => ({
        id: item.id,
        sort_order: item.sort_order
      }))
    }, {
      onSuccess: () => {
        setIsSaving(false);
        setShowReorderSuccess(true);
        setTimeout(() => setShowReorderSuccess(false), 3000);
      },
      preserveScroll: true
    });
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
    
    // Find all products to be updated
    const productsToUpdate = products.filter(p => selectedProducts.includes(p.id));
    
    // Create updated products
    const updatedProducts = productsToUpdate.map(p => ({ ...p, is_active: true }));
    
    // Optimistically update UI
    setProducts(prev => prev.map(p => 
      selectedProducts.includes(p.id) ? { ...p, is_active: true } : p
    ));
    
    // Update preview products
    setPreviewProducts(prev => {
      const newPreview = [...prev];
      updatedProducts.forEach(product => {
        if (!prev.find(p => p.id === product.id)) {
          newPreview.push(product);
        }
      });
      return newPreview.sort((a, b) => a.sort_order - b.sort_order);
    });
    
    setIsSaving(true);
    
    // Make parallel requests
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
    ).then((results) => {
      // Handle failed updates
      const failedProducts = results.map((success, index) => !success ? selectedProducts[index] : null)
        .filter((id): id is number => id !== null);
      
      if (failedProducts.length > 0) {
        // Revert changes for failed updates
        setProducts(prev => prev.map(p => 
          failedProducts.includes(p.id) ? productsToUpdate.find(original => original.id === p.id) || p : p
        ));
        
        // Revert preview changes
        setPreviewProducts(prev => {
          const revertedPreview = prev.filter(p => !failedProducts.includes(p.id));
          const activeFailedProducts = productsToUpdate
            .filter(p => failedProducts.includes(p.id) && p.is_active);
          return [...revertedPreview, ...activeFailedProducts].sort((a, b) => a.sort_order - b.sort_order);
        });
      }
      
      setIsSaving(false);
      setBatchActionOpen(false);
      setSelectedProducts([]);
    });
  };

  const handleBatchDeactivate = () => {
    if (selectedProducts.length === 0) return;
    
    // Find all products to be updated
    const productsToUpdate = products.filter(p => selectedProducts.includes(p.id));
    
    // Optimistically update UI
    setProducts(prev => prev.map(p => 
      selectedProducts.includes(p.id) ? { ...p, is_active: false } : p
    ));
    
    // Update preview products
    setPreviewProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
    
    setIsSaving(true);
    
    // Make parallel requests
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
    ).then((results) => {
      // Handle failed updates
      const failedProducts = results.map((success, index) => !success ? selectedProducts[index] : null)
        .filter((id): id is number => id !== null);
      
      if (failedProducts.length > 0) {
        // Revert changes for failed updates
        setProducts(prev => prev.map(p => 
          failedProducts.includes(p.id) ? productsToUpdate.find(original => original.id === p.id) || p : p
        ));
        
        // Revert preview changes
        const activeFailedProducts = productsToUpdate
          .filter(p => failedProducts.includes(p.id) && p.is_active);
        setPreviewProducts(prev => [...prev, ...activeFailedProducts].sort((a, b) => a.sort_order - b.sort_order));
      }
      
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
    
    // Find all products to be removed
    const productsToRemove = products.filter(p => selectedProducts.includes(p.id));
    
    // Optimistically update UI
    setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
    setPreviewProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
    
    // Make parallel requests to remove each selected product
    setIsSaving(true);
    
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
    ).then((results) => {
      // If any requests failed, revert the changes for those products
      const failedProducts = results.map((success, index) => !success ? selectedProducts[index] : null)
        .filter((id): id is number => id !== null);
      
      if (failedProducts.length > 0) {
        // Revert changes for failed removals
        const productsToRestore = productsToRemove.filter(p => failedProducts.includes(p.id));
        setProducts(prev => [...prev, ...productsToRestore]);
        setPreviewProducts(prev => [...prev, ...productsToRestore.filter(p => p.is_active)]);
      }
      
      setIsSaving(false);
      setBatchActionOpen(false);
      setSelectedProducts([]);
    });
  };

  return (
    <AdminLayout>
      <Head title="Manage Featured Products" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb Navigation - Update styles */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link 
              href={route('admin.homepage.index')} 
              className="hover:text-indigo-600 transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Homepage Sections
            </Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-medium text-gray-900">Featured Products</span>
          </nav>

          {/* Main Content Card - Update styles */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Manage Featured Products
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Curate the products that will be showcased in your homepage's Featured Products section
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                      showPreview
                        ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {showPreview ? 'Hide Preview' : 'Preview Section'}
                  </button>
                  <Link 
                    href={route('admin.homepage.index')}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    Back
                  </Link>
                </div>
              </div>

              {/* Preview Section - Update animation and styles */}
              {showPreview && (
                <div className="mb-8 border border-gray-200 rounded-xl overflow-hidden animate-fadeIn">
                  <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                      Homepage Preview
                    </h2>
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                      {previewProducts.length} active product{previewProducts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="p-6 bg-gray-50">
                    <h3 className="text-2xl font-bold text-center mb-6">Featured Products</h3>
                    
                    {previewProducts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No active featured products to display on the homepage.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                        {previewProducts.map(featuredProduct => {
                          // Prepare images for ProductCard with proper type handling
                          const productImages = featuredProduct.product.images.map(img => ({
                            id: img.id,
                            url: img.url || '',
                            image_path: img.image_path || undefined,
                            is_main: img.is_main || false
                          }));
                          
                          return (
                            <ProductCard 
                              key={featuredProduct.id}
                              product={{
                                id: featuredProduct.product.id,
                                name: featuredProduct.product.name,
                                price: featuredProduct.product.price,
                                sale_price: featuredProduct.product.sale_price,
                                slug: featuredProduct.product.slug || `product-${featuredProduct.product.id}`,
                                main_image: featuredProduct.product.main_image,
                                images: productImages,
                                stock: 1000, // Default stock value for preview
                                category: featuredProduct.product.category, // Add category data
                                category_id: featuredProduct.product.category?.id // Add category_id
                              }}
                              className="h-auto w-full"
                              showActions={false}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-100 p-3 border-t border-gray-300 text-center text-sm text-gray-500">
                    This is a preview of how the featured products section will appear on the homepage
                  </div>
                </div>
              )}

              {/* Add Product Form - Update styles */}
              <div className="mb-8 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Featured Product
                  </h2>
                  <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-8">
                      <label htmlFor="product_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Product
                      </label>
                      <ProductDropdown
                        products={filteredProducts}
                        value={data.product_id}
                        onChange={value => setData('product_id', value)}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-1">
                        Display Order
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </div>
                        <input
                          type="number"
                          id="sort_order"
                          className="block w-full pl-10 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-center"
                          value={data.sort_order}
                          onChange={e => setData('sort_order', parseInt(e.target.value) || 1)}
                          min="1"
                          step="1"
                        />
                        <div className="absolute inset-y-0 right-0 flex">
                          <div className="flex flex-col border-l border-gray-300 divide-y divide-gray-300">
                            <button
                              type="button"
                              className="flex-1 px-1 bg-gray-50 hover:bg-gray-100 text-gray-500 focus:outline-none"
                              onClick={() => setData('sort_order', data.sort_order + 1)}
                              tabIndex={-1}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="flex-1 px-1 bg-gray-50 hover:bg-gray-100 text-gray-500 focus:outline-none"
                              onClick={() => setData('sort_order', Math.max(1, data.sort_order - 1))}
                              tabIndex={-1}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 flex flex-col justify-end mt-6">
                      <button
                        type="submit"
                        disabled={processing || !data.product_id}
                        className="h-10 inline-flex justify-center items-center px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                      >
                        {processing ? 'Adding...' : 'Add to Featured'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Featured Products List - Update styles */}
              <div id="featured-products-list" className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Current Featured Products
                  </h2>
                  <div className="flex items-center space-x-3">
                    {showReorderSuccess && (
                      <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200 animate-pulse">
                        Order updated successfully!
                      </span>
                    )}
                    {isSaving && (
                      <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                        Saving changes...
                      </span>
                    )}
                    <button
                      onClick={reordering ? stopReordering : startReordering}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                        reordering 
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                          : 'text-indigo-600 hover:bg-indigo-50'
                      }`}
                      disabled={selectedProducts.length > 0}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
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
                                      <ProductImage product={featuredProduct.product} className="w-16 h-16 mr-4" />
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