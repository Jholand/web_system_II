<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reward_categories', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('category_code', 30)->unique()->comment('food_beverage, accommodation, experience');
            $table->string('category_name', 50);
            $table->string('icon', 50)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamp('created_at')->useCurrent();

            $table->index('category_code');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_categories');
    }
};
