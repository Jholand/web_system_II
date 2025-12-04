<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Combines street_address and barangay into full_address
     * Makes postal_code auto-populated based on city/province
     */
    public function up(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            // Add new combined address field
            $table->string('full_address')->nullable()->after('description')
                ->comment('Complete street address including barangay');
            
            // Update postal_code to have a default value mechanism
            // Keep existing columns but we'll populate postal_code automatically via service
        });
        
        // Migrate existing data: combine street_address and barangay into full_address
        DB::statement("
            UPDATE destinations 
            SET full_address = CONCAT_WS(', ', 
                NULLIF(street_address, ''),
                CASE WHEN barangay IS NOT NULL THEN CONCAT('Barangay ', barangay) ELSE NULL END
            )
            WHERE street_address IS NOT NULL OR barangay IS NOT NULL
        ");
        
        // Auto-populate postal codes based on city and province
        $postalCodeMappings = [
            ['city' => 'Bongabong', 'province' => 'Oriental Mindoro', 'postal_code' => '5211'],
            ['city' => 'Calapan City', 'province' => 'Oriental Mindoro', 'postal_code' => '5200'],
            ['city' => 'Gloria', 'province' => 'Oriental Mindoro', 'postal_code' => '5209'],
            ['city' => 'Mansalay', 'province' => 'Oriental Mindoro', 'postal_code' => '5210'],
            ['city' => 'Naujan', 'province' => 'Oriental Mindoro', 'postal_code' => '5204'],
            ['city' => 'Pinamalayan', 'province' => 'Oriental Mindoro', 'postal_code' => '5208'],
            ['city' => 'Pola', 'province' => 'Oriental Mindoro', 'postal_code' => '5206'],
            ['city' => 'Puerto Galera', 'province' => 'Oriental Mindoro', 'postal_code' => '5203'],
            ['city' => 'Roxas', 'province' => 'Oriental Mindoro', 'postal_code' => '5212'],
            ['city' => 'San Teodoro', 'province' => 'Oriental Mindoro', 'postal_code' => '5201'],
            ['city' => 'Socorro', 'province' => 'Oriental Mindoro', 'postal_code' => '5202'],
            ['city' => 'Victoria', 'province' => 'Oriental Mindoro', 'postal_code' => '5205'],
            ['city' => 'Baco', 'province' => 'Oriental Mindoro', 'postal_code' => '5207'],
        ];
        
        foreach ($postalCodeMappings as $mapping) {
            DB::table('destinations')
                ->where('city', $mapping['city'])
                ->where('province', $mapping['province'])
                ->whereNull('postal_code')
                ->update(['postal_code' => $mapping['postal_code']]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            $table->dropColumn('full_address');
        });
    }
};
