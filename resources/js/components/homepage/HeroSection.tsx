import React from 'react';
import { Link } from '@inertiajs/react';

interface HeroSectionProps {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonUrl: string;
    imagePath?: string;
}

export default function HeroSection({ title, subtitle, buttonText, buttonUrl, imagePath }: HeroSectionProps) {
    const backgroundImage = imagePath 
        ? `url('/storage/${imagePath}')` 
        : 'linear-gradient(to right, #1e3a8a, #3b82f6)';
    
    return (
        <section 
            className="bg-blue-900 text-white py-16 md:py-24" 
            style={{ 
                backgroundImage: backgroundImage,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="container mx-auto px-4">
                <div className="max-w-2xl">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6">{title}</h1>
                    <p className="text-lg md:text-xl mb-8">{subtitle}</p>
                    <Link 
                        href={buttonUrl} 
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                    >
                        {buttonText}
                    </Link>
                </div>
            </div>
        </section>
    );
} 