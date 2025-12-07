<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DestinationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->destination_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'category' => [
                'id' => $this->category_id,
                'name' => $this->category?->category_name,
                'icon' => $this->category?->icon ?? '🏨',
            ],
            'description' => $this->description,
            'address' => [
                'street' => $this->street_address,
                'barangay' => $this->barangay,
                'city' => $this->city,
                'province' => $this->province,
                'region' => $this->region,
                'postal_code' => $this->postal_code,
                'country' => $this->country ?? 'Philippines',
            ],
            'coordinates' => [
                'latitude' => (float) $this->latitude,
                'longitude' => (float) $this->longitude,
            ],
            'contact' => [
                'phone' => $this->contact_number,
                'email' => $this->email,
            ],
            'points_reward' => $this->points_reward,
            'visit_radius' => $this->visit_radius,
            'status' => $this->status,
            'stats' => [
                'total_visits' => $this->total_visits ?? 0,
                'total_reviews' => $this->total_reviews ?? 0,
                'average_rating' => (float) ($this->average_rating ?? 0),
            ],
            'qr_code' => $this->qr_code,
            'qr_code_image_url' => $this->qr_code_image_url,
            'owner_id' => $this->owner_id,
            'owner' => $this->whenLoaded('owner', function () {
                if (!$this->owner) {
                    return null;
                }
                return [
                    'id' => $this->owner->id,
                    'name' => $this->owner->first_name . ' ' . $this->owner->last_name,
                    'email' => $this->owner->email,
                ];
            }),
            'amenities' => $this->amenities ?? [],
            'images' => $this->whenLoaded('images', function () {
                return $this->images->map(function ($image) {
                    return [
                        'id' => $image->destination_images_id,
                        'url' => $image->image_path,
                        'image_path' => $image->image_path,
                        'title' => $image->title,
                        'is_primary' => (bool) $image->is_primary,
                    ];
                });
            }, []),
            'operating_hours' => $this->whenLoaded('operatingHours', function () {
                return $this->operatingHours->map(function ($hour) {
                    $days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    return [
                        'day' => $days[$hour->day_of_week] ?? 'Unknown',
                        'opens' => $hour->opens_at ? substr($hour->opens_at, 0, 5) : '09:00',
                        'closes' => $hour->closes_at ? substr($hour->closes_at, 0, 5) : '18:00',
                        'is_closed' => (bool) $hour->is_closed,
                    ];
                });
            }, []),
            'rewards' => $this->whenLoaded('rewards', function () {
                return $this->rewards->map(function ($reward) {
                    return [
                        'id' => $reward->id,
                        'title' => $reward->title,
                        'description' => $reward->description,
                        'points_required' => $reward->points_required,
                        'stock_quantity' => $reward->stock_quantity,
                        'is_active' => $reward->is_active,
                    ];
                });
            }, []),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
