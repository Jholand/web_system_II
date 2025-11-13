<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DestinationAmenitySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('destination_amenities')->insert([
            [
                'name' => 'Free WiFi',
                'icon' => '📶',
                'category' => 'facilities',
                'is_active' => true,
                'created_at' => now()
            ],
            [
                'name' => 'Parking',
                'icon' => '🅿️',
                'category' => 'facilities',
                'is_active' => true,
                'created_at' => now()
            ],
            [
                'name' => 'Swimming Pool',
                'icon' => '🏊',
                'category' => 'facilities',
                'is_active' => true,
                'created_at' => now()
            ],
            [
                'name' => 'Restaurant',
                'icon' => '🍽️',
                'category' => 'services',
                'is_active' => true,
                'created_at' => now()
            ],
            [
                'name' => 'Fitness Center',
                'icon' => '🏋️',
                'category' => 'facilities',
                'is_active' => true,
                'created_at' => now()
            ],
            [
                'name' => 'Spa Services',
                'icon' => '💆',
                'category' => 'services',
                'is_active' => true,
                'created_at' => now()
            ],
            [
                'name' => 'Air Conditioning',
                'icon' => '❄️',
                'category' => 'facilities',
                'is_active' => true,
                'created_at' => now()
            ],
            [
                'name' => 'Pet Friendly',
                'icon' => '🐕',
                'category' => 'features',
                'is_active' => true,
                'created_at' => now()
            ],
            [
                'name' => 'Bar/Lounge',
                'icon' => '🍸',
                'category' => 'services',
                'is_active' => true,
                'created_at' => now()
            ],
            [
                'name' => 'Free Breakfast',
                'icon' => '🥐',
                'category' => 'services',
                'is_active' => true,
                'created_at' => now()
            ],
            [
                'name' => '24/7 Service',
                'icon' => '🕐',
                'category' => 'services',
                'is_active' => true,
                'created_at' => now()
            ],
            [
                'name' => 'Room Service',
                'icon' => '🛎️',
                'category' => 'services',
                'is_active' => true,
                'created_at' => now()
            ]
        ]);
    }
}
