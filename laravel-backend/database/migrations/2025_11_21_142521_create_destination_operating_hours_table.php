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
        Schema::create('destination_operating_hours', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('destination_id');
            $table->unsignedTinyInteger('day_of_week')->comment('1=Monday, 7=Sunday');
            $table->time('opens_at')->nullable();
            $table->time('closes_at')->nullable();
            $table->boolean('is_closed')->default(false)->comment('Closed this day');
            $table->string('notes')->nullable();
            
            $table->foreign('destination_id')->references('destination_id')->on('destinations')->onDelete('cascade');
            $table->unique(['destination_id', 'day_of_week'], 'unique_destination_day');
            $table->index('destination_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('destination_operating_hours');
    }
};
