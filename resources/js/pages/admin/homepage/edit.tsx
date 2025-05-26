import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { FormEvent, useEffect, useState } from 'react';

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [section]);

  return (
    <AdminLayout>
      <Head title={`Edit ${formatSectionName(section.section_name)} Section`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Edit {formatSectionName(section.section_name)} Section
                </h1>
                <Link 
                  href={route('admin.homepage.index')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                >
                  Back to Sections
                </Link>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Common fields for all sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      id="title"
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.title ? 'border-red-500' : ''}`}
                      value={data.title}
                      onChange={e => setData('title', e.target.value)}
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                  </div>

                  {/* Only show subtitle field for sections that need it */}
                  {['hero', 'benefits'].includes(section.section_name) && (
                    <div>
                      <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">Subtitle</label>
                      <input
                        type="text"
                        id="subtitle"
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.subtitle ? 'border-red-500' : ''}`}
                        value={data.subtitle}
                        onChange={e => setData('subtitle', e.target.value)}
                      />
                      {errors.subtitle && <p className="mt-1 text-sm text-red-600">{errors.subtitle}</p>}
                    </div>
                  )}

                  {/* Content field for sections that need it */}
                  {['benefits', 'video', 'pricing'].includes(section.section_name) && (
                    <div className="md:col-span-2">
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                      <textarea
                        id="content"
                        rows={4}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.content ? 'border-red-500' : ''}`}
                        value={data.content}
                        onChange={e => setData('content', e.target.value)}
                      />
                      {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                      
                      {section.section_name === 'video' && (
                        <p className="mt-1 text-xs text-gray-500">
                          Paste the YouTube iframe embed code here. Example: &lt;iframe src="https://www.youtube.com/embed/..."&gt;&lt;/iframe&gt;
                        </p>
                      )}
                      
                      {section.section_name === 'pricing' && (
                        <p className="mt-1 text-xs text-gray-500">
                          For the pricing section, use the format: "পূর্বের মূল্য ৯৯৯/= বর্তমান মূল্য ৭৯০-/=" to set the old and new prices. The discount percentage is calculated automatically.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Order Form specific fields */}
                  {section.section_name === 'order_form' && products.length > 0 && (
                    <div className="md:col-span-2">
                      <label htmlFor="default_product" className="block text-sm font-medium text-gray-700">Default Product</label>
                      <select
                        id="default_product"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                      <p className="mt-1 text-xs text-gray-500">
                        Select which product should be pre-selected in the order form. This product will be shown by default to visitors.
                      </p>
                    </div>
                  )}

                  {/* Button fields for sections that need buttons */}
                  {['hero'].includes(section.section_name) && (
                    <>
                      <div>
                        <label htmlFor="button_text" className="block text-sm font-medium text-gray-700">Button Text</label>
                        <input
                          type="text"
                          id="button_text"
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.button_text ? 'border-red-500' : ''}`}
                          value={data.button_text}
                          onChange={e => setData('button_text', e.target.value)}
                        />
                        {errors.button_text && <p className="mt-1 text-sm text-red-600">{errors.button_text}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="button_url" className="block text-sm font-medium text-gray-700">Button URL</label>
                        <input
                          type="text"
                          id="button_url"
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.button_url ? 'border-red-500' : ''}`}
                          value={data.button_url}
                          onChange={e => setData('button_url', e.target.value)}
                        />
                        {errors.button_url && <p className="mt-1 text-sm text-red-600">{errors.button_url}</p>}
                      </div>
                    </>
                  )}

                  {/* Image upload for sections that need images */}
                  {['hero'].includes(section.section_name) && (
                    <div className="md:col-span-2">
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700">Background Image</label>
                      <div className="mt-1 flex items-center">
                        <input
                          type="file"
                          id="image"
                          className="sr-only"
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                        <label
                          htmlFor="image"
                          className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload a file</span>
                        </label>
                        <span className="ml-4 text-sm text-gray-500">
                          {data.image ? data.image.name : 'No file selected'}
                        </span>
                      </div>
                      {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                      
                      {previewUrl && (
                        <div className="mt-4">
                          <img src={previewUrl} alt="Preview" className="max-h-48 rounded-md" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section specific additional data */}
                  {section.section_name === 'benefits' && (
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">Benefits</label>
                        <button
                          type="button"
                          onClick={() => addArrayItem('benefits')}
                          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Add Benefit
                        </button>
                      </div>
                      {data.additional_data.benefits?.map((benefit: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={benefit}
                            onChange={(e) => handleArrayItemChange('benefits', index, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('benefits', index)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.section_name === 'pricing' && (
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">Features</label>
                        <button
                          type="button"
                          onClick={() => addArrayItem('features')}
                          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Add Feature
                        </button>
                      </div>
                      {data.additional_data.features?.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={feature}
                            onChange={(e) => handleArrayItemChange('features', index, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('features', index)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Order and status settings for all sections */}
                  <div>
                    <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700">Display Order</label>
                    <input
                      type="number"
                      id="sort_order"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={data.sort_order}
                      onChange={e => setData('sort_order', parseInt(e.target.value))}
                      min="0"
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      <input
                        id="is_active"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={data.is_active}
                        onChange={e => setData('is_active', e.target.checked)}
                      />
                      <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                        Active (visible on homepage)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    href={route('admin.homepage.index')}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {processing ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 