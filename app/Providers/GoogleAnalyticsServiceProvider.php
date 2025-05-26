<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\View;

class GoogleAnalyticsServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton('google-analytics', function ($app) {
            return new \App\Services\GoogleAnalytics(
                config('services.google-analytics.measurement_id'),
                config('services.google-analytics.api_secret'),
                config('services.google-analytics.debug_mode', false),
                config('services.google-analytics.enabled', true)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register the Google Analytics component
        Blade::component('google-analytics', \App\View\Components\GoogleAnalytics::class);
        
        // Share the measurement ID with all views
        View::share('googleAnalyticsMeasurementId', config('services.google-analytics.measurement_id'));
    }
} 