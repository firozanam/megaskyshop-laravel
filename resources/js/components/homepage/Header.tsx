import React from 'react';
import { Link } from '@inertiajs/react';

interface HeaderProps {
    auth: {
        user: any | null;
    };
}

export default function Header({ auth }: HeaderProps) {
    return (
        <header className="bg-white shadow-md py-2">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="text-xl font-bold text-blue-900">
                    <Link href="/">Megaskyshop</Link>
                </div>
                
                <nav className="flex items-center gap-6">
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
                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
                    </Link>
                    
                    {auth.user ? (
                        <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">Dashboard</Link>
                    ) : (
                        <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">Sign In</Link>
                    )}
                </div>
            </div>
        </header>
    );
} 