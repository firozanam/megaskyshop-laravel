import React, { useState, useEffect } from 'react';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import ProductCard from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  MinusIcon, 
  PlusIcon, 
  Check, 
  ShoppingCart, 
  Star, 
  StarHalf, 
  Heart, 
  Truck, 
  ShieldCheck, 
  ZapIcon, 
  ArrowRight,
  BadgeCheck,
  XIcon as XMarkIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PageProps } from '@inertiajs/core';
import { useCart } from '@/contexts/CartContext';
import useWishlist from '@/hooks/useWishlist';
import { toast } from 'react-hot-toast';

interface ProductImage {
  id: number;
  url?: string;
  image_path?: string;
  is_main?: boolean;
}

interface ReviewUser {
  id: number;
  name: string;
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  name?: string;
  is_anonymous: boolean;
  created_at: string;
  user?: ReviewUser;
}

interface Product {
  id: number;
  name: string;
  price: number;
  sale_price?: number | null;
  description?: string;
  slug: string;
  images: ProductImage[];
  stock?: number;
  main_image?: string;
  avg_rating?: number;
  reviews: Review[];
}

interface ProductDetailsPageProps extends PageProps {
  product: Product;
  relatedProducts: Product[];
  auth: {
    user: null | {
      id: number;
      name: string;
      email: string;
    }
  }
}

interface ReviewFormErrors {
  rating?: string;
  comment?: string;
  name?: string;
  is_anonymous?: string;
  auth?: string;
  purchase?: string;
  existing?: string;
}

declare global {
  interface Window {
    fbq?: (event: string, name: string, params?: any) => void;
  }
}

