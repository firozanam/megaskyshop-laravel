<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class HomepageSection extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'section_name',
        'title',
        'subtitle',
        'content',
        'image_path',
        'button_text',
        'button_url',
        'is_active',
        'sort_order',
        'additional_data',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'additional_data' => 'array',
    ];

    /**
     * Get sections by name.
     *
     * @param string $name
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public static function getByName(string $name)
    {
        return self::where('section_name', $name)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Get all active sections ordered by sort_order.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getAllActive()
    {
        $sections = self::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
            
        // Log the benefits section additional_data if it exists
        $benefitsSection = $sections->firstWhere('section_name', 'benefits');
        if ($benefitsSection) {
            Log::info('Benefits section from model:', [
                'additional_data_type' => gettype($benefitsSection->additional_data),
                'additional_data' => $benefitsSection->additional_data
            ]);
        }
        
        return $sections;
    }
} 