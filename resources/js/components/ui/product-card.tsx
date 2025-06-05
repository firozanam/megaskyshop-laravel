import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useCart } from '@/contexts/CartContext';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import useWishlist from '@/hooks/useWishlist';

export interface ProductImage {
  id: number;
  url?: string;
  image_path?: string;
  is_main?: boolean;
  product_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductProps {
  id: number;
  name: string;
  price: number | string;
  sale_price?: number | string | null;
  slug?: string;
  images: ProductImage[];
  stock?: number;
  main_image?: string;
  category_id?: number;
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
  avg_rating?: string | number;
  description?: string;
}

interface ProductCardProps {
  product: ProductProps;
  className?: string;
  priority?: boolean;
  showActions?: boolean;
}

// Utility function to ensure numeric values
const ensureNumeric = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) {
    return 0;
  }
  return typeof value === 'string' ? parseFloat(value) : value;
};

export default function ProductCard({ 
  product, 
  className = '', 
  priority = false,
  showActions = true
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, isToggling, toggleWishlist } = useWishlist(product.id);
  
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
        price: ensureNumeric(product.price),
        sale_price: product.sale_price ? ensureNumeric(product.sale_price) : undefined,
        image: imageUrl,
        slug: product.slug || `product-${product.id}`,
        stock: product.stock,
      }, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setTimeout(() => setAddingToCart(false), 500);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist();
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
  
  const price = ensureNumeric(product.price);
  const salePrice = product.sale_price ? ensureNumeric(product.sale_price) : null;
  
  const discount = salePrice && price 
    ? Math.round(((price - salePrice) / price) * 100) 
    : 0;

  // Convert avg_rating to a number between 0-5
  const rating = product.avg_rating 
    ? Math.min(5, Math.max(0, ensureNumeric(product.avg_rating)))
    : 0;

  // Get category name
  const categoryName = product.category?.name || '';

  return (
    <div className={`bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md group flex flex-col ${className}`}>
      <Link href={`/products/${product.slug || product.id}`} className="block relative w-full pt-[60%] xs:pt-[65%] sm:pt-[70%] overflow-hidden bg-gray-100">
          {discount > 0 && (
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-yellow-500 text-white text-[10px] xs:text-[11px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full z-10">
              -{discount}%
            </div>
          )}
        {product.stock !== undefined && product.stock <= 0 && (
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
            <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] xs:text-[11px] sm:text-xs font-medium">
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
            <span className="text-gray-400 text-xs">Image not available</span>
          </div>
        )}
        
        {/* Wishlist button */}
        <button 
          onClick={handleToggleWishlist}
          disabled={isToggling}
          className="absolute top-1 sm:top-2 left-1 sm:left-2 p-1 sm:p-1.5 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-sm z-10 transition-all duration-200"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isInWishlist ? (
            <HeartIconSolid className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-500 hover:text-red-500" />
          )}
        </button>
      </Link>
      
      <div className="p-1.5 xs:p-2 sm:p-2.5 md:p-3 flex flex-col flex-grow">
        {/* Category label */}
        {categoryName && (
          <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500 truncate">
            {categoryName}
          </div>
        )}

        <Link href={`/products/${product.slug || product.id}`} className="flex-grow">
          <h3 className="font-semibold text-[11px] xs:text-xs sm:text-sm md:text-base mb-0.5 sm:mb-1 hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.0em]">
            {product.name}
          </h3>
        </Link>
        
        {/* Star rating */}
        <div className="flex items-center mb-0.5 sm:mb-1">
          {[...Array(5)].map((_, i) => (
            <svg 
              key={i} 
              className={`h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          {rating > 0 && (
            <span className="ml-0.5 sm:ml-1 text-[8px] xs:text-[9px] sm:text-xs text-gray-500">({rating.toFixed(1)})</span>
          )}
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <div className="font-bold text-[11px] xs:text-xs sm:text-sm md:text-base">
              {salePrice ? (
                <>
                  <span className="text-gray-400 line-through mr-0.5 sm:mr-1 text-[8px] xs:text-[9px] sm:text-xs">৳{price.toFixed(2)}</span>
                  <span className="text-gray-800">৳{salePrice.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-gray-800">৳{price.toFixed(2)}</span>
              )}
            </div>
            
            {product.stock !== undefined && (
              <div className="text-[8px] xs:text-[9px] sm:text-xs text-gray-500 truncate">
                {product.stock} in stock
              </div>
            )}
          </div>
      
          {showActions && (
            <div className="flex gap-1">
              <button 
                className={`flex-1 py-0.5 xs:py-0.5 sm:py-1 px-0.5 xs:px-1 sm:px-2 font-medium text-center text-[9px] xs:text-[10px] sm:text-xs rounded transition ${
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
                className="flex-1 py-0.5 xs:py-0.5 sm:py-1 px-0.5 xs:px-1 sm:px-2 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition text-center text-[9px] xs:text-[10px] sm:text-xs rounded"
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