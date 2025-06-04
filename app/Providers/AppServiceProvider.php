<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Config;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Add admin email to mail configuration
        $adminEmail = env('ADMIN_EMAIL');
        if ($adminEmail) {
            Config::set('mail.admin_email', $adminEmail);
        }
        
        // Check for placeholder image in production
        if (app()->environment('production')) {
            $this->ensurePlaceholderImageExists();
        }
    }

    /**
     * Ensure the placeholder image exists in all required locations
     */
    protected function ensurePlaceholderImageExists(): void
    {
        $publicImagesPath = public_path('images/placeholder.jpg');
        $storageUploadsPath = storage_path('app/public/uploads/placeholder.jpg');
        $publicUploadsPath = public_path('uploads/placeholder.jpg');
        
        // If the source image exists but not in storage, copy it
        if (file_exists($publicImagesPath)) {
            if (!file_exists(dirname($storageUploadsPath))) {
                mkdir(dirname($storageUploadsPath), 0755, true);
            }
            
            if (!file_exists(dirname($publicUploadsPath))) {
                mkdir(dirname($publicUploadsPath), 0755, true);
            }
            
            if (!file_exists($storageUploadsPath)) {
                copy($publicImagesPath, $storageUploadsPath);
            }
            
            if (!file_exists($publicUploadsPath)) {
                copy($publicImagesPath, $publicUploadsPath);
            }
        }
    }
}
