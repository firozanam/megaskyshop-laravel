<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name',
        'price',
        'description',
        'category',
        'category_id',
        'stock',
        'main_image',
        'avg_rating',
        'meta_description',
        'meta_title',
    ];

    /**
     * Get the category that owns the product
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get all images for the product
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    /**
     * Get all meta tags for the product
     */
    public function metaTags(): HasMany
    {
        return $this->hasMany(ProductMetaTag::class);
    }

    /**
     * Get all reviews for the product
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the main image for the product
     */
    public function getMainImageAttribute($value)
    {
        if ($value) {
            return $value;
        }
        
        $mainImage = $this->images()->where('is_main', true)->first();
        return $mainImage ? $mainImage->image_path : null;
    }

    /**
     * Update average rating when reviews are added or updated
     */
    public function updateAverageRating()
    {
        $avgRating = $this->reviews()->avg('rating') ?: 0;
        $this->update(['avg_rating' => $avgRating]);
    }
}
