<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_visit_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->unsignedInteger('total_checkins')->default(0);
            $table->unsignedInteger('unique_destinations')->default(0);
            $table->unsignedInteger('total_points_earned')->default(0);
            $table->unsignedTinyInteger('favorite_category_id')->nullable();
            $table->timestamp('last_checkin_at')->nullable();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('favorite_category_id')->references('id')->on('destination_categories')->onDelete('set null');
            $table->index('total_checkins');
            $table->index('total_points_earned');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_visit_stats');
    }
};
