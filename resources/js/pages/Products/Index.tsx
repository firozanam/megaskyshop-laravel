import React, { useState } from 'react';
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
import { ArrowsUpDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Product {
  id: number;
  name: string;
  price: number;
  sale_price?: number | null;
  slug: string;
  images: Array<{
    id: number;
    url?: string;
    image_path?: string;
    is_main?: boolean;
  }>;
  stock?: number;
  main_image?: string;
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
  };
  filters?: {
    sort?: string;
    category_id?: string;
    search?: string;
  };
}

export default function Index() {
  const { products, filters = {} } = usePage<ProductsPageProps>().props;
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(filters.search || '');

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

  return (
    <PublicLayout>
      <Head title="All Products" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
            <p className="text-gray-600 mt-1">{products.total} products available</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-4">
            {/* Search bar */}
            <form onSubmit={handleSearch} className="relative flex items-center">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by product name (min 3 characters)..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="pl-10 w-full md:w-64"
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
                className="ml-2 px-3" 
                variant="outline"
                disabled={searchTerm.length > 0 && searchTerm.length < 3}
              >
                Search
              </Button>
            </form>
            
            {/* Sort dropdown */}
            <div className="flex items-center gap-2">
              <ArrowsUpDownIcon className="h-5 w-5 text-gray-500" />
              <Select
                value={filters.sort || 'newest'}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-[180px]">
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
          </div>
        </div>
        
        {/* Search results indicator */}
        {filters.search && (
          <div className="mb-6 bg-blue-50 text-blue-700 px-4 py-2 rounded-md flex items-center justify-between">
            <div>
              <span className="font-medium">Search results for product name: </span>
              <span>"{filters.search}"</span>
              <span className="ml-2 text-sm">({products.total} products found)</span>
            </div>
            <button 
              onClick={clearSearch}
              className="text-blue-500 hover:text-blue-700 flex items-center"
            >
              <span className="mr-1">Clear</span>
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.data.length > 0 ? (
            products.data.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
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
              {filters.search && (
                <button
                  onClick={clearSearch}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear search and show all products
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Pagination */}
        <div className="mt-12">
          <Pagination 
            currentPage={products.current_page}
            lastPage={products.last_page}
            links={products.links}
          />
        </div>
      </div>
    </PublicLayout>
  );
} 