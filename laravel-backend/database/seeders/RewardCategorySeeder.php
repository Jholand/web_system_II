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
                'category_name' => 'Food & Beverage',
                'icon' => '☕',
                'description' => 'Dining vouchers and food discounts',
                'created_at' => now()
            ],
            [
                'category_name' => 'Accommodation',
                'icon' => '🏨',
                'description' => 'Hotel stays and room upgrades',
                'created_at' => now()
            ],
            [
                'category_name' => 'Experience',
                'icon' => '🎯',
                'description' => 'Tours, activities, and experiences',
                'created_at' => now()
            ],
            [
                'category_name' => 'Wellness',
                'icon' => '💆',
                'description' => 'Spa treatments and wellness services',
                'created_at' => now()
            ],
            [
                'category_name' => 'Shopping',
                'icon' => '🛍️',
                'description' => 'Shopping vouchers and discounts',
                'created_at' => now()
            ],
            [
                'category_name' => 'Culture',
                'icon' => '🎭',
                'description' => 'Cultural events and museum tickets',
                'created_at' => now()
            ]
        ]);
    }
}
