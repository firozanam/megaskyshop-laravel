<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class GoogleAnalyticsController extends Controller
{
    /**
     * Show the Google Analytics settings page.
     */
    public function edit()
    {
        $gaSettings = [
            'GOOGLE_ANALYTICS_MEASUREMENT_ID' => config('services.google-analytics.measurement_id'),
            'GOOGLE_ANALYTICS_API_SECRET' => config('services.google-analytics.api_secret'),
            'GOOGLE_ANALYTICS_DEBUG_MODE' => config('services.google-analytics.debug_mode'),
            'GOOGLE_ANALYTICS_ENABLED' => config('services.google-analytics.enabled'),
        ];

        return Inertia::render('admin/settings/google-analytics', [
            'gaSettings' => $gaSettings,
        ]);
    }

    /**
     * Update the Google Analytics settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'GOOGLE_ANALYTICS_MEASUREMENT_ID' => 'nullable|string|max:255',
            'GOOGLE_ANALYTICS_API_SECRET' => 'nullable|string|max:255',
            'GOOGLE_ANALYTICS_DEBUG_MODE' => 'boolean',
            'GOOGLE_ANALYTICS_ENABLED' => 'boolean',
        ]);

        // Update .env file values
        $this->updateEnvironmentFile($validated);

        // Clear config cache to make changes effective
        Artisan::call('config:clear');

        return redirect()->route('admin.settings.ga')
            ->with('success', 'Google Analytics settings updated successfully');
    }

    /**
     * Update the environment file with the given settings.
     */
    private function updateEnvironmentFile(array $settings)
    {
        $envFile = app()->environmentFilePath();
        $envContents = file_get_contents($envFile);

        foreach ($settings as $key => $value) {
            // Format value based on type
            if (is_bool($value)) {
                $value = $value ? 'true' : 'false';
            } elseif (is_null($value)) {
                $value = '';
            }

            // Replace existing value or add new one
            if (preg_match("/^{$key}=(.*)$/m", $envContents)) {
                $envContents = preg_replace("/^{$key}=(.*)$/m", "{$key}={$value}", $envContents);
            } else {
                $envContents .= "\n{$key}={$value}";
            }
        }

        file_put_contents($envFile, $envContents);
    }

    /**
     * Test the Google Analytics connection.
     */
    public function test(Request $request)
    {
        try {
            // Get the GA4 facade
            $ga4 = app('google-analytics');
            
            // Generate a test client ID if not already set
            $clientId = $request->session()->get('ga_client_id') ?? uniqid('test_', true);
            $ga4->setClientId($clientId);
            
            if ($request->has('debug_mode') && $request->debug_mode) {
                $ga4->enableDebugMode();
            }
            
            // Send a test event
            $result = $ga4->postEvent([
                'name' => 'test_event',
                'params' => [
                    'test_param' => 'test_value',
                    'timestamp' => now()->timestamp
                ]
            ]);
            
            if ($result['status'] === 'success') {
                return response()->json([
                    'success' => true, 
                    'message' => 'Test event sent successfully to Google Analytics'
                ]);
            } else {
                return response()->json([
                    'success' => false, 
                    'message' => 'Failed to send test event: ' . ($result['message'] ?? 'Unknown error')
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('Google Analytics test error', ['exception' => $e->getMessage()]);
            return response()->json([
                'success' => false, 
                'message' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }
} 