import { useState, FormEvent, ChangeEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface ProductFormProps {
    categories: Category[];
    errors?: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Products',
        href: '/admin/products',
    },
    {
        title: 'Create',
        href: '/admin/products/create',
    },
];

export default function ProductCreate({ categories, errors = {} }: ProductFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category_id: '',
        stock: '0',
        meta_title: '',
        meta_description: '',
        meta_tags: '',
    });
    
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newImages = Array.from(e.target.files);
            setSelectedImages(prev => [...prev, ...newImages]);
            
            // Generate preview URLs
            const newImageUrls = newImages.map(file => URL.createObjectURL(file));
            setImagePreviewUrls(prev => [...prev, ...newImageUrls]);
        }
    };
    
    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        
        // Revoke object URL to avoid memory leaks
        URL.revokeObjectURL(imagePreviewUrls[index]);
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const data = new FormData();
        
        // Add form fields to FormData
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });
        
        // Add images to FormData
        selectedImages.forEach(image => {
            data.append('images[]', image);
        });
        
        router.post('/admin/products', data, {
            onFinish: () => setIsSubmitting(false),
        });
    };
    
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/admin/products">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">Create New Product</h1>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Product Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Details</CardTitle>
                                <CardDescription>Basic information about the product</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name</Label>
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
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price ($)</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                            className={errors.price ? 'border-red-500' : ''}
                                        />
                                        {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stock">Stock</Label>
                                        <Input
                                            id="stock"
                                            name="stock"
                                            type="number"
                                            min="0"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            required
                                            className={errors.stock ? 'border-red-500' : ''}
                                        />
                                        {errors.stock && <p className="text-sm text-red-500">{errors.stock}</p>}
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="category_id">Category</Label>
                                    <select
                                        id="category_id"
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                                            errors.category_id ? 'border-red-500' : ''
                                        }`}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={5}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                                            errors.description ? 'border-red-500' : ''
                                        }`}
                                    />
                                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Product Images & Meta Card */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Images</CardTitle>
                                    <CardDescription>Upload images of your product</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="images">Product Images</Label>
                                        <div className="flex items-center gap-2">
                                            <Label
                                                htmlFor="images"
                                                className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-md border border-dashed border-input text-muted-foreground hover:bg-muted/50"
                                            >
                                                <Plus className="h-6 w-6" />
                                                <span className="sr-only">Add image</span>
                                            </Label>
                                            <Input
                                                id="images"
                                                name="images"
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp,image/avif"
                                                multiple
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            
                                            <div className="flex flex-wrap gap-2">
                                                {imagePreviewUrls.map((url, index) => (
                                                    <div key={index} className="relative h-24 w-24">
                                                        <img
                                                            src={url}
                                                            alt={`Preview ${index + 1}`}
                                                            className="h-full w-full rounded-md object-cover"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                                                            onClick={() => removeImage(index)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {errors.images && <p className="text-sm text-red-500">{errors.images}</p>}
                                        <p className="text-xs text-gray-500">
                                            Allowed formats: JPEG, PNG, JPG, GIF, WebP, AVIF. Max size: 2MB per image.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle>SEO Information</CardTitle>
                                    <CardDescription>Meta data for better search visibility</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="meta_title">Meta Title</Label>
                                        <Input
                                            id="meta_title"
                                            name="meta_title"
                                            value={formData.meta_title}
                                            onChange={handleChange}
                                            className={errors.meta_title ? 'border-red-500' : ''}
                                        />
                                        {errors.meta_title && <p className="text-sm text-red-500">{errors.meta_title}</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="meta_description">Meta Description</Label>
                                        <textarea
                                            id="meta_description"
                                            name="meta_description"
                                            rows={3}
                                            value={formData.meta_description}
                                            onChange={handleChange}
                                            className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                                                errors.meta_description ? 'border-red-500' : ''
                                            }`}
                                        />
                                        {errors.meta_description && <p className="text-sm text-red-500">{errors.meta_description}</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="meta_tags">Meta Tags (comma separated)</Label>
                                        <Input
                                            id="meta_tags"
                                            name="meta_tags"
                                            value={formData.meta_tags}
                                            onChange={handleChange}
                                            placeholder="tag1, tag2, tag3"
                                            className={errors.meta_tags ? 'border-red-500' : ''}
                                        />
                                        {errors.meta_tags && <p className="text-sm text-red-500">{errors.meta_tags}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-2">
                        <Link href="/admin/products">
                            <Button variant="outline" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Product'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
} 