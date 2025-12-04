<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * ⚡ REWARDS & CATEGORIES OPTIMIZATION
     * - Adds composite indexes for frequent query patterns
     * - Optimizes category filtering
     * - Speeds up distance-based queries
     */
    /**
     * Run the migrations.
     * 
     * ⚡ REWARDS & CATEGORIES OPTIMIZATION
     * - Adds composite indexes for frequent query patterns
     * - Optimizes category filtering
     * - Speeds up distance-based queries
     * - Silently skips indexes that already exist
     */
    public function up(): void
    {
        // Helper to safely add index
        $addIndexSafely = function($table, $columns, $indexName) {
            try {
                Schema::table($table, function (Blueprint $t) use ($columns, $indexName) {
                    $t->index($columns, $indexName);
                });
            } catch (\Exception $e) {
                // Index already exists, skip
                echo "⚠️  Index {$indexName} already exists, skipping...\n";
            }
        };

        // Rewards table
        $addIndexSafely('rewards', ['is_active', 'category_id'], 'idx_rewards_active_category');
        $addIndexSafely('rewards', ['is_featured', 'is_active', 'points_required'], 'idx_rewards_featured_active');
        $addIndexSafely('rewards', ['stock_unlimited', 'stock_quantity', 'is_active'], 'idx_rewards_stock_check');

        // Destination categories
        $addIndexSafely('destination_categories', ['is_active', 'category_id'], 'idx_category_lookup');

        // Reward destinations
        $addIndexSafely('reward_destinations', ['destination_id', 'reward_id'], 'idx_dest_reward_lookup');

        // User redemptions
        $addIndexSafely('user_reward_redemptions', ['user_id', 'reward_id', 'status'], 'idx_user_reward_status_check');
        $addIndexSafely('user_reward_redemptions', ['redemption_code', 'status'], 'idx_redemption_code_lookup');

        // Destinations
        $addIndexSafely('destinations', ['latitude', 'longitude', 'status'], 'idx_destination_location_active');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Helper to safely drop index
        $dropIndexSafely = function($table, $indexName) {
            try {
                Schema::table($table, function (Blueprint $t) use ($indexName) {
                    $t->dropIndex($indexName);
                });
            } catch (\Exception $e) {
                // Index doesn't exist, skip
                echo "⚠️  Index {$indexName} doesn't exist, skipping...\n";
            }
        };

        // Drop all indexes (in reverse order)
        $dropIndexSafely('destinations', 'idx_destination_location_active');
        $dropIndexSafely('user_reward_redemptions', 'idx_redemption_code_lookup');
        $dropIndexSafely('user_reward_redemptions', 'idx_user_reward_status_check');
        $dropIndexSafely('reward_destinations', 'idx_dest_reward_lookup');
        $dropIndexSafely('destination_categories', 'idx_category_lookup');
        $dropIndexSafely('rewards', 'idx_rewards_stock_check');
        $dropIndexSafely('rewards', 'idx_rewards_featured_active');
        $dropIndexSafely('rewards', 'idx_rewards_active_category');
    }
};
