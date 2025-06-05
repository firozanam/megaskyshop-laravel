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
  X,
  Upload,
  Download,
  FileUp,
  AlertCircle,
  Menu,
  MoreVertical
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatBytes, getPlaceholderImage } from '@/lib/utils';
import { Pagination } from '@/components/pagination';

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
        current_page: number;
        last_page: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        from: number;
        to: number;
        total: number;
        per_page: number;
    };
    categories: Category[];
    legacyCategories: string[];
    filters: Record<string, any>;
    errors?: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
    };
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
    const errors = props.errors || {};
    const flash = props.flash || {};
    
    // State for search
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    
    // State for CSV import
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
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
            return getPlaceholderImage();
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
    
    // Handle file change for CSV import
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploadError(null);
        const file = e.target.files?.[0];
        
        if (!file) {
            setSelectedFile(null);
            return;
        }
        
        // Validate file type
        if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
            setUploadError('Please select a CSV file');
            setSelectedFile(null);
            return;
        }
        
        setSelectedFile(file);
    };
    
    // Handle CSV import form submission
    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedFile) {
            setUploadError('Please select a CSV file to import');
            return;
        }
        
        const formData = new FormData();
        formData.append('csv_file', selectedFile);
        
        router.post(route('admin.products.import'), formData, {
            forceFormData: true,
            onSuccess: () => {
                setImportDialogOpen(false);
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
            onError: (errors) => {
                console.error('Import errors:', errors);
                setUploadError(errors.csv_file || 'An error occurred during import');
            }
        });
    };
    
    // Handle CSV export
    const handleExport = () => {
        window.location.href = route('admin.products.export');
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
            <div className="flex h-full flex-1 flex-col gap-4 sm:gap-6 p-2 sm:p-4">
                {/* Flash Messages */}
                {flash.success && (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}
                
                {flash.error && (
                    <Alert className="bg-red-50 text-red-800 border-red-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col">
                        <h1 className="text-xl sm:text-2xl font-bold">Products</h1>
                        <p className="text-muted-foreground text-sm">
                            Manage your product inventory, prices and details
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {/* CSV Import Dialog */}
                        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 sm:size-default">
                                    <Upload className="mr-2 h-4 w-4" />
                                    <span className="hidden xs:inline">Import CSV</span>
                                    <span className="xs:hidden">Import</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md max-w-[95vw] w-full">
                                <DialogHeader>
                                    <DialogTitle>Import Products from CSV</DialogTitle>
                                    <DialogDescription>
                                        Upload a CSV file with product data. The file must include columns for Name, Price, Category, and Stock.
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <form onSubmit={handleImportSubmit} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="csv-file">CSV File</Label>
                                        <Input
                                            id="csv-file"
                                            type="file"
                                            accept=".csv"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="border-blue-200 focus-visible:ring-blue-500"
                                        />
                                        {selectedFile && (
                                            <p className="text-sm text-gray-500">
                                                Selected file: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                                            </p>
                                        )}
                                        {uploadError && (
                                            <p className="text-sm text-red-500">{uploadError}</p>
                                        )}
                                    </div>
                                    
                                    <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
                                        <h4 className="text-sm font-medium text-amber-800 mb-1">CSV Format Requirements</h4>
                                        <ul className="text-xs text-amber-700 list-disc list-inside space-y-1">
                                            <li>First row must be column headers</li>
                                            <li>Required columns: Name, Price, Category, Stock</li>
                                            <li>Optional columns: ID, Description, Category ID, Meta Description, Meta Title, Main Image</li>
                                            <li>If ID is provided, existing products will be updated</li>
                                        </ul>
                                        <div className="mt-2 pt-2 border-t border-amber-100">
                                            <a 
                                                href="/templates/product_import_template.csv"
                                                download
                                                className="text-xs flex items-center text-amber-800 hover:text-amber-900 font-medium"
                                            >
                                                <Download className="h-3 w-3 mr-1" />
                                                Download CSV Template
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setImportDialogOpen(false)}
                                            className="w-full sm:w-auto order-2 sm:order-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit"
                                            disabled={!selectedFile}
                                            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto order-1 sm:order-2"
                                        >
                                            <FileUp className="mr-2 h-4 w-4" />
                                            Import Products
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        
                        {/* Export Button */}
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="border-green-300 bg-green-50 text-green-700 hover:bg-green-100 sm:size-default"
                            onClick={handleExport}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            <span className="hidden xs:inline">Export CSV</span>
                            <span className="xs:hidden">Export</span>
                        </Button>
                        
                        {/* Add Product Button */}
                        <Link href="/admin/products/create" className="flex-grow sm:flex-grow-0">
                            <Button className="bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                <span className="hidden xs:inline">Add Product</span>
                                <span className="xs:hidden">Add</span>
                            </Button>
                        </Link>
                    </div>
                </div>
                
                {/* Search filters indicator */}
                {(searchQuery || categoryFilter !== 'all') && (
                    <div className="bg-blue-50 border border-blue-100 text-blue-700 px-3 sm:px-4 py-2 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="font-medium">Active filters:</span>
                            {searchQuery && (
                                <Badge variant="outline" className="bg-white flex items-center gap-1 pl-2 text-xs sm:text-sm">
                                    <span className="truncate max-w-[150px] sm:max-w-[200px]">Search: {searchQuery}</span>
                                    <button 
                                        onClick={() => handleSearchChange('')}
                                        className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {categoryFilter !== 'all' && (
                                <Badge variant="outline" className="bg-white flex items-center gap-1 pl-2 text-xs sm:text-sm">
                                    <span className="truncate max-w-[150px] sm:max-w-[200px]">Category: {categoryFilter}</span>
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
                            className="text-blue-700 hover:bg-blue-100 text-xs sm:text-sm"
                        >
                            Clear All Filters
                        </Button>
                    </div>
                )}
                
                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                    <Package className="h-5 w-5 text-gray-500" />
                                    Product Management
                                </CardTitle>
                                <CardDescription>
                                    {products.length > 0 
                                        ? props.products.total > 0
                                            ? `Showing ${props.products.from} to ${props.products.to} of ${props.products.total} products` 
                                            : `Showing ${products.length} products`
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
                                <div className="min-w-full">
                                    {/* Desktop Table View */}
                                    <table className="w-full table-auto hidden sm:table">
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
                                                                    e.currentTarget.src = getPlaceholderImage();
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
                                    
                                    {/* Mobile Card View */}
                                    <div className="sm:hidden divide-y divide-gray-200">
                                        {products.map((product) => (
                                            <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex gap-3">
                                                    <div className="h-20 w-20 rounded-md border border-gray-200 overflow-hidden flex-shrink-0">
                                                        <img 
                                                            src={getImagePath(product.main_image)}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = getPlaceholderImage();
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <div className="font-medium text-gray-900 truncate">{product.name}</div>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={`/products/${product.id}`} target="_blank" className="cursor-pointer flex items-center">
                                                                            <Eye className="h-4 w-4 mr-2" />
                                                                            View
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={`/admin/products/${product.id}/edit`} className="cursor-pointer flex items-center text-blue-600">
                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                            Edit
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleDelete(product.id)}
                                                                        className="cursor-pointer text-red-500"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mb-1">ID: {product.id}</div>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                                                {getCategoryName(product)}
                                                            </Badge>
                                                            <div className="font-medium text-sm">{formatPrice(product.price)}</div>
                                                            {getStockBadge(product.stock)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
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
                        
                        {/* Pagination */}
                        {props.products && props.products.data && props.products.data.length > 0 && (
                            <div className="py-4 sm:py-6 px-4 border-t border-gray-200 overflow-x-auto">
                                <div className="flex items-center justify-center">
                                    <Pagination 
                                        currentPage={props.products.current_page}
                                        lastPage={props.products.last_page}
                                        links={props.products.links}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
} 