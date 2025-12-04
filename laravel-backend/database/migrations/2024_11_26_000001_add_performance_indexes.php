<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add performance-optimizing indexes to existing tables.
     */
    public function up(): void
    {
        // Destinations table optimizations
        Schema::table('destinations', function (Blueprint $table) {
            try {
                $table->index(['category_id', 'status'], 'idx_category_status');
            } catch (\Exception $e) {}
            
            try {
                $table->index(['average_rating', 'total_visits'], 'idx_rating_visits');
            } catch (\Exception $e) {}

            try {
                $table->index(['latitude', 'longitude'], 'idx_location_coords');
            } catch (\Exception $e) {}
        });

        // User check-ins optimizations
        Schema::table('user_checkins', function (Blueprint $table) {
            try {
                $table->index(['user_id', 'destination_id', 'checked_in_at'], 'idx_user_dest_date');
            } catch (\Exception $e) {}

            try {
                $table->index(['is_verified', 'checkin_method'], 'idx_verified_method');
            } catch (\Exception $e) {}
        });

        // Badges optimizations
        Schema::table('badges', function (Blueprint $table) {
            try {
                $table->index(['is_active', 'rarity', 'display_order'], 'idx_active_rarity');
            } catch (\Exception $e) {}

            try {
                $table->index(['requirement_type', 'is_active'], 'idx_requirement');
            } catch (\Exception $e) {}
        });

        // User badges optimizations
        Schema::table('user_badges', function (Blueprint $table) {
            try {
                $table->index(['user_id', 'is_earned', 'earned_at'], 'idx_user_earned_date');
            } catch (\Exception $e) {}

            try {
                $table->index(['badge_id', 'is_earned'], 'idx_badge_earned');
            } catch (\Exception $e) {}
        });

        // Rewards optimizations
        Schema::table('rewards', function (Blueprint $table) {
            try {
                $table->index(['is_active', 'points_required', 'is_featured'], 'idx_active_points');
            } catch (\Exception $e) {}

            try {
                $table->index(['valid_from', 'valid_until', 'is_active'], 'idx_validity_active');
            } catch (\Exception $e) {}
        });

        // User reward redemptions optimizations
        Schema::table('user_reward_redemptions', function (Blueprint $table) {
            try {
                $table->index(['user_id', 'status', 'redeemed_at'], 'idx_user_status_date');
            } catch (\Exception $e) {}

            try {
                $table->index(['reward_id', 'status'], 'idx_reward_status');
            } catch (\Exception $e) {}

            try {
                $table->index(['redemption_code', 'status'], 'idx_code_status');
            } catch (\Exception $e) {}
        });

        // Destination reviews optimizations
        Schema::table('destination_reviews', function (Blueprint $table) {
            try {
                $table->index(['destination_id', 'status', 'rating'], 'idx_dest_status_rating');
            } catch (\Exception $e) {}

            try {
                $table->index(['is_featured', 'status'], 'idx_featured_approved');
            } catch (\Exception $e) {}

            try {
                $table->index(['user_id', 'created_at'], 'idx_user_created');
            } catch (\Exception $e) {}
        });

        // Users optimizations
        Schema::table('users', function (Blueprint $table) {
            try {
                $table->index(['role_id', 'status_id'], 'idx_role_status');
            } catch (\Exception $e) {}

            try {
                $table->index(['total_points', 'level'], 'idx_points_level');
            } catch (\Exception $e) {}
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes in reverse order (wrapped in try-catch for safety)
        try {
            Schema::table('users', function (Blueprint $table) {
                $table->dropIndex('idx_role_status');
                $table->dropIndex('idx_points_level');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('destination_reviews', function (Blueprint $table) {
                $table->dropIndex('idx_dest_status_rating');
                $table->dropIndex('idx_featured_approved');
                $table->dropIndex('idx_user_created');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('user_reward_redemptions', function (Blueprint $table) {
                $table->dropIndex('idx_user_status_date');
                $table->dropIndex('idx_reward_status');
                $table->dropIndex('idx_code_status');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('rewards', function (Blueprint $table) {
                $table->dropIndex('idx_active_points');
                $table->dropIndex('idx_validity_active');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('user_badges', function (Blueprint $table) {
                $table->dropIndex('idx_user_earned_date');
                $table->dropIndex('idx_badge_earned');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('badges', function (Blueprint $table) {
                $table->dropIndex('idx_active_rarity');
                $table->dropIndex('idx_requirement');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('user_checkins', function (Blueprint $table) {
                $table->dropIndex('idx_user_dest_date');
                $table->dropIndex('idx_verified_method');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('destinations', function (Blueprint $table) {
                $table->dropIndex('idx_category_status');
                $table->dropIndex('idx_rating_visits');
                $table->dropIndex('idx_location_coords');
            });
        } catch (\Exception $e) {}
    }
};
