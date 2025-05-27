<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the user dashboard with relevant data.
     */
    public function index()
    {
        // Get the authenticated user
        $user = Auth::user();
        
        // Get recent orders for the user
        $recentOrders = Order::with(['items', 'tracking'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        
        // Get recently viewed products (for now, just get the latest products as a placeholder)
        // In a real implementation, you'd track and fetch the user's recently viewed products
        $recentlyViewedProducts = Product::with('category')
            ->orderBy('created_at', 'desc')
            ->take(4)
            ->get()
            ->map(function ($product) {
                // Rename the category relationship to match the TypeScript interface
                if ($product->category) {
                    $product->category_obj = $product->category;
                    unset($product->category);
                }
                return $product;
            });
        
        return Inertia::render('dashboard', [
            'recentOrders' => $recentOrders,
            'recentlyViewedProducts' => $recentlyViewedProducts,
        ]);
    }
} 