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
import { Share2, ExternalLink, SendHorizonal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FacebookPixelSettingsProps {
  pixelSettings: {
    FACEBOOK_PIXEL_ID: string;
    FACEBOOK_PIXEL_ACCESS_TOKEN: string;
    FACEBOOK_PIXEL_DEBUG_MODE: boolean;
    FACEBOOK_PIXEL_ENABLED: boolean;
  };
  errors?: Record<string, string>;
  flash?: {
    success?: string;
    error?: string;
  };
}

const breadcrumbItems: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    title: 'Settings',
    href: '/admin/settings',
  },
  {
    title: 'Facebook Pixel',
    href: '/admin/settings/facebook-pixel',
  },
];

export default function FacebookPixelSettings({ pixelSettings, errors, flash }: FacebookPixelSettingsProps) {
  const { data, setData, post, processing } = useForm({
    FACEBOOK_PIXEL_ID: pixelSettings.FACEBOOK_PIXEL_ID || '',
    FACEBOOK_PIXEL_ACCESS_TOKEN: pixelSettings.FACEBOOK_PIXEL_ACCESS_TOKEN || '',
    FACEBOOK_PIXEL_DEBUG_MODE: pixelSettings.FACEBOOK_PIXEL_DEBUG_MODE || false,
    FACEBOOK_PIXEL_ENABLED: pixelSettings.FACEBOOK_PIXEL_ENABLED || false,
  });

  const [testResult, setTestResult] = useState<{
    status: 'success' | 'error' | null;
    message: string;
  }>({
    status: null,
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTestResult({ status: null, message: '' });
    
    post('/admin/settings/facebook-pixel', {
      onSuccess: () => {
        setIsSubmitting(false);
      },
      onError: () => {
        setIsSubmitting(false);
      }
    });
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult({ status: null, message: '' });
    
    router.post('/admin/settings/facebook-pixel/test', 
      { debug_mode: data.FACEBOOK_PIXEL_DEBUG_MODE },
      {
        onSuccess: (page: any) => {
          setIsTesting(false);
          const response = page.props.flash?.success 
            ? { status: 'success', message: page.props.flash.success }
            : { status: 'error', message: page.props.flash?.error || 'Unknown error occurred' };
          
          setTestResult({
            status: response.status as 'success' | 'error',
            message: response.message,
          });
        },
        onError: (errors) => {
          setIsTesting(false);
          setTestResult({
            status: 'error',
            message: errors.message || 'Failed to test connection',
          });
        }
      }
    );
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbItems}>
      <Head title="Facebook Pixel Settings" />
      
      <div className="container py-10 mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Facebook Pixel Settings</h1>
            <p className="mt-1 text-lg text-muted-foreground">
              Configure your Facebook Pixel tracking
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={!data.FACEBOOK_PIXEL_ID || !data.FACEBOOK_PIXEL_ACCESS_TOKEN || !data.FACEBOOK_PIXEL_ENABLED || isTesting}
            >
              {isTesting ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <SendHorizonal className="w-4 h-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={() => window.open('https://developers.facebook.com/docs/meta-pixel/get-started', '_blank')}
              variant="outline"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Documentation
            </Button>
          </div>
        </div>

        {flash?.success && (
          <Alert className="mb-6">
            <CheckCircleIcon className="w-4 h-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{flash.success}</AlertDescription>
          </Alert>
        )}

        {flash?.error && (
          <Alert className="mb-6" variant="destructive">
            <ExclamationCircleIcon className="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{flash.error}</AlertDescription>
          </Alert>
        )}

        {testResult.status && (
          <Alert 
            className="mb-6" 
            variant={testResult.status === 'success' ? 'default' : 'destructive'}
          >
            {testResult.status === 'success' ? (
              <CheckCircleIcon className="w-4 h-4" />
            ) : (
              <ExclamationCircleIcon className="w-4 h-4" />
            )}
            <AlertTitle>
              {testResult.status === 'success' ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="events">Event Reference</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Share2 className="w-5 h-5 mr-2" />
                      Facebook Pixel Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure your Facebook Pixel tracking ID and settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="FACEBOOK_PIXEL_ID">
                          Facebook Pixel ID
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InformationCircleIcon className="inline-block w-4 h-4 ml-1 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                Your Facebook Pixel ID from Meta Business Suite
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Input
                          id="FACEBOOK_PIXEL_ID"
                          className="mt-1"
                          value={data.FACEBOOK_PIXEL_ID}
                          onChange={(e) => setData('FACEBOOK_PIXEL_ID', e.target.value)}
                          placeholder="123456789012345"
                        />
                        {errors?.FACEBOOK_PIXEL_ID && (
                          <p className="mt-1 text-sm text-destructive">{errors.FACEBOOK_PIXEL_ID}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="FACEBOOK_PIXEL_ACCESS_TOKEN">
                          Access Token
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InformationCircleIcon className="inline-block w-4 h-4 ml-1 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                Your Facebook API Access Token (required for server-side events)
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Input
                          id="FACEBOOK_PIXEL_ACCESS_TOKEN"
                          className="mt-1"
                          type="password"
                          value={data.FACEBOOK_PIXEL_ACCESS_TOKEN}
                          onChange={(e) => setData('FACEBOOK_PIXEL_ACCESS_TOKEN', e.target.value)}
                          placeholder="Enter your Facebook access token"
                        />
                        {errors?.FACEBOOK_PIXEL_ACCESS_TOKEN && (
                          <p className="mt-1 text-sm text-destructive">{errors.FACEBOOK_PIXEL_ACCESS_TOKEN}</p>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="FACEBOOK_PIXEL_DEBUG_MODE">Debug Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable debug mode for testing
                          </p>
                        </div>
                        <Switch
                          id="FACEBOOK_PIXEL_DEBUG_MODE"
                          checked={data.FACEBOOK_PIXEL_DEBUG_MODE}
                          onCheckedChange={(checked) => setData('FACEBOOK_PIXEL_DEBUG_MODE', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="FACEBOOK_PIXEL_ENABLED">Enable Facebook Pixel</Label>
                          <p className="text-sm text-muted-foreground">
                            Turn Facebook Pixel tracking on or off
                          </p>
                        </div>
                        <Switch
                          id="FACEBOOK_PIXEL_ENABLED"
                          checked={data.FACEBOOK_PIXEL_ENABLED}
                          onCheckedChange={(checked) => setData('FACEBOOK_PIXEL_ENABLED', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      disabled={processing || isSubmitting}
                      className="ml-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : 'Save Settings'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle>Standard Event Reference</CardTitle>
                  <CardDescription>
                    Facebook Pixel standard events for tracking different user actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium">PageView</h3>
                        <p className="text-sm text-muted-foreground">
                          Tracks when a user visits a page
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">AddToCart</h3>
                        <p className="text-sm text-muted-foreground">
                          Tracks when a user adds an item to their shopping cart
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Purchase</h3>
                        <p className="text-sm text-muted-foreground">
                          Tracks when a user completes a purchase
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">InitiateCheckout</h3>
                        <p className="text-sm text-muted-foreground">
                          Tracks when a user begins the checkout process
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">ViewContent</h3>
                        <p className="text-sm text-muted-foreground">
                          Tracks when a user views content (e.g. product page)
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Contact</h3>
                        <p className="text-sm text-muted-foreground">
                          Tracks when a user contacts your business
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium">Server-side Events Example</h3>
                      <pre className="p-4 mt-2 overflow-x-auto text-xs bg-muted rounded-md">
                        {`use App\\Facades\\FBPixel;

// Track a purchase event
FBPixel::postEvent([
    'name' => 'Purchase',
    'params' => [
        'currency' => 'BDT',
        'value' => 123.45,
        'content_type' => 'product',
        'content_ids' => ['12345', '67890']
    ]
]);`}
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium">Client-side Events Example</h3>
                      <pre className="p-4 mt-2 overflow-x-auto text-xs bg-muted rounded-md">
                        {`// Track a custom event
fbq('track', 'Purchase', {
    currency: 'BDT',
    value: 123.45,
    content_type: 'product',
    content_ids: ['12345', '67890']
});`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </AdminLayout>
  );
} 