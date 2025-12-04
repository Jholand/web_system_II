<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserAddressResource extends JsonResource
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
            'address_type' => $this->address_type,
            'street_address' => $this->street_address,
            'barangay' => $this->barangay,
            'city' => $this->city,
            'province' => $this->province,
            'region' => $this->region,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'is_primary' => $this->is_primary,
            'full_address' => $this->getFullAddress(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function getFullAddress(): string
    {
        $parts = array_filter([
            $this->street_address,
            $this->barangay,
            $this->city,
            $this->province,
            $this->postal_code,
        ]);
        
        return implode(', ', $parts);
    }
}
