<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Middleware\CheckRole;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\HomepageController;

Route::get('/', [HomepageController::class, 'index'])->name('home');

// Temporary debugging route
Route::get('/debug/products', function() {
    $products = \App\Models\Product::with('images')->paginate(12);
    return Inertia::render('admin/products/index', [
        'products' => $products,
        'categories' => \App\Models\Product::distinct('category')->pluck('category'),
        'filters' => []
    ]);
})->name('debug.products');

Route::get('/debug/products-json', function() {
    $products = \App\Models\Product::with('images')->paginate(12);
    return response()->json([
        'products' => $products,
        'categories' => \App\Models\Product::distinct('category')->pluck('category'),
    ]);
})->name('debug.products.json');

// Test PUT route
Route::put('/debug/test-put', function(\Illuminate\Http\Request $request) {
    \Log::info('Test PUT route hit', [
        'method' => $request->method(),
        'data' => $request->all()
    ]);
    return response()->json([
        'success' => true,
        'message' => 'PUT request received',
        'data' => $request->all()
    ]);
})->name('debug.test-put');

// Test POST route that accepts _method=PUT
Route::post('/debug/test-post-put', function(\Illuminate\Http\Request $request) {
    \Log::info('Test POST-PUT route hit', [
        'real_method' => $request->method(),
        'spoofed_method' => $request->input('_method', 'NONE'),
        'data' => $request->all()
    ]);
    return response()->json([
        'success' => true,
        'message' => 'POST request with _method=PUT received',
        'data' => $request->all()
    ]);
})->name('debug.test-post-put');

// Middleware debugger route - add the same middleware as your admin routes
Route::post('/debug/middleware-test', function(\Illuminate\Http\Request $request) {
    \Log::info('Middleware test route hit', [
        'method' => $request->method(),
        'data' => $request->all(),
        'authenticated_user' => auth()->check() ? auth()->user()->email : 'Not authenticated'
    ]);
    return response()->json([
        'success' => true,
        'message' => 'Successfully passed through middleware',
        'user' => auth()->check() ? auth()->user()->email : 'Not authenticated'
    ]);
})->middleware(['auth', \App\Http\Middleware\CheckRole::class.':admin'])->name('debug.middleware-test');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', CheckRole::class.':admin'])->group(function () {
    // Admin dashboard with product data
    Route::get('/admin', [ProductController::class, 'adminDashboard'])->name('admin.dashboard');
    Route::get('/admin/dashboard', [ProductController::class, 'adminDashboard'])->name('admin.dashboard.index');
    
    // Admin product routes
    Route::resource('admin/products', ProductController::class)
        ->except(['show'])
        ->names([
            'index' => 'admin.products.index',
            'create' => 'admin.products.create',
            'store' => 'admin.products.store',
            'edit' => 'admin.products.edit',
            'update' => 'admin.products.update',
            'destroy' => 'admin.products.destroy',
        ]);
    
    // Admin category routes
    Route::resource('admin/categories', CategoryController::class)
        ->except(['show'])
        ->names([
            'index' => 'admin.categories.index',
            'create' => 'admin.categories.create',
            'store' => 'admin.categories.store',
            'edit' => 'admin.categories.edit',
            'update' => 'admin.categories.update',
            'destroy' => 'admin.categories.destroy',
        ]);
    
    // Admin user management routes
    Route::resource('admin/users', UserController::class)
        ->except(['show'])
        ->names([
            'index' => 'admin.users.index',
            'create' => 'admin.users.create',
            'store' => 'admin.users.store',
            'edit' => 'admin.users.edit',
            'update' => 'admin.users.update',
            'destroy' => 'admin.users.destroy',
        ]);
        
    // Admin order management routes
    Route::get('admin/orders', [OrderController::class, 'adminIndex'])->name('admin.orders.index');
    Route::get('admin/orders/{order}', [OrderController::class, 'adminShow'])->name('admin.orders.show');
    Route::put('admin/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('admin.orders.status.update');
    Route::put('admin/orders/{order}/tracking', [OrderController::class, 'updateTracking'])->name('admin.orders.tracking.update');
    
    // Homepage management routes
    Route::get('/admin/homepage', [HomepageController::class, 'adminIndex'])->name('admin.homepage.index');
    Route::get('/admin/homepage/sections/{id}/edit', [HomepageController::class, 'editSection'])->name('admin.homepage.sections.edit');
    Route::put('/admin/homepage/sections/{id}', [HomepageController::class, 'updateSection'])->name('admin.homepage.sections.update');
    
    // Featured products management
    Route::get('/admin/homepage/featured-products', [HomepageController::class, 'featuredProductsIndex'])->name('admin.homepage.featured-products');
    Route::post('/admin/homepage/featured-products', [HomepageController::class, 'addFeaturedProduct'])->name('admin.homepage.featured-products.add');
    Route::delete('/admin/homepage/featured-products/{id}', [HomepageController::class, 'removeFeaturedProduct'])->name('admin.homepage.featured-products.remove');
    Route::put('/admin/homepage/featured-products/order', [HomepageController::class, 'updateFeaturedProductOrder'])->name('admin.homepage.featured-products.order');
    Route::put('/admin/homepage/featured-products/{id}/toggle', [HomepageController::class, 'toggleFeaturedProductStatus'])->name('admin.homepage.featured-products.toggle');
});

