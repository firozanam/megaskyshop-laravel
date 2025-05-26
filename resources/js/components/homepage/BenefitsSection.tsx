import React, { useEffect } from 'react';

interface BenefitsSectionProps {
    title: string;
    content: string;
    benefits: string[] | null | undefined;
}

export default function BenefitsSection({ title, content, benefits = [] }: BenefitsSectionProps) {
    // Add debug logging
    useEffect(() => {
        console.log('BenefitsSection received props:', { title, content, benefitsType: typeof benefits, benefits });
        if (Array.isArray(benefits)) {
            console.log(`BenefitsSection received ${benefits.length} benefits`);
        }
    }, [title, content, benefits]);

    // Ensure benefits is always an array
    const benefitsList = Array.isArray(benefits) ? benefits : [];
    
    // Log benefits list
    useEffect(() => {
        console.log('Processed benefits list:', benefitsList);
        console.log('Will display', benefitsList.length > 0 ? 'benefits from data' : 'default benefits');
    }, [benefitsList]);
    
    // Default benefits if none are provided
    const displayBenefits = benefitsList.length > 0 ? benefitsList : [
        '৩০ থেকে ৪০ মিনিট পর্যন্ত অধিক সময় করতে সক্ষম হবেন।',
        'এই কনডমটি খুব নরম এবং সিলিকন।',
        'এটি ব্যবহারে কোনও ক্ষতি নেই।',
        'একটি কনডম ৫০০ বারেরও বেশি ব্যবহার করা যায়।',
        'সঙ্গী এতে কোনও ব্যথা অনুভব করবে না (সাধারণ কনডমের মতোই নরম)।',
        'এই কনডমটি সব লিঙ্গের মানুষ ব্যবহার করতে পারে।'
    ];

    // Check if we have the expected 6 benefits
    useEffect(() => {
        if (displayBenefits.length !== 6) {
            console.warn(`Expected 6 benefits but got ${displayBenefits.length}`);
        } else {
            console.log('Displaying all 6 benefits');
        }
    }, [displayBenefits]);

    return (
        <section className="py-16 bg-blue-900 text-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-6">{title}</h2>
                <p className="text-lg text-center max-w-3xl mx-auto mb-12">{content}</p>
                
                {/* Special layout for exactly 6 benefits (3x2 grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayBenefits.map((benefit, index) => (
                        <div key={index} className="bg-blue-800 p-6 rounded-lg flex items-start transform transition-transform duration-200 hover:scale-105 hover:shadow-lg">
                            <div className="bg-green-500 rounded-full p-2 mr-4 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-lg">{benefit}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
} 