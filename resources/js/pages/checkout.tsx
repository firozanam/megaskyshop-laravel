import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { useCart } from '@/contexts/CartContext';
import {
  ShoppingBagIcon,
  CreditCardIcon,
  TruckIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';

interface CheckoutProps extends PageProps {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
    } | null;
  };
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { auth } = usePage<CheckoutProps>().props;
  const isLoggedIn = !!auth.user;
  
  // Redirect to cart if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      window.location.href = '/cart';
    }
  }, [items]);
  
  // Free delivery threshold
  const FREE_DELIVERY_THRESHOLD = 500;
  const isEligibleForFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  
  // Form handling
  const { data, setData, post, processing, errors } = useForm({
    name: auth.user?.name || '',
    email: auth.user?.email || '',
    mobile: '',
    shipping_address: '',
    items: items.map(item => ({
      id: item.id,
      quantity: item.quantity
    }))
  });
  
  // Update form items when cart items change
  useEffect(() => {
    setData('items', items.map(item => ({
      id: item.id,
      quantity: item.quantity
    })));
  }, [items]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/orders', {
      onSuccess: () => {
        clearCart();
      }
    });
  };
  
  return (
    <PublicLayout>
      <Head title="Checkout - Megaskyshop" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/cart"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Cart
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center">
                  <UserIcon className="h-6 w-6 mr-3 text-gray-800" />
                  <h2 className="text-xl font-bold text-gray-800">Customer Information</h2>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        className={`w-full rounded-md border ${errors.name ? 'border-red-500' : 'border-gray-300'} shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                      />
                      {errors.name && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email {!isLoggedIn && '(Optional for guest checkout)'}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        className={`w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        disabled={isLoggedIn}
                      />
                      {errors.email && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="mobile"
                        name="mobile"
                        value={data.mobile}
                        onChange={e => setData('mobile', e.target.value)}
                        className={`w-full rounded-md border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                      />
                      {errors.mobile && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.mobile && (
                      <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
                    )}
                  </div>
                </div>
                
                {/* Shipping Information */}
                <div>
                  <div className="flex items-center mb-4">
                    <MapPinIcon className="h-6 w-6 mr-3 text-gray-800" />
                    <h2 className="text-xl font-bold text-gray-800">Shipping Address</h2>
                  </div>
                  
                  <div>
                    <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Address *
                    </label>
                    <div className="relative">
                      <textarea
                        id="shipping_address"
                        name="shipping_address"
                        value={data.shipping_address}
                        onChange={e => setData('shipping_address', e.target.value)}
                        rows={3}
                        className={`w-full rounded-md border ${errors.shipping_address ? 'border-red-500' : 'border-gray-300'} shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="House/Flat/Block No., Apartment, Street, Area, City, State, Postal Code"
                        required
                      />
                      {errors.shipping_address && (
                        <div className="absolute top-0 right-0 flex items-center pr-3 pt-2">
                          <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.shipping_address && (
                      <p className="mt-1 text-sm text-red-600">{errors.shipping_address}</p>
                    )}
                  </div>
                </div>
                
                {/* Payment Method */}
                <div>
                  <div className="flex items-center mb-4">
                    <CreditCardIcon className="h-6 w-6 mr-3 text-gray-800" />
                    <h2 className="text-xl font-bold text-gray-800">Payment Method</h2>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <div className="flex items-center">
                      <input
                        id="cash-on-delivery"
                        name="payment_method"
                        type="radio"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        checked
                        readOnly
                      />
                      <label htmlFor="cash-on-delivery" className="ml-3 block text-sm font-medium text-gray-700">
                        Cash on Delivery
                      </label>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 ml-7">
                      Pay with cash upon delivery of your order
                    </p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit"
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-md"
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-6">
              {/* Order Summary Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center">
                  <ShoppingBagIcon className="h-6 w-6 mr-3 text-gray-800" />
                  <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden mr-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        ৳{((item.sale_price ?? item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  
                  <div className="h-px bg-gray-200 my-4"></div>
                  
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">৳{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Shipping</span>
                    <span className="font-medium">
                      {isEligibleForFreeDelivery ? 'Free' : 'Calculated at delivery'}
                    </span>
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
                
                {/* Secure Checkout */}
                <div className="flex items-center justify-center text-gray-700 mt-6">
                  <LockClosedIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Secure checkout with SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
} 