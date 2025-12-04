<?php

namespace App\Http\Controllers;

use App\Models\Reward;
use App\Http\Requests\StoreRewardRequest;
use App\Http\Requests\UpdateRewardRequest;
use App\Http\Resources\RewardResource;
use App\Traits\ApiResponses;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RewardController extends Controller
{
    use ApiResponses;

    /**
     * Display a listing of rewards (CACHED).
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'category_id', 'is_active', 'is_featured']);
        
        // Cache for 5 minutes
        $cacheKey = 'rewards.' . md5(json_encode($filters));
        
        $rewards = Cache::remember($cacheKey, 300, function () use ($filters) {
            // ⚡ Load full category (no select) - DestinationCategoryResource transforms it
            $query = Reward::with(['category', 'destinations:destination_id,name']);

            // Apply filters using indexed columns
            if (!empty($filters['search'])) {
                $query->search($filters['search']);
            }

            if (!empty($filters['category_id'])) {
                $query->where('category_id', $filters['category_id']);
            }

            if (isset($filters['is_active'])) {
                $query->where('is_active', $filters['is_active']);
            }

            if (isset($filters['is_featured'])) {
                $query->where('is_featured', $filters['is_featured']);
            }

            return $query->orderBy('is_featured', 'desc')
                        ->orderBy('points_required', 'asc')
                        ->get();
        });

        return RewardResource::collection($rewards);
    }

    /**
     * Store a newly created reward (OPTIMIZED).
     */
    public function store(StoreRewardRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        $reward = Reward::create($data);
        
        // Sync destinations if provided
        if ($request->has('destination_ids')) {
            $reward->destinations()->sync($request->input('destination_ids', []));
        }
        
        $reward->load(['category', 'destinations']);

        // Clear cache (removed tags - not supported by file driver)
        $this->clearRewardCache();

        return $this->createdResponse(
            new RewardResource($reward),
            'Reward created successfully'
        );
    }

    /**
     * Display the specified reward (CACHED).
     */
    public function show(Reward $reward)
    {
        $cachedReward = Cache::remember("reward.{$reward->id}", 1800, function () use ($reward) {
            return $reward->load(['category', 'destinations']);
        });

        return new RewardResource($cachedReward);
    }

    /**
     * Update the specified reward (OPTIMIZED).
     */
    public function update(UpdateRewardRequest $request, Reward $reward): JsonResponse
    {
        Log::info('🔵 Update reward called', [
            'reward_id' => $reward->id,
            'user_id' => $request->user()?->id,
            'user_role' => $request->user()?->role_id,
            'request_data' => $request->all()
        ]);
        
        $data = $request->validated();
        
        $reward->update($data);
        
        // Sync destinations if provided
        if ($request->has('destination_ids')) {
            $reward->destinations()->sync($request->input('destination_ids', []));
        }
        
        $reward->load(['category', 'destinations']);

        // Clear cache
        Cache::forget("reward.{$reward->id}");
        $this->clearRewardCache();

        return $this->successResponse(
            new RewardResource($reward),
            'Reward updated successfully'
        );
    }

    /**
     * Remove the specified reward (SOFT DELETE).
     */
    public function destroy(Reward $reward): JsonResponse
    {
        $reward->delete();

        // Clear cache
        Cache::forget("reward.{$reward->id}");
        $this->clearRewardCache();

        return $this->deletedResponse('Reward deleted successfully');
    }

    /**
     * Clear reward-related caches.
     */
    protected function clearRewardCache(): void
    {
        $commonFilters = [
            [], // No filters
            ['is_active' => true],
            ['is_active' => false],
            ['is_featured' => true],
            ['is_featured' => false],
        ];

        // Clear category filters (1-20)
        for ($i = 1; $i <= 20; $i++) {
            $commonFilters[] = ['category_id' => $i];
            $commonFilters[] = ['category_id' => $i, 'is_active' => true];
        }

        // Clear all common filter combinations
        foreach ($commonFilters as $filters) {
            $cacheKey = 'rewards.' . md5(json_encode($filters));
            Cache::forget($cacheKey);
        }
    }
}
