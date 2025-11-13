<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destination_categories', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('category_code', 30)->unique()->comment('hotel, agri_farm, historical, nature');
            $table->string('category_name', 50);
            $table->string('icon', 50)->nullable()->comment('Emoji or icon identifier');
            $table->string('color', 50)->nullable()->comment('CSS color code');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('category_code');
            $table->index(['is_active', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destination_categories');
    }
};
