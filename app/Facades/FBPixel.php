<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @method static \App\Services\FacebookPixel enableDebugMode()
 * @method static array postEvent(array $eventData)
 * 
 * @see \App\Services\FacebookPixel
 */
class FBPixel extends Facade
{
    /**
     * Get the registered name of the component.
     */
    protected static function getFacadeAccessor(): string
    {
        return 'facebook-pixel';
    }
} 