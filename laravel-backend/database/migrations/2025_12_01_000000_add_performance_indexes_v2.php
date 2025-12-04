<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations - CRITICAL PERFORMANCE INDEXES.
     */
    public function up(): void
    {
        Schema::table('user_checkins', function (Blueprint $table) {
            // Composite indexes for common query patterns
            $table->index(['user_id', 'checked_in_at'], 'idx_user_date_checkin');
            $table->index(['destination_id', 'checked_in_at'], 'idx_dest_date_checkin');
        });

        Schema::table('user_points_transactions', function (Blueprint $table) {
            // Critical composite index for dashboard queries
            $table->index(['transaction_type', 'transaction_date', 'user_id'], 'idx_type_date_user');
        });

        Schema::table('user_badges', function (Blueprint $table) {
            // Index for user badge lookups with date
            $table->index(['user_id', 'earned_at'], 'idx_user_earned_badge');
        });

        Schema::table('rewards', function (Blueprint $table) {
            // Composite index for reward filtering
            $table->index(['category_id', 'is_active', 'points_required'], 'idx_cat_active_points');
        });

        Schema::table('users', function (Blueprint $table) {
            // Composite index for authentication queries
            $table->index(['email', 'status_id', 'role_id'], 'idx_email_status_role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_checkins', function (Blueprint $table) {
            $table->dropIndex('idx_user_date_checkin');
            $table->dropIndex('idx_dest_date_checkin');
        });

        Schema::table('user_points_transactions', function (Blueprint $table) {
            $table->dropIndex('idx_type_date_user');
        });

        Schema::table('user_badges', function (Blueprint $table) {
            $table->dropIndex('idx_user_earned_badge');
        });

        Schema::table('rewards', function (Blueprint $table) {
            $table->dropIndex('idx_cat_active_points');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_email_status_role');
        });
    }
};
