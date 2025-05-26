<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class FacebookPixelController extends Controller
{
    /**
     * Show the Facebook Pixel settings page.
     */
    public function edit()
    {
        $pixelSettings = [
            'FACEBOOK_PIXEL_ID' => config('services.facebook-pixel.pixel_id'),
            'FACEBOOK_PIXEL_ACCESS_TOKEN' => config('services.facebook-pixel.access_token'),
            'FACEBOOK_PIXEL_DEBUG_MODE' => config('services.facebook-pixel.debug_mode'),
            'FACEBOOK_PIXEL_ENABLED' => config('services.facebook-pixel.enabled'),
        ];

        return Inertia::render('admin/settings/facebook-pixel', [
            'pixelSettings' => $pixelSettings,
        ]);
    }

    /**
     * Update the Facebook Pixel settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'FACEBOOK_PIXEL_ID' => 'nullable|string|max:255',
            'FACEBOOK_PIXEL_ACCESS_TOKEN' => 'nullable|string|max:255',
            'FACEBOOK_PIXEL_DEBUG_MODE' => 'boolean',
            'FACEBOOK_PIXEL_ENABLED' => 'boolean',
        ]);

        // Update .env file values
        $this->updateEnvironmentFile($validated);

        // Clear config cache to make changes effective
        Artisan::call('config:clear');

        return redirect()->route('admin.settings.facebook-pixel')
            ->with('success', 'Facebook Pixel settings updated successfully');
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
     * Test the Facebook Pixel connection.
     */
    public function test(Request $request)
    {
        try {
            // Get the Facebook Pixel facade
            $fbPixel = app('facebook-pixel');
            
            if ($request->has('debug_mode') && $request->debug_mode) {
                $fbPixel->enableDebugMode();
            }
            
            // Send a test event
            $result = $fbPixel->postEvent([
                'name' => 'TestEvent',
                'timestamp' => time(),
                'params' => [
                    'test_param' => 'test_value',
                ]
            ]);
            
            if ($result['status'] === 'success') {
                return response()->json([
                    'success' => true, 
                    'message' => 'Test event sent successfully to Facebook Pixel'
                ]);
            } else {
                return response()->json([
                    'success' => false, 
                    'message' => 'Failed to send test event: ' . ($result['message'] ?? 'Unknown error')
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('Facebook Pixel test error', ['exception' => $e->getMessage()]);
            return response()->json([
                'success' => false, 
                'message' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }
} 