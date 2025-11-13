<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destination_statuses', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('status_code', 20)->unique()->comment('active, inactive, pending, archived');
            $table->string('status_name', 50);
            $table->timestamp('created_at')->useCurrent();

            $table->index('status_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destination_statuses');
    }
};
