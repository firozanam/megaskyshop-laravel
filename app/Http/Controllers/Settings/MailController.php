<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\EnvService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;

class MailController extends Controller
{
    /**
     * The EnvService instance.
     *
     * @var EnvService
     */
    protected $envService;

    /**
     * Create a new controller instance.
     *
     * @param EnvService $envService
     */
    public function __construct(EnvService $envService)
    {
        $this->envService = $envService;
    }

    /**
     * Show the mail settings page.
     */
    public function edit(): Response
    {
        $mailSettings = $this->envService->get([
            'MAIL_MAILER',
            'MAIL_HOST',
            'MAIL_PORT',
            'MAIL_USERNAME',
            'MAIL_PASSWORD',
            'MAIL_ENCRYPTION',
            'MAIL_FROM_ADDRESS',
            'MAIL_FROM_NAME',
        ]);
        
        // Set default values if not found
        if (!isset($mailSettings['MAIL_ENCRYPTION'])) {
            $mailSettings['MAIL_ENCRYPTION'] = 'tls';
        }
        
        return Inertia::render('admin/settings/smtp', [
            'mailSettings' => $mailSettings,
        ]);
    }

    /**
     * Update the mail settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'MAIL_MAILER' => ['required', 'string', 'in:smtp,sendmail,mailgun,ses,postmark,log,array'],
            'MAIL_HOST' => ['required', 'string'],
            'MAIL_PORT' => ['required', 'numeric'],
            'MAIL_USERNAME' => ['nullable', 'string'],
            'MAIL_PASSWORD' => ['nullable', 'string'],
            'MAIL_ENCRYPTION' => ['nullable', 'string', 'in:tls,ssl,null'],
            'MAIL_FROM_ADDRESS' => ['required', 'email'],
            'MAIL_FROM_NAME' => ['required', 'string'],
        ]);
        
        // Handle null encryption value
        if ($validated['MAIL_ENCRYPTION'] === 'null') {
            $validated['MAIL_ENCRYPTION'] = null;
        }
        
        // Update the .env file
        $this->envService->set($validated);
        
        // Clear config cache
        Artisan::call('config:clear');
        
        return back()->with('success', 'Mail settings updated successfully.');
    }

    /**
     * Send a test email.
     */
    public function sendTest(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'test_email' => ['required', 'email'],
        ]);
        
        $email = $validated['test_email'];
        
        try {
            Mail::raw('This is a test email from your application.', function($message) use ($email) {
                $message->to($email)
                    ->subject('Test Email from MegaSkyShop');
            });
            
            return back()->with('success', 'Test email sent successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send test email: ' . $e->getMessage());
        }
    }
} 