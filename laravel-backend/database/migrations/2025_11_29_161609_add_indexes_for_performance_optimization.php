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
        try {
            // User Badges - Optimize badge queries
            Schema::table('user_badges', function (Blueprint $table) {
                $table->index(['user_id', 'is_earned'], 'idx_user_badges_user_earned');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('user_badges', function (Blueprint $table) {
                $table->index(['user_id', 'badge_id'], 'idx_user_badges_user_badge');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('user_badges', function (Blueprint $table) {
                $table->index('earned_at', 'idx_user_badges_earned_at');
            });
        } catch (\Exception $e) {}

        try {
            // Badges - Optimize active/hidden badge queries
            Schema::table('badges', function (Blueprint $table) {
                $table->index(['is_active', 'is_hidden'], 'idx_badges_active_hidden');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('badges', function (Blueprint $table) {
                $table->index('requirement_type', 'idx_badges_requirement_type');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('badges', function (Blueprint $table) {
                $table->index(['display_order', 'rarity'], 'idx_badges_display_rarity');
            });
        } catch (\Exception $e) {}

        try {
            // User Check-ins - Optimize check-in counting queries
            Schema::table('user_checkins', function (Blueprint $table) {
                $table->index(['user_id', 'is_verified'], 'idx_checkins_user_verified');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('user_checkins', function (Blueprint $table) {
                $table->index(['user_id', 'destination_id', 'is_verified'], 'idx_checkins_user_dest_verified');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('user_checkins', function (Blueprint $table) {
                $table->index('created_at', 'idx_checkins_created_at');
            });
        } catch (\Exception $e) {}

        try {
            // User Points Transactions - Optimize points calculation
            Schema::table('user_points_transactions', function (Blueprint $table) {
                $table->index(['user_id', 'transaction_type'], 'idx_points_user_type');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('user_points_transactions', function (Blueprint $table) {
                $table->index('transaction_date', 'idx_points_date');
            });
        } catch (\Exception $e) {}

        try {
            // Destinations - Optimize destination queries
            Schema::table('destinations', function (Blueprint $table) {
                $table->index('category_id', 'idx_destinations_category');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('destinations', function (Blueprint $table) {
                $table->index('status', 'idx_destinations_status');
            });
        } catch (\Exception $e) {}

        try {
            // Users - Optimize user lookups
            Schema::table('users', function (Blueprint $table) {
                $table->index('role_id', 'idx_users_role');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('users', function (Blueprint $table) {
                $table->index('status_id', 'idx_users_status');
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('users', function (Blueprint $table) {
                $table->index('email', 'idx_users_email');
            });
        } catch (\Exception $e) {}
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_badges', function (Blueprint $table) {
            $table->dropIndex('idx_user_badges_user_earned');
            $table->dropIndex('idx_user_badges_user_badge');
            $table->dropIndex('idx_user_badges_earned_at');
        });

        Schema::table('badges', function (Blueprint $table) {
            $table->dropIndex('idx_badges_active_hidden');
            $table->dropIndex('idx_badges_requirement_type');
            $table->dropIndex('idx_badges_display_rarity');
        });

        Schema::table('user_checkins', function (Blueprint $table) {
            $table->dropIndex('idx_checkins_user_verified');
            $table->dropIndex('idx_checkins_user_dest_verified');
            $table->dropIndex('idx_checkins_created_at');
        });

        Schema::table('user_points_transactions', function (Blueprint $table) {
            $table->dropIndex('idx_points_user_type');
            $table->dropIndex('idx_points_date');
        });

        Schema::table('destinations', function (Blueprint $table) {
            $table->dropIndex('idx_destinations_category');
            $table->dropIndex('idx_destinations_status');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_role');
            $table->dropIndex('idx_users_status');
            $table->dropIndex('idx_users_email');
        });
    }
};
