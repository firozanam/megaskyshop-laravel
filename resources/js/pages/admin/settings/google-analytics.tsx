import React, { useState, FormEvent } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Alert, 
  AlertTitle, 
  AlertDescription 
} from '@/components/ui/alert';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { LineChart, ExternalLink, SendHorizonal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GoogleAnalyticsSettingsProps {
  gaSettings: {
    GOOGLE_ANALYTICS_MEASUREMENT_ID: string;
    GOOGLE_ANALYTICS_API_SECRET: string;
    GOOGLE_ANALYTICS_DEBUG_MODE: boolean;
    GOOGLE_ANALYTICS_ENABLED: boolean;
  };
  errors?: Record<string, string>;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function GoogleAnalyticsSettings({ gaSettings, errors = {}, flash }: GoogleAnalyticsSettingsProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Settings', href: '#' },
    { title: 'Google Analytics', href: '/admin/settings/google-analytics' },
  ];

  // Set default values for form fields
  const { data, setData, post, processing, reset } = useForm({
    GOOGLE_ANALYTICS_MEASUREMENT_ID: gaSettings.GOOGLE_ANALYTICS_MEASUREMENT_ID || '',
    GOOGLE_ANALYTICS_API_SECRET: gaSettings.GOOGLE_ANALYTICS_API_SECRET || '',
    GOOGLE_ANALYTICS_DEBUG_MODE: gaSettings.GOOGLE_ANALYTICS_DEBUG_MODE || false,
    GOOGLE_ANALYTICS_ENABLED: gaSettings.GOOGLE_ANALYTICS_ENABLED || false,
  });

  // For testing connection
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    post(route('admin.settings.ga.update'));
  };

  const handleTestConnection = (e: FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestSuccess(null);
    setTestError(null);

    router.post(route('admin.settings.ga.test'), {
      debug_mode: data.GOOGLE_ANALYTICS_DEBUG_MODE
    }, {
      onSuccess: (page: any) => {
        const response = page.props.flash?.success;
        setTestSuccess(response || 'Test event sent successfully to Google Analytics');
        setIsTesting(false);
      },
      onError: (errors: any) => {
        setTestError(errors.message || 'Failed to connect to Google Analytics');
        setIsTesting(false);
      },
    });
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="Google Analytics Settings" />
      
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center">
          <LineChart className="mr-2 h-6 w-6 text-gray-800" />
          <h1 className="text-2xl font-bold tracking-tight">Google Analytics 4 Settings</h1>
        </div>

        {flash?.success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              {flash.success}
            </AlertDescription>
          </Alert>
        )}

        {flash?.error && (
          <Alert variant="destructive">
            <ExclamationCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {flash.error}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* GA4 Settings Form */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Google Analytics 4 Configuration</CardTitle>
                  <CardDescription>
                    Configure your application's Google Analytics 4 settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="GOOGLE_ANALYTICS_ENABLED">Enable Google Analytics</Label>
                          <Switch 
                            id="GOOGLE_ANALYTICS_ENABLED"
                            checked={data.GOOGLE_ANALYTICS_ENABLED}
                            onCheckedChange={(checked: boolean) => setData('GOOGLE_ANALYTICS_ENABLED', checked)}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Turn Google Analytics tracking on or off globally
                        </p>
                        {errors.GOOGLE_ANALYTICS_ENABLED && (
                          <p className="text-sm text-red-500">{errors.GOOGLE_ANALYTICS_ENABLED}</p>
                        )}
                      </div>

                      <Separator />

                      <div className="grid gap-2">
                        <Label htmlFor="GOOGLE_ANALYTICS_MEASUREMENT_ID" className="flex items-center gap-1">
                          Measurement ID
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">The Measurement ID from your Google Analytics 4 property (starts with G-)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Input
                          id="GOOGLE_ANALYTICS_MEASUREMENT_ID"
                          type="text"
                          placeholder="G-XXXXXXXXXX"
                          value={data.GOOGLE_ANALYTICS_MEASUREMENT_ID}
                          onChange={(e) => setData('GOOGLE_ANALYTICS_MEASUREMENT_ID', e.target.value)}
                        />
                        {errors.GOOGLE_ANALYTICS_MEASUREMENT_ID && (
                          <p className="text-sm text-red-500">{errors.GOOGLE_ANALYTICS_MEASUREMENT_ID}</p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="GOOGLE_ANALYTICS_API_SECRET" className="flex items-center gap-1">
                          API Secret
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">The API secret from your Google Analytics 4 data stream</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Input
                          id="GOOGLE_ANALYTICS_API_SECRET"
                          type="password"
                          placeholder="••••••••"
                          value={data.GOOGLE_ANALYTICS_API_SECRET}
                          onChange={(e) => setData('GOOGLE_ANALYTICS_API_SECRET', e.target.value)}
                        />
                        {errors.GOOGLE_ANALYTICS_API_SECRET && (
                          <p className="text-sm text-red-500">{errors.GOOGLE_ANALYTICS_API_SECRET}</p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="GOOGLE_ANALYTICS_DEBUG_MODE" className="flex items-center gap-1">
                            Debug Mode
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[200px] text-xs">Enable debug mode to log analytics events to the server log</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <Switch 
                            id="GOOGLE_ANALYTICS_DEBUG_MODE"
                            checked={data.GOOGLE_ANALYTICS_DEBUG_MODE}
                            onCheckedChange={(checked: boolean) => setData('GOOGLE_ANALYTICS_DEBUG_MODE', checked)}
                          />
                        </div>
                        {errors.GOOGLE_ANALYTICS_DEBUG_MODE && (
                          <p className="text-sm text-red-500">{errors.GOOGLE_ANALYTICS_DEBUG_MODE}</p>
                        )}
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={processing}>
                      {processing ? (
                        <>
                          <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Settings'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {/* Test Connection */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Test Connection</CardTitle>
                    <CardDescription>
                      Test your Google Analytics 4 configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleTestConnection} className="space-y-6">
                      <div className="space-y-4">
                        {testSuccess && (
                          <Alert className="bg-green-50 border-green-200">
                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-700">
                              {testSuccess}
                            </AlertDescription>
                          </Alert>
                        )}

                        {testError && (
                          <Alert variant="destructive">
                            <ExclamationCircleIcon className="h-4 w-4" />
                            <AlertDescription>
                              {testError}
                            </AlertDescription>
                          </Alert>
                        )}

                        <p className="text-sm text-gray-600">
                          Test your Google Analytics configuration by sending a test event to Google Analytics.
                        </p>
                      </div>

                      <Button 
                        type="submit" 
                        variant="outline" 
                        className="w-full" 
                        disabled={isTesting || !data.GOOGLE_ANALYTICS_MEASUREMENT_ID || !data.GOOGLE_ANALYTICS_API_SECRET}
                      >
                        {isTesting ? (
                          <>
                            <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <SendHorizonal className="mr-2 h-4 w-4" />
                            Send Test Event
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t px-6 py-4">
                    <div className="text-sm text-gray-500">
                      <p className="font-medium">Note:</p>
                      <p>Make sure to save your settings before testing the connection.</p>
                    </div>
                  </CardFooter>
                </Card>

                {/* Documentation Card */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>GA4 Documentation</CardTitle>
                    <CardDescription>
                      Helpful resources for Google Analytics 4
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Key Documentation Links</h4>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                          <a 
                            href="https://developers.google.com/analytics/devguides/collection/ga4" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Google Analytics 4 Developer Guide
                          </a>
                        </li>
                        <li className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                          <a 
                            href="https://support.google.com/analytics/answer/9304153" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Create and manage Data Streams
                          </a>
                        </li>
                        <li className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                          <a 
                            href="https://developers.google.com/analytics/devguides/collection/protocol/ga4" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Measurement Protocol (for server-side events)
                          </a>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="help">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Setting Up Google Analytics 4</CardTitle>
                <CardDescription>
                  A step-by-step guide to set up Google Analytics 4 for your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Step 1: Create a Google Analytics 4 Property</h3>
                    <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-2 mt-2">
                      <li>Sign in to your <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Analytics account</a></li>
                      <li>Click "Admin" in the bottom-left corner</li>
                      <li>In the "Account" column, select the account you want to add the property to</li>
                      <li>In the "Property" column, click "Create Property"</li>
                      <li>Select "Web" as the platform</li>
                      <li>Enter your website name and URL</li>
                      <li>Click "Create"</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Step 2: Get Your Measurement ID</h3>
                    <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-2 mt-2">
                      <li>In your GA4 property, go to "Admin" again</li>
                      <li>In the "Property" column, click "Data Streams"</li>
                      <li>Click on your web data stream</li>
                      <li>Your Measurement ID will be displayed (starts with "G-")</li>
                      <li>Copy this ID and paste it into the "Measurement ID" field in the settings form</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Step 3: Create an API Secret</h3>
                    <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-2 mt-2">
                      <li>In your GA4 property, go to "Admin"</li>
                      <li>In the "Property" column, click "Data Streams"</li>
                      <li>Click on your web data stream</li>
                      <li>Click "Measurement Protocol API secrets"</li>
                      <li>Click "Create"</li>
                      <li>Give your secret a name (e.g., "MegaSkyShop API")</li>
                      <li>Click "Create"</li>
                      <li>Copy the API secret and paste it into the "API Secret" field in the settings form</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Step 4: Save and Test Your Configuration</h3>
                    <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-2 mt-2">
                      <li>Enter your Measurement ID and API Secret in the settings form</li>
                      <li>Toggle "Enable Google Analytics" to turn on tracking</li>
                      <li>Click "Save Settings"</li>
                      <li>Use the "Test Connection" button to verify your configuration</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 