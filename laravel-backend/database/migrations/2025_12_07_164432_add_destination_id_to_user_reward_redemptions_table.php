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
        Schema::table('user_reward_redemptions', function (Blueprint $table) {
            $table->unsignedBigInteger('destination_id')->nullable()->after('reward_id')->comment('Destination where reward was redeemed');
            $table->unsignedBigInteger('claimed_destination_id')->nullable()->after('destination_id')->comment('Destination where reward was claimed/used');
            
            $table->foreign('destination_id')
                ->references('destination_id')
                ->on('destinations')
                ->onDelete('set null');
                
            $table->foreign('claimed_destination_id')
                ->references('destination_id')
                ->on('destinations')
                ->onDelete('set null');
                
            $table->index('destination_id');
            $table->index('claimed_destination_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_reward_redemptions', function (Blueprint $table) {
            $table->dropForeign(['destination_id']);
            $table->dropForeign(['claimed_destination_id']);
            $table->dropIndex(['destination_id']);
            $table->dropIndex(['claimed_destination_id']);
            $table->dropColumn(['destination_id', 'claimed_destination_id']);
        });
    }
};
