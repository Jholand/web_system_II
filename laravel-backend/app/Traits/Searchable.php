<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Searchable
{
    /**
     * Scope a query to search across multiple fields.
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (empty($search)) {
            return $query;
        }

        $searchFields = $this->searchableFields ?? ['name'];
        
        return $query->where(function ($q) use ($search, $searchFields) {
            foreach ($searchFields as $field) {
                $q->orWhere($field, 'like', "%{$search}%");
            }
        });
    }

    /**
     * Scope a query to perform full-text search.
     */
    public function scopeFullTextSearch(Builder $query, ?string $search): Builder
    {
        if (empty($search)) {
            return $query;
        }

        $fullTextFields = $this->fullTextFields ?? [];
        
        if (empty($fullTextFields)) {
            return $query;
        }

        $fields = implode(',', $fullTextFields);
        
        return $query->whereRaw(
            "MATCH({$fields}) AGAINST(? IN BOOLEAN MODE)",
            [$search . '*']
        );
    }
}
