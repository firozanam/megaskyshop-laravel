import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Trash2, Edit, PlusCircle, Search } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface UsersIndexProps {
    users: {
        data: User[];
    };
    filters?: {
        search?: string;
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
        title: 'Users',
        href: '/admin/users',
    },
];

export default function UsersIndex({ users = { data: [] }, filters = {}, flash = {} }: UsersIndexProps) {
    // Search state
    const [search, setSearch] = useState(filters.search || '');
    const [isSearching, setIsSearching] = useState(false);
    
    // State for delete confirmation dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    
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
        setIsSearching(true);
        
        router.get('/admin/users', { search }, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsSearching(false),
        });
    };
    
    // Clear search
    const clearSearch = () => {
        setSearch('');
        router.get('/admin/users', {}, {
            preserveState: true,
            replace: true,
        });
    };
    
    // Handle delete user
    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };
    
    const confirmDelete = () => {
        if (userToDelete) {
            // Use Inertia router to delete the user
            router.delete(`/admin/users/${userToDelete.id}`);
        }
        setDeleteDialogOpen(false);
    };
    
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
                    <Link href="/admin/users/create" className="w-full sm:w-auto">
                        <Button className="flex items-center gap-2 w-full sm:w-auto">
                            <PlusIcon className="h-4 w-4" />
                            Add User
                        </Button>
                    </Link>
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
                
                {/* Simple Search */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                            <Input
                                type="text"
                                placeholder="Search by name or email"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 w-full"
                            />
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        </div>
                        
                        <div className="flex gap-2">
                            <Button type="submit" disabled={isSearching} className="w-full sm:w-auto">
                                {isSearching ? 'Searching...' : 'Search'}
                            </Button>
                            
                            {search && (
                                <Button type="button" variant="outline" onClick={clearSearch} className="w-full sm:w-auto">
                                    Clear
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
                
                {/* User list */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Users</h2>
                    
                    {/* Desktop view */}
                    <div className="hidden sm:block">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {users.data.map((user: User) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap dark:text-gray-200">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap dark:text-gray-200">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap dark:text-gray-200">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.role === 'admin' 
                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <Link href={`/admin/users/${user.id}/edit`}>
                                                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                                                        <PencilIcon className="h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm"
                                                    className="flex items-center gap-1"
                                                    onClick={() => handleDeleteClick(user)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Mobile view */}
                    <div className="sm:hidden space-y-4">
                        {users.data.map((user: User) => (
                            <Card key={user.id} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium flex items-center gap-2 mb-1">
                                            {user.name}
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.role === 'admin' 
                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {user.email}
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Link href={`/admin/users/${user.id}/edit`}>
                                            <Button variant="outline" size="sm" className="p-2">
                                                <PencilIcon className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            className="p-2"
                                            onClick={() => handleDeleteClick(user)}
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                    
                    {users.data.length === 0 && (
                        <div className="py-8 text-center">
                            <p className="dark:text-gray-300">No users found.</p>
                            {search && (
                                <Button 
                                    variant="outline" 
                                    className="mt-4"
                                    onClick={clearSearch}
                                >
                                    Clear Search
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="dark:bg-gray-800 dark:text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-300">
                            This will permanently delete the user{' '}
                            <span className="font-medium">{userToDelete?.name}</span>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
} 