// Public product routes
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
Route::post('/products/{product}/review', [ProductController::class, 'addReview'])->name('products.review');

// Static pages
Route::inertia('/about', 'about')->name('about');
Route::inertia('/contact', 'contact')->name('contact');
Route::inertia('/privacy-policy', 'privacy-policy')->name('privacy.policy');
Route::inertia('/terms-of-service', 'terms-of-service')->name('terms.service');
Route::inertia('/cart', 'cart')->name('cart');
Route::inertia('/checkout', 'checkout')->name('checkout');

// Public category routes
Route::get('/categories/{category:slug}', [CategoryController::class, 'show'])->name('categories.show');
Route::get('/api/categories/navigation', [CategoryController::class, 'getNavigation'])->name('api.categories.navigation');

// Order routes
Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
Route::get('/orders/success/{id}', [OrderController::class, 'success'])->name('orders.success');

// User account orders - requires authentication
Route::middleware(['auth'])->group(function () {
    Route::get('/user/orders', [OrderController::class, 'userIndex'])->name('user.orders.index');
    Route::get('/user/orders/{order}', [OrderController::class, 'userShow'])->name('user.orders.show');
});

// Debug route for storage
Route::get('/debug/storage', function() {
    $path = 'uploads/placeholder.jpg';
    if (Storage::disk('public')->exists($path)) {
        return "File exists at: " . Storage::disk('public')->path($path) . 
               "<br>URL: " . Storage::disk('public')->url($path) .
               "<br><img src='" . Storage::disk('public')->url($path) . "' style='max-width:300px'>";
    } else {
        return "File not found: " . $path;
    }
});

// Debug route for users data
Route::get('/debug/users-data', function() {
    $query = \App\Models\User::query();
    $users = $query->paginate(10)->withQueryString();
    
    return response()->json([
        'users' => $users,
        'structure' => [
            'has_data' => isset($users->data),
            'has_links' => isset($users->links),
            'has_current_page' => isset($users->current_page),
            'has_last_page' => isset($users->last_page),
        ]
    ]);
});

// Test route for Inertia rendering
Route::get('/admin/users/test', function() {
    return Inertia::render('admin/users/test');
});

// Simple test route for users
Route::get('/admin/users/simple', function() {
    $query = \App\Models\User::query();
    $users = $query->paginate(10)->withQueryString();
    
    // Map the user items to plain arrays to avoid the App\Models\User wrapper
    $userData = array_map(function($user) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }, $users->items());
    
    $usersData = [
        'data' => $userData,
        'links' => $users->linkCollection()->toArray(),
        'current_page' => $users->currentPage(),
        'last_page' => $users->lastPage(),
        'from' => $users->firstItem(),
        'to' => $users->lastItem(),
        'total' => $users->total(),
        'per_page' => $users->perPage(),
    ];
    
    return Inertia::render('admin/users/index', [
        'users' => $usersData,
        'filters' => []
    ]);
});

// Debug route for homepage sections
Route::get('/debug/homepage-sections', function() {
    $sections = \App\Models\HomepageSection::all();
    $formatted = $sections->map(function($section) {
        return [
            'id' => $section->id,
            'section_name' => $section->section_name,
            'title' => $section->title,
            'content' => $section->content,
            'is_active' => $section->is_active,
            'updated_at' => $section->updated_at->format('Y-m-d H:i:s')
        ];
    });
    return response()->json($formatted);
});

// Debug route for pricing section
Route::get('/debug/pricing-section', function() {
    $section = \App\Models\HomepageSection::where('section_name', 'pricing')->first();
    return response()->json([
        'section' => $section,
        'additional_data_type' => gettype($section->additional_data),
        'additional_data' => $section->additional_data,
    ]);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
