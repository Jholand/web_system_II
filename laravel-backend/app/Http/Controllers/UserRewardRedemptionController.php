<?php

namespace App\Http\Controllers;

use App\Models\Reward;
use App\Models\User;
use App\Models\UserRewardRedemption;
use App\Models\UserPointsTransaction;
use App\Models\Destination;
use App\Traits\ApiResponses;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class UserRewardRedemptionController extends Controller
{
    use ApiResponses;

    /**
     * Get user's redeemed rewards
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $redemptions = UserRewardRedemption::with('reward:id,title,points_required')
            ->where('user_id', $user->id)
            ->orderBy('redeemed_at', 'desc')
            ->get()
            ->map(function ($redemption) {
                // Sanitize UTF-8 encoding
                $title = $redemption->reward?->title ?? '';
                $title = mb_convert_encoding($title, 'UTF-8', 'UTF-8');
                
                return [
                    'id' => $redemption->id,
                    'reward_id' => $redemption->reward_id,
                    'reward_title' => $title,
                    'points_spent' => $redemption->points_spent,
                    'redemption_code' => $redemption->redemption_code,
                    'status' => $redemption->status,
                    'valid_until' => $redemption->valid_until?->toISOString(),
                    'redeemed_at' => $redemption->redeemed_at?->toISOString(),
                ];
            });

        return $this->successResponse($redemptions);
    }

    /**
     * Redeem a reward with location validation
     * ⚡ OPTIMIZED: Strong distance validation - prevents bypass attempts
     */
    public function redeem(Request $request, $rewardId): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'destination_id' => 'required|exists:destinations,destination_id'
        ]);

        $user = $request->user();
        
        // Get reward with destinations
        $reward = Reward::with('destinations')->findOrFail($rewardId);

        // Check if reward is active and available
        if (!$reward->is_active) {
            return $this->errorResponse('This reward is no longer available', 400);
        }

        // Check if reward is valid (date range)
        if ($reward->valid_from && Carbon::parse($reward->valid_from)->isFuture()) {
            return $this->errorResponse('This reward is not yet available', 400);
        }

        if ($reward->valid_until && Carbon::parse($reward->valid_until)->isPast()) {
            return $this->errorResponse('This reward has expired', 400);
        }

        // Check stock
        if (!$reward->stock_unlimited && $reward->stock_quantity <= 0) {
            return $this->errorResponse('This reward is out of stock', 400);
        }

        // Check user's points
        if ($user->total_points < $reward->points_required) {
            return $this->errorResponse('Insufficient points. You need ' . $reward->points_required . ' points.', 400);
        }

        // Check if reward can be redeemed at this destination
        $destinationId = $request->input('destination_id');
        if (!$reward->canBeUsedAt($destinationId)) {
            return $this->errorResponse('This reward cannot be redeemed at the selected destination', 400);
        }

        // Get destination coordinates
        $destination = Destination::findOrFail($destinationId);

        // Calculate distance (Haversine formula)
        $distance = $this->calculateDistance(
            $request->input('latitude'),
            $request->input('longitude'),
            $destination->latitude,
            $destination->longitude
        );

        // ⚡ CRITICAL: Check if user is within 200 meters (STRICT ENFORCEMENT)
        if ($distance > 200) {
            return $this->errorResponse(
                'You must be within 200 meters of ' . $destination->name . ' to redeem this reward. You are currently ' . round($distance) . ' meters away. Please move closer to the destination.',
                403 // 403 Forbidden - cannot bypass this
            );
        }

        // Check max redemptions per user
        $userRedemptionCount = UserRewardRedemption::where('user_id', $user->id)
            ->where('reward_id', $rewardId)
            ->whereIn('status', ['pending', 'active', 'used'])
            ->count();

        if ($userRedemptionCount >= $reward->max_redemptions_per_user) {
            return $this->errorResponse('You have reached the maximum redemption limit for this reward', 400);
        }

        DB::beginTransaction();
        try {
            // Deduct points from user
            $user->total_points -= $reward->points_required;
            $user->save();

            // Create points transaction record
            UserPointsTransaction::create([
                'user_id' => $user->id,
                'points' => -$reward->points_required,
                'balance_after' => $user->total_points,
                'transaction_type' => 'redeemed',
                'description' => 'Redeemed reward: ' . $reward->title,
                'reference_type' => 'reward',
                'reference_id' => $reward->id,
            ]);

            // Create redemption record
            $redemption = UserRewardRedemption::create([
                'user_id' => $user->id,
                'reward_id' => $reward->id,
                'points_spent' => $reward->points_required,
                'redemption_code' => $this->generateRedemptionCode(),
                'status' => 'active',
                'valid_until' => now()->addDays($reward->redemption_period_days),
                'redeemed_at' => now(),
            ]);

            // Update reward stock if not unlimited
            if (!$reward->stock_unlimited) {
                $reward->decrement('stock_quantity');
            }

            // Update total redeemed count
            $reward->increment('total_redeemed');

            DB::commit();

            // Don't load relationships to avoid UTF-8 encoding issues
            return $this->successResponse([
                'redemption_code' => $redemption->redemption_code,
                'reward_id' => $redemption->reward_id,
                'points_spent' => $redemption->points_spent,
                'valid_until' => $redemption->valid_until,
                'remaining_points' => $user->total_points,
                'message' => 'Reward redeemed successfully! Code: ' . $redemption->redemption_code
            ], 'Reward redeemed successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to redeem reward: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Change/swap redeemed reward with location validation
     * ⚡ OPTIMIZED: Strong distance validation - prevents bypass attempts
     */
    public function change(Request $request, $redemptionId): JsonResponse
    {
        $request->validate([
            'new_reward_id' => 'required|exists:rewards,id',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'destination_id' => 'required|exists:destinations,destination_id'
        ]);

        $user = $request->user();
        
        // Get current redemption
        $oldRedemption = UserRewardRedemption::where('id', $redemptionId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Only allow changing active/pending redemptions
        if (!in_array($oldRedemption->status, ['pending', 'active'])) {
            return $this->errorResponse('This redemption cannot be changed (status: ' . $oldRedemption->status . ')', 400);
        }

        // Get new reward
        $newReward = Reward::with('destinations')->findOrFail($request->input('new_reward_id'));

        // Check if new reward is active
        if (!$newReward->is_active) {
            return $this->errorResponse('The selected reward is no longer available', 400);
        }

        // Check if new reward can be redeemed at this destination
        $destinationId = $request->input('destination_id');
        if (!$newReward->canBeUsedAt($destinationId)) {
            return $this->errorResponse('The selected reward cannot be redeemed at this destination', 400);
        }

        // Get destination coordinates
        $destination = Destination::findOrFail($destinationId);

        // Calculate distance
        $distance = $this->calculateDistance(
            $request->input('latitude'),
            $request->input('longitude'),
            $destination->latitude,
            $destination->longitude
        );

        // ⚡ CRITICAL: Check if user is within 200 meters (STRICT ENFORCEMENT)
        if ($distance > 200) {
            return $this->errorResponse(
                'You must be within 200 meters of ' . $destination->name . ' to change this reward. You are currently ' . round($distance) . ' meters away. Please move closer to the destination.',
                403 // 403 Forbidden - cannot bypass this
            );
        }

        // Calculate point difference
        $pointDifference = $newReward->points_required - $oldRedemption->points_spent;
        
        // Load old reward for later use
        $oldReward = $oldRedemption->reward;

        // Check if user has enough points for the difference
        if ($pointDifference > 0 && $user->total_points < $pointDifference) {
            return $this->errorResponse('Insufficient points. You need ' . $pointDifference . ' more points to change to this reward.', 400);
        }

        DB::beginTransaction();
        try {
            // Adjust user points and create transaction
            if ($pointDifference > 0) {
                // New reward costs more - deduct difference
                $user->total_points -= $pointDifference;
                
                UserPointsTransaction::create([
                    'user_id' => $user->id,
                    'points' => -$pointDifference,
                    'balance_after' => $user->total_points,
                    'transaction_type' => 'redeemed',
                    'description' => 'Changed to reward: ' . $newReward->title . ' (additional cost)',
                    'reference_type' => 'reward',
                    'reference_id' => $newReward->id,
                ]);
            } else if ($pointDifference < 0) {
                // New reward costs less - refund difference
                $user->total_points += abs($pointDifference);
                
                UserPointsTransaction::create([
                    'user_id' => $user->id,
                    'points' => abs($pointDifference),
                    'balance_after' => $user->total_points,
                    'transaction_type' => 'refund',
                    'description' => 'Refund from changing reward: ' . $oldReward->title . ' to ' . $newReward->title,
                    'reference_type' => 'reward',
                    'reference_id' => $oldRedemption->id,
                ]);
            }
            $user->save();

            // Cancel old redemption
            $oldRedemption->status = 'cancelled';
            $oldRedemption->notes = 'Changed to reward ID: ' . $newReward->id;
            $oldRedemption->save();

            // Restore old reward stock (already loaded above)
            if (!$oldReward->stock_unlimited) {
                $oldReward->increment('stock_quantity');
            }
            $oldReward->decrement('total_redeemed');

            // Create new redemption
            $newRedemption = UserRewardRedemption::create([
                'user_id' => $user->id,
                'reward_id' => $newReward->id,
                'points_spent' => $newReward->points_required,
                'redemption_code' => $this->generateRedemptionCode(),
                'status' => 'active',
                'valid_until' => now()->addDays($newReward->redemption_period_days),
                'redeemed_at' => now(),
                'notes' => 'Changed from redemption ID: ' . $oldRedemption->id
            ]);

            // Update new reward stock
            if (!$newReward->stock_unlimited) {
                $newReward->decrement('stock_quantity');
            }
            $newReward->increment('total_redeemed');

            DB::commit();

            $newRedemption->load('reward.destinations');

            return $this->successResponse([
                'redemption' => $newRedemption,
                'remaining_points' => $user->total_points,
                'point_difference' => $pointDifference,
                'message' => 'Reward changed successfully! Your new redemption code is: ' . $newRedemption->redemption_code
            ], 'Reward changed successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to change reward: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Calculate distance between two coordinates in meters (Haversine formula)
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $earthRadius = 6371000; // Earth's radius in meters

        $lat1Rad = deg2rad($lat1);
        $lat2Rad = deg2rad($lat2);
        $deltaLatRad = deg2rad($lat2 - $lat1);
        $deltaLonRad = deg2rad($lon2 - $lon1);

        $a = sin($deltaLatRad / 2) * sin($deltaLatRad / 2) +
             cos($lat1Rad) * cos($lat2Rad) *
             sin($deltaLonRad / 2) * sin($deltaLonRad / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Generate unique redemption code
     */
    private function generateRedemptionCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (UserRewardRedemption::where('redemption_code', $code)->exists());

        return $code;
    }

    /**
     * Get available rewards at user's current location
     */
    public function getAvailableAtLocation(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $user = $request->user();
        $userLat = $request->input('latitude');
        $userLon = $request->input('longitude');

        // Get all destinations within 100m radius
        $nearbyDestinations = Destination::select('destination_id', 'name', 'latitude', 'longitude')
            ->get()
            ->filter(function ($destination) use ($userLat, $userLon) {
                $distance = $this->calculateDistance(
                    $userLat,
                    $userLon,
                    $destination->latitude,
                    $destination->longitude
                );
                return $distance <= 200;
            })
            ->pluck('destination_id');

        if ($nearbyDestinations->isEmpty()) {
            return $this->successResponse([
                'rewards' => [],
                'message' => 'No destinations within 200 meters. Move closer to a destination to see available rewards.'
            ]);
        }

        // Get rewards available at these destinations
        $rewards = Reward::with(['destinations', 'category'])
            ->whereHas('destinations', function ($query) use ($nearbyDestinations) {
                $query->whereIn('destinations.destination_id', $nearbyDestinations);
            })
            ->where('is_active', true)
            ->available()
            ->valid()
            ->get()
            ->map(function ($reward) {
                // Clean data to avoid UTF-8 encoding issues
                return [
                    'id' => $reward->id,
                    'title' => $reward->title,
                    'description' => $reward->description,
                    'points_required' => $reward->points_required,
                    'category' => $reward->category ? [
                        'id' => $reward->category->id,
                        'category_name' => $reward->category->category_name,
                        // Skip icon field if it causes issues
                    ] : null,
                    'destinations' => $reward->destinations->map(function ($dest) {
                        return [
                            'destination_id' => $dest->destination_id,
                            'name' => $dest->name,
                        ];
                    }),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'rewards' => $rewards,
                'nearby_destinations' => $nearbyDestinations->count(),
                'user_points' => $user->total_points
            ]
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }
}
