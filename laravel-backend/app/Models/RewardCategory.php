<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RewardCategory extends Model
{
    protected $fillable = [
        'category_name',
        'icon',
        'description',
    ];

    /**
     * Get rewards in this category
     */
    public function rewards()
    {
        return $this->hasMany(Reward::class, 'category_id');
    }
}
