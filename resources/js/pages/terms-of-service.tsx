import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { ScaleIcon, TruckIcon, CurrencyBangladeshiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PublicLayout>
      <Head title="Terms of Service - Megaskyshop" />
      
      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Header Section */}
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <div className="border-b w-24 mx-auto my-8"></div>
          <p className="text-gray-600">
            These Terms of Service govern your use of the Megaskyshop website and services. By accessing or using our website,
            you agree to be bound by these terms. Please read them carefully before using our services.
          </p>
        </section>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Agreement to Terms */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">1. Agreement to Terms</h2>
            <p className="text-gray-600">
              By accessing or using our website at www.megaskyshop.com, you agree to be bound by these Terms of Service. 
              If you disagree with any part of these terms, you may not access the website or use our services.
            </p>
          </section>

          {/* User Accounts */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">2. User Accounts</h2>
            <p className="text-gray-600">
              When you create an account with us, you must provide accurate, complete, and up-to-date information. 
              You are responsible for maintaining the confidentiality of your account and password and for restricting 
              access to your computer or device. You agree to accept responsibility for all activities that occur under your account.
            </p>
            <p className="text-gray-600">
              We reserve the right to refuse service, terminate accounts, remove or edit content, or cancel orders at our sole discretion.
            </p>
          </section>

          {/* Products and Services */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <TruckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">3. Products and Services</h2>
            </div>
            <div className="pl-12 space-y-4">
              <p className="text-gray-600">
                All products and services are subject to availability. We reserve the right to discontinue any product or service at any time.
              </p>
              <p className="text-gray-600">
                We make every effort to display as accurately as possible the colors, features, specifications, and details of the products 
                available on our website. However, we cannot guarantee that your computer's display of any color will be accurate, and we 
                do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
              </p>
            </div>
          </section>

          {/* Ordering and Payment */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <CurrencyBangladeshiIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">4. Ordering and Payment</h2>
            </div>
            <div className="pl-12 space-y-4">
              <p className="text-gray-600">
                By placing an order, you are making an offer to purchase the products you have selected. We reserve the right to refuse or 
                cancel your order at any time for reasons including but not limited to product availability, errors in product or pricing 
                information, or problems identified by our credit and fraud avoidance department.
              </p>
              <p className="text-gray-600">
                Payment must be received prior to the acceptance of an order. We accept various forms of payment, including credit cards, 
                debit cards, and mobile banking. By submitting an order, you authorize us to charge the account you specify for the purchase amount.
              </p>
              <p className="text-gray-600">
                All prices are in Bangladeshi Taka (BDT) unless otherwise specified. Prices are subject to change without notice.
              </p>
            </div>
          </section>

          {/* Shipping and Delivery */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">5. Shipping and Delivery</h2>
            <p className="text-gray-600">
              We will make every effort to ship products within the timeframe specified on our website. However, shipping times are estimates 
              and not guaranteed. We are not responsible for delays caused by factors outside our control, including but not limited to 
              weather conditions, natural disasters, or customs processing.
            </p>
            <p className="text-gray-600">
              Risk of loss and title for items purchased from our website pass to you upon delivery of the items to the carrier.
            </p>
          </section>

          {/* Returns and Refunds */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <ScaleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">6. Returns and Refunds</h2>
            </div>
            <div className="pl-12 space-y-4">
              <p className="text-gray-600">
                You may return most new, unopened items within 7 days of delivery for a full refund. We will also pay the return shipping costs 
                if the return is a result of our error (you received an incorrect or defective item).
              </p>
              <p className="text-gray-600">
                To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the 
                original packaging. Several types of goods are exempt from being returned, including perishable goods, personal care items, 
                and intimate apparel.
              </p>
              <p className="text-gray-600">
                To complete your return, we require a receipt or proof of purchase. Please do not send your purchase back to the manufacturer.
              </p>
              <p className="text-gray-600">
                Refunds will be processed within 5-7 business days after receiving the returned item.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">7. Intellectual Property</h2>
            <p className="text-gray-600">
              The website and its original content, features, and functionality are owned by Megaskyshop and are protected by international 
              copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">8. Limitation of Liability</h2>
            </div>
            <div className="pl-12 space-y-4">
              <p className="text-gray-600">
                In no event shall Megaskyshop, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any 
                indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, 
                goodwill, or other intangible losses, resulting from:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 pl-4">
                <li>Your access to or use of or inability to access or use the service</li>
                <li>Any conduct or content of any third party on the service</li>
                <li>Any content obtained from the service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">9. Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' 
              notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p className="text-gray-600">
              By continuing to access or use our service after any revisions become effective, you agree to be bound by the revised terms. 
              If you do not agree to the new terms, you are no longer authorized to use the service.
            </p>
          </section>

          {/* Contact Us */}
          <section className="space-y-4 bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="text-gray-600">
              <p>Email: legal@megaskyshop.com</p>
              <p>Phone: 01610582020</p>
              <p>Address: Narayanganj Chasara Amlapara, Bangladesh</p>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
} 