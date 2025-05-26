import React, { useState, FormEvent } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Alert, 
  AlertTitle, 
  AlertDescription 
} from '@/components/ui/alert';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { Mail, Send } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';

interface SmtpSettingsProps {
  mailSettings: {
    MAIL_MAILER: string;
    MAIL_HOST: string;
    MAIL_PORT: string;
    MAIL_USERNAME: string;
    MAIL_PASSWORD: string;
    MAIL_ENCRYPTION: string;
    MAIL_FROM_ADDRESS: string;
    MAIL_FROM_NAME: string;
  };
  errors?: Record<string, string>;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function SmtpSettings({ mailSettings, errors = {}, flash }: SmtpSettingsProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Settings', href: '#' },
    { title: 'SMTP Settings', href: '/admin/settings/smtp' },
  ];

  // Set default values for form fields
  const { data, setData, post, processing, reset } = useForm({
    MAIL_MAILER: mailSettings.MAIL_MAILER || 'smtp',
    MAIL_HOST: mailSettings.MAIL_HOST || '',
    MAIL_PORT: mailSettings.MAIL_PORT || '587',
    MAIL_USERNAME: mailSettings.MAIL_USERNAME || '',
    MAIL_PASSWORD: mailSettings.MAIL_PASSWORD || '',
    MAIL_ENCRYPTION: mailSettings.MAIL_ENCRYPTION || 'tls',
    MAIL_FROM_ADDRESS: mailSettings.MAIL_FROM_ADDRESS || '',
    MAIL_FROM_NAME: mailSettings.MAIL_FROM_NAME || '',
  });

  // For test email
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post(route('admin.settings.smtp.update'));
  };

  const handleTestEmail = (e: FormEvent) => {
    e.preventDefault();
    setIsSendingTest(true);
    setTestSuccess(null);
    setTestError(null);

    router.post(route('admin.settings.smtp.test'), {
      test_email: testEmail
    }, {
      onSuccess: () => {
        setTestSuccess('Test email sent successfully!');
        setIsSendingTest(false);
      },
      onError: (errors) => {
        setTestError(errors.test_email || 'Failed to send test email.');
        setIsSendingTest(false);
      },
    });
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="SMTP Settings" />
      
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center">
          <Mail className="mr-2 h-6 w-6 text-gray-800" />
          <h1 className="text-2xl font-bold tracking-tight">SMTP Settings</h1>
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* SMTP Settings Form */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Mail Server Configuration</CardTitle>
              <CardDescription>
                Configure your application's mail server settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="MAIL_MAILER">Mail Driver</Label>
                    <Select 
                      value={data.MAIL_MAILER} 
                      onValueChange={(value) => setData('MAIL_MAILER', value)}
                    >
                      <SelectTrigger id="MAIL_MAILER">
                        <SelectValue placeholder="Select mail driver" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smtp">SMTP</SelectItem>
                        <SelectItem value="sendmail">Sendmail</SelectItem>
                        <SelectItem value="mailgun">Mailgun</SelectItem>
                        <SelectItem value="ses">Amazon SES</SelectItem>
                        <SelectItem value="postmark">Postmark</SelectItem>
                        <SelectItem value="log">Log</SelectItem>
                        <SelectItem value="array">Array (Testing)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.MAIL_MAILER && (
                      <p className="text-sm text-red-500">{errors.MAIL_MAILER}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="MAIL_HOST">SMTP Host</Label>
                    <Input
                      id="MAIL_HOST"
                      type="text"
                      placeholder="smtp.example.com"
                      value={data.MAIL_HOST}
                      onChange={(e) => setData('MAIL_HOST', e.target.value)}
                    />
                    {errors.MAIL_HOST && (
                      <p className="text-sm text-red-500">{errors.MAIL_HOST}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="MAIL_PORT">SMTP Port</Label>
                    <Input
                      id="MAIL_PORT"
                      type="text"
                      placeholder="587"
                      value={data.MAIL_PORT}
                      onChange={(e) => setData('MAIL_PORT', e.target.value)}
                    />
                    {errors.MAIL_PORT && (
                      <p className="text-sm text-red-500">{errors.MAIL_PORT}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="MAIL_ENCRYPTION">Encryption</Label>
                    <Select 
                      value={data.MAIL_ENCRYPTION} 
                      onValueChange={(value) => setData('MAIL_ENCRYPTION', value)}
                    >
                      <SelectTrigger id="MAIL_ENCRYPTION">
                        <SelectValue placeholder="Select encryption" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="null">None</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.MAIL_ENCRYPTION && (
                      <p className="text-sm text-red-500">{errors.MAIL_ENCRYPTION}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="MAIL_USERNAME">SMTP Username</Label>
                    <Input
                      id="MAIL_USERNAME"
                      type="text"
                      placeholder="username@example.com"
                      value={data.MAIL_USERNAME}
                      onChange={(e) => setData('MAIL_USERNAME', e.target.value)}
                    />
                    {errors.MAIL_USERNAME && (
                      <p className="text-sm text-red-500">{errors.MAIL_USERNAME}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="MAIL_PASSWORD">SMTP Password</Label>
                    <Input
                      id="MAIL_PASSWORD"
                      type="password"
                      placeholder="••••••••"
                      value={data.MAIL_PASSWORD}
                      onChange={(e) => setData('MAIL_PASSWORD', e.target.value)}
                    />
                    {errors.MAIL_PASSWORD && (
                      <p className="text-sm text-red-500">{errors.MAIL_PASSWORD}</p>
                    )}
                  </div>

                  <Separator />

                  <div className="grid gap-2">
                    <Label htmlFor="MAIL_FROM_ADDRESS">From Address</Label>
                    <Input
                      id="MAIL_FROM_ADDRESS"
                      type="email"
                      placeholder="noreply@example.com"
                      value={data.MAIL_FROM_ADDRESS}
                      onChange={(e) => setData('MAIL_FROM_ADDRESS', e.target.value)}
                    />
                    {errors.MAIL_FROM_ADDRESS && (
                      <p className="text-sm text-red-500">{errors.MAIL_FROM_ADDRESS}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="MAIL_FROM_NAME">From Name</Label>
                    <Input
                      id="MAIL_FROM_NAME"
                      type="text"
                      placeholder="MegaSkyShop"
                      value={data.MAIL_FROM_NAME}
                      onChange={(e) => setData('MAIL_FROM_NAME', e.target.value)}
                    />
                    {errors.MAIL_FROM_NAME && (
                      <p className="text-sm text-red-500">{errors.MAIL_FROM_NAME}</p>
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

          {/* Test Email Form */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Test Email Configuration</CardTitle>
              <CardDescription>
                Send a test email to verify your settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTestEmail} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="test_email">Recipient Email</Label>
                    <Input
                      id="test_email"
                      type="email"
                      placeholder="Enter email address"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      required
                    />
                    {testError && (
                      <p className="text-sm text-red-500">{testError}</p>
                    )}
                  </div>

                  {testSuccess && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        {testSuccess}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <Button 
                  type="submit" 
                  variant="outline" 
                  className="w-full" 
                  disabled={isSendingTest || !testEmail}
                >
                  {isSendingTest ? (
                    <>
                      <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t px-6 py-4">
              <div className="text-sm text-gray-500">
                <p className="font-medium">Note:</p>
                <p>Test emails help ensure your mail configuration is working correctly. Make sure to save your settings before testing.</p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 