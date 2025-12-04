<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Filterable
{
    /**
     * Apply filters to the query.
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        foreach ($filters as $key => $value) {
            // Skip if value is null or empty
            if ($value === null || $value === '') {
                continue;
            }

            // Handle different filter types
            $method = 'filter' . str_replace('_', '', ucwords($key, '_'));
            
            if (method_exists($this, $method)) {
                $this->$method($query, $value);
            } elseif (in_array($key, $this->fillable ?? [])) {
                // Direct column match
                $query->where($key, $value);
            }
        }

        return $query;
    }

    /**
     * Scope for filtering by date range.
     */
    public function scopeDateRange(Builder $query, string $field, ?string $start, ?string $end): Builder
    {
        if ($start) {
            $query->where($field, '>=', $start);
        }

        if ($end) {
            $query->where($field, '<=', $end);
        }

        return $query;
    }

    /**
     * Scope for filtering by active status.
     */
    public function scopeActive(Builder $query, bool $active = true): Builder
    {
        return $query->where('is_active', $active);
    }

    /**
     * Scope for filtering by featured status.
     */
    public function scopeFeatured(Builder $query, bool $featured = true): Builder
    {
        return $query->where('is_featured', $featured);
    }
}
