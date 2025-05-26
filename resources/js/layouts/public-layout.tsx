import React, { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';

interface PublicLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function PublicLayout({ children, title }: PublicLayoutProps) {
  const { auth } = usePage<SharedData>().props;
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Megaskyshop
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link href="/products" className="text-gray-600 hover:text-gray-900 font-medium">
              Products
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium">
              Contact
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