<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed lookup/reference tables first (no foreign key dependencies)
        $this->call([
            UserRoleSeeder::class,
            UserStatusSeeder::class,
            DestinationCategorySeeder::class,
            RewardCategorySeeder::class,
            BadgeCategorySeeder::class,
            AdminUserSeeder::class, // Add admin and test users
        ]);

        // Optionally create a test user
        // User::factory(10)->create();

        // User::firstOrCreate(
        //     ['email' => 'test@example.com'],
        //     [
        //         'first_name' => 'Test',
        //         'last_name' => 'User',
        //         'password' => bcrypt('password'),
        //         'email_verified_at' => now(),
        //         'role_id' => 2, // user role
        //         'status_id' => 1, // active status
        //     ]
        // );
    }
}
