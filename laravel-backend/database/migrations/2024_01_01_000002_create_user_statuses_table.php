<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_statuses', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('status_code', 20)->unique()->comment('active, inactive, suspended, banned');
            $table->string('status_name', 50);
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('status_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_statuses');
    }
};
