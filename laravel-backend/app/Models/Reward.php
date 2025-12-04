<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\Searchable;
use App\Traits\Filterable;
use App\Traits\Cacheable;
use App\Traits\HasSlug;

class Reward extends Model
{
    use SoftDeletes, Searchable, Filterable, Cacheable, HasSlug;
    
    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'description',
        'terms_conditions',
        'points_required',
        'stock_quantity',
        'stock_unlimited',
        'max_redemptions_per_user',
        'valid_from',
        'valid_until',
        'redemption_period_days',
        'partner_name',
        'partner_logo_url',
        'partner_contact',
        'image_url',
        'is_active',
        'is_featured',
        'total_redeemed',
    ];
    
    protected $casts = [
        'stock_unlimited' => 'boolean',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
    ];

    /**
     * Fields that can be searched
     */
    protected $searchableFields = ['title', 'description', 'partner_name'];

    /**
     * Fields for full-text search
     */
    protected $fullTextFields = ['title', 'description'];

    /**
     * Scope: Available rewards (active and in stock)
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->where('stock_unlimited', true)
                    ->orWhere('stock_quantity', '>', 0);
            });
    }

    /**
     * Scope: Valid rewards (within validity period)
     */
    public function scopeValid(Builder $query): Builder
    {
        $now = now();
        return $query->where(function ($q) use ($now) {
            $q->whereNull('valid_from')
                ->orWhere('valid_from', '<=', $now);
        })->where(function ($q) use ($now) {
            $q->whereNull('valid_until')
                ->orWhere('valid_until', '>=', $now);
        });
    }

    /**
     * Scope: By points range
     */
    public function scopeByPointsRange(Builder $query, ?int $min, ?int $max): Builder
    {
        if ($min !== null) {
            $query->where('points_required', '>=', $min);
        }
        if ($max !== null) {
            $query->where('points_required', '<=', $max);
        }
        return $query;
    }
    
    public function category()
    {
        return $this->belongsTo(DestinationCategory::class, 'category_id', 'category_id');
    }
    
    public function redemptions()
    {
        return $this->hasMany(UserRewardRedemption::class);
    }
    
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_reward_redemptions')
            ->withPivot('points_spent', 'redemption_code', 'status', 'valid_until', 'used_at', 'redeemed_at')
            ->withTimestamps();
    }

    /**
     * Destinations where this reward can be used
     */
    public function destinations()
    {
        return $this->belongsToMany(
            Destination::class,
            'reward_destinations',
            'reward_id',
            'destination_id',
            'id',
            'destination_id'
        )->withTimestamps();
    }

    /**
     * Check if reward can be used at a specific destination
     */
    public function canBeUsedAt($destinationId): bool
    {
        return $this->destinations()
            ->wherePivot('destination_id', $destinationId)
            ->exists();
    }

    /**
     * Override the route key name to use ID instead of slug
     * (HasSlug trait defaults to 'slug', but we want to use ID for API routes)
     */
    public function getRouteKeyName(): string
    {
        return 'id';
    }
}
