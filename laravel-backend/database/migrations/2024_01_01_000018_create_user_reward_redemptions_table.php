<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_reward_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('reward_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('points_spent');
            $table->string('redemption_code', 100)->unique()->comment('Unique code to claim reward');
            $table->enum('status', ['pending', 'active', 'used', 'expired', 'cancelled'])->default('pending');
            $table->timestamp('valid_until');
            $table->timestamp('used_at')->nullable();
            $table->string('used_location')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null')->comment('Staff who verified usage');
            $table->text('notes')->nullable();
            $table->timestamp('redeemed_at')->useCurrent();
            $table->timestamps();

            $table->index('user_id');
            $table->index('reward_id');
            $table->index('redemption_code');
            $table->index('status');
            $table->index('valid_until');
            $table->index(['user_id', 'redeemed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_reward_redemptions');
    }
};
