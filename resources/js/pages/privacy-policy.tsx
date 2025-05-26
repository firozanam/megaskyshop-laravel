import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { ShieldCheckIcon, LockClosedIcon, DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PublicLayout>
      <Head title="Privacy Policy - Megaskyshop" />
      
      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Header Section */}
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <div className="border-b w-24 mx-auto my-8"></div>
          <p className="text-gray-600">
            At Megaskyshop, we are committed to protecting your privacy and ensuring the security of your personal information.
            This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and services.
          </p>
        </section>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Information We Collect */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            <div className="pl-12 space-y-4">
              <h3 className="font-semibold text-lg">Personal Information</h3>
              <p className="text-gray-600">
                We collect personal information that you voluntarily provide to us when you register on our website, 
                place an order, subscribe to our newsletter, or contact our customer service. This may include:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 pl-4">
                <li>Name, email address, phone number, and billing/shipping address</li>
                <li>Payment information (credit card details, though we do not store complete payment information)</li>
                <li>Account login credentials</li>
                <li>Purchase history and preferences</li>
                <li>Communications with our customer service team</li>
              </ul>
              
              <h3 className="font-semibold text-lg mt-6">Automatically Collected Information</h3>
              <p className="text-gray-600">
                When you visit our website, we may automatically collect certain information about your device and usage, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 pl-4">
                <li>IP address and device identifiers</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Pages visited and time spent on those pages</li>
                <li>Referring website or source</li>
                <li>Click patterns and interactions with our website</li>
              </ul>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            <div className="pl-12 space-y-4">
              <p className="text-gray-600">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 pl-4">
                <li>Processing and fulfilling your orders</li>
                <li>Creating and managing your account</li>
                <li>Providing customer support</li>
                <li>Sending transactional emails (order confirmations, shipping updates)</li>
                <li>Sending marketing communications (if you've opted in)</li>
                <li>Improving our website and services</li>
                <li>Detecting and preventing fraud</li>
                <li>Complying with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <LockClosedIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            </div>
            <div className="pl-12 space-y-4">
              <p className="text-gray-600">
                We implement appropriate security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 pl-4">
                <li>Encryption of sensitive data</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication procedures</li>
                <li>Secure data storage practices</li>
              </ul>
              <p className="text-gray-600">
                While we strive to use commercially acceptable means to protect your personal information, 
                we cannot guarantee its absolute security. Any transmission of personal information is at your own risk.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
            </div>
            <div className="pl-12 space-y-4">
              <p className="text-gray-600">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 pl-4">
                <li>The right to access the personal information we have about you</li>
                <li>The right to correct inaccurate or incomplete information</li>
                <li>The right to delete your personal information</li>
                <li>The right to restrict or object to processing of your data</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent at any time</li>
              </ul>
              <p className="text-gray-600">
                To exercise any of these rights, please contact us using the information provided at the end of this policy.
              </p>
            </div>
          </section>

          {/* Changes to This Policy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Changes to This Policy</h2>
            <p className="text-gray-600">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy 
              Policy periodically for any changes.
            </p>
          </section>

          {/* Contact Us */}
          <section className="space-y-4 bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="text-gray-600">
              <p>Email: privacy@megaskyshop.com</p>
              <p>Phone: 01610582020</p>
              <p>Address: Narayanganj Chasara Amlapara, Bangladesh</p>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
} 