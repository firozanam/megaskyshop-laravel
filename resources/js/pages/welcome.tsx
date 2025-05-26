import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import HeroSection from '@/components/homepage/HeroSection';
import FeaturedProducts from '@/components/homepage/FeaturedProducts';
import BenefitsSection from '@/components/homepage/BenefitsSection';
import VideoSection from '@/components/homepage/VideoSection';
import PricingSection from '@/components/homepage/PricingSection';
import OrderFormSection from '@/components/homepage/OrderFormSection';
import Header from '@/components/homepage/Header';
import Footer from '@/components/homepage/Footer';
import { useEffect, useState } from 'react';

export default function Welcome() {
    const { auth, sections, featuredProducts, allProducts, defaultProductId } = usePage<SharedData & {
        sections: Record<string, any>;
        featuredProducts: any[];
        allProducts: any[];
        defaultProductId: number | null;
    }>().props;

    // State to store processed benefits
    const [processedBenefits, setProcessedBenefits] = useState<string[]>([]);
    const [dataStatus, setDataStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    
    // State for pricing features
    const [pricingFeatures, setPricingFeatures] = useState<string[]>([]);

    // Process sections data on component mount
    useEffect(() => {
        try {
            // Process pricing section data
            if (sections.pricing) {
                console.log('Pricing section data:', sections.pricing);
                console.log('Pricing additional_data type:', typeof sections.pricing.additional_data);
                console.log('Pricing additional_data:', sections.pricing.additional_data);
                
                const additionalData = sections.pricing.additional_data;
                
                // Process different data formats
                if (typeof additionalData === 'string') {
                    try {
                        const parsed = JSON.parse(additionalData);
                        console.log('Parsed pricing data from string:', parsed);
                        if (parsed && parsed.features && Array.isArray(parsed.features)) {
                            console.log(`Found ${parsed.features.length} features in parsed data`);
                            setPricingFeatures(parsed.features);
                        }
                    } catch (e) {
                        console.error('Error parsing pricing JSON:', e);
                    }
                } else if (typeof additionalData === 'object' && additionalData !== null) {
                    console.log('Processing pricing from object:', additionalData);
                    if (additionalData.features && Array.isArray(additionalData.features)) {
                        console.log(`Found ${additionalData.features.length} features in object data`);
                        setPricingFeatures(additionalData.features);
                    }
                }
            }
            
            if (sections.benefits) {
                console.log('Benefits section data:', sections.benefits);
                console.log('Benefits additional_data type:', typeof sections.benefits.additional_data);
                console.log('Benefits additional_data:', sections.benefits.additional_data);
                
                const additionalData = sections.benefits.additional_data;
                
                // Process different data formats
                if (typeof additionalData === 'string') {
                    try {
                        const parsed = JSON.parse(additionalData);
                        console.log('Parsed benefits from string:', parsed);
                        if (parsed && parsed.benefits && Array.isArray(parsed.benefits)) {
                            console.log(`Found ${parsed.benefits.length} benefits in parsed data`);
                            setProcessedBenefits(parsed.benefits);
                            setDataStatus('loaded');
                            console.log('Successfully processed benefits from JSON string');
                        } else {
                            console.warn('Parsed data does not contain benefits array');
                            setDataStatus('error');
                        }
                    } catch (e) {
                        console.error('Error parsing benefits JSON:', e);
                        setDataStatus('error');
                    }
                } else if (typeof additionalData === 'object' && additionalData !== null) {
                    console.log('Processing benefits from object:', additionalData);
                    if (additionalData.benefits && Array.isArray(additionalData.benefits)) {
                        console.log(`Found ${additionalData.benefits.length} benefits in object data`);
                        setProcessedBenefits(additionalData.benefits);
                        setDataStatus('loaded');
                        console.log('Successfully processed benefits from object');
                    } else {
                        console.warn('Object does not contain benefits array');
                        setDataStatus('error');
                    }
                } else {
                    console.warn('Unexpected additional_data format:', additionalData);
                    setDataStatus('error');
                }
            } else {
                console.warn('No benefits section found');
                setDataStatus('error');
            }
        } catch (e) {
            console.error('Error processing benefits data:', e);
            setDataStatus('error');
        }
    }, [sections]);

    // Log whenever processed benefits change
    useEffect(() => {
        console.log(`Processed benefits updated with ${processedBenefits.length} items:`, processedBenefits);
    }, [processedBenefits]);

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-white">
                <Header auth={auth} />
                
                {/* Hero Section */}
                {sections.hero && (
                    <HeroSection 
                        title={sections.hero.title}
                        subtitle={sections.hero.subtitle}
                        buttonText={sections.hero.button_text}
                        buttonUrl={sections.hero.button_url}
                        imagePath={sections.hero.image_path}
                    />
                )}
                
                {/* Featured Products Section */}
                {sections.featured_products && featuredProducts && featuredProducts.length > 0 && (
                    <FeaturedProducts 
                        title={sections.featured_products.title}
                        products={featuredProducts}
                    />
                )}
                
                {/* Benefits Section */}
                {sections.benefits && (
                    <BenefitsSection 
                        title={sections.benefits.title}
                        content={sections.benefits.content}
                        benefits={processedBenefits}
                    />
                )}
                
                {/* Video Section */}
                {sections.video && (
                    <VideoSection 
                        title={sections.video.title}
                        content={sections.video.content}
                    />
                )}
                
                {/* Pricing Section */}
                {sections.pricing && (
                    <PricingSection 
                        title={sections.pricing.title}
                        content={sections.pricing.content}
                        features={pricingFeatures}
                    />
                )}
                
                {/* Order Form Section */}
                {sections.order_form && allProducts && allProducts.length > 0 && (
                    <OrderFormSection 
                        title={sections.order_form.title}
                        products={allProducts}
                        defaultProductId={defaultProductId}
                        auth={auth}
                    />
                )}
                
                <Footer />
            </div>
        </>
    );
}
