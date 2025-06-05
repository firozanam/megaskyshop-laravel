import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Search, ArrowUpDown, UserCircle, Phone, Mail, CalendarClock, ShoppingBag, CreditCard } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Pagination } from '@/components/pagination';
import { Eye } from 'lucide-react';

interface Customer {
    customer_id: string;
    name: string;
    email: string | null;
    mobile: string;
    first_order_date: string;
    last_order_date: string;
    order_count: number;
    total_spent: number;
    customer_type: 'registered' | 'guest';
}

interface CustomersPagination {
    data: Customer[];
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

interface CustomersIndexProps {
    customers: CustomersPagination;
    filters?: {
        search?: string;
        type?: string;
        sort_by?: string;
        sort_direction?: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Customers',
        href: '/admin/customers',
    },
];

export default function CustomersIndex({ customers, filters = {}, flash = {} }: CustomersIndexProps) {
    // Search state
    const [search, setSearch] = useState(filters.search || '');
    const [isSearching, setIsSearching] = useState(false);
    
    // Filter state
    const [customerType, setCustomerType] = useState(filters.type || 'all');
    
    // Sort state
    const [sortBy, setSortBy] = useState(filters.sort_by || 'last_order_date');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');
    
    // State for flash messages
    const [showSuccessMessage, setShowSuccessMessage] = useState(!!flash.success);
    const [showErrorMessage, setShowErrorMessage] = useState(!!flash.error);
    
    // Auto-hide flash messages after 5 seconds
    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);
    
