<?php

namespace App\Http\Controllers;

use App\Models\UserCheckin;
use App\Models\Destination;
use App\Models\DestinationReview;
use App\Models\User;
use App\Models\UserPointsTransaction;
use App\Services\BadgeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * @method User user() Get the authenticated user
 */
class UserCheckinController extends Controller
{
    /**
     * Store a new check-in with review (requires authentication)
     */
    public function store(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'destination_id' => 'required|exists:destinations,destination_id',
            'qr_code' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            /** @var User $user */
            $user = Auth::user();
            
            // Verify destination exists and QR code matches
            $destination = Destination::where('destination_id', $request->destination_id)
                ->where('status', 'active')
                ->first();

            if (!$destination) {
                return response()->json([
                    'success' => false,
                    'message' => 'Destination not found or inactive'
                ], 404);
            }

            // Verify QR code (case-insensitive)
            if (strtolower(trim($request->qr_code)) !== strtolower(trim($destination->qr_code))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid QR code'
                ], 400);
            }

            // Check if user already checked in today at this destination
            $existingCheckin = UserCheckin::where('user_id', $user->id)
                ->where('destination_id', $destination->destination_id)
                ->whereDate('checked_in_at', today())
                ->first();

            if ($existingCheckin) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already checked in at this destination today'
                ], 400);
            }

            // Create check-in
            $checkin = UserCheckin::create([
                'user_id' => $user->id,
                'destination_id' => $destination->destination_id,
                'checked_in_at' => now(),
                'points_earned' => $destination->points_reward,
                'checkin_method' => 'qr_code',
                'is_verified' => true,
            ]);

            // Create or update review (users can only have one review per destination)
            $review = DestinationReview::updateOrCreate(
                [
                    'destination_id' => $destination->destination_id,
                    'user_id' => $user->id,
                ],
                [
                    'rating' => $request->rating,
                    'review_text' => $request->review_text,
                    'status' => 'approved', // Auto-approve for now
                    'is_featured' => false,
                ]
            );

            // Award points to user
            $user->increment('total_points', $destination->points_reward);
            $user->refresh(); // Refresh to get updated total_points

            // Create points transaction record
            UserPointsTransaction::create([
                'user_id' => $user->id,
                'transaction_type' => 'earned',
                'points' => $destination->points_reward,
                'balance_after' => $user->total_points,
                'source_type' => 'checkin',
                'source_id' => $checkin->id,
                'related_destination_id' => $destination->destination_id,
                'description' => "Check-in at {$destination->name} with review (Rating: {$request->rating}/5)",
                'metadata' => [
                    'checkin_method' => 'qr_code',
                    'review_id' => $review->id,
                    'rating' => $request->rating,
                    'destination_name' => $destination->name,
                ],
                'transaction_date' => now(),
            ]);

            // Update destination stats
            $destination->increment('total_visits');
            $destination->increment('total_reviews');
            
            // Update average rating
            $avgRating = DestinationReview::where('destination_id', $destination->destination_id)
                ->where('status', 'approved')
                ->avg('rating');
            $destination->update(['average_rating' => round($avgRating, 2)]);

            DB::commit();

            // ✅ PERFORMANCE: Clear cached stats after successful checkin
            \Illuminate\Support\Facades\Cache::forget("user_checkin_stats_{$user->id}");

            // Check and award badges after successful checkin
            $badgeService = new BadgeService();
            $newBadges = $badgeService->checkAndAwardBadges($user->id);

            return response()->json([
                'success' => true,
                'message' => 'Check-in successful! Points awarded.',
                'data' => [
                    'checkin_id' => $checkin->id,
                    'points' => $destination->points_reward,
                    'total_points' => $user->total_points,
                    'new_badges' => collect($newBadges)->map(function(\App\Models\Badge $b) {
                        return [
                            'id' => $b->id,
                            'name' => $b->name,
                            'icon' => $b->icon,
                            'points_reward' => $b->points_reward,
                            'rarity' => $b->rarity,
                        ];
                    })->values()->all(),
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Check-in failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's check-in history
     */
    public function index(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        
        // ⚡ Cache for 5 seconds - ALWAYS FRESH DATA
        $cacheKey = "user_checkins_{$user->id}_page_" . ($request->get('page', 1));
        
        $checkins = \Illuminate\Support\Facades\Cache::remember($cacheKey, 5, function () use ($user) {
            return UserCheckin::where('user_id', $user->id)
                ->with(['destination:destination_id,name,points_reward,category_id'])
                ->orderBy('checked_in_at', 'desc')
                ->limit(20) // Faster than paginate for first page
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => $checkins
        ])->header('Cache-Control', 'public, max-age=5, must-revalidate');
    }

    /**
     * Get user's points transaction history
     */
    public function pointsHistory(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        
        $transactions = UserPointsTransaction::where('user_id', $user->id)
            ->with(['destination:destination_id,name'])
            ->orderBy('transaction_date', 'desc')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $transactions,
            'summary' => [
                'total_points' => $user->total_points,
                'points_earned' => UserPointsTransaction::where('user_id', $user->id)
                    ->where('transaction_type', 'earned')
                    ->sum('points'),
                'points_redeemed' => abs(UserPointsTransaction::where('user_id', $user->id)
                    ->where('transaction_type', 'redeemed')
                    ->sum('points')),
            ]
        ]);
    }

    /**
     * Get check-in statistics for the authenticated user
     * ✅ OPTIMIZED: Added caching (2 minutes) for instant response
     */
    public function stats(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        
        // ⚡ PERFORMANCE: Cache stats for 5 seconds - ALWAYS FRESH
        $cacheKey = "user_checkin_stats_{$user->id}";
        
        $stats = \Illuminate\Support\Facades\Cache::remember($cacheKey, 5, function () use ($user) {
            $today = now()->startOfDay();
            $weekStart = now()->startOfWeek();
            $monthStart = now()->startOfMonth();

            // ⚡ OPTIMIZED: Single query instead of 4 separate queries
            $result = \Illuminate\Support\Facades\DB::table('user_checkins')
                ->selectRaw("
                    COUNT(*) as all_time,
                    SUM(CASE WHEN checked_in_at >= ? THEN 1 ELSE 0 END) as today,
                    SUM(CASE WHEN checked_in_at >= ? THEN 1 ELSE 0 END) as this_week,
                    SUM(CASE WHEN checked_in_at >= ? THEN 1 ELSE 0 END) as this_month,
                    SUM(points_earned) as total_points,
                    MAX(checked_in_at) as last_checkin
                ", [$today, $weekStart, $monthStart])
                ->where('user_id', $user->id)
                ->first();

            return [
                'today' => (int) $result->today,
                'this_week' => (int) $result->this_week,
                'this_month' => (int) $result->this_month,
                'total_visits' => (int) $result->all_time,
                'all_time' => (int) $result->all_time,
                'total_points' => (int) $result->total_points,
                'badges_earned' => \App\Models\UserBadge::where('user_id', $user->id)->where('is_earned', true)->count(),
                'current_streak' => 0, // Can calculate if needed
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $stats
        ])->header('Cache-Control', 'public, max-age=5, must-revalidate');
    }
}
