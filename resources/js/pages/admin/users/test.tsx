import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Test',
        href: '/admin/users/test',
    },
];

export default function TestPage() {
    console.log('TestPage rendering');
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test Page" />
            
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Test Page</h1>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                    <p>This is a test page to check if Inertia is working correctly.</p>
                </div>
            </div>
        </AppLayout>
    );
} 