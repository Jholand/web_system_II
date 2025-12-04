<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSavedDestination extends Model
{
    public $timestamps = false;
    
    protected $fillable = [
        'user_id',
        'destination_id',
        'notes',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function destination()
    {
        return $this->belongsTo(Destination::class, 'destination_id', 'destination_id');
    }
}