    useEffect(() => {
        if (showErrorMessage) {
            const timer = setTimeout(() => {
                setShowErrorMessage(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showErrorMessage]);
    
    // Handle search form submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };
    
    // Apply filters
    const applyFilters = () => {
        setIsSearching(true);
        
        router.get('/admin/customers', {
            search,
            type: customerType !== 'all' ? customerType : undefined,
            sort_by: sortBy,
            sort_direction: sortDirection
        }, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsSearching(false),
        });
    };
    
    // Handle customer type filter change
    const handleCustomerTypeChange = (value: string) => {
        setCustomerType(value);
        setTimeout(() => {
            router.get('/admin/customers', {
                search,
                type: value !== 'all' ? value : undefined,
                sort_by: sortBy,
                sort_direction: sortDirection
            }, {
                preserveState: true,
                replace: true,
            });
        }, 100);
    };
    
    // Handle sort change
    const handleSortChange = (column: string) => {
        const newDirection = sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortDirection(newDirection);
        
        setTimeout(() => {
            router.get('/admin/customers', {
                search,
                type: customerType !== 'all' ? customerType : undefined,
                sort_by: column,
                sort_direction: newDirection
            }, {
                preserveState: true,
                replace: true,
            });
        }, 100);
    };
    
    // Clear all filters
    const clearFilters = () => {
        setSearch('');
        setCustomerType('all');
        setSortBy('last_order_date');
        setSortDirection('desc');
        
        router.get('/admin/customers', {}, {
            preserveState: true,
            replace: true,
        });
    };
    
    // Get sort indicator for column
    const getSortIndicator = (column: string) => {
        if (sortBy !== column) return null;
        
        return sortDirection === 'asc' 
            ? <span className="text-blue-600">↑</span> 
            : <span className="text-blue-600">↓</span>;
    };
    
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Management" />
            
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Customer Management</h1>
                        <p className="text-muted-foreground">
                            View and manage all customers who have placed orders
                        </p>
                    </div>
                </div>
                
                {/* Flash Messages */}
                {showSuccessMessage && flash.success && (
                    <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30">
                        <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle className="text-green-800 dark:text-green-300">Success</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-400">
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}
                
                {showErrorMessage && flash.error && (
                    <Alert variant="destructive">
                        <XCircleIcon className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {flash.error}
                        </AlertDescription>
                    </Alert>
                )}
                
                {/* Filters */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Filter Customers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 flex-1">
                                <div className="flex-1 relative">
                                    <Input
                                        type="text"
                                        placeholder="Search by name, email or phone"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 w-full"
                                    />
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                </div>
                                
                                <Button type="submit" disabled={isSearching} className="w-full sm:w-auto">
                                    {isSearching ? 'Searching...' : 'Search'}
                                </Button>
                            </form>
                            
                            {/* Customer Type Filter */}
                            <Select value={customerType} onValueChange={handleCustomerTypeChange}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Customers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Customers</SelectItem>
                                    <SelectItem value="registered">Registered Users</SelectItem>
                                    <SelectItem value="guest">Guest Users</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* Active Filters */}
                        {(search || customerType !== 'all' || sortBy !== 'last_order_date' || sortDirection !== 'desc') && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gray-50 p-3 rounded-md">
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-sm font-medium text-gray-500">Active filters:</span>
                                    {search && (
                                        <Badge variant="outline" className="bg-white">
                                            Search: {search}
                                        </Badge>
                                    )}
                                    {customerType !== 'all' && (
                                        <Badge variant="outline" className="bg-white">
                                            Type: {customerType === 'registered' ? 'Registered' : 'Guest'}
                                        </Badge>
                                    )}
                                    {(sortBy !== 'last_order_date' || sortDirection !== 'desc') && (
                                        <Badge variant="outline" className="bg-white">
                                            Sort: {sortBy} ({sortDirection === 'asc' ? 'asc' : 'desc'})
                                        </Badge>
                                    )}
                                </div>
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2 sm:mt-0">
                                    Clear All
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                {/* Customer list */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <CardTitle>All Customers</CardTitle>
                            <CardDescription>
                                {customers.total} customers found
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {customers.data && customers.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                {/* Desktop view */}
                                <div className="hidden sm:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50">
                                                <TableHead className="w-[200px] sm:w-auto">
                                                    <button 
                                                        className="flex items-center gap-1 font-medium hover:text-blue-600"
                                                        onClick={() => handleSortChange('name')}
                                                    >
                                                        <UserCircle className="h-4 w-4 text-gray-500" />
                                                        Customer
                                                        {getSortIndicator('name')}
                                                    </button>
                                                </TableHead>
                                                <TableHead className="hidden md:table-cell">
                                                    <button 
                                                        className="flex items-center gap-1 font-medium hover:text-blue-600"
                                                        onClick={() => handleSortChange('email')}
                                                    >
                                                        <Mail className="h-4 w-4 text-gray-500" />
                                                        Email
                                                        {getSortIndicator('email')}
                                                    </button>
                                                </TableHead>
                                                <TableHead className="hidden lg:table-cell">
                                                    <div className="flex items-center gap-1 font-medium">
                                                        <Phone className="h-4 w-4 text-gray-500" />
                                                        Phone
                                                    </div>
                                                </TableHead>
                                                <TableHead className="hidden md:table-cell">
                                                    <button 
                                                        className="flex items-center gap-1 font-medium hover:text-blue-600"
                                                        onClick={() => handleSortChange('first_order_date')}
                                                    >
                                                        <CalendarClock className="h-4 w-4 text-gray-500" />
                                                        Joined
                                                        {getSortIndicator('first_order_date')}
                                                    </button>
                                                </TableHead>
                                                <TableHead>
                                                    <button 
                                                        className="flex items-center gap-1 font-medium hover:text-blue-600"
                                                        onClick={() => handleSortChange('order_count')}
                                                    >
                                                        <ShoppingBag className="h-4 w-4 text-gray-500" />
                                                        Orders
                                                        {getSortIndicator('order_count')}
                                                    </button>
                                                </TableHead>
                                                <TableHead className="hidden lg:table-cell">
                                                    <button 
                                                        className="flex items-center gap-1 font-medium hover:text-blue-600"
                                                        onClick={() => handleSortChange('total_spent')}
                                                    >
                                                        <CreditCard className="h-4 w-4 text-gray-500" />
                                                        Total Spent
                                                        {getSortIndicator('total_spent')}
                                                    </button>
                                                </TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {customers.data.map((customer) => (
                                                <TableRow key={customer.customer_id} className="hover:bg-gray-50">
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                {customer.name}
                                                                <Badge 
                                                                    variant="outline" 
                                                                    className={customer.customer_type === 'registered' 
                                                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                                                        : 'bg-gray-50 text-gray-700 border-gray-200'}
                                                                >
                                                                    {customer.customer_type === 'registered' ? 'Registered' : 'Guest'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {customer.email || 
                                                            <span className="text-gray-400 italic">Not provided</span>
                                                        }
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell font-medium">
                                                        {customer.mobile}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {formatDate(customer.first_order_date)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-semibold">{customer.order_count}</span>
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell">
                                                        {formatCurrency(customer.total_spent)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Link href={`/admin/customers/${customer.customer_id}`}>
                                                                <Button size="sm" variant="outline">
                                                                    View Details
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-right">
                                                    <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                                                        Showing {customers.from} to {customers.to} of {customers.total} customers
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </div>
                                
                                {/* Mobile view */}
                                <div className="sm:hidden space-y-4">
                                    {customers.data.map((customer) => (
                                        <Card key={customer.customer_id} className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium flex items-center gap-2 mb-1">
                                                        <UserCircle className="h-4 w-4 text-gray-500" />
                                                        {customer.name}
                                                        <Badge 
                                                            variant="outline" 
                                                            className={customer.customer_type === 'registered' 
                                                                ? 'bg-green-50 text-green-700 border-green-200' 
                                                                : 'bg-gray-50 text-gray-700 border-gray-200'}
                                                        >
                                                            {customer.customer_type === 'registered' ? 'Registered' : 'Guest'}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {customer.email || 'No email provided'}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">{customer.order_count} orders</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatCurrency(customer.total_spent)}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-3 pt-3 border-t flex flex-wrap gap-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    {customer.mobile}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <CalendarClock className="h-4 w-4 text-gray-400" />
                                                    {formatDate(customer.first_order_date)}
                                                </div>
                                            </div>
                                            
                                            <div className="mt-3 pt-3 border-t flex justify-end">
                                                <Link href={`#`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                                    <Eye className="h-4 w-4" /> View
                                                </Link>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No customers found
                            </div>
                        )}
                        
                        {customers.total > 0 && (
                            <div className="mt-4">
                                <Pagination 
                                    links={customers.links}
                                    currentPage={customers.current_page}
                                    lastPage={customers.last_page}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
} 