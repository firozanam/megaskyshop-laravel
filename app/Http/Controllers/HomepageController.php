<?php

namespace App\Http\Controllers;

use App\Models\FeaturedProduct;
use App\Models\HomepageSection;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HomepageController extends Controller
{
    /**
     * Display the homepage.
     */
    public function index()
    {
        // Get all active sections
        $sections = HomepageSection::getAllActive()->keyBy('section_name');
        
        // Process the benefits section to ensure proper data structure
        if (isset($sections['benefits'])) {
            $benefitsSection = $sections['benefits'];
            
            // Debug the benefits data structure
            Log::info('Benefits section data:', [
                'additional_data_type' => gettype($benefitsSection->additional_data),
                'additional_data_raw' => $benefitsSection->additional_data,
            ]);
            
            // Ensure the additional_data is properly decoded
            if (is_string($benefitsSection->additional_data)) {
                try {
                    $decodedData = json_decode($benefitsSection->additional_data, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $benefitsSection->additional_data = $decodedData;
                        Log::info('Successfully decoded benefits data', [
                            'decoded_data' => $decodedData,
                            'benefits_count' => isset($decodedData['benefits']) ? count($decodedData['benefits']) : 0,
                        ]);
                    } else {
                        Log::error('Failed to decode benefits data: ' . json_last_error_msg());
                    }
                } catch (\Exception $e) {
                    Log::error('Exception decoding benefits data: ' . $e->getMessage());
                }
            } else if (is_array($benefitsSection->additional_data)) {
                Log::info('Benefits data is already an array', [
                    'benefits_count' => isset($benefitsSection->additional_data['benefits']) ? 
                        count($benefitsSection->additional_data['benefits']) : 0,
                ]);
            }
        }
        
        // Get featured products for the featured products section
        $featuredProducts = FeaturedProduct::getAllActive()->map(function($featuredProduct) {
            return $featuredProduct->product;
        });
        
        // Get all products for the order form section
        $allProducts = Product::orderBy('name')->get();
        
        // Get default product ID for order form if exists
        $defaultProductId = null;
        if (isset($sections['order_form']) && !empty($sections['order_form']->additional_data)) {
            $orderFormData = $sections['order_form']->additional_data;
            if (is_string($orderFormData)) {
                try {
                    $decodedData = json_decode($orderFormData, true);
                    if (json_last_error() === JSON_ERROR_NONE && isset($decodedData['default_product_id'])) {
                        $defaultProductId = $decodedData['default_product_id'];
                    }
                } catch (\Exception $e) {
                    Log::error('Exception decoding order form data: ' . $e->getMessage());
                }
            } else if (is_array($orderFormData) && isset($orderFormData['default_product_id'])) {
                $defaultProductId = $orderFormData['default_product_id'];
            }
        }
        
        return Inertia::render('welcome', [
            'sections' => $sections,
            'featuredProducts' => $featuredProducts,
            'allProducts' => $allProducts,
            'defaultProductId' => $defaultProductId,
        ]);
    }
    
    /**
     * Display the admin homepage sections management page.
     */
    public function adminIndex()
    {
        $sections = HomepageSection::orderBy('sort_order')->get();
        
        return Inertia::render('admin/homepage/index', [
            'sections' => $sections,
        ]);
    }
    
    /**
     * Show the form for editing a homepage section.
     */
    public function editSection($id)
    {
        $section = HomepageSection::findOrFail($id);
        
        // If this is the order_form section, get products data
        if ($section->section_name === 'order_form') {
            // Get all products, not just featured products
            $products = Product::orderBy('name')->get();
                
            // Get default product ID from additional_data if it exists
            $defaultProductId = null;
            if (!empty($section->additional_data) && isset($section->additional_data['default_product_id'])) {
                $defaultProductId = $section->additional_data['default_product_id'];
            }
                
            return Inertia::render('admin/homepage/edit', [
                'section' => $section,
                'products' => $products,
                'defaultProductId' => $defaultProductId,
            ]);
        }
        
        return Inertia::render('admin/homepage/edit', [
            'section' => $section,
        ]);
    }
    
    /**
     * Update the specified homepage section.
     */
    public function updateSection(Request $request, $id)
    {
        $section = HomepageSection::findOrFail($id);
        
        // Debug incoming request data
        Log::info('Updating section: ' . $section->section_name, [
            'request_data' => $request->all(),
            'section_id' => $id
        ]);
        
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string',
            'content' => 'nullable|string',
            'button_text' => 'nullable|string|max:255',
            'button_url' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'additional_data' => 'nullable', // Changed from 'nullable|json' to allow any format
        ]);
        
        // Debug validated data
        Log::info('Validated data for section: ' . $section->section_name, [
            'validated_data' => $validated
        ]);
        
        // Handle image upload if provided
        if ($request->hasFile('image')) {
            $request->validate([
                'image' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);
            
            // Delete old image if exists
            if ($section->image_path && Storage::disk('public')->exists($section->image_path)) {
                Storage::disk('public')->delete($section->image_path);
            }
            
            // Store new image
            $path = $request->file('image')->store('uploads/homepage', 'public');
            $validated['image_path'] = $path;
        }
        
        // Convert additional_data to JSON string if it's an array
        if (is_array($validated['additional_data'] ?? null)) {
            $validated['additional_data'] = json_encode($validated['additional_data']);
        }
        
        // Perform the update
        $updated = $section->update($validated);
        
        // Debug the update result
        Log::info('Section update result', [
            'section_id' => $id,
            'section_name' => $section->section_name,
            'updated' => $updated,
            'new_content' => $section->content
        ]);
        
        return redirect()->route('admin.homepage.index')
            ->with('success', 'Section updated successfully.');
    }
    
    /**
     * Display the featured products management page.
     */
    public function featuredProductsIndex()
    {
        $featuredProducts = FeaturedProduct::with('product')
            ->orderBy('sort_order')
            ->get();
        
        $products = Product::whereNotIn('id', $featuredProducts->pluck('product_id'))
            ->get();
        
        return Inertia::render('admin/homepage/featured-products', [
            'featuredProducts' => $featuredProducts,
            'availableProducts' => $products,
        ]);
    }
    
    /**
     * Add a product to featured products.
     */
    public function addFeaturedProduct(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'sort_order' => 'integer',
        ]);
        
        // Check if product is already featured
        $exists = FeaturedProduct::where('product_id', $validated['product_id'])->exists();
        
        if ($exists) {
            return redirect()->back()
                ->with('error', 'Product is already featured.');
        }
        
        FeaturedProduct::create([
            'product_id' => $validated['product_id'],
            'sort_order' => $validated['sort_order'] ?? FeaturedProduct::max('sort_order') + 1,
            'is_active' => true,
        ]);
        
        return redirect()->back()
            ->with('success', 'Product added to featured products.');
    }
    
    /**
     * Remove a product from featured products.
     */
    public function removeFeaturedProduct($id)
    {
        $featuredProduct = FeaturedProduct::findOrFail($id);
        $featuredProduct->delete();
        
        return redirect()->back()
            ->with('success', 'Product removed from featured products.');
    }
    
    /**
     * Update featured product order.
     */
    public function updateFeaturedProductOrder(Request $request)
    {
        $validated = $request->validate([
            'products' => 'required|array',
            'products.*.id' => 'required|exists:featured_products,id',
            'products.*.sort_order' => 'required|integer',
        ]);
        
        foreach ($validated['products'] as $product) {
            FeaturedProduct::where('id', $product['id'])
                ->update(['sort_order' => $product['sort_order']]);
        }
        
        return redirect()->back()
            ->with('success', 'Product order updated.');
    }
    
    /**
     * Toggle featured product active status.
     */
    public function toggleFeaturedProductStatus($id)
    {
        $featuredProduct = FeaturedProduct::findOrFail($id);
        $featuredProduct->is_active = !$featuredProduct->is_active;
        $featuredProduct->save();
        
        return redirect()->back()
            ->with('success', 'Product status updated.');
    }
} 