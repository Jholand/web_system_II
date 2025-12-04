<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

/**
 * @mixin User
 */
class AuthController extends Controller
{
    /**
     * Check if email is already registered - ULTRA OPTIMIZED with caching
     */
    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email']
        ]);

        // ULTRA FAST: Cache for 30 seconds + indexed lookup
        $email = strtolower(trim($request->email));
        $cacheKey = "email_check_{$email}";
        $exists = Cache::remember($cacheKey, 30, function() use ($email) {
            // Fast indexed lookup - uses users_email_unique index
            return User::where('email', $email)->exists();
        });

        // ULTRA FAST: Add cache headers for browser-side caching
        return response()->json([
            'exists' => $exists,
            'message' => $exists ? 'Email already taken' : 'Email available'
        ])->header('Cache-Control', 'public, max-age=30');
    }

    /**
     * Register a new user (role_id = 2 for regular users) - NO AUTO LOGIN
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other,prefer_not_to_say'],
            'street_address' => ['nullable', 'string', 'max:255'],
            'barangay' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'phone' => $validated['phone'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => 2, // Regular user role
            'status_id' => 1, // Active status
        ]);

        // OPTIMIZED: Create address asynchronously if needed (don't wait)
        if (!empty($validated['city']) || !empty($validated['street_address'])) {
            // Create address without blocking response
            \dispatch(function() use ($user, $validated) {
                $user->addresses()->create([
                    'address_type' => 'home',
                    'street_address' => $validated['street_address'] ?? null,
                    'barangay' => $validated['barangay'] ?? null,
                    'city' => $validated['city'] ?? null,
                    'province' => $validated['province'] ?? null,
                    'region' => $validated['region'] ?? null,
                    'postal_code' => $validated['postal_code'] ?? null,
                    'country' => 'Philippines',
                    'is_primary' => true,
                ]);
            })->afterResponse();
        }

        // DO NOT log the user in or create token
        // Just return success message

        return response()->json([
            'success' => true,
            'message' => 'Registration successful! Please log in.',
        ], 201);
    }

    /**
     * Login user or admin with rate limiting - ULTRA-FAST OPTIMIZED
     */
    public function login(Request $request)
    {
        // ULTRA-FAST: Minimal validation (no min:8 check on password - backend validates)
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // ULTRA-FAST: Rate limiting check first (in-memory)
        $key = 'login.' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            
            throw ValidationException::withMessages([
                'email' => ["Too many login attempts. Please try again in {$seconds} seconds."],
            ]);
        }

        // ULTRA-FAST: Single query with Auth::attempt - no separate exists check
        // Auth::attempt already queries the user and verifies password in ONE operation
        $credentials = $request->only('email', 'password');
        
        if (!Auth::attempt($credentials)) {
            RateLimiter::hit($key, 60);
            
            // Generic error message to prevent email enumeration
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        RateLimiter::clear($key);

        $user = Auth::user();

        // ULTRA-FAST: Status check (already in memory from Auth::attempt)
        if ($user->status_id !== 1) {
            Auth::logout();
            
            $statusMessage = match($user->status_id) {
                2 => 'Your account is inactive.',
                3 => 'Your account has been suspended.',
                4 => 'Your account has been banned.',
                default => 'Your account is not accessible.',
            };
            
            throw ValidationException::withMessages([
                'email' => [$statusMessage],
            ]);
        }

        // Regenerate session to prevent session fixation
        $request->session()->regenerate();

        // ULTRA-FAST: Create token first (single query)
        /** @var User $user */
        $token = $user->createToken('auth_token')->plainTextToken;

        // ULTRA-FAST: Async last login update (queued, non-blocking)
        // This runs after the response is sent, so doesn't slow down the API
        register_shutdown_function(function() use ($user, $request) {
            User::where('id', $user->id)->update([
                'last_login_at' => now(),
                'last_login_ip' => $request->ip(),
            ]);
        });

        // ULTRA-FAST: Return minimal essential user data
        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'role' => $user->role_id === 1 ? 'admin' : 'user',
                'status' => $this->getStatusName($user->status_id),
                'total_points' => $user->total_points ?? 0,
            ],
            'token' => $token,
            'redirect' => $user->role_id === 1 ? '/admin/dashboard' : '/user/map',
        ])->header('Cache-Control', 'no-cache, private');
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        // Delete all tokens for the user
        $request->user()->tokens()->delete();

        // Logout from session
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'role' => $user->role_id === 1 ? 'admin' : 'user',
                'status' => $this->getStatusName($user->status_id),
                'total_points' => $user->total_points ?? 0,
            ],
        ]);
    }

    /**
     * Check authentication status
     */
    public function check(Request $request)
    {
        if ($user = $request->user()) {
            return response()->json([
                'authenticated' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->first_name . ' ' . $user->last_name,
                    'email' => $user->email,
                    'role' => $user->role_id === 1 ? 'admin' : 'user',
                    'status' => $this->getStatusName($user->status_id),
                    'total_points' => $user->total_points ?? 0,
                ],
            ]);
        }

        return response()->json([
            'authenticated' => false,
        ]);
    }

    /**
     * Helper: Get status name
     */
    private function getStatusName($statusId)
    {
        return match($statusId) {
            1 => 'active',
            2 => 'inactive',
            3 => 'suspended',
            4 => 'banned',
            default => 'unknown',
        };
    }
}
