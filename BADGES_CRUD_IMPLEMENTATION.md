# Badges CRUD Implementation

## Overview
Updated Badge system to use `destination_categories` instead of `badge_categories` and implemented full CRUD with proper Laravel best practices using Requests, Resources, and Model scopes.

## Changes Made

### 1. Migration Update
**File**: `database/migrations/2025_11_21_142527_create_badges_table.php`

- Changed `category_id` from `unsignedTinyInteger` to `unsignedInteger`
- Updated foreign key to reference `destination_categories.category_id` instead of `badge_categories.id`
- Updated comment from "FK to badge_categories" to "FK to destination_categories"

### 2. Badge Model Enhancement
**File**: `app/Models/Badge.php`

Added features:
- **Primary Key**: Explicitly defined `id` as primary key
- **Casts**: Added proper casting for integer fields
- **Relationships**:
  - `category()` - BelongsTo relationship with DestinationCategory
  - `userBadges()` - HasMany relationship
  - `users()` - BelongsToMany with pivot data
- **Query Scopes**:
  - `scopeSearch()` - Search by name, description, or slug
  - `scopeByRarity()` - Filter by rarity level
  - `scopeByRequirementType()` - Filter by requirement type
  - `scopeActive()` - Only active badges
  - `scopeVisible()` - Only non-hidden badges

### 3. Form Requests
Created two validation request classes following Laravel best practices:

#### StoreBadgeRequest
**File**: `app/Http/Requests/StoreBadgeRequest.php`

Features:
- Validates all badge fields with appropriate rules
- Auto-generates slug from name if not provided
- Sets default values (rarity, points_reward, display_order)
- Custom error messages
- Foreign key validation for `destination_categories`

