import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function FeaturedProducts({ products }) {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--muted-foreground)/.03)_1px,transparent_1px),linear-gradient(45deg,hsl(var(--muted-foreground)/.03)_1px,transparent_1px)] bg-[size:40px_40px] -z-10" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--primary)/.1)] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[hsl(var(--primary)/.1)] rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 relative">
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary)/.8)] animate-[fadeIn_1s_ease-out]">
            Featured Products
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary)/.3)] mx-auto rounded-full" />
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {products.map((product, index) => (
                <div
                  key={product._id}
                  className="transform hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={product} />
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

      {/* Add keyframes for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
