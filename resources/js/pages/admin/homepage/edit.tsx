import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { FormEvent, useEffect, useState, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ImagePlus, Trash2, EyeIcon, Plus, Minus } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  sale_price?: number;
  images?: any[];
}

interface FeaturedProduct {
  id: number;
  product_id: number;
  product: Product;
  is_active: boolean;
  sort_order: number;
}

interface HomepageSection {
  id: number;
  section_name: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  image_path: string | null;
  button_text: string | null;
  button_url: string | null;
  is_active: boolean;
  sort_order: number;
  additional_data: any;
}

interface Props {
  section: HomepageSection;
  errors: Record<string, string>;
  products?: Product[];
  featuredProducts?: FeaturedProduct[];
  defaultProductId?: number | null;
}

export default function EditHomepageSection({ section, errors, products = [], featuredProducts = [], defaultProductId = null }: Props) {
  const { data, setData, post, processing, reset, transform } = useForm({
    title: section.title || '',
    subtitle: section.subtitle || '',
    content: section.content || '',
    button_text: section.button_text || '',
    button_url: section.button_url || '',
    is_active: section.is_active,
    sort_order: section.sort_order,
    image: null as File | null,
    additional_data: section.additional_data || {},
    _method: 'PUT',
  });

  // Set default product if it wasn't in the initial data
  useEffect(() => {
    if (section.section_name === 'order_form' && defaultProductId && !data.additional_data.default_product_id) {
      setData('additional_data', {
        ...data.additional_data,
        default_product_id: defaultProductId
      });
    }
  }, [defaultProductId]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    section.image_path ? `/storage/${section.image_path}` : null
  );

  const [activeTab, setActiveTab] = useState('content');

  const formatSectionName = (name: string) => {
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    transform((formData) => {
      // Process additional_data based on section type
      if (section.section_name === 'benefits' && Array.isArray(formData.additional_data.benefits)) {
        return {
          ...formData,
          additional_data: JSON.stringify({
            benefits: formData.additional_data.benefits
          })
        };
      } else if (section.section_name === 'pricing' && Array.isArray(formData.additional_data.features)) {
        return {
          ...formData,
          additional_data: JSON.stringify({
            features: formData.additional_data.features
          })
        };
      } else if (section.section_name === 'order_form' && formData.additional_data.default_product_id) {
        return {
          ...formData,
          additional_data: JSON.stringify({
            default_product_id: formData.additional_data.default_product_id
          })
        };
      } else if (section.section_name === 'hero' && formData.additional_data.overlay_opacity) {
        return {
          ...formData,
          additional_data: JSON.stringify({
            overlay_opacity: formData.additional_data.overlay_opacity
          })
        };
      }

      // For video section, make sure we don't do any special processing
      // and send the content as is
      if (section.section_name === 'video') {
        console.log('Submitting video section with content:', formData.content);
      }
      
      return formData;
    });
    
    post(route('admin.homepage.sections.update', section.id));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData('image', file);
    
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleArrayItemChange = (key: string, index: number, value: string) => {
    const newArray = [...(data.additional_data[key] || [])];
    newArray[index] = value;
    
    setData('additional_data', {
      ...data.additional_data,
      [key]: newArray
    });
  };

  const addArrayItem = (key: string) => {
    const newArray = [...(data.additional_data[key] || []), ''];
    
    setData('additional_data', {
      ...data.additional_data,
      [key]: newArray
    });
  };

  const removeArrayItem = (key: string, index: number) => {
    const newArray = [...(data.additional_data[key] || [])];
    newArray.splice(index, 1);
    
    setData('additional_data', {
      ...data.additional_data,
      [key]: newArray
    });
  };

  const handleDefaultProductChange = (productId: number) => {
    setData('additional_data', {
      ...data.additional_data,
      default_product_id: productId
    });
  };

  const handleOverlayOpacityChange = (value: number[]) => {
    setData('additional_data', {
      ...data.additional_data,
      overlay_opacity: value[0]
    });
  };

  // Parse additional_data from string to object if needed
  useEffect(() => {
    if (typeof section.additional_data === 'string') {
      try {
        const parsedData = JSON.parse(section.additional_data);
        setData('additional_data', parsedData);
      } catch (e) {
        console.error('Failed to parse additional_data JSON', e);
      }
    }
    
    // Set default overlay opacity for hero section if not already set
    if (section.section_name === 'hero' && !data.additional_data.overlay_opacity) {
      setData('additional_data', {
        ...data.additional_data,
        overlay_opacity: 70 // Default to 70%
      });
    }
  }, [section]);

  return (
    <AdminLayout>
      <Head title={`Edit ${formatSectionName(section.section_name)} Section`} />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white shadow-md border-0">
            <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Edit {formatSectionName(section.section_name)} Section
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Customize how this section appears on your homepage
                </CardDescription>
              </div>
              <Link 
                href={route('admin.homepage.index')}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors duration-200"
              >
                Back to Sections
              </Link>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-3 mb-8">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="space-y-6">
                    {/* Title field for all sections */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                      <Input
                        id="title"
                        type="text"
                        value={data.title}
                        onChange={e => setData('title', e.target.value)}
                        className={errors.title ? 'border-red-500' : ''}
                      />
                      {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    {/* Subtitle field for sections that need it */}
                    {['hero', 'benefits'].includes(section.section_name) && (
                      <div className="space-y-2">
                        <Label htmlFor="subtitle" className="text-sm font-medium">Subtitle</Label>
                        <Textarea
                          id="subtitle"
                          value={data.subtitle}
                          onChange={e => setData('subtitle', e.target.value)}
                          className={`min-h-[100px] ${errors.subtitle ? 'border-red-500' : ''}`}
                        />
                        {errors.subtitle && <p className="text-sm text-red-500">{errors.subtitle}</p>}
                      </div>
                    )}

                    {/* Content field for sections that need it */}
                    {['benefits', 'video', 'pricing'].includes(section.section_name) && (
                      <div className="space-y-2">
                        <Label htmlFor="content" className="text-sm font-medium">Content</Label>
                        <Textarea
                          id="content"
                          value={data.content}
                          onChange={e => setData('content', e.target.value)}
                          className={`min-h-[150px] ${errors.content ? 'border-red-500' : ''}`}
                        />
                        {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                        
                        {section.section_name === 'video' && (
                          <p className="text-xs text-gray-500">
                            Paste the YouTube iframe embed code here. Example: &lt;iframe src="https://www.youtube.com/embed/..."&gt;&lt;/iframe&gt;
                          </p>
                        )}
                        
                        {section.section_name === 'pricing' && (
                          <p className="text-xs text-gray-500">
                            For the pricing section, use the format: "পূর্বের মূল্য ৯৯৯/= বর্তমান মূল্য ৭৯০-/=" to set the old and new prices.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Button fields for sections that need buttons */}
                    {['hero'].includes(section.section_name) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="button_text" className="text-sm font-medium">Button Text</Label>
                          <Input
                            id="button_text"
                            type="text"
                            value={data.button_text}
                            onChange={e => setData('button_text', e.target.value)}
                            className={errors.button_text ? 'border-red-500' : ''}
                          />
                          {errors.button_text && <p className="text-sm text-red-500">{errors.button_text}</p>}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="button_url" className="text-sm font-medium">Button URL</Label>
                          <Input
                            id="button_url"
                            type="text"
                            value={data.button_url}
                            onChange={e => setData('button_url', e.target.value)}
                            className={errors.button_url ? 'border-red-500' : ''}
                          />
                          {errors.button_url && <p className="text-sm text-red-500">{errors.button_url}</p>}
                        </div>
                      </div>
                    )}

                    {/* Order Form specific fields */}
                    {section.section_name === 'order_form' && products.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="default_product" className="text-sm font-medium">Default Product</Label>
                        <select
                          id="default_product"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          value={data.additional_data.default_product_id || ''}
                          onChange={e => handleDefaultProductChange(Number(e.target.value))}
                        >
                          <option value="">Select a default product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} (৳{product.sale_price || product.price})
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500">
                          Select which product should be pre-selected in the order form.
                        </p>
                      </div>
                    )}

                    {/* Section specific additional data */}
                    {section.section_name === 'benefits' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium">Benefits</Label>
                          <Button
                            type="button"
                            onClick={() => addArrayItem('benefits')}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Plus className="h-4 w-4" /> Add Benefit
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {data.additional_data.benefits?.map((benefit: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={benefit}
                                onChange={(e) => handleArrayItemChange('benefits', index, e.target.value)}
                                className="flex-grow"
                              />
                              <Button
                                type="button"
                                onClick={() => removeArrayItem('benefits', index)}
                                variant="destructive"
                                size="icon"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {(!data.additional_data.benefits || data.additional_data.benefits.length === 0) && (
                            <p className="text-sm text-gray-500 italic">No benefits added yet. Click "Add Benefit" to add one.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {section.section_name === 'pricing' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium">Features</Label>
                          <Button
                            type="button"
                            onClick={() => addArrayItem('features')}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Plus className="h-4 w-4" /> Add Feature
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {data.additional_data.features?.map((feature: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={feature}
                                onChange={(e) => handleArrayItemChange('features', index, e.target.value)}
                                className="flex-grow"
                              />
                              <Button
                                type="button"
                                onClick={() => removeArrayItem('features', index)}
                                variant="destructive"
                                size="icon"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {(!data.additional_data.features || data.additional_data.features.length === 0) && (
                            <p className="text-sm text-gray-500 italic">No features added yet. Click "Add Feature" to add one.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="appearance" className="space-y-6">
                    {/* Image upload for sections that need images */}
                    {['hero', 'pricing'].includes(section.section_name) && (
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">
                          {section.section_name === 'hero' ? 'Background Image' : 'Section Background Image'}
                        </Label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                id="image"
                                className="hidden"
                                onChange={handleImageChange}
                                accept="image/*"
                              />
                              <Button
                                type="button"
                                onClick={() => document.getElementById('image')?.click()}
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <ImagePlus className="h-4 w-4" />
                                <span>Choose Image</span>
                              </Button>
                              <span className="text-sm text-gray-500">
                                {data.image ? data.image.name : 'No file selected'}
                              </span>
                            </div>
                            
                            {section.section_name === 'pricing' && !data.image && !previewUrl && (
                              <p className="text-xs text-gray-500">
                                Upload an image to use as the background. If no image is uploaded, a default texture will be used.
                              </p>
                            )}
                          </div>
                          
                          <div className="border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center min-h-[200px]">
                            {previewUrl ? (
                              <img src={previewUrl} alt="Preview" className="max-w-full max-h-[200px] object-contain" />
                            ) : (
                              <p className="text-sm text-gray-500">No image preview available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay Opacity for Hero Section */}
                    {section.section_name === 'hero' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Overlay Opacity</Label>
                          <span className="text-sm font-medium">{data.additional_data.overlay_opacity || 70}%</span>
                        </div>
                        <Slider
                          defaultValue={[data.additional_data.overlay_opacity || 70]}
                          max={100}
                          step={5}
                          onValueChange={handleOverlayOpacityChange}
                          className="py-4"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Transparent</span>
                          <span>Solid Color</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Adjust the opacity of the blue overlay on top of your background image.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-6">
                    {/* Order and status settings for all sections */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="sort_order" className="text-sm font-medium">Display Order</Label>
                        <Input
                          type="number"
                          id="sort_order"
                          value={data.sort_order}
                          onChange={e => setData('sort_order', parseInt(e.target.value))}
                          min="0"
                          className="max-w-[200px]"
                        />
                        <p className="text-xs text-gray-500">
                          Lower numbers appear first on the page
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={data.is_active}
                          onCheckedChange={checked => setData('is_active', checked)}
                        />
                        <Label htmlFor="is_active" className="text-sm font-medium">
                          Active (visible on homepage)
                        </Label>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end mt-8 pt-6 border-t">
                  <Link
                    href={route('admin.homepage.index')}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                  >
                    Cancel
                  </Link>
                  <Button
                    type="submit"
                    disabled={processing}
                    className="inline-flex justify-center"
                  >
                    {processing ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 