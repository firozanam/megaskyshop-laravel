<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class WishlistController extends Controller
{
    /**
     * Display the user's wishlist
     */
    public function index(): Response
    {
        $wishlistItems = Wishlist::where('user_id', Auth::id())
            ->with('product.images')
            ->get()
            ->map(function ($item) {
                $product = $item->product;
                return [
                    'id' => $item->id,
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'description' => $product->description,
                    'main_image' => $product->main_image,
                    'images' => $product->images,
                    'created_at' => $item->created_at,
                ];
            });

        return Inertia::render('Wishlist/Index', [
            'wishlistItems' => $wishlistItems,
        ]);
    }

    /**
     * Add a product to the wishlist
     */
    public function addToWishlist(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $wishlistItem = Wishlist::firstOrCreate([
            'user_id' => Auth::id(),
            'product_id' => $validated['product_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product added to wishlist',
            'wishlist_id' => $wishlistItem->id,
        ]);
    }

    /**
     * Remove a product from the wishlist
     */
    public function removeFromWishlist(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $deleted = Wishlist::where('user_id', Auth::id())
            ->where('product_id', $validated['product_id'])
            ->delete();

        return response()->json([
            'success' => $deleted > 0,
            'message' => $deleted > 0 ? 'Product removed from wishlist' : 'Product not found in wishlist',
        ]);
    }

    /**
     * Check if a product is in the user's wishlist
     */
    public function checkWishlist(Request $request): JsonResponse
    {
        $productId = $request->input('product_id');
        
        $exists = Wishlist::where('user_id', Auth::id())
            ->where('product_id', $productId)
            ->exists();

        return response()->json([
            'in_wishlist' => $exists,
        ]);
    }
}
