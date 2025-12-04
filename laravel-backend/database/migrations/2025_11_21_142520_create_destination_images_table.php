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
        Schema::create('destination_images', function (Blueprint $table) {
            $table->id('destination_images_id');
            $table->unsignedBigInteger('destination_id');
            $table->string('image_path', 500)->nullable()->comment('Server file path');
            $table->string('title')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('destination_id')->references('destination_id')->on('destinations')->onDelete('cascade');
            $table->index('destination_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('destination_images');
    }
};
