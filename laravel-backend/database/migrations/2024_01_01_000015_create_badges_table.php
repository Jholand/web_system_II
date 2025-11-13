<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('badges', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedTinyInteger('category_id')->nullable()->comment('FK to badge_categories');
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->text('description');
            $table->string('icon', 100)->nullable()->comment('Emoji or image path');
            $table->string('color', 50)->nullable()->comment('Badge color hex');
            $table->enum('requirement_type', ['visits', 'points', 'checkins', 'categories', 'custom']);
            $table->unsignedInteger('requirement_value')->comment('Number needed to unlock');
            $table->json('requirement_details')->nullable()->comment('Additional requirements');
            $table->unsignedInteger('points_reward')->default(0);
            $table->enum('rarity', ['common', 'uncommon', 'rare', 'epic', 'legendary'])->default('common');
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_hidden')->default(false)->comment('Hidden until earned');
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('badge_categories')->onDelete('set null');
            $table->index('category_id');
            $table->index('rarity');
            $table->index('is_active');
            $table->index(['requirement_type', 'requirement_value']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('badges');
    }
};
