<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductMetaTag extends Model
{
    protected $fillable = [
        'product_id',
        'tag',
    ];

    /**
     * Get the product that owns the meta tag
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
