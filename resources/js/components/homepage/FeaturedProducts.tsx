import React from 'react';
import { Link } from '@inertiajs/react';
import ProductCard, { ProductProps } from '@/components/ui/product-card';

interface FeaturedProductsProps {
    title: string;
    products: ProductProps[];
}

export default function FeaturedProducts({ title, products }: FeaturedProductsProps) {
    const handleAddToCart = (product: ProductProps) => {
        // This could be expanded with cart functionality in the future
        console.log('Add to cart:', product);
        // Here you would typically dispatch to a cart store or similar
    };

    // Ensure all products have stock info for display
    const productsWithStock = products.map(product => ({
        ...product,
        stock: product.stock || 1000 // Default to 1000 if no stock info
    }));

    return (
        <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-10">{title}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {productsWithStock.map((product) => (
                        <div 
                            key={product.id} 
                            className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                            <ProductCard 
                                product={product}
                                onAddToCart={handleAddToCart}
                                className="h-full"
                            />
                        </div>
                    ))}
                </div>
                
                <div className="text-center mt-10">
                    <Link 
                        href="/products" 
                        className="inline-block border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
                    >
                        View All Products
                    </Link>
                </div>
            </div>
        </section>
    );
} 