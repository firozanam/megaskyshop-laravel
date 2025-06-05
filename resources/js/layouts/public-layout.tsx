import React, { ReactNode, useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import { ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/contexts/CartContext';

interface PublicLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function PublicLayout({ children, title }: PublicLayoutProps) {
  const { auth } = usePage<SharedData>().props;
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile menu when switching to desktop view
  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Megaskyshop
            </Link>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/products" className="text-gray-600 hover:text-gray-900 font-medium">
                Products
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 font-medium">
                About
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium">
                Contact
              </Link>
              <Link href="/cart" className="text-gray-600 hover:text-gray-900 font-medium relative">
                <ShoppingCartIcon className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
              
              {auth.user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                    Dashboard
                  </Link>
                  <Link 
                    href="/user/orders" 
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    My Orders
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link 
                    href={route('login')} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href={route('register')} 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-3 border-t border-gray-200 space-y-4">
              <div className="flex flex-col space-y-3">
                <Link 
                  href="/products" 
                  className="px-2 py-2 text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Products
                </Link>
                <Link 
                  href="/about" 
                  className="px-2 py-2 text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="px-2 py-2 text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link 
                  href="/cart" 
                  className="px-2 py-2 text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-md flex items-center justify-between"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Cart</span>
                  <div className="relative">
                    <ShoppingCartIcon className="h-6 w-6" />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount > 9 ? '9+' : itemCount}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                {auth.user ? (
                  <div className="flex flex-col space-y-3">
                    <Link 
                      href="/dashboard" 
                      className="px-2 py-2 text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/user/orders" 
                      className="px-2 py-2 text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link 
                      href={route('login')} 
                      className="w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      href={route('register')} 
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-md hover:bg-gray-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-gray-900">Megaskyshop</h3>
              <p className="mt-2 text-gray-600">Your one-stop shop for all your needs</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Shop</h4>
                <ul className="mt-4 space-y-2">
                  <li><Link href="/products" className="text-gray-600 hover:text-gray-900">All Products</Link></li>
                  <li><Link href="/categories" className="text-gray-600 hover:text-gray-900">Categories</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Company</h4>
                <ul className="mt-4 space-y-2">
                  <li><Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link></li>
                  <li><Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Legal</h4>
                <ul className="mt-4 space-y-2">
                  <li><Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
                  <li><Link href="/terms-of-service" className="text-gray-600 hover:text-gray-900">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Megaskyshop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 