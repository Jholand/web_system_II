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
                'created_at' => now()
            ],
            [
                'role_code' => 'user',
                'role_name' => 'User',
                'description' => 'Regular user account',
                'created_at' => now()
            ],
            [
                'role_code' => 'moderator',
                'role_name' => 'Moderator',
                'description' => 'Content moderation access',
                'created_at' => now()
            ],
            [
                'role_code' => 'owner',
                'role_name' => 'Owner',
                'description' => 'Destination owner account',
                'created_at' => now()
            ]
        ]);
    }
}
