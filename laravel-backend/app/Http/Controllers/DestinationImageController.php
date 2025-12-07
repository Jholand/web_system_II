<?php

namespace App\Http\Controllers;

use App\Models\DestinationImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DestinationImageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'destination_id' => 'required|exists:destinations,destination_id',
            'title' => 'nullable|string|max:255',
            'is_primary' => 'nullable|boolean',
        ]);

        try {
            // If this image is set as primary, unset all other primary images for this destination
            if (isset($validated['is_primary']) && $validated['is_primary']) {
                DestinationImage::where('destination_id', $validated['destination_id'])
                    ->update(['is_primary' => false]);
            }

            // Store the image
            $image = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('destinations', $filename, 'public');

            // Create database record
            $destinationImage = DestinationImage::create([
                'destination_id' => $validated['destination_id'],
                'image_path' => $path,
                'title' => $validated['title'] ?? $image->getClientOriginalName(),
                'is_primary' => $validated['is_primary'] ?? false,
                'uploaded_by' => auth()->id() ?? null,
            ]);

            return response()->json([
                'message' => 'Image uploaded successfully',
                'data' => $destinationImage,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload image',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(DestinationImage $destinationImage)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DestinationImage $destinationImage)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'is_primary' => 'nullable|boolean',
        ]);

        try {
            $image = DestinationImage::findOrFail($id);
            
            // If this image is set as primary, unset all other primary images for this destination
            if (isset($validated['is_primary']) && $validated['is_primary']) {
                DestinationImage::where('destination_id', $image->destination_id)
                    ->where('destination_images_id', '!=', $id)
                    ->update(['is_primary' => 0]);
            }
            
            // Update the image record
            $image->update([
                'title' => $validated['title'] ?? $image->title,
                'is_primary' => $validated['is_primary'] ?? $image->is_primary,
            ]);

            return response()->json([
                'message' => 'Image updated successfully',
                'data' => $image,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update image',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $image = DestinationImage::findOrFail($id);
            
            // Delete file from storage
            if ($image->image_path) {
                $filePath = str_replace('/storage/', '', $image->image_path);
                Storage::disk('public')->delete($filePath);
            }
            
            $image->delete();

            return response()->json([
                'message' => 'Image deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete image',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
