<?php

namespace App\Services;

use App\Models\Destination;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DestinationService
{
    /**
     * Get destinations with optimal eager loading and caching.
     */
    public function getDestinations(array $filters = [], int $perPage = 15, int $page = 1)
    {
        $cacheKey = 'destinations.' . md5(json_encode($filters) . $perPage . $page);
        
        return Cache::remember($cacheKey, 30, function () use ($filters, $perPage) { // 30 sec cache for fast pagination
            $query = Destination::query()
                ->select([
                    'destination_id',
                    'category_id',
                    'name',
                    'slug',
                    'description',
                    'city',
                    'province',
                    'region',
                    'latitude',
                    'longitude',
                    'points_reward',
                    'status',
                    'average_rating',
                    'total_visits',
                    'qr_code',
                    'created_at'
                ])
                ->with([
                    'category:category_id,category_name,icon',
                    'images' => function ($query) {
                        $query->select('destination_images_id', 'destination_id', 'image_path', 'is_primary', 'title')
                            ->orderBy('is_primary', 'desc') // Primary images first
                            ->orderBy('created_at', 'asc'); // Then by creation order
                    }
                ]);

            // Apply filters
            if (!empty($filters['category_id'])) {
                $query->where('category_id', $filters['category_id']);
            }

            if (!empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            if (!empty($filters['search'])) {
                $query->search($filters['search']);
            }

            if (isset($filters['latitude']) && isset($filters['longitude'])) {
                $query->nearby(
                    $filters['latitude'],
                    $filters['longitude'],
                    $filters['radius'] ?? 10000
                );
            }

            // Default ordering
            $query->orderBy($filters['sort_by'] ?? 'created_at', $filters['sort_order'] ?? 'desc');

            return $query->paginate($perPage);
        });
    }

    /**
     * Get single destination with all relationships (heavily optimized).
     */
    public function getDestinationById(int $id)
    {
        return Cache::remember("destination.{$id}", 1800, function () use ($id) { // 30 min cache
            return Destination::with([
                'category:category_id,category_name,icon,description',
                'images:destination_images_id,destination_id,image_path,title,is_primary,display_order',
                'operatingHours:id,destination_id,day_of_week,opens_at,closes_at,is_closed',
                'reviews' => function ($query) {
                    $query->select('id', 'destination_id', 'user_id', 'rating', 'title', 'review_text', 'created_at')
                        ->where('status', 'approved')
                        ->with('user:id,first_name,last_name,avatar_url')
                        ->latest()
                        ->limit(10);
                }
            ])->findOrFail($id);
        });
    }

    /**
     * Get nearby destinations (optimized for map view).
     */
    public function getNearbyDestinations(float $lat, float $lng, int $radius = 5000)
    {
        $cacheKey = "nearby.{$lat}.{$lng}.{$radius}";
        
        return Cache::remember($cacheKey, 300, function () use ($lat, $lng, $radius) { // 5 min cache
            return Destination::select([
                'destination_id',
                'category_id',
                'name',
                'latitude',
                'longitude',
                'points_reward',
                'average_rating'
            ])
            ->with('category:category_id,category_name,icon')
            ->where('status', 'active')
            ->nearby($lat, $lng, $radius)
            ->limit(50)
            ->get();
        });
    }

    /**
     * Clear destination caches.
     */
    public function clearCache(?int $destinationId = null): void
    {
        if ($destinationId) {
            Cache::forget("destination.{$destinationId}");
        }
        
        // Clear destination list cache - brute force approach for database cache driver
        // This covers common pagination and filter combinations
        $perPageOptions = [6, 10, 15, 20, 25, 50, 100];
        $categoryIds = range(1, 20); // Assume max 20 categories
        
        // Clear cache for different filter combinations
        foreach ($perPageOptions as $perPage) {
            // No filters
            Cache::forget('destinations.' . md5(json_encode([]) . $perPage));
            
            // With category filters
            foreach ($categoryIds as $catId) {
                Cache::forget('destinations.' . md5(json_encode(['category_id' => $catId]) . $perPage));
            }
            
            // With status filter
            Cache::forget('destinations.' . md5(json_encode(['status' => 'active']) . $perPage));
            Cache::forget('destinations.' . md5(json_encode(['status' => 'inactive']) . $perPage));
        }
        
        Cache::forget('destinations.list');
    }
}
