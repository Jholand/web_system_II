<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserBadgeResource extends JsonResource
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
            'badge' => new BadgeResource($this->whenLoaded('badge')),
            'progress' => $this->progress,
            'progress_percentage' => $this->badge ? 
                min(100, round(($this->progress / $this->badge->requirement_value) * 100)) : 0,
            'is_earned' => $this->is_earned,
            'earned_at' => $this->earned_at,
            'points_awarded' => $this->points_awarded,
            'is_favorited' => $this->is_favorited,
            'is_displayed' => $this->is_displayed,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
