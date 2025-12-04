<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin already exists
        $adminExists = DB::table('users')->where('email', 'admin@travelquest.com')->exists();
        
        if (!$adminExists) {
            DB::table('users')->insert([
                'role_id' => 1, // Administrator role
                'status_id' => 1, // Active status
                'email' => 'admin@travelquest.com',
                'password' => Hash::make('Admin@123'), // Default password
                'first_name' => 'Admin',
                'last_name' => 'User',
                'username' => 'admin',
                'phone' => '+63 912 345 6789',
                'date_of_birth' => '1990-01-01',
                'gender' => 'prefer_not_to_say',
                'total_points' => 0,
                'level' => 1,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->command->info('Admin user created successfully!');
            $this->command->info('Email: admin@travelquest.com');
            $this->command->info('Password: Admin@123');
        } else {
            $this->command->info('Admin user already exists.');
        }

        // Create additional test user
        $userExists = DB::table('users')->where('email', 'user@travelquest.com')->exists();
        
        if (!$userExists) {
            DB::table('users')->insert([
                'role_id' => 2, // User role
                'status_id' => 1, // Active status
                'email' => 'user@travelquest.com',
                'password' => Hash::make('User@123'), // Default password
                'first_name' => 'John',
                'last_name' => 'Doe',
                'username' => 'johndoe',
                'phone' => '+63 912 345 6780',
                'date_of_birth' => '1995-05-15',
                'gender' => 'male',
                'total_points' => 2450,
                'level' => 5,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->command->info('Test user created successfully!');
            $this->command->info('Email: user@travelquest.com');
            $this->command->info('Password: User@123');
        } else {
            $this->command->info('Test user already exists.');
        }
    }
}
