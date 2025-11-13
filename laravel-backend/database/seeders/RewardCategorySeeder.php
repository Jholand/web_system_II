<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RewardCategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('reward_categories')->insert([
            [
                'category_code' => 'food_beverage',
                'category_name' => 'Food & Beverage',
                'icon' => '☕',
                'description' => 'Dining vouchers and food discounts',
                'is_active' => true,
                'display_order' => 1,
                'created_at' => now()
            ],
            [
                'category_code' => 'accommodation',
                'category_name' => 'Accommodation',
                'icon' => '🏨',
                'description' => 'Hotel stays and room upgrades',
                'is_active' => true,
                'display_order' => 2,
                'created_at' => now()
            ],
            [
                'category_code' => 'experience',
                'category_name' => 'Experience',
                'icon' => '🎯',
                'description' => 'Tours, activities, and experiences',
                'is_active' => true,
                'display_order' => 3,
                'created_at' => now()
            ],
            [
                'category_code' => 'wellness',
                'category_name' => 'Wellness',
                'icon' => '💆',
                'description' => 'Spa treatments and wellness services',
                'is_active' => true,
                'display_order' => 4,
                'created_at' => now()
            ],
            [
                'category_code' => 'shopping',
                'category_name' => 'Shopping',
                'icon' => '🛍️',
                'description' => 'Shopping vouchers and discounts',
                'is_active' => true,
                'display_order' => 5,
                'created_at' => now()
            ],
            [
                'category_code' => 'culture',
                'category_name' => 'Culture',
                'icon' => '🎭',
                'description' => 'Cultural events and museum tickets',
                'is_active' => true,
                'display_order' => 6,
                'created_at' => now()
            ]
        ]);
    }
}
