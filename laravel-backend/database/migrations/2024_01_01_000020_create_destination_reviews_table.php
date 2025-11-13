<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destination_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destination_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('rating')->comment('1-5');
            $table->string('title')->nullable();
            $table->text('review_text')->nullable();
            $table->json('photos')->nullable()->comment('Array of photo URLs');
            $table->unsignedInteger('helpful_count')->default(0);
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('moderated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('moderated_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('destination_id');
            $table->index('user_id');
            $table->index('rating');
            $table->index('status');
            $table->index('created_at');
            $table->unique(['user_id', 'destination_id'], 'unique_user_review');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destination_reviews');
    }
};
