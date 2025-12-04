<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBadge extends Model
{
    /**
     * ⚡ EAGER LOAD - Eliminates N+1 queries (10-100x faster)
     * Always load badge when fetching user badges
     */
    protected $with = ['badge'];
    
    protected $fillable = [
        'user_id',
        'badge_id',
        'progress',
        'is_earned',
        'earned_at',
        'points_awarded',
        'is_favorited',
        'is_displayed',
    ];
    
    protected $casts = [
        'is_earned' => 'boolean',
        'is_favorited' => 'boolean',
        'is_displayed' => 'boolean',
        'earned_at' => 'datetime',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function badge()
    {
        return $this->belongsTo(Badge::class);
    }
}
