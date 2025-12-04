<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\Searchable;
use App\Traits\Filterable;
use App\Traits\Cacheable;
use App\Traits\HasSlug;

class Badge extends Model
{
    use Searchable, Filterable, Cacheable, HasSlug;

    protected $primaryKey = 'id';
    
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'icon',
        'color',
        'requirement_type',
        'requirement_value',
        'requirement_details',
        'points_reward',
        'rarity',
        'display_order',
        'is_active',
        'is_hidden',
    ];
    
    protected $casts = [
        'requirement_details' => 'array',
        'is_active' => 'boolean',
        'is_hidden' => 'boolean',
        'requirement_value' => 'integer',
        'points_reward' => 'integer',
        'display_order' => 'integer',
    ];

    protected $appends = ['icon_url'];

    /**
     * Fields that can be searched
     */
    protected $searchableFields = ['name', 'description', 'slug'];
    
    /**
     * Get the icon URL or emoji
     */
    public function getIconUrlAttribute()
    {
        if (!$this->icon) {
            return '🏆'; // Default emoji
        }
        
        // If it starts with badges/, it's a file path
        if (str_starts_with($this->icon, 'badges/')) {
            return url('storage/' . $this->icon);
        }
        
        // Otherwise it's an emoji
        return $this->icon;
    }
    
    /**
     * Get the category that this badge belongs to
     */
    public function category()
    {
        return $this->belongsTo(DestinationCategory::class, 'category_id', 'category_id');
    }
    
    /**
     * Get all user badges for this badge
     */
    public function userBadges()
    {
        return $this->hasMany(UserBadge::class);
    }
    
    /**
     * Get users who have earned this badge
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_badges')
            ->withPivot('progress', 'is_earned', 'earned_at', 'points_awarded', 'is_favorited', 'is_displayed')
            ->withTimestamps();
    }
    
    /**
     * Scope: Search badges by name or description
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('slug', 'like', "%{$search}%");
        });
    }
    
    /**
     * Scope: Filter by rarity
     */
    public function scopeByRarity(Builder $query, string $rarity): Builder
    {
        return $query->where('rarity', $rarity);
    }
    
    /**
     * Scope: Filter by requirement type
     */
    public function scopeByRequirementType(Builder $query, string $type): Builder
    {
        return $query->where('requirement_type', $type);
    }
    
    /**
     * Scope: Only active badges
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
    
    /**
     * Scope: Only visible badges (not hidden)
     */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_hidden', false);
    }
}
