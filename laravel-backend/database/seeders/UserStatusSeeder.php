<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserStatusSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('user_statuses')->insert([
            [
                'status_code' => 'active',
                'status_name' => 'Active',
                'description' => 'User account is active and can access all features',
                'created_at' => now()
            ],
            [
                'status_code' => 'inactive',
                'status_name' => 'Inactive',
                'description' => 'User account is temporarily inactive',
                'created_at' => now()
            ],
            [
                'status_code' => 'suspended',
                'status_name' => 'Suspended',
                'description' => 'User account is suspended due to violations',
                'created_at' => now()
            ],
            [
                'status_code' => 'banned',
                'status_name' => 'Banned',
                'description' => 'User account is permanently banned',
                'created_at' => now()
            ]
        ]);
    }
}
