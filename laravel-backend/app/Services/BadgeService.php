<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\UserBadge;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class BadgeService
{
    /**
     * Get all badges with caching and eager loading.
     */
    public function getBadges(array $filters = [])
    {
        $cacheKey = 'badges.' . md5(json_encode($filters));
        
        return Cache::remember($cacheKey, 300, function () use ($filters) { // 5 minutes cache
            $query = Badge::select([
                'id',
                'category_id',
                'name',
                'slug',
                'description',
                'icon',
                'color',
                'requirement_type',
                'requirement_value',
                'points_reward',
                'rarity',
                'is_active',
                'is_hidden',
                'display_order'
            ])
            ->with('category:category_id,category_name,icon');

            // Apply filters
            if (!empty($filters['search'])) {
                $query->search($filters['search']);
            }

            if (!empty($filters['rarity'])) {
                $query->byRarity($filters['rarity']);
            }

            if (!empty($filters['requirement_type'])) {
                $query->byRequirementType($filters['requirement_type']);
            }

            if (isset($filters['is_active'])) {
                $query->where('is_active', $filters['is_active']);
            }

            return $query->orderBy('display_order')->orderBy('name')->get();
        });
    }

    /**
     * Get user's badge progress with caching.
     */
    public function getUserBadges(int $userId)
    {
        $cacheKey = "user.{$userId}.badges";
        
        return Cache::remember($cacheKey, 300, function () use ($userId) { // 5 min cache
            return UserBadge::where('user_id', $userId)
                ->with([
                    'badge' => function ($query) {
                        $query->select([
                            'id',
                            'name',
                            'slug',
                            'description',
                            'icon',
                            'color',
                            'requirement_type',
                            'requirement_value',
                            'points_reward',
                            'rarity'
                        ]);
                    }
                ])
                ->get();
        });
    }

    /**
     * Check and award all eligible badges for a user
     * Call this after user completes an action (checkin, points earned, etc.)
     */
    public function checkAndAwardBadges(int $userId): array
    {
        $user = \App\Models\User::with(['checkins', 'pointsTransactions'])->findOrFail($userId);
        $newlyEarned = [];
        
        // Get all active badges that user hasn't earned yet
        $badges = Badge::where('is_active', true)
            ->whereNotIn('id', function($query) use ($userId) {
                $query->select('badge_id')
                    ->from('user_badges')
                    ->where('user_id', $userId)
                    ->where('is_earned', true);
            })
            ->get();

        foreach ($badges as $badge) {
            $current = $this->getCurrentValue($user, $badge);
            $progress = $badge->requirement_value > 0 
                ? min((int)(($current / $badge->requirement_value) * 100), 100) 
                : 0;
            
            // Update or create user badge progress
            $userBadge = UserBadge::updateOrCreate(
                [
                    'user_id' => $userId,
                    'badge_id' => $badge->id,
                ],
                [
                    'progress' => $current
                ]
            );

            // Check if badge is earned (reached requirement)
            if ($current >= $badge->requirement_value && !$userBadge->is_earned) {
                $this->awardBadge($user, $badge, $userBadge);
                $newlyEarned[] = $badge;
            }
        }

        // Clear user badges cache
        Cache::forget("user.{$userId}.badges");
        
        return $newlyEarned;
    }

    /**
     * Get current value based on requirement type
     */
    protected function getCurrentValue($user, Badge $badge): int
    {
        switch ($badge->requirement_type) {
            case 'visits':
                // Total check-ins count
                return \App\Models\UserCheckin::where('user_id', $user->id)
                    ->where('is_verified', true)
                    ->count();

            case 'points':
                // Total points earned (from transactions)
                return \App\Models\UserPointsTransaction::where('user_id', $user->id)
                    ->where('transaction_type', 'earned')
                    ->sum('points') ?: 0;

            case 'checkins':
                // Unique destinations checked in
                return \App\Models\UserCheckin::where('user_id', $user->id)
                    ->where('is_verified', true)
                    ->distinct('destination_id')
                    ->count('destination_id');

            case 'categories':
                // Number of different categories visited
                return DB::table('user_checkins')
                    ->join('destinations', 'user_checkins.destination_id', '=', 'destinations.destination_id')
                    ->where('user_checkins.user_id', $user->id)
                    ->where('user_checkins.is_verified', true)
                    ->distinct('destinations.category_id')
                    ->count('destinations.category_id');

            case 'custom':
                // For custom requirements, check requirement_details
                return $this->calculateCustomRequirement($user, $badge);

            default:
                return 0;
        }
    }

    /**
     * Handle custom badge requirements
     */
    protected function calculateCustomRequirement($user, Badge $badge): int
    {
        $details = $badge->requirement_details ?? [];

        if (isset($details['destination_ids'])) {
            return \App\Models\UserCheckin::where('user_id', $user->id)
                ->whereIn('destination_id', $details['destination_ids'])
                ->where('is_verified', true)
                ->count();
        }

        if (isset($details['city'])) {
            return DB::table('user_checkins')
                ->join('destinations', 'user_checkins.destination_id', '=', 'destinations.destination_id')
                ->where('user_checkins.user_id', $user->id)
                ->where('destinations.city', $details['city'])
                ->where('user_checkins.is_verified', true)
                ->count();
        }

        if (isset($details['category_id'])) {
            return DB::table('user_checkins')
                ->join('destinations', 'user_checkins.destination_id', '=', 'destinations.destination_id')
                ->where('user_checkins.user_id', $user->id)
                ->where('destinations.category_id', $details['category_id'])
                ->where('user_checkins.is_verified', true)
                ->count();
        }

        return 0;
    }

    /**
     * Award badge to user
     */
    protected function awardBadge($user, Badge $badge, UserBadge $userBadge): void
    {
        DB::transaction(function () use ($user, $badge, $userBadge) {
            // Mark badge as earned
            $userBadge->update([
                'is_earned' => true,
                'earned_at' => now(),
                'progress' => $badge->requirement_value,
                'points_awarded' => $badge->points_reward,
            ]);

            // Award points if applicable
            if ($badge->points_reward > 0) {
                $user->increment('total_points', $badge->points_reward);
                $user->refresh();

                // Create points transaction
                \App\Models\UserPointsTransaction::create([
                    'user_id' => $user->id,
                    'transaction_type' => 'earned',
                    'points' => $badge->points_reward,
                    'balance_after' => $user->total_points,
                    'source_type' => 'badge',
                    'source_id' => $badge->id,
                    'description' => "Earned badge: {$badge->name}",
                    'metadata' => [
                        'badge_id' => $badge->id,
                        'badge_name' => $badge->name,
                        'badge_rarity' => $badge->rarity,
                    ],
                    'transaction_date' => now(),
                ]);
            }
        });
    }

    /**
     * Clear badge caches.
     */
    public function clearCache(?int $badgeId = null): void
    {
        if ($badgeId) {
            Cache::forget("badge.{$badgeId}");
        }
        
        // Clear all badge-related cache keys
        // Since we use md5(json_encode($filters)), we need to clear common filter combinations
        $commonFilters = [
            [], // No filters
            ['is_active' => true],
            ['is_active' => false],
        ];
        
        // Clear common category filters (1-20)
        for ($i = 1; $i <= 20; $i++) {
            $commonFilters[] = ['category_id' => $i];
            $commonFilters[] = ['category_id' => $i, 'is_active' => true];
        }
        
        // Clear common rarity filters
        foreach (['common', 'uncommon', 'rare', 'epic', 'legendary'] as $rarity) {
            $commonFilters[] = ['rarity' => $rarity];
        }
        
        // Clear all common filter combinations
        foreach ($commonFilters as $filters) {
            $cacheKey = 'badges.' . md5(json_encode($filters));
            Cache::forget($cacheKey);
        }
    }
}
