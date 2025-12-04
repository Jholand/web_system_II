<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAddress extends Model
{
    protected $fillable = [
        'user_id',
        'address_type',
        'street_address',
        'barangay',
        'city',
        'province',
        'region',
        'postal_code',
        'country',
        'is_primary',
    ];
    
    protected $casts = [
        'is_primary' => 'boolean',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
