<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReportController;
use App\Http\Middleware\CheckRole;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\HomepageController;
use App\Http\Controllers\AdminCustomerController;
use App\Http\Controllers\WishlistController;

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
Route::get('/debug/middleware-test', function () {
    return response()->json([
        'success' => true,
        'message' => 'Successfully passed through middleware',
        'user' => auth()->check() ? auth()->user()->email : 'Not authenticated'
    ]);
})->middleware(['auth', 'role:admin'])->name('debug.middleware-test');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    // Admin dashboard with product data
    Route::get('/admin', [ProductController::class, 'adminDashboard'])->name('admin.dashboard');
    Route::get('/admin/dashboard', [ProductController::class, 'adminDashboard'])->name('admin.dashboard.index');
    
    // Admin reports page
    Route::get('/admin/reports', [ReportController::class, 'index'])->name('admin.reports');
    
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
    
    // Admin customer management routes
    Route::get('admin/customers', [AdminCustomerController::class, 'index'])->name('admin.customers.index');
    Route::get('admin/customers/{id}', [AdminCustomerController::class, 'show'])->name('admin.customers.show');
    
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
    
    // File Manager routes
    Route::get('/admin/filemanager', [App\Http\Controllers\Admin\FileManagerController::class, 'index'])->name('admin.filemanager');
    Route::post('/admin/filemanager/upload', [App\Http\Controllers\Admin\FileManagerController::class, 'upload'])->name('admin.filemanager.upload');
    Route::delete('/admin/filemanager/destroy', [App\Http\Controllers\Admin\FileManagerController::class, 'destroy'])->name('admin.filemanager.destroy');
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
    
    // Wishlist routes
    Route::get('/user/wishlist', [WishlistController::class, 'index'])->name('user.wishlist.index');
    Route::post('/user/wishlist/add', [WishlistController::class, 'addToWishlist'])->name('user.wishlist.add');
    Route::delete('/user/wishlist/remove', [WishlistController::class, 'removeFromWishlist'])->name('user.wishlist.remove');
    Route::get('/user/wishlist/check', [WishlistController::class, 'checkWishlist'])->name('user.wishlist.check');
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

// Debug route for reports data
Route::get('/debug/reports-data', function() {
    $days = 30;
    $controller = new \App\Http\Controllers\ReportController();
    $reflectionMethod = new \ReflectionMethod($controller, 'index');
    $reflectionMethod->setAccessible(true);
    
    $request = new \Illuminate\Http\Request();
    $request->merge(['days' => $days]);
    
    $result = $reflectionMethod->invoke($controller, $request);
    
    // Extract the data props
    $data = $result->getData()['props'];
    
    return response()->json([
        'data' => $data,
        'orderTrend_sample' => array_slice($data['orderTrend'] ?? [], 0, 3),
        'revenueTrend_sample' => array_slice($data['revenueTrend'] ?? [], 0, 3),
        'topSellingProducts_sample' => array_slice($data['topSellingProducts'] ?? [], 0, 3)
    ]);
});

// Debug endpoint for ReportController data
Route::get('/debug/report-data', function() {
    $controller = new \App\Http\Controllers\ReportController();
    
    try {
        // Get the data directly from controller methods
        $days = 30;
        $cutoffDate = \Carbon\Carbon::now()->subDays($days)->startOfDay();
        
        // Get stats for the specified time period
        $totalUsers = \App\Models\User::count();
        $totalProducts = \App\Models\Product::count();
        $totalOrders = \App\Models\Order::where('created_at', '>=', $cutoffDate)->count();
        $totalRevenue = \App\Models\Order::where('created_at', '>=', $cutoffDate)->sum('total') ?? 0;
        
        // Get trend data using controller's methods
        $orderTrend = $controller->getOrderTrend($days);
        $revenueTrend = $controller->getRevenueTrend($days);
        
        // Get top selling products data
        $topSellingProducts = \Illuminate\Support\Facades\DB::table('order_items')
            ->select('products.name', \Illuminate\Support\Facades\DB::raw('SUM(order_items.quantity) as sales'))
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.created_at', '>=', $cutoffDate)
            ->groupBy('products.id', 'products.name')
            ->orderBy('sales', 'desc')
            ->limit(5)
            ->get();
        
        return response()->json([
            'status' => 'success',
            'summary' => [
                'totalUsers' => $totalUsers,
                'totalProducts' => $totalProducts,
                'totalOrders' => $totalOrders,
                'totalRevenue' => $totalRevenue,
            ],
            'orderTrend_sample' => array_slice($orderTrend, 0, 3),
            'revenueTrend_sample' => array_slice($revenueTrend, 0, 3),
            'topSellingProducts_sample' => array_slice(json_decode(json_encode($topSellingProducts), true), 0, 3),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Special debug route for Reports component rendering
Route::get('/debug/reports-component', function() {
    $days = 30;
    $controller = new \App\Http\Controllers\ReportController();
    
    // Get the data directly from controller methods
    $totalUsers = \App\Models\User::count();
    $totalProducts = \App\Models\Product::count();
    $cutoffDate = \Carbon\Carbon::now()->subDays($days)->startOfDay();
    $totalOrders = \App\Models\Order::where('created_at', '>=', $cutoffDate)->count();
    $totalRevenue = \App\Models\Order::where('created_at', '>=', $cutoffDate)->sum('total') ?? 0;
    
    // Get trend data
    $orderTrend = $controller->getOrderTrend($days);
    $revenueTrend = $controller->getRevenueTrend($days);
    
    // Get top selling products data
    $topSellingProducts = \Illuminate\Support\Facades\DB::table('order_items')
        ->select('products.name', \Illuminate\Support\Facades\DB::raw('SUM(order_items.quantity) as sales'))
        ->join('products', 'order_items.product_id', '=', 'products.id')
        ->join('orders', 'order_items.order_id', '=', 'orders.id')
        ->where('orders.created_at', '>=', $cutoffDate)
        ->groupBy('products.id', 'products.name')
        ->orderBy('sales', 'desc')
        ->limit(5)
        ->get();
    
    return \Inertia\Inertia::render('admin/reports', [
        'totalUsers' => $totalUsers,
        'totalProducts' => $totalProducts,
        'totalOrders' => $totalOrders,
        'totalRevenue' => $totalRevenue,
        'topSellingProducts' => $topSellingProducts,
        'orderTrend' => $orderTrend,
        'revenueTrend' => $revenueTrend,
        'timeRange' => (string) $days,
    ]);
})->middleware(['web']);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
