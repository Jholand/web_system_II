<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CacheResponse
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, int $ttl = 3600): Response
    {
        // Only cache GET requests
        if (!$request->isMethod('GET')) {
            return $next($request);
        }

        // Skip caching for authenticated requests with user-specific data
        if ($request->user() && $this->isUserSpecificRoute($request)) {
            return $next($request);
        }

        // Generate cache key
        $key = $this->generateCacheKey($request);

        // Check if response is cached
        if (Cache::has($key)) {
            $cachedResponse = Cache::get($key);
            return response($cachedResponse['content'], $cachedResponse['status'])
                ->withHeaders($cachedResponse['headers'])
                ->header('X-Cache', 'HIT');
        }

        // Process request
        $response = $next($request);

        // Cache successful responses
        if ($response->isSuccessful()) {
            Cache::put($key, [
                'content' => $response->getContent(),
                'status' => $response->getStatusCode(),
                'headers' => $response->headers->all(),
            ], $ttl);
        }

        return $response->header('X-Cache', 'MISS');
    }

    /**
     * Generate a unique cache key for the request.
     */
    protected function generateCacheKey(Request $request): string
    {
        $url = $request->url();
        $query = $request->query();
        ksort($query);
        
        $queryString = http_build_query($query);
        $key = 'response:' . md5($url . $queryString);
        
        return $key;
    }

    /**
     * Check if route contains user-specific data.
     */
    protected function isUserSpecificRoute(Request $request): bool
    {
        $userSpecificPatterns = [
            '/api/me',
            '/api/user/',
            '/api/my-',
            '/api/profile',
        ];

        $path = $request->path();
        
        foreach ($userSpecificPatterns as $pattern) {
            if (str_contains($path, $pattern)) {
                return true;
            }
        }

        return false;
    }
}
