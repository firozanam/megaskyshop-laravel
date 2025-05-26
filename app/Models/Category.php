<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'parent_id',
        'image_path',
        'is_active',
        'sort_order',
    ];

    /**
     * Boot method to set the slug from the name
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (!$category->slug) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    /**
     * Get the products in this category
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get the parent category
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * Get the child categories
     */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    /**
     * Get all ancestor categories
     */
    public function ancestors()
    {
        $ancestors = collect([]);
        $category = $this->parent;

        while ($category) {
            $ancestors->push($category);
            $category = $category->parent;
        }

        return $ancestors->reverse();
    }

    /**
     * Get all descendant categories
     */
    public function descendants()
    {
        $descendants = collect([]);
        
        foreach ($this->children as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge($child->descendants());
        }
        
        return $descendants;
    }

    /**
     * Check if this category is a child of another category
     */
    public function isChildOf(Category $parent): bool
    {
        return $this->parent_id === $parent->id || 
               ($this->parent && $this->parent->isChildOf($parent));
    }

    /**
     * Get the full path of the category (breadcrumb)
     */
    public function getPathAttribute(): string
    {
        $path = $this->ancestors()->pluck('name')->push($this->name)->implode(' > ');
        return $path;
    }
}
