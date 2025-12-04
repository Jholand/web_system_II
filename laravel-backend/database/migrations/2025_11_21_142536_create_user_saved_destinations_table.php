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
        Schema::create('user_saved_destinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('destination_id');
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('destination_id')->references('destination_id')->on('destinations')->onDelete('cascade');
            $table->unique(['user_id', 'destination_id'], 'unique_saved');
            $table->index('user_id');
            $table->index('destination_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_saved_destinations');
    }
};
