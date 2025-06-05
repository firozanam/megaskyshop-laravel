import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { useCart } from '@/contexts/CartContext';

interface HeaderProps {
    auth: {
        user: any | null;
    };
}

export default function Header({ auth }: HeaderProps) {
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
        <header className="bg-white shadow-md py-2 relative z-10">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">
                    <div className="text-xl font-bold text-blue-900">
                        <Link href="/">Megaskyshop</Link>
                    </div>
                    
                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-md text-gray-600 hover:text-blue-900"
                        >
                            {mobileMenuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            )}
                        </button>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-gray-700 hover:text-blue-900">Home</Link>
                        <Link href="/products" className="text-gray-700 hover:text-blue-900">Products</Link>
                        <Link href="/about" className="text-gray-700 hover:text-blue-900">About</Link>
                        <Link href="/contact" className="text-gray-700 hover:text-blue-900">Contact</Link>
                    </nav>
                    
                    <div className="flex items-center gap-4">
                        <Link href="/cart" className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                            {itemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {itemCount > 9 ? '9+' : itemCount}
                                </span>
                            )}
                        </Link>
                        
                        <div className="hidden md:block">
                            {auth.user ? (
                                <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">Dashboard</Link>
                            ) : (
                                <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">Sign In</Link>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 py-3 border-t border-gray-200 space-y-3">
                        <nav className="flex flex-col space-y-3">
                            <Link 
                                href="/" 
                                className="px-2 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link 
                                href="/products" 
                                className="px-2 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Products
                            </Link>
                            <Link 
                                href="/about" 
                                className="px-2 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                About
                            </Link>
                            <Link 
                                href="/contact" 
                                className="px-2 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 rounded-md"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Contact
                            </Link>
                        </nav>
                        
                        <div className="pt-3 border-t border-gray-200">
                            {auth.user ? (
                                <Link 
                                    href="/dashboard" 
                                    className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm text-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link 
                                    href="/login" 
                                    className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm text-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
} 