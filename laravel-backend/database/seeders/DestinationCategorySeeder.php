<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DestinationCategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('destination_categories')->insert([
            [
                'category_code' => 'hotel',
                'category_name' => 'Hotels & Resorts',
                'icon' => '🏨',
                'color' => 'blue',
                'description' => 'Comfortable accommodations and luxury resorts',
                'is_active' => true,
                'display_order' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_code' => 'agri_farm',
                'category_name' => 'Agricultural Farms',
                'icon' => '🌾',
                'color' => 'green',
                'description' => 'Working farms and agricultural experiences',
                'is_active' => true,
                'display_order' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_code' => 'historical',
                'category_name' => 'Historical Sites',
                'icon' => '🏛️',
                'color' => 'brown',
                'description' => 'Historical landmarks and cultural heritage sites',
                'is_active' => true,
                'display_order' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_code' => 'nature',
                'category_name' => 'Nature Parks',
                'icon' => '🌳',
                'color' => 'emerald',
                'description' => 'Natural parks and wildlife sanctuaries',
                'is_active' => true,
                'display_order' => 4,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_code' => 'beach',
                'category_name' => 'Beaches',
                'icon' => '🏖️',
                'color' => 'cyan',
                'description' => 'Beautiful beaches and coastal areas',
                'is_active' => true,
                'display_order' => 5,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_code' => 'mountain',
                'category_name' => 'Mountains',
                'icon' => '⛰️',
                'color' => 'stone',
                'description' => 'Mountain ranges and hiking trails',
                'is_active' => true,
                'display_order' => 6,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_code' => 'restaurant',
                'category_name' => 'Restaurants',
                'icon' => '🍽️',
                'color' => 'orange',
                'description' => 'Local dining and culinary experiences',
                'is_active' => true,
                'display_order' => 7,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_code' => 'resort',
                'category_name' => 'Resorts',
                'icon' => '🏝️',
                'color' => 'teal',
                'description' => 'Vacation resorts and leisure destinations',
                'is_active' => true,
                'display_order' => 8,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
