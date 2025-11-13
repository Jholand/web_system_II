<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destination_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destination_id')->constrained()->onDelete('cascade');
            $table->string('image_url', 500);
            $table->string('image_path', 500)->nullable()->comment('Server file path');
            $table->string('title')->nullable();
            $table->string('alt_text')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->integer('display_order')->default(0);
            $table->unsignedInteger('file_size')->nullable()->comment('Size in bytes');
            $table->string('mime_type', 50)->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('created_at')->useCurrent();

            $table->index('destination_id');
            $table->index('is_primary');
            $table->index('display_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destination_images');
    }
};
