<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\View;

class FacebookPixelServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton('facebook-pixel', function ($app) {
            return new \App\Services\FacebookPixel(
                config('services.facebook-pixel.pixel_id'),
                config('services.facebook-pixel.access_token'),
                config('services.facebook-pixel.debug_mode', false),
                config('services.facebook-pixel.enabled', true)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register the Facebook Pixel component
        Blade::component('facebook-pixel', \App\View\Components\FacebookPixel::class);
        
        // Share the pixel ID with all views
        View::share('facebookPixelId', config('services.facebook-pixel.pixel_id'));
    }
} 