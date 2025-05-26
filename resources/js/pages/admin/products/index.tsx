import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Trash2, Edit, PlusCircle } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Simplified interface for the ProductIndex component
interface Product {
    id: number;
    name: string;
    price: string;
    category: string;
    category_id: number | null;
    stock: number;
    main_image: string | null;
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface ProductIndexProps {
    products: {
        data: Product[];
    };
    categories: Category[];
    legacyCategories: string[];
    filters: Record<string, any>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Products', href: '/admin/products' },
];

export default function ProductIndex(props: ProductIndexProps) {
    // Extract props with default values to prevent null errors
    const products = props.products?.data || [];
    const categories = props.categories || [];
    const legacyCategories = props.legacyCategories || [];
    
    // Helper function to get category name
    const getCategoryName = (product: Product) => {
        if (product.category_id) {
            const category = categories.find(c => c.id === product.category_id);
            return category ? category.name : product.category;
        }
        return product.category;
    };
    
    // Debug information
    useEffect(() => {
        console.log('Products index component mounted');
        console.log('Props received:', props);
        console.log('Products data:', products);
        console.log('Categories:', categories);
        console.log('Legacy Categories:', legacyCategories);
    }, [props, products, categories, legacyCategories]);
    
    const handleDelete = (productId: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/admin/products/${productId}`);
        }
    };
    
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Products" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Products</h1>
                    <Link href="/admin/products/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Product
                        </Button>
                    </Link>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Product Management</CardTitle>
                        <CardDescription>
                            {products.length > 0 
                                ? `Showing ${products.length} products` 
                                : 'No products found'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Basic product list */}
                        <div className="overflow-x-auto rounded-md border p-4">
                            {products.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {products.map((product) => (
                                        <div key={product.id} className="border p-4 rounded-md">
                                            <div className="flex justify-between mb-2">
                                                <h3 className="font-semibold">{product.name}</h3>
                                                <span className="text-sm font-medium">${product.price}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {getCategoryName(product)} | Stock: {product.stock}
                                            </p>
                                            <div className="flex gap-2 justify-end">
                                                <Link href={`/admin/products/${product.id}/edit`}>
                                                    <Button size="sm" variant="outline">
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No products found.</p>
                                    <p className="mt-2">
                                        <Link href="/admin/products/create">
                                            <Button variant="outline" size="sm">
                                                <PlusCircle className="h-4 w-4 mr-1" />
                                                Add your first product
                                            </Button>
                                        </Link>
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
} 