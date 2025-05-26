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
            icon: <Layers className="h-6 w-6 text-primary" />,
            change: '+4% from last month',
        },
        {
            title: 'Total Sales',
            value: '৳12,345',
            description: 'Revenue this month',
            icon: <ShoppingBag className="h-6 w-6 text-primary" />,
            change: '+12% from last month',
        },
        {
            title: 'Active Users',
            value: '3',
            description: 'Current users',
            icon: <Users className="h-6 w-6 text-primary" />,
            change: 'No change from last month',
        },
        {
            title: 'Analytics',
            value: '24%',
            description: 'Conversion rate',
            icon: <BarChart className="h-6 w-6 text-primary" />,
            change: '+2% from last month',
        },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <div className="flex gap-2">
                            <Link href="/admin/products" preserveScroll={false}>
                                <Button variant="outline">
                                    <List className="mr-2 h-4 w-4" />
                                    Manage Products
                                </Button>
                            </Link>
                            <Link href="/admin/products/create" preserveScroll={false}>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Product
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <p className="text-muted-foreground">
                        Welcome to the admin dashboard. Manage your products, users, and store settings.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map((card, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                {card.icon}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                                <p className="text-xs text-muted-foreground">{card.description}</p>
                                <p className="mt-2 text-xs font-medium text-muted-foreground">{card.change}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Products */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Products</CardTitle>
                            <CardDescription>
                                Your recently added products in the store
                            </CardDescription>
                        </div>
                        <Link href="/admin/products">
                            <Button variant="outline" size="sm">
                                View All
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            {recentProducts.length > 0 ? (
                                recentProducts.map((product) => (
                                    <div key={product.id} className="border-sidebar-border/70 dark:border-sidebar-border group relative aspect-video overflow-hidden rounded-xl border">
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
                                        <div className="absolute bottom-0 w-full bg-black/40 p-2 text-white">
                                            <p className="text-sm font-medium">{product.name}</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs">৳{product.price}</p>
                                                <Link href={`/admin/products/${product.id}/edit`}>
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white hover:bg-white/20">
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                        <div className="absolute bottom-0 w-full bg-black/40 p-2 text-white">
                                            <p className="text-sm font-medium">No products yet</p>
                                            <p className="text-xs">Add your first product</p>
                                        </div>
                                    </div>
                                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                        <div className="absolute bottom-0 w-full bg-black/40 p-2 text-white">
                                            <p className="text-sm font-medium">No products yet</p>
                                            <p className="text-xs">Add your first product</p>
                                        </div>
                                    </div>
                                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                                        <div className="absolute bottom-0 w-full bg-black/40 p-2 text-white">
                                            <p className="text-sm font-medium">No products yet</p>
                                            <p className="text-xs">Add your first product</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Management</CardTitle>
                            <CardDescription>Common product management tasks</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <Link href="/admin/products/create">
                                    <Button variant="outline">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add New Product
                                    </Button>
                                </Link>
                                <Link href="/admin/products">
                                    <Button variant="outline">
                                        <List className="mr-2 h-4 w-4" />
                                        View All Products
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>Manage system users and admins</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <Link href="/admin/users/create">
                                    <Button variant="outline">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add New User
                                    </Button>
                                </Link>
                                <Link href="/admin/users">
                                    <Button variant="outline">
                                        <Users className="mr-2 h-4 w-4" />
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