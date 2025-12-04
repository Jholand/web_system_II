<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of admin users.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role_id', 1); // Only admins (role_id = 1)

        // Apply search filter if provided
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($users)
        ]);
    }

    /**
     * Store a newly created admin user.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Hash the password
        $validated['password'] = Hash::make($validated['password']);
        
        // Set role_id to 1 for admin
        $validated['role_id'] = 1;
        
        // Set default status_id to 1 (active) if not provided
        if (!isset($validated['status_id'])) {
            $validated['status_id'] = 1;
        }

        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Admin created successfully',
            'data' => new UserResource($user)
        ], 201);
    }

    /**
     * Display the specified admin user.
     */
    public function show(string $id): JsonResponse
    {
        $user = User::where('id', $id)
                    ->where('role_id', 1)
                    ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new UserResource($user)
        ]);
    }

    /**
     * Update the specified admin user.
     */
    public function update(UpdateUserRequest $request, string $id): JsonResponse
    {
        $user = User::where('id', $id)
                    ->where('role_id', 1)
                    ->firstOrFail();

        $validated = $request->validated();

        // Hash password if provided
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Admin updated successfully',
            'data' => new UserResource($user)
        ]);
    }

    /**
     * Remove the specified admin user.
     */
    public function destroy(string $id): JsonResponse
    {
        $user = User::where('id', $id)
                    ->where('role_id', 1)
                    ->firstOrFail();

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Admin deleted successfully'
        ]);
    }

    /**
     * Change password for the authenticated admin.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }

    /**
     * Change password for the authenticated user (regular users).
     */
    public function changeOwnPassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8',
            'new_password_confirmation' => 'required|same:new_password',
        ]);

        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }
}
