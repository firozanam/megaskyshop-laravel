import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function useWishlist(productId: number) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  
  // Check if the product is in the wishlist on initial load
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/user/wishlist/check', {
          params: { product_id: productId }
        });
        setIsInWishlist(response.data.in_wishlist);
      } catch (error) {
        console.error('Error checking wishlist status:', error);
        setIsInWishlist(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkWishlist();
  }, [productId]);
  
  const addToWishlist = async () => {
    if (isToggling) return;
    
    try {
      setIsToggling(true);
      const response = await axios.post('/user/wishlist/add', {
        product_id: productId
      });
      
      if (response.data.success) {
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      // Check if it's an authentication error
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error('Please log in to add items to your wishlist');
        // Redirect to login page
        window.location.href = '/login';
      } else {
        toast.error('Failed to add to wishlist');
      }
    } finally {
      setIsToggling(false);
    }
  };
  
  const removeFromWishlist = async () => {
    if (isToggling) return;
    
    try {
      setIsToggling(true);
      const response = await axios.delete('/user/wishlist/remove', {
        data: { product_id: productId }
      });
      
      if (response.data.success) {
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    } finally {
      setIsToggling(false);
    }
  };
  
  const toggleWishlist = async () => {
    if (isInWishlist) {
      await removeFromWishlist();
    } else {
      await addToWishlist();
    }
  };
  
  return {
    isInWishlist,
    isLoading,
    isToggling,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist
  };
} 