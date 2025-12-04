<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserRewardRedemptionResource extends JsonResource
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
            'reward' => new RewardResource($this->whenLoaded('reward')),
            'points_spent' => $this->points_spent,
            'redemption_code' => $this->redemption_code,
            'status' => $this->status,
            'valid_until' => $this->valid_until,
            'used_at' => $this->used_at,
            'used_location' => $this->used_location,
            'verified_by' => $this->verified_by,
            'notes' => $this->notes,
            'redeemed_at' => $this->redeemed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
