<?php

namespace App\View\Components;

use Illuminate\View\Component;

class FacebookPixel extends Component
{
    /**
     * The Facebook Pixel ID
     */
    public $pixelId;

    /**
     * Whether Facebook Pixel is enabled
     */
    public $enabled;

    /**
     * Create a new component instance.
     */
    public function __construct($pixelId = null, $enabled = true)
    {
        $this->pixelId = $pixelId ?? config('services.facebook-pixel.pixel_id');
        $this->enabled = $enabled && config('services.facebook-pixel.enabled', true);
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render()
    {
        return view('components.facebook-pixel');
    }
} 