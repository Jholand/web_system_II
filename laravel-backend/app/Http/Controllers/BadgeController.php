<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Http\Requests\StoreBadgeRequest;
use App\Http\Requests\UpdateBadgeRequest;
use App\Http\Resources\BadgeResource;
use App\Services\BadgeService;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class BadgeController extends Controller
{
    use ApiResponses;

    protected $badgeService;

    public function __construct(BadgeService $badgeService)
    {
        $this->badgeService = $badgeService;
    }

    /**
     * Display a listing of badges (OPTIMIZED WITH CACHING).
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'rarity', 'requirement_type', 'is_active', 'is_hidden', 'category_id']);
        
        $badges = $this->badgeService->getBadges($filters);

        return BadgeResource::collection($badges);
    }

    /**
     * Store a newly created badge (OPTIMIZED).
     */
    public function store(StoreBadgeRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        // Handle file upload for icon
        if ($request->hasFile('icon') && $request->file('icon')->isValid()) {
            $iconPath = $request->file('icon')->store('badges', 'public');
            $data['icon'] = $iconPath;
        }
        
        $badge = Badge::create($data);
        $badge->load('category');

        // Clear cache
        $this->badgeService->clearCache();

        return $this->createdResponse(
            new BadgeResource($badge),
            'Badge created successfully'
        );
    }

    /**
     * Display the specified badge (CACHED).
     */
    public function show($id)
    {
        $badge = Badge::findOrFail($id);
        
        $cachedBadge = Cache::remember("badge.{$badge->id}", 1800, function () use ($badge) {
            return $badge->load(['category', 'userBadges']);
        });

        return new BadgeResource($cachedBadge);
    }

    /**
     * Update the specified badge (OPTIMIZED).
     */
    public function update(UpdateBadgeRequest $request, $id): JsonResponse
    {
        // Find badge by ID
        $badge = Badge::findOrFail($id);
        
        $data = $request->validated();
        
        Log::info('Updating badge', ['badge_id' => $id, 'data' => $data]);
        
        // Handle file upload for icon
        if ($request->hasFile('icon') && $request->file('icon')->isValid()) {
            $iconPath = $request->file('icon')->store('badges', 'public');
            $data['icon'] = $iconPath;
        }
        
        $badge->update($data);
        $badge->load('category');

        // Clear cache
        $this->badgeService->clearCache($badge->id);

        return $this->successResponse(
            new BadgeResource($badge),
            'Badge updated successfully'
        );
    }

    /**
     * Remove the specified badge (OPTIMIZED).
     */
    public function destroy($id): JsonResponse
    {
        $badge = Badge::findOrFail($id);
        
        // Check if badge has been earned by users
        $earnedCount = $badge->userBadges()->where('is_earned', true)->count();
        
        if ($earnedCount > 0) {
            return $this->errorResponse(
                "Cannot delete badge. It has been earned by {$earnedCount} user(s). Consider deactivating it instead.",
                422
            );
        }

        $badge->delete();

        // Clear cache
        $this->badgeService->clearCache($badge->id);

        return $this->deletedResponse('Badge deleted successfully');
    }

    /**
     * Toggle badge active status (OPTIMIZED).
     */
    public function toggleActive($id): JsonResponse
    {
        $badge = Badge::findOrFail($id);
        
        $badge->update(['is_active' => !$badge->is_active]);

        // Clear cache
        $this->badgeService->clearCache($badge->id);

        return $this->successResponse(
            new BadgeResource($badge),
            'Badge status updated successfully'
        );
    }

    /**
     * Bulk update display order.
     */
    public function updateOrder(Request $request): JsonResponse
    {
        $request->validate([
            'badges' => ['required', 'array'],
            'badges.*.id' => ['required', 'exists:badges,id'],
            'badges.*.display_order' => ['required', 'integer'],
        ]);

        foreach ($request->badges as $badgeData) {
            Badge::where('id', $badgeData['id'])->update([
                'display_order' => $badgeData['display_order'],
            ]);
        }

        return response()->json([
            'message' => 'Badge order updated successfully',
        ]);
    }

    /**
     * Get badges by rarity.
     */
    public function byRarity(Request $request, string $rarity)
    {
        $query = Badge::query()
            ->byRarity($rarity)
            ->with('category')
            ->orderBy('display_order')
            ->orderBy('name');

        if ($request->boolean('active_only')) {
            $query->active();
        }

        if ($request->boolean('visible_only')) {
            $query->visible();
        }

        $perPage = min($request->get('per_page', 15), 100);
        $badges = $query->paginate($perPage);

        return BadgeResource::collection($badges);
    }
}
