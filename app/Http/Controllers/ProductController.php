<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductMetaTag;
use App\Models\Review;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::query();
        
        // Filter by category if provided
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        // Search by product name only
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }
        
        // Sort by price, name, or newest
        if ($request->has('sort')) {
            switch ($request->sort) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'name_asc':
                    $query->orderBy('name', 'asc');
                    break;
                case 'name_desc':
                    $query->orderBy('name', 'desc');
                    break;
                case 'newest':
                    $query->orderBy('created_at', 'desc');
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }
        
        // Get products with images for display
        $products = $query->with(['images', 'category'])->paginate(12)->withQueryString();
        
        // Get categories for filter dropdown
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        
        // Log the data we're sending for debugging
        \Log::info('Products data for rendering:', [
            'count' => $products->count(),
            'total' => $products->total(),
            'first_product' => $products->first() ? $products->first()->name : 'None',
            'is_admin' => $request->is('admin/products*')
        ]);
        
        // Check if we're in the admin route
        if ($request->is('admin/products*')) {
            return Inertia::render('admin/products/index', [
                'products' => $products,
                'categories' => $categories,
                'filters' => $request->only(['search', 'category_id', 'sort'])
            ]);
        }
        
        // Public product listing
        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'sort'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        
        return Inertia::render('admin/products/create', [
            'categories' => $categories,
            'errors' => []
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'stock' => 'required|integer|min:0',
            'meta_description' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp,avif|max:2048',
            'meta_tags' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Get the category name from the category_id
        $categoryName = '';
        if ($request->category_id) {
            $category = Category::find($request->category_id);
            if ($category) {
                $categoryName = $category->name;
            }
        }
        
        // Create product
        $product = Product::create([
            'name' => $request->name,
            'price' => $request->price,
            'description' => $request->description,
            'category' => $categoryName, // Use the category name from the selected category_id
            'category_id' => $request->category_id,
            'stock' => $request->stock,
            'meta_description' => $request->meta_description,
            'meta_title' => $request->meta_title,
        ]);
        
        // Handle images
        if ($request->hasFile('images')) {
            $mainImageSet = false;
            
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('uploads', 'public');
                
                $productImage = new ProductImage([
                    'image_path' => $path,
                    'is_main' => !$mainImageSet, // First image will be the main image
                ]);
                
                $product->images()->save($productImage);
                
                // Set the first image as main
                if (!$mainImageSet) {
                    $product->update(['main_image' => $path]);
                    $mainImageSet = true;
                    \Log::info('Set first uploaded image as main', ['path' => $path]);
                }
            }
        }
        
        // Handle meta tags
        if ($request->has('meta_tags') && !empty($request->meta_tags)) {
            $tags = explode(',', $request->meta_tags);
            
            foreach ($tags as $tag) {
                $tag = trim($tag);
                if (!empty($tag)) {
                    $product->metaTags()->create(['tag' => $tag]);
                }
            }
        }
        
        return redirect()->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $product = Product::with(['images', 'metaTags', 'reviews.user', 'category'])->findOrFail($id);
        
        // Get related products based on category_id
        $relatedQuery = Product::where('id', '!=', $product->id);
        
        if ($product->category_id) {
            $relatedQuery->where('category_id', $product->category_id);
        }
        
        $relatedProducts = $relatedQuery->limit(4)->get();
        
        return Inertia::render('Products/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $product = Product::with(['images', 'metaTags', 'category'])->findOrFail($id);
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        
        return Inertia::render('admin/products/edit', [
            'product' => $product,
            'categories' => $categories
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Log the incoming request
        \Log::info('Product update request received', [
            'product_id' => $id,
            'request_data' => $request->except(['images']), // Don't log binary image data
            'has_images' => $request->hasFile('images'),
            'image_count' => $request->hasFile('images') ? count($request->file('images')) : 0,
            'image_keys' => array_keys($request->allFiles()),
            'method' => $request->method()
        ]);
        
        // Validate everything except images first
        $validator = Validator::make($request->except(['images']), [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'stock' => 'required|integer|min:0',
            'meta_description' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_tags' => 'nullable|string',
            'remove_images' => 'nullable|array',
            'main_image_id' => 'nullable|integer',
        ]);
        
        if ($validator->fails()) {
            \Log::error('Product update validation failed', [
                'product_id' => $id,
                'errors' => $validator->errors()->toArray()
            ]);
            
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Now validate images separately if present
        if ($request->hasFile('images')) {
            $imageValidator = Validator::make($request->allFiles(), [
                'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp,avif|max:2048',
            ]);
            
            if ($imageValidator->fails()) {
                \Log::error('Product image validation failed', [
                    'product_id' => $id,
                    'errors' => $imageValidator->errors()->toArray()
                ]);
                
                return redirect()->back()
                    ->withErrors($imageValidator)
                    ->withInput();
            }
        }
        
        try {
            $product = Product::findOrFail($id);
            
            // Get the category name from the category_id
            $categoryName = '';
            if ($request->category_id) {
                $category = Category::find($request->category_id);
                if ($category) {
                    $categoryName = $category->name;
                }
            }
            
            // Update product details
            $product->update([
                'name' => $request->name,
                'price' => $request->price,
                'description' => $request->description,
                'category' => $categoryName, // Use the category name from the selected category_id
                'category_id' => $request->category_id,
                'stock' => $request->stock,
                'meta_description' => $request->meta_description,
                'meta_title' => $request->meta_title,
            ]);
            
            \Log::info('Product details updated', ['product_id' => $id]);
            
            // Handle image removals
            if ($request->has('remove_images')) {
                \Log::info('Removing images', ['images' => $request->remove_images]);
                
                foreach ($request->remove_images as $imageId) {
                    $image = ProductImage::find($imageId);
                    if ($image && $image->product_id == $product->id) {
                        // Delete the file from storage
                        if (Storage::disk('public')->exists($image->image_path)) {
                            Storage::disk('public')->delete($image->image_path);
                        }
                        $image->delete();
                        \Log::info('Image removed', ['image_id' => $imageId]);
                    }
                }
            }
            
            // Handle new images
            if ($request->hasFile('images')) {
                $files = $request->file('images');
                \Log::info('Processing new images', [
                    'image_count' => count($files),
                    'image_types' => array_map(function($file) { 
                        return $file->getClientMimeType(); 
                    }, $files),
                    'set_first_as_main' => $request->has('set_first_as_main') ? 'true' : 'false'
                ]);
                
                $firstImage = null;
                
                foreach ($files as $index => $file) {
                    $path = $file->store('uploads', 'public');
                    \Log::info('Stored new image', ['path' => $path, 'index' => $index]);
                    
                    $productImage = $product->images()->create([
                        'image_path' => $path,
                        'is_main' => false,
                    ]);
                    
                    // Store the first image reference
                    if ($index === 0) {
                        $firstImage = $productImage;
                    }
                }
                
                // If set_first_as_main flag is set, make the first uploaded image the main one
                if ($request->has('set_first_as_main') && $firstImage) {
                    \Log::info('Setting first uploaded image as main', ['image_id' => $firstImage->id]);
                    
                    // Reset all images to not main
                    $product->images()->update(['is_main' => false]);
                    
                    // Set the first new image as main
                    $firstImage->update(['is_main' => true]);
                    $product->update(['main_image' => $firstImage->image_path]);
                }
            }
            
            // Set main image if specified (for existing images)
            if ($request->has('main_image_id') && $request->main_image_id && !$request->has('set_first_as_main')) {
                \Log::info('Setting existing image as main', ['main_image_id' => $request->main_image_id]);
                
                // Reset all images to not main
                $product->images()->update(['is_main' => false]);
                
                // Set the selected image as main
                $mainImage = ProductImage::find($request->main_image_id);
                if ($mainImage && $mainImage->product_id == $product->id) {
                    $mainImage->update(['is_main' => true]);
                    $product->update(['main_image' => $mainImage->image_path]);
                }
            }
            
            // Handle meta tags
            if ($request->has('meta_tags')) {
                \Log::info('Updating meta tags', ['meta_tags' => $request->meta_tags]);
                
                // Delete existing tags
                $product->metaTags()->delete();
                
                // Add new tags
                if ($request->meta_tags) {
                    $tags = explode(',', $request->meta_tags);
                    foreach ($tags as $tag) {
                        $tag = trim($tag);
                        if (!empty($tag)) {
                            $product->metaTags()->create(['tag' => $tag]);
                        }
                    }
                }
            }
            
            \Log::info('Product updated successfully', ['product_id' => $id]);
            
            return redirect()->route('admin.products.index')
                ->with('success', 'Product updated successfully.');
        } catch (\Exception $e) {
            \Log::error('Error updating product', [
                'product_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()
                ->with('error', 'An error occurred while updating the product: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);
        
        // Delete associated images from storage
        foreach ($product->images as $image) {
            if (Storage::disk('public')->exists($image->image_path)) {
                Storage::disk('public')->delete($image->image_path);
            }
        }
        
        // Delete the product (this will cascade delete related records)
        $product->delete();
        
        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }
    
    /**
     * Add a review to a product
     */
    public function addReview(Request $request, string $id)
    {
        // Check if user is authenticated
        if (!auth()->check()) {
            return redirect()->back()
                ->withErrors(['auth' => 'You must be logged in to write a review.'])
                ->withInput();
        }
        
        $product = Product::findOrFail($id);
        
        // Check if the user has purchased this product
        if (!$this->hasUserPurchasedProduct(auth()->id(), $product->id)) {
            return redirect()->back()
                ->withErrors(['purchase' => 'You can only review products you have purchased.'])
                ->withInput();
        }
        
        // Check if the user has already reviewed this product
        $existingReview = Review::where('product_id', $product->id)
            ->where('user_id', auth()->id())
            ->first();
            
        if ($existingReview) {
            return redirect()->back()
                ->withErrors(['existing' => 'You have already reviewed this product.'])
                ->withInput();
        }
        
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
            'name' => 'required_if:is_anonymous,true|string|max:255',
            'is_anonymous' => 'sometimes|boolean',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        $review = new Review([
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_anonymous' => $request->is_anonymous ?? false,
        ]);
        
        if ($request->is_anonymous) {
            $review->name = $request->name;
        } else {
            $review->user_id = auth()->id();
        }
        
        $product->reviews()->save($review);
        $product->updateAverageRating();
        
        return redirect()->back()->with('success', 'Review added successfully.');
    }
    
    /**
     * Check if a user has purchased a specific product
     */
    private function hasUserPurchasedProduct(int $userId, int $productId): bool
    {
        // Get completed orders for this user
        $completedOrders = \App\Models\Order::where('user_id', $userId)
            ->whereIn('status', ['Delivered', 'Shipped'])
            ->pluck('id');
            
        if ($completedOrders->isEmpty()) {
            return false;
        }
        
        // Check if any of these orders contain the product
        $purchaseCount = \App\Models\OrderItem::whereIn('order_id', $completedOrders)
            ->where('product_id', $productId)
            ->count();
            
        return $purchaseCount > 0;
    }

    /**
     * Display the admin dashboard with product statistics
     */
    public function adminDashboard()
    {
        $recentProducts = Product::with('images')
                                 ->orderBy('created_at', 'desc')
                                 ->take(3)
                                 ->get();
        
        $productCount = Product::count();
        
        return Inertia::render('admin/dashboard', [
            'recentProducts' => $recentProducts,
            'productCount' => $productCount
        ]);
    }

    /**
     * Export products as CSV
     */
    public function exportProducts(Request $request)
    {
        try {
            // Fetch all products with their categories
            $products = Product::with('category')->get();
            
            // Create CSV file
            $filename = 'products_export_' . date('Y-m-d_His') . '.csv';
            $headers = [
                'Content-type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename=' . $filename,
                'Pragma' => 'no-cache',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0',
            ];
            
            $handle = fopen('php://temp', 'r+');
            
            // Add CSV header row
            fputcsv($handle, [
                'ID',
                'Name',
                'Price',
                'Description',
                'Category',
                'Category ID',
                'Stock',
                'Meta Description',
                'Meta Title',
                'Main Image'
            ]);
            
            // Add data rows
            foreach ($products as $product) {
                fputcsv($handle, [
                    $product->id,
                    $product->name,
                    $product->price,
                    $product->description,
                    $product->category,
                    $product->category_id,
                    $product->stock,
                    $product->meta_description,
                    $product->meta_title,
                    $product->main_image
                ]);
            }
            
            rewind($handle);
            $csv = stream_get_contents($handle);
            fclose($handle);
            
            \Log::info('Products exported successfully', ['count' => $products->count()]);
            
            return response($csv, 200, $headers);
            
        } catch (\Exception $e) {
            \Log::error('Error exporting products', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('admin.products.index')
                ->with('error', 'An error occurred while exporting products: ' . $e->getMessage());
        }
    }
    
    /**
     * Import products from CSV
     */
    public function importProducts(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'csv_file' => 'required|file|mimes:csv,txt|max:10240',
            ]);
            
            if ($validator->fails()) {
                return redirect()->route('admin.products.index')
                    ->withErrors($validator)
                    ->with('error', 'Invalid file format. Please upload a CSV file.');
            }
            
            $file = $request->file('csv_file');
            $filePath = $file->getRealPath();
            
            // Parse CSV
            $csvData = array_map('str_getcsv', file($filePath));
            $headers = array_shift($csvData); // Remove and get headers
            
            // Validate headers
            $requiredHeaders = ['Name', 'Price', 'Category', 'Stock'];
            $missingHeaders = array_diff(array_map('strtolower', $requiredHeaders), array_map('strtolower', $headers));
            
            if (!empty($missingHeaders)) {
                return redirect()->route('admin.products.index')
                    ->with('error', 'CSV file is missing required columns: ' . implode(', ', $missingHeaders));
            }
            
            // Map column names to indexes
            $columnMap = array_flip(array_map('strtolower', $headers));
            
            // Process rows
            $imported = 0;
            $updated = 0;
            $errors = 0;
            
            foreach ($csvData as $row) {
                // Skip empty rows
                if (empty($row) || count(array_filter($row)) === 0) {
                    continue;
                }
                
                // Extract data using the column map
                $productData = [
                    'name' => $row[$columnMap['name']] ?? null,
                    'price' => $row[$columnMap['price']] ?? null,
                    'description' => $row[$columnMap['description']] ?? null,
                    'category' => $row[$columnMap['category']] ?? null,
                    'category_id' => $row[$columnMap['category id']] ?? null,
                    'stock' => $row[$columnMap['stock']] ?? null,
                    'meta_description' => $row[$columnMap['meta description']] ?? null,
                    'meta_title' => $row[$columnMap['meta title']] ?? null,
                    'main_image' => $row[$columnMap['main image']] ?? null,
                ];
                
                // Check for required fields
                if (empty($productData['name']) || !isset($productData['price']) || !isset($productData['stock'])) {
                    $errors++;
                    continue;
                }
                
                // If we have an ID column, try to update the existing product
                $productId = isset($columnMap['id']) ? $row[$columnMap['id']] : null;
                
                if ($productId) {
                    // Try to find and update an existing product
                    $product = Product::find($productId);
                    
                    if ($product) {
                        $product->update($productData);
                        $updated++;
                        continue;
                    }
                }
                
                // Create a new product
                Product::create($productData);
                $imported++;
            }
            
            \Log::info('Products imported successfully', [
                'imported' => $imported,
                'updated' => $updated,
                'errors' => $errors
            ]);
            
            $message = "Import completed: {$imported} products created";
            if ($updated > 0) {
                $message .= ", {$updated} products updated";
            }
            if ($errors > 0) {
                $message .= ", {$errors} rows skipped due to errors";
            }
            
            return redirect()->route('admin.products.index')
                ->with('success', $message);
                
        } catch (\Exception $e) {
            \Log::error('Error importing products', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('admin.products.index')
                ->with('error', 'An error occurred while importing products: ' . $e->getMessage());
        }
    }
}
