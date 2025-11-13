<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserRoleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('user_roles')->insert([
            [
                'role_code' => 'admin',
                'role_name' => 'Administrator',
                'description' => 'Full system access',
                'permissions' => json_encode([
                    'manage_users', 'manage_destinations', 'manage_rewards', 
                    'manage_badges', 'view_reports', 'manage_settings'
                ]),
                'is_active' => true,
                'created_at' => now()
            ],
            [
                'role_code' => 'user',
                'role_name' => 'User',
                'description' => 'Regular user account',
                'permissions' => json_encode([
                    'checkin', 'review', 'redeem_rewards', 'view_badges'
                ]),
                'is_active' => true,
                'created_at' => now()
            ],
            [
                'role_code' => 'moderator',
                'role_name' => 'Moderator',
                'description' => 'Content moderation access',
                'permissions' => json_encode([
                    'moderate_reviews', 'verify_checkins', 'manage_destinations'
                ]),
                'is_active' => true,
                'created_at' => now()
            ]
        ]);
    }
}
