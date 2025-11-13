# TravelQuest Laravel Migrations & Seeders

## Overview
Complete Laravel migrations and seeders for the TravelQuest system have been created.

## Created Files

### Migrations (25 total)

#### Updated Existing:
1. `0001_01_01_000000_create_users_table.php` - Enhanced with TravelQuest user fields

#### Lookup/Reference Tables (6 migrations):
2. `2024_01_01_000001_create_user_roles_table.php`
3. `2024_01_01_000002_create_user_statuses_table.php`
4. `2024_01_01_000003_create_destination_categories_table.php`
5. `2024_01_01_000004_create_reward_categories_table.php`
6. `2024_01_01_000005_create_badge_categories_table.php`
7. `2024_01_01_000006_create_destination_statuses_table.php`

#### User Management (1 migration):
8. `2024_01_01_000007_create_user_addresses_table.php`

#### Destination Management (5 migrations):
9. `2024_01_01_000008_create_destinations_table.php` - Includes spatial POINT column
10. `2024_01_01_000009_create_destination_images_table.php`
11. `2024_01_01_000010_create_destination_amenities_table.php`
12. `2024_01_01_000011_create_destination_amenity_pivot_table.php`
13. `2024_01_01_000012_create_destination_operating_hours_table.php`

#### Check-in System (2 migrations):
14. `2024_01_01_000013_create_user_checkins_table.php`
15. `2024_01_01_000014_create_user_visit_stats_table.php`

#### Badges & Rewards (4 migrations):
16. `2024_01_01_000015_create_badges_table.php`
17. `2024_01_01_000016_create_user_badges_table.php`
18. `2024_01_01_000017_create_rewards_table.php`
19. `2024_01_01_000018_create_user_reward_redemptions_table.php`

#### Additional System Tables (7 migrations):
20. `2024_01_01_000019_create_user_point_transactions_table.php`
21. `2024_01_01_000020_create_destination_reviews_table.php`
22. `2024_01_01_000021_create_review_helpful_votes_table.php`
23. `2024_01_01_000022_create_notifications_table.php`
24. `2024_01_01_000023_create_user_saved_destinations_table.php`
25. `2024_01_01_000024_create_admin_activity_logs_table.php`
26. `2024_01_01_000025_create_system_settings_table.php`

### Seeders (7 total):
1. `UserRoleSeeder.php` - Seeds admin, user, moderator roles
2. `UserStatusSeeder.php` - Seeds active, inactive, suspended, banned statuses
3. `DestinationCategorySeeder.php` - Seeds 8 categories (hotels, farms, historical, etc.)
4. `RewardCategorySeeder.php` - Seeds 6 reward categories
5. `BadgeCategorySeeder.php` - Seeds 4 badge categories
6. `DestinationStatusSeeder.php` - Seeds destination statuses
7. `DestinationAmenitySeeder.php` - Seeds 12 common amenities

## Special Features

### Geolocation Support
The `destinations` table includes:
- `latitude` and `longitude` columns (DECIMAL)
- Spatial `location` POINT column added via raw SQL
- Spatial index for efficient radius queries
- Ready for `ST_Distance_Sphere()` queries

### Users Table Updates
Enhanced with:
- Role and status foreign keys
- First name, last name (separate fields)
- Username, phone, date of birth, gender
- Avatar URL
- Total points, user level
- Preferences (JSON)
- Two-factor authentication fields
- Last login tracking
- Soft deletes
- Full-text search on names

### Check-ins System
- One check-in per destination per day constraint
- GPS location tracking
- Distance from destination calculation
- QR code scanning support
- Points and bonus points tracking

## Running Migrations & Seeders

### Run All Migrations:
```bash
cd laravel-backend
php artisan migrate
```

### Run All Seeders:
```bash
php artisan db:seed
```

### Fresh Migration with Seeds:
```bash
php artisan migrate:fresh --seed
```

### Run Specific Seeder:
```bash
php artisan db:seed --class=UserRoleSeeder
```

## Database Configuration

Make sure your `.env` file has the correct database configuration:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=travelquest_db
DB_USERNAME=root
DB_PASSWORD=
```

## Migration Order
Migrations are named with timestamps to ensure proper execution order:
1. Lookup tables first (no dependencies)
2. Users table (references lookup tables)
3. Destination tables (references users & lookups)
4. Check-in and activity tables (references users & destinations)
5. Rewards, badges, reviews (references users & destinations)

## Foreign Key Relationships
All tables have proper foreign key constraints with:
- `CASCADE` on delete where appropriate
- `SET NULL` for optional relationships
- Indexes on foreign key columns for performance

## Notes
- All migrations use Laravel's Schema Builder
- Spatial columns use raw SQL (MySQL specific)
- Seeders populate lookup tables with initial data
- Soft deletes implemented where needed
- JSON columns for flexible data storage
- Full-text indexes for search functionality
- Composite indexes for common query patterns
