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
        Schema::create('reward_destinations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reward_id');
            $table->unsignedBigInteger('destination_id');
            $table->timestamps();

            // Foreign keys
            $table->foreign('reward_id')
                ->references('id')
                ->on('rewards')
                ->onDelete('cascade');

            $table->foreign('destination_id')
                ->references('destination_id')
                ->on('destinations')
                ->onDelete('cascade');

            // Unique constraint - one reward can't be linked to same destination twice
            $table->unique(['reward_id', 'destination_id'], 'unique_reward_destination');

            // Indexes for faster queries
            $table->index('reward_id');
            $table->index('destination_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reward_destinations');
    }
};
