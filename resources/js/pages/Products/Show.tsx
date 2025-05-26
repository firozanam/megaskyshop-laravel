import React, { useState } from 'react';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import ProductCard from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MinusIcon, PlusIcon, Check, ShoppingCart, Star, StarHalf } from 'lucide-react';
import { PageProps } from '@inertiajs/core';

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

export default function Show() {
  const { product, relatedProducts, auth } = usePage<ProductDetailsPageProps>().props;
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  
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
    if (image.image_path) {
      return `/storage/${image.image_path}`;
    } else if (image.url) {
      return `/storage/${image.url}`;
    } else if (product.main_image) {
      return `/storage/${product.main_image}`;
    }
    return '/images/placeholder.jpg';
  };
  
  const mainImageUrl = selectedImage || (product.images && product.images.length > 0 
    ? getImageUrl(product.images[0]) 
    : product.main_image 
      ? `/storage/${product.main_image}` 
      : '/images/placeholder.jpg');
  
  const discount = product.sale_price && product.price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100) 
    : 0;
    
  const inStock = product.stock === undefined || product.stock > 0;
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && (product.stock === undefined || newQuantity <= product.stock)) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    setAddingToCart(true);
    // Simulate API call delay
    setTimeout(() => {
      setAddingToCart(false);
      // Here you would normally implement actual cart functionality
      console.log(`Added ${quantity} of ${product.name} to cart`);
    }, 800);
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

  return (
    <PublicLayout>
      <Head title={product.name} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href={route('products.index')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Products
          </Link>
        </div>
        
        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Left Column - Product Images */}
            <div className="space-y-4">
              {/* Main image */}
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative">
                {discount > 0 && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                    -{discount}%
                  </div>
                )}
                {!inStock && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Out of Stock
                  </div>
                )}
                <img 
                  src={mainImageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Image thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      className={`aspect-square rounded-md overflow-hidden border ${
                        getImageUrl(image) === selectedImage ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedImage(getImageUrl(image))}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Right Column - Product Info */}
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {renderStars(product.avg_rating || 0)}
                </div>
                <span className="text-sm text-gray-500">
                  {product.avg_rating ? product.avg_rating.toFixed(1) : '0'} ({product.reviews?.length || 0} reviews)
                </span>
              </div>
              
              {/* Price */}
              <div className="mb-6">
                {product.sale_price ? (
                  <div className="flex items-center">
                    <span className="text-gray-400 line-through mr-3 text-lg">৳{product.price.toFixed(2)}</span>
                    <span className="text-2xl font-bold text-gray-900">৳{product.sale_price.toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-gray-900">৳{product.price.toFixed(2)}</span>
                )}
              </div>
              
              {/* Stock Info */}
              <div className="mb-6">
                {inStock ? (
                  <div className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-2" />
                    <span>In Stock {product.stock !== undefined && `(${product.stock} available)`}</span>
                  </div>
                ) : (
                  <div className="text-red-500">Out of Stock</div>
                )}
              </div>
              
              {/* Description */}
              {product.description && (
                <div className="mb-8 prose prose-sm max-w-none">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <div className="text-gray-700 whitespace-pre-line">{product.description}</div>
                </div>
              )}
              
              <div className="mt-auto">
                {/* Quantity Selector */}
                <div className="mb-6">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      type="button"
                      disabled={quantity <= 1 || !inStock}
                      onClick={() => handleQuantityChange(quantity - 1)}
                    >
                      <MinusIcon className="h-3 w-3" />
                    </Button>
                    <span className="mx-4 w-8 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      type="button"
                      disabled={!inStock || (product.stock !== undefined && quantity >= product.stock)}
                      onClick={() => handleQuantityChange(quantity + 1)}
                    >
                      <PlusIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {/* Add to Cart Button */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    className="flex-1"
                    size="lg"
                    disabled={!inStock || addingToCart}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </Button>
                  
                  <Button
                    className="flex-1"
                    size="lg"
                    variant="outline"
                    asChild
                  >
                    <Link href="#order-form">Buy Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="mt-16 bg-white rounded-xl shadow-sm overflow-hidden p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            {canReview ? (
              <Button 
                onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                variant="outline"
              >
                {isReviewFormOpen ? 'Cancel' : 'Write a Review'}
              </Button>
            ) : auth.user ? (
              <div className="text-sm text-gray-500">
                {product.reviews.some(review => review.user && review.user.id === auth.user?.id) 
                  ? 'You have already reviewed this product' 
                  : 'Purchase this product to write a review'}
              </div>
            ) : (
              <Link href={route('login')} className="text-blue-600 hover:text-blue-800 transition-colors text-sm">
                Log in to write a review
              </Link>
            )}
          </div>
          
          {/* Review summary */}
          <div className="mb-8 flex flex-col md:flex-row gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {product.avg_rating ? product.avg_rating.toFixed(1) : '0'}
              </div>
              <div className="flex justify-center mb-1">
                {renderStars(product.avg_rating || 0, 20)}
              </div>
              <div className="text-sm text-gray-500">
                Based on {product.reviews?.length || 0} reviews
              </div>
            </div>
            
            <div className="flex-1">
              {/* Rating breakdown */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = product.reviews?.filter(r => Math.floor(r.rating) === rating).length || 0;
                  const percentage = product.reviews?.length ? (count / product.reviews.length) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center">
                      <div className="w-8 text-sm font-medium text-gray-700">{rating}</div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full" 
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
          
          {/* Review form */}
          {isReviewFormOpen && canReview && (
            <div className="mb-10 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              
              {formErrors.auth && (
                <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600">
                  {formErrors.auth}
                </div>
              )}
              
              {formErrors.purchase && (
                <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600">
                  {formErrors.purchase}
                </div>
              )}
              
              {formErrors.existing && (
                <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600">
                  {formErrors.existing}
                </div>
              )}
              
              <div className="space-y-4">
                {/* Rating selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setData('rating', rating as any)}
                        className="focus:outline-none"
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
                
                {/* Comment */}
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    Review (optional)
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Share your experience with this product..."
                    value={data.comment}
                    onChange={e => setData('comment', e.target.value)}
                  ></textarea>
                  {formErrors.comment && <div className="text-red-500 text-sm mt-1">{formErrors.comment}</div>}
                </div>
                
                {/* Anonymous review option */}
                <div className="flex items-start">
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
                
                {/* Name field (only if anonymous) */}
                {data.is_anonymous && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Anonymous"
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                    />
                    {formErrors.name && <div className="text-red-500 text-sm mt-1">{formErrors.name}</div>}
                  </div>
                )}
                
                {/* Submit button */}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={submitReview}
                    disabled={processing}
                  >
                    {processing ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Review list */}
          <div className="space-y-6">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map(review => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-semibold">
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
                    <div className="mt-2 text-gray-700 whitespace-pre-line">
                      {review.comment}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Shop What Others Love</h2>
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