<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserCheckinResource extends JsonResource
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
            'user_id' => $this->user_id,
            'destination' => new DestinationResource($this->whenLoaded('destination')),
            'checkin_method' => $this->checkin_method,
            'location' => [
                'latitude' => $this->user_latitude,
                'longitude' => $this->user_longitude,
                'distance_from_destination' => $this->distance_from_destination,
            ],
            'points' => [
                'earned' => $this->points_earned,
                'bonus' => $this->bonus_points,
                'total' => $this->points_earned + $this->bonus_points,
            ],
            'photo_url' => $this->photo_url,
            'notes' => $this->notes,
            'is_verified' => $this->is_verified,
            'verified_by' => $this->verified_by,
            'verified_at' => $this->verified_at,
            'checked_in_at' => $this->checked_in_at,
            'created_at' => $this->created_at,
        ];
    }
}
