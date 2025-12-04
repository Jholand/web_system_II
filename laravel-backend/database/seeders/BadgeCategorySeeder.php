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
                'category_name' => 'Travel',
                'icon' => '🗺️',
                'description' => 'Badges for travel milestones and exploration',
                'created_at' => now()
            ],
            [
                'category_name' => 'Agriculture',
                'icon' => '🌾',
                'description' => 'Badges for agricultural tourism',
                'created_at' => now()
            ],
            [
                'category_name' => 'Nature',
                'icon' => '🌲',
                'description' => 'Badges for nature exploration',
                'created_at' => now()
            ],
            [
                'category_name' => 'Culture',
                'icon' => '🏛️',
                'description' => 'Badges for cultural experiences',
                'created_at' => now()
            ]
        ]);
    }
}
