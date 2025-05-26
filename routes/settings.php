<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\MailController;
use App\Http\Controllers\Settings\GoogleAnalyticsController;
use App\Http\Controllers\Settings\FacebookPixelController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    Route::middleware('role:admin')->group(function () {
        // SMTP routes
        Route::get('admin/settings/smtp', [MailController::class, 'edit'])->name('admin.settings.smtp');
        Route::post('admin/settings/smtp', [MailController::class, 'update'])->name('admin.settings.smtp.update');
        Route::post('admin/settings/smtp/test', [MailController::class, 'sendTest'])->name('admin.settings.smtp.test');
        
        // Google Analytics routes
        Route::get('admin/settings/google-analytics', [GoogleAnalyticsController::class, 'edit'])->name('admin.settings.ga');
        Route::post('admin/settings/google-analytics', [GoogleAnalyticsController::class, 'update'])->name('admin.settings.ga.update');
        Route::post('admin/settings/google-analytics/test', [GoogleAnalyticsController::class, 'test'])->name('admin.settings.ga.test');
        
        // Facebook Pixel routes
        Route::get('admin/settings/facebook-pixel', [FacebookPixelController::class, 'edit'])->name('admin.settings.facebook-pixel');
        Route::post('admin/settings/facebook-pixel', [FacebookPixelController::class, 'update'])->name('admin.settings.facebook-pixel.update');
        Route::post('admin/settings/facebook-pixel/test', [FacebookPixelController::class, 'test'])->name('admin.settings.facebook-pixel.test');
    });
});
