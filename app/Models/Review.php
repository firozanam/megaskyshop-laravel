<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'product_id',
        'user_id',
        'name',
        'rating',
        'comment',
        'is_anonymous',
    ];

    /**
     * Get the product that owns the review
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the user that owns the review
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Update the product's average rating after saving a review
     */
    protected static function booted()
    {
        static::saved(function ($review) {
            $review->product->updateAverageRating();
        });

        static::deleted(function ($review) {
            $review->product->updateAverageRating();
        });
    }
}
