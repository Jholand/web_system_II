<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'role_id' => $this->role_id,
            'role' => $this->getRoleName(),
            'status_id' => $this->status_id,
            'status' => $this->getStatusName(),
            'email' => $this->email,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'name' => $this->first_name . ' ' . $this->last_name,
            'username' => $this->username,
            'phone' => $this->phone,
            'date_of_birth' => $this->date_of_birth,
            'gender' => $this->gender,
            'avatar_url' => $this->avatar_url,
            'total_points' => $this->total_points,
            'level' => $this->level,
            'email_verified_at' => $this->email_verified_at,
            'phone_verified_at' => $this->phone_verified_at,
            'last_login_at' => $this->last_login_at,
            'last_login_ip' => $this->last_login_ip,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Get the role name based on role_id
     */
    private function getRoleName(): string
    {
        return match($this->role_id) {
            1 => 'admin',
            2 => 'user',
            3 => 'moderator',
            4 => 'owner',
            default => 'unknown'
        };
    }

    /**
     * Get the status name based on status_id
     */
    private function getStatusName(): string
    {
        return match($this->status_id) {
            1 => 'active',
            2 => 'inactive',
            3 => 'suspended',
            4 => 'banned',
            default => 'unknown'
        };
    }
}
