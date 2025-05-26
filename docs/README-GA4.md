# Google Analytics 4 Implementation

This document explains the Google Analytics 4 (GA4) implementation in the MegaSkyShop application.

## Overview

The implementation consists of the following components:

1. **Server-side Service**: A PHP service class for sending server-side events to GA4
2. **Frontend Tracking**: JavaScript tracking code embedded in the main application layout
3. **Admin Settings UI**: A settings page for configuring GA4 credentials
4. **Blade Component**: A reusable component for including GA4 tracking

## Files and Components

### Backend Components

- `app/Services/GoogleAnalytics.php` - Core service for server-side GA4 tracking
- `app/Facades/GA4.php` - Facade for easy access to the GA4 service
- `app/Providers/GoogleAnalyticsServiceProvider.php` - Service provider for GA4 configuration
- `app/Http/Controllers/Settings/GoogleAnalyticsController.php` - Controller for managing GA4 settings
- `app/View/Components/GoogleAnalytics.php` - Blade component for GA4 tracking

### Frontend Components

- `resources/js/pages/admin/settings/google-analytics.tsx` - Admin settings UI for GA4
- `resources/views/components/google-analytics.blade.php` - Blade view for GA4 tracking code

### Configuration

- `config/services.php` - Contains GA4 configuration options
- `.env` - Environment variables for GA4 credentials

## How to Use

### Server-side Tracking

You can track server-side events using the GA4 facade:

```php
use App\Facades\GA4;

// Track a purchase event
GA4::postEvent([
    'name' => 'purchase',
    'params' => [
        'transaction_id' => $order->id,
        'value' => $order->total,
        'currency' => 'BDT',
        'items' => $orderItems
    ]
]);
```

### Client-side Tracking

Client-side tracking is automatically included in the main layout using the `<x-google-analytics />` component.

You can also manually track client-side events:

```javascript
// Track a custom event
gtag('event', 'view_item', {
  items: [{
    id: 'P12345',
    name: 'Product Name',
    price: '9.99'
  }]
});
```

## Configuration Settings

The following settings can be configured through the admin interface:

1. **Measurement ID** - Your GA4 property measurement ID (starts with G-)
2. **API Secret** - The secret key for server-side GA4 API access
3. **Debug Mode** - Enable to log GA4 events for debugging
4. **Enabled** - Toggle to enable/disable GA4 tracking globally

## Environments

For different environments, you can configure the following variables in your `.env` file:

```
GOOGLE_ANALYTICS_MEASUREMENT_ID=G-XXXXXXXXXX
GOOGLE_ANALYTICS_API_SECRET=your_api_secret
GOOGLE_ANALYTICS_DEBUG_MODE=false
GOOGLE_ANALYTICS_ENABLED=true
``` 