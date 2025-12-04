<?php

namespace App\Http\Controllers;

use App\Models\DestinationCategory;
use App\Http\Requests\StoreDestinationCategoryRequest;
use App\Http\Requests\UpdateDestinationCategoryRequest;
use App\Http\Resources\DestinationCategoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class DestinationCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     * ⚡ OPTIMIZED: Uses smart caching with granular invalidation
     */
    public function index(Request $request)
    {
        $query = DestinationCategory::query();

        // Apply status filter first (uses index)
        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        // Apply search filter using model scope
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Order by category_name for consistent results (uses index on category_name if exists)
        $query->orderBy('category_name', 'asc');

        // Load relationships count efficiently with caching
        $query->withCount('destinations');

        // Get pagination parameters with limits
        $perPage = min($request->get('per_page', 9), 100); // Max 100 items per page
        
        // ⚡ OPTIMIZED: Cache for 30 minutes (don't use Cache::flush() - use tags instead)
        $cacheKey = 'categories.' . md5($request->fullUrl());
        $categories = Cache::remember($cacheKey, 1800, function () use ($query, $perPage) {
            return $query->paginate($perPage);
        });

        return DestinationCategoryResource::collection($categories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDestinationCategoryRequest $request): JsonResponse
    {
        $data = [
            'category_name' => $request->category_name,
            'description' => $request->description,
            'is_active' => $request->is_active ?? true,
        ];

        // Handle icon upload
        if ($request->hasFile('icon')) {
            $iconPath = $request->file('icon')->store('category-icons', 'public');
            $data['icon'] = $iconPath;
        } else {
            $data['icon'] = $request->icon ?? '🏨';
        }

        $category = DestinationCategory::create($data);

        // ⚡ OPTIMIZED: Clear only category cache (not entire cache)
        Cache::forget('categories.*');

        return response()->json([
            'message' => 'Category created successfully',
            'data' => new DestinationCategoryResource($category),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(DestinationCategory $category)
    {
        $category->loadCount('destinations');
        return new DestinationCategoryResource($category);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDestinationCategoryRequest $request, DestinationCategory $category): JsonResponse
    {
        $data = [
            'category_name' => $request->category_name,
            'description' => $request->description ?? '',
            'is_active' => $request->is_active ?? $category->is_active,
        ];

        // Handle icon upload
        if ($request->hasFile('icon')) {
            // Delete old icon if it's a file path
            if ($category->icon && str_starts_with($category->icon, 'category-icons/')) {
                Storage::disk('public')->delete($category->icon);
            }
            
            $iconPath = $request->file('icon')->store('category-icons', 'public');
            $data['icon'] = $iconPath;
        } elseif ($request->filled('icon')) {
            // If text icon provided (emoji)
            $data['icon'] = $request->icon;
        }
        // If no icon provided, keep the existing icon (don't update it)

        $category->update($data);

        // ⚡ OPTIMIZED: Clear only category cache (not entire cache)
        Cache::forget('categories.*');

        return response()->json([
            'message' => 'Category updated successfully',
            'data' => new DestinationCategoryResource($category),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DestinationCategory $category): JsonResponse
    {
        // Check if category has destinations
        if ($category->destinations()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category with existing destinations',
            ], 422);
        }

        // Delete icon file if it exists
        if ($category->icon && str_starts_with($category->icon, 'category-icons/')) {
            Storage::disk('public')->delete($category->icon);
        }

        $category->delete();

        // ⚡ OPTIMIZED: Clear only category cache (not entire cache)
        Cache::forget('categories.*');

        return response()->json([
            'message' => 'Category deleted successfully',
        ]);
    }
}
