import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import ProductCard from '@/components/ui/product-card';
import { Pagination } from '@/components/pagination';
import PublicLayout from '@/layouts/public-layout';
import { PageProps } from '@inertiajs/core';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowsUpDownIcon, MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface Product {
  id: number;
  name: string;
  price: number | string;
  sale_price?: number | string | null;
  slug?: string;
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
  images: Array<{
    id: number;
    url?: string;
    image_path?: string;
    is_main?: boolean;
    product_id?: number;
    created_at?: string;
    updated_at?: string;
  }>;
  stock?: number;
  main_image?: string;
  avg_rating?: string | number;
  description?: string;
  meta_description?: string;
  meta_title?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProductsPageProps extends PageProps {
  products: {
    data: Product[];
    current_page: number;
    last_page: number;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    total: number;
    from?: number;
    to?: number;
    per_page?: number;
    path?: string;
    first_page_url?: string;
    last_page_url?: string;
    next_page_url?: string | null;
    prev_page_url?: string | null;
  };
  categories: any[];
  filters?: {
    sort?: string;
    category_id?: string;
    search?: string;
    price_min?: string;
    price_max?: string;
    stock_status?: string;
    rating?: string;
  };
}

export default function Index() {
  const { products, filters = {}, categories } = usePage<ProductsPageProps>().props;
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(filters.search || '');
  const [categoryId, setCategoryId] = useState(filters.category_id || '');
  const [priceRange, setPriceRange] = useState({ min: filters.price_min || '', max: filters.price_max || '' });
  const [stockStatus, setStockStatus] = useState(filters.stock_status || '');
  const [ratingFilter, setRatingFilter] = useState(filters.rating || '');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 1024) { // lg breakpoint
        setMobileFiltersOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle search term changes with minimum 3 characters requirement
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    // If search term is cleared, immediately clear the search
    if (!value.trim()) {
      clearSearch();
      return;
    }
    
    // If search term is at least 3 characters, debounce the search
    if (value.trim().length >= 3) {
      // Clear any existing timeout
      const timeoutId = setTimeout(() => {
        setDebouncedSearchTerm(value);
        // Update the URL with the search parameter without refreshing the page
        router.get(
          route('products.index'),
          { ...filters, search: value },
          { preserveState: true, preserveScroll: true }
        );
      }, 500); // 500ms debounce time
      
      return () => clearTimeout(timeoutId);
    }
  };

  const handleSortChange = (value: string) => {
    // Update the URL with the new sort parameter without refreshing the page
    router.get(
      route('products.index'),
      { ...filters, sort: value },
      { preserveState: true, preserveScroll: true }
    );
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only search if there are at least 3 characters
    if (searchTerm.trim().length >= 3) {
      // Update the URL with the search parameter without refreshing the page
      router.get(
        route('products.index'),
        { ...filters, search: searchTerm },
        { preserveState: true, preserveScroll: true }
      );
    }
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    // Remove the search parameter from the URL
    const { search, ...restFilters } = filters;
    router.get(
      route('products.index'),
      restFilters,
      { preserveState: true, preserveScroll: true }
    );
  };

  // Filter handler functions
  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    router.get(
      route('products.index'),
      { ...filters, category_id: value || undefined },
      { preserveState: true, preserveScroll: true }
    );
  };

  const handlePriceRangeChange = (min: string, max: string) => {
    setPriceRange({ min, max });
    
    const updatedFilters = { ...filters };
    
    if (min) {
      updatedFilters.price_min = min;
    } else {
      delete updatedFilters.price_min;
    }
    
    if (max) {
      updatedFilters.price_max = max;
    } else {
      delete updatedFilters.price_max;
    }
    
    router.get(
      route('products.index'),
      updatedFilters,
      { preserveState: true, preserveScroll: true }
    );
  };

  const handleStockStatusChange = (value: string) => {
    setStockStatus(value);
    router.get(
      route('products.index'),
      { ...filters, stock_status: value || undefined },
      { preserveState: true, preserveScroll: true }
    );
  };

  const handleRatingChange = (value: string) => {
    setRatingFilter(value);
    router.get(
      route('products.index'),
      { ...filters, rating: value || undefined },
      { preserveState: true, preserveScroll: true }
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setCategoryId('');
    setPriceRange({ min: '', max: '' });
    setStockStatus('');
    setRatingFilter('');
    
    router.get(
      route('products.index'),
      {},
      { preserveState: true, preserveScroll: true }
    );
  };

  // Render the filters section
  const renderFilters = () => (
    <div className="w-full space-y-6">
      {/* Active filters */}
      {(filters.category_id || filters.price_min || filters.price_max || filters.stock_status || filters.rating) && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-blue-800">Active Filters</h3>
            <button 
              onClick={clearAllFilters}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.category_id && categories.find(c => c.id.toString() === filters.category_id) && (
              <div className="bg-white px-2 py-1 rounded-full text-xs flex items-center border border-blue-200">
                <span>Category: {categories.find(c => c.id.toString() === filters.category_id)?.name}</span>
                <button 
                  onClick={() => handleCategoryChange('')}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            )}
            {(filters.price_min || filters.price_max) && (
              <div className="bg-white px-2 py-1 rounded-full text-xs flex items-center border border-blue-200">
                <span>Price: {filters.price_min ? `৳${filters.price_min}` : '0'} - {filters.price_max ? `৳${filters.price_max}` : 'Any'}</span>
                <button 
                  onClick={() => handlePriceRangeChange('', '')}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.stock_status && (
              <div className="bg-white px-2 py-1 rounded-full text-xs flex items-center border border-blue-200">
                <span>Stock: {filters.stock_status === 'in_stock' ? 'In Stock' : 'All'}</span>
                <button 
                  onClick={() => handleStockStatusChange('')}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.rating && (
              <div className="bg-white px-2 py-1 rounded-full text-xs flex items-center border border-blue-200">
                <span>Rating: {filters.rating}+ Stars</span>
                <button 
                  onClick={() => handleRatingChange('')}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Shop Categories filter */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Shop Categories</h3>
        </div>
        <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
          <div className="flex items-center">
            <input
              id="category-all"
              type="radio"
              name="category"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={!categoryId}
              onChange={() => handleCategoryChange('')}
            />
            <label htmlFor="category-all" className="ml-2 text-sm text-gray-700">
              All Categories
            </label>
          </div>
          
          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <input
                id={`category-${category.id}`}
                type="radio"
                name="category"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={categoryId === category.id.toString()}
                onChange={() => handleCategoryChange(category.id.toString())}
              />
              <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-700">
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Price Range filter */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Filter by Price</h3>
        </div>
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <div>
              <label htmlFor="price-min" className="block text-xs text-gray-500 mb-1">
                Min Price
              </label>
              <Input
                id="price-min"
                type="number"
                placeholder="0"
                min="0"
                value={priceRange.min}
                onChange={(e) => handlePriceRangeChange(e.target.value, priceRange.max)}
                className="h-9 text-sm"
              />
            </div>
            <div className="pt-5">—</div>
            <div>
              <label htmlFor="price-max" className="block text-xs text-gray-500 mb-1">
                Max Price
              </label>
              <Input
                id="price-max"
                type="number"
                placeholder="Any"
                min="0"
                value={priceRange.max}
                onChange={(e) => handlePriceRangeChange(priceRange.min, e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <Button 
            onClick={() => handlePriceRangeChange(priceRange.min, priceRange.max)}
            className="w-full mt-3 text-sm h-8"
            size="sm"
          >
            Apply
          </Button>
        </div>
      </div>
      
      {/* Stock Availability filter */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Stock Availability</h3>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center">
            <input
              id="stock-all"
              type="radio"
              name="stock"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={!stockStatus}
              onChange={() => handleStockStatusChange('')}
            />
            <label htmlFor="stock-all" className="ml-2 text-sm text-gray-700">
              All Products
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="stock-in-stock"
              type="radio"
              name="stock"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={stockStatus === 'in_stock'}
              onChange={() => handleStockStatusChange('in_stock')}
            />
            <label htmlFor="stock-in-stock" className="ml-2 text-sm text-gray-700">
              In Stock Only
            </label>
          </div>
        </div>
      </div>
      
      {/* Rating filter */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Customer Rating</h3>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center">
            <input
              id="rating-all"
              type="radio"
              name="rating"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={!ratingFilter}
              onChange={() => handleRatingChange('')}
            />
            <label htmlFor="rating-all" className="ml-2 text-sm text-gray-700">
              All Ratings
            </label>
          </div>
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center">
              <input
                id={`rating-${rating}`}
                type="radio"
                name="rating"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={ratingFilter === rating.toString()}
                onChange={() => handleRatingChange(rating.toString())}
              />
              <label htmlFor={`rating-${rating}`} className="ml-2 text-sm text-gray-700 flex items-center">
                <span className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </span>
                <span className="ml-1">& Up</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <PublicLayout>
      <Head title="All Products" />
      
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Products</h1>
            <p className="text-gray-600 mt-1">{products.total} products available</p>
          </div>
          
          <div className="mt-4 sm:mt-0 w-full sm:w-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search bar */}
            <form onSubmit={handleSearch} className="relative flex items-center w-full sm:w-auto">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="pl-10 w-full"
                  aria-label="Search products by name"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </button>
                )}
                {searchTerm && searchTerm.length > 0 && searchTerm.length < 3 && (
                  <div className="absolute mt-1 text-xs text-amber-600">
                    Please enter at least 3 characters to search
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                className="ml-2 px-3 hidden sm:flex" 
                variant="outline"
                disabled={searchTerm.length > 0 && searchTerm.length < 3}
              >
                Search
              </Button>
            </form>
            
            {/* Sort dropdown and filter button for mobile */}
            <div className="flex items-center gap-2 justify-between w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <ArrowsUpDownIcon className="h-5 w-5 text-gray-500" />
                <Select
                  value={filters.sort || 'newest'}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-[140px] sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      <SelectItem value="name_asc">Name: A to Z</SelectItem>
                      <SelectItem value="name_desc">Name: Z to A</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Mobile filter button */}
              <Button 
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                aria-label="Toggle filters"
              >
                <FunnelIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Search results indicator */}
        {filters.search && (
          <div className="mb-6 bg-blue-50 text-blue-700 px-3 sm:px-4 py-2 rounded-md flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <span className="font-medium">Search results: </span>
              <span className="sm:ml-1">"{filters.search}"</span>
              <span className="sm:ml-2 text-sm">({products.total} products found)</span>
            </div>
            <button 
              onClick={clearSearch}
              className="self-end sm:self-auto text-blue-500 hover:text-blue-700 flex items-center mt-2 sm:mt-0"
            >
              <span className="mr-1">Clear</span>
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main content with filters and products */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Mobile filters overlay */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
              <div 
                className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl p-6 z-50 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button 
                    type="button" 
                    className="-mr-2 p-2 rounded-md text-gray-400 hover:text-gray-500"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                {renderFilters()}
              </div>
            </div>
          )}
          
          {/* Desktop filters sidebar */}
          <div className="hidden lg:block w-full lg:w-1/4">
            {renderFilters()}
          </div>
          
          {/* Products grid */}
          <div className="w-full lg:w-3/4">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 xs:gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
              {products.data.length > 0 ? (
                products.data.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    className="h-auto w-full"
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                  <p className="text-gray-500">
                    {filters.search 
                      ? `We couldn't find any products with name containing "${filters.search}"`
                      : "There are no products available at the moment."}
                  </p>
                  {(filters.search || filters.category_id || filters.price_min || filters.price_max || filters.stock_status || filters.rating) && (
                    <button
                      onClick={clearAllFilters}
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear all filters and show all products
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Pagination */}
            <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12">
              <Pagination 
                currentPage={products.current_page}
                lastPage={products.last_page}
                links={products.links}
              />
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
} 