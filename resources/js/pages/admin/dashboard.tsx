import { useState, useEffect } from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Layers, PlusCircle, ShoppingBag, Users, List, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
    id: number;
    name: string;
    price: string;
    category: string;
    main_image: string | null;
}

interface DashboardProps {
    recentProducts?: Product[];
    productCount?: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

export default function AdminDashboard({ recentProducts = [], productCount = 0 }: DashboardProps) {
    // Stats cards data
    const statsCards = [
        {
            title: 'Total Products',
            value: productCount.toString(),
            description: 'Products in inventory',
            icon: <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />,
            change: '+4% from last month',
        },
        {
            title: 'Total Sales',
            value: '৳12,345',
            description: 'Revenue this month',
            icon: <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />,
            change: '+12% from last month',
        },
        {
            title: 'Active Users',
            value: '3',
            description: 'Current users',
            icon: <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />,
            change: 'No change from last month',
        },
        {
            title: 'Analytics',
            value: '24%',
            description: 'Conversion rate',
            icon: <BarChart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />,
            change: '+2% from last month',
        },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 sm:gap-6 p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
                        <div className="flex flex-wrap gap-2">
                            <Link href="/admin/products" preserveScroll={false} className="w-full xs:w-auto">
                                <Button variant="outline" className="w-full xs:w-auto text-xs sm:text-sm">
                                    <List className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    Manage Products
                                </Button>
                            </Link>
                            <Link href="/admin/products/create" preserveScroll={false} className="w-full xs:w-auto">
                                <Button className="w-full xs:w-auto text-xs sm:text-sm">
                                    <PlusCircle className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    Add Product
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Welcome to the admin dashboard. Manage your products, users, and store settings.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map((card, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                                <CardTitle className="text-xs sm:text-sm font-medium">{card.title}</CardTitle>
                                {card.icon}
                            </CardHeader>
                            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                                <div className="text-lg sm:text-2xl font-bold">{card.value}</div>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">{card.description}</p>
                                <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium text-muted-foreground">{card.change}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Products */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 px-3 sm:px-6 py-3 sm:py-4">
                        <div>
                            <CardTitle className="text-base sm:text-lg">Recent Products</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                Your recently added products in the store
                            </CardDescription>
                        </div>
                        <Link href="/admin/products">
                            <Button variant="outline" size="sm" className="text-xs w-full sm:w-auto">
                                View All
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {recentProducts.length > 0 ? (
                                recentProducts.map((product) => (
                                    <div key={product.id} className="border-sidebar-border/70 dark:border-sidebar-border group relative aspect-video overflow-hidden rounded-lg sm:rounded-xl border">
                                        {product.main_image ? (
                                            <img 
                                                src={`/storage/${product.main_image}`} 
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/uploads/placeholder.jpg';
                                                }}
                                            />
                                        ) : (
                                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                        )}
                                        <div className="absolute bottom-0 w-full bg-black/40 p-1.5 sm:p-2 text-white">
                                            <p className="text-xs sm:text-sm font-medium truncate">{product.name}</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] sm:text-xs">৳{product.price}</p>
                                                <Link href={`/admin/products/${product.id}/edit`}>
                                                    <Button size="sm" variant="ghost" className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-white hover:bg-white/20">
                                                        <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-lg sm:rounded-xl border">
                                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                        <div className="absolute bottom-0 w-full bg-black/40 p-1.5 sm:p-2 text-white">
                                            <p className="text-xs sm:text-sm font-medium">No products yet</p>
                                            <p className="text-[10px] sm:text-xs">Add your first product</p>
                                        </div>
                                    </div>
                                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-lg sm:rounded-xl border">
                                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                        <div className="absolute bottom-0 w-full bg-black/40 p-1.5 sm:p-2 text-white">
                                            <p className="text-xs sm:text-sm font-medium">No products yet</p>
                                            <p className="text-[10px] sm:text-xs">Add your first product</p>
                                        </div>
                                    </div>
                                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-lg sm:rounded-xl border hidden xs:block">
                                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                        <div className="absolute bottom-0 w-full bg-black/40 p-1.5 sm:p-2 text-white">
                                            <p className="text-xs sm:text-sm font-medium">No products yet</p>
                                            <p className="text-[10px] sm:text-xs">Add your first product</p>
                                        </div>
                                    </div>
                                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-lg sm:rounded-xl border hidden md:block">
                                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                        <div className="absolute bottom-0 w-full bg-black/40 p-1.5 sm:p-2 text-white">
                                            <p className="text-xs sm:text-sm font-medium">No products yet</p>
                                            <p className="text-[10px] sm:text-xs">Add your first product</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                    <Card className="overflow-hidden">
                        <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
                            <CardTitle className="text-base sm:text-lg">Product Management</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Common product management tasks</CardDescription>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                            <div className="flex flex-col xs:flex-row flex-wrap gap-2">
                                <Link href="/admin/products/create" className="w-full xs:w-auto">
                                    <Button variant="outline" className="w-full xs:w-auto text-xs sm:text-sm">
                                        <PlusCircle className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        Add New Product
                                    </Button>
                                </Link>
                                <Link href="/admin/products" className="w-full xs:w-auto">
                                    <Button variant="outline" className="w-full xs:w-auto text-xs sm:text-sm">
                                        <List className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        View All Products
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="overflow-hidden">
                        <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
                            <CardTitle className="text-base sm:text-lg">User Management</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Manage system users and admins</CardDescription>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                            <div className="flex flex-col xs:flex-row flex-wrap gap-2">
                                <Link href="/admin/users/create" className="w-full xs:w-auto">
                                    <Button variant="outline" className="w-full xs:w-auto text-xs sm:text-sm">
                                        <PlusCircle className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        Add New User
                                    </Button>
                                </Link>
                                <Link href="/admin/users" className="w-full xs:w-auto">
                                    <Button variant="outline" className="w-full xs:w-auto text-xs sm:text-sm">
                                        <Users className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        Manage Users
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}