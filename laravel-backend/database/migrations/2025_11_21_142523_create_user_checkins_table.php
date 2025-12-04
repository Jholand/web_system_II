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
        Schema::create('user_checkins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('destination_id');
            $table->enum('checkin_method', ['qr_code', 'gps', 'manual'])->default('qr_code');
            $table->string('qr_code_scanned', 100)->nullable();
            $table->decimal('user_latitude', 10, 8)->nullable()->comment('User location at check-in');
            $table->decimal('user_longitude', 11, 8)->nullable()->comment('User location at check-in');
            $table->integer('distance_from_destination')->nullable()->comment('Distance in meters');
            $table->unsignedInteger('points_earned')->default(0);
            $table->unsignedInteger('bonus_points')->default(0)->comment('Extra points from promotions');
            $table->string('photo_url', 500)->nullable()->comment('User photo at location');
            $table->text('notes')->nullable();
            $table->boolean('is_verified')->default(true);
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null')->comment('Admin who verified');
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('checked_in_at')->useCurrent();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            $table->foreign('destination_id')->references('destination_id')->on('destinations')->onDelete('cascade');
            $table->index('user_id');
            $table->index('destination_id');
            $table->index('checked_in_at');
            $table->index('points_earned');
            $table->index('checkin_method');
            $table->index(['user_id', 'checked_in_at'])->order('desc');
            $table->index(['destination_id', 'checked_in_at'])->order('desc');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_checkins');
    }
};
