<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DestinationImage extends Model
{
    protected $primaryKey = 'destination_images_id';
    public $timestamps = false;
    
    protected $fillable = [
        'destination_id',
        'image_path',
        'title',
        'uploaded_by',
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