Validation Rules:
- `category_id`: Optional, must exist in destination_categories
- `name`: Required, max 100 characters
- `slug`: Required, unique, max 100 characters
- `description`: Required text
- `icon`: Optional, max 100 characters
- `color`: Optional hex color validation (#RGB or #RRGGBB)
- `requirement_type`: Required, enum (visits|points|checkins|categories|custom)
- `requirement_value`: Required integer, min 1
- `requirement_details`: Optional array
- `points_reward`: Optional integer, min 0
- `rarity`: Optional enum (common|uncommon|rare|epic|legendary)
- `display_order`: Optional integer
- `is_active`: Optional boolean
- `is_hidden`: Optional boolean

#### UpdateBadgeRequest
**File**: `app/Http/Requests/UpdateBadgeRequest.php`

Same validation as Store but:
- Uses `sometimes` rule for partial updates
- Ignores current badge ID in slug uniqueness check
- Auto-generates slug only if name provided without slug

### 4. API Resource
**File**: `app/Http/Resources/BadgeResource.php`

Transforms Badge model to consistent API response format:

```json
{
  "id": 1,
  "category": {
    "id": 1,
    "name": "Nature Parks",
    "icon": "🌳"
  },
  "category_id": 1,
  "name": "Explorer",
  "slug": "explorer",
  "description": "Visit 10 destinations",
  "icon": "🗺️",
  "color": "#10B981",
  "requirement": {
    "type": "visits",
    "value": 10,
    "details": null
  },
  "points_reward": 100,
  "rarity": "common",
  "display_order": 1,
  "is_active": true,
  "is_hidden": false,
  "stats": {
    "total_earned": 25,
    "users_count": 25
  },
  "created_at": "2025-11-23T00:00:00.000Z",
  "updated_at": "2025-11-23T00:00:00.000Z"
}
```

Features:
- Nested category data (when loaded)
- Grouped requirement fields
- Statistics (when relationships loaded)
- ISO 8601 timestamps

### 5. Badge Controller
**File**: `app/Http/Controllers/BadgeController.php`

Implemented comprehensive CRUD operations:

#### `index()` - List Badges
**GET** `/api/badges`

Query Parameters:
- `search` - Search in name, description, slug
- `rarity` - Filter by rarity (common, uncommon, rare, epic, legendary)
- `requirement_type` - Filter by requirement type
- `is_active` - Filter by active status (true/false)
- `is_hidden` - Filter by hidden status (true/false)
- `category_id` - Filter by destination category
- `per_page` - Items per page (default 15, max 100)

Features:
- Pagination support
- Multiple filters can be combined
- Loads category relationship
- Ordered by display_order then name

#### `store()` - Create Badge
**POST** `/api/badges`

- Uses StoreBadgeRequest for validation
- Returns 201 status on success
- Loads category relationship in response

#### `show()` - Get Badge Details
**GET** `/api/badges/{id}`

- Loads category and userBadges relationships
- Returns full badge details with stats

#### `update()` - Update Badge
**PUT/PATCH** `/api/badges/{id}`

- Uses UpdateBadgeRequest for validation
- Supports partial updates
- Loads category relationship in response

#### `destroy()` - Delete Badge
**DELETE** `/api/badges/{id}`

- Prevents deletion if badge has been earned by users
- Returns 422 error with earned count if blocked
- Suggests deactivating instead

#### `toggleActive()` - Toggle Status
**POST** `/api/badges/{id}/toggle-active`

- Toggles is_active boolean
- Returns updated badge

#### `updateOrder()` - Bulk Update Order
**POST** `/api/badges/update-order`

Body:
```json
{
  "badges": [
    {"id": 1, "display_order": 1},
    {"id": 2, "display_order": 2}
  ]
}
```

#### `byRarity()` - Get by Rarity
**GET** `/api/badges/rarity/{rarity}`

Query Parameters:
- `active_only` - Only active badges (boolean)
- `visible_only` - Only non-hidden badges (boolean)
- `per_page` - Pagination

### 6. API Routes
**File**: `routes/api.php`

Added routes:
```php
// Standard CRUD
Route::apiResource('badges', BadgeController::class);

// Additional endpoints
Route::post('badges/{badge}/toggle-active', [BadgeController::class, 'toggleActive']);
Route::post('badges/update-order', [BadgeController::class, 'updateOrder']);
Route::get('badges/rarity/{rarity}', [BadgeController::class, 'byRarity']);
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/badges` | List all badges with filters |
| POST | `/api/badges` | Create new badge |
| GET | `/api/badges/{id}` | Get badge details |
| PUT/PATCH | `/api/badges/{id}` | Update badge |
| DELETE | `/api/badges/{id}` | Delete badge |
| POST | `/api/badges/{id}/toggle-active` | Toggle active status |
| POST | `/api/badges/update-order` | Bulk update order |
| GET | `/api/badges/rarity/{rarity}` | Get badges by rarity |

## Example Usage

### Create Badge
```bash
POST /api/badges
Content-Type: application/json

{
  "category_id": 1,
  "name": "Nature Explorer",
  "description": "Visit 5 nature parks",
  "icon": "🌳",
  "color": "#10B981",
  "requirement_type": "visits",
  "requirement_value": 5,
  "points_reward": 50,
  "rarity": "common"
}
```

### Filter Badges
```bash
GET /api/badges?rarity=rare&is_active=true&category_id=1
```

### Update Badge
```bash
PATCH /api/badges/1
Content-Type: application/json

{
  "points_reward": 100,
  "is_active": true
}
```

## Database Structure

The `badges` table now has:
- Foreign key to `destination_categories.category_id`
- Proper indexing on category_id, rarity, is_active, and requirement fields
- CASCADE on delete for category (set null)

## Benefits

1. **Validation**: Centralized validation logic in Request classes
2. **Consistency**: Standardized API responses through Resource
3. **Reusability**: Query scopes for common filters
4. **Safety**: Prevents deletion of earned badges
5. **Flexibility**: Multiple filtering options
6. **Performance**: Proper eager loading and indexing
7. **Maintainability**: Follows Laravel conventions

## Testing Recommendations

1. Test badge creation with valid/invalid data
2. Test filtering by different parameters
3. Test deletion prevention for earned badges
4. Test slug auto-generation
5. Test bulk order updates
6. Test toggle active functionality
7. Test rarity filtering
8. Test relationship loading (category, userBadges)

## Next Steps

1. Create Badge seeder with sample data
2. Implement frontend CRUD for badges
3. Add badge achievement system
4. Create badge notification system
5. Add badge display on user profiles
