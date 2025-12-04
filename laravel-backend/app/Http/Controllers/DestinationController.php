<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Http\Requests\StoreDestinationRequest;
use App\Http\Requests\UpdateDestinationRequest;
use App\Http\Resources\DestinationResource;
use App\Services\DestinationService;
use App\Traits\ApiResponses;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DestinationController extends Controller
{
    use ApiResponses;

    protected $destinationService;

    public function __construct(DestinationService $destinationService)
    {
        $this->destinationService = $destinationService;
    }

    /**
     * Display a listing of the resource (OPTIMIZED).
     */
    public function index(Request $request)
    {
        // Use optimized service with caching and selective column loading
        $filters = $request->only(['category_id', 'status', 'search', 'latitude', 'longitude', 'radius', 'sort_by', 'sort_order']);
        $perPage = min($request->get('per_page', 15), 100);
        $page = $request->get('page', 1);
        
        $destinations = $this->destinationService->getDestinations($filters, $perPage, $page);

        return DestinationResource::collection($destinations);
    }

    /**
     * Store a newly created resource in storage (OPTIMIZED).
     */
    public function store(StoreDestinationRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['name']);
        
        // Generate location point from coordinates
        $data['location'] = DB::raw("ST_GeomFromText('POINT({$data['longitude']} {$data['latitude']})')");
        
        // Set defaults
        $data['country'] = $data['country'] ?? 'Philippines';
        $data['points_reward'] = $data['points_reward'] ?? 50;
        $data['visit_radius'] = $data['visit_radius'] ?? 100;
        $data['status'] = $data['status'] ?? 'active';

        $destination = Destination::create($data);

        // Handle operating hours if provided
        if ($request->has('operating_hours') && is_array($request->operating_hours)) {
            $dayMap = ['Monday' => 1, 'Tuesday' => 2, 'Wednesday' => 3, 'Thursday' => 4, 'Friday' => 5, 'Saturday' => 6, 'Sunday' => 7];
            
            $operatingHoursData = collect($request->operating_hours)->map(function ($hours) use ($dayMap) {
                return [
                    'day_of_week' => $dayMap[$hours['day']] ?? 1,
                    'opens_at' => $hours['is_closed'] ? null : ($hours['opens'] ?? '09:00'),
                    'closes_at' => $hours['is_closed'] ? null : ($hours['closes'] ?? '18:00'),
                    'is_closed' => $hours['is_closed'] ?? false,
                ];
            })->toArray();
            
            $destination->operatingHours()->createMany($operatingHoursData);
        }

        // Clear all destination caches
        $this->destinationService->clearCache();
        Cache::forget('destinations.list');

        return $this->createdResponse(
            new DestinationResource($destination->load(['category', 'images', 'operatingHours'])),
            'Destination created successfully'
        );
    }

    /**
     * Display the specified resource (OPTIMIZED WITH CACHE).
     */
    public function show($id)
    {
        $destination = $this->destinationService->getDestinationById($id);
        return new DestinationResource($destination);
    }

    /**
     * Update the specified resource in storage (OPTIMIZED).
     */
    public function update(UpdateDestinationRequest $request, Destination $destination): JsonResponse
    {
        $data = $request->validated();
        
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        
        // Update location point if coordinates changed
        if (isset($data['latitude']) && isset($data['longitude'])) {
            $data['location'] = DB::raw("ST_GeomFromText('POINT({$data['longitude']} {$data['latitude']})')");
        }

        $destination->update($data);

        // Handle operating hours if provided (BATCH INSERT)
        if ($request->has('operating_hours') && is_array($request->operating_hours)) {
            $destination->operatingHours()->delete();
            
            $dayMap = ['Monday' => 1, 'Tuesday' => 2, 'Wednesday' => 3, 'Thursday' => 4, 'Friday' => 5, 'Saturday' => 6, 'Sunday' => 7];
            
            $operatingHoursData = collect($request->operating_hours)->map(function ($hours) use ($dayMap) {
                return [
                    'day_of_week' => $dayMap[$hours['day']] ?? 1,
                    'opens_at' => $hours['is_closed'] ? null : ($hours['opens'] ?? '09:00'),
                    'closes_at' => $hours['is_closed'] ? null : ($hours['closes'] ?? '18:00'),
                    'is_closed' => $hours['is_closed'] ?? false,
                ];
            })->toArray();
            
            $destination->operatingHours()->createMany($operatingHoursData);
        }

        // Clear caches
        $this->destinationService->clearCache($destination->destination_id);

        return $this->successResponse(
            new DestinationResource($destination->load(['category', 'images', 'operatingHours'])),
            'Destination updated successfully'
        );
    }

    /**
     * Remove the specified resource from storage (OPTIMIZED).
     */
    public function destroy(Destination $destination): JsonResponse
    {
        $destinationId = $destination->destination_id;
        $destination->delete();

        // Clear caches
        $this->destinationService->clearCache($destinationId);

        return $this->deletedResponse('Destination deleted successfully');
    }
}
