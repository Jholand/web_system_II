<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BadgeService;
use App\Models\User;

class CheckUserBadges extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'badges:check {userId? : The ID of the user to check badges for}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and award badges for a user based on their progress';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('userId');
        $badgeService = new BadgeService();

        if ($userId) {
            // Check badges for specific user
            $user = User::find($userId);
            
            if (!$user) {
                $this->error("User with ID {$userId} not found.");
                return 1;
            }

            $this->info("Checking badges for user: {$user->first_name} {$user->last_name} (ID: {$user->id})");
            
            // Get user stats
            $checkins = \App\Models\UserCheckin::where('user_id', $userId)
                ->where('is_verified', true)
                ->count();
            $totalPoints = $user->total_points;
            
            $this->info("User stats:");
            $this->line("  - Check-ins: {$checkins}");
            $this->line("  - Total points: {$totalPoints}");
            
            $newBadges = $badgeService->checkAndAwardBadges($userId);
            
            if (count($newBadges) > 0) {
                $this->info("🎉 Awarded " . count($newBadges) . " new badge(s):");
                foreach ($newBadges as $badge) {
                    $this->line("  ✓ {$badge->icon} {$badge->name} (+{$badge->points_reward} pts)");
                }
            } else {
                $this->info("No new badges earned at this time.");
            }
            
            // Show earned badges
            $earnedBadges = \App\Models\UserBadge::where('user_id', $userId)
                ->where('is_earned', true)
                ->with('badge')
                ->get();
            
            $this->info("\nTotal earned badges: " . $earnedBadges->count());
            foreach ($earnedBadges as $ub) {
                $this->line("  ✓ {$ub->badge->icon} {$ub->badge->name}");
            }
            
        } else {
            // Check badges for all users
            $this->info("Checking badges for all users...");
            
            $users = User::where('role_id', 2)->get(); // Only regular users
            $bar = $this->output->createProgressBar(count($users));
            
            $totalAwarded = 0;
            
            foreach ($users as $user) {
                $newBadges = $badgeService->checkAndAwardBadges($user->id);
                $totalAwarded += count($newBadges);
                $bar->advance();
            }
            
            $bar->finish();
            $this->newLine();
            $this->info("✓ Awarded {$totalAwarded} total new badges across all users.");
        }

        return 0;
    }
}
