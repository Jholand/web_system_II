<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Searchable;
use App\Traits\Filterable;
use App\Traits\Cacheable;
use App\Traits\GeoSpatial;
use App\Traits\HasSlug;

class Destination extends Model
{
    use SoftDeletes, Searchable, Filterable, Cacheable, GeoSpatial, HasSlug;
    
    protected $primaryKey = 'destination_id';
    
    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'destination_id';
    }
    
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'full_address',
        'street_address',
        'barangay',
        'city',
        'province',
        'region',
        'postal_code',
        'country',
        'latitude',
        'longitude',
        'location',
        'qr_code',
        'qr_code_image_url',
        'contact_number',
        'email',
        'website',
        'amenities',
        'points_reward',
        'visit_radius',
        'status',
        'created_by',
        'owner_id',
    ];
    
    /**
     * Hide binary fields from JSON serialization
     */
    protected $hidden = [
        'location', // Binary POINT field causes encoding issues
    ];
    
    protected $casts = [
        'amenities' => 'array',
        'accessibility_features' => 'array',
        'tags' => 'array',
        'entry_fee' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'average_rating' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Fields that can be searched
     */
    protected $searchableFields = ['name', 'description', 'city', 'province', 'region'];

    /**
     * Fields for full-text search
     */
    protected $fullTextFields = ['name', 'description'];
    
    public function category()
    {
        return $this->belongsTo(DestinationCategory::class, 'category_id', 'category_id');
    }
    
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
    
    public function images()
    {
        return $this->hasMany(DestinationImage::class, 'destination_id', 'destination_id');
    }
    
    public function operatingHours()
    {
        return $this->hasMany(DestinationOperatingHour::class, 'destination_id', 'destination_id')
            ->orderBy('day_of_week');
    }
    
    public function checkins()
    {
        return $this->hasMany(UserCheckin::class, 'destination_id', 'destination_id');
    }
    
    public function reviews()
    {
        return $this->hasMany(DestinationReview::class, 'destination_id', 'destination_id');
    }
    
    public function savedByUsers()
    {
        return $this->belongsToMany(User::class, 'user_saved_destinations', 'destination_id', 'user_id')
            ->withPivot('notes', 'created_at');
    }

    /**
     * Rewards available at this destination
     */
    public function rewards()
    {
        return $this->belongsToMany(
            Reward::class,
            'reward_destinations',
            'destination_id',
            'reward_id',
            'destination_id',
            'id'
        )->withTimestamps();
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($destination) {
            // Auto-populate full_address from street_address and barangay
            if ($destination->isDirty(['street_address', 'barangay'])) {
                $addressParts = [];
                
                if (!empty($destination->street_address)) {
                    $addressParts[] = $destination->street_address;
                }
                
                if (!empty($destination->barangay)) {
                    $addressParts[] = 'Barangay ' . $destination->barangay;
                }
                
                $destination->full_address = !empty($addressParts) ? implode(', ', $addressParts) : null;
            }

            // Auto-populate postal_code based on city and province
            if ($destination->isDirty(['city', 'province']) || empty($destination->postal_code)) {
                $postalCode = \App\Services\PostalCodeService::getPostalCode(
                    $destination->city,
                    $destination->province
                );
                
                if ($postalCode) {
                    $destination->postal_code = $postalCode;
                }
            }
        });
    }

    /**
     * Get the complete formatted address
     *
     * @return string
     */
    public function getCompleteAddressAttribute()
    {
        return \App\Services\PostalCodeService::formatCompleteAddress([
            'street_address' => $this->street_address,
            'barangay' => $this->barangay,
            'city' => $this->city,
            'province' => $this->province,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
        ]);
    }
}
