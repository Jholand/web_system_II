<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRewardRedemption extends Model
{
    protected $fillable = [
        'user_id',
        'reward_id',
        'points_spent',
        'redemption_code',
        'status',
        'valid_until',
        'used_at',
        'used_location',
        'verified_by',
        'notes',
        'redeemed_at',
    ];
    
    protected $casts = [
        'valid_until' => 'datetime',
        'used_at' => 'datetime',
        'redeemed_at' => 'datetime',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function reward()
    {
        return $this->belongsTo(Reward::class);
    }
    
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
