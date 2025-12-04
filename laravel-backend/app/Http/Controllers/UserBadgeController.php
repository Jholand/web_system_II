<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Models\UserBadge;
use App\Services\BadgeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class UserBadgeController extends Controller
{
    protected $badgeService;

    public function __construct(BadgeService $badgeService)
    {
        $this->badgeService = $badgeService;
    }

    /**
     * Check and award badges for current user
     */
    public function checkBadges(Request $request)
    {
        $user = Auth::user();
        
        try {
            $newBadges = $this->badgeService->checkAndAwardBadges($user->id);
            
            return response()->json([
                'success' => true,
                'message' => count($newBadges) > 0 
                    ? 'New badges awarded!' 
                    : 'No new badges earned',
                'data' => [
                    'new_badges_count' => count($newBadges),
                    'new_badges' => collect($newBadges)->map(function($badge) {
                        return [
                            'id' => $badge->id,
                            'name' => $badge->name,
                            'icon' => $badge->icon,
                            'points_reward' => $badge->points_reward,
                            'rarity' => $badge->rarity,
                        ];
                    })->values()->all()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Badge check error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to check badges: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's badges (earned and in progress)
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Try cache first for instant response
        $cacheKey = "user_badges_{$user->id}";
        $cached = Cache::get($cacheKey);
        
        if ($cached && $request->header('X-Use-Cache') !== 'false') {
            return response()->json($cached);
        }
        
        // Get earned badges - OPTIMIZED with specific columns only
        $earnedBadges = UserBadge::select([
                'id', 'user_id', 'badge_id', 'progress', 'is_earned', 
                'earned_at', 'points_awarded', 'is_favorited', 'is_displayed'
            ])
            ->where('user_id', $user->id)
            ->where('is_earned', true)
            ->with(['badge' => function ($query) {
                $query->select([
                    'id', 'name', 'slug', 'description', 'icon', 'color',
                    'requirement_type', 'requirement_value', 'points_reward', 'rarity'
                ]);
            }])
            ->orderBy('earned_at', 'desc')
            ->get();

        // Get available badges (not earned yet) - OPTIMIZED
        $earnedBadgeIds = $earnedBadges->pluck('badge_id')->toArray();
        
        $availableBadges = Badge::select([
                'id', 'name', 'slug', 'description', 'icon', 'color',
                'requirement_type', 'requirement_value', 'points_reward', 'rarity', 'category_id'
            ])
            ->where('is_active', true)
            ->where('is_hidden', false)
            ->whereNotIn('id', $earnedBadgeIds)
            ->orderBy('display_order')
            ->orderBy('rarity')
            ->get()
            ->map(function ($badge) use ($user) {
                // Get progress if exists
                $userBadge = UserBadge::where('user_id', $user->id)
                    ->where('badge_id', $badge->id)
                    ->first();
                
                $badge->progress = $userBadge ? $userBadge->progress : 0;
                return $badge;
            });

        $response = [
            'success' => true,
            'data' => [
                'earned' => $earnedBadges,
                'available' => $availableBadges,
                'summary' => [
                    'total_earned' => $earnedBadges->count(),
                    'total_available' => $earnedBadges->count() + $availableBadges->count(),
                    'total_points_from_badges' => $earnedBadges->sum('points_awarded'),
                ]
            ]
        ];
        
        // ⚡ Cache for 5 seconds - ALWAYS FRESH DATA
        Cache::put($cacheKey, $response, 5);
        
        return response()->json($response)
            ->header('Cache-Control', 'public, max-age=5, must-revalidate')
            ->header('ETag', md5(json_encode($response)));
    }

    /**
     * Get user's badge progress details
     */
    public function progress(Request $request)
    {
        $user = Auth::user();
        
        $progress = UserBadge::where('user_id', $user->id)
            ->with(['badge' => function ($query) {
                $query->select([
                    'id', 'name', 'slug', 'description', 'icon', 'color',
                    'requirement_type', 'requirement_value', 'points_reward', 'rarity'
                ])->with('category:category_id,category_name,icon');
            }])
            ->get()
            ->map(function ($userBadge) {
                $percentage = $userBadge->badge->requirement_value > 0
                    ? min((int)(($userBadge->progress / $userBadge->badge->requirement_value) * 100), 100)
                    : 0;
                
                return [
                    'badge' => $userBadge->badge,
                    'progress' => $userBadge->progress,
                    'requirement' => $userBadge->badge->requirement_value,
                    'percentage' => $percentage,
                    'is_earned' => $userBadge->is_earned,
                    'earned_at' => $userBadge->earned_at,
                    'is_favorited' => $userBadge->is_favorited,
                    'is_displayed' => $userBadge->is_displayed,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $progress
        ]);
    }

    /**
     * Toggle badge as favorite
     */
    public function toggleFavorite(Request $request, $badgeId)
    {
        $user = Auth::user();
        
        $userBadge = UserBadge::where('user_id', $user->id)
            ->where('badge_id', $badgeId)
            ->where('is_earned', true)
            ->first();

        if (!$userBadge) {
            return response()->json([
                'success' => false,
                'message' => 'Badge not found or not earned yet'
            ], 404);
        }

        $userBadge->is_favorited = !$userBadge->is_favorited;
        $userBadge->save();

        return response()->json([
            'success' => true,
            'message' => $userBadge->is_favorited ? 'Badge marked as favorite' : 'Badge removed from favorites',
            'data' => ['is_favorited' => $userBadge->is_favorited]
        ]);
    }

    /**
     * Toggle badge display on profile
     */
    public function toggleDisplay(Request $request, $badgeId)
    {
        $user = Auth::user();
        
        $userBadge = UserBadge::where('user_id', $user->id)
            ->where('badge_id', $badgeId)
            ->where('is_earned', true)
            ->first();

        if (!$userBadge) {
            return response()->json([
                'success' => false,
                'message' => 'Badge not found or not earned yet'
            ], 404);
        }

        // If enabling display, check if user already has 3 displayed badges
        if (!$userBadge->is_displayed) {
            $displayedCount = UserBadge::where('user_id', $user->id)
                ->where('is_earned', true)
                ->where('is_displayed', true)
                ->count();

            if ($displayedCount >= 3) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only display up to 3 badges on your profile'
                ], 400);
            }
        }

        $userBadge->is_displayed = !$userBadge->is_displayed;
        $userBadge->save();

        return response()->json([
            'success' => true,
            'message' => $userBadge->is_displayed ? 'Badge will be displayed on profile' : 'Badge removed from profile display',
            'data' => ['is_displayed' => $userBadge->is_displayed]
        ]);
    }
}
