<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DestinationStatusSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('destination_statuses')->insert([
            [
                'status_code' => 'active',
                'status_name' => 'Active',
                'created_at' => now()
            ],
            [
                'status_code' => 'inactive',
                'status_name' => 'Inactive',
                'created_at' => now()
            ],
            [
                'status_code' => 'pending',
                'status_name' => 'Pending Approval',
                'created_at' => now()
            ],
            [
                'status_code' => 'archived',
                'status_name' => 'Archived',
                'created_at' => now()
            ]
        ]);
    }
}
