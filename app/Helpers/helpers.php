<?php

if (!function_exists('placeholder_image_url')) {
    /**
     * Get the placeholder image URL
     *
     * @return string
     */
    function placeholder_image_url()
    {
        // Check if the placeholder exists in storage
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists('uploads/placeholder.jpg')) {
            return \Illuminate\Support\Facades\Storage::disk('public')->url('uploads/placeholder.jpg');
        }
        
        // Fallback to the public images directory
        return asset('images/placeholder.jpg');
    }
} 