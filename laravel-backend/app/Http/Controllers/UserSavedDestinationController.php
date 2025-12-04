<?php

namespace App\Http\Controllers;

use App\Models\UserSavedDestination;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserSavedDestinationController extends Controller
{
    /**
     * Get all saved destinations for authenticated user
     */
    public function index(Request $request)
    {
        try {
            $savedDestinations = UserSavedDestination::where('user_id', Auth::id())
                ->with(['destination.category', 'destination.images'])
                ->get()
                ->map(function ($saved) {
                    $destination = $saved->destination;
                    return [
                        'id' => $destination->destination_id,
                        'name' => $destination->name,
                        'description' => $destination->description,
                        'category' => $destination->category->category_name ?? 'Uncategorized',
                        'categoryName' => $destination->category->category_name ?? 'Uncategorized',
                        'latitude' => (float) $destination->latitude,
                        'longitude' => (float) $destination->longitude,
                        'address' => trim(implode(', ', array_filter([
                            $destination->street_address,
                            $destination->barangay,
                            $destination->city,
                            $destination->province
                        ]))),
                        'points' => $destination->points_reward,
                        'total_visits' => $destination->total_visits,
                        'average_rating' => (float) $destination->average_rating,
                        'images' => $destination->images->map(fn($img) => [
                            'id' => $img->id,
                            'image_url' => $img->image_url,
                            'is_primary' => $img->is_primary
                        ]),
                        'saved_at' => $saved->created_at,
                        'notes' => $saved->notes,
                        'is_saved' => true
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $savedDestinations
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch saved destinations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle save status
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'destination_id' => 'required|exists:destinations,destination_id'
        ]);

        try {
            $existing = UserSavedDestination::where('user_id', Auth::id())
                ->where('destination_id', $request->destination_id)
                ->first();

            if ($existing) {
                $existing->delete();
                return response()->json([
                    'success' => true,
                    'message' => 'Destination removed from saved locations',
                    'is_saved' => false
                ]);
            } else {
                UserSavedDestination::create([
                    'user_id' => Auth::id(),
                    'destination_id' => $request->destination_id
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Destination saved successfully!',
                    'is_saved' => true
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle save status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if destinations are saved (bulk check)
     */
    public function checkSaved(Request $request)
    {
        $request->validate([
            'destination_ids' => 'required|array',
            'destination_ids.*' => 'exists:destinations,destination_id'
        ]);

        try {
            $savedIds = UserSavedDestination::where('user_id', Auth::id())
                ->whereIn('destination_id', $request->destination_ids)
                ->pluck('destination_id')
                ->toArray();

            return response()->json([
                'success' => true,
                'data' => $savedIds
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check saved status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
