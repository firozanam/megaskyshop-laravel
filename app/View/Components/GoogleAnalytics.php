<?php

namespace App\View\Components;

use Illuminate\View\Component;

class GoogleAnalytics extends Component
{
    /**
     * The Google Analytics 4 Measurement ID
     */
    public $measurementId;

    /**
     * Whether Google Analytics is enabled
     */
    public $enabled;

    /**
     * Create a new component instance.
     */
    public function __construct($measurementId = null, $enabled = true)
    {
        $this->measurementId = $measurementId ?? config('services.google-analytics.measurement_id');
        $this->enabled = $enabled && config('services.google-analytics.enabled', true);
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render()
    {
        return view('components.google-analytics');
    }
} 