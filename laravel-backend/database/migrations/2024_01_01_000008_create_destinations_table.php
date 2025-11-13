<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destinations', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('category_id')->comment('FK to destination_categories');
            $table->unsignedTinyInteger('status_id')->default(1)->comment('FK to destination_statuses');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null')->comment('Admin who created this');
            $table->string('name');
            $table->string('slug')->unique()->comment('URL-friendly name');
            $table->text('description')->nullable()->comment('Short description');
            $table->longText('full_description')->nullable()->comment('Full detailed description');
            $table->string('street_address')->nullable();
            $table->string('barangay', 100)->nullable();
            $table->string('city', 100);
            $table->string('province', 100);
            $table->string('region', 100);
            $table->string('postal_code', 20)->nullable();
            $table->string('country', 100)->default('Philippines');
            $table->decimal('latitude', 10, 8)->comment('Latitude coordinate');
            $table->decimal('longitude', 11, 8)->comment('Longitude coordinate');
            $table->string('contact_number', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('website', 500)->nullable();
            $table->unsignedInteger('points_reward')->default(50)->comment('Points awarded for visiting');
            $table->unsignedInteger('visit_radius')->default(100)->comment('Check-in radius in meters');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('total_visits')->default(0);
            $table->unsignedInteger('total_reviews')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0.00);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords', 500)->nullable();
            $table->string('qr_code', 100)->unique()->nullable()->comment('Unique QR code identifier');
            $table->string('qr_code_image_url', 500)->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes()->comment('Soft delete');

            $table->index('category_id');
            $table->index('status_id');
            $table->index('slug');
            $table->index(['city', 'province']);
            $table->index('is_featured');
            $table->index('is_active');
            $table->index('points_reward');
            $table->index('average_rating');
            $table->index('created_at');
            $table->index('qr_code');
            $table->index(['category_id', 'is_active']);
            $table->index(['is_featured', 'is_active']);
            $table->index(['city', 'province', 'region']);
            $table->fullText(['name', 'description']);
        });

        // Add spatial column for geolocation (MySQL specific)
        DB::statement('ALTER TABLE destinations ADD location POINT NOT NULL AFTER longitude');
        DB::statement('ALTER TABLE destinations ADD SPATIAL INDEX idx_location(location)');
    }

    public function down(): void
    {
        Schema::dropIfExists('destinations');
    }
};
