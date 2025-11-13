<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destination_operating_hours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destination_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('day_of_week')->comment('1=Monday, 7=Sunday');
            $table->time('opens_at')->nullable();
            $table->time('closes_at')->nullable();
            $table->boolean('is_closed')->default(false)->comment('Closed this day');
            $table->string('notes')->nullable();

            $table->unique(['destination_id', 'day_of_week'], 'unique_destination_day');
            $table->index('destination_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destination_operating_hours');
    }
};
