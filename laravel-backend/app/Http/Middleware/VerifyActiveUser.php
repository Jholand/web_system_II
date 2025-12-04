<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyActiveUser
{
    /**
     * Handle an incoming request.
     * Verify user is authenticated and has active status
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Check if user account is active
        if ($user->status_id !== 1) {
            $statusMessage = match($user->status_id) {
                2 => 'Your account is inactive.',
                3 => 'Your account has been suspended.',
                4 => 'Your account has been banned.',
                default => 'Your account is not accessible.',
            };

            // Logout the user
            $user->tokens()->delete();

            return response()->json([
                'success' => false,
                'message' => $statusMessage,
            ], 403);
        }

        return $next($request);
    }
}
