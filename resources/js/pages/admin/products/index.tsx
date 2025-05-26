import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
  Trash2, 
  Edit, 
  PlusCircle, 
  Eye, 
  Search, 
  Filter, 
  ChevronDown, 
  ArrowUpDown, 
  Package, 
  Layers, 
  Tag,
  X
} from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    const filters = props.filters || {};
    
    // State for search
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    
    // Helper function to get category name
    const getCategoryName = (product: Product) => {
        if (product.category_id) {
            const category = categories.find(c => c.id === product.category_id);
            return category ? category.name : product.category;
        }
        return product.category;
    };
    
    // Helper function to format price with ৳ symbol
    const formatPrice = (price: string) => {
        return `৳${parseFloat(price).toLocaleString()}`;
    };
    
    // Helper function to get image path
    const getImagePath = (imagePath: string | null) => {
        if (!imagePath) {
            return '/images/placeholder.jpg';
        }
        
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        if (imagePath.startsWith('/storage/')) {
            return imagePath;
        }
        
        return `/storage/${imagePath}`;
    };
    
    // Handle search input change with debounce
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        
        // Clear any existing timeout
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        
        // If search term is cleared, immediately clear the search
        if (!value.trim()) {
            clearSearch();
            return;
        }
        
        // Debounce the search to prevent too many requests
        searchTimeout.current = setTimeout(() => {
            setIsSearching(true);
            
            const queryParams: Record<string, any> = { 
                ...filters,
                search: value,
                category: categoryFilter !== 'all' ? categoryFilter : undefined
            };
            
            // Remove undefined values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === undefined) {
                    delete queryParams[key];
                }
            });
            
            router.get(
                route('admin.products.index'),
                queryParams,
                {
                    preserveState: true,
                    onSuccess: () => setIsSearching(false),
                    onError: () => setIsSearching(false)
                }
            );
        }, 500);
    };
    
    // Handle category filter change
    const handleCategoryChange = (value: string) => {
        setCategoryFilter(value);
        
        const queryParams: Record<string, any> = { 
            ...filters,
            search: searchQuery,
            category: value !== 'all' ? value : undefined
        };
        
        // Remove undefined values
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === undefined) {
                delete queryParams[key];
            }
        });
        
        router.get(
            route('admin.products.index'),
            queryParams,
            { preserveState: true }
        );
    };
    
    // Clear search and filters
    const clearSearch = () => {
        setSearchQuery('');
        setCategoryFilter('all');
        
        // Create a new object without the search and category properties
        const { search, category, ...restFilters } = filters;
        
        router.get(
            route('admin.products.index'),
            restFilters,
            { preserveState: true }
        );
    };
    
    // Stock status badge
    const getStockBadge = (stock: number) => {
        if (stock <= 0) {
            return <Badge variant="destructive">Out of Stock</Badge>;
        } else if (stock < 10) {
            return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">{stock} - Low</Badge>;
        } else {
            return <Badge variant="outline" className="bg-green-50 text-green-700">{stock} in stock</Badge>;
        }
    };
    
    // Get all unique categories from products
    const uniqueCategories = React.useMemo(() => {
        const categorySet = new Set<string>();
        products.forEach(product => {
            categorySet.add(getCategoryName(product));
        });
        return Array.from(categorySet);
    }, [products]);
    
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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold">Products</h1>
                        <p className="text-muted-foreground text-sm">
                            Manage your product inventory, prices and details
                        </p>
                    </div>
                    <Link href="/admin/products/create">
                        <Button className="bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </Link>
                </div>
                
                {/* Search filters indicator */}
                {(searchQuery || categoryFilter !== 'all') && (
                    <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-md flex items-center justify-between">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="font-medium">Active filters:</span>
                            {searchQuery && (
                                <Badge variant="outline" className="bg-white flex items-center gap-1 pl-2">
                                    Search: {searchQuery}
                                    <button 
                                        onClick={() => handleSearchChange('')}
                                        className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {categoryFilter !== 'all' && (
                                <Badge variant="outline" className="bg-white flex items-center gap-1 pl-2">
                                    Category: {categoryFilter}
                                    <button 
                                        onClick={() => handleCategoryChange('all')}
                                        className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSearch}
                            className="text-blue-700 hover:bg-blue-100"
                        >
                            Clear All Filters
                        </Button>
                    </div>
                )}
                
                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Package className="h-5 w-5 text-gray-500" />
                                    Product Management
                                </CardTitle>
                                <CardDescription>
                                    {products.length > 0 
                                        ? `Showing ${products.length} products` 
                                        : 'No products found'}
                                </CardDescription>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="search"
                                        placeholder="Search products..."
                                        className="pl-9 w-full"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => handleSearchChange('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-4 w-4" />
                                            <span className="sr-only">Clear search</span>
                                        </button>
                                    )}
                                </div>
                                
                                <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-gray-500" />
                                            <SelectValue placeholder="All Categories" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {uniqueCategories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Products list view */}
                        <div className="overflow-x-auto rounded-md">
                            {products.length > 0 ? (
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr className="bg-gray-50 text-left border-y">
                                            <th className="px-4 py-3 text-sm font-medium text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    Image
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 text-sm font-medium text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    Product Name
                                                    <ArrowUpDown className="h-3 w-3" />
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 text-sm font-medium text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    Category
                                                    <ArrowUpDown className="h-3 w-3" />
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 text-sm font-medium text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    Price
                                                    <ArrowUpDown className="h-3 w-3" />
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 text-sm font-medium text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    Stock
                                                    <ArrowUpDown className="h-3 w-3" />
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 text-sm font-medium text-gray-500 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {products.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 w-24">
                                                    <div className="h-16 w-16 rounded-md border border-gray-200 overflow-hidden flex-shrink-0">
                                                        <img 
                                                            src={getImagePath(product.main_image)}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/images/placeholder.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-sm text-gray-500">ID: {product.id}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                        {getCategoryName(product)}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 font-medium">{formatPrice(product.price)}</td>
                                                <td className="px-4 py-3">
                                                    {getStockBadge(product.stock)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2 justify-center">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Link href={`/products/${product.id}`} target="_blank">
                                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>View Product</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Link href={`/admin/products/${product.id}/edit`}>
                                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Edit Product</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="ghost"
                                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                        onClick={() => handleDelete(product.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Delete Product</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-12 px-4 border-t">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                        <Layers className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {searchQuery || categoryFilter !== 'all' 
                                            ? 'Try adjusting your search or filter criteria' 
                                            : 'Get started by adding your first product'}
                                    </p>
                                    {!searchQuery && categoryFilter === 'all' && (
                                        <Link href="/admin/products/create">
                                            <Button className="bg-blue-600 hover:bg-blue-700">
                                                <PlusCircle className="h-4 w-4 mr-1" />
                                                Add your first product
                                            </Button>
                                        </Link>
                                    )}
                                    {(searchQuery || categoryFilter !== 'all') && (
                                        <Button 
                                            variant="outline" 
                                            onClick={clearSearch}
                                        >
                                            Clear filters
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
} 