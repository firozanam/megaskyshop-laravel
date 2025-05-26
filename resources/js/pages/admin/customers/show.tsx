import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { UserCircle, Phone, Mail, Calendar, ShoppingBag, CreditCard, Clock, ArrowLeft } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { 
    Table, 
    TableBody, 
    TableCaption, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";

interface CustomerOrder {
    id: number;
    total: number;
    status: string;
    created_at: string;
    updated_at: string;
    items: Array<{
        id: number;
        name: string;
        quantity: number;
        price: number;
    }>;
}

interface OrdersPagination {
    data: CustomerOrder[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Customer {
    id: string;
    name: string;
    email: string | null;
    mobile: string;
    type: 'registered' | 'guest';
    created_at: string;
}

interface CustomerStats {
    total_orders: number;
    total_spent: number;
    average_order_value: number;
    first_order_date: string;
    last_order_date: string;
}

interface CustomerShowProps {
    customer: Customer;
    orders: OrdersPagination;
    stats: CustomerStats;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Pending':
            return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>;
        case 'Processing':
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Processing</Badge>;
        case 'Shipped':
            return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">Shipped</Badge>;
        case 'Delivered':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Delivered</Badge>;
        case 'Cancelled':
            return <Badge variant="destructive">Cancelled</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export default function CustomerShow({ customer, orders, stats }: CustomerShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Customers',
            href: '/admin/customers',
        },
        {
            title: customer.name,
            href: `/admin/customers/${customer.id}`,
        },
    ];
    
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Customer: ${customer.name}`} />
            
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/customers">
                        <Button variant="outline" size="sm" className="gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Customers
                        </Button>
                    </Link>
                    
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
                        <p className="text-muted-foreground">
                            Customer details and order history
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Information Card */}
                    <Card className="md:col-span-1">
                        <CardHeader className="pb-3 border-b">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">Customer Information</CardTitle>
                                <Badge 
                                    variant="outline" 
                                    className={customer.type === 'registered' 
                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                        : 'bg-gray-50 text-gray-700 border-gray-200'}
                                >
                                    {customer.type === 'registered' ? 'Registered User' : 'Guest User'}
                                </Badge>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400">
                                    <UserCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Name</div>
                                    <div className="font-medium">{customer.name}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Email</div>
                                    <div className="font-medium">
                                        {customer.email || 
                                            <span className="text-gray-400 italic">Not provided</span>
                                        }
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Phone Number</div>
                                    <div className="font-bold">{customer.mobile}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Customer Since</div>
                                    <div className="font-medium">{formatDate(stats.first_order_date)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Customer Stats Card */}
                    <Card className="md:col-span-2">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg">Customer Overview</CardTitle>
                        </CardHeader>
                        
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="border rounded-lg p-3 flex flex-col">
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <ShoppingBag className="h-3 w-3" />
                                        Total Orders
                                    </div>
                                    <div className="text-2xl font-bold mt-1">{stats.total_orders}</div>
                                </div>
                                
                                <div className="border rounded-lg p-3 flex flex-col">
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        Total Spent
                                    </div>
                                    <div className="text-2xl font-bold mt-1">{formatCurrency(stats.total_spent)}</div>
                                </div>
                                
                                <div className="border rounded-lg p-3 flex flex-col">
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        Avg. Order Value
                                    </div>
                                    <div className="text-2xl font-bold mt-1">{formatCurrency(stats.average_order_value)}</div>
                                </div>
                                
                                <div className="border rounded-lg p-3 flex flex-col">
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Last Order
                                    </div>
                                    <div className="text-lg font-bold mt-1">{formatDate(stats.last_order_date)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Order History */}
                    <Card className="md:col-span-3">
                        <CardHeader className="pb-3 border-b">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">Order History</CardTitle>
                                <CardDescription>
                                    {orders.total} orders placed
                                </CardDescription>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="pt-4">
                            {orders.data && orders.data.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Items</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    
                                    <TableBody>
                                        {orders.data.map((order) => (
                                            <TableRow key={order.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">#{order.id}</TableCell>
                                                <TableCell>{formatDate(order.created_at)}</TableCell>
                                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                                                <TableCell>
                                                    <span className="text-sm">
                                                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(order.total)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/admin/orders/${order.id}`}>
                                                        <Button size="sm" variant="outline">
                                                            View Order
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8">
                                    <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                                    <p className="text-gray-500">
                                        This customer hasn't placed any orders yet.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        
                        {orders.last_page > 1 && (
                            <CardFooter className="flex justify-between items-center border-t pt-4">
                                <div className="text-sm text-gray-500">
                                    Showing {orders.from} to {orders.to} of {orders.total} orders
                                </div>
                                <div className="flex gap-1">
                                    <Link
                                        href={orders.links[0].url || '#'}
                                        className={`px-3 py-1 rounded border ${
                                            !orders.links[0].url 
                                                ? 'text-gray-300 border-gray-200 cursor-not-allowed' 
                                                : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        Previous
                                    </Link>
                                    <Link
                                        href={orders.links[orders.links.length - 1].url || '#'}
                                        className={`px-3 py-1 rounded border ${
                                            !orders.links[orders.links.length - 1].url 
                                                ? 'text-gray-300 border-gray-200 cursor-not-allowed' 
                                                : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        Next
                                    </Link>
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
} 