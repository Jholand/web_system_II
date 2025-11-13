<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('transaction_type', ['earn', 'spend', 'bonus', 'refund', 'adjustment']);
            $table->integer('points_amount')->comment('Positive for earn, negative for spend');
            $table->unsignedInteger('balance_after')->comment('Running balance');
            $table->string('source_type', 50)->comment('checkin, badge, reward, admin');
            $table->unsignedBigInteger('source_id')->nullable()->comment('ID of related record');
            $table->string('description', 500)->nullable();
            $table->foreignId('performed_by')->nullable()->constrained('users')->onDelete('set null')->comment('Admin who performed action');
            $table->text('notes')->nullable();
            $table->timestamp('transaction_date')->useCurrent();
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index('transaction_type');
            $table->index('transaction_date');
            $table->index(['user_id', 'transaction_date']);
            $table->index(['source_type', 'source_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_point_transactions');
    }
};
