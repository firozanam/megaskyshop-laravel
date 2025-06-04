<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            // Check if the user is an admin and redirect accordingly
            if ($request->user()->isAdmin()) {
                return redirect()->intended(route('admin.dashboard', absolute: false).'?verified=1');
            }
            
            return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
        }

        if ($request->user()->markEmailAsVerified()) {
            /** @var \Illuminate\Contracts\Auth\MustVerifyEmail $user */
            $user = $request->user();

            event(new Verified($user));
        }

        // Check if the user is an admin and redirect accordingly
        if ($request->user()->isAdmin()) {
            return redirect()->intended(route('admin.dashboard', absolute: false).'?verified=1');
        }
        
        return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
    }
}
