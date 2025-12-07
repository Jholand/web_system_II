<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Models\UserRewardRedemption;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class OwnerDashboardController extends Controller
{
    /**
     * Get owner dashboard statistics
     */
    public function index(Request $request): JsonResponse
    {
        $owner = $request->user();
        $cacheKey = "owner_dashboard_{$owner->id}";
        
        // Cache for 5 minutes (300 seconds)
        $stats = Cache::remember($cacheKey, 300, function() use ($owner) {
            // Get owner's destinations
            $destinations = Destination::where('owner_id', $owner->id)->get();
            $destinationIds = $destinations->pluck('destination_id');
            
            // Get statistics
            return [
                'total_destinations' => $destinations->count(),
                'total_visits' => $destinations->sum('total_visits'),
                'total_reviews' => $destinations->sum('total_reviews'),
                'average_rating' => $destinations->avg('average_rating'),
                
                // Pending redemptions (rewards to be claimed at owner's destinations)
                'pending_redemptions' => UserRewardRedemption::whereHas('reward.destinations', function($query) use ($destinationIds) {
                    $query->whereIn('destinations.destination_id', $destinationIds);
                })->where('status', 'pending')->count(),
                
                // Recent redemptions
                'recent_redemptions' => UserRewardRedemption::whereHas('reward.destinations', function($query) use ($destinationIds) {
                    $query->whereIn('destinations.destination_id', $destinationIds);
                })
                ->with(['user', 'reward'])
                ->orderBy('redeemed_at', 'desc')
                ->limit(10)
                ->get(),
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
    
    /**
     * Get owner's destinations
     */
    public function destinations(Request $request): JsonResponse
    {
        $owner = $request->user();
        $cacheKey = "owner_destinations_{$owner->id}";
        
        // Cache for 10 minutes (600 seconds)
        $destinations = Cache::remember($cacheKey, 600, function() use ($owner) {
            return Destination::where('owner_id', $owner->id)
                ->with('category:category_id,category_name,icon,description')
                ->get()
                ->map(function ($destination) {
                    return [
                        'destination_id' => $destination->destination_id,
                        'name' => mb_convert_encoding($destination->name ?? '', 'UTF-8', 'UTF-8'),
                        'description' => mb_convert_encoding($destination->description ?? '', 'UTF-8', 'UTF-8'),
                        'address' => mb_convert_encoding($destination->address ?? '', 'UTF-8', 'UTF-8'),
                        'latitude' => $destination->latitude,
                        'longitude' => $destination->longitude,
                        'category' => $destination->category ? [
                            'category_id' => $destination->category->category_id,
                            'name' => mb_convert_encoding($destination->category->category_name ?? '', 'UTF-8', 'UTF-8'),
                            'icon' => $destination->category->icon,
                        ] : null,
                        'total_visits' => $destination->total_visits ?? 0,
                        'total_reviews' => $destination->total_reviews ?? 0,
                        'average_rating' => (float) ($destination->average_rating ?? 0),
                        'status' => $destination->status,
                        'created_at' => $destination->created_at,
                    ];
                });
        });
        
        return response()->json([
            'success' => true,
            'data' => $destinations
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }
    
    /**
     * Get pending redemptions for owner's destinations
     */
    public function redemptions(Request $request): JsonResponse
    {
        $owner = $request->user();
        $status = $request->input('status', 'all');
        
        // Get all destinations owned by this owner
        $destinationIds = Destination::where('owner_id', $owner->id)
            ->pluck('destination_id')
            ->toArray();
        
        // Only show redemptions for destinations the owner actually owns
        $query = UserRewardRedemption::where(function($q) use ($destinationIds) {
            $q->whereIn('destination_id', $destinationIds) // Redeemed at owner's destination
              ->orWhereNull('destination_id'); // Or no specific destination (legacy)
        })
        ->whereHas('reward.destinations', function($q) use ($destinationIds) {
            // And reward must be available at owner's destinations
            $q->whereIn('destinations.destination_id', $destinationIds);
        })
        ->with(['user', 'reward', 'destination']);
        
        if ($status !== 'all') {
            $query->where('status', $status);
        }
        
        $redemptions = $query->orderBy('redeemed_at', 'desc')
            ->paginate($request->input('per_page', 15));
        
        return response()->json([
            'success' => true,
            'data' => $redemptions->items(),
            'meta' => [
                'total' => $redemptions->total(),
                'per_page' => $redemptions->perPage(),
                'current_page' => $redemptions->currentPage(),
                'last_page' => $redemptions->lastPage(),
            ]
        ]);
    }
    
    /**
     * Verify and claim a reward redemption
     * ⚡ IMPROVED: Now validates destination match and updates stock properly
     */
    public function claimRedemption(Request $request, $code): JsonResponse
    {
        $request->validate([
            'destination_id' => 'required|exists:destinations,destination_id',
        ]);

        $owner = $request->user();
        $claimDestinationId = $request->input('destination_id');
        
        $redemption = UserRewardRedemption::where('redemption_code', $code)
            ->with(['user', 'reward.destinations'])
            ->firstOrFail();
        
        // ⚡ VALIDATION 1: Check if owner owns the destination they're claiming at
        $ownerDestination = Destination::where('destination_id', $claimDestinationId)
            ->where('owner_id', $owner->id)
            ->first();
            
        if (!$ownerDestination) {
            \Log::error('❌ Validation 1 Failed: Owner does not own destination', [
                'owner_id' => $owner->id,
                'destination_id' => $claimDestinationId
            ]);
            return response()->json([
                'success' => false,
                'message' => 'You do not own this destination'
            ], 403);
        }
        
        // ⚡ VALIDATION 2: Check if reward can be used at this specific destination
        $rewardDestinationIds = $redemption->reward->destinations->pluck('destination_id')->toArray();
        
        if (!in_array($claimDestinationId, $rewardDestinationIds)) {
            \Log::error('❌ Validation 2 Failed: Reward not available at destination', [
                'reward_id' => $redemption->reward_id,
                'claim_destination_id' => $claimDestinationId,
                'reward_destination_ids' => $rewardDestinationIds
            ]);
            return response()->json([
                'success' => false,
                'message' => 'This reward cannot be claimed at this destination. Available at: ' . 
                    implode(', ', $redemption->reward->destinations->pluck('name')->toArray())
            ], 403);
        }
        
        // ⚡ VALIDATION 3: Check if reward was originally redeemed for this destination
        if ($redemption->destination_id && $redemption->destination_id != $claimDestinationId) {
            \Log::error('❌ Validation 3 Failed: Destination mismatch', [
                'redemption_destination_id' => $redemption->destination_id,
                'claim_destination_id' => $claimDestinationId
            ]);
            return response()->json([
                'success' => false,
                'message' => 'This reward was redeemed for a different destination. Expected: ' . 
                    Destination::find($redemption->destination_id)?->name . ', Got: ' . $ownerDestination->name
            ], 403);
        }
        
        // ⚡ VALIDATION 4: Check if redemption is valid
        if ($redemption->status !== 'pending' && $redemption->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This redemption is no longer valid. Status: ' . $redemption->status
            ], 400);
        }
        
        // ⚡ VALIDATION 5: Check if expired
        if ($redemption->valid_until < now()) {
            $redemption->update(['status' => 'expired']);
            return response()->json([
                'success' => false,
                'message' => 'This redemption code has expired'
            ], 400);
        }
        
        // ⚡ ALL VALIDATIONS PASSED - Claim the redemption
        DB::beginTransaction();
        try {
            $redemption->update([
                'status' => 'used',
                'used_at' => now(),
                'verified_by' => $owner->id,
                'claimed_destination_id' => $claimDestinationId,
                'used_location' => $ownerDestination->name
            ]);
            
            // ⚡ No stock deduction here - stock was already deducted when user redeemed
            // This just marks it as "used/claimed" by the owner
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Reward claimed successfully at ' . $ownerDestination->name,
                'data' => $redemption->fresh(['user', 'reward'])
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to claim reward: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get redemption details by code
     */
    public function getRedemptionByCode(Request $request, $code): JsonResponse
    {
        $owner = $request->user();
        
        $redemption = UserRewardRedemption::where('redemption_code', $code)
            ->with(['user', 'reward.destinations'])
            ->first();
        
        if (!$redemption) {
            return response()->json([
                'success' => false,
                'message' => 'Redemption code not found'
            ], 404);
        }
        
        // Check if owner owns any destination where this reward can be claimed
        $ownerDestinationIds = Destination::where('owner_id', $owner->id)
            ->pluck('destination_id');
        
        $rewardDestinationIds = $redemption->reward->destinations->pluck('destination_id');
        
        $hasAccess = $ownerDestinationIds->intersect($rewardDestinationIds)->isNotEmpty();
        
        if (!$hasAccess) {
            return response()->json([
                'success' => false,
                'message' => 'This reward cannot be claimed at your destinations'
            ], 403);
        }
        
        return response()->json([
            'success' => true,
            'data' => $redemption
        ]);
    }

    /**
     * Get owner's rewards
     */
    public function getRewards(Request $request): JsonResponse
    {
        $owner = $request->user();
        
        // Get owner's destinations
        $destinationIds = Destination::where('owner_id', $owner->id)
            ->pluck('destination_id');
        
        // Get rewards available at owner's destinations OR created by the owner
        $query = \App\Models\Reward::with(['category', 'destinations', 'creator:id,first_name,last_name,email'])
            ->where(function($q) use ($destinationIds, $owner) {
                $q->whereHas('destinations', function($sub) use ($destinationIds) {
                    $sub->whereIn('destinations.destination_id', $destinationIds);
                })
                ->orWhere('created_by', $owner->id);
            });
        
        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Apply category filter
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }
        
        // Paginate
        $perPage = min($request->get('per_page', 9), 100);
        $rewards = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        // Add can_edit, can_delete flags and creator name
        $rewardsData = $rewards->getCollection()->map(function($reward) use ($owner) {
            $rewardArray = $reward->toArray();
            $rewardArray['can_edit'] = $reward->created_by === $owner->id;
            $rewardArray['can_delete'] = $reward->created_by === $owner->id;
            $rewardArray['created_by_name'] = $reward->creator 
                ? $reward->creator->first_name . ' ' . $reward->creator->last_name 
                : 'Unknown';
            return $rewardArray;
        });
        
        return response()->json([
            'success' => true,
            'data' => $rewardsData,
            'meta' => [
                'current_page' => $rewards->currentPage(),
                'last_page' => $rewards->lastPage(),
                'per_page' => $rewards->perPage(),
                'total' => $rewards->total(),
            ]
        ]);
    }

    /**
     * Create a new reward
     */
    public function storeReward(Request $request): JsonResponse
    {
        $owner = $request->user();
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:destination_categories,category_id',
            'points_required' => 'required|integer|min:1',
            'stock_quantity' => 'nullable|integer|min:0',
            'stock_unlimited' => 'nullable|boolean',
            'destination_ids' => 'required|array|min:1',
            'destination_ids.*' => 'exists:destinations,destination_id',
            'is_active' => 'boolean',
        ]);
        
        // Verify owner owns all specified destinations
        $ownerDestinationIds = Destination::where('owner_id', $owner->id)
            ->pluck('destination_id')
            ->toArray();
        
        $invalidDestinations = array_diff($validated['destination_ids'], $ownerDestinationIds);
        
        if (!empty($invalidDestinations)) {
            return response()->json([
                'success' => false,
                'message' => 'You can only add rewards to your own destinations'
            ], 403);
        }
        
        // Create reward
        $reward = \App\Models\Reward::create([
            'title' => $validated['title'],
            'slug' => \Illuminate\Support\Str::slug($validated['title']),
            'description' => $validated['description'] ?? null,
            'category_id' => $validated['category_id'],
            'points_required' => $validated['points_required'],
            'stock_quantity' => $validated['stock_unlimited'] ?? false ? 0 : ($validated['stock_quantity'] ?? 0),
            'stock_unlimited' => $validated['stock_unlimited'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => $owner->id,
        ]);
        
        // Attach destinations
        $reward->destinations()->attach($validated['destination_ids']);
        
        return response()->json([
            'success' => true,
            'message' => 'Reward created successfully',
            'data' => $reward->load(['category', 'destinations'])
        ], 201);
    }

    /**
     * Update a reward
     */
    public function updateReward(Request $request, $id): JsonResponse
    {
        $owner = $request->user();
        
        $reward = \App\Models\Reward::with('destinations')->findOrFail($id);
        
        // Verify owner has access to this reward (owns at least one destination where reward is available)
        $ownerDestinationIds = Destination::where('owner_id', $owner->id)
            ->pluck('destination_id');
        
        $rewardDestinationIds = $reward->destinations->pluck('destination_id');
        
        if ($ownerDestinationIds->intersect($rewardDestinationIds)->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to this reward'
            ], 403);
        }
        
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'sometimes|required|exists:destination_categories,category_id',
            'points_required' => 'sometimes|required|integer|min:1',
            'stock_quantity' => 'nullable|integer|min:0',
            'stock_unlimited' => 'nullable|boolean',
            'destination_ids' => 'sometimes|array|min:1',
            'destination_ids.*' => 'exists:destinations,destination_id',
            'is_active' => 'boolean',
        ]);
        
        // Update reward
        if (isset($validated['title'])) {
            $reward->title = $validated['title'];
            $reward->slug = \Illuminate\Support\Str::slug($validated['title']);
        }
        
        if (isset($validated['description'])) {
            $reward->description = $validated['description'];
        }
        
        if (isset($validated['category_id'])) {
            $reward->category_id = $validated['category_id'];
        }
        
        if (isset($validated['points_required'])) {
            $reward->points_required = $validated['points_required'];
        }
        
        if (isset($validated['stock_unlimited'])) {
            $reward->stock_unlimited = $validated['stock_unlimited'];
            if ($validated['stock_unlimited']) {
                $reward->stock_quantity = 0;
            }
        }
        
        if (isset($validated['stock_quantity']) && !($validated['stock_unlimited'] ?? $reward->stock_unlimited)) {
            $reward->stock_quantity = $validated['stock_quantity'];
        }
        
        if (isset($validated['is_active'])) {
            $reward->is_active = $validated['is_active'];
        }
        
        $reward->save();
        
        // Update destinations if provided
        if (isset($validated['destination_ids'])) {
            // Verify owner owns all specified destinations
            $invalidDestinations = array_diff($validated['destination_ids'], $ownerDestinationIds->toArray());
            
            if (!empty($invalidDestinations)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only add rewards to your own destinations'
                ], 403);
            }
            
            $reward->destinations()->sync($validated['destination_ids']);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Reward updated successfully',
            'data' => $reward->load(['category', 'destinations'])
        ]);
    }

    /**
     * Delete a reward
     */
    public function destroyReward($id): JsonResponse
    {
        $owner = request()->user();
        
        $reward = \App\Models\Reward::with('destinations')->findOrFail($id);
        
        // Verify owner has access to this reward
        $ownerDestinationIds = Destination::where('owner_id', $owner->id)
            ->pluck('destination_id');
        
        $rewardDestinationIds = $reward->destinations->pluck('destination_id');
        
        if ($ownerDestinationIds->intersect($rewardDestinationIds)->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to this reward'
            ], 403);
        }
        
        // Check if reward has been redeemed
        if ($reward->redemptions()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete reward with existing redemptions'
            ], 422);
        }
        
        $reward->destinations()->detach();
        $reward->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Reward deleted successfully'
        ]);
    }
}
