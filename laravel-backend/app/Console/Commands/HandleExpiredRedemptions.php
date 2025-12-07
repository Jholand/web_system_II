<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\UserRewardRedemption;
use App\Models\Reward;
use App\Models\User;
use App\Models\UserPointsTransaction;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HandleExpiredRedemptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'redemptions:handle-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Handle expired redemptions - restore stock and refund points';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Checking for expired redemptions...');

        // Find all active/pending redemptions that have expired
        $expiredRedemptions = UserRewardRedemption::whereIn('status', ['active', 'pending'])
            ->where('valid_until', '<', now())
            ->with(['reward', 'user'])
            ->get();

        if ($expiredRedemptions->isEmpty()) {
            $this->info('✅ No expired redemptions found');
            return 0;
        }

        $this->info("📋 Found {$expiredRedemptions->count()} expired redemptions");

        $successCount = 0;
        $errorCount = 0;

        foreach ($expiredRedemptions as $redemption) {
            DB::beginTransaction();
            try {
                // Update redemption status to expired
                $redemption->update(['status' => 'expired']);

                // Restore stock if not unlimited
                $reward = $redemption->reward;
                if ($reward && !$reward->stock_unlimited) {
                    $reward->increment('stock_quantity');
                    $reward->decrement('total_redeemed');
                    $this->line("  ↩️  Restored 1 stock to: {$reward->title} (Stock: {$reward->stock_quantity})");
                }

                // Refund points to user
                $user = $redemption->user;
                if ($user) {
                    $user->total_points += $redemption->points_spent;
                    $user->save();

                    // Create refund transaction record
                    UserPointsTransaction::create([
                        'user_id' => $user->id,
                        'points' => $redemption->points_spent,
                        'balance_after' => $user->total_points,
                        'transaction_type' => 'refunded',
                        'description' => "Refund for expired reward: {$reward->title}",
                        'reference_type' => 'reward_expiration',
                        'reference_id' => $redemption->id,
                    ]);

                    $this->line("  💰 Refunded {$redemption->points_spent} points to: {$user->first_name} {$user->last_name}");
                }

                DB::commit();
                $successCount++;
                
                $this->info("✅ Processed redemption: {$redemption->redemption_code}");

            } catch (\Exception $e) {
                DB::rollBack();
                $errorCount++;
                $this->error("❌ Failed to process redemption {$redemption->redemption_code}: {$e->getMessage()}");
            }
        }

        $this->info("\n📊 Summary:");
        $this->info("  ✅ Successfully processed: {$successCount}");
        if ($errorCount > 0) {
            $this->warn("  ❌ Failed: {$errorCount}");
        }
        $this->info("  📦 Stock restored and points refunded for expired redemptions");

        return 0;
    }
}
