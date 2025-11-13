<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('badge_id');
            $table->unsignedInteger('progress')->default(0)->comment('Current progress toward badge');
            $table->boolean('is_earned')->default(false);
            $table->timestamp('earned_at')->nullable();
            $table->unsignedInteger('points_awarded')->default(0);
            $table->boolean('is_favorited')->default(false);
            $table->boolean('is_displayed')->default(false)->comment('Show on profile');
            $table->timestamps();

            $table->foreign('badge_id')->references('id')->on('badges')->onDelete('cascade');
            $table->unique(['user_id', 'badge_id'], 'unique_user_badge');
            $table->index('user_id');
            $table->index('badge_id');
            $table->index('is_earned');
            $table->index('earned_at');
            $table->index(['user_id', 'is_earned']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_badges');
    }
};
