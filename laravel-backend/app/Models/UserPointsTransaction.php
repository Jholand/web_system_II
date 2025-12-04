<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPointsTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'transaction_type',
        'points',
        'balance_after',
        'source_type',
        'source_id',
        'related_destination_id',
        'description',
        'metadata',
        'transaction_date',
    ];

    protected $casts = [
        'metadata' => 'array',
        'transaction_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the transaction.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the destination related to this transaction.
     */
    public function destination()
    {
        return $this->belongsTo(Destination::class, 'related_destination_id', 'destination_id');
    }
}
