<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DestinationCategoryController;
use App\Http\Controllers\DestinationController;
use App\Http\Controllers\BadgeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\API\AddressController;

// Authentication Routes (Public) with rate limiting
Route::middleware(['throttle:60,1'])->group(function () {
    Route::post('/check-email', [AuthController::class, 'checkEmail']); // No CSRF needed
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected Authentication Routes
Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/auth/check', [AuthController::class, 'check']);
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

// Address & Postal Code API Routes
Route::prefix('address')->group(function () {
    Route::post('/postal-code', [AddressController::class, 'getPostalCode']);
    Route::post('/from-gps', [AddressController::class, 'getAddressFromGPS']);
    Route::get('/provinces', [AddressController::class, 'getProvinces']);
    Route::post('/cities', [AddressController::class, 'getCitiesByProvince']);
    Route::post('/format', [AddressController::class, 'formatAddress']);
});

// Destination Categories API Routes
Route::apiResource('categories', DestinationCategoryController::class)->parameters([
    'categories' => 'category'
]);

// Destinations API Routes
Route::apiResource('destinations', DestinationController::class)->parameters([
    'destinations' => 'destination'
]);

// Public Rewards API Routes (for browsing)
Route::get('rewards', [App\Http\Controllers\RewardController::class, 'index']);
Route::get('rewards/{reward}', [App\Http\Controllers\RewardController::class, 'show']);

// Destination Images API Routes
Route::post('destination-images', [App\Http\Controllers\DestinationImageController::class, 'store']);
Route::put('destination-images/{id}', [App\Http\Controllers\DestinationImageController::class, 'update']);
Route::delete('destination-images/{id}', [App\Http\Controllers\DestinationImageController::class, 'destroy']);

// Check-in API Routes (Protected - Authenticated Users)
Route::middleware(['auth:sanctum', 'active'])->group(function () {
    // Get current authenticated user
    Route::get('user', function (\Illuminate\Http\Request $request) {
        return response()->json($request->user());
    });

    Route::post('checkins', [App\Http\Controllers\UserCheckinController::class, 'store']);
    Route::get('checkins', [App\Http\Controllers\UserCheckinController::class, 'index']);
    Route::get('checkins/stats', [App\Http\Controllers\UserCheckinController::class, 'stats']);
    Route::get('points/history', [App\Http\Controllers\UserCheckinController::class, 'pointsHistory']);
    
    // User Profile & Password Routes
    Route::post('user/change-password', [UserController::class, 'changeOwnPassword']);
    
    // User Saved Destinations Routes
    Route::get('user/saved-destinations', [App\Http\Controllers\UserSavedDestinationController::class, 'index']);
    Route::post('user/saved-destinations/toggle', [App\Http\Controllers\UserSavedDestinationController::class, 'toggle']);
    Route::post('user/saved-destinations/check', [App\Http\Controllers\UserSavedDestinationController::class, 'checkSaved']);
    
    // User Badges Routes
    Route::get('user/badges', [App\Http\Controllers\UserBadgeController::class, 'index']);
    Route::post('user/badges/check', [App\Http\Controllers\UserBadgeController::class, 'checkBadges']);
    Route::get('user/badges/progress', [App\Http\Controllers\UserBadgeController::class, 'progress']);
    Route::post('user/badges/{badge}/favorite', [App\Http\Controllers\UserBadgeController::class, 'toggleFavorite']);
    Route::post('user/badges/{badge}/display', [App\Http\Controllers\UserBadgeController::class, 'toggleDisplay']);
    
    // User Reward Redemption Routes
    Route::get('user/rewards/redemptions', [App\Http\Controllers\UserRewardRedemptionController::class, 'index']);
    Route::post('user/rewards/{reward}/redeem', [App\Http\Controllers\UserRewardRedemptionController::class, 'redeem']);
    Route::post('user/rewards/redemptions/{redemption}/change', [App\Http\Controllers\UserRewardRedemptionController::class, 'change']);
    Route::post('user/rewards/available-at-location', [App\Http\Controllers\UserRewardRedemptionController::class, 'getAvailableAtLocation']);
});

// Admin API Routes (Protected - Admin Only + Active Status)
Route::middleware(['auth:sanctum', 'active', 'admin'])->group(function () {
    // Badges API Routes
    Route::apiResource('badges', BadgeController::class);
    Route::post('badges/{badge}/toggle-active', [BadgeController::class, 'toggleActive']);
    Route::post('badges/update-order', [BadgeController::class, 'updateOrder']);
    Route::get('badges/rarity/{rarity}', [BadgeController::class, 'byRarity']);

    // Rewards Admin API Routes (CRUD operations)
    Route::post('rewards', [App\Http\Controllers\RewardController::class, 'store']);
    Route::put('rewards/{reward}', [App\Http\Controllers\RewardController::class, 'update']);
    Route::delete('rewards/{reward}', [App\Http\Controllers\RewardController::class, 'destroy']);
    Route::post('rewards/{reward}/add-stock', [App\Http\Controllers\RewardController::class, 'addStock']);
    
    Route::get('reward-categories', function () {
        return response()->json(\App\Models\RewardCategory::all());
    });
});

// Owner Dashboard API Routes (Protected - Owner Only + Active Status)
Route::prefix('owner')->middleware(['auth:sanctum', 'active', 'owner'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\OwnerDashboardController::class, 'index']);
    Route::get('destinations', [App\Http\Controllers\OwnerDashboardController::class, 'destinations']);
    Route::get('redemptions', [App\Http\Controllers\OwnerDashboardController::class, 'redemptions']);
    Route::get('redemptions/code/{code}', [App\Http\Controllers\OwnerDashboardController::class, 'getRedemptionByCode']);
    Route::post('redemptions/claim/{code}', [App\Http\Controllers\OwnerDashboardController::class, 'claimRedemption']);
    
    // Owner Rewards Management
    Route::get('rewards', [App\Http\Controllers\OwnerDashboardController::class, 'getRewards']);
    Route::post('rewards', [App\Http\Controllers\OwnerDashboardController::class, 'storeReward']);
    Route::put('rewards/{id}', [App\Http\Controllers\OwnerDashboardController::class, 'updateReward']);
    Route::delete('rewards/{id}', [App\Http\Controllers\OwnerDashboardController::class, 'destroyReward']);
});

// Admin Users API Routes (Protected - Admin Only + Active Status)
Route::prefix('admin')->middleware(['auth:sanctum', 'active', 'admin'])->group(function () {
    // Dashboard API
    Route::get('dashboard', [App\Http\Controllers\AdminDashboardController::class, 'index']);
    
    // Users API
    Route::get('users', [UserController::class, 'index']);
    Route::post('users', [UserController::class, 'store']);
    Route::put('change-password', [UserController::class, 'changePassword']);
    Route::get('users/{user}', [UserController::class, 'show']);
    Route::put('users/{user}', [UserController::class, 'update']);
    Route::delete('users/{user}', [UserController::class, 'destroy']);
});

