<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DestinationCategory extends Model
{
    protected $primaryKey = 'category_id';
    protected $table = 'destination_categories';
    
    protected $fillable = [
        'category_name',
        'description',
        'icon',
        'is_active',
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [];

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'category_id';
    }
    
    /**
     * Scope to get only active categories
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to search categories
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('category_name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }
    
    public function destinations()
    {
        return $this->hasMany(Destination::class, 'category_id', 'category_id');
    }
    
    public function rewards()
    {
        return $this->hasMany(Reward::class, 'category_id', 'category_id');
    }
}
