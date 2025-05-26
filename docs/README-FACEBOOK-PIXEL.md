# Facebook Pixel Implementation

This document explains the Facebook Pixel implementation in the MegaSkyShop application.

## Overview

The implementation consists of the following components:

1. **Server-side Service**: A PHP service class for sending server-side events to Facebook's Conversions API
2. **Frontend Tracking**: JavaScript tracking code embedded in the main application layout
3. **Admin Settings UI**: A settings page for configuring Facebook Pixel credentials
4. **Blade Component**: A reusable component for including Facebook Pixel tracking

## Files and Components

### Backend Components

- `app/Services/FacebookPixel.php` - Core service for server-side Facebook Pixel tracking
- `app/Facades/FBPixel.php` - Facade for easy access to the Facebook Pixel service
- `app/Providers/FacebookPixelServiceProvider.php` - Service provider for Facebook Pixel configuration
- `app/Http/Controllers/Settings/FacebookPixelController.php` - Controller for managing Facebook Pixel settings
- `app/View/Components/FacebookPixel.php` - Blade component for Facebook Pixel tracking

### Frontend Components

- `resources/js/pages/admin/settings/facebook-pixel.tsx` - Admin settings UI for Facebook Pixel
- `resources/views/components/facebook-pixel.blade.php` - Blade view for Facebook Pixel tracking code

### Configuration

- `config/services.php` - Contains Facebook Pixel configuration options
- `.env` - Environment variables for Facebook Pixel credentials

## How to Use

### Server-side Tracking

You can track server-side events using the FBPixel facade:

```php
use App\Facades\FBPixel;

// Track a purchase event
FBPixel::postEvent([
    'name' => 'Purchase',
    'params' => [
        'currency' => 'BDT',
        'value' => 123.45,
        'content_type' => 'product',
        'content_ids' => ['12345', '67890']
    ]
]);
```

### Client-side Tracking

Client-side tracking is automatically included in the main layout using the `<x-facebook-pixel />` component.

You can also manually track client-side events:

```javascript
// Track a custom event
fbq('track', 'Purchase', {
    currency: 'BDT',
    value: 123.45,
    content_type: 'product',
    content_ids: ['12345', '67890']
});
```

## Standard Events

The implementation supports the following standard Facebook Pixel events:

1. **PageView** - Tracked automatically on all pages with the base Pixel
2. **ViewContent** - Tracked when a user views a product page
3. **AddToCart** - Tracked when a user adds a product to their cart
4. **InitiateCheckout** - Tracked when a user starts the checkout process
5. **Purchase** - Tracked when a user completes a purchase

## Admin Settings

Administrators can configure the Facebook Pixel integration through the admin settings panel:

1. Navigate to **Admin > Settings > Facebook Pixel**
2. Enter your Facebook Pixel ID
3. Optionally enter your Facebook API Access Token for server-side tracking
4. Toggle debug mode and enabled status as needed
5. Save settings

## Testing

You can test your Facebook Pixel implementation using:

1. The **Test Connection** button in the admin settings
2. Facebook's Pixel Helper browser extension
3. Facebook's Events Manager in Business Manager 