<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BadgeCategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('badge_categories')->insert([
            [
                'category_code' => 'travel',
                'category_name' => 'Travel',
                'icon' => '🗺️',
                'description' => 'Badges for travel milestones and exploration',
                'is_active' => true,
                'created_at' => now()
            ],
            [
                'category_code' => 'agriculture',
                'category_name' => 'Agriculture',
                'icon' => '🌾',
                'description' => 'Badges for agricultural tourism',
                'is_active' => true,
                'created_at' => now()
            ],
            [
                'category_code' => 'nature',
                'category_name' => 'Nature',
                'icon' => '🌲',
                'description' => 'Badges for nature exploration',
                'is_active' => true,
                'created_at' => now()
            ],
            [
                'category_code' => 'culture',
                'category_name' => 'Culture',
                'icon' => '🏛️',
                'description' => 'Badges for cultural experiences',
                'is_active' => true,
                'created_at' => now()
            ]
        ]);
    }
}
