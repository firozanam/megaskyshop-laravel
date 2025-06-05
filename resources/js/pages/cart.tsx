import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { useCart } from '@/contexts/CartContext';
import { 
  ShoppingBagIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

export default function Cart() {
  const { items, removeItem, updateQuantity, itemCount, subtotal } = useCart();
  
  const handleQuantityChange = (id: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };
  
  // Check if eligible for free delivery
  const FREE_DELIVERY_THRESHOLD = 500;
  const isEligibleForFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  
  return (
    <PublicLayout>
      <Head title="Shopping Cart - Megaskyshop" />
      
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Shopping Cart</h1>
        
        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
              <ShoppingCartIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link href="/products">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cart Items */}
            <div className="lg:w-2/3 space-y-3 sm:space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4"
                >
                  {/* Product Image */}
                  <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <Link href={`/products/${item.slug}`}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-grow flex flex-col">
                    <div className="flex justify-between">
                      <Link 
                        href={`/products/${item.slug}`}
                        className="text-base sm:text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                        aria-label="Remove item"
                      >
                        <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                    
                    {/* Quantity and Price */}
                    <div className="mt-2 sm:mt-auto flex flex-col sm:flex-row sm:items-end justify-between pt-2 sm:pt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center mb-3 sm:mb-0">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          disabled={item.quantity <= 1}
                          className="p-1 sm:p-1.5 rounded-md border border-gray-300 disabled:opacity-50"
                        >
                          <MinusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <span className="mx-2 sm:mx-3 w-6 sm:w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          disabled={item.stock !== undefined && item.quantity >= item.stock}
                          className="p-1 sm:p-1.5 rounded-md border border-gray-300 disabled:opacity-50"
                        >
                          <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <div className="text-base sm:text-lg font-semibold text-gray-900">
                          ৳{((item.sale_price ?? item.price) * item.quantity).toFixed(2)}
                        </div>
                        {item.sale_price && (
                          <div className="text-xs sm:text-sm text-gray-500 line-through">
                            ৳{(item.price * item.quantity).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4">
                <Link
                  href="/products"
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm"
                >
                  <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Continue Shopping
                </Link>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow sticky top-6">
                {/* Order Summary Header */}
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <div className="flex items-center">
                    <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-gray-800" />
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Order Summary</h2>
                  </div>
                </div>
                
                {/* Order Summary Content */}
                <div className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Subtotal</span>
                      <span className="font-medium">৳{subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Tax (00%)</span>
                      <span className="font-medium">৳0.00</span>
                    </div>
                    
                    <div className="h-px bg-gray-200 my-4"></div>
                    
                    <div className="flex justify-between items-center text-blue-800 font-bold text-xl">
                      <span>Total</span>
                      <span>৳{subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Free Delivery Notice */}
                  <div className="mb-4">
                    <div className="flex items-center text-gray-700 mb-3">
                      <TruckIcon className="h-5 w-5 mr-2 text-blue-700" />
                      <span className="text-sm">Free delivery on orders over ৳{FREE_DELIVERY_THRESHOLD.toFixed(2)}</span>
                    </div>
                    
                    {/* Secure Checkout */}
                    <div className="flex items-center text-gray-700">
                      <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-700" />
                      <span className="text-sm">Secure checkout with SSL encryption</span>
                    </div>
                  </div>
                  
                  {/* Checkout Button */}
                  <Link href="/checkout" className="block w-full">
                    <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 sm:py-3 rounded-md flex items-center justify-center text-sm sm:text-base">
                      <span className="mr-2">Proceed to Checkout</span>
                      <ArrowRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
} 