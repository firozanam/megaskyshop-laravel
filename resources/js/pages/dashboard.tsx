import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
  ShoppingBagIcon, 
  HeartIcon, 
  UserCircleIcon, 
  CreditCardIcon,
  TruckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Dashboard" />
            
            <div className="flex flex-col gap-6 p-4">
                {/* Welcome Section */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
                    <p className="text-gray-600">
                        Manage your orders, wishlist, and account information from your personal dashboard.
                    </p>
                </div>
                
                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/user/orders" className="bg-white rounded-xl shadow p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">My Orders</h2>
                            <p className="text-gray-600 text-sm">Track and manage your orders</p>
                        </div>
                    </Link>
                    
                    <Link href="/user/wishlist" className="bg-white rounded-xl shadow p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        <div className="bg-red-100 p-3 rounded-full">
                            <HeartIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Wishlist</h2>
                            <p className="text-gray-600 text-sm">View your saved items</p>
                        </div>
                    </Link>
                    
                    <Link href="/user/profile" className="bg-white rounded-xl shadow p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        <div className="bg-green-100 p-3 rounded-full">
                            <UserCircleIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">My Profile</h2>
                            <p className="text-gray-600 text-sm">Update your account details</p>
                        </div>
                    </Link>
                </div>
                
                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                        <Link href="/user/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View All
                        </Link>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="pb-3 font-medium text-gray-500">Order ID</th>
                                    <th className="pb-3 font-medium text-gray-500">Date</th>
                                    <th className="pb-3 font-medium text-gray-500">Status</th>
                                    <th className="pb-3 font-medium text-gray-500">Total</th>
                                    <th className="pb-3 font-medium text-gray-500">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-4 text-gray-900">#MS-2023001</td>
                                    <td className="py-4 text-gray-600">June 12, 2023</td>
                                    <td className="py-4">
                                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                            Delivered
                                        </span>
                                    </td>
                                    <td className="py-4 text-gray-900">৳2,450</td>
                                    <td className="py-4">
                                        <Link href="/user/orders/MS-2023001" className="text-blue-600 hover:text-blue-800 text-sm">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-4 text-gray-900">#MS-2023015</td>
                                    <td className="py-4 text-gray-600">July 3, 2023</td>
                                    <td className="py-4">
                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                            Processing
                                        </span>
                                    </td>
                                    <td className="py-4 text-gray-900">৳1,850</td>
                                    <td className="py-4">
                                        <Link href="/user/orders/MS-2023015" className="text-blue-600 hover:text-blue-800 text-sm">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Account Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Payment Methods */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <CreditCardIcon className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
                        </div>
                        <div className="border rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-200 rounded p-1">
                                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                                        <rect width="24" height="24" rx="4" fill="#016FD0" />
                                        <path d="M12 18V6H22V18H12Z" fill="#016FD0" />
                                        <path d="M13.86 16.13H14.98V9.87H13.86V16.13Z" fill="white" />
                                        <path d="M19.23 9.87C18.77 9.65 18.13 9.43 17.35 9.43C15.8 9.43 14.71 10.19 14.71 11.33C14.71 12.22 15.47 12.7 16.45 13.09C17.42 13.48 17.73 13.74 17.73 14.09C17.73 14.61 17.16 14.87 16.62 14.87C15.93 14.87 15.51 14.74 14.89 14.44L14.63 14.31L14.37 16.04C14.89 16.3 15.8 16.52 16.71 16.52C18.38 16.52 19.45 15.78 19.45 14.52C19.45 13.83 19.01 13.26 17.73 12.74C16.97 12.39 16.49 12.17 16.49 11.78C16.49 11.43 16.84 11.08 17.6 11.08C18.25 11.08 18.73 11.21 19.1 11.39L19.28 11.47L19.54 9.83L19.23 9.87Z" fill="white" />
                                        <path d="M21.94 9.87H20.44C20.05 9.87 19.75 9.96 19.58 10.36L17.47 16.13H19.19L19.49 15.26H21.59L21.76 16.13H23.31L21.94 9.87ZM19.88 13.96C19.88 13.96 20.44 12.39 20.53 12.13C20.53 12.13 20.61 11.91 20.7 11.74L20.79 12.09C20.79 12.09 21.15 13.83 21.24 14.09L19.88 13.96Z" fill="white" />
                                        <path d="M9.75 9.87L8.16 14.09L8.03 13.48C7.77 12.61 6.89 11.65 5.92 11.17L7.42 16.13H9.14L11.73 9.87H9.75Z" fill="white" />
                                        <path d="M6.63 9.87H3.96L3.87 10.01C6.02 10.53 7.42 11.82 7.94 13.48L7.33 10.36C7.25 10.01 6.98 9.87 6.63 9.87Z" fill="white" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Visa ending in 4242</p>
                                    <p className="text-gray-500 text-xs">Expires 12/24</p>
                                </div>
                            </div>
                            <span className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">Edit</span>
                        </div>
                        <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                            + Add payment method
                        </button>
                    </div>
                    
                    {/* Shipping Addresses */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <TruckIcon className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Shipping Addresses</h2>
                        </div>
                        <div className="border rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Home</p>
                                <p className="text-gray-600 text-sm">123 Main Street</p>
                                <p className="text-gray-600 text-sm">Narayanganj, Chasara Amlapara</p>
                                <p className="text-gray-600 text-sm">Bangladesh</p>
                            </div>
                            <span className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">Edit</span>
                        </div>
                        <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                            + Add address
                        </button>
                    </div>
                </div>
                
                {/* Recently Viewed Products */}
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <ClockIcon className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Recently Viewed</h2>
                        </div>
                        <Link href="/products" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Browse More
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Product 1 */}
                        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-square bg-gray-100 relative">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    Product Image
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-medium text-gray-900 mb-1 truncate">Wireless Earbuds</h3>
                                <p className="text-gray-600 text-sm mb-2">Electronics</p>
                                <p className="font-semibold text-gray-900">৳1,200</p>
                            </div>
                        </div>
                        
                        {/* Product 2 */}
                        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-square bg-gray-100 relative">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    Product Image
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-medium text-gray-900 mb-1 truncate">Smart Watch</h3>
                                <p className="text-gray-600 text-sm mb-2">Electronics</p>
                                <p className="font-semibold text-gray-900">৳2,500</p>
                            </div>
                        </div>
                        
                        {/* Product 3 */}
                        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-square bg-gray-100 relative">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    Product Image
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-medium text-gray-900 mb-1 truncate">Bluetooth Speaker</h3>
                                <p className="text-gray-600 text-sm mb-2">Electronics</p>
                                <p className="font-semibold text-gray-900">৳1,800</p>
                            </div>
                        </div>
                        
                        {/* Product 4 */}
                        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-square bg-gray-100 relative">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    Product Image
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-medium text-gray-900 mb-1 truncate">Power Bank</h3>
                                <p className="text-gray-600 text-sm mb-2">Electronics</p>
                                <p className="font-semibold text-gray-900">৳950</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
