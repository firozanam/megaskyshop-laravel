<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::with('parent')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'parent_name' => $category->parent ? $category->parent->name : null,
                    'parent_id' => $category->parent_id,
                    'path' => $category->path,
                    'image_path' => $category->image_path,
                    'is_active' => $category->is_active,
                    'product_count' => $category->products()->count(),
                    'created_at' => $category->created_at,
                ];
            });

        return Inertia::render('admin/categories/index', [
            'categories' => $categories
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $parentCategories = Category::orderBy('name')->get(['id', 'name', 'parent_id']);
        
        return Inertia::render('admin/categories/create', [
            'parentCategories' => $parentCategories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,avif|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Generate slug if not provided
        $slug = $request->slug ?? Str::slug($request->name);
        
        // Handle image upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('categories', 'public');
        }
        
        // Create category
        $category = Category::create([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'parent_id' => $request->parent_id,
            'image_path' => $imagePath,
            'is_active' => $request->is_active ?? true,
            'sort_order' => $request->sort_order ?? 0,
        ]);
        
        return redirect()->route('admin.categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        $category->load('parent', 'children');
        $products = $category->products()->with('images')->paginate(12);
        
        return Inertia::render('categories/show', [
            'category' => $category,
            'products' => $products,
            'breadcrumb' => $category->ancestors()->pluck('name', 'slug')->put($category->slug, $category->name),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        $parentCategories = Category::where('id', '!=', $category->id)
            ->whereNotIn('id', $category->descendants()->pluck('id'))
            ->orderBy('name')
            ->get(['id', 'name', 'parent_id']);
        
        return Inertia::render('admin/categories/edit', [
            'category' => $category,
            'parentCategories' => $parentCategories
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug,' . $category->id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,avif|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Check if parent_id would create a circular reference
        if ($request->parent_id && $request->parent_id == $category->id) {
            return redirect()->back()
                ->withErrors(['parent_id' => 'A category cannot be its own parent.'])
                ->withInput();
        }
        
        if ($request->parent_id) {
            $parent = Category::find($request->parent_id);
            if ($parent && $parent->isChildOf($category)) {
                return redirect()->back()
                    ->withErrors(['parent_id' => 'Cannot set a descendant as parent (circular reference).'])
                    ->withInput();
            }
        }
        
        // Generate slug if not provided
        $slug = $request->slug ?? Str::slug($request->name);
        
        // Handle image upload
        $imagePath = $category->image_path;
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($category->image_path && Storage::disk('public')->exists($category->image_path)) {
                Storage::disk('public')->delete($category->image_path);
            }
            $imagePath = $request->file('image')->store('categories', 'public');
        }
        
        // Update category
        $category->update([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'parent_id' => $request->parent_id,
            'image_path' => $imagePath,
            'is_active' => $request->is_active ?? $category->is_active,
            'sort_order' => $request->sort_order ?? $category->sort_order,
        ]);
        
        return redirect()->route('admin.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Check if category has products
        $productCount = $category->products()->count();
        if ($productCount > 0) {
            return redirect()->back()
                ->with('error', "Cannot delete category with {$productCount} products. Reassign products first.");
        }
        
        // Check if category has children
        if ($category->children()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete category with subcategories. Delete or reassign subcategories first.');
        }
        
        // Delete image if exists
        if ($category->image_path && Storage::disk('public')->exists($category->image_path)) {
            Storage::disk('public')->delete($category->image_path);
        }
        
        $category->delete();
        
        return redirect()->route('admin.categories.index')
            ->with('success', 'Category deleted successfully.');
    }
    
    /**
     * Get a hierarchical list of categories for navigation
     */
    public function getNavigation()
    {
        $categories = Category::where('is_active', true)
            ->whereNull('parent_id')
            ->with(['children' => function ($query) {
                $query->where('is_active', true)->orderBy('sort_order')->orderBy('name');
            }])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
            
        return response()->json($categories);
    }
}
