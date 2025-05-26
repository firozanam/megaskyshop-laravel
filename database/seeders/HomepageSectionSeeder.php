<?php

namespace Database\Seeders;

use App\Models\HomepageSection;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HomepageSectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sections = [
            [
                'section_name' => 'hero',
                'title' => '১০০% সিলিকনের তৈরি অরিজিনাল ম্যাজিক কনডম',
                'subtitle' => 'দীর্ঘ সময়ের জন্য এবং বারবার ব্যবহার করুন সবচেয়ে নিরাপদ, ৩০-৪০ মিনিট পর্যন্ত সময় বাড়াতে সাহায্য করবে।',
                'button_text' => 'অর্ডার করুন এখনই',
                'button_url' => '#order-form',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'section_name' => 'featured_products',
                'title' => 'Featured Products',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'section_name' => 'benefits',
                'title' => 'কেন নিবেন এই ম্যাজিক কনডম?',
                'content' => 'আমাদের এই প্রোডাক্ট গুলো আপনি ব্যবহার করলে আপনার সেক্স লাইফ হবে আরো উন্নত। আপনার স্ত্রীর সাথে সম্পর্ক হবে আরো নিবিড়। (এই প্রোডাক্টটি নিয়মিত ব্যবহারে কোন সাইড ইফেক্ট নেই।)',
                'additional_data' => [
                    'benefits' => [
                        'এটা দিয়ে আপনি নিয়মিত সেক্স করলেও কোন ক্ষতি হবে না।',
                        'এটি আপনাকে দীর্ঘ সময় সেক্স করতে সাহায্য করে।',
                        'এটি দিয়ে সেক্স করলে আপনার পার্টনার খুশি হবেন।',
                        'আপনি নিয়মিত সেক্স করতে পারবেন।',
                        'এটি আপনাকে সেক্স করার সময় মজা নিতে সাহায্য করে।',
                        'আপনি আরও দীর্ঘ সময় সেক্স করতে পারবেন।'
                    ]
                ],
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'section_name' => 'video',
                'title' => 'Product Video',
                'content' => '<iframe width="560" height="315" src="https://www.youtube.com/embed/example" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'section_name' => 'pricing',
                'title' => 'Pricing',
                'content' => 'পূর্বের মূল্য ১৯৯০/= টাকা<br>বর্তমান মূল্য ৭৯০/= টাকা',
                'additional_data' => [
                    'features' => [
                        '১০০% অরিজিনাল প্রোডাক্ট এবং ১০০% কার্যকরী',
                        'সারা বাংলাদেশে ফ্রি হোম ডেলিভারি করা হয়'
                    ]
                ],
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'section_name' => 'order_form',
                'title' => 'আপনার নাম, ঠিকানা ও মোবাইল নম্বর দিয়ে অর্ডার করুন',
                'is_active' => true,
                'sort_order' => 6,
            ],
        ];

        foreach ($sections as $section) {
            HomepageSection::create($section);
        }
    }
} 