import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Plus, X, AlertTriangle } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductImage {
    id: number;
    product_id: number;
    image_path: string;
    is_main: boolean;
    created_at: string;
    updated_at: string;
}

interface ProductMetaTag {
    id: number;
    product_id: number;
    tag: string;
    created_at: string;
    updated_at: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Product {
    id: number;
    name: string;
    price: string;
    description: string | null;
    category_id: number | null;
    stock: number;
    main_image: string | null;
    avg_rating: string;
    meta_description: string | null;
    meta_title: string | null;
    created_at: string;
    updated_at: string;
    images: ProductImage[];
    metaTags: ProductMetaTag[];
}

interface ProductEditProps {
    product: Product;
    categories: Category[];
    errors?: Record<string, string>;
}

export default function ProductEdit({ product, categories, errors = {} }: ProductEditProps) {
    const [formData, setFormData] = useState({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        category_id: product.category_id ? product.category_id.toString() : '',
        stock: product.stock.toString() || '0',
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        meta_tags: product.metaTags ? product.metaTags.map(tag => tag.tag).join(', ') : '',
        main_image_id: '',
        remove_images: [] as number[],
    });
    
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<ProductImage[]>(product.images || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
    const [generalError, setGeneralError] = useState<string | null>(null);
    
    useEffect(() => {
        // Find the main image and set its ID
        const mainImage = product.images.find(img => img.is_main);
        if (mainImage) {
            setFormData(prev => ({ ...prev, main_image_id: mainImage.id.toString() }));
        }
    }, [product]);
    
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleMainImageChange = (imageId: number) => {
        setFormData(prev => ({ ...prev, main_image_id: imageId.toString() }));
    };
    
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newImages = Array.from(e.target.files);
            
            // Validate file types
            const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'image/avif'];
            const validImages = newImages.filter(file => validImageTypes.includes(file.type));
            
            // Check if any files were invalid
            if (validImages.length < newImages.length) {
                setValidationErrors(prev => ({
                    ...prev,
                    images: ['Only JPEG, PNG, JPG, GIF, WebP, and AVIF files are allowed.']
                }));
            } else {
                // Clear any previous errors
                const updatedErrors = {...validationErrors};
                delete updatedErrors.images;
                setValidationErrors(updatedErrors);
            }
            
            if (validImages.length > 0) {
                // Add the new images to state
                setSelectedImages(prev => [...prev, ...validImages]);
            
            // Generate preview URLs
                const newImageUrls = validImages.map(file => URL.createObjectURL(file));
            setImagePreviewUrls(prev => [...prev, ...newImageUrls]);
                
                // If no main image is selected and there are no existing images, set the first new image as main
                if (!formData.main_image_id && existingImages.length === 0 && selectedImages.length === 0) {
                    console.log('Setting first uploaded image as main image');
                    
                    // We'll use a special marker to indicate that the first new image should be set as main
                    // This will be processed during form submission
                    setFormData(prev => ({ ...prev, main_image_id: 'new_first' }));
                }
            }
        }
    };
    
    const removeNewImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        
        // Revoke object URL to avoid memory leaks
        URL.revokeObjectURL(imagePreviewUrls[index]);
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };
    
    const removeExistingImage = (imageId: number) => {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        setFormData(prev => ({
            ...prev,
            remove_images: [...prev.remove_images, imageId],
        }));
        
        // If we're removing the main image, reset the main_image_id
        if (formData.main_image_id === imageId.toString()) {
            setFormData(prev => ({ ...prev, main_image_id: '' }));
        }
    };
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setValidationErrors({});
        setGeneralError(null);
        
        console.log('Form submission started', { formData });
        
        const data = new FormData();
        
        // Handle the special case for setting first new image as main
        const isFirstNewImageMain = formData.main_image_id === 'new_first';
        
        // Add form fields to FormData
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'remove_images') {
                // Handle array of image IDs to remove
                (value as number[]).forEach(id => {
                    data.append('remove_images[]', id.toString());
                    console.log(`Appending remove_images[]: ${id}`);
                });
            } else if (key === 'main_image_id' && value === 'new_first') {
                // Skip adding the special marker to the form data
                console.log('First new image will be set as main');
            } else {
                data.append(key, value.toString());
                console.log(`Appending ${key}: ${value}`);
            }
        });
        
        // Add images to FormData - each file should be appended directly
        if (selectedImages.length > 0) {
            console.log(`Adding ${selectedImages.length} images to form data`);
            selectedImages.forEach((image, index) => {
                // Validate file type again before submission
                const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'image/avif'];
                if (validImageTypes.includes(image.type)) {
                // Use 'images[]' as the key for each file to create an array on the server
                data.append('images[]', image, image.name);
                    console.log(`Appending image ${index}: ${image.name}, type: ${image.type}, size: ${image.size} bytes`);
                    
                    // If this is the first image and it should be the main image
                    if (index === 0 && isFirstNewImageMain) {
                        data.append('set_first_as_main', 'true');
                        console.log('Added flag to set first new image as main');
                    }
                } else {
                    console.error(`Skipping invalid image ${index}: ${image.name}, type: ${image.type}`);
                }
            });
        }
        
        // Use the PUT method by appending _method=PUT
        data.append('_method', 'PUT');
        console.log('Added _method: PUT to form data');
        
        try {
            console.log(`Submitting to: /admin/products/${product.id}`);
            
            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            // Using fetch with proper headers for multipart form data
            fetch(`/admin/products/${product.id}`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    // Do NOT set Content-Type header for multipart/form-data
                    // The browser will set it automatically with the boundary
                    'Accept': 'application/json',
                },
                body: data,
            })
            .then(response => {
                console.log('Response status:', response.status);
                // Check if we got a redirect (successful update)
                if (response.redirected) {
                    window.location.href = response.url;
                    return null;
                }
                
                if (!response.ok) {
                    if (response.headers.get('content-type')?.includes('application/json')) {
                        return response.json().then(err => {
                            if (err.errors) {
                                setValidationErrors(err.errors);
                                throw new Error('Validation failed');
                            } else {
                                throw new Error(JSON.stringify(err));
                            }
                        });
                    } else {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                }
                
                return response.json();
            })
            .then(data => {
                if (data) {
                    console.log('Success:', data);
                    window.location.href = '/admin/products';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (error.message !== 'Validation failed') {
                    setGeneralError('Failed to update product. Please try again.');
                }
                setIsSubmitting(false);
            });
        } catch (error) {
            console.error('Error during form submission:', error);
            setGeneralError('Error submitting form. Please try again.');
            setIsSubmitting(false);
        }
    };
    
    return (
        <AdminLayout breadcrumbs={[
            { title: 'Admin', href: '/admin' },
            { title: 'Products', href: '/admin/products' },
            { title: `Edit: ${product.name}`, href: `/admin/products/${product.id}/edit` },
        ]}>
            <Head title={`Edit Product: ${product.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/admin/products">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">Edit Product: {product.name}</h1>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                    {generalError && (
                        <Alert className="mb-6 bg-red-50 border-red-200 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{generalError}</AlertDescription>
                        </Alert>
                    )}
                    
                    {Object.keys(validationErrors).length > 0 && (
                        <Alert className="mb-6 bg-red-50 border-red-200 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="text-sm font-semibold mb-2">Please fix the following errors:</div>
                                <ul className="list-disc list-inside space-y-1">
                                    {Object.entries(validationErrors).map(([field, errors]) => (
                                        <li key={field}>
                                            {field}: {errors.join(', ')}
                                        </li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                    
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
                                        <Label htmlFor="price">Price (৳)</Label>
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
                                    <CardDescription>Manage product images</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Existing Images */}
                                    {existingImages.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Current Images</Label>
                                            <div className="flex flex-wrap gap-4">
                                                {existingImages.map((image) => (
                                                    <div key={image.id} className="relative space-y-1">
                                                        <div className="relative h-24 w-24">
                                                            <img
                                                                src={`/storage/${image.image_path}`}
                                                                alt="Product"
                                                                className="h-full w-full rounded-md object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = '/uploads/placeholder.jpg';
                                                                }}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                                                                onClick={() => removeExistingImage(image.id)}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Checkbox
                                                                id={`main-image-${image.id}`}
                                                                checked={formData.main_image_id === image.id.toString()}
                                                                onCheckedChange={() => handleMainImageChange(image.id)}
                                                            />
                                                            <Label
                                                                htmlFor={`main-image-${image.id}`}
                                                                className="ml-2 text-xs"
                                                            >
                                                                Main Image
                                                            </Label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* New Images */}
                                    <div className="space-y-2">
                                        <Label htmlFor="images">Add New Images</Label>
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
                                                            onClick={() => removeNewImage(index)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {validationErrors.images && (
                                            <p className="text-sm text-red-500">
                                                {Array.isArray(validationErrors.images) 
                                                    ? validationErrors.images.join(', ') 
                                                    : validationErrors.images}
                                            </p>
                                        )}
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
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
} 