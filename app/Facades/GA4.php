<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @method static \App\Services\GoogleAnalytics setClientId(string $clientId)
 * @method static \App\Services\GoogleAnalytics enableDebugMode()
 * @method static array postEvent(array $eventData)
 * 
 * @see \App\Services\GoogleAnalytics
 */
class GA4 extends Facade
{
    /**
     * Get the registered name of the component.
     */
    protected static function getFacadeAccessor(): string
    {
        return 'google-analytics';
    }
} 