export default function Show() {
  const { product, relatedProducts, auth } = usePage<ProductDetailsPageProps>().props;
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const { isInWishlist, isToggling, toggleWishlist } = useWishlist(product.id);
  const [processingBuyNow, setProcessingBuyNow] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // Facebook Pixel ViewContent tracking
  useEffect(() => {
    if (window.fbq && product) {
      window.fbq('track', 'ViewContent', {
        content_type: 'product',
        content_ids: [product.id.toString()],
        content_name: product.name,
        content_category: 'Product',
        value: product.sale_price ? parseFloat(product.sale_price.toString()) : parseFloat(product.price.toString()),
        currency: 'BDT'
      });
    }
  }, [product]);
  
  // Check if the user has purchased this product and can review it
  const canReview = Boolean(auth.user) && !product.reviews.some(review => 
    review.user && review.user.id === auth.user?.id
  );
  
  // Review form state with properly typed errors
  const { data, setData, post, processing, errors, reset } = useForm({
    rating: 5,
    comment: '',
    name: '',
    is_anonymous: false
  });
  
  // Cast errors to the appropriate type for accessing custom error fields
  const formErrors = errors as unknown as ReviewFormErrors;
  
  const getImageUrl = (image: ProductImage): string => {
    try {
      if (image && image.image_path) {
        return `/storage/${image.image_path}`;
      } else if (image && image.url) {
        return `/storage/${image.url}`;
      } else if (product.main_image) {
        return `/storage/${product.main_image}`;
      }
    } catch (error) {
      console.error('Error getting image URL:', error);
    }
    return '/images/placeholder.jpg';
  };
  
  const mainImageUrl = selectedImage || (product.images && product.images.length > 0 
    ? getImageUrl(product.images[0]) 
    : product.main_image 
      ? `/storage/${product.main_image}` 
      : '/images/placeholder.jpg');
  
  const discount = product.sale_price && product.price 
    ? Math.round(((parseFloat(product.price.toString()) - parseFloat(product.sale_price.toString())) / parseFloat(product.price.toString())) * 100) 
    : 0;
    
  const inStock = product.stock === undefined || product.stock > 0;
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && (product.stock === undefined || newQuantity <= product.stock)) {
      setQuantity(newQuantity);
    }
  };
  
  const { addItem } = useCart();
  
  const handleAddToCart = () => {
    setAddingToCart(true);
    
    // Get the main image URL using our getImageUrl function
    const imageUrl = product.images && product.images.length > 0 
      ? getImageUrl(product.images[0]) 
      : product.main_image 
        ? `/storage/${product.main_image}` 
        : '/images/placeholder.jpg';
    
    // Add to cart
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price.toString()),
      sale_price: product.sale_price ? parseFloat(product.sale_price.toString()) : undefined,
      image: imageUrl,
      slug: product.slug,
      stock: product.stock,
    }, quantity);
    
    // Track AddToCart event with Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_type: 'product',
        content_ids: [product.id.toString()],
        content_name: product.name,
        value: (product.sale_price ? parseFloat(product.sale_price.toString()) : parseFloat(product.price.toString())) * quantity,
        currency: 'BDT',
        contents: [
          {
            id: product.id.toString(),
            quantity: quantity,
            item_price: product.sale_price ? parseFloat(product.sale_price.toString()) : parseFloat(product.price.toString())
          }
        ]
      });
    }
    
    // Show success feedback
    setTimeout(() => {
      setAddingToCart(false);
    }, 500);
  };
  
  const submitReview = () => {
    post(route('products.review', product.id), {
      onSuccess: () => {
        reset();
        setIsReviewFormOpen(false);
      },
    });
  };
  
  // Function to render stars based on rating
  const renderStars = (rating: number, size = 16) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="fill-yellow-400 text-yellow-400" size={size} />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className="fill-yellow-400 text-yellow-400" size={size} />
      );
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="text-gray-300" size={size} />
      );
    }
    
    return stars;
  };

  const handleBuyNow = () => {
    if (!inStock || processingBuyNow) return;
    
    setProcessingBuyNow(true);
    
    try {
      // First add to cart using our getImageUrl function
      const imageUrl = product.images && product.images.length > 0 
        ? getImageUrl(product.images[0]) 
        : product.main_image 
          ? `/storage/${product.main_image}` 
          : '/images/placeholder.jpg';
      
      addItem({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price.toString()),
        sale_price: product.sale_price ? parseFloat(product.sale_price.toString()) : undefined,
        image: imageUrl,
        slug: product.slug,
        stock: product.stock,
      }, quantity);
      
      // Track AddToCart event with Facebook Pixel
      if (window.fbq) {
        window.fbq('track', 'AddToCart', {
          content_type: 'product',
          content_ids: [product.id.toString()],
          content_name: product.name,
          value: (product.sale_price ? parseFloat(product.sale_price.toString()) : parseFloat(product.price.toString())) * quantity,
          currency: 'BDT',
          contents: [
            {
              id: product.id.toString(),
              quantity: quantity,
              item_price: product.sale_price ? parseFloat(product.sale_price.toString()) : parseFloat(product.price.toString())
            }
          ]
        });
      }
      
      // Then redirect to checkout
      window.location.href = '/checkout';
    } catch (error) {
      console.error('Error processing buy now:', error);
      toast.error('Failed to process your order. Please try again.');
    } finally {
      setProcessingBuyNow(false);
    }
  };

  return (
    <PublicLayout>
      <Head title={product.name} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Breadcrumb with schema support */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <Link href={route('products.index')} className="text-gray-500 hover:text-gray-700 text-sm">
                    Products
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-700 text-sm font-medium truncate max-w-[200px]">
                    {product.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        
        {/* Product Details Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left Column - Product Images */}
            <div className="p-6 space-y-6 border-r border-gray-100">
              {/* Main image with enhanced styling */}
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 relative shadow-sm hover:shadow transition-shadow">
                {discount > 0 && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white font-medium px-3 py-1.5 rounded-full z-10 shadow-sm flex items-center">
                    <span className="mr-1">-{discount}%</span>
                  </div>
                )}
                {!inStock && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                    Out of Stock
                  </div>
                )}
                <img 
                  src={mainImageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder.jpg';
                  }}
                />
              </div>
              
              {/* Image thumbnails with improved styling */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      className={`aspect-square rounded-md overflow-hidden border transition-all ${
                        getImageUrl(image) === selectedImage 
                          ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedImage(getImageUrl(image))}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Right Column - Product Info with enhanced styling */}
            <div className="p-6 flex flex-col bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${isInWishlist ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-500'}`}
                  onClick={toggleWishlist}
                  disabled={isToggling}
                  title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`h-6 w-6 ${isInWishlist ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              {/* Enhanced Rating */}
              <div className="flex items-center mb-5 bg-white rounded-lg px-3 py-2 shadow-sm">
                <div className="flex mr-2">
                  {renderStars(product.avg_rating || 0)}
                </div>
                <span className="text-sm text-gray-600">
                  {product.avg_rating ? parseFloat(product.avg_rating.toString()).toFixed(1) : '0'} 
                  <span className="mx-1">•</span>
                  <Link href="#reviews" className="text-blue-600 hover:underline">
                    {product.reviews?.length || 0} reviews
                  </Link>
                </span>
              </div>
              
              {/* Enhanced Price display */}
              <div className="mb-6 bg-blue-50 rounded-lg px-4 py-3 shadow-sm">
                {product.sale_price ? (
                  <div className="flex items-center">
                    <span className="text-gray-400 line-through mr-3 text-lg">৳{parseFloat(product.price.toString()).toFixed(2)}</span>
                    <span className="text-3xl font-bold text-blue-700">৳{parseFloat(product.sale_price.toString()).toFixed(2)}</span>
                    <span className="ml-2 text-sm text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      Save ৳{(parseFloat(product.price.toString()) - parseFloat(product.sale_price.toString())).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-blue-700">৳{parseFloat(product.price.toString()).toFixed(2)}</span>
                )}
              </div>
              
              {/* Enhanced Stock Info */}
              <div className="mb-6">
                {inStock ? (
                  <div className="flex items-center text-green-600 bg-white rounded-lg px-3 py-2 shadow-sm">
                    <Check className="w-5 h-5 mr-2 bg-green-100 rounded-full p-1" />
                    <span>In Stock {product.stock !== undefined && `(${product.stock} available)`}</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-500 bg-white rounded-lg px-3 py-2 shadow-sm">
                    <XMarkIcon className="w-5 h-5 mr-2 bg-red-100 rounded-full p-1" />
                    <span>Out of Stock</span>
                  </div>
                )}
              </div>
              
              {/* Features and benefits section - moved from image column */}
              <div className="bg-white rounded-xl p-4 space-y-3 mb-6 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700">Product Highlights</h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-600">Premium Quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Safe & Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-purple-500" />
                    <span className="text-sm text-gray-600">Fast Delivery</span>
                  </div>
                </div>
              </div>
              
              {/* Description with better styling */}
              {product.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center">
                    <span>Description</span>
                    <div className="h-px flex-grow bg-gray-200 ml-3"></div>
                  </h3>
                  <div className="bg-white rounded-lg p-4 text-gray-700 text-sm leading-relaxed shadow-sm">
                    <div className={`whitespace-pre-line ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                      {product.description}
                    </div>
                    
                    {product.description.split('\n').length > 3 || product.description.length > 150 ? (
                      <button 
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="mt-2 flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                      >
                        {isDescriptionExpanded ? (
                          <>
                            Read less <ChevronUp className="ml-1 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Read more <ChevronDown className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>
              )}
              
              <div className="mt-auto space-y-6">
                {/* Quantity Selector with improved styling */}
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center w-max bg-white rounded-lg border border-gray-200 shadow-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      disabled={quantity <= 1 || !inStock}
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-l-lg"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    <span className="mx-4 w-8 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      disabled={!inStock || (product.stock !== undefined && quantity >= product.stock)}
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-r-lg"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Enhanced Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    className="w-full bg-white hover:bg-gray-50 text-gray-800 border-gray-300 shadow-sm"
                    size="lg"
                    disabled={!inStock || addingToCart}
                    onClick={handleAddToCart}
                    variant="outline"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </Button>
                  
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm"
                    size="lg"
                    disabled={!inStock || processingBuyNow}
                    onClick={handleBuyNow}
                    variant="default"
                  >
                    <ZapIcon className="mr-2 h-5 w-5" />
                    {processingBuyNow ? 'Processing...' : 'Buy Now'}
                  </Button>
                </div>
                
                {/* Wishlist Button */}
                <Button
                  className={`w-full shadow-sm ${isInWishlist ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200' : 'bg-white hover:bg-gray-50'}`}
                  size="lg"
                  variant="outline"
                  onClick={toggleWishlist}
                  disabled={isToggling}
                >
                  <Heart className={`mr-2 h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                  {isToggling ? 'Updating...' : isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews Section with ID for anchor linking */}
        <div id="reviews" className="mt-16 bg-white rounded-xl shadow-sm overflow-hidden p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            {canReview ? (
              <Button 
                onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                variant="outline"
                className="hover:bg-blue-50"
              >
                {isReviewFormOpen ? 'Cancel' : 'Write a Review'}
              </Button>
            ) : auth.user ? (
              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                {product.reviews.some(review => review.user && review.user.id === auth.user?.id) 
                  ? 'You have already reviewed this product' 
                  : 'Purchase this product to write a review'}
              </div>
            ) : (
              <Link href={route('login')} className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium flex items-center">
                Log in to write a review <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          
          {/* Review summary with improved styling */}
          <div className="mb-8 flex flex-col md:flex-row gap-8 bg-gray-50 rounded-xl p-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {product.avg_rating ? parseFloat(product.avg_rating.toString()).toFixed(1) : '0'}
              </div>
              <div className="flex justify-center mb-1">
                {renderStars(product.avg_rating || 0, 24)}
              </div>
              <div className="text-sm text-gray-500">
                Based on {product.reviews?.length || 0} reviews
              </div>
            </div>
            
            <div className="flex-1">
              {/* Rating breakdown with improved styling */}
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = product.reviews?.filter(r => Math.floor(r.rating) === rating).length || 0;
                  const percentage = product.reviews?.length ? (count / product.reviews.length) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center">
                      <div className="w-8 text-sm font-medium text-gray-700">{rating}</div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1 h-2.5 mx-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-8 text-sm text-gray-500 text-right">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Review form with improved styling */}
          {isReviewFormOpen && canReview && (
            <div className="mb-10 border border-gray-200 rounded-xl p-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Write a Review</h3>
              
              {formErrors.auth && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {formErrors.auth}
                </div>
              )}
              
              {formErrors.purchase && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {formErrors.purchase}
                </div>
              )}
              
              {formErrors.existing && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {formErrors.existing}
                </div>
              )}
              
              <div className="space-y-4">
                {/* Rating selector with improved styling */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-1 bg-white p-3 rounded-lg border border-gray-200">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setData('rating', rating as any)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star 
                          className={`w-8 h-8 ${
                            data.rating >= rating 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-300'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                  {formErrors.rating && <div className="text-red-500 text-sm mt-1">{formErrors.rating}</div>}
                </div>
                
                {/* Comment with improved styling */}
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    Review (optional)
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Share your experience with this product..."
                    value={data.comment}
                    onChange={e => setData('comment', e.target.value)}
                  ></textarea>
                  {formErrors.comment && <div className="text-red-500 text-sm mt-1">{formErrors.comment}</div>}
                </div>
                
                {/* Anonymous review option with improved styling */}
                <div className="flex items-start bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center h-5">
                    <input
                      id="is_anonymous"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={data.is_anonymous}
                      onChange={() => setData('is_anonymous', !data.is_anonymous as any)}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="is_anonymous" className="font-medium text-gray-700">
                      Post anonymously
                    </label>
                    <p className="text-gray-500">Don't show my name publicly</p>
                  </div>
                </div>
                
                {/* Name field (only if anonymous) with improved styling */}
                {data.is_anonymous && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Anonymous"
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                    />
                    {formErrors.name && <div className="text-red-500 text-sm mt-1">{formErrors.name}</div>}
                  </div>
                )}
                
                {/* Submit button with improved styling */}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={submitReview}
                    disabled={processing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {processing ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Review list with improved styling */}
          <div className="space-y-6">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map(review => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 hover:bg-gray-50 p-4 rounded-lg transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-semibold text-gray-800">
                          {review.is_anonymous ? (review.name || 'Anonymous') : review.user?.name || 'User'}
                        </h4>
                        <div className="ml-2 text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex mt-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  
                  {review.comment && (
                    <div className="mt-2 text-gray-700 whitespace-pre-line bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      {review.comment}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                <div className="flex justify-center mb-4">
                  <Star className="h-12 w-12 text-gray-300" />
                </div>
                <p className="font-medium text-gray-700 mb-1">No reviews yet</p>
                <p className="text-gray-500 mb-6">Be the first to review this product!</p>
                {canReview && (
                  <Button 
                    onClick={() => setIsReviewFormOpen(true)}
                    variant="outline"
                    className="hover:bg-blue-50"
                  >
                    Write a Review
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Related Products Section with improved styling */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Shop What Others Love</h2>
              <Link 
                href="/products" 
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
} 