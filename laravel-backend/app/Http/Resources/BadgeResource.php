<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BadgeResource extends JsonResource
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
            'category' => $this->when($this->relationLoaded('category'), function () {
                return [
                    'id' => $this->category?->category_id,
                    'name' => $this->category?->category_name,
                    'icon' => $this->category?->icon,
                ];
            }),
            'category_id' => $this->category_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'icon' => $this->icon,
            'color' => $this->color,
            'requirement' => [
                'type' => $this->requirement_type,
                'value' => $this->requirement_value,
                'details' => $this->requirement_details,
            ],
            'points_reward' => $this->points_reward,
            'rarity' => $this->rarity,
            'display_order' => $this->display_order,
            'is_active' => $this->is_active,
            'is_hidden' => $this->is_hidden,
            'stats' => [
                'total_earned' => $this->when($this->relationLoaded('userBadges'), function () {
                    return $this->userBadges()->where('is_earned', true)->count();
                }),
                'users_count' => $this->when($this->relationLoaded('users'), function () {
                    return $this->users->count();
                }),
            ],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
