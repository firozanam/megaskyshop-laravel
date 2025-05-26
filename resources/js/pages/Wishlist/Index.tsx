import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import ProductWishlistCard, { WishlistProductProps } from '@/components/ui/product-wishlist-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

interface WishlistProps {
  wishlistItems: WishlistProductProps[];
}

export default function Wishlist({ wishlistItems }: WishlistProps) {
  const [items, setItems] = useState<WishlistProductProps[]>(wishlistItems);

  const handleRemoveItem = (productId: number) => {
    setItems(prev => prev.filter(item => item.product_id !== productId));
  };

  return (
    <AppLayout>
      <Head title="My Wishlist" />
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-1">Products you've saved for later</p>
          </div>
          <Link href="/products">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {items.length === 0 ? (
          <Card className="border border-dashed border-gray-300 bg-white shadow-sm w-full">
            <CardContent className="py-12 sm:py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 mb-4">
                <HeartIcon className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="mb-6 text-gray-600 max-w-md mx-auto">Add products to your wishlist to save them for later.</p>
              <Link href="/products">
                <Button className="bg-blue-600 hover:bg-blue-700">Browse Products</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {items.map((item) => (
              <ProductWishlistCard 
                key={item.id} 
                product={item} 
                onRemove={handleRemoveItem} 
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
} 