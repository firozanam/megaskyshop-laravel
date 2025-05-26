import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  image_path: string | null;
  is_active: boolean;
  sort_order: number;
}

interface CategoryEditProps {
  category: Category;
  parentCategories: Category[];
  errors?: Record<string, string>;
}

export default function CategoryEdit({ category, parentCategories, errors = {} }: CategoryEditProps) {
  const [formData, setFormData] = useState({
    name: category.name || '',
    slug: category.slug || '',
    description: category.description || '',
    parent_id: category.parent_id ? category.parent_id.toString() : '',
    is_active: category.is_active,
    sort_order: category.sort_order.toString() || '0',
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    category.image_path ? `/storage/${category.image_path}` : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from name if slug is empty or matches the original slug pattern
    if (name === 'name' && (formData.slug === '' || formData.slug === category.slug)) {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }));
    }
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = new FormData();
    
    // Add form fields to FormData
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value.toString());
    });
    
    // Add image to FormData if selected
    if (selectedImage) {
      data.append('image', selectedImage);
    }
    
    // Use PUT method
    data.append('_method', 'PUT');
    
    router.post(`/admin/categories/${category.id}`, data, {
      onFinish: () => {
        setIsSubmitting(false);
      }
    });
  };
  
  return (
    <AdminLayout breadcrumbs={[
      { title: 'Admin', href: '/admin' },
      { title: 'Categories', href: '/admin/categories' },
      { title: `Edit: ${category.name}`, href: `/admin/categories/${category.id}/edit` },
    ]}>
      <Head title={`Edit Category: ${category.name}`} />
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <div className="flex items-center gap-2">
          <Link href="/admin/categories">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Category: {category.name}</h1>
        </div>
        
        {Object.keys(errors).length > 0 && (
          <Alert className="bg-red-50 border-red-200 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="text-sm font-semibold mb-2">Please fix the following errors:</div>
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    {field}: {error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>Update information about the category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL-friendly name)</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className={errors.slug ? 'border-red-500' : ''}
                  />
                  {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
                  <p className="text-xs text-gray-500">
                    Used in URLs. Change with caution.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    errors.description ? 'border-red-500' : ''
                  }`}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="parent_id">Parent Category</Label>
                  <select
                    id="parent_id"
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleChange}
                    className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      errors.parent_id ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">None (Top Level Category)</option>
                    {parentCategories.map((parentCategory) => (
                      <option 
                        key={parentCategory.id} 
                        value={parentCategory.id}
                        disabled={parentCategory.id === category.id}
                      >
                        {parentCategory.name}
                      </option>
                    ))}
                  </select>
                  {errors.parent_id && <p className="text-sm text-red-500">{errors.parent_id}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    name="sort_order"
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={handleChange}
                    className={errors.sort_order ? 'border-red-500' : ''}
                  />
                  {errors.sort_order && <p className="text-sm text-red-500">{errors.sort_order}</p>}
                  <p className="text-xs text-gray-500">
                    Categories with lower numbers appear first.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Category Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp,image/avif"
                    onChange={handleImageChange}
                    className={errors.image ? 'border-red-500' : ''}
                  />
                  
                  {imagePreviewUrl && (
                    <div className="relative h-16 w-16">
                      <img
                        src={imagePreviewUrl}
                        alt="Preview"
                        className="h-full w-full rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/uploads/placeholder.jpg';
                        }}
                      />
                    </div>
                  )}
                </div>
                {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
                <p className="text-xs text-gray-500">
                  Leave empty to keep current image. Recommended size: 200x200 pixels. Max size: 2MB.
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              {errors.is_active && <p className="text-sm text-red-500">{errors.is_active}</p>}
              
              <div className="flex justify-end space-x-2">
                <Link href="/admin/categories">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AdminLayout>
  );
} 