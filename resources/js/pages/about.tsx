import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
  BuildingOffice2Icon, 
  UsersIcon, 
  HeartIcon, 
  RocketLaunchIcon, 
  EnvelopeIcon, 
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import PublicLayout from '@/layouts/public-layout';

interface TestimonialProps {
  text: string;
  name: string;
}

function Testimonial({ text, name }: TestimonialProps) {
  return (
    <div className="p-6 text-center border rounded-lg shadow-sm hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <div className="flex justify-center mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className="w-5 h-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="italic text-gray-600 mb-4">{text}</p>
      </div>
      <div className="border-t pt-4">
        <h3 className="font-semibold">{name}</h3>
        <p className="text-sm text-gray-500">Verified Buyer</p>
      </div>
    </div>
  );
}

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PublicLayout>
      <Head title="About Us - Megaskyshop" />
      
      <div className="container mx-auto px-4 py-16 space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-8 py-8 md:py-12">
          <div className="space-y-6 mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-relaxed py-2">
              About Megaskyshop
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4 leading-relaxed py-1">
              A leading e-commerce platform dedicated to providing high-quality products with exceptional service and
              lightning-fast delivery.
            </p>
          </div>
          <div className="rounded-2xl shadow-2xl mt-8 w-full max-w-5xl mx-auto aspect-[3/1] overflow-hidden">
            <img 
              src="https://www.jebchaho.com/cdn/shop/collections/Durex.webp" 
              alt="Megaskyshop Office" 
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Story Section */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
              <BuildingOffice2Icon className="w-4 h-4" />
              Our Story
            </div>
            <h2 className="text-3xl font-bold text-gray-900">From Vision to Reality</h2>
            <p className="text-gray-600 leading-relaxed">
              Founded in 2023, Megaskyshop started with a vision to revolutionize the online shopping experience in
              Bangladesh. We began with a small team of passionate individuals committed to bringing the best products
              to our customers.
            </p>
            <a 
              href="#contact"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 group"
            >
              Learn More <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          <div className="p-6 bg-white rounded-lg border shadow-xl">
            <div className="grid gap-6">
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-lg bg-gray-100">
                  <UsersIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">Customer-Centric</h3>
                  <p className="text-sm text-gray-600">
                    We prioritize our customers' needs and strive to exceed their expectations.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-lg bg-gray-100">
                  <HeartIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">Quality First</h3>
                  <p className="text-sm text-gray-600">
                    We offer a curated selection of products that meet our high standards.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-lg bg-gray-100">
                  <RocketLaunchIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">Innovation</h3>
                  <p className="text-sm text-gray-600">
                    We continuously seek new ways to improve our platform and services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Feedback Section */}
        <section className="text-center space-y-12 py-4">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">Customer Feedback</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our valued customers have to say about their shopping experience with us.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Testimonial
              text="Excellent service and fast delivery. The product quality exceeded my expectations. Will definitely shop here again!"
              name="Sarah Rahman"
            />
            <Testimonial
              text="Great customer support! They helped me track my order and were very responsive. The product arrived in perfect condition."
              name="Kamal Hassan"
            />
            <Testimonial
              text="Best online shopping experience! The website is easy to navigate, and the checkout process is smooth. Highly recommended!"
              name="Nadia Islam"
            />
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="max-w-2xl mx-auto text-center space-y-8 py-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
              <EnvelopeIcon className="w-4 h-4" />
              Get in Touch
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions or feedback, please feel free to contact us. We are always here to help and look
              forward to hearing from you.
            </p>
          </div>
          <Link 
            href="/contact" 
            className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 group"
          >
            Contact Support <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>
      </div>
    </PublicLayout>
  );
} 