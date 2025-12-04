<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RewardResource extends JsonResource
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
            'category_id' => $this->category_id,
            'category' => $this->category ? [
                'id' => $this->category->category_id, // ⚡ FIX: Use category_id (primary key)
                'name' => $this->category->category_name,
                'icon' => $this->category->icon,
            ] : null,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'terms_conditions' => $this->terms_conditions,
            'points_required' => $this->points_required,
            'stock' => [
                'quantity' => $this->stock_quantity,
                'unlimited' => $this->stock_unlimited,
                'available' => $this->stock_unlimited ? true : $this->stock_quantity > 0,
            ],
            'max_redemptions_per_user' => $this->max_redemptions_per_user,
            'validity' => [
                'from' => $this->valid_from,
                'until' => $this->valid_until,
                'redemption_period_days' => $this->redemption_period_days,
            ],
            'partner' => [
                'name' => $this->partner_name,
                'logo_url' => $this->partner_logo_url,
                'contact' => $this->partner_contact,
            ],
            'image_url' => $this->image_url,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'total_redeemed' => $this->total_redeemed ?? 0,
            'destinations' => $this->whenLoaded('destinations', function () {
                return $this->destinations->map(function ($destination) {
                    return [
                        'id' => $destination->id,
                        'destination_id' => $destination->destination_id,
                        'name' => $destination->name,
                        'city' => $destination->city,
                        'category' => $destination->category?->category_name ?? 'N/A',
                    ];
                });
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
