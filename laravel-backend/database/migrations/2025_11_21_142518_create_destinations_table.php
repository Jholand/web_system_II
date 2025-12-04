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
        Schema::create('destinations', function (Blueprint $table) {
            $table->id('destination_id');
            $table->unsignedTinyInteger('category_id')->comment('FK to destination_categories');
            $table->string('status')->default('active')->comment('Status of destination');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null')->comment('Admin who created this');
            $table->string('name');
            $table->string('slug')->unique()->comment('URL-friendly name');
            $table->text('description')->nullable();
            $table->string('street_address')->nullable();
            $table->string('barangay', 100)->nullable();
            $table->string('city', 100);
            $table->string('province', 100);
            $table->string('region', 100);
            $table->string('postal_code', 20)->nullable();
            $table->string('country', 100)->default('Philippines');
            $table->decimal('latitude', 10, 8)->comment('Latitude coordinate');
            $table->decimal('longitude', 11, 8)->comment('Longitude coordinate');
            $table->geometry('location', 'point')->comment('Spatial point for efficient queries');
            $table->string('contact_number', 20)->nullable();
            $table->string('email')->nullable();
            $table->unsignedInteger('points_reward')->default(50)->comment('Points awarded for visiting');
            $table->unsignedInteger('visit_radius')->default(100)->comment('Check-in radius in meters');
            $table->unsignedInteger('total_visits')->default(0);
            $table->unsignedInteger('total_reviews')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0.00);
            $table->string('qr_code', 100)->unique()->nullable()->comment('Unique QR code identifier');
            $table->string('qr_code_image_url', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('category_id')->references('category_id')->on('destination_categories')->onUpdate('cascade');
            $table->index('category_id');
            $table->index('status');
            $table->index('slug');
            $table->index(['city', 'province']);
            $table->index('points_reward');
            $table->index('average_rating');
            $table->index('created_at');
            $table->index('qr_code');
            $table->spatialIndex('location');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('destinations');
    }
};
