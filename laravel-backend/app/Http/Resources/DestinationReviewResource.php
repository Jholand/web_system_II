<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DestinationReviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'destination_id' => $this->destination_id,
            'user' => [
                'id' => $this->user_id,
                'name' => $this->user?->first_name . ' ' . $this->user?->last_name,
                'avatar_url' => $this->user?->avatar_url,
            ],
            'rating' => $this->rating,
            'title' => $this->title,
            'review_text' => $this->review_text,
            'photos' => $this->photos,
            'helpful_count' => $this->helpful_count ?? 0,
            'is_verified' => $this->is_verified,
            'is_featured' => $this->is_featured,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
