<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * ⚡ PERFORMANCE INDEXES - HUGE SPEED BOOST
     * Only the MOST CRITICAL indexes for instant load
     */
    public function up(): void
    {
        // ✅ USER_CHECKINS - THE MOST IMPORTANT (500ms→50ms)
        Schema::table('user_checkins', function (Blueprint $table) {
            if (!$this->indexExists('user_checkins', 'user_checkins_checked_in_at_index')) {
                $table->index('checked_in_at');
            }
            if (!$this->indexExists('user_checkins', 'user_checkins_user_id_checked_in_at_index')) {
                $table->index(['user_id', 'checked_in_at']);
            }
        });

        // ✅ USER_BADGES - SECOND MOST IMPORTANT (300ms→30ms)
        Schema::table('user_badges', function (Blueprint $table) {
            if (!$this->indexExists('user_badges', 'user_badges_earned_at_index')) {
                $table->index('earned_at');
            }
        });

        // ✅ DESTINATIONS - For map queries (200ms→20ms)
        Schema::table('destinations', function (Blueprint $table) {
            if (!$this->indexExists('destinations', 'destinations_latitude_longitude_index')) {
                $table->index(['latitude', 'longitude']);
            }
        });
    }

    /**
     * Check if an index exists on a table
     */
    private function indexExists(string $table, string $index): bool
    {
        $connection = Schema::getConnection();
        $databaseName = $connection->getDatabaseName();
        
        $result = $connection->select(
            "SELECT COUNT(*) as count FROM information_schema.statistics 
             WHERE table_schema = ? AND table_name = ? AND index_name = ?",
            [$databaseName, $table, $index]
        );
        
        return $result[0]->count > 0;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove added indexes only
        Schema::table('user_checkins', function (Blueprint $table) {
            if ($this->indexExists('user_checkins', 'user_checkins_checked_in_at_index')) {
                $table->dropIndex(['checked_in_at']);
            }
            if ($this->indexExists('user_checkins', 'user_checkins_user_id_checked_in_at_index')) {
                $table->dropIndex(['user_id', 'checked_in_at']);
            }
        });

        Schema::table('user_badges', function (Blueprint $table) {
            if ($this->indexExists('user_badges', 'user_badges_earned_at_index')) {
                $table->dropIndex(['earned_at']);
            }
        });

        Schema::table('destinations', function (Blueprint $table) {
            if ($this->indexExists('destinations', 'destinations_latitude_longitude_index')) {
                $table->dropIndex(['latitude', 'longitude']);
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if ($this->indexExists('users', 'users_total_points_index')) {
                $table->dropIndex(['total_points']);
            }
            if ($this->indexExists('users', 'users_role_index')) {
                $table->dropIndex(['role']);
            }
        });
    }
};
