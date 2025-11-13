<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rewards', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('category_id')->comment('FK to reward_categories');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->text('terms_conditions')->nullable();
            $table->unsignedInteger('points_required');
            $table->unsignedInteger('stock_quantity')->default(0);
            $table->boolean('stock_unlimited')->default(false);
            $table->unsignedInteger('max_redemptions_per_user')->default(1);
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->unsignedInteger('redemption_period_days')->default(30)->comment('Days to use after redemption');
            $table->string('partner_name')->nullable();
            $table->string('partner_logo_url', 500)->nullable();
            $table->string('partner_contact')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('total_redeemed')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('category_id')->references('id')->on('reward_categories')->onUpdate('cascade');
            $table->index('category_id');
            $table->index('points_required');
            $table->index('is_active');
            $table->index('is_featured');
            $table->index(['valid_from', 'valid_until']);
            $table->fullText(['title', 'description']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rewards');
    }
};
