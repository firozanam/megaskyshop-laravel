import React from 'react';
import { Link } from '@inertiajs/react';
import ProductCard, { ProductProps } from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface FeaturedProductsProps {
    title: string;
    products: ProductProps[];
}

export default function FeaturedProducts({ title, products }: FeaturedProductsProps) {
    // Ensure all products have stock info for display
    const productsWithStock = products.map(product => ({
        ...product,
        stock: product.stock || 1000 // Default to 1000 if no stock info
    }));

    // Add useEffect for animation keyframes
    React.useEffect(() => {
        // Create style element if it doesn't exist
        let styleEl = document.getElementById('featured-products-animations');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'featured-products-animations';
            document.head.appendChild(styleEl);
            
            // Add keyframe animations
            styleEl.innerHTML = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes borderAnimation {
                    0% { width: 0; }
                    100% { width: 100px; }
                }
                @keyframes borderPulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
            `;
        }
        
        // Clean up
        return () => {
            if (styleEl) {
                styleEl.remove();
            }
        };
    }, []);

    return (
        <section className="relative py-16 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--muted-foreground)/.03)_1px,transparent_1px),linear-gradient(45deg,hsl(var(--muted-foreground)/.03)_1px,transparent_1px)] bg-[size:40px_40px] -z-10" />
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--primary)/.1)] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[hsl(var(--primary)/.1)] rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 relative">
                    <h2 className="text-4xl font-bold mb-4 text-[#374151] animate-[fadeIn_1s_ease-out]">
                        {title}
                    </h2>
                    <div className="relative h-1 mx-auto">
                        <div className="absolute left-1/2 -translate-x-1/2 h-1 bg-blue-600 rounded-full animate-[borderAnimation_1s_forwards,borderPulse_2s_infinite]"></div>
                    </div>
                </div>

                {productsWithStock.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                            {productsWithStock.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="transform hover:scale-105 transition-all duration-300"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <ProductCard 
                                        product={product}
                                        className="h-full"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="text-center">
                            <Button asChild size="lg" variant="outline" className="group">
                                <Link href="/products" className="inline-flex items-center gap-2">
                                    View All Products
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 bg-card/50 backdrop-blur-sm rounded-xl border border-border">
                        <p className="text-xl text-muted-foreground">
                            No featured products available.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
} 