<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait GeoSpatial
{
    /**
     * Scope a query to find nearby locations.
     * 
     * @param Builder $query
     * @param float $latitude
     * @param float $longitude
     * @param int $radiusInMeters
     * @return Builder
     */
    public function scopeNearby(Builder $query, float $latitude, float $longitude, int $radiusInMeters = 5000): Builder
    {
        // Haversine formula for calculating distance
        $radiusInKm = $radiusInMeters / 1000;

        return $query->select('*')
            ->selectRaw(
                '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance',
                [$latitude, $longitude, $latitude]
            )
            ->having('distance', '<=', $radiusInKm)
            ->orderBy('distance', 'asc');
    }

    /**
     * Scope a query to find locations within a bounding box.
     */
    public function scopeWithinBounds(Builder $query, float $minLat, float $maxLat, float $minLng, float $maxLng): Builder
    {
        return $query->whereBetween('latitude', [$minLat, $maxLat])
            ->whereBetween('longitude', [$minLng, $maxLng]);
    }

    /**
     * Calculate distance between two points (in meters).
     */
    public static function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // meters

        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(
            pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)
        ));

        return $angle * $earthRadius;
    }

    /**
     * Check if a point is within radius of this location.
     */
    public function isWithinRadius(float $latitude, float $longitude, int $radiusInMeters): bool
    {
        if (!isset($this->latitude) || !isset($this->longitude)) {
            return false;
        }

        $distance = self::calculateDistance(
            $this->latitude,
            $this->longitude,
            $latitude,
            $longitude
        );

        return $distance <= $radiusInMeters;
    }
}
