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

interface Order {
    id: number;
    name: string;
    email: string;
    shipping_address: string;
    mobile: string;
    total: number;
    status: string;
    created_at: string;
    items: Array<{
        id: number;
        product_id: number;
        name: string;
        quantity: number;
        price: number;
        image: string;
    }>;
    tracking?: {
        id: number;
        order_id: number;
        tracking_id: string | null;
        partner_id: string | null;
        status: string;
        details: any | null;
    };
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    category?: string;
    category_id?: number;
    stock: number;
    main_image: string;
    avg_rating: number;
    category_obj?: Category;
}

interface DashboardProps {
    recentOrders: Order[];
    recentlyViewedProducts: Product[];
}

export default function Dashboard({ recentOrders = [], recentlyViewedProducts = [] }: DashboardProps) {
    // Format date to a readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Get status badge color based on status
    const getStatusBadgeClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

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
                    
                    <Link href="/settings/profile" className="bg-white rounded-xl shadow p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
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
                                {recentOrders.length > 0 ? (
                                    recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b">
                                            <td className="py-4 text-gray-900">#{order.id}</td>
                                            <td className="py-4 text-gray-600">{formatDate(order.created_at)}</td>
                                            <td className="py-4">
                                                <span className={`${getStatusBadgeClass(order.status)} text-xs font-medium px-2.5 py-0.5 rounded`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-gray-900">৳{order.total.toLocaleString()}</td>
                                            <td className="py-4">
                                                <Link href={`/user/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-4 text-center text-gray-500">
                                            No orders found. Start shopping to see your orders here.
                                        </td>
                                    </tr>
                                )}
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
                        <div className="border rounded-lg p-4 flex items-center justify-center bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-full">
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-900 font-medium">Cash On Delivery</p>
                                    <p className="text-gray-500 text-xs">Pay when you receive your order</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Shipping Addresses */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <TruckIcon className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Shipping Addresses</h2>
                        </div>
                        <div className="border rounded-lg p-4 flex items-center justify-center bg-gray-50 min-h-[80px]">
                            <div className="text-center w-full">
                                <p className="text-gray-900 font-medium">Provide your shipping address during checkout.</p>
                                <p className="text-gray-500 text-xs mt-1">You will be able to enter or select your address when placing an order.</p>
                            </div>
                        </div>
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
                        {recentlyViewedProducts.length > 0 ? (
                            recentlyViewedProducts.map((product) => (
                                <Link 
                                    key={product.id} 
                                    href={`/products/${product.id}`}
                                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="aspect-square bg-gray-100 relative">
                                        {product.main_image ? (
                                            <img 
                                                src={`/storage/${product.main_image}`} 
                                                alt={product.name}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                Product Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
                                        <p className="text-gray-600 text-sm mb-2">
                                            {product.category_obj?.name || product.category || 'Uncategorized'}
                                        </p>
                                        <p className="font-semibold text-gray-900">৳{product.price.toLocaleString()}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <>
                                {/* Show 4 placeholder products */}
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="border rounded-lg overflow-hidden">
                                        <div className="aspect-square bg-gray-100 relative">
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                Product Image
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="h-5 bg-gray-200 rounded mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                                            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
