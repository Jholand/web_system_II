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
        $user = auth()->user();
        $isAdmin = $user && $user->role_id === 1;
        $isCreator = $user && $this->created_by === $user->id;
        $creatorIsAdmin = $this->creator && $this->creator->role_id === 1;
        
        // Determine permissions:
        // If reward created by admin: only admin can access
        // If reward created by owner: admin + owner can access
        $canAccess = false;
        if ($creatorIsAdmin) {
            $canAccess = $isAdmin; // Only admin can access admin-created rewards
        } else {
            $canAccess = $isAdmin || $isCreator; // Admin or owner can access owner-created rewards
        }

        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => $this->category ? [
                'id' => $this->category->category_id,
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
                    $locationParts = array_filter([
                        $destination->barangay,
                        $destination->city,
                        $destination->province
                    ]);
                    
                    return [
                        'id' => $destination->id,
                        'destination_id' => $destination->destination_id,
                        'name' => $destination->name,
                        'city' => $destination->city,
                        'province' => $destination->province,
                        'barangay' => $destination->barangay,
                        'street_address' => $destination->street_address,
                        'location' => !empty($locationParts) ? implode(', ', $locationParts) : null,
                        'category' => $destination->category?->category_name ?? null,
                    ];
                });
            }),
            'created_by' => $this->created_by,
            'creator_is_admin' => $creatorIsAdmin,
            'can_edit' => $canAccess,
            'can_delete' => $canAccess,
            'can_add_stock' => $canAccess,
            'can_view' => true,
            'is_creator' => $isCreator,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
