import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import ProductCard from '@/components/ui/product-card';
import { Pagination } from '@/components/pagination';
import PublicLayout from '@/layouts/public-layout';
import { PageProps } from '@inertiajs/core';

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
}

export default function Index() {
  const { products } = usePage<ProductsPageProps>().props;

  return (
    <PublicLayout>
      <Head title="All Products" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
            <p className="text-gray-600 mt-1">{products.total} products available</p>
          </div>
          
          {/* Placeholder for future filters and search */}
          <div className="mt-4 sm:mt-0">
            {/* Search and filters will be added later */}
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