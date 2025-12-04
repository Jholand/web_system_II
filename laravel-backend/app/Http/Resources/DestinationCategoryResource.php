<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class DestinationCategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Check if icon is a file path or emoji
        $iconValue = $this->icon ?? '🏨';
        if (str_starts_with($iconValue, 'category-icons/')) {
            /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
            $disk = Storage::disk('public');
            $iconValue = $disk->url($iconValue);
        }

        return [
            'id' => $this->category_id,
            'name' => $this->category_name,
            'description' => $this->description,
            'icon' => $iconValue,
            'is_active' => $this->is_active,
            'destinations_count' => $this->destinations_count ?? 0,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
