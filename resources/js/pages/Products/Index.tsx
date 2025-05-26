import React from 'react';
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
import { ArrowsUpDownIcon } from '@heroicons/react/24/outline';

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

  const handleSortChange = (value: string) => {
    // Update the URL with the new sort parameter without refreshing the page
    router.get(
      route('products.index'),
      { ...filters, sort: value },
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
          
          {/* Sort dropdown */}
          <div className="mt-4 sm:mt-0">
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
        
        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.data.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
            />
          ))}
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