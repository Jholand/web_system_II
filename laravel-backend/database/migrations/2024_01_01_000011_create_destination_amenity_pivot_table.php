<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destination_amenity_pivot', function (Blueprint $table) {
            $table->foreignId('destination_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('amenity_id');
            $table->timestamp('created_at')->useCurrent();

            $table->primary(['destination_id', 'amenity_id']);
            $table->foreign('amenity_id')->references('id')->on('destination_amenities')->onDelete('cascade');
            $table->index('destination_id');
            $table->index('amenity_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destination_amenity_pivot');
    }
};
