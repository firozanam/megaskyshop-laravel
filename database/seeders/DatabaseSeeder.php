<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Seeders\ProductSeeder;
use Database\Seeders\CategorySeeder;
use Database\Seeders\OrderSeeder;
use Database\Seeders\HomepageSectionSeeder;
use Database\Seeders\SettingsSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(UserSeeder::class);
        $this->call(ProductSeeder::class);
        $this->call(CategorySeeder::class);
        $this->call(OrderSeeder::class);
        $this->call(HomepageSectionSeeder::class);
        $this->call(SettingsSeeder::class);
    }
}
