import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';

interface ProductImage {
    id: number;
    image_path: string;
    is_main: boolean;
    url?: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
    sale_price?: number;
    images: ProductImage[];
    main_image?: string;
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface OrderFormSectionProps {
    title: string;
    products: Product[];
    defaultProductId?: number | null;
    auth?: {
        user: AuthUser | null;
    };
}

export default function OrderFormSection({ title, products, defaultProductId = null, auth }: OrderFormSectionProps) {
    const isAuthenticated = auth?.user !== null && auth?.user !== undefined;
    
    // Find default product from the default product ID if provided
    const findDefaultProduct = (): Product | null => {
        if (defaultProductId && products.length > 0) {
            const product = products.find(p => p.id === defaultProductId);
            if (product) return product;
        }
        
        // Fallback to first product if default not found or not specified
        return products.length > 0 ? products[0] : null;
    };
    
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(findDefaultProduct());
    const [quantity, setQuantity] = useState(1);
    
    // Update selected product if products list or defaultProductId changes
    useEffect(() => {
        const defaultProduct = findDefaultProduct();
        if (defaultProduct) {
            setSelectedProduct(defaultProduct);
            setData('items', [{ id: defaultProduct.id, quantity: quantity }]);
        }
    }, [products, defaultProductId]);

    // Initialize form data with user info if authenticated
    const { data, setData, post, processing, errors } = useForm({
        name: isAuthenticated && auth?.user ? auth.user.name : '',
        email: isAuthenticated && auth?.user ? auth.user.email : '',
        shipping_address: '',
        mobile: '',
        items: selectedProduct ? [{ id: selectedProduct.id, quantity: quantity }] : [],
    });
    
    // Update form when authentication status changes
    useEffect(() => {
        if (isAuthenticated && auth?.user) {
            setData(prevData => ({
                ...prevData,
                name: auth.user!.name,
                email: auth.user!.email,
            }));
        }
    }, [isAuthenticated, auth]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('orders.store'));
    };
    
    const handleProductChange = (productId: number) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            setSelectedProduct(product);
            setData('items', [{ id: product.id, quantity: quantity }]);
        }
    };
    
    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
            setData('items', [{ id: selectedProduct?.id || 0, quantity: newQuantity }]);
        }
    };
    
    const calculateTotal = () => {
        if (!selectedProduct) return 0;
        const price = selectedProduct.sale_price || selectedProduct.price;
        return price * quantity;
    };
    
    // Function to get the product image URL
    const getProductImageUrl = (product: Product | null): string => {
        if (!product) return '/images/placeholder.jpg';
        
        // First try to use the main_image if available
        if (product.main_image) {
            return `/storage/${product.main_image}`;
        }
        
        // Then try to find a main image in the images array
        const mainImage = product.images?.find(img => img.is_main);
        if (mainImage) {
            return `/storage/${mainImage.image_path}`;
        }
        
        // Then use the first image in the array if available
        if (product.images && product.images.length > 0) {
            return `/storage/${product.images[0].image_path}`;
        }
        
        // Fallback to placeholder
        return '/images/placeholder.jpg';
    };
    
    return (
        <section id="order-form" className="py-12 bg-gray-50">
            <div className="container mx-auto px-4 max-w-5xl">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{title}</h2>
                
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="md:flex">
                        <div className="md:w-1/2 p-6">
                            <h3 className="text-lg font-semibold mb-4">আপনার নাম *</h3>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        id="name"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="আপনার নাম লিখুন"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>
                                
                                <h3 className="text-lg font-semibold mb-4">আপনার ঠিকানা *</h3>
                                <div className="mb-4">
                                    <textarea
                                        id="shipping_address"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.shipping_address ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="আপনার ঠিকানা/এলাকার নাম, থানা, জেলা"
                                        rows={4}
                                        value={data.shipping_address}
                                        onChange={e => setData('shipping_address', e.target.value)}
                                        required
                                    ></textarea>
                                    {errors.shipping_address && <p className="text-red-500 text-sm mt-1">{errors.shipping_address}</p>}
                                </div>
                                
                                <h3 className="text-lg font-semibold mb-4">মোবাইল নাম্বার *</h3>
                                <div className="mb-4">
                                    <input
                                        type="tel"
                                        id="mobile"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.mobile ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="আপনার মোবাইল নাম্বার লিখুন"
                                        value={data.mobile}
                                        onChange={e => setData('mobile', e.target.value)}
                                        required
                                    />
                                    {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                                </div>
                                
                                <h3 className="text-lg font-semibold mb-4">ইমেইল (Optional)</h3>
                                <div className="mb-4">
                                    <input
                                        type="email"
                                        id="email"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="আপনার ইমেইল লিখুন"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>
                            </form>
                        </div>
                        
                        <div className="md:w-1/2 p-6 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200">
                            <h3 className="text-lg font-semibold mb-6">Your order</h3>
                            
                            {selectedProduct && (
                                <div className="flex mb-6">
                                    <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-white border border-gray-200">
                                        <img 
                                            src={getProductImageUrl(selectedProduct)}
                                            alt={selectedProduct.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    
                                    <div className="ml-4 flex-grow">
                                        <h4 className="font-medium text-gray-800">{selectedProduct.name}</h4>
                                        <p className="text-sm text-gray-600 mb-2">সম্পূর্ণ<br/>পুনঃব্যবহারযোগ্য<br/>কনডম</p>
                                        <div className="flex items-center mt-1">
                                            <button 
                                                type="button"
                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white"
                                                onClick={() => handleQuantityChange(quantity - 1)}
                                                disabled={quantity <= 1}
                                            >
                                                −
                                            </button>
                                            <span className="mx-3 w-8 text-center">{quantity}</span>
                                            <button 
                                                type="button"
                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white"
                                                onClick={() => handleQuantityChange(quantity + 1)}
                                            >
                                                +
                                            </button>
                                            <div className="ml-auto font-medium">
                                                ৳{selectedProduct.sale_price || selectedProduct.price}.00
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="mb-6">
                            {products.length > 1 && (
                                    <select
                                        id="product"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                        value={selectedProduct?.id || ''}
                                        onChange={e => handleProductChange(Number(e.target.value))}
                                    >
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>{product.name}</option>
                                        ))}
                                    </select>
                                )}
                                </div>
                            
                            <div className="border-t border-gray-200 pt-4 mb-4">
                                <div className="flex justify-between mb-2">
                                    <span>Subtotal</span>
                                    <span>৳{calculateTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>৳{calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                                <p className="text-yellow-800 text-sm">
                                    <span className="font-medium">ক্যাশ অন ডেলিভারি</span><br />
                                    আপনি যখন প্রোডাক্টটি হাতে পাবেন তখনই টাকা পেমেন্ট করবেন। ডেলিভারি ম্যানের থেকে পণ্য বুঝে নিয়ে টাকা পেমেন্ট করবেন।
                                </p>
                            </div>
                            
                            <button 
                                type="submit"
                                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
                                onClick={handleSubmit}
                                disabled={processing}
                            >
                                {processing ? 'Processing...' : `অর্ডার সম্পন্ন করুন ৳${calculateTotal().toFixed(2)}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
} 