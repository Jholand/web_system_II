<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DestinationReview extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'destination_id',
        'user_id',
        'rating',
        'title',
        'review_text',
        'photos',
        'helpful_count',
        'is_verified',
        'is_featured',
        'status',
        'moderated_by',
        'moderated_at',
    ];
    
    protected $casts = [
        'photos' => 'array',
        'is_verified' => 'boolean',
        'is_featured' => 'boolean',
        'moderated_at' => 'datetime',
    ];
    
    public function destination()
    {
        return $this->belongsTo(Destination::class, 'destination_id', 'destination_id');
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function moderator()
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }
}
