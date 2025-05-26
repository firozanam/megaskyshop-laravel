import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useCart } from '@/contexts/CartContext';

export interface ProductImage {
  id: number;
  url?: string;
  image_path?: string;
  is_main?: boolean;
}

export interface ProductProps {
  id: number;
  name: string;
  price: number;
  sale_price?: number | null;
  slug: string;
  images: ProductImage[];
  stock?: number;
  main_image?: string;
}

interface ProductCardProps {
  product: ProductProps;
  className?: string;
  priority?: boolean;
  showActions?: boolean;
}

export default function ProductCard({ 
  product, 
  className = '', 
  priority = false,
  showActions = true
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCart();
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCart(true);
    try {
      // Get the main image URL
      const imageUrl = getImageUrl();
      
      // Add to cart using the context
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        sale_price: product.sale_price || undefined,
        image: imageUrl,
        slug: product.slug,
        stock: product.stock,
      }, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setTimeout(() => setAddingToCart(false), 500);
    }
  };

  const getImageUrl = () => {
    if (imageError) {
      return '/images/placeholder.jpg';
    }
    
    // First try to use main_image from product if available
    if (product.main_image) {
      return `/storage/${product.main_image}`;
    }
    
    // Then check if images array exists and has items
    if (product.images && product.images.length > 0) {
      // Try to find the main image first
      const mainImage = product.images.find(img => img.is_main);
      if (mainImage) {
        // Use image_path if available, otherwise url
        if (mainImage.image_path) {
          return `/storage/${mainImage.image_path}`;
        } else if (mainImage.url) {
          return `/storage/${mainImage.url}`;
        }
      }
      
      // If no main image found, use the first image
      const firstImage = product.images[0];
      if (firstImage.image_path) {
        return `/storage/${firstImage.image_path}`;
      } else if (firstImage.url) {
        return `/storage/${firstImage.url}`;
    }
    }
    
    // Fallback to placeholder if no images found
    return '/images/placeholder.jpg';
  };
  
  const discount = product.sale_price && product.price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100) 
    : 0;

  return (
    <div className={`bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md group flex flex-col h-full ${className}`}>
      <Link href={`/products/${product.slug || product.id}`} className="block relative w-full pt-[100%] overflow-hidden bg-gray-100">
          {discount > 0 && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
              -{discount}%
            </div>
          )}
        {product.stock !== undefined && product.stock <= 0 && (
          <div className="absolute top-2 right-2">
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Out of Stock
            </span>
          </div>
        )}
          <img 
            src={getImageUrl()}
            alt={product.name}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
            onError={handleImageError}
          loading={priority ? "eager" : "lazy"}
          />
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">Image not available</span>
        </div>
        )}
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/products/${product.slug || product.id}`} className="flex-grow">
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-lg">
              {product.sale_price ? (
                <>
                  <span className="text-gray-400 line-through mr-2 text-sm">৳{product.price.toFixed(2)}</span>
                  <span className="text-gray-800">৳{product.sale_price.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-gray-800">৳{product.price.toFixed(2)}</span>
              )}
            </div>
            
            {product.stock !== undefined && (
              <div className="text-sm text-gray-500">
                {product.stock} in stock
              </div>
            )}
          </div>
      
      {showActions && (
            <div className="flex gap-2">
          <button 
                className={`flex-1 py-2 px-4 font-medium text-center text-sm rounded-md transition ${
                  product.stock !== undefined && product.stock <= 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : addingToCart
                    ? 'bg-blue-400 text-white cursor-wait'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            onClick={handleAddToCart}
                disabled={addingToCart || (product.stock !== undefined && product.stock <= 0)}
            aria-label="Add to cart"
          >
                {addingToCart ? 'Adding...' : product.stock !== undefined && product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <Link 
                href={`/products/${product.slug || product.id}`} 
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition text-center text-sm rounded-md"
            aria-label="View details"
          >
            View Details
          </Link>
        </div>
      )}
        </div>
      </div>
    </div>
  );
} 