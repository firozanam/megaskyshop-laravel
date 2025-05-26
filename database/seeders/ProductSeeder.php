<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductMetaTag;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear previous products if any
        $this->command->info('Clearing existing products...');
        Product::truncate();
        ProductImage::truncate();
        ProductMetaTag::truncate();
        Review::truncate();
        
        $csvFile = storage_path('app/public/megaskyshop.products.csv');
        
        // If the CSV file doesn't exist in the storage, copy it from the docs directory
        if (!File::exists($csvFile)) {
            $sourceFile = base_path('docs/megaskyshop.products.csv');
            if (File::exists($sourceFile)) {
                File::copy($sourceFile, $csvFile);
                $this->command->info('CSV file copied to storage.');
            } else {
                $this->command->error('CSV file not found in docs directory!');
                return;
            }
        }
        
        // Read CSV file
        $file = fopen($csvFile, 'r');
        
        // Read header row
        $headers = fgetcsv($file);
        $this->command->info('Processing CSV file with headers: ' . implode(', ', $headers));
        
        // Process each row
        $count = 0;
        while (($row = fgetcsv($file)) !== false) {
            $data = array_combine($headers, $row);
            
            // Set placeholder image path
            $imagePath = 'uploads/placeholder.jpg';
            
            // Create product
            $product = Product::create([
                'name' => $data['name'] ?? 'Unnamed Product',
                'price' => (float) ($data['price'] ?? 0),
                'description' => $data['description'] ?? '',
                'category' => $data['category'] ?? 'Uncategorized',
                'stock' => (int) ($data['stock'] ?? 0),
                'main_image' => $imagePath,
                'avg_rating' => (float) ($data['avgRating'] ?? 0),
                'meta_description' => $data['metaDescription'] ?? '',
                'meta_title' => $data['metaTitle'] ?? $data['name'] ?? 'Unnamed Product',
                'created_at' => !empty($data['createdAt']) ? date('Y-m-d H:i:s', strtotime($data['createdAt'])) : now(),
                'updated_at' => !empty($data['updatedAt']) ? date('Y-m-d H:i:s', strtotime($data['updatedAt'])) : now(),
            ]);
            
            // Add main image to product_images table
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $imagePath,
                'is_main' => true,
            ]);
            
            // Process meta tags
            $this->processMetaTags($data, $product);
            
            // Process review if it exists
            if (!empty($data['reviews[0]._id'])) {
                Review::create([
                    'product_id' => $product->id,
                    'user_id' => null, // We don't have user IDs in our system yet
                    'name' => $data['reviews[0].name'] ?? 'Anonymous',
                    'rating' => (int) ($data['reviews[0].rating'] ?? 5),
                    'comment' => $data['reviews[0].comment'] ?? '',
                    'is_anonymous' => (bool) ($data['reviews[0].isAnonymous'] ?? false),
                    'created_at' => !empty($data['reviews[0].createdAt']) ? date('Y-m-d H:i:s', strtotime($data['reviews[0].createdAt'])) : now(),
                    'updated_at' => now(),
                ]);
            }
            
            $count++;
            $this->command->info("Seeded product #{$count}: {$product->name}");
        }
        
        fclose($file);
        $this->command->info("Seeding completed! {$count} products imported.");
        
        // Ensure the placeholder image exists in storage
        $this->ensurePlaceholderImage();
    }
    
    /**
     * Process meta tags from CSV data
     */
    private function processMetaTags($data, $product)
    {
        // Process meta tags based on column names
        foreach ($data as $key => $value) {
            if (strpos($key, 'metaTags') === 0 && !empty($value)) {
                ProductMetaTag::create([
                    'product_id' => $product->id,
                    'tag' => $value,
                ]);
            }
        }
    }
    
    /**
     * Ensure placeholder image exists in storage
     */
    private function ensurePlaceholderImage()
    {
        $storagePath = storage_path('app/public/uploads/placeholder.jpg');
        
        // Check if placeholder already exists
        if (!File::exists($storagePath)) {
            // Ensure the uploads directory exists
            if (!Storage::disk('public')->exists('uploads')) {
                Storage::disk('public')->makeDirectory('uploads');
            }
            
            // Copy from public if it exists
            $publicPath = public_path('uploads/placeholder.jpg');
            if (File::exists($publicPath)) {
                File::copy($publicPath, $storagePath);
                $this->command->info('Placeholder image copied to storage.');
            } else {
                // Create an empty file if no source exists
                File::put($storagePath, '');
                $this->command->info('Empty placeholder image created.');
            }
        }
    }
}
