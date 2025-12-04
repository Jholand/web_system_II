<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations - Add indexes for fast authentication and validation
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            try {
                // Unique index on email for fast email validation during signup
                if (!$this->indexExists('users', 'users_email_unique')) {
                    $table->unique('email', 'users_email_unique');
                }
            } catch (\Exception $e) {
                // Index already exists
            }
            
            try {
                // Index for faster login queries with email + password lookups
                if (!$this->indexExists('users', 'idx_users_email_status')) {
                    $table->index(['email', 'status_id'], 'idx_users_email_status');
                }
            } catch (\Exception $e) {
                // Index already exists
            }
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            try {
                // Index for faster token validation
                if (!$this->indexExists('personal_access_tokens', 'idx_tokens_token')) {
                    $table->index('token', 'idx_tokens_token');
                }
            } catch (\Exception $e) {
                // Index already exists
            }
            
            try {
                // Index for faster user token lookups
                if (!$this->indexExists('personal_access_tokens', 'idx_tokens_tokenable')) {
                    $table->index(['tokenable_type', 'tokenable_id'], 'idx_tokens_tokenable');
                }
            } catch (\Exception $e) {
                // Index already exists
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            try {
                $table->dropIndex('idx_users_email_status');
            } catch (\Exception $e) {
                // Index doesn't exist
            }
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            try {
                $table->dropIndex('idx_tokens_token');
            } catch (\Exception $e) {
                // Index doesn't exist
            }
            
            try {
                $table->dropIndex('idx_tokens_tokenable');
            } catch (\Exception $e) {
                // Index doesn't exist
            }
        });
    }

    /**
     * Check if an index exists on a table
     */
    private function indexExists(string $table, string $index): bool
    {
        $indexes = DB::select("SHOW INDEX FROM {$table} WHERE Key_name = ?", [$index]);
        return count($indexes) > 0;
    }
};
