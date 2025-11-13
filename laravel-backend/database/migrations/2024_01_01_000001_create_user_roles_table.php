<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_roles', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('role_code', 20)->unique()->comment('admin, user, moderator');
            $table->string('role_name', 50);
            $table->text('description')->nullable();
            $table->json('permissions')->nullable()->comment('Store role permissions as JSON');
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();

            $table->index('role_code');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_roles');
    }
};
