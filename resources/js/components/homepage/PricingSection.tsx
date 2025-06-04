import React, { useEffect, useState, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from "@/components/ui/button";

interface PricingSectionProps {
    title: string;
    content: string;
    features: string[] | any;
    imagePath?: string;
}

export default function PricingSection({ title, content, features = [], imagePath }: PricingSectionProps) {
    // Try to extract old and new prices from content if it's in HTML format
    let oldPrice = "৯৯৯/=";
    let newPrice = "৭৯০-/=";
    const discount = "-20.92%";
    
    // Process features to ensure it's an array
    const [processedFeatures, setProcessedFeatures] = useState<string[]>([]);
    
    // Ref for the section element to track scroll position
    const sectionRef = useRef<HTMLElement>(null);
    
    // State for background position
    const [backgroundPosition, setBackgroundPosition] = useState('center');
    
    // Add scroll event listener to create parallax effect
    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;
            
            const rect = sectionRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Check if section is in viewport
            if (rect.top < windowHeight && rect.bottom > 0) {
                // Calculate how far the section is scrolled into view as a percentage
                const scrollPercentage = (windowHeight - rect.top) / (windowHeight + rect.height);
                
                // Use the percentage to adjust background position
                // This creates a subtle parallax effect
                const yPosition = 50 + (scrollPercentage * 20 - 10); // Move from 40% to 60% based on scroll
                setBackgroundPosition(`center ${yPosition}%`);
            }
        };
        
        // Add scroll event listener
        window.addEventListener('scroll', handleScroll);
        // Initial call to set position
        handleScroll();
        
        // Clean up
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    
    useEffect(() => {
        // Debug the features prop
        console.log('PricingSection features prop:', features);
        console.log('PricingSection features type:', typeof features);
        
        // Process features based on its type
        let featureArray: string[] = [];
        
        if (Array.isArray(features)) {
            featureArray = features;
        } else if (typeof features === 'object' && features !== null) {
            // If features is an object with a features property that is an array
            if (features.features && Array.isArray(features.features)) {
                featureArray = features.features;
            }
        } else if (typeof features === 'string') {
            // Try to parse the string as JSON
            try {
                const parsed = JSON.parse(features);
                if (parsed && Array.isArray(parsed)) {
                    featureArray = parsed;
                } else if (parsed && parsed.features && Array.isArray(parsed.features)) {
                    featureArray = parsed.features;
                }
            } catch (e) {
                console.error('Error parsing features:', e);
            }
        }
        
        setProcessedFeatures(featureArray);
    }, [features]);
    
    if (content) {
        // Try to parse prices from content if they're available
        const oldPriceMatch = content.match(/পূর্বের\s*মূল্য\s*([^<\s]+)/);
        const newPriceMatch = content.match(/বর্তমান\s*মূল্য\s*([^<\s]+)/);
        
        if (oldPriceMatch && oldPriceMatch[1]) oldPrice = oldPriceMatch[1];
        if (newPriceMatch && newPriceMatch[1]) newPrice = newPriceMatch[1];
    }
    
    // Add animations via useEffect and a style element
    useEffect(() => {
        // Create style element if it doesn't exist
        let styleEl = document.getElementById('pricing-animations');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'pricing-animations';
            document.head.appendChild(styleEl);
            
            // Add keyframe animations
            styleEl.innerHTML = `
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                @keyframes slideUp {
                  from { transform: translateY(20px); opacity: 0; }
                  to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideDown {
                  from { transform: translateY(-20px); opacity: 0; }
                  to { transform: translateY(0); opacity: 1; }
                }
                .glow {
                  text-shadow: 0 0 10px rgba(253, 224, 71, 0.5);
                  animation: glow 2s ease-in-out infinite alternate;
                }
                @keyframes glow {
                  from { text-shadow: 0 0 10px rgba(253, 224, 71, 0.5); }
                  to { text-shadow: 0 0 20px rgba(253, 224, 71, 0.8); }
                }
                .bg-scroll-effect {
                  transition: background-position 0.3s ease-out;
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
    
    // If there are no features, add a default one to avoid empty space
    if (processedFeatures.length === 0) {
        processedFeatures.push('১০০% অরিজিনাল ম্যাজিক কনডম প্রতিটি মাত্র ৭৯০ টাকা');
        processedFeatures.push('সারা বাংলাদেশের যে কোন জায়গায় ফ্রি ডেলিভারি চার্জ ফ্রি!');
    }
    
    // Determine the background image URL
    const backgroundImageUrl = imagePath 
        ? (imagePath.startsWith('/storage/') ? imagePath : `/storage/${imagePath}`)
        : '/images/texture-bg.jpg';
    
    return (
        <section ref={sectionRef} className="my-8 sm:my-12 md:my-16">
            <div 
                className="w-full bg-[hsl(var(--primary)/.98)] relative py-8 sm:py-12 md:py-16 -mx-[calc((100vw-100%)/2)] px-[calc((100vw-100%)/2)] overflow-hidden"
            >
                {/* Background with overlay and pattern */}
                <div 
                    className="absolute inset-0 z-0 bg-scroll-effect"
                    style={{
                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${backgroundImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition,
                        backgroundRepeat: 'no-repeat',
                        transition: 'background-position 0.5s ease-out'
                    }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(45deg,hsl(var(--primary)/.1)_25%,transparent_25%,transparent_50%,hsl(var(--primary)/.1)_50%,hsl(var(--primary)/.1)_75%,transparent_75%,transparent)] bg-[length:32px_32px] sm:bg-[length:48px_48px] md:bg-[length:64px_64px] opacity-30" />

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-[hsl(var(--secondary)/.15)] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl sm:blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-[hsl(var(--secondary)/.15)] rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl sm:blur-3xl" />

                <div className="max-w-6xl mx-auto relative z-10 px-4 sm:px-6 md:px-8">
                    <div className="text-center space-y-6 sm:space-y-8">
                        {/* Price Card */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-sm sm:max-w-xl md:max-w-2xl mx-auto transform hover:scale-105 transition-all duration-300">
                            {/* First Price Line */}
                            <div className="flex items-center justify-center whitespace-nowrap gap-1 sm:gap-2 mb-4 sm:mb-6 animate-[slideDown_0.5s_ease-out]">
                                <span className="text-white/90 text-lg sm:text-2xl md:text-3xl font-bold">পূর্বের মূল্য</span>
                                <div className="relative inline-flex items-center">
                                    <span className="text-red-400 text-xl sm:text-3xl md:text-4xl font-bold line-through decoration-2">{oldPrice}</span>
                                    <div className="absolute -right-3 sm:-right-4 -top-3 sm:-top-4 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full animate-pulse">
                                        {discount}
                                    </div>
                                </div>
                                <span className="text-white/90 text-lg sm:text-2xl md:text-3xl font-bold">টাকা</span>
                            </div>

                            {/* Second Price Line */}
                            <div className="flex items-center justify-center whitespace-nowrap gap-1 sm:gap-2 animate-[slideUp_0.5s_ease-out]">
                                <span className="text-white/90 text-lg sm:text-2xl md:text-3xl font-bold">বর্তমান মূল্য</span>
                                <span className="text-yellow-300 text-2xl sm:text-4xl md:text-5xl font-bold glow">{newPrice}</span>
                                <span className="text-white/90 text-lg sm:text-2xl md:text-3xl font-bold">টাকা</span>
                            </div>
                        </div>

                        {/* Free Delivery Card */}
                        <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto animate-[fadeIn_0.7s_ease-out]">
                            {processedFeatures.map((feature, index) => (
                                <div key={index} className="flex items-start sm:items-center justify-start sm:justify-center gap-2 sm:gap-3 mb-2 sm:mb-3 last:mb-0">
                                    <svg 
                                        className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mt-1 sm:mt-0 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    <p className="text-green-300 text-base sm:text-lg md:text-xl font-medium text-left sm:text-center">
                                        {feature}
                                    </p>
                                </div>
                            ))}
                        </div>
                        
                        {/* Order Button */}
                        <div className="flex justify-center mt-6 sm:mt-8">
                            <Button
                              asChild
                              variant="destructive"
                              size="lg"
                              className="text-base sm:text-lg py-4 sm:py-5 md:py-6 px-6 sm:px-8 md:px-10 font-semibold relative group overflow-hidden hover:scale-105 transition-transform duration-300"
                            >
                              <Link href="#order-form" className="flex items-center">
                                <span className="relative z-10">অর্ডার করতে চাই</span>
                                <svg
                                  aria-hidden="true"
                                  className="e-font-icon-svg e-far-hand-point-down ml-1.5 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:animate-bounce"
                                  viewBox="0 0 448 512"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="currentColor"
                                >
                                  <path d="M188.8 512c45.616 0 83.2-37.765 83.2-83.2v-35.647a93.148 93.148 0 0 0 22.064-7.929c22.006 2.507 44.978-3.503 62.791-15.985C409.342 368.1 448 331.841 448 269.299V248c0-60.063-40-98.512-40-127.2v-2.679c4.952-5.747 8-13.536 8-22.12V32c0-17.673-12.894-32-28.8-32H156.8C140.894 0 128 14.327 128 32v64c0 8.584 3.048 16.373 8 22.12v2.679c0 6.964-6.193 14.862-23.668 30.183l-.148.129-.146.131c-9.937 8.856-20.841 18.116-33.253 25.851C48.537 195.798 0 207.486 0 252.8c0 56.928 35.286 92 83.2 92 8.026 0 15.489-.814 22.4-2.176V428.8c0 45.099 38.101 83.2 83.2 83.2zm0-48c-18.7 0-35.2-16.775-35.2-35.2V270.4c-17.325 0-35.2 26.4-70.4 26.4-26.4 0-35.2-20.625-35.2-44 0-8.794 32.712-20.445 56.1-34.926 14.575-9.074 27.225-19.524 39.875-30.799 18.374-16.109 36.633-33.836 39.596-59.075h176.752C364.087 170.79 400 202.509 400 248v21.299c0 40.524-22.197 57.124-61.325 50.601-8.001 14.612-33.979 24.151-53.625 12.925-18.225 19.365-46.381 17.787-61.05 4.95V428.8c0 18.975-16.225 35.2-35.2 35.2zM328 64c0-13.255 10.745-24 24-24s24 10.745 24 24-10.745 24-24 24-24-10.745-24-24z" />
                                </svg>
                              </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
} 