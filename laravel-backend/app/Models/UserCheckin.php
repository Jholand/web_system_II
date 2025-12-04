<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\Cacheable;

class UserCheckin extends Model
{
    use Cacheable;
    
    /**
     * ⚡ EAGER LOAD - Eliminates N+1 queries (10-100x faster)
     * Always load destination and user when fetching check-ins
     */
    protected $with = ['destination', 'user'];
    
    protected $fillable = [
        'user_id',
        'destination_id',
        'checkin_method',
        'qr_code_scanned',
        'user_latitude',
        'user_longitude',
        'distance_from_destination',
        'points_earned',
        'bonus_points',
        'photo_url',
        'notes',
        'is_verified',
        'verified_by',
        'verified_at',
        'checked_in_at',
    ];
    
    protected $casts = [
        'user_latitude' => 'decimal:8',
        'user_longitude' => 'decimal:8',
        'is_verified' => 'boolean',
        'checked_in_at' => 'datetime',
        'verified_at' => 'datetime',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function destination()
    {
        return $this->belongsTo(Destination::class, 'destination_id', 'destination_id');
    }
    
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Scope: Recent check-ins
     */
    public function scopeRecent(Builder $query, int $days = 7): Builder
    {
        return $query->where('checked_in_at', '>=', now()->subDays($days))
            ->orderBy('checked_in_at', 'desc');
    }

    /**
     * Scope: By user
     */
    public function scopeByUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: By destination
     */
    public function scopeByDestination(Builder $query, int $destinationId): Builder
    {
        return $query->where('destination_id', $destinationId);
    }

    /**
     * Scope: By method
     */
    public function scopeByMethod(Builder $query, string $method): Builder
    {
        return $query->where('checkin_method', $method);
    }

    /**
     * Scope: Verified check-ins only
     */
    public function scopeVerified(Builder $query): Builder
    {
        return $query->where('is_verified', true);
    }
}
