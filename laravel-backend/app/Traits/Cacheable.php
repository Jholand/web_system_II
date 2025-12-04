<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Model;

trait Cacheable
{
    /**
     * Get cache key for the model.
     */
    protected function getCacheKey(?string $suffix = null): string
    {
        $table = $this->getTable();
        $key = $table . ($this->getKey() ? ".{$this->getKey()}" : '');
        
        return $suffix ? "{$key}.{$suffix}" : $key;
    }

    /**
     * Cache a query result.
     */
    public static function cacheQuery(string $key, \Closure $callback, int $ttl = 3600)
    {
        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Forget cache for this model.
     */
    public function forgetCache(?string $suffix = null): void
    {
        $key = $this->getCacheKey($suffix);
        Cache::forget($key);
        
        // Also forget collection cache
        Cache::forget($this->getTable() . '.all');
        Cache::forget($this->getTable() . '.active');
    }

    /**
     * Boot the cacheable trait.
     */
    public static function bootCacheable(): void
    {
        static::saved(function (Model $model) {
            if (method_exists($model, 'forgetCache')) {
                $model->forgetCache();
            }
        });

        static::deleted(function (Model $model) {
            if (method_exists($model, 'forgetCache')) {
                $model->forgetCache();
            }
        });
    }

    /**
     * Get cached collection.
     */
    public static function getCached(string $key = 'all', int $ttl = 3600)
    {
        $instance = new static;
        $cacheKey = $instance->getTable() . '.' . $key;
        
        return Cache::remember($cacheKey, $ttl, function () use ($instance, $key) {
            return $instance->newQuery()->get();
        });
    }
}
