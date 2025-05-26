import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_name: string | null;
  parent_id: number | null;
  path: string;
  image_path: string | null;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

interface CategoriesIndexProps {
  categories: Category[];
  success?: string;
  error?: string;
}

export default function CategoriesIndex({ categories, success, error }: CategoriesIndexProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.path && category.path.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleDelete = (id: number) => {
    if (confirmDelete === id) {
      router.delete(`/admin/categories/${id}`);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };
  
  return (
    <AdminLayout breadcrumbs={[
      { title: 'Admin', href: '/admin' },
      { title: 'Categories', href: '/admin/categories' },
    ]}>
      <Head title="Categories" />
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Categories</h1>
          <Link href="/admin/categories/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </Link>
        </div>
        
        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-600">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert className="bg-red-50 border-red-200 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Manage Categories</CardTitle>
            <CardDescription>
              Organize your products with categories and subcategories
            </CardDescription>
            <div className="flex items-center gap-2 pt-2">
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {category.image_path && (
                            <img
                              src={`/storage/${category.image_path}`}
                              alt={category.name}
                              className="h-8 w-8 rounded object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/uploads/placeholder.jpg';
                              }}
                            />
                          )}
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {category.path}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.product_count}</Badge>
                      </TableCell>
                      <TableCell>
                        {category.is_active ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/categories/${category.id}/edit`}>
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant={confirmDelete === category.id ? "destructive" : "outline"}
                            size="icon"
                            onClick={() => handleDelete(category.id)}
                          >
                            {confirmDelete === category.id ? (
                              <ChevronRight className="h-4 w-4" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 