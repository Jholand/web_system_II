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
        // Return icon as-is (path or emoji), let frontend handle URL generation
        $iconValue = $this->icon ?? '🏨';

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
