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
        Schema::table('user_checkins', function (Blueprint $table) {
            // Index for date filtering and grouping in dashboard queries
            $table->index('checked_in_at', 'idx_checkins_date');
        });

        Schema::table('user_points_transactions', function (Blueprint $table) {
            // Composite index for transaction type and date (WHERE + GROUP BY optimization)
            $table->index(['transaction_type', 'transaction_date'], 'idx_transactions_type_date');
        });

        Schema::table('user_badges', function (Blueprint $table) {
            // Index for today's badges query
            $table->index('earned_at', 'idx_badges_earned_date');
        });

        Schema::table('destinations', function (Blueprint $table) {
            // Composite index for top destinations query (status + total_visits)
            $table->index(['status', 'total_visits'], 'idx_destinations_status_visits');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_checkins', function (Blueprint $table) {
            $table->dropIndex('idx_checkins_date');
        });

        Schema::table('user_points_transactions', function (Blueprint $table) {
            $table->dropIndex('idx_transactions_type_date');
        });

        Schema::table('user_badges', function (Blueprint $table) {
            $table->dropIndex('idx_badges_earned_date');
        });

        Schema::table('destinations', function (Blueprint $table) {
            $table->dropIndex('idx_destinations_status_visits');
        });
    }
};
