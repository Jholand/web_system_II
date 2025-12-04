<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UserMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role_id !== 2) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. User access required.',
            ], 403);
        }

        return $next($request);
    }
}
