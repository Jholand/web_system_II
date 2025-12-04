<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DestinationOperatingHour extends Model
{
    public $timestamps = false;
    
    protected $fillable = [
        'destination_id',
        'day_of_week',
        'opens_at',
        'closes_at',
        'is_closed',
        'notes',
    ];
    
    protected $casts = [
        'is_closed' => 'boolean',
    ];
    
    public function destination()
    {
        return $this->belongsTo(Destination::class, 'destination_id', 'destination_id');
    }
}
