<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('destination_categories', function (Blueprint $table) {
            $table->tinyIncrements('category_id');
            $table->string('category_name', 50);
            $table->string('icon', 50)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('category_id');
            $table->index('is_active');
            $table->index('category_name');
            $table->index(['is_active', 'category_name'], 'idx_active_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('destination_categories');
    }
};
