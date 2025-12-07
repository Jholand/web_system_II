<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DestinationImage extends Model
{
    protected $primaryKey = 'destination_images_id';
    
    const CREATED_AT = 'created_at';
    const UPDATED_AT = null; // No updated_at column
    
    protected $fillable = [
        'destination_id',
        'image_path',
        'title',
        'is_primary',
        'uploaded_by',
    ];
    
    protected $casts = [
        'is_primary' => 'boolean',
    ];
    
    public function destination()
    {
        return $this->belongsTo(Destination::class, 'destination_id', 'destination_id');
    }
    
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
