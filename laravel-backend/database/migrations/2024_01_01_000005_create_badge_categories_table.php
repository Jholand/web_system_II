<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('badge_categories', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('category_code', 30)->unique()->comment('travel, agriculture, nature, culture');
            $table->string('category_name', 50);
            $table->string('icon', 50)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();

            $table->index('category_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('badge_categories');
    }
};
