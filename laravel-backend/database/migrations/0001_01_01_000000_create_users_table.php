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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('role_id')->default(2)->comment('FK to user_roles, default=user');
            $table->unsignedTinyInteger('status_id')->default(1)->comment('FK to user_statuses');
            $table->string('email')->unique();
            $table->string('password')->comment('Hashed password');
            $table->rememberToken();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('username', 50)->unique()->nullable();
            $table->string('phone', 20)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other', 'prefer_not_to_say'])->nullable();
            $table->string('avatar_url', 500)->nullable();
            $table->unsignedInteger('total_points')->default(0)->comment('Total loyalty points earned');
            $table->unsignedInteger('level')->default(1)->comment('User level based on activities');
            $table->json('preferences')->nullable()->comment('User preferences and settings');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('phone_verified_at')->nullable();
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();
            $table->timestamps();
            $table->softDeletes()->comment('Soft delete');

            $table->index('email');
            $table->index('username');
            $table->index(['role_id', 'status_id']);
            $table->index('total_points');
            $table->index('level');
            $table->index('created_at');
            $table->index('deleted_at');
            $table->fullText(['first_name', 'last_name']);
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
