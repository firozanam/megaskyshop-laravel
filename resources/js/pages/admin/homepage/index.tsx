import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { useState, useEffect } from 'react';

interface HomepageSection {
  id: number;
  section_name: string;
  title: string | null;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

interface Props {
  sections: HomepageSection[];
}

export default function HomepageSectionsIndex({ sections }: Props) {
  // Filter out duplicate sections by section_name, keeping the one with the lowest ID
  const deduplicateSections = (sectionsList: HomepageSection[]): HomepageSection[] => {
    const uniqueSectionNames = new Set<string>();
    return sectionsList
      .sort((a, b) => a.id - b.id) // Sort by ID to ensure consistent results
      .filter(section => {
        if (!uniqueSectionNames.has(section.section_name)) {
          uniqueSectionNames.add(section.section_name);
          return true;
        }
        return false;
      });
  };

  const [activeSections, setActiveSections] = useState<HomepageSection[]>([]);

  // Initialize with deduplicated sections
  useEffect(() => {
    setActiveSections(deduplicateSections(sections));
  }, [sections]);

  const formatSectionName = (name: string) => {
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Find featured products section if it exists
  const featuredProductsSection = activeSections.find(section => section.section_name === 'featured_products');

  return (
    <AdminLayout>
      <Head title="Manage Homepage Sections" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Featured Products Management Card */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 overflow-hidden shadow-sm sm:rounded-lg border border-blue-200">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Featured Products Section</h2>
                  <p className="text-gray-600 mt-1">
                    {featuredProductsSection && featuredProductsSection.is_active 
                      ? 'This section is currently active on your homepage' 
                      : 'This section is currently inactive on your homepage'}
                  </p>
                </div>
                <Link 
                  href={route('admin.homepage.featured-products')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Manage Featured Products
                </Link>
              </div>
              
              {featuredProductsSection && (
                <div className="mt-4 flex items-center">
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Display Order:</span> {featuredProductsSection.sort_order}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Title:</span> {featuredProductsSection.title || 'No title set'}
                    </div>
                  </div>
                  <Link
                    href={route('admin.homepage.sections.edit', featuredProductsSection.id)}
                    className="px-3 py-1 bg-white text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition text-sm"
                  >
                    Edit Section Settings
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Main Sections Management */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">All Homepage Sections</h1>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeSections.map((section) => (
                      <tr key={section.id} className={section.section_name === 'featured_products' ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatSectionName(section.section_name)}
                            {section.section_name === 'featured_products' && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Special Management
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {section.title || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${section.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {section.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {section.sort_order}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(section.updated_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center">
                          <Link
                            href={route('admin.homepage.sections.edit', section.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit Section
                          </Link>
                          {section.section_name === 'featured_products' && (
                            <Link
                              href={route('admin.homepage.featured-products')}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Manage Products
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 