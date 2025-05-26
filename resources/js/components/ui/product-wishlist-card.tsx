import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useCart } from '@/contexts/CartContext';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export interface ProductImage {
  id: number;
  url?: string;
  image_path?: string;
  is_main?: boolean;
}

export interface WishlistProductProps {
  id: number;
  product_id: number;
  name: string;
  price: number;
  description?: string;
  main_image?: string;
  images?: ProductImage[];
  created_at?: string;
}

interface ProductWishlistCardProps {
  product: WishlistProductProps;
  className?: string;
  onRemove?: (productId: number) => void;
}

export default function ProductWishlistCard({ 
  product, 
  className = '',
  onRemove
}: ProductWishlistCardProps) {
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [removing, setRemoving] = useState(false);
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
        id: product.product_id,
        name: product.name,
        price: product.price,
        image: imageUrl,
        slug: product.product_id.toString(),
      }, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setTimeout(() => setAddingToCart(false), 500);
    }
  };

  const handleRemoveFromWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (removing) return;
    
    setRemoving(true);
    try {
      await axios.delete('/user/wishlist/remove', {
        data: { product_id: product.product_id }
      });
      
      if (onRemove) {
        onRemove(product.product_id);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemoving(false);
    }
  };

  const getImageUrl = () => {
    if (imageError) {
      return '/images/placeholder.jpg';
    }
    
    // First try to use main_image from product if available
    if (product.main_image) {
      if (product.main_image.startsWith('http')) {
        return product.main_image;
      }
      if (product.main_image.startsWith('/storage/')) {
        return product.main_image;
      }
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
          return mainImage.url;
        }
      }
      
      // If no main image found, use the first image
      const firstImage = product.images[0];
      if (firstImage.image_path) {
        return `/storage/${firstImage.image_path}`;
      } else if (firstImage.url) {
        return firstImage.url;
      }
    }
    
    // Fallback to placeholder if no images found
    return '/images/placeholder.jpg';
  };

  return (
    <div className={`bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md group flex flex-col h-full ${className}`}>
      <div className="relative">
        <Link href={`/products/${product.product_id}`} className="block relative w-full pt-[100%] overflow-hidden bg-gray-100">
          <img 
            src={getImageUrl()}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
            onError={handleImageError}
            loading="lazy"
          />
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">Image not available</span>
            </div>
          )}
        </Link>
        
        <button 
          onClick={handleRemoveFromWishlist}
          disabled={removing}
          className="absolute top-2 right-2 p-1.5 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-sm z-10 transition-all duration-200 hover:bg-red-50 text-gray-500 hover:text-red-500"
          aria-label="Remove from wishlist"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/products/${product.product_id}`} className="flex-grow">
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
        </Link>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="mt-auto">
          <div className="font-bold text-lg mb-4">
            <span className="text-gray-800">৳{product.price}</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              className={`flex-1 py-2 px-4 font-medium text-center text-sm rounded-md transition flex items-center justify-center gap-1 ${
                addingToCart
                  ? 'bg-blue-400 text-white cursor-wait'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              onClick={handleAddToCart}
              disabled={addingToCart}
              aria-label="Add to cart"
            >
              {addingToCart ? (
                'Adding...'
              ) : (
                <>
                  <ShoppingCartIcon className="h-4 w-4" /> 
                  Add to Cart
                </>
              )}
            </button>
            <Link 
              href={`/products/${product.product_id}`} 
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition text-center text-sm rounded-md"
              aria-label="View details"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 