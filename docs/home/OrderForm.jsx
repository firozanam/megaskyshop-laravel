import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { getImageWithFallback } from '@/lib/blobStorage';
import React from 'react';

export default function OrderForm({ 
  product, 
  formData, 
  onInputChange, 
  onSubmit, 
  isSubmitting 
}) {
  if (!product) {
    return (
      <section
        id="order-form"
        className="bg-card text-card-foreground rounded-3xl p-12 md:p-20 shadow-lg mb-24"
      >
        <h2 className="text-4xl font-bold mb-6 text-center">
          No Product Available
        </h2>
        <p className="text-center text-lg mb-5">
          Sorry, there is currently no product available for order. Please
          check back later.
        </p>
      </section>
    );
  }

  const imageUrl = getImageWithFallback(product?.image, '/images/placeholder.png');

  // Add error handling for image loading
  const handleImageError = (e) => {
    console.error('Image failed to load:', product?.image);
    e.target.src = '/images/placeholder.png';
  };

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, parseInt(formData.quantity) + change);
    onInputChange({
      target: {
        name: 'quantity',
        value: newQuantity
      }
    });
  };

  const handleDirectQuantityInput = (e) => {
    const value = parseInt(e.target.value) || 1;
    const newQuantity = Math.max(1, value);
    onInputChange({
      target: {
        name: 'quantity',
        value: newQuantity
      }
    });
  };

  return (
    <section
      id="order-form"
      className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 border border-[hsl(var(--primary))] rounded-lg bg-card"
    >
      <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8 text-[hsl(var(--primary))]">
        আপনার নাম, ঠিকানা ও মোবাইল নম্বরটি লিখে অর্ডার কনফার্ম করুন
      </h2>
      
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
          <div className="lg:flex lg:gap-8">
            {/* Left side - Billing details */}
            <div className="lg:w-1/2 space-y-4 sm:space-y-6">
              <div>
                <Label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground"
                >
                  আপনার নাম <span className="text-[hsl(var(--destructive))]">*</span>
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={onInputChange}
                  required
                  className="mt-1 block w-full"
                  placeholder="আপনার নাম লিখুনঃ"
                />
              </div>
              <div>
                <Label
                  htmlFor="address"
                  className="block text-sm font-medium text-foreground"
                >
                  আপনার ঠিকানা <span className="text-[hsl(var(--destructive))]">*</span>
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={onInputChange}
                  required
                  className="mt-1 block w-full"
                  placeholder="আপনার ঠিকানা/এলাকার নাম, থানা, জেলা"
                  rows={3}
                />
              </div>
              <div>
                <Label
                  htmlFor="phone"
                  className="block text-sm font-medium text-foreground"
                >
                  মোবাইল নাম্বার <span className="text-[hsl(var(--destructive))]">*</span>
                </Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={onInputChange}
                  required
                  className="mt-1 block w-full"
                  placeholder="আপনার মোবাইল নাম্বার লিখুনঃ"
                />
              </div>
            </div>

            {/* Right side - Order summary */}
            <div className="lg:w-1/2 mt-6 lg:mt-0">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-foreground">Your order</h3>
              <div className="space-y-4">
                <div className="border-b border-border pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative aspect-square w-20 sm:w-24 h-20 sm:h-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 border border-[hsl(var(--primary))]">
                        <Image
                          src={imageUrl}
                          alt={product?.name || 'Product Image'}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 96px"
                          quality={85}
                          priority
                          onError={handleImageError}
                        />
                      </div>
                      <span className="text-sm sm:text-base text-foreground flex-grow">{product.name}</span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-input rounded">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(-1)}
                          className="p-1.5 sm:p-2 hover:bg-accent border-r border-input"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={handleDirectQuantityInput}
                          className="w-12 sm:w-16 text-center border-none focus:ring-0 bg-transparent text-sm sm:text-base"
                          min="1"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(1)}
                          className="p-1.5 sm:p-2 hover:bg-accent border-l border-input"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                      <span className="text-sm sm:text-base text-foreground whitespace-nowrap">{formatCurrency(product.price)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between py-2 text-sm sm:text-base">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatCurrency(product.price * formData.quantity)}</span>
                </div>
                
                <div className="flex justify-between py-2 border-t border-b border-border text-sm sm:text-base">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-foreground">{formatCurrency(product.price * formData.quantity)}</span>
                </div>

                <div className="bg-yellow-100 p-3 sm:p-4 rounded">
                  <h4 className="font-medium mb-2 text-foreground text-sm sm:text-base">ক্যাশ অন ডেলিভারি</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    আপনি যখন প্রোডাক্টটা হতে পারেন তখনই টাকা পেমেন্ট করবেন।
                    ডেলিভারি ম্যানের থেকে পণ্য বুঝে নিয়ে টাকা পেমেন্ট করবেন।
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>অর্ডার সম্পন্ন করুন {formatCurrency(product.price * formData.quantity)}</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
