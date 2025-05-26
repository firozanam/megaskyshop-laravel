<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define main categories
        $mainCategories = [
            [
                'name' => 'Magic Condom',
                'description' => 'Magic condom products',
                'children' => [
                    ['name' => 'Dragon Magic Condom', 'description' => 'Dragon style magic condoms'],
                    ['name' => 'Dotted Magic Condom', 'description' => 'Dotted magic condoms'],
                    ['name' => 'Spike Magic Condom', 'description' => 'Spike style magic condoms'],
                ]
            ],
            [
                'name' => 'Love Toy Condom',
                'description' => 'Love toy condom products',
                'children' => [
                    ['name' => 'Super Love Toy', 'description' => 'Super love toy condoms'],
                    ['name' => 'Mini Love Toy', 'description' => 'Mini love toy condoms'],
                ]
            ],
            [
                'name' => 'Lock Love Condom',
                'description' => 'Lock love condom products',
                'children' => [
                    ['name' => 'Big Lock Love', 'description' => 'Big lock love condoms'],
                    ['name' => 'Lock Love with Vibrator', 'description' => 'Lock love condoms with vibrator'],
                ]
            ],
            [
                'name' => 'Dragon Condom',
                'description' => 'Dragon condom products',
                'children' => [
                    ['name' => 'Crystal Clear Dragon', 'description' => 'Crystal clear dragon condoms'],
                    ['name' => 'Gripped Style Dragon', 'description' => 'Gripped style dragon condoms'],
                    ['name' => 'Realistic Dragon', 'description' => 'Realistic dragon condoms'],
                ]
            ],
            [
                'name' => 'Toy Condom',
                'description' => 'Toy condom products',
                'children' => [
                    ['name' => 'Sunny Toy', 'description' => 'Sunny toy condoms'],
                    ['name' => 'Big Sunny Toy', 'description' => 'Big sunny toy condoms'],
                ]
            ],
            [
                'name' => 'Electronics',
                'description' => 'Electronic devices and accessories',
                'children' => [
                    ['name' => 'Smartphones', 'description' => 'Mobile phones and accessories'],
                    ['name' => 'Laptops', 'description' => 'Notebook computers and accessories'],
                    ['name' => 'Tablets', 'description' => 'Tablet computers and accessories'],
                    ['name' => 'Audio', 'description' => 'Headphones, speakers and audio equipment'],
                ]
            ],
            [
                'name' => 'Fashion',
                'description' => 'Clothing, shoes and accessories',
                'children' => [
                    ['name' => 'Men\'s Clothing', 'description' => 'Shirts, pants, and outerwear for men'],
                    ['name' => 'Women\'s Clothing', 'description' => 'Dresses, tops, and outerwear for women'],
                    ['name' => 'Shoes', 'description' => 'Footwear for men and women'],
                    ['name' => 'Accessories', 'description' => 'Bags, jewelry, and other accessories'],
                ]
            ],
            [
                'name' => 'Home & Garden',
                'description' => 'Products for home and garden',
                'children' => [
                    ['name' => 'Furniture', 'description' => 'Sofas, tables, chairs and other furniture'],
                    ['name' => 'Kitchen', 'description' => 'Kitchen appliances and accessories'],
                    ['name' => 'Bedding', 'description' => 'Sheets, pillows, and other bedding items'],
                    ['name' => 'Garden', 'description' => 'Garden tools and accessories'],
                ]
            ],
            [
                'name' => 'Books & Media',
                'description' => 'Books, movies, music and more',
                'children' => [
                    ['name' => 'Books', 'description' => 'Printed books and ebooks'],
                    ['name' => 'Movies', 'description' => 'DVDs, Blu-rays and digital movies'],
                    ['name' => 'Music', 'description' => 'CDs, vinyl records and digital music'],
                    ['name' => 'Video Games', 'description' => 'Console and PC games'],
                ]
            ],
            [
                'name' => 'Sports & Outdoors',
                'description' => 'Sporting goods and outdoor equipment',
                'children' => [
                    ['name' => 'Exercise Equipment', 'description' => 'Fitness and workout equipment'],
                    ['name' => 'Outdoor Recreation', 'description' => 'Camping, hiking and outdoor activities'],
                    ['name' => 'Sports Gear', 'description' => 'Equipment for various sports'],
                ]
            ],
        ];
        
        // Create categories
        $categoryMap = [];
        
        foreach ($mainCategories as $mainCategory) {
            $parent = Category::create([
                'name' => $mainCategory['name'],
                'slug' => Str::slug($mainCategory['name']),
                'description' => $mainCategory['description'],
                'is_active' => true,
            ]);
            
            $categoryMap[$mainCategory['name']] = $parent->id;
            
            // Create child categories
            if (isset($mainCategory['children'])) {
                foreach ($mainCategory['children'] as $index => $childCategory) {
                    $child = Category::create([
                        'name' => $childCategory['name'],
                        'slug' => Str::slug($childCategory['name']),
                        'description' => $childCategory['description'],
                        'parent_id' => $parent->id,
                        'is_active' => true,
                        'sort_order' => $index,
                    ]);
                    
                    $categoryMap[$childCategory['name']] = $child->id;
                }
            }
        }
        
        // Map existing product categories to new category IDs
        $categoryMapping = [
            // New category mappings
            'Magic Condom' => $categoryMap['Magic Condom'],
            'Dragon Magic Condom' => $categoryMap['Dragon Magic Condom'],
            'Dotted Magic Condom' => $categoryMap['Dotted Magic Condom'],
            'Spike Magic Condom' => $categoryMap['Spike Magic Condom'],
            'Love Toy Condom' => $categoryMap['Love Toy Condom'],
            'Super Love Toy' => $categoryMap['Super Love Toy'],
            'Mini Love Toy' => $categoryMap['Mini Love Toy'],
            'Lock Love Condom' => $categoryMap['Lock Love Condom'],
            'Big Lock Love' => $categoryMap['Big Lock Love'],
            'Lock Love with Vibrator' => $categoryMap['Lock Love with Vibrator'],
            'Dragon Condom' => $categoryMap['Dragon Condom'],
            'Crystal Clear Dragon' => $categoryMap['Crystal Clear Dragon'],
            'Gripped Style Dragon' => $categoryMap['Gripped Style Dragon'],
            'Realistic Dragon' => $categoryMap['Realistic Dragon'],
            'Toy Condom' => $categoryMap['Toy Condom'],
            'Sunny Toy' => $categoryMap['Sunny Toy'],
            'Big Sunny Toy' => $categoryMap['Big Sunny Toy'],
            
            // Existing category mappings
            'Electronics' => $categoryMap['Electronics'],
            'Smartphone' => $categoryMap['Smartphones'],
            'Laptop' => $categoryMap['Laptops'],
            'Tablet' => $categoryMap['Tablets'],
            'Audio' => $categoryMap['Audio'],
            'Clothing' => $categoryMap['Fashion'],
            "Men's Clothing" => $categoryMap["Men's Clothing"],
            "Women's Clothing" => $categoryMap["Women's Clothing"],
            'Shoes' => $categoryMap['Shoes'],
            'Accessories' => $categoryMap['Accessories'],
            'Home' => $categoryMap['Home & Garden'],
            'Furniture' => $categoryMap['Furniture'],
            'Kitchen' => $categoryMap['Kitchen'],
            'Bedding' => $categoryMap['Bedding'],
            'Garden' => $categoryMap['Garden'],
            'Books' => $categoryMap['Books'],
            'Movies' => $categoryMap['Movies'],
            'Music' => $categoryMap['Music'],
            'Video Games' => $categoryMap['Video Games'],
            'Sports' => $categoryMap['Sports & Outdoors'],
            'Exercise' => $categoryMap['Exercise Equipment'],
            'Outdoor' => $categoryMap['Outdoor Recreation'],
        ];
        
        // Update existing products with category IDs
        $products = Product::all();
        foreach ($products as $product) {
            $categoryId = null;
            
            // Try to find an exact match
            if (isset($categoryMapping[$product->category])) {
                $categoryId = $categoryMapping[$product->category];
            } else {
                // Try to find a partial match
                foreach ($categoryMapping as $key => $id) {
                    if (stripos($product->category, $key) !== false) {
                        $categoryId = $id;
                        break;
                    }
                }
                
                // If no match found, assign to a default category
                if (!$categoryId) {
                    // Default to Magic Condom category for better matching with existing products
                    $categoryId = $categoryMap['Magic Condom'];
                }
            }
            
            $product->update(['category_id' => $categoryId]);
        }
    }
}
