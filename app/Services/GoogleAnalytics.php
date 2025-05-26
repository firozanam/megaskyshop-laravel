<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class GoogleAnalytics
{
    /**
     * The Google Analytics 4 Measurement ID
     */
    protected $measurementId;

    /**
     * The Google Analytics 4 API Secret
     */
    protected $apiSecret;

    /**
     * Whether debug mode is enabled
     */
    protected $debugMode;

    /**
     * Whether Google Analytics is enabled
     */
    protected $enabled;

    /**
     * The client ID from session
     */
    protected $clientId;

    /**
     * Create a new GoogleAnalytics instance.
     */
    public function __construct(
        string $measurementId = null,
        string $apiSecret = null,
        bool $debugMode = false,
        bool $enabled = true
    ) {
        $this->measurementId = $measurementId;
        $this->apiSecret = $apiSecret;
        $this->debugMode = $debugMode;
        $this->enabled = $enabled;

        // Try to get client ID from session
        $this->clientId = Session::get('ga_client_id');
    }

    /**
     * Set the client ID
     */
    public function setClientId(string $clientId): self
    {
        $this->clientId = $clientId;
        Session::put('ga_client_id', $clientId);
        
        return $this;
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
     * Post an event to Google Analytics 4
     */
    public function postEvent(array $eventData): array
    {
        if (!$this->enabled || !$this->measurementId || !$this->apiSecret) {
            if ($this->debugMode) {
                Log::channel('daily')->debug('Google Analytics disabled or missing configuration', [
                    'enabled' => $this->enabled,
                    'measurementId' => $this->measurementId ? 'set' : 'not set',
                    'apiSecret' => $this->apiSecret ? 'set' : 'not set',
                ]);
            }
            return ['status' => 'error', 'message' => 'Google Analytics is disabled or not configured properly'];
        }

        if (!$this->clientId) {
            if ($this->debugMode) {
                Log::channel('daily')->debug('Google Analytics client ID not set');
            }
            return ['status' => 'error', 'message' => 'Client ID not set'];
        }

        $url = "https://www.google-analytics.com/mp/collect";
        
        if ($this->debugMode) {
            $url = "https://www.google-analytics.com/debug/mp/collect";
        }
        
        $payload = [
            'client_id' => $this->clientId,
            'events' => [
                $eventData
            ]
        ];
        
        try {
            $response = Http::post("{$url}?measurement_id={$this->measurementId}&api_secret={$this->apiSecret}", $payload);
            
            if ($this->debugMode) {
                Log::channel('daily')->debug('Google Analytics event posted', [
                    'event' => $eventData,
                    'response' => $response->json(),
                ]);
            }
            
            return [
                'status' => $response->successful() ? 'success' : 'error',
                'response' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error('Google Analytics error: ' . $e->getMessage());
            
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }
} 