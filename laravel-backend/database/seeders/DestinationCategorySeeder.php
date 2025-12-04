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
                'category_name' => 'Hotels & Resorts',
                'icon' => '🏨',
                'description' => 'Comfortable accommodations and luxury resorts',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_name' => 'Agricultural Farms',
                'icon' => '🌾',
                'description' => 'Working farms and agricultural experiences',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_name' => 'Historical Sites',
                'icon' => '🏛️',
                'description' => 'Historical landmarks and cultural heritage sites',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_name' => 'Nature Parks',
                'icon' => '🌳',
                'description' => 'Natural parks and outdoor recreation',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_name' => 'Beaches',
                'icon' => '🏖️',
                'description' => 'Beautiful beaches and coastal areas',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_name' => 'Mountains',
                'icon' => '⛰️',
                'description' => 'Mountain ranges and hiking trails',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_name' => 'Restaurants',
                'icon' => '🍽️',
                'description' => 'Local dining and culinary experiences',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_name' => 'Attractions',
                'icon' => '🎡',
                'description' => 'Entertainment venues and theme parks',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
