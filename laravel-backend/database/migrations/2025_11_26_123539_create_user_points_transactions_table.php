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
        Schema::create('user_points_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('transaction_type', ['earned', 'redeemed', 'bonus', 'penalty', 'adjustment'])->default('earned');
            $table->integer('points')->comment('Positive for earned, negative for spent');
            $table->integer('balance_after')->comment('User total points after this transaction');
            $table->string('source_type', 50)->nullable()->comment('checkin, review, reward_redemption, etc');
            $table->unsignedBigInteger('source_id')->nullable()->comment('ID of the source record');
            $table->unsignedBigInteger('related_destination_id')->nullable();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable()->comment('Additional transaction data');
            $table->timestamp('transaction_date')->useCurrent();
            $table->timestamps();
            
            $table->foreign('related_destination_id')->references('destination_id')->on('destinations')->onDelete('set null');
            $table->index('user_id');
            $table->index('transaction_type');
            $table->index('transaction_date');
            $table->index(['user_id', 'transaction_date']);
            $table->index(['source_type', 'source_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_points_transactions');
    }
};
