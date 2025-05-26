<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FacebookPixel
{
    /**
     * The Facebook Pixel ID
     */
    protected $pixelId;

    /**
     * The Facebook Access Token
     */
    protected $accessToken;

    /**
     * Whether debug mode is enabled
     */
    protected $debugMode;

    /**
     * Whether Facebook Pixel is enabled
     */
    protected $enabled;

    /**
     * Create a new FacebookPixel instance.
     */
    public function __construct(
        string $pixelId = null,
        string $accessToken = null,
        bool $debugMode = false,
        bool $enabled = true
    ) {
        $this->pixelId = $pixelId;
        $this->accessToken = $accessToken;
        $this->debugMode = $debugMode;
        $this->enabled = $enabled;
    }

    /**
     * Enable debug mode
     */
    public function enableDebugMode(): self
    {
        $this->debugMode = true;
        return $this;
    }

    /**
     * Post a server-side event to Facebook Conversions API
     */
    public function postEvent(array $eventData): array
    {
        if (!$this->enabled || !$this->pixelId || !$this->accessToken) {
            if ($this->debugMode) {
                Log::channel('daily')->debug('Facebook Pixel disabled or missing configuration', [
                    'enabled' => $this->enabled,
                    'pixelId' => $this->pixelId ? 'set' : 'not set',
                    'accessToken' => $this->accessToken ? 'set' : 'not set',
                ]);
            }
            return ['status' => 'error', 'message' => 'Facebook Pixel is disabled or not configured properly'];
        }

        // Base URL for Facebook Conversions API
        $url = "https://graph.facebook.com/v19.0/{$this->pixelId}/events";
        
        // Prepare the payload according to Facebook's API requirements
        $payload = [
            'access_token' => $this->accessToken,
            'data' => [
                [
                    'event_name' => $eventData['name'] ?? 'CustomEvent',
                    'event_time' => $eventData['timestamp'] ?? time(),
                    'action_source' => 'website',
                    'event_source_url' => $eventData['source_url'] ?? request()->url(),
                    'custom_data' => $eventData['params'] ?? [],
                ]
            ],
            'test_event_code' => $this->debugMode ? 'TEST12345' : null,
        ];
        
        // Filter out null values
        $payload = array_filter($payload, function ($value) {
            return $value !== null;
        });
        
        try {
            $response = Http::post($url, $payload);
            
            if ($this->debugMode) {
                Log::channel('daily')->debug('Facebook Pixel event posted', [
                    'event' => $eventData,
                    'response' => $response->json(),
                ]);
            }
            
            return [
                'status' => $response->successful() ? 'success' : 'error',
                'response' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error('Facebook Pixel error: ' . $e->getMessage());
            
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }
} 